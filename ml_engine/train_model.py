import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

# 1. Load data
df = pd.read_csv('ml_engine/data/landmarks.csv')
X = df.drop('label', axis=1)
y = df['label']

# 2. Train
x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True, stratify=y)
model = RandomForestClassifier()
model.fit(x_train, y_train)

# 3. Save
print(f"Accuracy: {accuracy_score(model.predict(x_test), y_test)*100:.2f}%")
with open('ml_engine/models/asl_model.p', 'wb') as f:
    pickle.dump({'model': model}, f)
print("✅ Model saved to ml_engine/models/asl_model.p")