from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from repositories.user_repository import UserRepository
from repositories.assessment_repository import AssessmentRepository
from security.security import hash_password, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register(name: str, email: str, password: str) -> Dict[str, Any]:
        existing = UserRepository.find_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists. Please log in."
            )
        
        pwd_hash = hash_password(password)
        user_doc = UserRepository.create(name=name, email=email, password_hash=pwd_hash)
        user_id = str(user_doc["_id"])
        
        token = create_access_token({"sub": user_id, "email": user_doc["email"], "role": user_doc["role"]})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": user_doc["name"],
                "email": user_doc["email"],
                "role": user_doc["role"],
                "created_at": user_doc["created_at"],
                "total_assessments": 0
            }
        }

    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        user_doc = UserRepository.find_by_email(email)
        if not user_doc or not verify_password(password, user_doc.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials."
            )

        user_id = str(user_doc["_id"])
        token = create_access_token({"sub": user_id, "email": user_doc["email"], "role": user_doc["role"]})
        
        stats = AssessmentRepository.get_user_stats(user_id)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": user_doc["name"],
                "email": user_doc["email"],
                "role": user_doc["role"],
                "created_at": user_doc["created_at"],
                "total_assessments": stats["total_assessments"]
            }
        }

    @staticmethod
    def get_user_profile(user_id: str) -> Dict[str, Any]:
        user_doc = UserRepository.find_by_id(user_id)
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )
        stats = AssessmentRepository.get_user_stats(user_id)
        return {
            "id": str(user_doc["_id"]),
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc.get("role", "farmer"),
            "created_at": user_doc["created_at"],
            "total_assessments": stats["total_assessments"]
        }
