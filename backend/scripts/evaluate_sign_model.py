"""Authoritative Offline Evaluation & Verification Script for Sign Assessment Model.
Usage:
    python scripts/evaluate_sign_model.py
"""
import sys
import logging
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.evaluation.pipeline import run_full_evaluation
from app.ml.dataset.config import ASL_CLASSES, DEFAULT_MODEL_PATH, DEFAULT_REPORT_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("evaluate_sign_model")


def run_standalone_evaluation(max_samples_per_class: int = 40, compare_models: bool = True):
    logger.info("=== Starting Standalone Authoritative Evaluation Audit ===")

    result = run_full_evaluation(max_samples_per_class=max_samples_per_class, retrain=False, compare_models=compare_models)
    report = result["report"]
    comparison = result["comparison"]

    correct = report["correct_predictions"]
    total = report["test_samples"]
    calculated_acc = (correct / total * 100) if total > 0 else 0.0

    print("\n" + "=" * 70)
    print("=== AUTHORITATIVE MODEL EVALUATION SUMMARY ===")
    print("=" * 70)
    print(f"Model Evaluated      : {report['model_name']} ({report['model_version']})")
    print(f"Model File Path      : {DEFAULT_MODEL_PATH}")
    print(f"Total Test Samples   : {total} (100% Unseen)")
    print(f"Correct Predictions  : {correct}")
    print(f"Incorrect Predictions: {report['incorrect_predictions']}")
    print(f"Explicit Accuracy    : {correct} / {total} x 100 = {calculated_acc:.2f}%")
    print(f"Macro Precision      : {report['precision_macro'] * 100:.2f}%")
    print(f"Macro Recall         : {report['recall_macro'] * 100:.2f}%")
    print(f"Macro F1-Score       : {report['f1_macro'] * 100:.2f}%")
    print(f"Weighted F1-Score    : {report['f1_weighted'] * 100:.2f}%")
    print("=" * 70)

    print(f"\n=== PER-CLASS PERFORMANCE METRICS ({len(ASL_CLASSES)} CLASSES) ===")
    print(f"{'Class':<10} | {'Samples':<8} | {'Correct':<8} | {'Incorrect':<9} | {'Precision':<10} | {'Recall':<8} | {'F1-Score':<8}")
    print("-" * 75)
    for cls_name in ASL_CLASSES:
        m = report["per_class_metrics"].get(cls_name, {})
        print(f"{cls_name:<10} | {m.get('sample_count', 0):<8} | {m.get('correct_count', 0):<8} | {m.get('incorrect_count', 0):<9} | {m.get('precision', 0)*100:>9.1f}% | {m.get('recall', 0)*100:>7.1f}% | {m.get('f1_score', 0)*100:>7.1f}%")

    if comparison:
        print("\n=== MODEL COMPARISON (same train/test split) ===")
        print(f"{'Model':<28} | {'Accuracy':<9} | {'Precision':<10} | {'Recall':<8} | {'F1':<8} | {'Status':<10}")
        print("-" * 80)
        for m in comparison["models"]:
            if m.get("status") == "failed":
                print(f"{m['model_name']:<28} | FAILED: {m.get('error')}")
                continue
            print(f"{m['model_name']:<28} | {m['accuracy']*100:>7.2f}% | {m['precision_macro']*100:>8.2f}% | {m['recall_macro']*100:>6.2f}% | {m['f1_macro']*100:>6.2f}% | {m['status']}")

    print("\nEvaluation report successfully saved to:", DEFAULT_REPORT_PATH)


if __name__ == "__main__":
    run_standalone_evaluation()
