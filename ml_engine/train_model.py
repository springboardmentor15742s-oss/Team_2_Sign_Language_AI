import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os
import pickle

# 1. Load the data
df = pd.read_csv('ml_engine/data/landmarks.csv')
X = df.drop('label', axis=1)
y = df['label']

# 2. Split into Training and Testing
x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True, stratify=y)

# 3. Train the Model
print("Training model... please wait.")
model = RandomForestClassifier()
model.fit(x_train, y_train)

# 4. Check Accuracy
y_predict = model.predict(x_test)
score = accuracy_score(y_predict, y_test)
print(f'{score * 100:.2f}% of signs were classified correctly!')

# 5. Save the model correctly
model_dir = 'ml_engine/models'
model_path = os.path.join(model_dir, 'asl_model.p')

# Create the folder if it doesn't exist
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

# Save the model AND the data structure
with open(model_path, 'wb') as f:
    pickle.dump({'model': model}, f)

print(f"Model successfully saved to {model_path}!")