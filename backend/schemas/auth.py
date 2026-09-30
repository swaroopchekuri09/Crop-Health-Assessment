from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Farmer full name")
    email: EmailStr = Field(..., description="Farmer email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 characters)")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Farmer email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    total_assessments: Optional[int] = 0


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
