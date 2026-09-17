
# SignSpeak — Computer Vision & Gesture Recognition Engine (`gesture_engine.py`)
**Infosys Springboard Internship 7.0 — Team 2**  
**Module:** Gesture Recognition & Pose Tracking (Modules 4, 5, 6, 7)  
**File:** `backend/gesture_engine.py`

---

## 1. Module Overview

`gesture_engine.py` contains the primary intelligent processing logic of the platform. It extracts 3D hand landmarks using Google MediaPipe Hands, applies scale and translation normalization, performs physical finger-joint flexion analysis, and returns anatomical feedback hints for posture correction.

---

## 2. Mathematical Pipeline

[Raw Frame] ──▶ [MediaPipe Hands] ──▶ 21 Coordinates (x, y, z)
│
▼
[Origin Centering] (Wrist L0 becomes 0,0,0)
│
▼
[Scale Normalization] (Divide by max Euclidean distance)
│
▼
[Finger State Analysis] ──▶ Anatomical Rules & Distance Ratios
│
▼
[Output: Label, Confidence, Hints]

### 2.1 Geometric Invariance Transforms
1. **Translation Invariance:** The wrist coordinate ($L_0$) is subtracted from all 21 joints:
   $$\vec{P}'_i = \vec{P}_i - \vec{P}_0, \quad \forall i \in [0, 20]$$
2. **Scale Invariance:** Vectors are divided by the maximum Euclidean norm from the wrist:
   $$\vec{P}''_i = \frac{\vec{P}'_i}{\max_{j} \|\vec{P}'_j\|}$$
   This ensures that hand size or distance from the camera (from $30\text{ cm}$ to $1.5\text{ m}$) does not degrade accuracy.

---

## 3. Finger Flexion & Joint Extension Rules

Finger extension is evaluated by comparing distance from the wrist to fingertip vs. PIP joint:

$$\text{is\_extended}(F) = \|\text{Tip} - \text{Wrist}\| > \|\text{PIP} - \text{Wrist}\| \times 1.15$$

### Critical Ambiguity Handling:
* **Letter D vs. Letter W:**
  * **Letter D:** Index extended ($\text{Tip}_8 > \text{PIP}_6$), Middle/Ring/Pinky curled.
  * **Letter W:** Index, Middle, and Ring all extended simultaneously. If 3 fingers are raised, the engine explicitly outputs `W`, preventing false positives on `D`.
* **Letter M vs. Letter A / Fist:**
  * **Letter A:** Fist with thumb resting laterally beside the index finger.
  * **Letter M:** Thumb tip ($L_4$) tucked underneath the first three fingers, resting adjacent to the pinky base ($L_{17}$):
    $$\|\vec{L}_4 - \vec{L}_{17}\| < 0.14$$

---

## 4. Output Contract

The engine returns:
1. `prediction`: Recognized class string (`"A"`, `"B"`, `"D"`, `"W"`, etc.).
2. `confidence`: Numerical certainty between `0.00` and `1.00`.
3. `landmarks`: Normalized coordinate dictionary for frontend skeleton overlay rendering.
4. `hints`: Anatomical remediation strings (e.g., *"Tuck your thumb under the first three fingers"*).