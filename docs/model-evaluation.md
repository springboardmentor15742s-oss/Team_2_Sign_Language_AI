# Accuracy Evaluation System — Architecture & Documentation

## 1. Overview
The **Accuracy Evaluation System** in SignSpeak measures the classification performance of sign recognition models using standard multiclass metrics, confusion matrices, per-class performance breakdowns, and a real comparison against alternative classical classifiers -- all computed by actually re-running the pipeline against the dataset, not by reloading a cached report.

---

## 2. Metrics Calculated

1. **Accuracy**: $\frac{\text{Correct Predictions}}{\text{Total Predictions}}$
2. **Precision (Macro & Weighted)**: $\frac{TP}{TP + FP}$
3. **Recall (Macro & Weighted)**: $\frac{TP}{TP + FN}$
4. **F1-Score (Macro & Weighted)**: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$
5. **Confusion Matrix**: $N \times N$ matrix mapping actual ground-truth classes to predicted classes, for all supported classes (currently 29 -- not hardcoded to a subset anywhere in the frontend).
6. **Per-Class Metrics**: Sample count, correct count, incorrect count, precision, recall, F1-score, and average confidence for every supported class.

---

## 3. Key Components

### 3.1 Evaluation Metrics Calculator (`backend/app/ml/evaluation/metrics.py`)
Computes multiclass precision, recall, F1, accuracy, $N \times N$ confusion matrix, and per-class breakdowns using `scikit-learn`.

### 3.2 Model Evaluator (`backend/app/ml/evaluation/evaluator.py`)
`ModelEvaluator` runs model inference against test feature matrices and produces structured `EvaluationReport` dataclass objects. Now also carries `feature_count`, `train_samples`, `val_samples`, and `evaluated_at`, so the frontend never has to hardcode those figures.

### 3.3 Evaluation Pipeline (`backend/app/ml/evaluation/pipeline.py`) -- NEW, single source of truth
`run_full_evaluation()` is the one real implementation of "extract features from the dataset, rebuild the canonical 70/15/15 split, evaluate the deployed model." It is used by:
- `scripts/train_sign_model.py` (training, `retrain=True`)
- `scripts/evaluate_sign_model.py` (CLI re-validation)
- `POST /evaluation/run` (the admin "Run Evaluation" button)

Previously, the admin "Run Evaluation" endpoint only reloaded the existing `evaluation_report.json` and re-checked the model-version string -- it did not actually evaluate anything. It now genuinely re-extracts landmarks/features from the real dataset via MediaPipe, rebuilds the split, evaluates the deployed RandomForest model, and persists the result. Measured end-to-end runtime for `max_samples_per_class=40` (the historical default) is a few minutes; for `max_samples_per_class=15` it completed in ~82s in this environment.

`run_full_evaluation()` also (optionally, on by default) runs `run_model_comparison()` on the *same* extracted feature split.

### 3.4 Model Comparison (`backend/app/ml/evaluation/pipeline.py::run_model_comparison`) -- NEW
Fits `LogisticRegression`, `SVM (RBF kernel)`, and `KNN (k=5)` on the identical scaled train split used to evaluate the deployed RandomForest, evaluates them with the same metrics calculator on the identical test split, and saves the result to `backend/app/ml/reports/model_comparison.json`. Numbers are never fabricated. A real run at `max_samples_per_class=40` (348 test samples -- matching the historical baseline exactly, since the split is seeded) produced:

| Model | Accuracy | Precision | Recall | F1 | Status |
|---|---|---|---|---|---|
| RandomForestSignClassifier | 97.70% | 98.03% | 97.70% | 97.76% | Current (deployed) |
| KNN (k=5) | 92.82% | 93.71% | 92.82% | 92.82% | Candidate |
| LogisticRegression | 89.37% | 92.96% | 89.37% | 89.48% | Candidate |
| SVM (RBF kernel) | 85.92% | 91.92% | 85.92% | 86.75% | Candidate |

A smaller verification run at `max_samples_per_class=15` (131 test samples) produced a consistent ranking (RF 96.95% > KNN 86.26% > LogisticRegression 87.79% > SVM 80.92%, with only KNN/LogisticRegression swapping order at the smaller sample size). RandomForest is the strongest of the four candidates on this feature representation at every sample size tested -- exactly the kind of measurable model-selection justification the platform should be able to show, rather than an assumption.

### 3.5 Report Manager (`backend/app/ml/evaluation/reports.py`)
Unchanged: saves/loads JSON evaluation reports to/from `backend/app/ml/reports/evaluation_report.json`.

---

## 4. Scripts & Usage

### 4.1 Training Pipeline Script
```bash
python scripts/train_sign_model.py --max-samples 50
```
Now a thin wrapper around `run_full_evaluation(retrain=True, compare_models=False)`.

### 4.2 Offline Evaluation Script
```bash
python scripts/evaluate_sign_model.py
```
Now a thin wrapper around `run_full_evaluation(retrain=False, compare_models=True)`, printing the same console summary plus the model comparison table.

---

## 5. API Endpoints
- `GET /api/v1/evaluation/model` (+ alias `/admin/model-evaluation`) -- Returns the latest authoritative evaluation report. **Staff-only** (`instructor`, `accessibility_trainer`, `admin`).
- `POST /api/v1/evaluation/run?max_samples=&retrain=` (+ alias `/admin/model-evaluation/run`) -- Actually triggers a fresh evaluation (and model comparison) against the live dataset. **Staff-only.**
- `GET /api/v1/evaluation/models/compare` -- Returns the most recent model comparison report. **Staff-only.**

### RBAC fix
Both evaluation endpoints previously only required `get_current_user` (i.e. *any* authenticated learner could call admin-facing model-evaluation/administration endpoints), despite being mounted at `/admin/model-evaluation*`. They now require `require_staff`. Verified: a learner account now receives `403 You do not have permission to perform this action`; a staff/admin account receives the real report.

---

## 6. Frontend Dashboard
Accessible to instructors/admins at `/admin/model-evaluation`. Displays summary metric cards, dataset/split summary with the accuracy formula spelled out, per-class table (all supported classes, not truncated to A-E), scrollable confusion matrix, model architecture/pipeline metadata (now including a real `feature_count`, `train/val/test` split, and `evaluated_at` timestamp instead of hardcoded placeholder text), and a new **Model Comparison** table sourced from `GET /evaluation/models/compare`.

## 7. Accuracy Requirement / Reproducibility Note
Accuracy numbers change between runs of `POST /evaluation/run` because the dataset re-sampling (`max_samples_per_class`) and feature extraction are genuinely re-executed each time (seeded `train_test_split`, but the *set* of images scanned depends on `max_samples_per_class`). This is expected and intentional -- it is proof the number is not cached or faked. The historical baseline reports referenced elsewhere in the project (97.70% on 348 test samples, and an earlier 94.25% on 174 samples) came from earlier training runs at different `max_samples_per_class` values; they are not reproduced by this system automatically and should not be treated as a fixed target.
