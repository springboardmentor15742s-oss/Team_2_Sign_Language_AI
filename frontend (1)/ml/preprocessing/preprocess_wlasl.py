"""WLASL Dataset Preprocessing."""
import json
from pathlib import Path

DATASET_DIR = Path("ml/datasets/wlasl")
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"

def explore_dataset():
    json_path = RAW_DIR / "WLASL_v0.3.json"
    if not json_path.exists():
        print(f"WLASL JSON not found at {json_path}")
        return
    with open(json_path, 'r') as f:
        data = json.load(f)
    print(f"Total glosses: {len(data)}")
    total_videos = sum(len(gloss.get('instances', [])) for gloss in data)
    print(f"Total video instances: {total_videos}")
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROCESSED_DIR / "metadata.json", "w") as f:
        json.dump({"num_classes": len(data), "total_videos": total_videos, "glosses": [g['gloss'] for g in data]}, f, indent=2)

if __name__ == "__main__":
    explore_dataset()
