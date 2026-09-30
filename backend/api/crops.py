from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from repositories.crop_repository import CropRepository
from repositories.disease_repository import DiseaseRepository
from schemas.crop import CropResponse, CropDetailResponse, DiseaseSummary

router = APIRouter(prefix="/api/crops", tags=["Crops"])


@router.get("", response_model=List[CropResponse])
def get_crops(
    category: Optional[str] = Query(None, description="Filter by crop category (e.g., Cereal, Vegetable, Fruit, etc.)"),
    ai_supported: Optional[bool] = Query(None, description="Filter by AI support availability (true or false)"),
    search: Optional[str] = Query(None, description="Search across crop name, common names, or scientific name")
):
    docs = CropRepository.find_all(
        category=category,
        ai_supported=ai_supported,
        search=search,
        only_active=True
    )
    results = []
    for d in docs:
        crop_id = str(d["_id"])
        is_ai = d.get("ai_supported", d.get("supported_by_ai", False))
        diseases = DiseaseRepository.find_by_crop_id(crop_id) if is_ai else []
        results.append(CropResponse(
            id=crop_id,
            name=d["name"],
            common_names=d.get("common_names", [d["name"]]),
            category=d.get("category", "Vegetable"),
            scientific_name=d.get("scientific_name"),
            icon=d.get("icon", "🌱"),
            description=d.get("description", ""),
            ai_supported=is_ai,
            supported_by_ai=is_ai,
            is_active=d.get("is_active", True),
            supported_conditions_count=len(diseases),
            common_diseases=d.get("common_diseases", []),
            health_indicators=d.get("health_indicators", [])
        ))
    return results


@router.get("/{crop_id}", response_model=CropDetailResponse)
def get_crop(crop_id: str):
    doc = CropRepository.find_by_id(crop_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID '{crop_id}' was not found."
        )

    is_ai = doc.get("ai_supported", doc.get("supported_by_ai", False))
    diseases = DiseaseRepository.find_by_crop_id(str(doc["_id"])) if is_ai else []
    disease_summaries = [
        DiseaseSummary(
            id=str(dis["_id"]),
            name=dis["name"],
            model_class=dis["model_class"],
            is_healthy=dis.get("is_healthy", False),
            severity=dis.get("severity", "medium")
        ) for dis in diseases
    ]

    return CropDetailResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        common_names=doc.get("common_names", [doc["name"]]),
        category=doc.get("category", "Vegetable"),
        scientific_name=doc.get("scientific_name"),
        icon=doc.get("icon", "🌱"),
        description=doc.get("description", ""),
        ai_supported=is_ai,
        supported_by_ai=is_ai,
        is_active=doc.get("is_active", True),
        supported_conditions_count=len(disease_summaries),
        common_diseases=doc.get("common_diseases", []),
        health_indicators=doc.get("health_indicators", []),
        supported_diseases=disease_summaries,
        growing_season=doc.get("growing_season"),
        soil_requirements=doc.get("soil_requirements")
    )
