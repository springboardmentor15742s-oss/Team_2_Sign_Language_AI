"""Sign Language MNIST Preprocessing."""
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split

DATASET_DIR = Path("ml/datasets/sign_language_mnist")
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"

def preprocess_dataset():
    train_csv = RAW_DIR / "sign_mnist_train.csv"
    test_csv = RAW_DIR / "sign_mnist_test.csv"
    if not train_csv.exists():
        print(f"Dataset not found at {RAW_DIR}")
        return
    train_df = pd.read_csv(train_csv)
    test_df = pd.read_csv(test_csv)
    y_train = train_df['label'].values
    X_train = train_df.drop('label', axis=1).values.reshape(-1, 28, 28).astype(np.float32) / 255.0
    y_test = test_df['label'].values
    X_test = test_df.drop('label', axis=1).values.reshape(-1, 28, 28).astype(np.float32) / 255.0
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.15, random_state=42, stratify=y_train)
    X_train = np.expand_dims(X_train, axis=-1)
    X_val = np.expand_dims(X_val, axis=-1)
    X_test = np.expand_dims(X_test, axis=-1)
    for split_name, X, y in [("train", X_train, y_train), ("val", X_val, y_val), ("test", X_test, y_test)]:
        split_dir = PROCESSED_DIR / split_name
        split_dir.mkdir(parents=True, exist_ok=True)
        np.save(split_dir / "images.npy", X)
        np.save(split_dir / "labels.npy", y)
    classes = [chr(i) for i in range(65, 91) if chr(i) not in ['J', 'Z']]
    with open(PROCESSED_DIR / "classes.txt", "w") as f:
        for idx, name in enumerate(classes):
            f.write(f"{idx},{name}\n")
    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

if __name__ == "__main__":
    preprocess_dataset()
