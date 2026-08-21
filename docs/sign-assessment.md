# Sign Assessment System — Architecture & Documentation

## 1. Overview
The **Sign Assessment System** in SignSpeak evaluates a learner's performed hand gesture against a reference/expected sign symbol (e.g. 'A', 'B', 'C'). It provides landmark extraction, hand/frame quality validation, normalization, feature extraction, model classification, transparent scoring, and rule-based AI feedback -- backed by real assessment sessions (Single Sign, Multiple Sign Quiz, Alphabet, Mixed) drawn from the model's actual 29-class support list, not a hardcoded subset.

---

## 2. Dependency & Processing Pipeline

```
Learner Input (Camera / Landmarks)
        ↓
Landmark Extraction (MediaPipe HandLandmarker)
        ↓
Frame/Hand Quality Gate (brightness, hand size, framing, detection confidence)
        ↓  (fails -> actionable message, NO classification, NO score)
Landmark Normalization (Wrist Translation & Scale Normalization)
        ↓
Feature Extraction (Coordinates, Distances, Joint Angles, Extensions -- 82-dim)
        ↓
Sign Classification Model (RandomForestSignClassifier)
        ↓
Low-Confidence Gate (< 0.40 -> "unable to confidently recognize", not "incorrect")
        ↓
Scoring Engine (Correctness + Confidence + Landmark Similarity)
        ↓
AI Feedback Engine (rule-based, category-tagged, history-aware)
        ↓
Database Attempt Logging (SignAssessmentAttempt) -> Session Aggregation (SignAssessmentSession)
```

---

## 3. Key Components

### 3.1 Landmark Extraction (`backend/app/ml/landmarks/extractor.py`)
- **`LandmarkVectorExtractor`**: Processes 21-point 3D landmark arrays supplied directly (e.g. by a client-side tracker or tests).
- **`MediaPipeLandmarkExtractor`**: Accepts image frames (Base64 string, PIL Image, OpenCV ndarray) and detects 21 keypoints via MediaPipe Tasks `HandLandmarker`. Explicitly closes the native detector (`atexit`) to avoid a background-thread hang at process exit -- a real defect found and fixed during this work (see §7).

### 3.2 Frame/Hand Quality Gate (`backend/app/ml/landmarks/quality.py`) -- NEW
`FrameQualityValidator` runs immediately after landmark extraction, before any classification, and rejects poor input with a specific, actionable message instead of producing a misleading score:
- **Low light**: mean frame brightness below threshold.
- **Hand too far / too close**: landmark bounding-box area ratio outside a normal range.
- **Hand out of frame / near edge**: landmark coordinates outside or near the `[0,1]` normalized frame boundary, with a directional hint ("move it left/right/up/down").
- **Insufficient landmarks**: fewer than 21 points detected.
- **Low detection confidence**: MediaPipe's own handedness/detection score below threshold (warning-level, does not block).

The classifier itself only ever consumes landmark-derived numeric features, never raw pixels, so background people/objects cannot themselves be "classified as the sign" -- the real risk this gate closes is a badly-framed, ambiguous, or unreliable hand landmark set being scored as if it were valid.

### 3.3 Landmark Normalization (`backend/app/ml/landmarks/normalizer.py`)
Unchanged: translates coordinates relative to wrist origin (landmark 0) and scale-normalizes relative to wrist-to-middle-finger-MCP distance.

### 3.4 Feature Extraction (`backend/app/ml/features/extractor.py`)
Computes an 82-element vector: 63 normalized coordinates (21×3) + 9 pairwise key landmark distances + 5 joint angles + 5 finger extension ratios.

### 3.5 Classification Model (`backend/app/ml/models/sign_classifier.py`)
`RandomForestSignClassifier` trained on all 29 ASL alphabet classes (`A`-`Z`, `del`, `nothing`, `space`). Serialized to `backend/app/ml/saved_models/sign_classifier.joblib`. Trains single-threaded (`n_jobs` left at default) -- `n_jobs=-1` was found to hang the process at interpreter shutdown in this sandboxed environment (see §7).

### 3.6 Scoring Engine (`backend/app/ml/assessment/scoring.py`)
Unchanged formula:
$$\text{Score} = \begin{cases}
\min(100, 60 + 40 \times \text{confidence} \times \text{similarity}) & \text{if Correct} \\
\max(0, 30 \times \text{confidence} \times \text{similarity}) & \text{if Incorrect}
\end{cases}$$

### 3.7 AI Feedback Engine (`backend/app/services/feedback_service.py`) -- NEW
`FeedbackEngine` is a dedicated, deterministic/rule-based service (previously an inline private method on the assessment service). It covers all documented feedback categories: hand not detected, quality issues (low light / too far / too close / out of frame), low confidence, correct (high/medium/low confidence), wrong sign, repeated mistakes (detected from recent attempt history for the same sign), and improving performance (confidence delta vs. the learner's previous attempt on that sign). Scoring stays fully deterministic; an LLM is never in the critical path.

### 3.8 Session Aggregation (`backend/app/models/assessment_session.py`) -- NEW
`SignAssessmentSession` groups a set of per-question `SignAssessmentAttempt` rows (by `attempt_id`) into one completed assessment run with aggregate accuracy, average confidence, and strong/weak sign lists, computed server-side from the actual persisted attempts.

---

## 4. API Endpoints
- `POST /api/v1/assessment/predict` -- Lightweight prediction preview (auth required). No DB write.
- `POST /api/v1/assessment/evaluate` -- Evaluates a learner attempt, runs the full pipeline including the quality gate and feedback engine, persists a `SignAssessmentAttempt`.
- `GET /api/v1/assessment/classes` -- Supported sign classes as reported by the deployed model (drives dynamic UI class lists).
- `GET /api/v1/assessment/questions?type=&count=` -- Generates a randomized question set for `single | quiz | alphabet | mixed`.
- `POST /api/v1/assessment/submit` -- Aggregates a set of `attempt_id`s into a persisted `SignAssessmentSession` with real computed accuracy/weak-strong signs.
- `GET /api/v1/assessment/sessions/{id}` -- Full session detail with per-attempt breakdown.
- `GET /api/v1/assessment/progress` -- Live per-sign mastery rollup from the learner's attempt history.
- `GET /api/v1/assessment/history` / `GET /api/v1/assessment/{attempt_id}` -- Unchanged.
- `POST /api/v1/feedback/generate` -- Direct wrapper around the Feedback Engine for callers that already have a structured outcome.

---

## 5. Status & Future Work
- **IMPLEMENTED**: Landmark extraction, frame/hand quality gate, normalization, feature extraction, Random Forest classifier, transparent scoring, dedicated rule-based feedback engine with history-aware categories, session aggregation, dynamic (not hardcoded) class lists end-to-end, FastAPI endpoints, frontend webcam integration with stable (non-flickering) status chips.
- **FUTURE ENHANCEMENTS**: CNN image feature extractor, LSTM/Transformer temporal gesture sequence tracking, MediaPipe Holistic face/pose integration, true continuous real-time (streamed) inference rather than click-to-analyze.

---

## 6. Known Limitations
- Real-time feedback during practice is still "capture on demand" (click Analyze), not a continuous per-frame stream -- this is an intentional efficiency trade-off (see architecture note in `docs/model-evaluation.md`), not a missing feature.
- The frame-quality gate reasons about the *landmark* bounding box, not a separate pixel-level person/background segmentation pass; since the classifier is landmark-only, this is sufficient to prevent background pixels from ever reaching the model, but it will not detect e.g. a second person's hand also being in frame if MediaPipe's own single-hand detector locks onto it instead of the primary user's hand.

## 7. Defects Found & Fixed During This Work
- `MediaPipeLandmarkExtractor`'s HandLandmarker was never explicitly closed; its native inference thread pool does not always join on interpreter exit, which hung short-lived processes (pytest, training/evaluation scripts) indefinitely in this environment. Fixed with an explicit `close()` + `atexit` registration.
- `RandomForestClassifier(n_jobs=-1)` spawned a multiprocessing (loky) worker pool that could similarly hang process exit in this sandboxed environment; changed to the default single-threaded fit, which remains fast at this dataset size.
- Two latent `NameError`-on-introspection bugs (missing `Tuple` import in `landmarks/extractor.py`, missing `Optional` import in `evaluation/metrics.py`) were masked only by Python 3.14's deferred annotation evaluation; fixed for portability.
- `/assessment/predict` had no authentication; `/evaluation/model` and `/evaluation/run` (including the `/admin/model-evaluation*` aliases) only required *any* authenticated user despite being admin-facing. Both fixed (see `docs/model-evaluation.md` §RBAC).
