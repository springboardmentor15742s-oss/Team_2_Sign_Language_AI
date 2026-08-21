from typing import List, Dict, Any, Optional, Union
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

from app.ml.dataset.config import ASL_CLASSES, CLASS_TO_IDX, IDX_TO_CLASS


class EvaluationMetricsCalculator:
    """
    Computes multiclass accuracy, macro/weighted precision, recall, F1-score,
    confusion matrix, and per-class performance breakdowns.
    """

    @staticmethod
    def compute_all_metrics(
        y_true: Union[List[int], List[str], np.ndarray],
        y_pred: Union[List[int], List[str], np.ndarray],
        confidences: Optional[List[float]] = None,
        classes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        classes = classes or ASL_CLASSES
        class_to_idx = {cls: i for i, cls in enumerate(classes)}
        idx_to_class = {i: cls for i, cls in enumerate(classes)}

        # Convert string labels to integer indices if necessary
        y_true_indices = []
        for val in y_true:
            if isinstance(val, str):
                y_true_indices.append(class_to_idx.get(val, 0))
            else:
                y_true_indices.append(int(val))

        y_pred_indices = []
        for val in y_pred:
            if isinstance(val, str):
                y_pred_indices.append(class_to_idx.get(val, 0))
            else:
                y_pred_indices.append(int(val))

        y_true_arr = np.array(y_true_indices, dtype=np.int32)
        y_pred_arr = np.array(y_pred_indices, dtype=np.int32)
        conf_arr = np.array(confidences, dtype=np.float32) if confidences is not None else np.ones(len(y_true_arr))

        if len(y_true_arr) == 0:
            return {
                "total_samples": 0,
                "accuracy": 0.0,
                "precision_macro": 0.0,
                "precision_weighted": 0.0,
                "recall_macro": 0.0,
                "recall_weighted": 0.0,
                "f1_macro": 0.0,
                "f1_weighted": 0.0,
                "per_class_metrics": {},
                "confusion_matrix": [],
                "labels": classes,
            }

        # 1. Overall Metrics
        acc = float(accuracy_score(y_true_arr, y_pred_arr))
        prec_macro = float(precision_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
        prec_weighted = float(precision_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0))
        rec_macro = float(recall_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
        rec_weighted = float(recall_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0))
        f1_mac = float(f1_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
        f1_wei = float(f1_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0))

        # 2. Confusion Matrix (N x N)
        unique_labels = list(range(len(classes)))
        cm = confusion_matrix(y_true_arr, y_pred_arr, labels=unique_labels)

        # 3. Per-Class Performance
        per_class_prec = precision_score(y_true_arr, y_pred_arr, labels=unique_labels, average=None, zero_division=0)
        per_class_rec = recall_score(y_true_arr, y_pred_arr, labels=unique_labels, average=None, zero_division=0)
        per_class_f1 = f1_score(y_true_arr, y_pred_arr, labels=unique_labels, average=None, zero_division=0)

        per_class_metrics = {}
        for idx, cls_name in enumerate(classes):
            mask_true = (y_true_arr == idx)
            sample_count = int(np.sum(mask_true))

            if sample_count > 0:
                correct_count = int(np.sum((y_true_arr == idx) & (y_pred_arr == idx)))
                incorrect_count = sample_count - correct_count
                avg_conf = float(np.mean(conf_arr[mask_true]))
                cls_acc = float(correct_count / sample_count)
            else:
                correct_count = 0
                incorrect_count = 0
                avg_conf = 0.0
                cls_acc = 0.0

            per_class_metrics[cls_name] = {
                "sample_count": sample_count,
                "correct_count": correct_count,
                "incorrect_count": incorrect_count,
                "accuracy": round(cls_acc, 4),
                "precision": round(float(per_class_prec[idx]), 4),
                "recall": round(float(per_class_rec[idx]), 4),
                "f1_score": round(float(per_class_f1[idx]), 4),
                "avg_confidence": round(avg_conf, 4),
            }

        return {
            "total_samples": len(y_true_arr),
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_macro": round(rec_macro, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_macro": round(f1_mac, 4),
            "f1_weighted": round(f1_wei, 4),
            "per_class_metrics": per_class_metrics,
            "confusion_matrix": cm.tolist(),
            "labels": classes,
        }
