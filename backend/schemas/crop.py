from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DiseaseSummary(BaseModel):
    id: str
    name: str
    model_class: str
    is_healthy: bool
    severity: str


class CropResponse(BaseModel):
    id: str
    name: str
    common_names: List[str] = Field(default_factory=list)
    category: str = "Vegetable"
    scientific_name: Optional[str] = None
    icon: Optional[str] = "🌱"
    description: str
    ai_supported: bool = False
    supported_by_ai: bool = False  # Backward-compatible alias
    is_active: bool = True
    supported_conditions_count: Optional[int] = 0
    common_diseases: List[str] = Field(default_factory=list)
    health_indicators: List[str] = Field(default_factory=list)


class CropDetailResponse(CropResponse):
    supported_diseases: List[DiseaseSummary] = Field(default_factory=list)
    growing_season: Optional[str] = None
    soil_requirements: Optional[str] = None
