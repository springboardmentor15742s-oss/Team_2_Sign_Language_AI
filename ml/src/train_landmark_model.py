"""
train_landmark_model.py
========================
Train a Random Forest classifier on normalized MediaPipe
hand-landmark features (63 values per sample).

Usage:
    python3 ml/src/train_landmark_model.py

Run from the repository root (SignSpeak-Final).
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


# ===========================================================
# PATHS
# ===========================================================

REPO_ROOT = Path(__file__).resolve().parents[2]

INPUT_CSV = REPO_ROOT / "ml" / "data" / "landmarks" / "landmark_samples.csv"

MODEL_OUTPUT = REPO_ROOT / "backend" / "models" / "landmark_random_forest.joblib"
ENCODER_OUTPUT = REPO_ROOT / "backend" / "models" / "landmark_label_encoder.joblib"

FEATURE_COLUMNS = [f"f{i}" for i in range(63)]


# ===========================================================
# MAIN
# ===========================================================

def main():
    print("=" * 60)
    print("SIGNSPEAK  —  Landmark Model Training")
    print("=" * 60)

    # ---- Load data ----

    if not INPUT_CSV.exists():
        print(f"\n❌  Training data not found: {INPUT_CSV}")
        print("    Collect landmark samples first via the Practice page.")
        return

    df = pd.read_csv(INPUT_CSV)
    print(f"\nLoaded {len(df)} samples from {INPUT_CSV}")

    if "label" not in df.columns:
        print("❌  CSV missing 'label' column.")
        return

    missing_features = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing_features:
        print(f"❌  CSV missing feature columns: {missing_features[:5]}...")
        return

    # Exclude dynamic motion signs (J and Z) from static single-frame landmark model
    motion_mask = df["label"].isin(["J", "Z"])
    if motion_mask.any():
        dropped_count = int(motion_mask.sum())
        print(f"\n⚠️  Excluding {dropped_count} samples of motion signs ('J', 'Z') from static classifier.")
        df = df[~motion_mask]

    # ---- Class summary ----

    class_counts = df["label"].value_counts()
    print("\nSamples per class:")
    for label, count in class_counts.items():
        print(f"  {label}: {count}")

    num_classes = len(class_counts)

    if num_classes < 2:
        print(f"\n❌  Need at least 2 classes to train a classifier.")
        print(f"    Currently only {num_classes} class(es): {list(class_counts.index)}")
        print("    Collect samples for more signs first.")
        return

    # ---- Prepare features and labels ----

    X = df[FEATURE_COLUMNS].values.astype(np.float32)
    y_raw = df["label"].values

    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)

    print(f"\nClasses: {list(encoder.classes_)}")
    print(f"Feature shape: {X.shape}")

    # ---- Split ----

    min_class_count = class_counts.min()

    if min_class_count >= 4:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.20,
            stratify=y,
            random_state=42,
        )
        print(f"\nStratified split: {len(X_train)} train / {len(X_test)} test")
    elif min_class_count >= 2:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.20,
            random_state=42,
        )
        print(f"\nRandom split (too few for stratified): {len(X_train)} train / {len(X_test)} test")
    else:
        print("\n⚠️  Very few samples. Training on all data (no test split).")
        X_train, y_train = X, y
        X_test, y_test = X, y

    # ---- Train ----

    print("\nTraining Random Forest...")

    model = RandomForestClassifier(
        n_estimators=350,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    # ---- Evaluate ----

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nValidation accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            y_pred,
            target_names=encoder.classes_,
            zero_division=0,
        )
    )

    # ---- Save ----

    MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_OUTPUT)
    joblib.dump(encoder, ENCODER_OUTPUT)

    print(f"Model saved:   {MODEL_OUTPUT}")
    print(f"Encoder saved: {ENCODER_OUTPUT}")
    print("\n✅  Training complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
