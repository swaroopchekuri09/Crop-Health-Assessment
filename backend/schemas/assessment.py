from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from schemas.crop import CropResponse
from schemas.recommendation import RecommendationResponse


class PredictionDetail(BaseModel):
    condition: str
    model_class: str
    confidence: float
    confidence_level: str  # "high", "moderate", "low"
    is_healthy: bool
    top_3_predictions: Optional[List[Dict[str, Any]]] = None


class AssessmentCreate(BaseModel):
    crop_id: str
    image_source: str = "manual"  # "manual", "mobile", "drone"


class AssessmentResponse(BaseModel):
    id: str
    user_id: str
    crop: Optional[Dict[str, Any]] = None
    image_path: str
    image_source: str
    predicted_condition: Optional[str] = None
    confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    status: str  # healthy, disease_detected, low_confidence, invalid_image, model_unavailable
    disease_id: Optional[str] = None
    prediction: Optional[PredictionDetail] = None
    recommendation: Optional[RecommendationResponse] = None
    message: Optional[str] = None
    created_at: datetime


class AssessmentListItem(BaseModel):
    id: str
    crop_name: str
    condition: str
    confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    status: str
    image_path: str
    image_source: str
    created_at: datetime


class AssessmentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[AssessmentListItem]


class AssessmentStatsResponse(BaseModel):
    total_assessments: int
    healthy_count: int
    disease_detected_count: int
    low_confidence_count: int
    ai_supported_crops_count: int = 14
    total_crops_count: int = 68
    recent_assessments: List[AssessmentListItem]
