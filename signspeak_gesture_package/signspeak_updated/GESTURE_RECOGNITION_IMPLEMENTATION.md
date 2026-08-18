# Gesture Recognition & Hand Tracking Implementation

Implemented against the project requirements for Milestone 2: gesture recognition, hand tracking workflows, and accuracy evaluation. The project specification explicitly calls for real-time gesture detection, hand landmark detection, finger position analysis, gesture classification, hand/finger tracking, and movement analysis.

## What changed

### Frontend
- Added `src/services/gestureEngine.js`
  - MediaPipe Hands integration.
  - 21 hand landmarks per detected hand.
  - Landmark normalization.
  - Finger extension/position analysis.
  - Explainable A/B/C gesture classification for the current alphabet practice flow.
  - Confidence score and target-sign matching.
  - Frame-by-frame timestamped detection output.
- Upgraded `src/components/practice/CameraPanel.jsx`
  - Starts/stops the webcam.
  - Runs real-time hand tracking.
  - Draws hand landmarks over the camera.
  - Displays detected gesture and confidence.
  - Sends detections back to the Practice page.
- Upgraded `src/pages/practice/Practice.jsx`
  - Removed random/simulated confidence generation.
  - Uses actual tracking output for analysis.
  - Tracks detections, attempts, correct attempts, and confidence.
  - Provides target-sign feedback for A/B/C.

### Runtime dependency
MediaPipe Hands is loaded from jsDelivr in `index.html`, so no large model binary is committed to the repository. A network connection is required when the practice page first loads the MediaPipe library/model assets.

## Run

### Backend
```text
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Frontend
```text
cd signspeak-frontend_enc
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`, sign in as a learner, and open **Practice**.

## Important

This implementation is an explainable MVP classifier for the A/B/C practice workflow, not a trained production ASL model. The engine is intentionally isolated behind `classifyLandmarks()`, so a CNN/LSTM/Transformer classifier can replace the heuristic classifier later without changing the camera/landmark workflow.

The project specification lists MediaPipe, CNN, LSTM, and Transformer technologies for the complete platform.
