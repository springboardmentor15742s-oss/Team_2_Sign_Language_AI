import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Numeric ID to Letter Map (Excludes 'J' at index 9 and 'Z' at index 25)
LABEL_MAP = {i: chr(65 + i) for i in range(26)}

def analyze_mnist_csv(csv_file_path):
    print("=== Analyzing Sign Language MNIST CSV ===")
    try:
        df = pd.read_csv(csv_file_path)
    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_file_path}")
        return

    print(f"Rows (Samples): {df.shape[0]}")
    print(f"Columns (Features): {df.shape[1]}")
    
    # Check for null values
    null_count = df.isnull().sum().sum()
    print(f"Missing Values: {null_count}")

    # Inspect class distributions
    class_distributions = df['label'].value_counts().sort_index()
    print("\nSamples per class:")
    for label, count in class_distributions.items():
        print(f"  Class {label} ({LABEL_MAP.get(label, '?')}): {count} samples")

    # Reconstruct and visualize a 2x4 grid of random rows
    fig, axes = plt.subplots(2, 4, figsize=(10, 5))
    random_indices = np.random.choice(df.index, size=8, replace=False)

    for idx, ax in zip(random_indices, axes.ravel()):
        row = df.iloc[idx]
        label_id = int(row['label'])
        letter = LABEL_MAP.get(label_id, '?')
        
        # Drop the label and reshape the remaining 784 pixels to a 28x28 matrix
        pixels = row.drop('label').values.astype(np.uint8).reshape(28, 28)
        
        ax.imshow(pixels, cmap='gray')
        ax.set_title(f"Label: {letter} (ID: {label_id})")
        ax.axis('off')

    plt.tight_layout()
    plt.show()

# Run the analysis
analyze_mnist_csv("../datasets/sign_mnist/sign_mnist_train.csv")