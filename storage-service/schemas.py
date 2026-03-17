from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StorageRequest(BaseModel):
    job_id: str
    repo_name: str
    github_url: str
    zip_bytes: str
    user_id: Optional[str] = None

class StorageResponse(BaseModel):
    job_id: str
    repo_name: str
    file_url: str
    message: str

class DocumentRecord(BaseModel):
    id: Optional[str] = None
    job_id: str
    repo_name: str
    github_url: str
    file_url: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None