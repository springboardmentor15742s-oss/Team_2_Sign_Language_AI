# SignSpeak — Dataset Architecture & Specification Documentation
**Infosys Springboard Internship 7.0 — Team 2**  
**Module:** Machine Learning & Computer Vision Data Pipeline (`ml_engine/data`)  
**Contributor:** Chaitali Patil (Dataset Structure & Class Analysis)

---

## 1. Overview & Data Strategy

The SignSpeak platform employs a multi-tiered dataset strategy to support both **static alphabet signs** (fingerspelling) and **dynamic vocabulary** (gestures involving motion and temporal transitions). 

Because raw image and video archives exceed GitHub's 100 MB file limit, raw directories are tracked locally, while the extracted coordinate feature sets (`landmarks.csv`) and pipeline specifications are documented here.

---

## 2. Dataset Breakdown & Analysis

### 2.1 ASL Alphabet Dataset
* **Source:** Kaggle ASL Alphabet Dataset (Grassknoted)
* **Format:** RGB Images (`.jpg` / `.png`), original $200 \times 200$ pixels.
* **Classes:** 29 classes (`A–Z`, `SPACE`, `DELETE`, `NOTHING`).
* **Purpose:** Static fingerspelling recognition for Module 4 (Observation & Practice modes).
* **Class Analysis:**
  - Classes `A`, `E`, `M`, `N`, `S`, `T` share similar clenched-fist silhouettes and require fine-grained thumb positioning metrics.
  - Classes `D`, `1`, `I` require distinct joint angle thresholds to avoid false positives.

### 2.2 Sign Language MNIST
* **Source:** National Institute of Standards and Technology / Kaggle
* **Format:** Tabular CSV format (`sign_mnist_train.csv`, `sign_mnist_test.csv`).
* **Dimensions:** $28 \times 28$ normalized grayscale pixel values (784 features per row).
* **Classes:** 24 classes (letters `A–Y`, excluding `J` and `Z` due to motion requirements).
* **Purpose:** Baseline tabular supervised learning benchmarks (Random Forest, SVM, CNN experimentation).

### 2.3 WLASL (Word-Level American Sign Language)
* **Source:** WLASL Database (University of Central Florida / GitHub)
* **Format:** Video clips / Temporal frame sequences.
* **Target Classes:** Key curriculum terms including `Doctor`, `Hospital`, `Mother`, `Father`, `Home`, `Work`, `Agreement`.
* **Purpose:** Provides temporal trajectory ground truth for Module 3 (Professional & Everyday Vocabulary).

### 2.4 RWTH-PHOENIX-Weather 2014
* **Source:** RWTH Aachen University Computer Vision Group
* **Format:** Continuous sign language video sequences and gloss annotations.
* **Purpose:** Used for sequence segmentation analysis, transition modeling, and continuous assessment research (Milestones 3 & 4).

---

## 3. Preprocessing & Feature Engineering Pipeline

Instead of feeding high-dimensional raw pixel matrices directly into inference (which introduces lag in web browsers), the raw data is transformed into geometric vectors:

[Raw Camera / Dataset Image]
│
▼
[MediaPipe Hands Detection]
│
▼
[21 Landmarks Coordinates (x, y, z)]
│
▼
[Geometric Normalization]
Translation Invariance: Center Wrist at (0, 0, 0)
Scale Invariance: Divide by Max Euclidean Distance from Wrist
│
▼
[63-Dimensional Feature Vector] ──▶ Output to landmarks.csv

### Feature Specification in `landmarks.csv`

| Column Range | Feature Description | Formula / Details |
|---|---|---|
| `label` | Target Class | Letters `A–Z`, `Doctor`, `Mother`, etc. |
| `lm0_x` to `lm0_z` | Wrist Position | Center reference $(0.0, 0.0, 0.0)$ |
| `lm1_x` to `lm4_z` | Thumb CMC, MCP, IP, TIP | Curl & abduction measurement |
| `lm5_x` to `lm8_z` | Index MCP, PIP, DIP, TIP | Flexion & extension angles |
| `lm9_x` to `lm12_z` | Middle MCP, PIP, DIP, TIP | Planar posture detection |
| `lm13_x` to `lm16_z` | Ring MCP, PIP, DIP, TIP | Finger isolation check |
| `lm17_x` to `lm20_z` | Pinky MCP, PIP, DIP, TIP | Edge contour check |

---

## 4. Class Distribution & Quality Control

1. **Resolution Normalization:** Input frames are standardized to $640 \times 480$ before landmark extraction.
2. **Ambiguity Prevention (D vs. W, A vs. M):**
   - Letter `D` validation strictly enforces: Index `Tip_dist > PIP_dist * 1.15`, while Middle/Ring/Pinky distances are clamped $< 0.12$.
   - Letter `M` validation requires the thumb tip coordinate to lie adjacent to the pinky/ring finger base ($L_{13}, L_{17}$).
3. **Motion Thresholding:** Frames displaying wrist velocity $> 0.06$ normalized units per second are marked as invalid transitions to prevent waving false-positives.

---

## 5. Storage & Version Control Policy

* Large raw image caches (`asl_alphabet_train/`, `asl_alphabet_test/`, `WLASL/`) are stored in local development caches and external team drives.
* **`landmarks.csv`**, **`dataset_plan.txt`**, and **`DATA_DOCUMENTATION.md`** are committed to Git as reproducible engineering artifacts.