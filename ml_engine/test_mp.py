import mediapipe as mp
import os
print("Mediapipe Version:", mp.__version__)
print("Imported from:", mp.__file__) # THIS LINE IS KEY
print("Solutions found:", hasattr(mp, 'solutions'))