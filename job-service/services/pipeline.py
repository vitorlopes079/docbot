import httpx
import os
import base64
import traceback
import redis
from dotenv import load_dotenv
from services.job_store import JobStore

load_dotenv()

job_store = JobStore()

GIT_SERVICE_URL = os.getenv("GIT_SERVICE_URL", "http://localhost:8001")
AGENT_SERVICE_URL = os.getenv("AGENT_SERVICE_URL", "http://localhost:8002")
DOC_SERVICE_URL = os.getenv("DOC_SERVICE_URL", "http://localhost:8003")
STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "http://localhost:8005")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8006")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


async def run_pipeline(job_id: str, github_url: str, user_id: str = None):
    lock_key = f"user_lock:{user_id}" if user_id else None
    try:
        # ============================================================
        # Step 1 - Git Service
        # ============================================================
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Starting step: CLONE")
        print(f"[PIPELINE] Job ID: {job_id}")
        print(f"[PIPELINE] GitHub URL: {github_url}")
        print(f"{'='*60}")

        job_store.update_job(job_id, "processing_git", 10, "Cloning repository...")

        async with httpx.AsyncClient(timeout=60.0) as client:
            git_response = await client.post(
                f"{GIT_SERVICE_URL}/clone",
                json={"github_url": github_url}
            )
            git_data = git_response.json()

        print(f"[GIT SERVICE] Status code: {git_response.status_code}")
        print(f"[GIT SERVICE] Response keys: {git_data.keys() if isinstance(git_data, dict) else 'NOT A DICT'}")
        if git_response.status_code != 200:
            print(f"[GIT SERVICE] ERROR Response: {git_data}")
        else:
            print(f"[GIT SERVICE] Repo name: {git_data.get('repo_name', 'N/A')}")
            print(f"[GIT SERVICE] Total files: {git_data.get('total_files', 'N/A')}")

        # ============================================================
        # Step 2 - Agent Service
        # ============================================================
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Starting step: ANALYZE")
        print(f"[PIPELINE] Sending {git_data.get('total_files', '?')} files to agent service")
        print(f"{'='*60}")

        job_store.update_job(job_id, "processing_agent", 40, "Analyzing code with AI...")

        async with httpx.AsyncClient(timeout=600.0) as client:
            agent_response = await client.post(
                f"{AGENT_SERVICE_URL}/analyze",
                json=git_data
            )
            agent_data = agent_response.json()

        print(f"[AGENT SERVICE] Status code: {agent_response.status_code}")
        print(f"[AGENT SERVICE] Response keys: {agent_data.keys() if isinstance(agent_data, dict) else 'NOT A DICT'}")
        if agent_response.status_code != 200:
            print(f"[AGENT SERVICE] ERROR Response: {agent_data}")
        else:
            print(f"[AGENT SERVICE] Repo name: {agent_data.get('repo_name', 'N/A')}")
            print(f"[AGENT SERVICE] Total sections: {agent_data.get('total_sections', 'N/A')}")
            sections = agent_data.get('sections', [])
            for i, section in enumerate(sections):
                title = section.get('title', 'N/A') if isinstance(section, dict) else 'INVALID'
                content_len = len(section.get('content', '')) if isinstance(section, dict) else 0
                print(f"[AGENT SERVICE] Section {i}: '{title}' ({content_len} chars)")

        # ============================================================
        # Step 3 - Doc Service
        # ============================================================
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Starting step: FORMAT")
        print(f"[PIPELINE] Sending {len(agent_data.get('sections', []))} sections to doc service")
        print(f"{'='*60}")

        job_store.update_job(job_id, "processing_doc", 70, "Formatting documentation...")

        async with httpx.AsyncClient(timeout=30.0) as client:
            doc_response = await client.post(
                f"{DOC_SERVICE_URL}/format",
                json=agent_data
            )

        print(f"[DOC SERVICE] Status code: {doc_response.status_code}")
        print(f"[DOC SERVICE] Content-Type: {doc_response.headers.get('content-type', 'N/A')}")
        if doc_response.status_code != 200:
            print(f"[DOC SERVICE] ERROR Response: {doc_response.text[:1000]}")
        else:
            print(f"[DOC SERVICE] Response size: {len(doc_response.content)} bytes")

        zip_bytes_b64 = base64.b64encode(doc_response.content).decode("utf-8")

        # ============================================================
        # Step 4 - Storage Service
        # ============================================================
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Starting step: STORE")
        print(f"[PIPELINE] Storing {len(doc_response.content)} bytes")
        print(f"{'='*60}")

        job_store.update_job(job_id, "processing_storage", 85, "Saving documentation...")

        storage_payload = {
            "job_id": job_id,
            "repo_name": git_data["repo_name"],
            "github_url": github_url,
            "zip_bytes": zip_bytes_b64
        }
        if user_id:
            storage_payload["user_id"] = user_id

        async with httpx.AsyncClient(timeout=30.0) as client:
            storage_response = await client.post(
                f"{STORAGE_SERVICE_URL}/store",
                json=storage_payload
            )
            storage_data = storage_response.json()

        print(f"[STORAGE SERVICE] Status code: {storage_response.status_code}")
        print(f"[STORAGE SERVICE] Response keys: {storage_data.keys() if isinstance(storage_data, dict) else 'NOT A DICT'}")
        if storage_response.status_code != 200:
            print(f"[STORAGE SERVICE] ERROR Response: {storage_data}")
        else:
            print(f"[STORAGE SERVICE] File URL: {storage_data.get('file_url', 'N/A')}")

        # ============================================================
        # Step 5 - Deduct Credit (only after successful storage)
        # ============================================================
        if user_id:
            print(f"\n{'='*60}")
            print(f"[PIPELINE] Deducting credit for user: {user_id}")
            print(f"{'='*60}")

            async with httpx.AsyncClient(timeout=10.0) as client:
                deduct_response = await client.post(
                    f"{AUTH_SERVICE_URL}/internal/credits/deduct",
                    json={"user_id": user_id}
                )
                if deduct_response.status_code == 200:
                    print(f"[PIPELINE] Credit deducted successfully")
                else:
                    print(f"[PIPELINE] Warning: Failed to deduct credit - {deduct_response.text}")

        # ============================================================
        # Done
        # ============================================================
        print(f"\n{'='*60}")
        print(f"[PIPELINE] COMPLETED SUCCESSFULLY")
        print(f"[PIPELINE] Job ID: {job_id}")
        print(f"{'='*60}\n")

        job_store.update_job(job_id, "completed", 100, "Documentation is ready!", storage_data["file_url"])

    except Exception as e:
        print(f"\n{'='*60}")
        print(f"[PIPELINE] FAILED WITH ERROR")
        print(f"[PIPELINE] Job ID: {job_id}")
        print(f"[PIPELINE] Error type: {type(e).__name__}")
        print(f"[PIPELINE] Error message: {str(e)}")
        print(f"[PIPELINE] Full traceback:")
        print(traceback.format_exc())
        print(f"{'='*60}\n")

        job_store.update_job(job_id, "failed", 0, f"Something went wrong: {str(e)}")

    finally:
        # Always release the user lock
        if lock_key:
            try:
                redis_client.delete(lock_key)
                print(f"[PIPELINE] Released lock for user: {user_id}")
            except Exception as e:
                print(f"[PIPELINE] Warning: Failed to release lock - {e}")
