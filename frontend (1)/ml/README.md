# SignSpeak ML

Machine Learning dataset preparation for the SignSpeak platform.

## Milestone 1 Deliverables

- Dataset download & organization
- Dataset exploration & documentation
- Preprocessing pipeline
- Train/validation/test splitting

## Datasets

| Dataset | Type | Classes | Description |
|---------|------|---------|-------------|
| ASL Alphabet | Images | 29 | Static ASL alphabet signs |
| Sign Language MNIST | Images | 24 | Grayscale sign language letters |
| WLASL | Videos | 2000+ | Word-level ASL videos |
| RWTH-PHOENIX | Videos | 1000+ | German sign language sentences |

## Folder Structure

```
ml/
├── datasets/
│   ├── asl_alphabet/
│   ├── sign_language_mnist/
│   ├── wlasl/
│   └── rwth_phoenix/
├── preprocessing/
├── notebooks/
├── utils/
└── models/
```

## Getting Started

```bash
pip install -r requirements.txt
python preprocessing/preprocess_all.py
```
