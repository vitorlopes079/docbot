from fastapi import FastAPI, HTTPException, Header
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, CreditsResponse
from services.auth import AuthService
from services.database import DatabaseService
from typing import Optional

app = FastAPI()
auth_service = AuthService()
database_service = DatabaseService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "auth-service"}


@app.post("/auth/register", response_model=UserResponse)
def register(request: RegisterRequest):
    existing_user = database_service.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = auth_service.hash_password(request.password)

    try:
        user = database_service.create_user(request.email, password_hash)
        return UserResponse(
            id=user["id"],
            email=user["email"],
            credits=user.get("credits", 3),
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
