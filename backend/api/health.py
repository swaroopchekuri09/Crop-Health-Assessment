from fastapi import APIRouter
from database.connection import check_db_health
from ai.model_loader import get_model_status

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("")
def general_health():
    db_status = check_db_health()
    ai_status = get_model_status()
    overall = "ok" if db_status["connected"] and ai_status["model_loaded"] else "degraded"
    return {
        "status": overall,
        "service": "Crop Health Assessment & Recommendation API",
        "database": db_status["status"],
        "ai_model": ai_status["status"]
    }


@router.get("/database")
def database_health():
    return check_db_health()


@router.get("/ai")
def ai_health():
    return get_model_status()
