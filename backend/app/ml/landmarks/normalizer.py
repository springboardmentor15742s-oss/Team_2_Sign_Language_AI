from typing import List, Optional, Tuple, Dict, Any
import numpy as np


class LandmarkNormalizer:
    """
    Numerically safe, rotation-invariant landmark normalization module.
    Translates landmarks relative to the wrist (landmark 0),
    scales coordinates by the distance from wrist to middle finger MCP (landmark 9),
    and rotates coordinates so the wrist-to-middle-MCP axis points vertically straight up.
    """

    def __init__(self, reference_idx: int = 0, scale_idx: int = 9, eps: float = 1e-7):
        self.reference_idx = reference_idx
        self.scale_idx = scale_idx
        self.eps = eps

    def normalize(self, landmarks: List[List[float]]) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Normalizes a 21x2 or 21x3 landmark array.

        Returns:
            normalized_array: (21, D) numpy array of float32
            metadata: dict containing translation_origin, scale_factor, is_valid
        """
        if not landmarks or len(landmarks) == 0:
            return np.zeros((21, 3), dtype=np.float32), {
                "is_valid": False,
                "reason": "Empty landmarks input",
                "scale_factor": 0.0,
            }

        pts = np.array(landmarks, dtype=np.float32)
        if pts.ndim != 2 or pts.shape[0] != 21:
            if pts.shape[0] < 21:
                padded = np.zeros((21, pts.shape[1] if pts.ndim == 2 else 3), dtype=np.float32)
                padded[:pts.shape[0]] = pts
                pts = padded
            else:
                pts = pts[:21]

        # Ensure 3D (x, y, z)
        if pts.shape[1] == 2:
            z_col = np.zeros((21, 1), dtype=np.float32)
            pts = np.hstack([pts, z_col])
        elif pts.shape[1] > 3:
            pts = pts[:, :3]

        pts = np.nan_to_num(pts, nan=0.0, posinf=0.0, neginf=0.0)

        # 1. Translation Normalization (Wrist landmark 0 as origin)
        origin = pts[self.reference_idx].copy()
        translated = pts - origin

        # 2. Scale Normalization (Distance from wrist 0 to middle MCP 9)
        scale = np.linalg.norm(translated[self.scale_idx])
        if scale < self.eps:
            bbox_span = np.max(np.abs(translated))
            scale = bbox_span if bbox_span >= self.eps else 1.0

        scale_factor = float(scale)
        normalized = translated / (scale_factor + self.eps)

        # 3. Rotation Normalization (Align Wrist-to-Middle-MCP vector straight UP: -90 deg / -pi/2)
        dx = float(normalized[self.scale_idx, 0])
        dy = float(normalized[self.scale_idx, 1])
        current_angle = np.arctan2(dy, dx)
        target_angle = -np.pi / 2.0  # Pointing straight up in image coordinates (-y)
        angle_diff = target_angle - current_angle

        cos_a = float(np.cos(angle_diff))
        sin_a = float(np.sin(angle_diff))
        rotation_matrix = np.array([
            [cos_a, -sin_a, 0.0],
            [sin_a,  cos_a, 0.0],
            [0.0,    0.0,   1.0]
        ], dtype=np.float32)

        normalized = np.dot(normalized, rotation_matrix.T)

        return normalized, {
            "is_valid": True,
            "translation_origin": origin.tolist(),
            "scale_factor": scale_factor,
            "rotation_angle_deg": float(np.degrees(angle_diff)),
        }
