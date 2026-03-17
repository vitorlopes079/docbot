import io
import json
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from schemas import DocRequest, DocResponse
from services.formatter import FormatterService

app = FastAPI()
formatter = FormatterService()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all incoming requests"""
    print(f"\n{'='*60}")
    print(f"[DOC SERVICE] Incoming request: {request.method} {request.url.path}")
    print(f"[DOC SERVICE] Content-Type: {request.headers.get('content-type', 'N/A')}")

    # Read and log the raw body for POST requests
    if request.method == "POST":
        body = await request.body()
        print(f"[DOC SERVICE] Raw body size: {len(body)} bytes")

        try:
            body_json = json.loads(body)
            print(f"[DOC SERVICE] Body keys: {body_json.keys() if isinstance(body_json, dict) else 'NOT A DICT'}")

            if isinstance(body_json, dict):
                print(f"[DOC SERVICE] repo_name: {body_json.get('repo_name', 'MISSING')}")
                print(f"[DOC SERVICE] total_sections: {body_json.get('total_sections', 'MISSING')}")

                sections = body_json.get('sections', 'MISSING')
                if sections == 'MISSING':
                    print(f"[DOC SERVICE] sections: MISSING")
                elif not isinstance(sections, list):
                    print(f"[DOC SERVICE] sections: NOT A LIST (type: {type(sections).__name__})")
                else:
                    print(f"[DOC SERVICE] sections count: {len(sections)}")
                    for i, section in enumerate(sections[:5]):  # Print first 5 sections
                        if isinstance(section, dict):
                            print(f"[DOC SERVICE]   Section {i}: title='{section.get('title', 'MISSING')}', content_len={len(section.get('content', ''))}")
                        else:
                            print(f"[DOC SERVICE]   Section {i}: INVALID (type: {type(section).__name__})")
                    if len(sections) > 5:
                        print(f"[DOC SERVICE]   ... and {len(sections) - 5} more sections")
        except json.JSONDecodeError as e:
            print(f"[DOC SERVICE] Body is not valid JSON: {e}")
            print(f"[DOC SERVICE] Raw body preview: {body[:500]}")

        # Reconstruct the request with the body we consumed
        async def receive():
            return {"type": "http.request", "body": body}
        request = Request(request.scope, receive)

    print(f"{'='*60}")

    response = await call_next(request)

    print(f"[DOC SERVICE] Response status: {response.status_code}")
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors and log details"""
    print(f"\n{'='*60}")
    print(f"[DOC SERVICE] VALIDATION ERROR (422)")
    print(f"[DOC SERVICE] Errors: {exc.errors()}")
    print(f"{'='*60}\n")

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions and log details"""
    print(f"\n{'='*60}")
    print(f"[DOC SERVICE] UNEXPECTED ERROR")
    print(f"[DOC SERVICE] Error type: {type(exc).__name__}")
    print(f"[DOC SERVICE] Error message: {str(exc)}")
    print(f"[DOC SERVICE] Full traceback:")
    print(traceback.format_exc())
    print(f"{'='*60}\n")

    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "doc-service"}


@app.post("/format")
def format_docs(request: DocRequest):
    print(f"[DOC SERVICE] Processing format request for: {request.repo_name}")
    print(f"[DOC SERVICE] Number of sections: {len(request.sections)}")

    for i, section in enumerate(request.sections):
        print(f"[DOC SERVICE] Formatting section {i}: '{section.title}' ({len(section.content)} chars)")

    try:
        zip_bytes = formatter.format(request.repo_name, request.sections)
        print(f"[DOC SERVICE] Generated ZIP: {len(zip_bytes)} bytes")

        zip_filename = f"{request.repo_name}-docs.zip"

        return StreamingResponse(
            io.BytesIO(zip_bytes),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={zip_filename}"}
        )
    except Exception as e:
        print(f"[DOC SERVICE] Error in format_docs: {type(e).__name__}: {e}")
        print(traceback.format_exc())
        raise
