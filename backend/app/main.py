from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine as db_engine, Base
from app.routes import user
from app import models 
from app.recommendation_engine import AdaptiveRecommendationEngine
import cv2
import numpy as np
import mediapipe as mp
import math

# Create DB tables
models.Base.metadata.create_all(bind=db_engine)

# 1. Initialize the App
app = FastAPI(
    title="SignBridge API",
    description="Backend API for SignBridge sign-language learning platform",
    version="1.0.0"
)

# 2. Setup CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. MediaPipe Hands Initialization
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.65
)

# 4. Include Authentication Routers
app.include_router(
    user.router,
    prefix="/auth", 
    tags=["Auth"]
)

# 5. Initialize Adaptive Recommendation Engine (Module 8)
rec_engine = AdaptiveRecommendationEngine()

# Example mock store; in production, this queries your PostgreSQL database
learner_practice_db = [
    {"sign": "Letter A", "course_id": "basics-of-asl", "accuracy": 0.92, "mistake_type": "hand_shape"},
    {"sign": "Letter B", "course_id": "basics-of-asl", "accuracy": 0.88, "mistake_type": "hand_shape"},
    {"sign": "Letter D", "course_id": "basics-of-asl", "accuracy": 0.58, "mistake_type": "hand_shape"},
    {"sign": "Letter M", "course_id": "basics-of-asl", "accuracy": 0.45, "mistake_type": "hand_shape"},
    {"sign": "Letter J", "course_id": "basics-of-asl", "accuracy": 0.62, "mistake_type": "motion"},
]

# Global tracker for hand motion / waving detection
prev_wrist_pos = None

# --- GEOMETRIC CALCULATIONS & FINGER EVALUATION ---
def get_distance(p1, p2):
    """Calculates 2D Euclidean distance between two landmark points."""
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def check_motion(current_wrist):
    """Detects if the hand is waving or moving rapidly."""
    global prev_wrist_pos
    if prev_wrist_pos is None:
        prev_wrist_pos = current_wrist
        return False

    velocity = math.hypot(current_wrist.x - prev_wrist_pos.x, current_wrist.y - prev_wrist_pos.y)
    prev_wrist_pos = current_wrist

    # If wrist moved more than 7% of screen between frames, hand is waving
    return velocity > 0.07

@app.get("/")
def read_root():
    return {"status": "online", "message": "SignBridge AI Engine is running"}

# --- MAIN PREDICTION ENDPOINT ---
@app.post("/predict")
async def predict_sign(
    file: UploadFile = File(...),
    target: str = Form(...)
):
    global prev_wrist_pos

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 1. Safety image decode check
    if image is None:
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "landmarks": [],
            "is_moving": False,
            "hints": ["Unable to decode webcam snapshot."]
        }

    # 2. Process image with MediaPipe
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_image)

    # 3. Check if hand is detected
    if not results.multi_hand_landmarks:
        prev_wrist_pos = None  # Reset tracking when hand leaves frame
        return {
            "prediction": "No hand detected",
            "confidence": 0.0,
            "landmarks": [],
            "is_moving": False,
            "hints": ["Bring your hand fully into the camera frame."]
        }

    # 4. Extract landmarks
    hand_landmarks = results.multi_hand_landmarks[0]
    lm = hand_landmarks.landmark
    wrist = lm[0]
    raw_landmarks = [{"x": p.x, "y": p.y, "z": p.z} for p in lm]

    # 5. Motion Check (Rejects waving)
    if check_motion(wrist):
        return {
            "prediction": "Moving",
            "confidence": 0.15,
            "landmarks": raw_landmarks,
            "is_moving": True,
            "hints": ["Hold your hand steady! Do not wave."]
        }

    # 6. Physical Finger Extension Analysis
    index_up = get_distance(lm[8], wrist) > get_distance(lm[6], wrist) * 1.15
    middle_up = get_distance(lm[12], wrist) > get_distance(lm[10], wrist) * 1.15
    ring_up = get_distance(lm[16], wrist) > get_distance(lm[14], wrist) * 1.15
    pinky_up = get_distance(lm[20], wrist) > get_distance(lm[18], wrist) * 1.15

    thumb_tip = lm[4]
    ring_base = lm[13]
    pinky_base = lm[17]

    detected_letter = "Unknown"
    base_confidence = 0.50
    target_upper = target.strip().upper()
    hints = []

    # ==============================
    # ASL PHYSICAL FINGER CLASSIFIER
    # ==============================

    # LETTER M:
    # All 4 fingers curled + Thumb tucked UNDER index, middle, ring
    if not index_up and not middle_up and not ring_up and not pinky_up:
        thumb_tucked = get_distance(thumb_tip, ring_base) < 0.12 or get_distance(thumb_tip, pinky_base) < 0.14
        if thumb_tucked:
            detected_letter = "M"
            base_confidence = 0.94
        else:
            detected_letter = "A"  # Fist without tucking under 3 fingers is A
            base_confidence = 0.90

    # LETTER W: 3 fingers strictly extended UP (Index, Middle, Ring)
    elif index_up and middle_up and ring_up and not pinky_up:
        detected_letter = "W"
        base_confidence = 0.95

    # LETTER D: ONLY Index extended UP
    elif index_up and not middle_up and not ring_up and not pinky_up:
        detected_letter = "D"
        base_confidence = 0.95

    # LETTER V: Index and Middle extended (Peace sign)
    elif index_up and middle_up and not ring_up and not pinky_up:
        detected_letter = "V"
        base_confidence = 0.92

    # LETTER B: All 4 fingers extended straight UP
    elif index_up and middle_up and ring_up and pinky_up:
        detected_letter = "B"
        base_confidence = 0.93

    # LETTER I: ONLY Pinky extended UP
    elif pinky_up and not index_up and not middle_up and not ring_up:
        detected_letter = "I"
        base_confidence = 0.94

    # LETTER L: Index extended UP + Thumb out at 90 degrees
    elif index_up and not middle_up and not ring_up and not pinky_up and get_distance(thumb_tip, pinky_base) > 0.20:
        detected_letter = "L"
        base_confidence = 0.95

    # LETTER Y: Thumb and Pinky extended out
    elif pinky_up and not index_up and not middle_up and not ring_up and get_distance(thumb_tip, lm[5]) > 0.20:
        detected_letter = "Y"
        base_confidence = 0.93

    # 7. Validate Detected Sign vs Target Sign
    if detected_letter == target_upper:
        confidence = max(base_confidence, 0.88)
    else:
        confidence = min(base_confidence, 0.35)
        
        # Diagnostic feedback
        if target_upper == "M":
            if index_up or middle_up or ring_up:
                hints.append("Close all fingers into a tight fist.")
            hints.append("Tuck your thumb underneath index, middle, and ring fingers.")
        elif target_upper == "D":
            if middle_up or ring_up:
                hints.append("You have too many fingers up. Only extend your index finger.")
            elif not index_up:
                hints.append("Point your index finger straight up.")
        elif target_upper == "W":
            hints.append("Extend three fingers (index, middle, ring) upward.")
        else:
            hints.append(f"Detected '{detected_letter}'. Adjust your handshape for '{target_upper}'.")

    # FIXED: Proper return for /predict
    return {
        "prediction": detected_letter,
        "confidence": round(confidence, 2),
        "landmarks": raw_landmarks,
        "is_moving": False,
        "hints": hints
    }


# --- RECOMMENDATION ENDPOINT (Module 8) ---
@app.get("/recommendations")
async def get_personalized_recommendations():
    """
    Returns AI-generated personalized learning path based on learner attempts.
    """
    plan = rec_engine.generate_recommendations(learner_practice_db)
    return plan