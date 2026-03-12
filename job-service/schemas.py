from pydantic import BaseModel
from typing import Optional

class JobRequest(BaseModel):
    github_url: str

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str
    download_url: Optional[str] = None