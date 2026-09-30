from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
from backend.database.collections import get_recommendations_collection


class RecommendationRepository:
    @staticmethod
    def find_by_disease_id(disease_id: str) -> Optional[Dict[str, Any]]:
        try:
            col = get_recommendations_collection()
            return col.find_one({"disease_id": ObjectId(disease_id)})
        except Exception:
            return None

    @staticmethod
    def upsert(
        disease_id: ObjectId,
        management: List[str],
        prevention: List[str],
        precautions: List[str],
        fertilizer_guidance: List[str],
        pesticide_guidance: List[str]
    ) -> Dict[str, Any]:
        col = get_recommendations_collection()
        now = datetime.now(timezone.utc)
        doc = col.find_one_and_update(
            {"disease_id": disease_id},
            {
                "$set": {
                    "disease_id": disease_id,
                    "management": management,
                    "prevention": prevention,
                    "precautions": precautions,
                    "fertilizer_guidance": fertilizer_guidance,
                    "pesticide_guidance": pesticide_guidance,
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True,
            return_document=True
        )
        return doc
