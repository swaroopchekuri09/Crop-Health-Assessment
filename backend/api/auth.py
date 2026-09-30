from fastapi import APIRouter, Depends, status
from backend.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.services.auth_service import AuthService
from backend.security.security import get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister):
    return AuthService.register(name=payload.name, email=payload.email, password=payload.password)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    return AuthService.login(email=payload.email, password=payload.password)


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str = Depends(get_current_user_id)):
    return AuthService.get_user_profile(user_id)
