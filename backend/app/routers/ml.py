from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.ml_inference import predict_sign
from app.services.learning_intelligence import generate_learning_intelligence
from app.services.learning_plan import generate_learning_plan


router = APIRouter(
    prefix="/ml",
    tags=["ML & Learning Intelligence"],
)


# --------------------------------------------------
# LEARNING PLAN REQUEST
# --------------------------------------------------

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