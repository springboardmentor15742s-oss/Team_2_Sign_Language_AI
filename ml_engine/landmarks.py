import cv2
import mediapipe as mp
import os
import pandas as pd

# Initialize MediaPipe Hand tracking
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

DATA_DIR = 'ml_engine/data/asl_alphabet_train/asl_alphabet_train'
data = []
labels = []

# Loop through each alphabet folder (A, B, C...)
for dir_ in os.listdir(DATA_DIR):
    print(f"Processing letter: {dir_}")
    # Limit to 100 images per letter for a quick first test
    for img_path in os.listdir(os.path.join(DATA_DIR, dir_))[:100]:
        img = cv2.imread(os.path.join(DATA_DIR, dir_, img_path))
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        results = hands.process(img_rgb)
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for i in range(21): # 21 hand points
                    x = hand_landmarks.landmark[i].x
                    y = hand_landmarks.landmark[i].y
                    landmarks.append(x)
                    landmarks.append(y)
                data.append(landmarks)
                labels.append(dir_)

# Save to CSV
df = pd.DataFrame(data)
df['label'] = labels
import os
if not os.path.exists('ml_engine/data'):
    os.makedirs('ml_engine/data')

df.to_csv('ml_engine/data/landmarks.csv', index=False)
print("Landmarks extracted and saved to landmarks.csv!")