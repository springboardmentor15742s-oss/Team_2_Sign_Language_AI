# Dataset Analysis Report

## Project

AI Powered Sign Language Learning & Assessment Platform

# 1. Introduction

The success of an AI-powered Sign Language Learning & Assessment Platform depends on the quality and suitability of the datasets used for training and evaluating the machine learning models. This project uses two primary datasets:

1. ASL Alphabet Dataset
2. Sign Language MNIST Dataset

Both datasets are analyzed based on their structure, labels, file formats, advantages, limitations, and suitability for sign language recognition.

# 2. Dataset Overview

|       Dataset        |        Type       |   Format  | Classes |      Purpose       |

| ASL Alphabet Dataset |    Image Dataset  | JPG Images| 29 | Alphabet Recognition |
| Sign Language MNIST  | Image Dataset(CSV)|   CSV     | 24 | Static Gesture Classification |


# 3. ASL Alphabet Dataset Analysis

## Dataset Name

ASL Alphabet Dataset

## Purpose

The ASL Alphabet Dataset is designed to train AI models to recognize American Sign Language (ASL) alphabet gestures. It is mainly used for image classification and real-time sign language recognition.

## Dataset Type

Image Dataset

## File Format

JPEG (.jpg)

## Dataset Structure

asl-alphabet/

├── asl_alphabet_train/
│   ├── A/
│   ├── B/
│   ├── C/
│   ├── D/
│   ├── E/
│   ├── F/
│   ├── G/
│   ├── H/
│   ├── I/
│   ├── J/
│   ├── K/
│   ├── L/
│   ├── M/
│   ├── N/
│   ├── O/
│   ├── P/
│   ├── Q/
│   ├── R/
│   ├── S/
│   ├── T/
│   ├── U/
│   ├── V/
│   ├── W/
│   ├── X/
│   ├── Y/
│   ├── Z/
│   ├── del/
│   ├── nothing/
│   └── space/
│
└── asl_alphabet_test/


## Dataset Labels

The dataset contains **29 classes**.

### Alphabet Labels

- A
- B
- C
- D
- E
- F
- G
- H
- I
- J
- K
- L
- M
- N
- O
- P
- Q
- R
- S
- T
- U
- V
- W
- X
- Y
- Z

### Additional Labels

- del
- nothing
- space

## Label Format

Each label is represented as an individual folder containing multiple JPEG images.

Example

A/

A_1.jpg

A_2.jpg

A_3.jpg


## Image Characteristics

- RGB Images
- Static Hand Gestures
- Organized into folders
- One folder per class
- Suitable for CNN-based classification


## Advantages

- Large image dataset
- Easy folder organization
- Real hand gesture images
- Suitable for deep learning
- High-quality training data
- Good for alphabet recognition


## Limitations

- Static gestures only
- Does not recognize continuous sign language
- No sentence-level recognition


# 4. Sign Language MNIST Dataset Analysis

## Dataset Name

Sign Language MNIST


## Purpose

The Sign Language MNIST dataset is used to train machine learning models for recognizing static hand gestures.

Unlike the ASL Alphabet Dataset, it stores images as numerical pixel values inside CSV files.


## Dataset Type

CSV Dataset


## Files

- sign_mnist_train.csv
- sign_mnist_test.csv


## File Format

CSV (Comma Separated Values)


## Dataset Structure

sign-mnist/

├── sign_mnist_train.csv

└── sign_mnist_test.csv


## Dataset Labels

The dataset contains **24 classes**.

Labels are represented as numeric values.

The letters **J** and **Z** are not included because these signs involve movement rather than static hand positions.


## Image Characteristics

- 28 × 28 pixels
- Grayscale Images
- One image per row
- Pixel values stored as numbers


## CSV Structure

The first column represents the label.

The remaining columns represent pixel values.

Example

| label | pixel1 | pixel2 | pixel3 | ... |

|   3   |   0    |    0   |   12   | ... |
|   7   |   0    |    4   |   10   | ... |


## Advantages

- Small and lightweight
- Easy to preprocess
- Standard benchmark dataset
- Faster training
- Suitable for experimentation


## Limitations

- Grayscale images
- Low image resolution
- Missing J and Z classes
- Static gestures only


# 5. Dataset Labels Comparison

|   Feature  | ASL Alphabet | Sign Language MNIST |

| Label Type | Folder Names | Numeric Labels |
| Classes | 29 | 24 |
| J Included | Yes | No |
| Z Included | Yes | No |
| Additional Labels | del, space, nothing | None |


# 6. Dataset Format Comparison

|    Feature     |   ASL Alphabet   | Sign Language MNIST |
| Storage Format | Folder Structure |     CSV File        |
|  Image Format  |       JPG        |    Pixel Values     |
|     Color      |       RGB        |      Grayscale      |
|   Image Size   |      Varies      |      28 × 28        |
| Training Ready |       Yes        | Requires CSV Processing |


# 7. Suitability Analysis

## ASL Alphabet Dataset

Suitable For

- Alphabet Recognition
- CNN Training
- Real-Time Gesture Recognition
- MediaPipe Integration
- Deep Learning Models

## Sign Language MNIST

Suitable For

- Machine Learning Experiments
- CNN Benchmark Testing
- Static Gesture Classification
- Educational Purposes

# 8. Dataset Advantages Comparison

| ASL Alphabet | Sign Language MNIST |
|--------------|---------------------|
| Real images | Lightweight |
| Better accuracy | Faster training |
| Large dataset | Standard benchmark |
| Easy folder organization | Easy preprocessing |


# 9. Dataset Limitations Comparison

| ASL Alphabet | Sign Language MNIST |
|--------------|---------------------|
| Static only | Static only |
| No sentence recognition | Low resolution |
| Larger storage | Missing J and Z |


# 10. Recommendation

After analyzing both datasets, the following conclusions were made:

- The **ASL Alphabet Dataset** is recommended as the primary dataset because it contains real RGB hand gesture images organized into 29 classes. It is well suited for training AI models for alphabet recognition and can be integrated with MediaPipe and deep learning frameworks.

- The **Sign Language MNIST Dataset** is recommended as a secondary dataset for benchmarking and experimentation. It is lightweight and useful for testing machine learning algorithms but is less suitable as the primary dataset because it contains grayscale images and excludes the letters J and Z.


# 11. Conclusion

Both datasets play an important role in the development of the AI Powered Sign Language Learning & Assessment Platform.

The ASL Alphabet Dataset will serve as the primary dataset for training the sign language recognition model, while the Sign Language MNIST Dataset will be used for experimentation and performance evaluation.

Using both datasets provides a strong foundation for building an accurate and efficient sign language recognition system.


# Prepared By

Infosys Springboard Virtual Internship 7.0

Team 2 – Sign Language AI