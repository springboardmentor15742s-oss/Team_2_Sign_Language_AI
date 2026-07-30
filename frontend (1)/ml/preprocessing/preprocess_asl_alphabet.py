"""ASL Alphabet Dataset Preprocessing."""
import cv2
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from tqdm import tqdm

DATASET_DIR = Path("ml/datasets/asl_alphabet")
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"
IMG_SIZE = (224, 224)
TEST_SIZE = 0.15
VAL_SIZE = 0.15

def preprocess_image(image_path: Path) -> np.ndarray:
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMG_SIZE)
    img = img.astype(np.float32) / 255.0
    return img

def preprocess_dataset():
    if not RAW_DIR.exists():
        print(f"Raw dataset not found at {RAW_DIR}")
        return
    classes = sorted([d.name for d in RAW_DIR.iterdir() if d.is_dir()])
    print(f"Found {len(classes)} classes: {classes}")
    images, labels = [], []
    for label_idx, class_name in enumerate(classes):
        class_dir = RAW_DIR / class_name
        for img_path in tqdm(list(class_dir.glob("*.jpg")), desc=f"Processing {class_name}"):
            img = preprocess_image(img_path)
            if img is not None:
                images.append(img)
                labels.append(label_idx)
    images = np.array(images)
    labels = np.array(labels)
    X_temp, X_test, y_temp, y_test = train_test_split(images, labels, test_size=TEST_SIZE, random_state=42, stratify=labels)
    val_ratio = VAL_SIZE / (1 - TEST_SIZE)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=val_ratio, random_state=42, stratify=y_temp)
    for split_name, X, y in [("train", X_train, y_train), ("val", X_val, y_val), ("test", X_test, y_test)]:
        split_dir = PROCESSED_DIR / split_name
        split_dir.mkdir(parents=True, exist_ok=True)
        np.save(split_dir / "images.npy", X)
        np.save(split_dir / "labels.npy", y)
    with open(PROCESSED_DIR / "classes.txt", "w") as f:
        for idx, name in enumerate(classes):
            f.write(f"{idx},{name}\n")
    print(f"\nTrain: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

if __name__ == "__main__":
    preprocess_dataset()
