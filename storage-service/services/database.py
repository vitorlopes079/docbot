import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class DatabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        self.client: Client = create_client(url, key)

    def save_document(self, job_id: str, repo_name: str, github_url: str, file_url: str) -> dict:
        data = {
            "job_id": job_id,
            "repo_name": repo_name,
            "github_url": github_url,
            "file_url": file_url
        }
        response = self.client.table("documents").insert(data).execute()
        return response.data[0]

    def get_document_by_job_id(self, job_id: str) -> Optional[dict]:
        response = self.client.table("documents").select("*").eq("job_id", job_id).execute()
        if not response.data:
            return None
        return response.data[0]

    def get_all_documents(self) -> list:
        response = self.client.table("documents").select("*").order("created_at", desc=True).execute()
        return response.data