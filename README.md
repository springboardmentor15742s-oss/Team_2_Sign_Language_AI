# 🤟 SignBridge
### AI-Powered Sign Language Learning & Assessment Platform
**B.Tech Final Year AIML Project | Infosys Springboard**

---

## 📌 Project Overview

SignBridge is an AI-powered platform that helps users learn Indian Sign Language (ISL) through:
- Real-time gesture recognition using computer vision
- AI-driven feedback and correction
- Structured learning paths from beginner to advanced
- Performance assessments and certifications
- Multi-language voice output (English, Hindi, Marathi)

**Target users:** Students, hearing-impaired individuals, educators, accessibility trainers, and language learning organizations.

---

## 🗂️ Project Structure

```
signbridge-platform/
│
├── backend/                        ← Python FastAPI server
│   ├── main.py                     ← WebSocket + REST API endpoints
│   ├── database.py                 ← PostgreSQL models (SQLAlchemy)
│   └── .env.example                ← Environment variables template
│
├── model/                          ← ML model
│   ├── predictor.py                ← Bidirectional LSTM architecture + inference
│   ├── gesture_model.keras         ← Trained model (auto-created after training)
│   └── labels.json                 ← Gesture label list (auto-created)
│
├── utils/                          ← Helper modules
│   ├── sentence_builder.py         ← Word → grammatical sentence logic
│   └── light_checker.py            ← Brightness detection + data augmentation
│
├── frontend/                       ← React.js web app
│   ├── src/
│   │   ├── App.jsx                 ← Full dashboard (Login, Practice, Progress, Assessment)
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── notebooks/                      ← Jupyter notebooks
│   ├── 01_dataset_exploration.ipynb  ← Explore all 4 datasets
│   └── training.ipynb              ← Full LSTM training + evaluation
│
├── docs/                           ← Project documentation
│   ├── WORKFLOW.md                 ← Complete learning workflow diagram
│   ├── ARCHITECTURE.md             ← System architecture + DB schema
│   ├── DATASETS.md                 ← All datasets explained
│   └── MILESTONE1_CHECKLIST.md     ← Infosys task checklist
│
├── data/
│   ├── gestures/                   ← Your collected .npy files (per gesture)
│   │   ├── Hello/
│   │   │   ├── 0.npy               ← shape (30, 63) — 30 frames × 63 landmarks
│   │   │   └── 1.npy
│   │   └── Thank_you/
│   └── datasets/                   ← Downloaded benchmark datasets
│       ├── sign_mnist/             ← Sign Language MNIST (CSV)
│       ├── asl_alphabet/           ← ASL Alphabet (images)
│       ├── wlasl/                  ← WLASL videos + JSON metadata
│       └── phoenix/                ← RWTH-PHOENIX frames + annotations
│
├── scripts/                        ← Dataset download + preprocessing
│   ├── download_mnist.py
│   ├── download_asl.py
│   ├── download_wlasl.py
│   ├── download_phoenix.py
│   ├── preprocess_mnist.py         ← CSV → numpy arrays for CNN
│   └── preprocess_wlasl.py         ← Videos → landmark .npy for LSTM
│
├── collect_data.py                 ← Webcam gesture data recorder
├── requirements.txt                ← All Python dependencies
├── setup_signbridge.py             ← One-click project setup script
└── README.md                       ← This file
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, Tailwind CSS, Chart.js |
| **Backend** | Python 3.12, FastAPI, WebSocket |
| **Primary DB** | PostgreSQL (users, courses, scores) |
| **Secondary DB** | MongoDB (video metadata) |
| **Cache** | Redis (sessions, inference cache) |
| **Computer Vision** | MediaPipe Hands, OpenCV |
| **AI / ML** | TensorFlow, Bidirectional LSTM, Scikit-learn |
| **Auth** | JWT tokens, OAuth2, bcrypt |
| **TTS** | gTTS (English, Hindi, Marathi) |
| **DevOps** | Docker, GitHub Actions, AWS / Azure |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Git
- A webcam (for gesture collection)

### Step 1 — Clone / create the project
```bash
# If using the setup script (recommended):
python setup_signbridge.py

# Or clone from GitHub:
git clone https://github.com/YOUR_USERNAME/signbridge-platform.git
cd signbridge-platform
```

### Step 2 — Set up Python environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# Install all dependencies
pip install -r requirements.txt
```

### Step 3 — Configure environment variables
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
#   DATABASE_URL=postgresql://user:password@localhost:5432/signbridge
#   SECRET_KEY=your-secret-key-here
```

### Step 4 — Set up the React frontend
```bash
cd frontend
npm install
cd ..
```

### Step 5 — Run the project
```bash
# Terminal 1 — Start backend
cd backend
python main.py
# → Running at http://localhost:8000
# → WebSocket at ws://localhost:8000/ws/translate

# Terminal 2 — Start frontend
cd frontend
npm start
# → Opens at http://localhost:3000
```

---

## 📦 Datasets

| Dataset | Purpose | When to use | Download |
|---------|---------|-------------|----------|
| **Sign Language MNIST** | Static letter recognition (A–Z) | Week 1–2 ← Start here | `python scripts/download_mnist.py` |
| **ASL Alphabet** | Transfer learning (ResNet/MobileNet) | Week 2 (optional) | `python scripts/download_asl.py` |
| **WLASL** | Dynamic word-level gestures | Week 3–4 | `python scripts/download_wlasl.py` |
| **RWTH-PHOENIX** | Sign language translation sequences | Week 5–6 (advanced) | `python scripts/download_phoenix.py` |

> **Note:** For Milestone 1 you only need Sign Language MNIST. WLASL is added in Milestone 2 for your LSTM.

### Download Sign Language MNIST (start here):
```bash
pip install kaggle
# Place your kaggle.json in ~/.kaggle/
python scripts/download_mnist.py
```

### Explore datasets in Jupyter:
```bash
jupyter notebook notebooks/01_dataset_exploration.ipynb
```

---

## 🧠 AI Model

### Architecture — Bidirectional LSTM
```
Input: (batch, 30 frames, 63 landmarks)
  ↓
Bidirectional LSTM (128 units) + BatchNorm + Dropout(0.3)
  ↓
Bidirectional LSTM (64 units)  + BatchNorm + Dropout(0.3)
  ↓
LSTM (32 units) + Dropout(0.2)
  ↓
Dense(64, relu) + Dropout(0.2)
  ↓
Dense(num_classes, softmax)
```

### Data pipeline
```
Webcam frame
  → MediaPipe (21 hand keypoints × xyz = 63 features)
  → Normalize relative to wrist
  → Buffer 30 frames → shape (30, 63)
  → LSTM → word + confidence score
  → Sentence builder → grammatical sentence
  → Frontend display + TTS output
```

### Collect your own gesture data:
```bash
python collect_data.py --gesture "Hello"     --samples 40
python collect_data.py --gesture "Thank you" --samples 40
python collect_data.py --gesture "Please"    --samples 40
python collect_data.py --list                 # see collected data
```

### Train the model:
```bash
# Option A: Jupyter (recommended — see charts and metrics)
jupyter notebook notebooks/training.ipynb

# Option B: CLI
python model/predictor.py --train --epochs 60
```

---

## 🗓️ Milestone Plan (8 Weeks)

| Milestone | Weeks | Tasks | Status |
|-----------|-------|-------|--------|
| **1** | 1–2 | Setup, Auth, Learner Profile, Dataset Download | 🟡 In Progress |
| **2** | 3–4 | Gesture Recognition Engine, Sign Assessment | ⬜ Upcoming |
| **3** | 5–6 | AI Feedback Engine, Learning Intelligence | ⬜ Upcoming |
| **4** | 7–8 | Certification, Docker, Deployment | ⬜ Upcoming |

### Milestone 1 Checklist (from Infosys PDF)
- [x] Design learning workflow → `docs/WORKFLOW.md`
- [x] Download datasets → `scripts/download_*.py`
- [x] Explore dataset structures → `notebooks/01_dataset_exploration.ipynb`
- [x] Configure backend environment → `requirements.txt`
- [x] Create UI wireframes → `frontend/src/App.jsx`
- [x] Plan learner dashboard layout → `frontend/src/App.jsx`
- [x] Design system architecture → `docs/ARCHITECTURE.md`
- [x] Configure backend routes → `backend/main.py`
- [x] Initialize React project → `frontend/`
- [x] Build Login and Registration UI → `frontend/src/App.jsx`
- [x] Develop learner dashboard layout → `frontend/src/App.jsx`
- [ ] Implement authentication & role-based access → `backend/auth.py` *(next task)*
- [ ] Build learner profile management → `backend/profiles.py` *(next task)*
- [ ] Connect PostgreSQL database → `backend/database.py`

---

## 🔌 API Endpoints

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/translate` | Real-time gesture recognition stream |

### REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/gestures` | List all known gesture labels |
| `POST` | `/gestures/add` | Add custom gesture training samples |
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, get JWT token |
| `GET` | `/profile/{user_id}` | Get learner profile |
| `PUT` | `/profile/{user_id}` | Update learner profile |

### WebSocket message format
```json
// Client → Server
{ "frame": "<base64 JPEG>" }

// Server → Client (word detected)
{ "type": "word", "word": "Hello", "confidence": 0.94 }

// Server → Client (sentence formed)
{ "type": "sentence", "sentence": "Hello my name is Aryan." }

// Server → Client (low light)
{ "type": "light_warning", "brightness": 42, "message": "..." }
```

---

## 👥 User Roles (RBAC)

| Role | Access |
|------|--------|
| **Learner** | Practice, view own progress, take assessments |
| **Instructor** | All learner access + view student reports, manage courses |
| **Accessibility Trainer** | Learner engagement, skill development reports |
| **Administrator** | Full platform access, user management, analytics |

---

## 📊 Performance Scoring

```
Learning Performance Score =
    Gesture Accuracy      × 40%
  + Assessment Performance × 25%
  + Lesson Completion      × 15%
  + Practice Consistency   × 10%
  + Skill Improvement Rate × 10%
```

---

## 🐳 Docker (Milestone 4)

```bash
# Build and run entire stack
docker-compose up --build

# Services:
#   signbridge-backend   → localhost:8000
#   signbridge-frontend  → localhost:3000
#   postgres             → localhost:5432
#   redis                → localhost:6379
```

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| *(Your name)* | Backend + ML |
| *(Team member)* | Frontend + UI |
| *(Team member)* | Data + Preprocessing |

**Mentor:** Springboard Mentor via Infosys platform
**Institution:** *(Your college name)*
**Batch:** B.Tech AIML Final Year 2025–26

---

## 📄 License
This project is built for academic purposes under the Infosys Springboard program.