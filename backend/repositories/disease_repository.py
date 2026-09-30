from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId
from database.collections import get_diseases_collection


class DiseaseRepository:
    @staticmethod
    def find_by_model_class(model_class: str) -> Optional[Dict[str, Any]]:
        col = get_diseases_collection()
        return col.find_one({"model_class": model_class})

    @staticmethod
    def find_by_id(disease_id: str) -> Optional[Dict[str, Any]]:
        try:
            col = get_diseases_collection()
            return col.find_one({"_id": ObjectId(disease_id)})
        except Exception:
            return None

    @staticmethod
    def find_by_crop_id(crop_id: str) -> List[Dict[str, Any]]:
        try:
            col = get_diseases_collection()
            return list(col.find({"crop_id": ObjectId(crop_id)}).sort("name", 1))
        except Exception:
            return []

    @staticmethod
    def upsert(
        crop_id: ObjectId,
        model_class: str,
        name: str,
        is_healthy: bool = False,
        severity: str = "medium",
        symptoms: Optional[List[str]] = None,
        causes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        col = get_diseases_collection()
        now = datetime.now(timezone.utc)
        doc = col.find_one_and_update(
            {"model_class": model_class},
            {
                "$set": {
                    "crop_id": crop_id,
                    "model_class": model_class,
                    "name": name,
                    "is_healthy": is_healthy,
                    "severity": severity,
                    "symptoms": symptoms or [],
                    "causes": causes or [],
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
