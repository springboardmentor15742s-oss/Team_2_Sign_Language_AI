import csv
import time
from pathlib import Path

import cv2
import mediapipe as mp

OUTPUT_FILE = Path("ml/data/landmarks/asl_landmarks.csv")
MODEL_PATH = Path("ml/models/mediapipe/hand_landmarker.task")
SAMPLES_PER_SIGN = 80


def normalize_landmarks(landmarks):
    base_x = landmarks[0].x
    base_y = landmarks[0].y
    base_z = landmarks[0].z

    values = []

    for lm in landmarks:
        values.extend([
            lm.x - base_x,
            lm.y - base_y,
            lm.z - base_z,
        ])

    scale = max(abs(v) for v in values) or 1.0

    return [v / scale for v in values]


def main():
    label = input("Enter sign label (example A): ").strip().upper()

    if not label:
        print("Invalid label")
        return

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Hand landmarker model not found: {MODEL_PATH}"
        )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    file_exists = OUTPUT_FILE.exists()

    BaseOptions = mp.tasks.BaseOptions
    HandLandmarker = mp.tasks.vision.HandLandmarker
    HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(
            model_asset_path=str(MODEL_PATH)
        ),
        running_mode=VisionRunningMode.VIDEO,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError("Could not open camera")

    collected = 0
    last_saved = 0.0
    start_time = time.time()

    with HandLandmarker.create_from_options(options) as landmarker:
        with OUTPUT_FILE.open("a", newline="") as f:
            writer = csv.writer(f)

            if not file_exists:
                header = ["label"]

                for i in range(21):
                    header.extend([
                        f"x{i}",
                        f"y{i}",
                        f"z{i}",
                    ])

                writer.writerow(header)

            print(f"Collecting {SAMPLES_PER_SIGN} samples for {label}")
            print("Hold the sign clearly and move slightly between samples.")
            print("Press Q to stop.")

            while collected < SAMPLES_PER_SIGN:
                ok, frame = cap.read()

                if not ok:
                    continue

                frame = cv2.flip(frame, 1)

                rgb = cv2.cvtColor(
                    frame,
                    cv2.COLOR_BGR2RGB
                )

                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=rgb
                )

                timestamp_ms = int(
                    (time.time() - start_time) * 1000
                )

                result = landmarker.detect_for_video(
                    mp_image,
                    timestamp_ms
                )

                if result.hand_landmarks:
                    landmarks = result.hand_landmarks[0]

                    now = time.time()

                    if now - last_saved >= 0.05:
                        features = normalize_landmarks(landmarks)

                        writer.writerow([
                            label,
                            *features
                        ])

                        collected += 1
                        last_saved = now

                    h, w = frame.shape[:2]

                    for lm in landmarks:
                        x = int(lm.x * w)
                        y = int(lm.y * h)

                        cv2.circle(
                            frame,
                            (x, y),
                            4,
                            (0, 255, 0),
                            -1
                        )

                cv2.putText(
                    frame,
                    f"{label}: {collected}/{SAMPLES_PER_SIGN}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (255, 255, 255),
                    2,
                )

                cv2.imshow(
                    "SignSpeak Landmark Collector",
                    frame,
                )

                key = cv2.waitKey(1) & 0xFF

                if key == ord("q"):
                    break

    cap.release()
    cv2.destroyAllWindows()

    print(
        f"Saved {collected} samples for {label} "
        f"to {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()
