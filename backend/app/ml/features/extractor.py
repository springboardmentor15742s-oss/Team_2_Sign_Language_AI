from typing import List, Union
import numpy as np


class FeatureExtractor:
    """
    Extracts a deterministic numerical feature vector from normalized 21-point 3D hand landmarks.
    Produces an 83-dimensional feature array:
      - 63 values: normalized (x, y, z) for 21 points
      - 10 values: pairwise Euclidean key landmark distances (wrist-to-tips, tip-to-tip)
      - 5 values: finger joint angles (thumb, index, middle, ring, pinky)
      - 5 values: finger extension ratios relative to hand span
    """

    def extract_features(self, landmarks: Union[List[List[float]], np.ndarray]) -> np.ndarray:
        pts = np.array(landmarks, dtype=np.float32)

        if pts.shape != (21, 3):
            # Safe padding/truncation to (21, 3)
            padded = np.zeros((21, 3), dtype=np.float32)
            if pts.ndim == 2:
                r, c = pts.shape
                padded[:min(r, 21), :min(c, 3)] = pts[:min(r, 21), :min(c, 3)]
            pts = padded

        # 1. Normalized Coordinates (63 features)
        coord_features = pts.flatten()

        # 2. Pairwise Key Landmark Distances (10 features)
        wrist = pts[0]
        tips = [pts[4], pts[8], pts[12], pts[16], pts[20]]

        wrist_to_tip_dists = [float(np.linalg.norm(t - wrist)) for t in tips]
        adjacent_tip_dists = [
            float(np.linalg.norm(tips[i] - tips[i + 1])) for i in range(len(tips) - 1)
        ]
        distance_features = np.array(wrist_to_tip_dists + adjacent_tip_dists, dtype=np.float32)

        # 3. Finger Joint Angles (5 features)
        # Finger MCP-PIP-TIP triplets
        finger_triplets = [
            (1, 2, 4),   # Thumb
            (5, 6, 8),   # Index
            (9, 10, 12),  # Middle
            (13, 14, 16), # Ring
            (17, 18, 20)  # Pinky
        ]

        angles = []
        for p1_idx, p2_idx, p3_idx in finger_triplets:
            v1 = pts[p1_idx] - pts[p2_idx]
            v2 = pts[p3_idx] - pts[p2_idx]

            norm1 = np.linalg.norm(v1)
            norm2 = np.linalg.norm(v2)

            if norm1 < 1e-7 or norm2 < 1e-7:
                angles.append(0.0)
            else:
                cos_angle = np.dot(v1, v2) / (norm1 * norm2)
                cos_angle = np.clip(cos_angle, -1.0, 1.0)
                angle_rad = np.arccos(cos_angle)
                angles.append(float(angle_rad))

        angle_features = np.array(angles, dtype=np.float32)

        # 4. Finger Extension Ratios (5 features)
        # Ratio of (wrist-to-tip distance) / (wrist-to-MCP distance)
        mcps = [pts[1], pts[5], pts[9], pts[13], pts[17]]
        extensions = []
        for tip, mcp in zip(tips, mcps):
            mcp_dist = np.linalg.norm(mcp - wrist)
            tip_dist = np.linalg.norm(tip - wrist)
            ratio = (tip_dist / (mcp_dist + 1e-7)) if mcp_dist >= 1e-7 else 1.0
            extensions.append(float(ratio))

        extension_features = np.array(extensions, dtype=np.float32)

        # Concatenate all features into a 1D vector (63 + 10 + 5 + 5 = 83 features)
        feature_vector = np.concatenate([
            coord_features,
            distance_features,
            angle_features,
            extension_features,
        ])

        return feature_vector
