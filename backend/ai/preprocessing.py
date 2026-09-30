import io
import os
from typing import Tuple, Optional
from PIL import Image
import numpy as np

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB
MIN_FILE_SIZE = 4 * 1024  # 4KB
MIN_DIMENSION = 64
MAX_DIMENSION = 8000


class ImageValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


def validate_image_bytes(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Image.Image:
    """
    Validate uploaded image bytes:
    - size check
    - extension check
    - MIME check
    - Pillow integrity check
    - dimension check
    """
    # 1. Size check
    size = len(file_bytes)
    if size < MIN_FILE_SIZE:
        raise ImageValidationError("The uploaded file is too small to be a valid crop image. Minimum size is 4KB.")
    if size > MAX_FILE_SIZE:
        raise ImageValidationError("The image file exceeds the maximum allowed size of 15MB.")

    # 2. Extension check
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise ImageValidationError(f"Unsupported file format '{ext}'. Please upload JPG, JPEG, PNG, or WEBP images.")

    # 3. MIME type check
    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES and content_type.lower() != "application/octet-stream":
        raise ImageValidationError(f"Invalid image MIME type '{content_type}'. Must be JPG, PNG, or WEBP.")

    # 4. Pillow integrity check
    try:
        img_buffer = io.BytesIO(file_bytes)
        img = Image.open(img_buffer)
        img.verify()
    except Exception:
        raise ImageValidationError("The uploaded file is corrupt or not a readable image.")

    # Re-open after verify() because verify() clears the image buffer
    try:
        img_buffer.seek(0)
        img = Image.open(img_buffer)
        img.load()
    except Exception:
        raise ImageValidationError("Unable to decode image pixels. Please upload a clear photo.")

    # 5. Dimension check
    w, h = img.size
    if w < MIN_DIMENSION or h < MIN_DIMENSION:
        raise ImageValidationError(f"Image dimensions ({w}x{h}) are too small. Minimum dimension is {MIN_DIMENSION}x{MIN_DIMENSION} pixels.")
    if w > MAX_DIMENSION or h > MAX_DIMENSION:
        raise ImageValidationError(f"Image dimensions ({w}x{h}) are too large. Maximum dimension is {MAX_DIMENSION}x{MAX_DIMENSION} pixels.")

    return img


def check_plant_suitability(img: Image.Image) -> Tuple[bool, Optional[str]]:
    """
    Heuristic check to determine if the image is likely a plant/foliage or an unsuitable image
    (such as a pure blank screen, a pure black frame, a text document with no color variance, etc.)
    """
    rgb_img = img.convert("RGB")
    arr = np.array(rgb_img)
    
    # Check standard deviation of pixels (blank or solid color check)
    std = np.std(arr)
    if std < 12.0:
        return False, "Image appears to be a blank or solid-color image with no visible crop features."

    # Check for excessive saturation extremes or purely monochrome images
    # Calculate green ratio or plant pigment presence
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)

    # In synthetic text screenshots (black text on white), r == g == b almost everywhere
    color_diff = np.mean(np.abs(r - g) + np.abs(g - b) + np.abs(b - r))
    if color_diff < 4.0:
        return False, "Image is completely monochrome or grayscale text. Please upload a color photograph of a plant/leaf."

    return True, None


def preprocess_for_onnx(img: Image.Image) -> np.ndarray:
    """
    Preprocess image for MobileNetV2 ONNX model:
    - Convert to RGB
    - Resize shortest edge to 256, center crop 224x224
    - Rescale pixel values [0, 255] -> [0, 1]
    - Normalize using mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]
    - Transpose to (3, 224, 224) and add batch dimension (1, 3, 224, 224)
    """
    rgb = img.convert("RGB")
    
    # Resize shortest edge to 256 while maintaining aspect ratio
    w, h = rgb.size
    if w < h:
        new_w = 256
        new_h = int(h * (256.0 / w))
    else:
        new_h = 256
        new_w = int(w * (256.0 / h))
    
    resized = rgb.resize((new_w, new_h), Image.Resampling.BILINEAR)

    # Center crop 224x224
    left = (new_w - 224) // 2
    top = (new_h - 224) // 2
    right = left + 224
    bottom = top + 224
    cropped = resized.crop((left, top, right, bottom))

    # Convert to numpy array float32 and rescale to [0, 1]
    arr = np.array(cropped, dtype=np.float32) / 255.0

    # Normalize with mean=0.5, std=0.5
    mean = np.array([0.5, 0.5, 0.5], dtype=np.float32)
    std = np.array([0.5, 0.5, 0.5], dtype=np.float32)
    normalized = (arr - mean) / std

    # Transpose HWC -> CHW: (224, 224, 3) -> (3, 224, 224)
    chw = np.transpose(normalized, (2, 0, 1))

    # Expand batch dimension: (1, 3, 224, 224)
    batch = np.expand_dims(chw, axis=0).astype(np.float32)
    return batch
