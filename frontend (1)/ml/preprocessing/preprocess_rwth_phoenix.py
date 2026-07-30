"""RWTH-PHOENIX-2014T Dataset Preprocessing."""
from pathlib import Path

DATASET_DIR = Path("ml/datasets/rwth_phoenix")
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"

def explore_dataset():
    annotations = RAW_DIR / "phoenix-2014-T.annotations.manual"
    if not annotations.exists():
        print(f"Annotations not found at {annotations}")
        return
    with open(annotations, 'r') as f:
        lines = f.readlines()
    print(f"Total annotation lines: {len(lines)}")
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROCESSED_DIR / "metadata.txt", "w") as f:
        f.write("RWTH-PHOENIX-2014T Dataset\nLanguage: German Sign Language (DGS)\nType: Continuous sign language recognition\n")

if __name__ == "__main__":
    explore_dataset()
