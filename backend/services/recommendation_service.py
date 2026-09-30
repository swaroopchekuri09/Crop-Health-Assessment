from typing import Optional, Dict, Any
from backend.repositories.recommendation_repository import RecommendationRepository
from backend.repositories.disease_repository import DiseaseRepository


class RecommendationService:
    @staticmethod
    def get_by_disease_id(disease_id: str) -> Optional[Dict[str, Any]]:
        rec = RecommendationRepository.find_by_disease_id(disease_id)
        if not rec:
            return None
        
        disease = DiseaseRepository.find_by_id(disease_id)
        disease_name = disease["name"] if disease else "Unknown Condition"
        is_healthy = disease.get("is_healthy", False) if disease else False
        symptoms = disease.get("symptoms", []) if disease else []
        causes = disease.get("causes", []) if disease else []
        severity = disease.get("severity", "medium") if disease else "medium"

        return {
            "id": str(rec["_id"]),
            "disease_id": str(rec["disease_id"]),
            "disease_name": disease_name,
            "is_healthy": is_healthy,
            "symptoms": symptoms,
            "causes": causes,
            "severity": severity,
            "management": rec.get("management", []),
            "prevention": rec.get("prevention", []),
            "precautions": rec.get("precautions", []),
            "fertilizer_guidance": rec.get("fertilizer_guidance", []),
            "pesticide_guidance": rec.get("pesticide_guidance", []),
            "disclaimer": "Guidance provided is for educational and advisory purposes only. Always inspect chemical product labels and consult local agricultural extension officers before application."
        }
