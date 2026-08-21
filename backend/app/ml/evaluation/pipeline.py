"""
Authoritative, reusable evaluation pipeline.

This is the single implementation of "extract features from the dataset,
rebuild the canonical train/val/test split, evaluate the deployed model"
used by:
  - scripts/train_sign_model.py (training)
  - scripts/evaluate_sign_model.py (CLI re-validation)
  - POST /evaluation/run (admin "Run Evaluation" button)

so that the admin button performs a real evaluation against the real
dataset rather than re-serving a cached report.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from app.ml.dataset.config import ASL_CLASSES, DEFAULT_MODEL_PATH, DEFAULT_REPORT_PATH, RANDOM_SEED, REPORTS_DIR
from app.ml.dataset.loader import DatasetLoader
from app.ml.evaluation.evaluator import EvaluationReport, ModelEvaluator
from app.ml.evaluation.metrics import EvaluationMetricsCalculator
from app.ml.evaluation.reports import ReportManager
from app.ml.features.extractor import FeatureExtractor
from app.ml.landmarks.extractor import MediaPipeLandmarkExtractor
from app.ml.models.sign_classifier import RandomForestSignClassifier

logger = logging.getLogger(__name__)

COMPARISON_REPORT_PATH = REPORTS_DIR / "model_comparison.json"


def extract_feature_dataset(max_samples_per_class: int = 40, augment: bool = True) -> Tuple[np.ndarray, np.ndarray]:
    """Scans the training dataset, runs the real MediaPipe -> normalize -> feature pipeline on every image."""
    loader = DatasetLoader()
    image_paths, labels, _ = loader.get_image_paths_and_labels(max_samples_per_class=max_samples_per_class)

    landmark_extractor = MediaPipeLandmarkExtractor()
    feature_extractor = FeatureExtractor()

    X_features: List[np.ndarray] = []
    y_labels: List[str] = []

    for idx, (img_path, cls_name) in enumerate(zip(image_paths, labels)):
        if idx % 200 == 0 and idx > 0:
            logger.info(f"Feature extraction progress: {idx}/{len(image_paths)}")

        img_np = loader.load_image(img_path)
        if img_np is None:
            continue

        lm_res = landmark_extractor.extract_landmarks(img_np)
        if lm_res.hand_detected and len(lm_res.landmarks) > 0:
            X_features.append(feature_extractor.extract_features(lm_res.landmarks))
            y_labels.append(cls_name)

        if augment:
            flipped = cv2.flip(img_np, 1)
            lm_res_flip = landmark_extractor.extract_landmarks(flipped)
            if lm_res_flip.hand_detected and len(lm_res_flip.landmarks) > 0:
                X_features.append(feature_extractor.extract_features(lm_res_flip.landmarks))
                y_labels.append(cls_name)

    X = np.array(X_features, dtype=np.float32)
    y = np.array(y_labels)
    return X, y


def split_dataset(X: np.ndarray, y: np.ndarray):
    """Reproducible 70/15/15 Train/Val/Test split, seeded, matching the training pipeline exactly."""
    stratify_temp = y if len(set(y)) > 1 else None
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=RANDOM_SEED, stratify=stratify_temp
    )
    stratify_test = y_temp if len(set(y_temp)) > 1 else None
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=RANDOM_SEED, stratify=stratify_test
    )
    return X_train, X_val, X_test, y_train, y_val, y_test


def run_model_comparison(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    rf_report: Optional[EvaluationReport] = None,
) -> Dict[str, Any]:
    """
    Fits lightweight sklearn classifiers on the exact same feature split as
    the deployed RandomForest and evaluates them with the same metrics
    calculator, so the comparison table is real and reproducible -- never
    fabricated. Model choice is intentionally limited to fast classical
    classifiers appropriate for an 82-dim tabular feature vector.
    """
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results: List[Dict[str, Any]] = []
    if rf_report is not None:
        results.append({
            "model_name": "RandomForestSignClassifier",
            "accuracy": rf_report.accuracy,
            "precision_macro": rf_report.precision_macro,
            "recall_macro": rf_report.recall_macro,
            "f1_macro": rf_report.f1_macro,
            "status": "current",
        })

    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=3000, random_state=RANDOM_SEED),
        "SVM (RBF kernel)": SVC(kernel="rbf", probability=False, random_state=RANDOM_SEED),
        "KNN (k=5)": KNeighborsClassifier(n_neighbors=5),
    }

    for name, clf in candidates.items():
        try:
            clf.fit(X_train_scaled, y_train)
            y_pred = clf.predict(X_test_scaled)
            metrics = EvaluationMetricsCalculator.compute_all_metrics(
                y_true=y_test, y_pred=y_pred, classes=ASL_CLASSES
            )
            results.append({
                "model_name": name,
                "accuracy": metrics["accuracy"],
                "precision_macro": metrics["precision_macro"],
                "recall_macro": metrics["recall_macro"],
                "f1_macro": metrics["f1_macro"],
                "status": "candidate",
            })
        except Exception as e:
            logger.error(f"Comparison model '{name}' failed: {e}")
            results.append({"model_name": name, "status": "failed", "error": str(e)})

    comparison = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "test_samples": int(len(y_test)),
        "feature_count": int(X_train.shape[1]) if len(X_train) else 0,
        "models": results,
    }

    try:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        with open(COMPARISON_REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(comparison, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save model comparison report: {e}")

    return comparison


def run_full_evaluation(
    max_samples_per_class: int = 40,
    retrain: bool = False,
    compare_models: bool = True,
) -> Dict[str, Any]:
    """
    Authoritative evaluation entrypoint. Re-extracts features from the
    dataset, rebuilds the canonical split, evaluates the deployed
    RandomForest model, and optionally runs the model comparison on the
    same split. Every metric returned is freshly computed in this call.
    """
    logger.info(f"Starting full evaluation run (max_samples_per_class={max_samples_per_class}, retrain={retrain})")
    X, y = extract_feature_dataset(max_samples_per_class=max_samples_per_class)
    if len(X) < 10:
        raise ValueError(f"Not enough valid feature samples extracted from the dataset ({len(X)}). Check dataset paths.")

    X_train, X_val, X_test, y_train, y_val, y_test = split_dataset(X, y)

    classifier = RandomForestSignClassifier(model_path=DEFAULT_MODEL_PATH)
    if retrain or not classifier.is_trained:
        classifier.train(X_train, y_train)
        classifier.save_model(DEFAULT_MODEL_PATH)

    evaluator = ModelEvaluator(classifier)
    report = evaluator.evaluate(X_test, y_test)
    report.feature_count = int(X.shape[1])
    report.train_samples = int(len(X_train))
    report.val_samples = int(len(X_val))
    report.evaluated_at = datetime.now(timezone.utc).isoformat()

    ReportManager.save_report(report, DEFAULT_REPORT_PATH)
    logger.info(
        f"Evaluation complete: accuracy={report.accuracy:.4f} "
        f"({report.correct_predictions}/{report.test_samples})"
    )

    comparison = None
    if compare_models:
        comparison = run_model_comparison(X_train, y_train, X_test, y_test, rf_report=report)

    return {"report": report.to_dict(), "comparison": comparison}
