from pathlib import Path

import cv2
import joblib
import numpy as np
from skimage.feature import hog


CUSTOM_DIR = Path("data/custom_test")

MODEL_PATH = Path(
    "models/trained/hog_linear_svm.joblib"
)

ENCODER_PATH = Path(
    "models/trained/label_encoder.joblib"
)


print("Loading SignSpeak model...")

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

print("Model loaded successfully ✅")


def extract_features(image_path):
    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    # Center crop to square
    height, width = image.shape[:2]

    side = min(height, width)

    start_y = (height - side) // 2
    start_x = (width - side) // 2

    image = image[
        start_y:start_y + side,
        start_x:start_x + side
    ]

    # Resize
    image = cv2.resize(
        image,
        (128, 128)
    )

    # Grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # HOG
    features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(8, 8),
        cells_per_block=(2, 2),
        block_norm="L2-Hys",
        visualize=False,
        feature_vector=True
    )

    return features.astype(np.float32)


test_images = [
    ("A", CUSTOM_DIR / "my_A.jpg"),
    ("B", CUSTOM_DIR / "my_B.jpg"),
    ("C", CUSTOM_DIR / "my_C.jpg"),
    ("L", CUSTOM_DIR / "my_L.jpg"),
    ("V", CUSTOM_DIR / "my_V.jpg"),
]


correct = 0

print()
print("=" * 55)
print("SIGNSPEAK EXTERNAL IMAGE TEST")
print("=" * 55)

for expected, image_path in test_images:

    if not image_path.exists():
        print(
            f"{image_path.name}: FILE NOT FOUND ❌"
        )
        continue

    features = extract_features(
        image_path
    )

    predicted_id = model.predict(
        features.reshape(1, -1)
    )[0]

    predicted = encoder.inverse_transform(
        [predicted_id]
    )[0]

    is_correct = (
        expected == predicted
    )

    if is_correct:
        correct += 1

    print(
        f"{image_path.name:12} "
        f"Expected: {expected:2} | "
        f"Predicted: {predicted:8} | "
        f"{'✅' if is_correct else '❌'}"
    )


total = len(test_images)

accuracy = (
    correct / total
) * 100

print("=" * 55)

print(
    "Correct predictions:",
    correct,
    "/",
    total
)

print(
    "External image accuracy:",
    round(accuracy, 2),
    "%"
)

print("=" * 55)