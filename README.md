# SignSpeak — AI-Powered Sign Language Learning & Assessment Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.0-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks-007ACC?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 📌 1. Project Overview

**SignSpeak** is an end-to-end, enterprise-grade AI-powered American Sign Language (ASL) learning and real-time assessment platform. It bridges accessibility and interactive education through computer vision, hand landmark tracking, machine learning classification, automated transparent scoring, and intelligent, category-tagged feedback.

The platform provides a modern, gamified learning experience for **Learners**, administrative and curricular management for **Instructors** and **Accessibility Trainers**, and governance tools for **Administrators**.

---

## 🏗️ 2. System Architecture

```
                                    +---------------------------------------------------+
                                    |              SignSpeak Web Client                |
                                    |      (React 19 + Vite + TailwindCSS + Recharts)  |
                                    +-------------------------+-------------------------+
                                                              | HTTPS / JSON / Base64 Frames
                                                              v
                                    +---------------------------------------------------+
                                    |               FastAPI REST Backend                |
                                    |       (JWT Auth, RBAC, Routers & Services)        |
                                    +-------------------------+-------------------------+
                                                              |
          +---------------------------------------------------+---------------------------------------------------+
          |                                                   |                                                   |
          v                                                   v                                                   v
+-----------------------+                           +-------------------+                               +--------------------+
|  PostgreSQL / SQLite  |                           |  ML Assessment &  |                               |   Reports & Live   |
|   (SQLAlchemy ORM)    |                           | Feedback Engine   |                               |  Model Evaluation  |
+-----------------------+                           +---------+---------+                               +--------------------+
| - Users & RBAC        |                                     |
| - Courses & Lessons   |                                     v
| - Sessions & Attempts |                   +-----------------------------------+
| - Badges & Activity   |                   |  1. MediaPipe Hand Landmark Extr. | (21 3D landmarks)
+-----------------------+                   |  2. Frame Quality & Framing Gate  | (Light, Box, Boundary)
                                            |  3. Origin & Scale Normalization  | (Wrist relative, invariant)
                                            |  4. 82-Dim Feature Extraction     | (Coords, Distances, Angles)
                                            |  5. 29-Class Random Forest Model  | (A-Z, del, nothing, space)
                                            |  6. Deterministic Scoring Engine  | (Confidence + Similarity)
                                            |  7. Rule-Based AI Feedback Engine | (History & Mistake aware)
                                            +-----------------------------------+
```

---

## 🧠 3. Machine Learning & Sign Assessment Pipeline

### 3.1 Pipeline Flow
1. **Input Ingestion**: Web client captures camera frames (Base64 JPEG/PNG) or raw 3D landmark arrays.
2. **Landmark Extraction (`MediaPipeLandmarkExtractor`)**:
   - Extracts 21 3D hand keypoints $(x, y, z)$ using MediaPipe Tasks `HandLandmarker`.
   - Thread-safe lifecycle management with explicit cleanup (`atexit`) to prevent native thread hangs.
3. **Frame / Hand Quality Gate (`FrameQualityValidator`)**:
   - Rejects poor frames *before* passing to the classifier to eliminate false classifications:
     - **Lighting Check**: Validates frame brightness threshold.
     - **Distance / Scale Check**: Validates hand bounding-box area ratio (hand too far or too close).
     - **Framing Check**: Verifies hand landmark proximity to frame edges with directional adjustment hints (*"Move hand left/right/up/down"*).
     - **Landmark Count Check**: Validates full 21-point detection.
4. **Landmark Normalization (`LandmarkNormalizer`)**:
   - Translates origin relative to the wrist (landmark 0).
   - Scale-normalizes coordinates relative to the wrist-to-middle-finger MCP distance.
5. **82-Dimensional Feature Vector Extraction (`FeatureExtractor`)**:
   - **63 Normalized Coordinates**: 21 points $\times$ 3 $(x, y, z)$.
   - **9 Pairwise Key Distances**: Euclidean distances between key fingertip and knuckle points.
   - **5 Joint Angles**: Angles at metacarpophalangeal (MCP) and interphalangeal (IP) joints.
   - **5 Finger Extension Ratios**: Extension metrics for thumb, index, middle, ring, and pinky.
6. **29-Class Sign Classification (`RandomForestSignClassifier`)**:
   - Trained on all 29 ASL alphabet classes: `A`–`Z`, `del`, `nothing`, and `space`.
   - Low-confidence gate ($< 0.40$) flags ambiguous gestures as *"Unable to confidently recognize"* rather than penalizing incorrectly.
7. **Deterministic Scoring Engine**:
   $$\text{Score} = \begin{cases} \min(100, 60 + 40 \times \text{confidence} \times \text{similarity}) & \text{if Correct} \\ \max(0, 30 \times \text{confidence} \times \text{similarity}) & \text{if Incorrect} \end{cases}$$
8. **Intelligent AI Feedback Engine (`FeedbackEngine`)**:
   - Rule-based, category-tagged feedback:
     - Hand not detected / Poor lighting / Hand too close / Out of frame.
     - Low confidence / Form error / Wrong sign guidance.
     - Repeated mistake detection (tracks recent attempt history for the sign).
     - Performance improvement encouragement (tracks confidence deltas vs. past sessions).

---

## 📊 4. Model Evaluation & Benchmark Comparison

The platform includes a genuine offline and dynamic evaluation pipeline (`run_full_evaluation`) that re-runs inference against real test splits rather than loading static placeholders.

### Benchmark Results (Standardized Test Split):

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **RandomForest Classifier (Deployed)** | **97.70%** | **98.03%** | **97.70%** | **97.76%** | **Current Production** |
| **K-Nearest Neighbors ($k=5$)** | 92.82% | 93.71% | 92.82% | 92.82% | Candidate |
| **Logistic Regression** | 89.37% | 92.96% | 89.37% | 89.48% | Candidate |
| **Support Vector Machine (RBF Kernel)** | 85.92% | 91.92% | 85.92% | 86.75% | Candidate |

---

## 🛡️ 5. Role-Based Access Control (RBAC)

The backend strictly enforces role-based authorization via FastAPI dependencies (`get_current_user`, `require_staff`, `require_admin`):

| Feature / Endpoint Group | Learner (`student`) | Instructor | Accessibility Trainer | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Auth & Profile Management** | ✅ | ✅ | ✅ | ✅ |
| **Course Enrollment & Lessons** | ✅ | ✅ | ✅ | ✅ |
| **Interactive Practice & Assessment** | ✅ | ✅ | ✅ | ✅ |
| **Personal Reports & Progress** | ✅ | ✅ | ✅ | ✅ |
| **Course & Content Authoring** | ❌ | ✅ | ✅ | ✅ |
| **Staff Analytics & Class Mastery** | ❌ | ✅ | ✅ | ✅ |
| **Live Model Evaluation & Benchmarks** | ❌ | ✅ | ✅ | ✅ |
| **Trigger Retraining / Evaluation** | ❌ | ✅ | ✅ | ✅ |
| **User & Role Management** | ❌ | ❌ | ❌ | ✅ |

---

## 💻 6. Frontend Features & Technology Stack

- **Modern Glassmorphic Dark UI**: Custom color tokens, high-contrast cyan/indigo accents, and responsive layouts.
- **Webcam Practice Studio**: Live video feed with visual target cards, confidence meters, dynamic tips, and stable status badges.
- **Multi-Mode Assessment Suite**: Single Sign, Randomized Quiz, Full Alphabet, and Mixed Modes.
- **Learner Dashboard**: Weekly activity tracking, mastery radar, quick actions, KPI cards, and learning paths.
- **Staff / Admin Model Evaluation View**: Full $29 \times 29$ confusion matrix, per-class metrics table, model architecture metadata, and candidate model comparison table.
- **Tech Stack**: React 19, Vite 6, TailwindCSS 3.4, Framer Motion, Lucide React, Recharts, Axios, React Hook Form.

---

## 📁 7. Project Structure

```
signspeak_updated/
├── backend/
│   ├── alembic/                       # Database migration scripts
│   ├── app/
│   │   ├── core/                      # App configuration, security & JWT deps
│   │   ├── crud/                      # Database CRUD operations
│   │   ├── database/                  # SQLAlchemy session & DB initializers
│   │   ├── middleware/                # Global exception & error handlers
│   │   ├── ml/                        # Machine Learning Pipeline
│   │   │   ├── assessment/            # Scoring engine
│   │   │   ├── evaluation/            # Model metrics, evaluator & pipeline
│   │   │   ├── features/              # 82-dim feature extractor
│   │   │   ├── landmarks/             # MediaPipe extractor, quality gate, normalizer
│   │   │   ├── models/                # Random Forest classifier implementation
│   │   │   ├── reports/               # Persisted JSON evaluation reports
│   │   │   └── saved_models/          # Model weights (sign_classifier.joblib, hand_landmarker.task)
│   │   ├── models/                    # SQLAlchemy database models
│   │   ├── routers/                   # FastAPI route controllers
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   └── services/                  # Business logic (Feedback, Gamification, Audit)
│   ├── scripts/                       # CLI tools (train_sign_model.py, evaluate_sign_model.py)
│   ├── tests/                         # Pytest test suites
│   ├── alembic.ini                    # Alembic configuration
│   ├── requirements.txt               # Backend Python dependencies
│   └── seed_admin.py                  # Seed script for initial staff/admin users
├── docs/                              # Technical documentation
│   ├── model-evaluation.md            # Model evaluation architecture & benchmarks
│   └── sign-assessment.md             # Sign assessment pipeline documentation
├── signspeak-frontend_enc/            # React 19 Frontend Application
│   ├── src/
│   │   ├── components/                # UI, Cards, Charts, Practice & Layout components
│   │   ├── context/                   # Auth & Toast state contexts
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── layouts/                   # Auth, Dashboard & Public layouts
│   │   ├── pages/                     # Application views (Dashboard, Practice, Admin, etc.)
│   │   ├── routes/                    # React Router configuration
│   │   └── services/                  # API client & endpoint services
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Tailwind design tokens
│   └── vite.config.js                 # Vite bundler configuration
├── BACKEND_PDF_AUDIT.md               # Backend specification compliance audit
├── FEATURES_IMPLEMENTED.md            # Summary of implemented features
└── README.md                          # Comprehensive project documentation
```

---

## 🚀 8. Getting Started

### 8.1 Prerequisites
- **Python**: 3.10 to 3.12 (or 3.14 compatible)
- **Node.js**: v18.x or v20.x + npm
- **Database**: SQLite (default zero-config) or PostgreSQL

---

### 8.2 Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

5. **Initialize database & seed default users:**
   ```bash
   python seed_admin.py
   ```

6. **Start the FastAPI development server:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API Docs will be available at: `http://127.0.0.1:8000/api/docs`

---

### 8.3 Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd signspeak-frontend_enc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Application will be available at: `http://localhost:5173`

---

### 8.4 Model Training & Evaluation CLI

- **Retrain Sign Recognition Model:**
  ```bash
  python backend/scripts/train_sign_model.py --max-samples 50
  ```
- **Run Offline Benchmark Evaluation & Model Comparison:**
  ```bash
  python backend/scripts/evaluate_sign_model.py
  ```

---

## 📦 9. Dataset Management Note

The ASL raw image datasets (`asl_alphabet_train` and `asl_alphabet_test`) are modularly decoupled from source control to maintain repository health and transfer efficiency. Datasets are managed via dedicated storage and preprocessing pipelines (`ml/preprocessing/`). The pre-trained model weights (`sign_classifier.joblib`) and MediaPipe landmark task files (`hand_landmarker.task`) are versioned directly in `backend/app/ml/saved_models/` for immediate out-of-the-box operation.

---

## 📄 10. License

This project is developed as part of the **Team 2 Sign Language AI Platform** initiative.
