import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from bson import ObjectId
from fastapi import HTTPException, status

from backend.repositories.assessment_repository import AssessmentRepository
from backend.repositories.crop_repository import CropRepository
from backend.repositories.disease_repository import DiseaseRepository
from backend.repositories.recommendation_repository import RecommendationRepository
from backend.ai.ai_service import AIService, AIServiceError
from backend.ai.preprocessing import ImageValidationError

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AssessmentService:
    @classmethod
    def create_assessment(
        cls,
        user_id: str,
        crop_id: str,
        image_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None,
        image_source: str = "manual"
    ) -> Dict[str, Any]:
        # 1. Validate Crop
        crop_doc = CropRepository.find_by_id(crop_id)
        if not crop_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID '{crop_id}' was not found in supported crops."
            )

        is_ai = crop_doc.get("ai_supported", crop_doc.get("supported_by_ai", False))
        if not is_ai:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"AI analysis is not currently available for {crop_doc['name']}. Please choose a supported crop from the library."
            )

        # 2. Save image to disk safely
        _, ext = os.path.splitext(filename.lower())
        if not ext:
            ext = ".jpg"
        unique_name = f"assess_{user_id}_{uuid.uuid4().hex[:12]}{ext}"
        image_file_path = os.path.join(UPLOAD_DIR, unique_name)

        # 3. AI Inference & Validation
        try:
            ai_result = AIService.analyze_image(image_bytes, filename, content_type)
        except AIServiceError as e:
            # Handle specific failure categories cleanly
            if e.code == "invalid_image":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
            
            if e.code == "unsuitable_image":
                # Save uploaded image for record and return invalid_image assessment
                with open(image_file_path, "wb") as f:
                    f.write(image_bytes)
                
                now = datetime.now(timezone.utc)
                doc = {
                    "user_id": ObjectId(user_id),
                    "crop_id": ObjectId(crop_id),
                    "crop_name": crop_doc["name"],
                    "image_path": f"/uploads/{unique_name}",
                    "image_source": image_source,
                    "predicted_condition": "Unsuitable Image",
                    "confidence": 0.0,
                    "confidence_level": "low",
                    "status": "invalid_image",
                    "created_at": now,
                    "message": e.message
                }
                saved = AssessmentRepository.create(doc)
                return cls._format_assessment_doc(saved, crop_doc=crop_doc)

            if e.code == "model_unavailable":
                # Save assessment with model_unavailable status
                with open(image_file_path, "wb") as f:
                    f.write(image_bytes)
                now = datetime.now(timezone.utc)
                doc = {
                    "user_id": ObjectId(user_id),
                    "crop_id": ObjectId(crop_id),
                    "crop_name": crop_doc["name"],
                    "image_path": f"/uploads/{unique_name}",
                    "image_source": image_source,
                    "predicted_condition": "Model Unavailable",
                    "confidence": 0.0,
                    "confidence_level": "none",
                    "status": "model_unavailable",
                    "created_at": now,
                    "message": e.message
                }
                saved = AssessmentRepository.create(doc)
                return cls._format_assessment_doc(saved, crop_doc=crop_doc)

            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message)

        # Save verified image file
        with open(image_file_path, "wb") as f:
            f.write(image_bytes)

        # 4. Process AI Outcomes
        conf = ai_result["confidence"]
        conf_level = ai_result["confidence_level"]
        is_healthy = ai_result["is_healthy"]
        model_class = ai_result["model_class"]
        condition = ai_result["condition"]
        ai_crop_name = ai_result["crop_name"]

        # Check for Low Confidence
        if conf_level == "low":
            assessment_status = "low_confidence"
            message = (
                "LOW CONFIDENCE: The AI could not identify the crop condition reliably. "
                "Please upload a clearer, well-lit image closer to the affected leaf."
            )
            disease_doc = None
            rec_doc = None
        elif is_healthy:
            assessment_status = "healthy"
            message = "HEALTHY CROP: No significant disease pattern was detected for the supported categories."
            disease_doc = DiseaseRepository.find_by_model_class(model_class)
            rec_doc = RecommendationRepository.find_by_disease_id(str(disease_doc["_id"])) if disease_doc else None
        else:
            assessment_status = "disease_detected"
            message = f"DISEASE DETECTED: Visual patterns indicate {condition}."
            disease_doc = DiseaseRepository.find_by_model_class(model_class)
            rec_doc = RecommendationRepository.find_by_disease_id(str(disease_doc["_id"])) if disease_doc else None

        # 5. Save Assessment in MongoDB
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": ObjectId(user_id),
            "crop_id": ObjectId(crop_id),
            "crop_name": crop_doc["name"],
            "detected_crop": ai_crop_name,
            "disease_id": disease_doc["_id"] if disease_doc else None,
            "image_path": f"/uploads/{unique_name}",
            "image_source": image_source,
            "predicted_condition": condition,
            "model_class": model_class,
            "confidence": conf,
            "confidence_level": conf_level,
            "status": assessment_status,
            "is_healthy": is_healthy,
            "top_3": ai_result.get("top_3", []),
            "message": message,
            "created_at": now
        }
        saved = AssessmentRepository.create(doc)

        return cls._format_assessment_doc(saved, crop_doc=crop_doc, disease_doc=disease_doc, rec_doc=rec_doc)

    @classmethod
    def get_assessment(cls, assessment_id: str, user_id: str) -> Dict[str, Any]:
        doc = AssessmentRepository.find_by_id(assessment_id, user_id=user_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assessment with ID '{assessment_id}' not found."
            )
        
        crop_doc = CropRepository.find_by_id(str(doc.get("crop_id"))) if doc.get("crop_id") else None
        disease_doc = DiseaseRepository.find_by_id(str(doc.get("disease_id"))) if doc.get("disease_id") else None
        
        # If disease not linked by id, attempt fallback to model_class
        if not disease_doc and doc.get("model_class"):
            disease_doc = DiseaseRepository.find_by_model_class(doc["model_class"])
        
        rec_doc = None
        if disease_doc:
            rec_doc = RecommendationRepository.find_by_disease_id(str(disease_doc["_id"]))

        return cls._format_assessment_doc(doc, crop_doc=crop_doc, disease_doc=disease_doc, rec_doc=rec_doc)

    @classmethod
    def list_assessments(
        cls,
        user_id: str,
        crop_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Dict[str, Any]:
        docs, total = AssessmentRepository.list_by_user(
            user_id=user_id,
            crop_id=crop_id,
            status=status,
            search=search,
            page=page,
            limit=limit
        )
        items = []
        for d in docs:
            items.append({
                "id": str(d["_id"]),
                "crop_name": d.get("crop_name", "Unknown Crop"),
                "condition": d.get("predicted_condition", "Unknown"),
                "confidence": d.get("confidence"),
                "confidence_level": d.get("confidence_level"),
                "status": d.get("status", "disease_detected"),
                "image_path": d.get("image_path", ""),
                "image_source": d.get("image_source", "manual"),
                "created_at": d.get("created_at")
            })
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": items
        }

    @classmethod
    def get_dashboard_stats(cls, user_id: str) -> Dict[str, Any]:
        raw_stats = AssessmentRepository.get_user_stats(user_id)
        recent_items = []
        for d in raw_stats["recent_assessments"]:
            recent_items.append({
                "id": str(d["_id"]),
                "crop_name": d.get("crop_name", "Unknown Crop"),
                "condition": d.get("predicted_condition", "Unknown"),
                "confidence": d.get("confidence"),
                "confidence_level": d.get("confidence_level"),
                "status": d.get("status", "disease_detected"),
                "image_path": d.get("image_path", ""),
                "image_source": d.get("image_source", "manual"),
                "created_at": d.get("created_at")
            })
        total_crops = len(CropRepository.find_all())
        ai_crops = len(CropRepository.find_all(ai_supported=True))
        return {
            "total_assessments": raw_stats["total_assessments"],
            "healthy_count": raw_stats["healthy_count"],
            "disease_detected_count": raw_stats["disease_detected_count"],
            "low_confidence_count": raw_stats["low_confidence_count"],
            "ai_supported_crops_count": ai_crops,
            "total_crops_count": total_crops,
            "recent_assessments": recent_items
        }

    @classmethod
    def _format_assessment_doc(
        cls,
        doc: Dict[str, Any],
        crop_doc: Optional[Dict[str, Any]] = None,
        disease_doc: Optional[Dict[str, Any]] = None,
        rec_doc: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Prediction detail
        prediction_payload = None
        if doc.get("status") not in ("low_confidence", "invalid_image", "model_unavailable"):
            prediction_payload = {
                "condition": doc.get("predicted_condition", "Unknown"),
                "model_class": doc.get("model_class", ""),
                "confidence": doc.get("confidence", 0.0),
                "confidence_level": doc.get("confidence_level", "low"),
                "is_healthy": doc.get("is_healthy", False),
                "top_3_predictions": doc.get("top_3", [])
            }

        # Recommendation payload
        recommendation_payload = None
        if rec_doc:
            recommendation_payload = {
                "id": str(rec_doc["_id"]),
                "disease_id": str(rec_doc["disease_id"]),
                "disease_name": disease_doc["name"] if disease_doc else doc.get("predicted_condition"),
                "is_healthy": disease_doc.get("is_healthy", False) if disease_doc else doc.get("is_healthy", False),
                "symptoms": disease_doc.get("symptoms", []) if disease_doc else [],
                "causes": disease_doc.get("causes", []) if disease_doc else [],
                "severity": disease_doc.get("severity", "medium") if disease_doc else "medium",
                "management": rec_doc.get("management", []),
                "prevention": rec_doc.get("prevention", []),
                "precautions": rec_doc.get("precautions", []),
                "fertilizer_guidance": rec_doc.get("fertilizer_guidance", []),
                "pesticide_guidance": rec_doc.get("pesticide_guidance", []),
                "disclaimer": "Guidance provided is for educational and advisory purposes only. Always inspect chemical product labels and consult local agricultural extension officers before application."
            }

        crop_payload = None
        if crop_doc:
            crop_payload = {
                "id": str(crop_doc["_id"]),
                "name": crop_doc.get("name", "Unknown"),
                "icon": crop_doc.get("icon", "🌱"),
                "description": crop_doc.get("description", "")
            }
        elif doc.get("crop_name"):
            crop_payload = {
                "id": str(doc.get("crop_id", "")),
                "name": doc["crop_name"],
                "icon": "🌱",
                "description": ""
            }

        return {
            "id": str(doc["_id"]),
            "user_id": str(doc["user_id"]),
            "crop": crop_payload,
            "image_path": doc.get("image_path", ""),
            "image_source": doc.get("image_source", "manual"),
            "predicted_condition": doc.get("predicted_condition"),
            "confidence": doc.get("confidence"),
            "confidence_level": doc.get("confidence_level"),
            "status": doc.get("status"),
            "disease_id": str(doc["disease_id"]) if doc.get("disease_id") else None,
            "prediction": prediction_payload,
            "recommendation": recommendation_payload,
            "message": doc.get("message"),
            "created_at": doc.get("created_at")
        }
