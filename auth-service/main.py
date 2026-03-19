import os
import httpx
from fastapi import FastAPI, HTTPException, Header
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse, CreditsResponse,
    InternalDeductRequest, VerifyEmailRequest, ResendVerificationRequest,
    VerificationResponse, MessageResponse
)
from services.auth import AuthService
from services.database import DatabaseService
from typing import Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
auth_service = AuthService()
database_service = DatabaseService()

NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8007")


@app.get("/health")
def health():
    return {"status": "ok", "service": "auth-service"}


@app.post("/auth/register", response_model=UserResponse)
async def register(request: RegisterRequest):
    existing_user = database_service.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = auth_service.hash_password(request.password)

    try:
        user = database_service.create_user(request.email, password_hash)

        # Send verification email via notification service
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                await client.post(
                    f"{NOTIFICATION_SERVICE_URL}/email/verification",
                    json={
                        "email": user["email"],
                        "token": user["verification_token"]
                    }
                )
            except Exception as e:
                # Log but don't fail registration
                print(f"Failed to send verification email: {e}")

        return UserResponse(
            id=user["id"],
            email=user["email"],
            credits=user.get("credits", 0),
            email_verified=user.get("email_verified", False),
            created_at=user.get("created_at")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = database_service.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not auth_service.verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_service.create_token(user["id"], user["email"])

    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.replace("Bearer ", "")
    payload = auth_service.verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = database_service.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user["id"],
        email=user["email"],
        credits=user.get("credits", 0),
        email_verified=user.get("email_verified", False),
        created_at=user.get("created_at")
    )


@app.get("/auth/credits", response_model=CreditsResponse)
def get_credits(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.replace("Bearer ", "")
    payload = auth_service.verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    credits = database_service.get_user_credits(payload["sub"])
    return CreditsResponse(credits=credits)


@app.post("/auth/credits/deduct", response_model=CreditsResponse)
def deduct_credit(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.replace("Bearer ", "")
    payload = auth_service.verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    success = database_service.deduct_credit(payload["sub"])
    if not success:
        raise HTTPException(status_code=402, detail="No credits remaining")

    credits = database_service.get_user_credits(payload["sub"])
    return CreditsResponse(credits=credits)


@app.post("/internal/credits/deduct", response_model=CreditsResponse)
def internal_deduct_credit(request: InternalDeductRequest):
    """Internal endpoint for service-to-service credit deduction (no auth required)"""
    success = database_service.deduct_credit(request.user_id)
    if not success:
        raise HTTPException(status_code=402, detail="No credits remaining")

    credits = database_service.get_user_credits(request.user_id)
    return CreditsResponse(credits=credits)


@app.post("/auth/verify-email", response_model=VerificationResponse)
def verify_email(request: VerifyEmailRequest):
    """Verify user email with token and award credits"""
    user = database_service.get_user_by_verification_token(request.token)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    if user.get("email_verified"):
        return VerificationResponse(
            success=True,
            message="Email already verified",
            credits_awarded=0
        )

    # Check token expiration
    expires_at = user.get("token_expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=400,
                detail="Verification token has expired. Please request a new one."
            )

    success = database_service.verify_user_email(user["id"])

    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify email")

    return VerificationResponse(
        success=True,
        message="Email verified successfully! You've received 3 free credits.",
        credits_awarded=3
    )


@app.post("/auth/resend-verification", response_model=MessageResponse)
async def resend_verification(request: ResendVerificationRequest):
    """Resend verification email to user"""
    user = database_service.get_user_by_email(request.email)

    if not user:
        # Don't reveal if email exists
        return MessageResponse(message="If this email is registered, a verification link has been sent.")

    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email is already verified")

    # Regenerate token
    new_token = database_service.regenerate_verification_token(user["id"])

    if not new_token:
        raise HTTPException(status_code=500, detail="Failed to generate verification token")

    # Send new verification email
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            await client.post(
                f"{NOTIFICATION_SERVICE_URL}/email/verification",
                json={
                    "email": user["email"],
                    "token": new_token
                }
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to send verification email")

    return MessageResponse(message="Verification email sent. Please check your inbox.")
