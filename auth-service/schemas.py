from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    credits: int = 0
    email_verified: bool = False
    created_at: Optional[datetime] = None


class CreditsResponse(BaseModel):
    credits: int


class InternalDeductRequest(BaseModel):
    user_id: str


class MessageResponse(BaseModel):
    message: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class VerificationResponse(BaseModel):
    success: bool
    message: str
    credits_awarded: int = 0
