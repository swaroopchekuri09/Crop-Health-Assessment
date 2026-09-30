from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RecommendationResponse(BaseModel):
    id: Optional[str] = None
    disease_id: str
    disease_name: Optional[str] = None
    is_healthy: bool = False
    symptoms: List[str] = []
    causes: List[str] = []
    severity: str = "medium"
    management: List[str] = []
    prevention: List[str] = []
    precautions: List[str] = []
    fertilizer_guidance: List[str] = []
    pesticide_guidance: List[str] = []
    disclaimer: str = "Guidance provided is for educational and advisory purposes only. Always inspect chemical product labels and consult local agricultural extension officers before application."
