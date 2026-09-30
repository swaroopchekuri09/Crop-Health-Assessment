from typing import Optional, Dict, Any, List
from bson import ObjectId
from repositories.disease_repository import DiseaseRepository
from repositories.crop_repository import CropRepository


class DiseaseService:
    @staticmethod
    def get_by_model_class(model_class: str) -> Optional[Dict[str, Any]]:
        return DiseaseRepository.find_by_model_class(model_class)

    @staticmethod
    def get_by_id(disease_id: str) -> Optional[Dict[str, Any]]:
        return DiseaseRepository.find_by_id(disease_id)

    @staticmethod
    def get_by_crop(crop_id: str) -> List[Dict[str, Any]]:
        return DiseaseRepository.find_by_crop_id(crop_id)
