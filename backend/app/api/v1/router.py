from fastapi import APIRouter
from app.api.v1.health import router as health_router

api_v1_router = APIRouter()

# Include versioned routers
api_v1_router.include_router(health_router)

# Future Phase 2+ Module Routers will be registered here:
# api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# api_v1_router.include_router(profile_router, prefix="/profile", tags=["Learner Profile"])
# api_v1_router.include_router(courses_router, prefix="/courses", tags=["Courses"])
# api_v1_router.include_router(gesture_router, prefix="/gesture-recognition", tags=["AI Gesture Recognition"])
# api_v1_router.include_router(assessments_router, prefix="/assessments", tags=["Assessments"])
# api_v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboards"])
