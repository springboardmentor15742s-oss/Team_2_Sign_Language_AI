import os
import random
import cv2
import matplotlib.pyplot as plt


def analyze_asl_alphabet(data_path):
    print("=" * 60)
    print("        ASL ALPHABET DATASET ANALYSIS")
    print("=" * 60)

    # Print absolute path
    print(f"\nDataset Path:\n{os.path.abspath(data_path)}")

    # Check if path exists
    if not os.path.exists(data_path):
        print(f"\n❌ Error: Path '{data_path}' does not exist.")
        return

    # Find all class folders
    classes = sorted([
        d for d in os.listdir(data_path)
        if os.path.isdir(os.path.join(data_path, d))
    ])

    print(f"\n✅ Total Classes Found : {len(classes)}")

    print("\nClasses:")
    print(", ".join(classes))

    class_counts = {}
    sample_images = {}

    # Count images in every class
    for cls in classes:

        class_dir = os.path.join(data_path, cls)

        files = [
            f for f in os.listdir(class_dir)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ]

        class_counts[cls] = len(files)

        if files:
            sample_images[cls] = os.path.join(
                class_dir,
                random.choice(files)
            )

    print("\n" + "=" * 60)
    print("Images Per Class")
    print("=" * 60)

    for cls, count in class_counts.items():
        print(f"{cls:<12} : {count}")

    total_images = sum(class_counts.values())

    print("\n" + "=" * 60)
    print(f"Total Images : {total_images}")
    print("=" * 60)

    # Class balance
    min_class = min(class_counts, key=class_counts.get)
    max_class = max(class_counts, key=class_counts.get)

    print("\nClass Balance")

    print(f"Minimum Images : {min_class} ({class_counts[min_class]})")
    print(f"Maximum Images : {max_class} ({class_counts[max_class]})")

    # -----------------------------
    # Display Random Sample Images
    # -----------------------------
    selected_classes = random.sample(classes, min(6, len(classes)))

    fig, axes = plt.subplots(2, 3, figsize=(12, 8))

    for i, cls in enumerate(selected_classes):

        ax = axes[i // 3][i % 3]

        img_path = sample_images[cls]

        img = cv2.imread(img_path)

        if img is None:
            print(f"Cannot read image: {img_path}")
            continue

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        ax.imshow(img)

        ax.set_title(
            f"{cls}\n{img.shape[1]} x {img.shape[0]}"
        )

        ax.axis("off")

    plt.suptitle(
        "Sample Images from ASL Alphabet Dataset",
        fontsize=16
    )

    plt.tight_layout()

    # Save image
    plt.savefig(
        "dataset_sample_images.png",
        dpi=300,
        bbox_inches="tight"
    )

    print("\n✅ Sample image saved as 'dataset_sample_images.png'")

    plt.show()

    print("\nDataset Analysis Completed Successfully.")


if __name__ == "__main__":

    DATASET_PATH = (
        "../dataset/sign-language-mnist/"
        "asl-alphabet/asl_alphabet_train"
    )

    analyze_asl_alphabet(DATASET_PATH)