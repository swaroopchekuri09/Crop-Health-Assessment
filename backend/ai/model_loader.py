import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("crop_health.ai")

_session = None
_model_load_error: Optional[str] = None
_model_path: Optional[str] = None


def get_default_model_path() -> str:
    env_path = os.getenv("AI_MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # Try local candidate paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "model_assets", "model_quantized.onnx"),
        os.path.join(base_dir, "model_assets", "model.onnx"),
        os.path.join(os.getcwd(), "backend", "ai", "model_assets", "model_quantized.onnx")
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]


def load_model(force_reload: bool = False):
    """
    Attempt to load the ONNX inference session.
    If the model is missing, record error state without crashing the backend.
    """
    global _session, _model_load_error, _model_path
    if _session is not None and not force_reload:
        return _session

    target_path = get_default_model_path()
    _model_path = target_path

    if not os.path.exists(target_path):
        _model_load_error = (
            "AI MODEL NOT AVAILABLE: The agricultural AI model file was not found at the expected path. "
            "Please run `python -m backend.ai.download_model` or place `model_quantized.onnx` in `backend/ai/model_assets/`."
        )
        logger.warning(_model_load_error)
        _session = None
        return None

    try:
        import onnxruntime as ort
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        
        session = ort.InferenceSession(target_path, options, providers=["CPUExecutionProvider"])
        _session = session
        _model_load_error = None
        logger.info(f"Loaded agricultural ONNX model from {target_path}")
        return _session
    except Exception as e:
        _model_load_error = f"Error initializing ONNX runtime session: {str(e)}"
        logger.error(_model_load_error)
        _session = None
        return None


def get_session():
    global _session
    if _session is None and _model_load_error is None:
        load_model()
    return _session


def is_model_available() -> bool:
    session = get_session()
    return session is not None


def get_model_status() -> Dict[str, Any]:
    from backend.ai.class_mapping import MODEL_CLASSES
    actual_crops = sorted(list(set(v["crop"] for v in MODEL_CLASSES.values())))
    session = get_session()
    if session is not None:
        return {
            "status": "ok",
            "model_loaded": True,
            "model_architecture": "MobileNetV2 (PlantVillage)",
            "input_shape": [1, 3, 224, 224],
            "supported_classes": len(MODEL_CLASSES),
            "supported_crops": actual_crops,
            "runtime": "ONNX Runtime (CPU)"
        }
    return {
        "status": "unavailable",
        "model_loaded": False,
        "supported_classes": len(MODEL_CLASSES),
        "supported_crops": actual_crops,
        "error": _model_load_error or "Model is not loaded",
        "instructions": "Run `python -m backend.ai.download_model` to download the pretrained PlantVillage ONNX model weights."
    }
