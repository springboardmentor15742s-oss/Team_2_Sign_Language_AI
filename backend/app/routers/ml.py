from typing import List
from pathlib import Path
import csv

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.ml_inference import predict_sign
from app.services.landmark_inference import predict_landmarks
from app.services.learning_intelligence import generate_learning_intelligence
from app.services.learning_plan import generate_learning_plan


router = APIRouter(
    prefix="/ml",
    tags=["ML & Learning Intelligence"],
)


# --------------------------------------------------
# LEARNING PLAN REQUEST
# --------------------------------------------------



class LandmarkPredictionRequest(BaseModel):
    features: List[float]


class LandmarkCollectionRequest(BaseModel):
    label: str
    samples: List[List[float]]

class LearningPlanRequest(BaseModel):
    accuracy: float
    weak_signs: List[str]
    strong_signs: List[str]
    total_attempts: int


# --------------------------------------------------
# SIGN PREDICTION + AI FEEDBACK
# --------------------------------------------------

@router.post("/predict")
async def predict_asl_sign(
    file: UploadFile = File(...)
):
    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty",
            )

        prediction = predict_sign(image_bytes)

        intelligence = generate_learning_intelligence(
            predicted_sign=prediction["predicted_sign"],
            confidence=prediction["confidence"],
        )

        return {
            "status": "success",
            "filename": file.filename,
            **prediction,
            **intelligence,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        )


# --------------------------------------------------
# PERSONALIZED LEARNING PLAN
# --------------------------------------------------

@router.post("/learning-plan")
def create_learning_plan(
    request: LearningPlanRequest
):
    try:
        plan = generate_learning_plan(
            accuracy=request.accuracy,
            weak_signs=request.weak_signs,
            strong_signs=request.strong_signs,
            total_attempts=request.total_attempts,
        )

        return {
            "status": "success",
            "learning_plan": plan,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Learning plan generation failed: {str(exc)}",
        )

# --------------------------------------------------
# LANDMARK SAMPLE COLLECTION
# --------------------------------------------------

@router.post("/landmarks/collect")
def collect_landmark_samples(
    request: LandmarkCollectionRequest
):
    label = request.label.strip().upper()

    if not label:
        raise HTTPException(
            status_code=400,
            detail="Sign label is required",
        )

    if not request.samples:
        raise HTTPException(
            status_code=400,
            detail="No landmark samples supplied",
        )

    for sample in request.samples:
        if len(sample) != 63:
            raise HTTPException(
                status_code=400,
                detail="Each sample must contain exactly 63 landmark values",
            )

    repo_root = (
        Path(__file__)
        .resolve()
        .parents[3]
    )

    output_dir = (
        repo_root
        / "ml"
        / "data"
        / "landmarks"
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = (
        output_dir
        / "landmark_samples.csv"
    )

    file_exists = output_file.exists()

    with output_file.open(
        "a",
        newline="",
        encoding="utf-8",
    ) as handle:

        writer = csv.writer(handle)

        if not file_exists:
            writer.writerow(
                [
                    "label",
                    *[
                        f"f{i}"
                        for i in range(63)
                    ],
                ]
            )

        for sample in request.samples:
            writer.writerow(
                [
                    label,
                    *sample,
                ]
            )

    return {
        "status": "success",
        "label": label,
        "samples_saved":
            len(request.samples),
        "file":
            str(output_file),
    }


# --------------------------------------------------
# LANDMARK PREDICTION
# --------------------------------------------------

@router.post("/predict-landmarks")
def predict_sign_landmarks(
    request: LandmarkPredictionRequest
):
    try:
        prediction = predict_landmarks(
            request.features
        )

        return {
            "status": "success",
            **prediction,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Landmark prediction failed: "
                f"{str(exc)}"
            ),
        )
