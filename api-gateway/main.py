import os
import redis
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://repodoc.tech",
        "https://www.repodoc.tech"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


JOB_SERVICE_URL = os.getenv("JOB_SERVICE_URL", "http://localhost:8004")
STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "http://localhost:8005")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8006")


async def forward(request: Request, url: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        body = await request.body()
        response = await client.request(
            method=request.method,
            url=url,
            headers={"Content-Type": "application/json"},
            content=body
        )
        return response


@app.get("/health")
def health():
    return {"status": "ok", "service": "api-gateway"}


@app.post("/jobs")
async def create_job(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Get user info from auth service
    async with httpx.AsyncClient(timeout=10.0) as client:
        auth_response = await client.get(
            f"{AUTH_SERVICE_URL}/auth/me",
            headers={"Authorization": token}
        )
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        user_data = auth_response.json()

    # Check if user has credits
    if user_data.get("credits", 0) <= 0:
        raise HTTPException(status_code=402, detail="No credits remaining. Please purchase more credits to continue.")

    # Check if user already has a job in progress (one concurrent job per user)
    user_id = user_data["id"]
    lock_key = f"user_lock:{user_id}"
    lock_acquired = redis_client.set(lock_key, "1", nx=True, ex=900)
    if not lock_acquired:
        raise HTTPException(status_code=400, detail="You already have a job in progress")

    # Parse the original request body and add user_id
    body = await request.json()
    body["user_id"] = user_id

    # Forward to job service with user_id included
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{JOB_SERVICE_URL}/jobs",
            json=body
        )
    return response.json()


@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(f"{JOB_SERVICE_URL}/jobs/{job_id}")
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Job not found")
        return response.json()


@app.get("/documents/recent")
async def get_recent_documents():
    """Get recent public documents for homepage (no auth required)"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(f"{STORAGE_SERVICE_URL}/documents/recent")
        return response.json()


@app.get("/documents")
async def get_documents(request: Request):
    """Get documents - returns user's documents if authenticated, otherwise all documents"""
    token = request.headers.get("Authorization")

    if token:
        # If authenticated, get user's documents only
        async with httpx.AsyncClient(timeout=10.0) as client:
            auth_response = await client.get(
                f"{AUTH_SERVICE_URL}/auth/me",
                headers={"Authorization": token}
            )
            if auth_response.status_code == 200:
                user_data = auth_response.json()
                user_id = user_data["id"]
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.get(
                        f"{STORAGE_SERVICE_URL}/documents",
                        params={"user_id": user_id}
                    )
                    return response.json()

    # If not authenticated or auth failed, return all documents
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(f"{STORAGE_SERVICE_URL}/documents")
        return response.json()


@app.get("/documents/{job_id}")
async def get_document(job_id: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(f"{STORAGE_SERVICE_URL}/documents/{job_id}")
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Document not found")
        return response.json()


@app.post("/auth/register")
async def register(request: Request):
    response = await forward(request, f"{AUTH_SERVICE_URL}/auth/register")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json().get("detail", "Registration failed"))
    return response.json()


@app.post("/auth/login")
async def login(request: Request):
    response = await forward(request, f"{AUTH_SERVICE_URL}/auth/login")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json().get("detail", "Login failed"))
    return response.json()


@app.get("/auth/me")
async def get_me(request: Request):
    token = request.headers.get("Authorization")
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/auth/me",
            headers={"Authorization": token} if token else {}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json().get("detail", "Unauthorized"))
        return response.json()


@app.post("/auth/verify-email")
async def verify_email(request: Request):
    response = await forward(request, f"{AUTH_SERVICE_URL}/auth/verify-email")
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json().get("detail", "Verification failed")
        )
    return response.json()


@app.post("/auth/resend-verification")
async def resend_verification(request: Request):
    response = await forward(request, f"{AUTH_SERVICE_URL}/auth/resend-verification")
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json().get("detail", "Failed to resend verification")
        )
    return response.json()