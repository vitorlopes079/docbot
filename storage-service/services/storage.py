import os
import base64
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StorageService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        self.bucket = os.getenv("SUPABASE_BUCKET", "docs")
        self.client: Client = create_client(url, key)

    def upload_zip(self, job_id: str, repo_name: str, zip_bytes_b64: str) -> str:
        zip_bytes = base64.b64decode(zip_bytes_b64)

        file_path = f"{job_id}/{repo_name}-docs.zip"

        self.client.storage.from_(self.bucket).upload(
            path=file_path,
            file=zip_bytes,
            file_options={"content-type": "application/zip"}
        )

        public_url = self.client.storage.from_(self.bucket).get_public_url(file_path)

        return public_url