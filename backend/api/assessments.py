from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from backend.schemas.assessment import (
    AssessmentResponse,
    AssessmentListResponse,
    AssessmentStatsResponse
)
from backend.services.assessment_service import AssessmentService
from backend.security.security import get_current_user_id

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    crop_id: str = Form(...),
    image_source: str = Form("manual"),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    contents = await file.read()
    return AssessmentService.create_assessment(
        user_id=user_id,
        crop_id=crop_id,
        image_bytes=contents,
        filename=file.filename or "uploaded_image.jpg",
        content_type=file.content_type,
        image_source=image_source
    )


@router.get("", response_model=AssessmentListResponse)
def list_assessments(
    crop_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    user_id: str = Depends(get_current_user_id)
):
    return AssessmentService.list_assessments(
        user_id=user_id,
        crop_id=crop_id,
        status=status,
        search=search,
        page=page,
        limit=limit
    )


@router.get("/stats", response_model=AssessmentStatsResponse)
def get_stats(user_id: str = Depends(get_current_user_id)):
    return AssessmentService.get_dashboard_stats(user_id)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: str, user_id: str = Depends(get_current_user_id)):
    return AssessmentService.get_assessment(assessment_id=assessment_id, user_id=user_id)
