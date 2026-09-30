from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from bson import ObjectId
from database.collections import get_assessments_collection


class AssessmentRepository:
    @staticmethod
    def create(assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        col = get_assessments_collection()
        doc = assessment_data.copy()
        if "created_at" not in doc:
            doc["created_at"] = datetime.now(timezone.utc)
        res = col.insert_one(doc)
        doc["_id"] = res.inserted_id
        return doc

    @staticmethod
    def find_by_id(assessment_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        try:
            col = get_assessments_collection()
            query: Dict[str, Any] = {"_id": ObjectId(assessment_id)}
            if user_id:
                query["user_id"] = ObjectId(user_id)
            return col.find_one(query)
        except Exception:
            return None

    @staticmethod
    def list_by_user(
        user_id: str,
        crop_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
        sort_by: str = "created_at",
        sort_order: int = -1
    ) -> Tuple[List[Dict[str, Any]], int]:
        col = get_assessments_collection()
        query: Dict[str, Any] = {"user_id": ObjectId(user_id)}

        if crop_id:
            try:
                query["crop_id"] = ObjectId(crop_id)
            except Exception:
                pass

        if status:
            query["status"] = status

        if search:
            query["$or"] = [
                {"predicted_condition": {"$regex": search, "$options": "i"}},
                {"crop_name": {"$regex": search, "$options": "i"}}
            ]

        total = col.count_documents(query)
        skip = (page - 1) * limit
        cursor = col.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        return list(cursor), total

    @staticmethod
    def get_user_stats(user_id: str) -> Dict[str, Any]:
        col = get_assessments_collection()
        uid = ObjectId(user_id)
        
        total = col.count_documents({"user_id": uid})
        healthy = col.count_documents({"user_id": uid, "status": "healthy"})
        disease = col.count_documents({"user_id": uid, "status": "disease_detected"})
        low_conf = col.count_documents({"user_id": uid, "status": "low_confidence"})

        recent = list(col.find({"user_id": uid}).sort("created_at", -1).limit(5))

        return {
            "total_assessments": total,
            "healthy_count": healthy,
            "disease_detected_count": disease,
            "low_confidence_count": low_conf,
            "recent_assessments": recent
        }
