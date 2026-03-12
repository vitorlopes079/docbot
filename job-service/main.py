import uuid
import asyncio
from fastapi import FastAPI, BackgroundTasks, HTTPException
from schemas import JobRequest, JobResponse, JobStatus
from services.job_store import JobStore
from services.pipeline import run_pipeline

app = FastAPI()
job_store = JobStore()


@app.get("/health")
def health():
    return {"status": "ok", "service": "job-service"}


@app.post("/jobs", response_model=JobResponse)
async def create_job(request: JobRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())

    job_store.create_job(job_id, request.github_url)

    background_tasks.add_task(run_pipeline, job_id, request.github_url)

    return JobResponse(
        job_id=job_id,
        status="pending",
        message="Job created! Documentation is being generated..."
    )


@app.get("/jobs/{job_id}", response_model=JobStatus)
def get_job_status(job_id: str):
    job = job_store.get_job(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatus(
        job_id=job["job_id"],
        status=job["status"],
        progress=job["progress"],
        message=job["message"],
        download_url=job["download_url"]
    )