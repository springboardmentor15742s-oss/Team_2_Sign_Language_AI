"""Reproducible Model Training & Evaluation Script with Mirror Data Augmentation.
Usage:
    python scripts/train_sign_model.py --max-samples 50
"""
import sys
import argparse
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.evaluation.pipeline import run_full_evaluation
from app.ml.dataset.config import DEFAULT_REPORT_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("train_sign_model")


def run_training_pipeline(max_samples_per_class: int = 50):
    logger.info("=== Starting Sign Language Recognition Model Training Pipeline ===")

    result = run_full_evaluation(max_samples_per_class=max_samples_per_class, retrain=True, compare_models=False)
    report = result["report"]

    logger.info(
        f"Model trained successfully. Test Accuracy: {report['accuracy']:.4f}, "
        f"Macro F1: {report['f1_macro']:.4f}"
    )
    logger.info(f"Evaluation report saved to: {DEFAULT_REPORT_PATH}")
    logger.info("=== Model Training & Evaluation Pipeline Completed Successfully ===")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SignSpeak Sign Language Classifier Model")
    parser.add_argument("--max-samples", type=int, default=50, help="Max images per class for feature extraction")
    args = parser.parse_args()

    run_training_pipeline(max_samples_per_class=args.max_samples)
