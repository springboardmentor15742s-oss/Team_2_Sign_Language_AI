
# Detailed Dataset Structural Analysis

A. ASL Alphabet Dataset (Static Images)
Directory Layout: Organized in a flat directory hierarchy where each subdirectory behaves as a discrete label[1]:

asl_alphabet_train/
├── A/ (3,000 images, e.g., A1.jpg, A2.jpg...)
├── B/ (3,000 images)
...
└── NOTHING/ (3,000 background-only baseline images)

Class Mapping & Vocabulary: Features 29 distinct classes consisting of[1]:
26 alphabetic characters (A–Z)[1].
3 operational baseline states: SPACE (adds spaces between words), DELETE (removes the last parsed character), and NOTHING (for neutral/resting hands when no gesture is detected)[8].
Data Dimensions: Captured as 200 × 200 pixel RGB images[1] containing diverse lighting and background variations[9].

B. Sign Language MNIST Dataset (Tabular Format)
Data Representation: Rather than individual raw image files, this dataset is flattened and stored in a database-friendly .csv format[2].

label: An integer range from 0 to 25 matching alphabetic characters A to Z

pixels (1 to 784): Flattened representations of a 28×28 pixel grayscale matrix[2]. Individual integer values range from 0(pure black) to 255(pure white)[2].
Class Constraints: Contains only 24 active classes[2].
Note on missing indices: Class 9 (J) and Class 25 (Z) are excluded because they require dynamic motion, which cannot be captured in a single flat grayscale frame[2].

C. WLASL (Word-Level American Sign Language) Dataset
Data Representation: A collection of short video files (.mp4) accompanied by an index metadata catalog (WLASL_v0.3.json)[5][10].
File Structure:
wlasl_dataset/
├── WLASL_v0.3.json
└── videos/
    ├── 00001.mp4
    ├── 51068.mp4
    └── ...

D. RWTH-PHOENIX-Weather 2014 Dataset (Continuous Translation)
Data Representation: This dataset captures continuous sentences rather than isolated gestures[7]. To make video processing easier, the dynamic video sequences are broken down and stored as folders of sequential frame images [10].
Structural Layout:
For your project documentation or report under Milestone 1: Explore Dataset
Structure, you should write a structured technical summary [12]. Reviewers (such
as those evaluating Capstone or enterprise training projects) expect a formal
analysis of the data formats, label mappings, and preprocessing steps required
before training [12].

You can directly copy, paste, or adapt the following structured Dataset
Exploration & Analysis Report for your project documentation, README file, or
submission report:

Dataset Exploration & Analysis Report

1. Executive Summary of Datasets

To support a robust hybrid engine capable of handling both static sign
classification (fingerspelling) and dynamic sequence translation (continuous
movements) [9, 10], the platform integrates four primary datasets. Below is a
structural summary of these datasets:

| Dataset Name            | Modality            | Total Samples   | Unique Classes | Resolution / Format                                                   | Primary Purpose                               |
| :---------------------- | :------------------ | :-------------- | :------------- | :-------------------------------------------------------------------- | :-------------------------------------------- |
| **ASL Alphabet**        | Color Images        | 87,000          | 29             | $200 \times 200$ px (RGB)                                             | High-fidelity static letter recognition \[9\] |
| **Sign Language MNIST** | Tabular / Grayscale | 34,627          | 24             | $28 \times 28$ px (Grayscale)                                         | Lightweight benchmarking of static signs      |
| **WLASL**               | Dynamic Video       | \~12,000 clips  | 2,000 words    | Variable MP4 files + JSON index                                       | Word-level dynamic sign classification \[10\] |
| **RWTH-PHOENIX 2014**   | Sequential Frames   | 6,861 sentences | 1,558 glosses  | Video directories of sequential `.png` frames + alignment CSVs \[10\] | Continuous sign language translation          |

2. Detailed Dataset Structural Analysis

A. ASL Alphabet Dataset (Static Images)

  - Directory Layout: Organized in a flat directory hierarchy where each
    subdirectory behaves as a discrete label:
    asl_alphabet_train/
    ├── A/ (3,000 images, e.g., A1.jpg, A2.jpg...)
    ├── B/ (3,000 images)
    ...
    └── NOTHING/ (3,000 background-only baseline images)
  - Class Mapping & Vocabulary: Features 29 distinct classes consisting of:
      - 26 alphabetic characters (A–Z).
      - 3 operational baseline states: SPACE (adds spaces between words), DELETE
        (removes the last parsed character), and NOTHING (for neutral/resting
        hands when no gesture is detected).
  - Data Dimensions: Captured as 200 \times 200 pixel RGB images containing
    diverse lighting and background variations.

B. Sign Language MNIST Dataset (Tabular Format)

  - Data Representation: Rather than individual raw image files, this dataset is
    flattened and stored in a database-friendly .csv format.
  - Row-Level Schema:
    \text{Row Vector} = [ \text{label}, \text{pixel}_1, \text{pixel}_2, \dots, \text{pixel}_{784} ]
      - label: An integer range from 0 to 25 matching alphabetic characters A to
        Z.
      - pixels (1 to 784): Flattened representations of a 28 \times 28 pixel
        grayscale matrix. Individual integer values range from 0 (pure black) to
        255 (pure white).
  - Class Constraints: Contains only 24 active classes.
      - Note on missing indices: Class 9 (J) and Class 25 (Z) are excluded
        because they require dynamic motion, which cannot be captured in a
        single flat grayscale frame.

C. WLASL (Word-Level American Sign Language) Dataset

  - Data Representation: A collection of short video files (.mp4) accompanied by
    an index metadata catalog (WLASL_v0.3.json).
  - File Structure:
    wlasl_dataset/
    ├── WLASL_v0.3.json
    └── videos/
        ├── 00001.mp4
        ├── 51068.mp4
        └── ...
  - JSON Metadata Schema: The metadata JSON file associates multiple human
    performances with individual glosses. Each dictionary node is structured as
    follows:
    {
      "gloss": "book",
      "instances": [
        {
          "bbox": [55, 110, 412, 600],
          "frame_start": 1,
          "frame_end": -1,
          "instance_id": 0,
          "signer_id": 1,
          "video_id": "00001",
          "split": "train"
        }
      ]
    }
      - gloss: The target vocabulary word (label).
      - video_id: The name of the file in the physical video directory.
      - bbox: Coordinates defining a bounding box around the signer.
      - frame_start / frame_end: Tells the loader where the target sign starts
        and ends in the video clip, allowing you to crop out useless frames.
      - split: Specifies whether the video belongs to the train, val, or test
        subset.

D. RWTH-PHOENIX-Weather 2014 Dataset (Continuous Translation)

  - Data Representation: This dataset captures continuous sentences rather than
    isolated gestures. To make video processing easier, the dynamic video
    sequences are broken down and stored as folders of sequential frame images
    [10].
  - Structural Layout:
    phoenix2014-release/
    ├── phoenix2014-multisigner/
    │   ├── atlas/ (Corpus details & signer definitions)
    │   └── features/
    │       └── fullFrame-210x260px/
    │           ├── train/
    │           │   ├── 01August_2011_Monday_heute_default-0/
    │           │   │   ├── 01August_2011_Monday_heute_default-0_0001.png
    │           │   │   ├── 01August_2011_Monday_heute_default-0_0002.png
    │           │   │   └── ...
  - Sentence and Gloss Alignment Schema: Each image directory is linked to a
    target phrase in a parallel text file:
      - Text target: Spoken translation (e.g., "heute abend gewitter" / "storms
        this evening").
      - Gloss sequence: The exact order in which signs were performed (e.g.,
        HEUTE \rightarrow ABEND \rightarrow GEWITTER).

3. Structural Data Anomalies & Pipeline Recommendations

During dataset exploration, several anomalies were identified that need to be
addressed in the data preprocessing pipeline:

1.  J & Z Gap in Static Modalities: Static models trained on Sign Language MNIST
    cannot predict J or Z.
      - Pipeline Fix: If the model detects a static sign, it uses the static
        pipeline. If it detects a dynamic gesture, it routes the input to the
        sequence classifier [4].
2.  Dimension Discrepancies: Image inputs range from low-resolution 28 \times 28
    grayscale pixels to high-resolution 200 \times 200 RGB images.
      - Pipeline Fix: Crop the hand region of interest (ROI) using MediaPipe
        Hands and extract coordinates as standard numerical landmark vectors.
        This converts varying image sizes into a uniform, lightweight input
        format.
3.  Temporal Inconsistencies: Dynamic signs in WLASL have different frame
    lengths (ranging from 10 to over 150 frames per video).
      - Pipeline Fix: Implement frame interpolation or sequence padding to
        normalize inputs before passing them to the sequence-tracking model
        (LSTM/Transformer).

