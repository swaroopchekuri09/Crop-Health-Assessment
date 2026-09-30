from datetime import datetime, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
from backend.database.collections import get_users_collection


class UserRepository:
    @staticmethod
    def find_by_email(email: str) -> Optional[Dict[str, Any]]:
        col = get_users_collection()
        return col.find_one({"email": email.lower().strip()})

    @staticmethod
    def find_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        try:
            col = get_users_collection()
            return col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def create(name: str, email: str, password_hash: str, role: str = "farmer") -> Dict[str, Any]:
        col = get_users_collection()
        user_doc = {
            "name": name.strip(),
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "role": role,
            "created_at": datetime.now(timezone.utc)
        }
        res = col.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        return user_doc
