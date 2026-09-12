import cv2
import mediapipe as mp
import os
import pandas as pd

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

# Point to your images
DATA_DIR = 'ml_engine/data/asl_alphabet_train/asl_alphabet_train'
data = []
labels = []

if not os.path.exists(DATA_DIR):
    print(f"Error: {DATA_DIR} not found. Check your folder structure!")
else:
    for dir_ in os.listdir(DATA_DIR):
        print(f"Processing: {dir_}")
        for img_path in os.listdir(os.path.join(DATA_DIR, dir_)):
            img = cv2.imread(os.path.join(DATA_DIR, dir_, img_path))
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    landmarks = []
                    for i in range(21):
                        landmarks.append(hand_landmarks.landmark[i].x)
                        landmarks.append(hand_landmarks.landmark[i].y)
                    data.append(landmarks)
                    labels.append(dir_)

    df = pd.DataFrame(data)
    df['label'] = labels
    df.to_csv('ml_engine/data/landmarks.csv', index=False)
    print("✅ Landmarks saved to ml_engine/data/landmarks.csv")