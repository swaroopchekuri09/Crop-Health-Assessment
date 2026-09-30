from fastapi import APIRouter, HTTPException, status
from schemas.recommendation import RecommendationResponse
from services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{disease_id}", response_model=RecommendationResponse)
def get_recommendation(disease_id: str):
    rec = RecommendationService.get_by_disease_id(disease_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendations for disease ID '{disease_id}' were not found."
        )
    return rec
