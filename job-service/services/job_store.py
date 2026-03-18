import redis
import json
import os
from typing import Optional, cast

class JobStore:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)

    def create_job(self, job_id: str, github_url: str):
        job_data = {
            "job_id": job_id,
            "github_url": github_url,
            "status": "pending",
            "progress": 0,
            "message": "Job created, waiting to start...",
            "download_url": None
        }
        self.redis.set(job_id, json.dumps(job_data))

    def update_job(self, job_id: str, status: str, progress: int, message: str, download_url: Optional[str] = None):
        job_data = {
            "job_id": job_id,
            "status": status,
            "progress": progress,
            "message": message,
            "download_url": download_url
        }
        self.redis.set(job_id, json.dumps(job_data))

    def get_job(self, job_id: str) -> Optional[dict]:
        data = cast(Optional[str], self.redis.get(job_id))
        if data is None:
            return None
        return json.loads(data)