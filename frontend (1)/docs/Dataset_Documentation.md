# Dataset Documentation

## 1. ASL Alphabet Dataset

**Source:** [Kaggle - ASL Alphabet](https://www.kaggle.com/datasets/grassknoted/asl-alphabet)

| Attribute | Value |
|-----------|-------|
| Type | Static Images |
| Classes | 29 (A-Z + space + delete + nothing) |
| Format | JPG |
| Size | 200x200 pixels |
| Total Images | ~87,000 |

## 2. Sign Language MNIST

**Source:** [Kaggle - Sign Language MNIST](https://www.kaggle.com/datasets/datamunge/sign-language-mnist)

| Attribute | Value |
|-----------|-------|
| Type | Grayscale Images |
| Classes | 24 (A-Y, excluding J and Z) |
| Format | CSV |
| Size | 28x28 pixels |
| Total Images | ~34,000 |

## 3. WLASL (Word-Level ASL)

**Source:** [WLASL Project](https://dxli94.github.io/WLASL/)

| Attribute | Value |
|-----------|-------|
| Type | Videos |
| Classes | 2,000+ word glosses |
| Format | MP4 |
| Total Videos | 21,000+ |

## 4. RWTH-PHOENIX-2014T

**Source:** [RWTH-PHOENIX](https://www-i6.informatik.rwth-aachen.de/~koller/RWTH-PHOENIX-2014-T/)

| Attribute | Value |
|-----------|-------|
| Type | Videos |
| Language | German Sign Language (DGS) |
| Format | AVI/MP4 |

## Preprocessing Pipeline

1. Download datasets into `ml/datasets/<name>/raw/`
2. Explore structure, labels, and quality
3. Resize images to standard dimensions
4. Normalize pixel values to [0, 1]
5. Encode labels as integers
6. Split into train/validation/test sets
7. Save as numpy arrays

## Usage

```bash
cd ml
pip install -r requirements.txt
python preprocessing/preprocess_all.py
```
