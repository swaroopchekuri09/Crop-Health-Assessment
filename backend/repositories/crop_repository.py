from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId
from database.collections import get_crops_collection


class CropRepository:
    @staticmethod
    def find_all(
        category: Optional[str] = None,
        ai_supported: Optional[bool] = None,
        search: Optional[str] = None,
        only_active: bool = True
    ) -> List[Dict[str, Any]]:
        col = get_crops_collection()
        query: Dict[str, Any] = {}
        if only_active:
            query["is_active"] = True

        if ai_supported is not None:
            query["$or"] = [
                {"ai_supported": ai_supported},
                {"supported_by_ai": ai_supported}
            ]

        if category and category.lower() != "all":
            # Support matching categories like Cereal, Cereals, Pulse, Pulses, Commercial, etc.
            query["category"] = {"$regex": f"^{category}", "$options": "i"}

        if search:
            regex_term = search.strip()
            search_clause = [
                {"name": {"$regex": regex_term, "$options": "i"}},
                {"common_names": {"$regex": regex_term, "$options": "i"}},
                {"scientific_name": {"$regex": regex_term, "$options": "i"}},
                {"category": {"$regex": regex_term, "$options": "i"}}
            ]
            if "$or" in query:
                query["$and"] = [{"$or": query.pop("$or")}, {"$or": search_clause}]
            else:
                query["$or"] = search_clause

        return list(col.find(query).sort("name", 1))

    @staticmethod
    def find_by_id(crop_id: str) -> Optional[Dict[str, Any]]:
        try:
            col = get_crops_collection()
            return col.find_one({"_id": ObjectId(crop_id)})
        except Exception:
            return None

    @staticmethod
    def find_by_name(name: str) -> Optional[Dict[str, Any]]:
        col = get_crops_collection()
        return col.find_one({
            "$or": [
                {"name": {"$regex": f"^{name}$", "$options": "i"}},
                {"common_names": {"$regex": f"^{name}$", "$options": "i"}}
            ]
        })

    @staticmethod
    def upsert(
        name: str,
        category: str = "Vegetable",
        description: str = "",
        common_names: Optional[List[str]] = None,
        icon: str = "🌱",
        scientific_name: str = "",
        ai_supported: bool = False,
        common_diseases: Optional[List[str]] = None,
        health_indicators: Optional[List[str]] = None,
        growing_season: Optional[str] = None,
        soil_requirements: Optional[str] = None
    ) -> Dict[str, Any]:
        col = get_crops_collection()
        now = datetime.now(timezone.utc)
        doc = col.find_one_and_update(
            {"name": name},
            {
                "$set": {
                    "name": name,
                    "category": category,
                    "description": description,
                    "common_names": common_names or [name],
                    "icon": icon,
                    "scientific_name": scientific_name,
                    "ai_supported": ai_supported,
                    "supported_by_ai": ai_supported,
                    "common_diseases": common_diseases or [],
                    "health_indicators": health_indicators or [],
                    "growing_season": growing_season or "Kharif / Rabi / Zaid depending on agro-climatic zone",
                    "soil_requirements": soil_requirements or "Well-drained fertile loam with balanced pH",
                    "is_active": True,
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
