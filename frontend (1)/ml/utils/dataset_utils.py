"""Utility functions for dataset handling."""
import numpy as np
from pathlib import Path
from typing import Tuple, List

def load_npy_dataset(dataset_dir: Path) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    train_images = np.load(dataset_dir / "train" / "images.npy")
    train_labels = np.load(dataset_dir / "train" / "labels.npy")
    val_images = np.load(dataset_dir / "val" / "images.npy")
    val_labels = np.load(dataset_dir / "val" / "labels.npy")
    test_images = np.load(dataset_dir / "test" / "images.npy")
    test_labels = np.load(dataset_dir / "test" / "labels.npy")
    return train_images, train_labels, val_images, val_labels, test_images, test_labels

def load_classes(dataset_dir: Path) -> List[str]:
    classes = []
    with open(dataset_dir / "classes.txt", "r") as f:
        for line in f:
            _, name = line.strip().split(",")
            classes.append(name)
    return classes
