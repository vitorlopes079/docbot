import io
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from schemas import DocRequest, DocResponse
from services.formatter import FormatterService

app = FastAPI()
formatter = FormatterService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "doc-service"}


@app.post("/format")
def format_docs(request: DocRequest):
    zip_bytes = formatter.format(request.repo_name, request.sections)

    zip_filename = f"{request.repo_name}-docs.zip"

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={zip_filename}"}
    )