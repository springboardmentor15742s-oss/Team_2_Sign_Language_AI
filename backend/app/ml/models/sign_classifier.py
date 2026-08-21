import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier

from app.ml.models.base import SignAssessmentModel, SignPredictionResult
from app.ml.dataset.config import ASL_CLASSES, CLASS_TO_IDX, IDX_TO_CLASS, DEFAULT_MODEL_PATH

logger = logging.getLogger(__name__)


class RandomForestSignClassifier(SignAssessmentModel):
    """
    Random Forest Classifier for Sign Language recognition.
    Consumes numerical feature vectors extracted from normalized landmarks.
    """

    def __init__(self, model_path: Optional[Union[str, Path]] = None, n_estimators: int = 100):
        self.model_path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
        self.classes = ASL_CLASSES
        self.class_to_idx = CLASS_TO_IDX
        self.idx_to_class = IDX_TO_CLASS
        self.model_version = "v1.0.0-rf"

        self._clf: Optional[RandomForestClassifier] = None
        self._is_trained = False

        # Attempt to load model binary on instantiation if it exists
        if self.model_path.exists():
            self.load_model(self.model_path)

    @property
    def is_trained(self) -> bool:
        return self._is_trained and self._clf is not None

    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Trains the Random Forest model on feature matrix X and label vector y.
        """
        if len(X) == 0 or len(y) == 0:
            raise ValueError("Training dataset cannot be empty.")

        logger.info(f"Training Random Forest on {len(X)} samples with {X.shape[1]} features...")
        self._clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            # n_jobs=1 (default) intentionally: n_jobs=-1's multiprocessing
            # (loky) worker pool can hang at interpreter/session teardown in
            # sandboxed/restricted process environments. Single-threaded fit
            # is still fast at this dataset size (hundreds-low thousands of
            # samples), so the safety margin isn't worth the risk.
        )
        self._clf.fit(X, y)
        self._is_trained = True

        train_score = float(self._clf.score(X, y))
        logger.info(f"Training accuracy: {train_score:.4f}")

        return {
            "n_samples": len(X),
            "n_features": X.shape[1],
            "train_accuracy": train_score,
            "n_classes": len(np.unique(y)),
        }

    def predict(self, features: np.ndarray, top_k: int = 3) -> SignPredictionResult:
        """
        Predicts the sign class from a 1D or 2D feature array.
        """
        if not self.is_trained:
            return SignPredictionResult(
                predicted_sign="unknown",
                confidence=0.0,
                top_predictions=[],
                model_version=self.model_version,
                is_trained=False,
                error_message="Model is not trained. Please run training script first.",
            )

        X_input = np.array(features, dtype=np.float32)
        if X_input.ndim == 1:
            X_input = X_input.reshape(1, -1)

        try:
            probas = self._clf.predict_proba(X_input)[0]
            top_indices = np.argsort(probas)[::-1][:top_k]

            predicted_idx = top_indices[0]
            raw_pred_cls = self._clf.classes_[predicted_idx]
            if isinstance(raw_pred_cls, (int, np.integer)):
                predicted_class_name = self.idx_to_class.get(int(raw_pred_cls), str(raw_pred_cls))
            else:
                predicted_class_name = str(raw_pred_cls)

            confidence = float(probas[predicted_idx])

            top_predictions = []
            for idx in top_indices:
                raw_cls = self._clf.classes_[idx]
                if isinstance(raw_cls, (int, np.integer)):
                    cls_name = self.idx_to_class.get(int(raw_cls), str(raw_cls))
                else:
                    cls_name = str(raw_cls)
                top_predictions.append({
                    "label": cls_name,
                    "confidence": round(float(probas[idx]), 4),
                })

            return SignPredictionResult(
                predicted_sign=predicted_class_name,
                confidence=round(confidence, 4),
                top_predictions=top_predictions,
                model_version=self.model_version,
                is_trained=True,
            )
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return SignPredictionResult(
                predicted_sign="unknown",
                confidence=0.0,
                is_trained=True,
                error_message=f"Inference failure: {str(e)}",
            )

    def save_model(self, path: Optional[Union[str, Path]] = None) -> bool:
        """
        Serializes trained model state to joblib binary file.
        """
        save_path = Path(path) if path else self.model_path
        if not self.is_trained:
            logger.error("Cannot save untrained model.")
            return False

        try:
            save_path.parent.mkdir(parents=True, exist_ok=True)
            model_data = {
                "clf": self._clf,
                "classes": self.classes,
                "class_to_idx": self.class_to_idx,
                "idx_to_class": self.idx_to_class,
                "model_version": self.model_version,
            }
            joblib.dump(model_data, save_path)
            logger.info(f"Model saved successfully to {save_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            return False

    def load_model(self, path: Optional[Union[str, Path]] = None) -> bool:
        """
        Deserializes model binary from joblib file.
        """
        load_path = Path(path) if path else self.model_path
        if not load_path.exists():
            logger.warning(f"Model file {load_path} not found.")
            self._is_trained = False
            return False

        try:
            model_data = joblib.load(load_path)
            if isinstance(model_data, dict) and "clf" in model_data:
                self._clf = model_data["clf"]
                self.classes = model_data.get("classes", self.classes)
                self.class_to_idx = model_data.get("class_to_idx", self.class_to_idx)
                self.idx_to_class = model_data.get("idx_to_class", self.idx_to_class)
                self.model_version = model_data.get("model_version", self.model_version)
            else:
                self._clf = model_data

            self._is_trained = True
            logger.info(f"Model loaded successfully from {load_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model from {load_path}: {e}")
            self._is_trained = False
            return False
