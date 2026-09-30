from typing import Dict, Any

MODEL_CLASSES = {
    0: {
        "model_class": "Apple___Apple_scab",
        "label": "Apple Scab",
        "crop": "Apple",
        "condition": "Apple Scab",
        "is_healthy": False,
        "severity": "medium"
    },
    1: {
        "model_class": "Apple___Black_rot",
        "label": "Apple with Black Rot",
        "crop": "Apple",
        "condition": "Black Rot",
        "is_healthy": False,
        "severity": "high"
    },
    2: {
        "model_class": "Apple___Cedar_apple_rust",
        "label": "Cedar Apple Rust",
        "crop": "Apple",
        "condition": "Cedar Apple Rust",
        "is_healthy": False,
        "severity": "medium"
    },
    3: {
        "model_class": "Apple___healthy",
        "label": "Healthy Apple",
        "crop": "Apple",
        "condition": "Healthy Apple",
        "is_healthy": True,
        "severity": "none"
    },
    4: {
        "model_class": "Blueberry___healthy",
        "label": "Healthy Blueberry Plant",
        "crop": "Blueberry",
        "condition": "Healthy Blueberry",
        "is_healthy": True,
        "severity": "none"
    },
    5: {
        "model_class": "Cherry_(including_sour)___Powdery_mildew",
        "label": "Cherry with Powdery Mildew",
        "crop": "Cherry",
        "condition": "Powdery Mildew",
        "is_healthy": False,
        "severity": "medium"
    },
    6: {
        "model_class": "Cherry_(including_sour)___healthy",
        "label": "Healthy Cherry Plant",
        "crop": "Cherry",
        "condition": "Healthy Cherry",
        "is_healthy": True,
        "severity": "none"
    },
    7: {
        "model_class": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
        "label": "Corn (Maize) with Cercospora and Gray Leaf Spot",
        "crop": "Corn (Maize)",
        "condition": "Cercospora Gray Leaf Spot",
        "is_healthy": False,
        "severity": "high"
    },
    8: {
        "model_class": "Corn_(maize)___Common_rust_",
        "label": "Corn (Maize) with Common Rust",
        "crop": "Corn (Maize)",
        "condition": "Common Rust",
        "is_healthy": False,
        "severity": "medium"
    },
    9: {
        "model_class": "Corn_(maize)___Northern_Leaf_Blight",
        "label": "Corn (Maize) with Northern Leaf Blight",
        "crop": "Corn (Maize)",
        "condition": "Northern Leaf Blight",
        "is_healthy": False,
        "severity": "high"
    },
    10: {
        "model_class": "Corn_(maize)___healthy",
        "label": "Healthy Corn (Maize) Plant",
        "crop": "Corn (Maize)",
        "condition": "Healthy Corn (Maize)",
        "is_healthy": True,
        "severity": "none"
    },
    11: {
        "model_class": "Grape___Black_rot",
        "label": "Grape with Black Rot",
        "crop": "Grape",
        "condition": "Black Rot",
        "is_healthy": False,
        "severity": "high"
    },
    12: {
        "model_class": "Grape___Esca_(Black_Measles)",
        "label": "Grape with Esca (Black Measles)",
        "crop": "Grape",
        "condition": "Esca (Black Measles)",
        "is_healthy": False,
        "severity": "high"
    },
    13: {
        "model_class": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
        "label": "Grape with Isariopsis Leaf Spot",
        "crop": "Grape",
        "condition": "Leaf Blight (Isariopsis Leaf Spot)",
        "is_healthy": False,
        "severity": "medium"
    },
    14: {
        "model_class": "Grape___healthy",
        "label": "Healthy Grape Plant",
        "crop": "Grape",
        "condition": "Healthy Grape",
        "is_healthy": True,
        "severity": "none"
    },
    15: {
        "model_class": "Orange___Haunglongbing_(Citrus_greening)",
        "label": "Orange with Citrus Greening",
        "crop": "Orange",
        "condition": "Citrus Greening (Huanglongbing)",
        "is_healthy": False,
        "severity": "critical"
    },
    16: {
        "model_class": "Peach___Bacterial_spot",
        "label": "Peach with Bacterial Spot",
        "crop": "Peach",
        "condition": "Bacterial Spot",
        "is_healthy": False,
        "severity": "medium"
    },
    17: {
        "model_class": "Peach___healthy",
        "label": "Healthy Peach Plant",
        "crop": "Peach",
        "condition": "Healthy Peach",
        "is_healthy": True,
        "severity": "none"
    },
    18: {
        "model_class": "Pepper,_bell___Bacterial_spot",
        "label": "Bell Pepper with Bacterial Spot",
        "crop": "Bell Pepper",
        "condition": "Bacterial Spot",
        "is_healthy": False,
        "severity": "high"
    },
    19: {
        "model_class": "Pepper,_bell___healthy",
        "label": "Healthy Bell Pepper Plant",
        "crop": "Bell Pepper",
        "condition": "Healthy Bell Pepper",
        "is_healthy": True,
        "severity": "none"
    },
    20: {
        "model_class": "Potato___Early_blight",
        "label": "Potato with Early Blight",
        "crop": "Potato",
        "condition": "Early Blight",
        "is_healthy": False,
        "severity": "medium"
    },
    21: {
        "model_class": "Potato___Late_blight",
        "label": "Potato with Late Blight",
        "crop": "Potato",
        "condition": "Late Blight",
        "is_healthy": False,
        "severity": "critical"
    },
    22: {
        "model_class": "Potato___healthy",
        "label": "Healthy Potato Plant",
        "crop": "Potato",
        "condition": "Healthy Potato",
        "is_healthy": True,
        "severity": "none"
    },
    23: {
        "model_class": "Raspberry___healthy",
        "label": "Healthy Raspberry Plant",
        "crop": "Raspberry",
        "condition": "Healthy Raspberry",
        "is_healthy": True,
        "severity": "none"
    },
    24: {
        "model_class": "Soybean___healthy",
        "label": "Healthy Soybean Plant",
        "crop": "Soybean",
        "condition": "Healthy Soybean",
        "is_healthy": True,
        "severity": "none"
    },
    25: {
        "model_class": "Squash___Powdery_mildew",
        "label": "Squash with Powdery Mildew",
        "crop": "Squash",
        "condition": "Powdery Mildew",
        "is_healthy": False,
        "severity": "medium"
    },
    26: {
        "model_class": "Strawberry___Leaf_scorch",
        "label": "Strawberry with Leaf Scorch",
        "crop": "Strawberry",
        "condition": "Leaf Scorch",
        "is_healthy": False,
        "severity": "medium"
    },
    27: {
        "model_class": "Strawberry___healthy",
        "label": "Healthy Strawberry Plant",
        "crop": "Strawberry",
        "condition": "Healthy Strawberry",
        "is_healthy": True,
        "severity": "none"
    },
    28: {
        "model_class": "Tomato___Bacterial_spot",
        "label": "Tomato with Bacterial Spot",
        "crop": "Tomato",
        "condition": "Bacterial Spot",
        "is_healthy": False,
        "severity": "high"
    },
    29: {
        "model_class": "Tomato___Early_blight",
        "label": "Tomato with Early Blight",
        "crop": "Tomato",
        "condition": "Early Blight",
        "is_healthy": False,
        "severity": "medium"
    },
    30: {
        "model_class": "Tomato___Late_blight",
        "label": "Tomato with Late Blight",
        "crop": "Tomato",
        "condition": "Late Blight",
        "is_healthy": False,
        "severity": "critical"
    },
    31: {
        "model_class": "Tomato___Leaf_Mold",
        "label": "Tomato with Leaf Mold",
        "crop": "Tomato",
        "condition": "Leaf Mold",
        "is_healthy": False,
        "severity": "medium"
    },
    32: {
        "model_class": "Tomato___Septoria_leaf_spot",
        "label": "Tomato with Septoria Leaf Spot",
        "crop": "Tomato",
        "condition": "Septoria Leaf Spot",
        "is_healthy": False,
        "severity": "medium"
    },
    33: {
        "model_class": "Tomato___Spider_mites Two-spotted_spider_mite",
        "label": "Tomato with Spider Mites or Two-spotted Spider Mite",
        "crop": "Tomato",
        "condition": "Two-spotted Spider Mite",
        "is_healthy": False,
        "severity": "medium"
    },
    34: {
        "model_class": "Tomato___Target_Spot",
        "label": "Tomato with Target Spot",
        "crop": "Tomato",
        "condition": "Target Spot",
        "is_healthy": False,
        "severity": "medium"
    },
    35: {
        "model_class": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "label": "Tomato Yellow Leaf Curl Virus",
        "crop": "Tomato",
        "condition": "Tomato Yellow Leaf Curl Virus",
        "is_healthy": False,
        "severity": "critical"
    },
    36: {
        "model_class": "Tomato___Tomato_mosaic_virus",
        "label": "Tomato Mosaic Virus",
        "crop": "Tomato",
        "condition": "Tomato Mosaic Virus",
        "is_healthy": False,
        "severity": "high"
    },
    37: {
        "model_class": "Tomato___healthy",
        "label": "Healthy Tomato Plant",
        "crop": "Tomato",
        "condition": "Healthy Tomato",
        "is_healthy": True,
        "severity": "none"
    }
}

SUPPORTED_CROPS_LIST = [
    {"name": "Apple", "icon": "🍎", "scientific_name": "Malus domestica", "description": "Apple orchard fruit and leaves"},
    {"name": "Blueberry", "icon": "🫐", "scientific_name": "Vaccinium sect. Cyanococcus", "description": "Blueberry bush leaves"},
    {"name": "Cherry", "icon": "🍒", "scientific_name": "Prunus avium", "description": "Sweet and sour cherry foliage"},
    {"name": "Corn (Maize)", "icon": "🌽", "scientific_name": "Zea mays", "description": "Field corn and maize foliage"},
    {"name": "Grape", "icon": "🍇", "scientific_name": "Vitis vinifera", "description": "Vineyard grape vines and leaves"},
    {"name": "Orange", "icon": "🍊", "scientific_name": "Citrus sinensis", "description": "Citrus grove orange leaves"},
    {"name": "Peach", "icon": "🍑", "scientific_name": "Prunus persica", "description": "Peach orchard leaf foliage"},
    {"name": "Bell Pepper", "icon": "🫑", "scientific_name": "Capsicum annuum", "description": "Bell pepper greenhouse and field foliage"},
    {"name": "Potato", "icon": "🥔", "scientific_name": "Solanum tuberosum", "description": "Potato tuber foliage and canopy"},
    {"name": "Raspberry", "icon": "🍓", "scientific_name": "Rubus idaeus", "description": "Raspberry cane leaves"},
    {"name": "Soybean", "icon": "🌱", "scientific_name": "Glycine max", "description": "Soybean crop foliage"},
    {"name": "Squash", "icon": "🎃", "scientific_name": "Cucurbita", "description": "Squash and pumpkin broadleaves"},
    {"name": "Strawberry", "icon": "🍓", "scientific_name": "Fragaria ananassa", "description": "Strawberry plant canopy and leaves"},
    {"name": "Tomato", "icon": "🍅", "scientific_name": "Solanum lycopersicum", "description": "Tomato greenhouse and open-field foliage"}
]


def get_class_info(index: int) -> Dict[str, Any]:
    return MODEL_CLASSES.get(index, {
        "model_class": "Unknown",
        "label": "Unknown Condition",
        "crop": "Unknown",
        "condition": "Unknown",
        "is_healthy": False,
        "severity": "medium"
    })
