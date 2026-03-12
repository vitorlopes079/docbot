import os
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

JOB_SERVICE_URL = os.getenv("JOB_SERVICE_URL", "http://localhost:8004")
STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "http://localhost:8005")


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
    response = await forward(request, f"{JOB_SERVICE_URL}/jobs")
    return response.json()


@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(f"{JOB_SERVICE_URL}/jobs/{job_id}")
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Job not found")
        return response.json()


@app.get("/documents")
async def get_documents():
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
