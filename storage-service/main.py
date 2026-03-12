from fastapi import FastAPI, HTTPException
from schemas import StorageRequest, StorageResponse
from services.storage import StorageService
from services.database import DatabaseService

app = FastAPI()
storage_service = StorageService()
database_service = DatabaseService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "storage-service"}


@app.post("/store", response_model=StorageResponse)
def store_documentation(request: StorageRequest):
    try:
        file_url = storage_service.upload_zip(
            job_id=request.job_id,
            repo_name=request.repo_name,
            zip_bytes_b64=request.zip_bytes
        )

        database_service.save_document(
            job_id=request.job_id,
            repo_name=request.repo_name,
            github_url=request.github_url,
            file_url=file_url
        )

        return StorageResponse(
            job_id=request.job_id,
            repo_name=request.repo_name,
            file_url=file_url,
            message="Documentation stored successfully!"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents")
def get_all_documents():
    return database_service.get_all_documents()


@app.get("/documents/{job_id}")
def get_document(job_id: str):
    document = database_service.get_document_by_job_id(job_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document