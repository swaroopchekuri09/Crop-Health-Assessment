import os
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image
from ai.model_loader import get_session, is_model_available
from ai.preprocessing import (
    validate_image_bytes,
    check_plant_suitability,
    preprocess_for_onnx,
    ImageValidationError
)
from ai.class_mapping import get_class_info

CONFIDENCE_THRESHOLD_HIGH = float(os.getenv("AI_CONFIDENCE_THRESHOLD_HIGH", "0.80"))
CONFIDENCE_THRESHOLD_MODERATE = float(os.getenv("AI_CONFIDENCE_THRESHOLD_MODERATE", "0.60"))


class AIServiceError(Exception):
    def __init__(self, message: str, code: str = "ai_error"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AIService:
    @staticmethod
    def softmax(x: np.ndarray) -> np.ndarray:
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum(axis=-1, keepdims=True)

    @classmethod
    def analyze_image(cls, file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Full AI pipeline:
        1. Image Validation
        2. Plant Suitability Check
        3. Preprocessing
        4. Model Inference
        5. Softmax & Confidence evaluation
        6. Top Predictions & Class mapping
        """
        # 1. Image Validation
        try:
            pil_image = validate_image_bytes(file_bytes, filename, content_type)
        except ImageValidationError as e:
            raise AIServiceError(e.message, code="invalid_image")

        # 2. Plant Suitability Check
        is_suitable, suitability_reason = check_plant_suitability(pil_image)
        if not is_suitable:
            raise AIServiceError(
                f"IMAGE NOT SUITABLE FOR CROP ANALYSIS: {suitability_reason} Please upload a clear photo of a crop, leaf, or plant part.",
                code="unsuitable_image"
            )

        # 3. Model Availability Check
        if not is_model_available():
            raise AIServiceError(
                "AI MODEL NOT AVAILABLE: The agricultural AI model has not been configured yet. "
                "Please configure the model before performing crop disease analysis.",
                code="model_unavailable"
            )

        session = get_session()
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name

        # 4. Preprocessing
        tensor = preprocess_for_onnx(pil_image)

        # 5. Inference
        try:
            outputs = session.run([output_name], {input_name: tensor})
            logits = outputs[0][0]  # shape: (38,)
        except Exception as e:
            raise AIServiceError(f"Inference failed during neural network execution: {str(e)}", code="inference_failure")

        # 6. Softmax Probabilities
        probs = cls.softmax(logits)

        # Top indices sorted descending
        top_indices = np.argsort(probs)[::-1]
        best_idx = int(top_indices[0])
        best_prob = float(probs[best_idx])

        # Confidence level classification
        if best_prob >= CONFIDENCE_THRESHOLD_HIGH:
            conf_level = "high"
        elif best_prob >= CONFIDENCE_THRESHOLD_MODERATE:
            conf_level = "moderate"
        else:
            conf_level = "low"

        best_class = get_class_info(best_idx)

        # Top 3 predictions for transparency
        top_3: List[Dict[str, Any]] = []
        for i in range(min(3, len(top_indices))):
            idx = int(top_indices[i])
            info = get_class_info(idx)
            top_3.append({
                "index": idx,
                "crop": info["crop"],
                "condition": info["condition"],
                "model_class": info["model_class"],
                "confidence": round(float(probs[idx]), 4),
                "is_healthy": info["is_healthy"]
            })

        return {
            "predicted_index": best_idx,
            "model_class": best_class["model_class"],
            "crop_name": best_class["crop"],
            "condition": best_class["condition"],
            "is_healthy": best_class["is_healthy"],
            "severity": best_class["severity"],
            "confidence": round(best_prob, 4),
            "confidence_level": conf_level,
            "top_3": top_3,
            "pil_image": pil_image
        }
