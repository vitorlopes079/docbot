import httpx
import os
from dotenv import load_dotenv
from services.job_store import JobStore

load_dotenv()

job_store = JobStore()

GIT_SERVICE_URL = os.getenv("GIT_SERVICE_URL", "http://localhost:8001")
AGENT_SERVICE_URL = os.getenv("AGENT_SERVICE_URL", "http://localhost:8002")
DOC_SERVICE_URL = os.getenv("DOC_SERVICE_URL", "http://localhost:8003")


async def run_pipeline(job_id: str, github_url: str):
    try:
        # Step 1 - Git Service
        job_store.update_job(job_id, "processing_git", 10, "Cloning repository...")

        async with httpx.AsyncClient(timeout=60.0) as client:
            git_response = await client.post(
                f"{GIT_SERVICE_URL}/clone",
                json={"github_url": github_url}
            )
            git_data = git_response.json()

        # Step 2 - Agent Service
        job_store.update_job(job_id, "processing_agent", 40, "Analyzing code with AI...")

        async with httpx.AsyncClient(timeout=120.0) as client:
            agent_response = await client.post(
                f"{AGENT_SERVICE_URL}/analyze",
                json=git_data
            )
            agent_data = agent_response.json()

        # Step 3 - Doc Service
        job_store.update_job(job_id, "processing_doc", 70, "Formatting documentation...")

        async with httpx.AsyncClient(timeout=30.0) as client:
            await client.post(
                f"{DOC_SERVICE_URL}/format",
                json=agent_data
            )

        # Done
        job_store.update_job(job_id, "completed", 100, "Documentation is ready!", f"/jobs/{job_id}/download")

    except Exception as e:
        job_store.update_job(job_id, "failed", 0, f"Something went wrong: {str(e)}")