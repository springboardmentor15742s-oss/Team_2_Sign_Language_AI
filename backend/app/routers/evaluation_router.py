import json
import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_staff
from app.database.database import get_db
from app.models.user import User
from app.ml.evaluation.reports import ReportManager
from app.ml.evaluation.pipeline import run_full_evaluation, COMPARISON_REPORT_PATH
from app.ml.models.sign_classifier import RandomForestSignClassifier
from app.ml.dataset.config import DEFAULT_MODEL_PATH, DEFAULT_REPORT_PATH
from app.services.audit_service import log_admin_action

logger = logging.getLogger(__name__)
router = APIRouter(prefix="", tags=["Model Evaluation ML"])

# Model evaluation / dataset administration is staff-only (instructor,
# accessibility_trainer, admin) per the RBAC access matrix -- learners must
# not be able to trigger or read raw model-evaluation internals.


def _empty_report(classifier: RandomForestSignClassifier) -> Dict[str, Any]:
    return {
        "dataset_name": "ASL Alphabet Test Set",
        "model_name": "RandomForestSignClassifier",
        "model_version": classifier.model_version,
        "live_model_version": classifier.model_version,
        "live_model_matches_evaluated": True,
        "is_trained": classifier.is_trained,
        "total_samples": 0,
        "test_samples": 0,
        "correct_predictions": 0,
        "incorrect_predictions": 0,
        "accuracy": 0.0,
        "precision_macro": 0.0,
        "precision_weighted": 0.0,
        "recall_macro": 0.0,
        "recall_weighted": 0.0,
        "f1_macro": 0.0,
        "f1_weighted": 0.0,
        "per_class_metrics": {},
        "confusion_matrix": [],
        "feature_count": 0,
        "train_samples": 0,
        "val_samples": 0,
        "evaluated_at": None,
        "message": "No evaluation report found. Please click \"Run Evaluation\" to compute live test metrics.",
    }


@router.get("/evaluation/model", response_model=Dict[str, Any])
@router.get("/admin/model-evaluation", response_model=Dict[str, Any])
def get_model_evaluation_metrics(current_user: User = Depends(require_staff)):
    """
    Get latest authoritative model evaluation metrics report.
    """
    classifier = RandomForestSignClassifier(model_path=DEFAULT_MODEL_PATH)
    report_dict = ReportManager.load_report(DEFAULT_REPORT_PATH)

    if not report_dict:
        return _empty_report(classifier)

    # Inject live model version comparison
    report_dict["live_model_version"] = classifier.model_version
    report_dict["is_trained"] = classifier.is_trained
    eval_ver = report_dict.get("model_version", "")
    report_dict["live_model_matches_evaluated"] = (eval_ver == classifier.model_version)

    return report_dict


@router.post("/evaluation/run", response_model=Dict[str, Any])
@router.post("/admin/model-evaluation/run", response_model=Dict[str, Any])
def trigger_offline_evaluation(
    max_samples: int = 40,
    retrain: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """
    Actually triggers a fresh evaluation run: re-extracts landmarks/features
    from the real dataset, rebuilds the canonical split, evaluates the
    deployed model, and persists the updated report. Not a cache reload.
    """
    if max_samples < 5 or max_samples > 200:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "max_samples must be between 5 and 200.")

    try:
        result = run_full_evaluation(max_samples_per_class=max_samples, retrain=retrain, compare_models=True)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))
    except Exception as e:
        logger.exception("Evaluation run failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Evaluation run failed: {e}")

    report_dict = result["report"]
    classifier = RandomForestSignClassifier(model_path=DEFAULT_MODEL_PATH)
    report_dict["live_model_version"] = classifier.model_version
    report_dict["live_model_matches_evaluated"] = (report_dict.get("model_version") == classifier.model_version)

    log_admin_action(
        db, current_user.id, "MODEL_EVALUATION_RUN", target_type="model", target_id=None,
        meta=f"accuracy={report_dict.get('accuracy')} test_samples={report_dict.get('test_samples')} retrain={retrain}",
    )
    db.commit()

    return {
        "status": "success",
        "message": "Model evaluation completed against the live dataset.",
        "report": report_dict,
        "comparison": result["comparison"],
    }


@router.get("/evaluation/models/compare", response_model=Dict[str, Any])
def get_model_comparison(current_user: User = Depends(require_staff)):
    """
    Returns the most recent real model comparison (RandomForest vs.
    LogisticRegression/SVM/KNN on the identical train/test feature split),
    generated as a side effect of the last "Run Evaluation".
    """
    if not COMPARISON_REPORT_PATH.exists():
        return {
            "models": [],
            "message": "No model comparison available yet. Run an evaluation to generate one.",
        }
    try:
        with open(COMPARISON_REPORT_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load model comparison report: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to load model comparison report.")
