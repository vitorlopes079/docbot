# Entry point for the Git Service
# Receives a GitHub URL, clones the repo and returns all file contents

from fastapi import FastAPI, HTTPException
from schemas import CloneRequest, CloneResponse
from services.cloner import ClonerService
from services.reader import ReaderService

app = FastAPI(
    title="DocBot - Git Service",
    description="Clones GitHub repos and extracts file contents",
    version="1.0.0"
)

cloner = ClonerService()
reader = ReaderService()

@app.get("/health")
def health():
    return {"status": "ok", "service": "git-service"}

@app.post("/clone", response_model=CloneResponse)
def clone_repo(request: CloneRequest):
    try:
        temp_dir = cloner.clone(request.github_url)
        files = reader.read(temp_dir)
        repo_name = request.github_url.rstrip("/").split("/")[-1]
        
        return CloneResponse(
            repo_name=repo_name,
            files=files,
            total_files=len(files)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cloner.cleanup(temp_dir)