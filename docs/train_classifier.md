# SignSpeak — Offline Model Training & Serialization (`train_classifier.py`)
**Infosys Springboard Internship 7.0 — Team 2**  
**Module:** Supervised Machine Learning Pipeline (Milestone 2, Module 4)  
**File:** `backend/train_classifier.py`

---

## 1. Overview & Purpose

`train_classifier.py` is an offline training pipeline responsible for generating lightweight machine-learning classification models for real-time sign recognition. It ingests 63-dimensional normalized landmark features and outputs serialized model weights (`model/gesture_model.pkl`).

---

## 2. Model Architecture & Choice

* **Algorithm:** Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)
* **Justification over Heavy Deep Learning (CNNs):**
  * **Inference Latency:** Sub-10ms inference per frame on standard CPU architectures (crucial for browser webcam responsiveness).
  * **Storage Footprint:** Serialized `.pkl` model file is $< 5\text{ MB}$, avoiding the 100+ MB storage burden of deep neural networks.
  * **Overfitting Resistance:** Ensemble decision trees handle multi-class hand geometric distributions without requiring GPU hardware.

---

## 3. Pipeline Implementation

```python
# Feature Space: 63 features (21 landmarks x 3 axes [x, y, z])
X = [ ... 63-D normalized landmark feature arrays ... ]
y = [ ... target sign labels (A-Z, Doctor, etc.) ... ]

clf = RandomForestClassifier(
    n_estimators=100,
    criterion="gini",
    max_depth=None,
    random_state=42
)
clf.fit(X, y)