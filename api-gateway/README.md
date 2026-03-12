# API Gateway

Single entry point for all DocBot services. Routes incoming requests to the appropriate microservice.

## Port

8000

## Endpoints

### GET /health

Returns gateway status.

### POST /jobs

Creates a new documentation job.
Forwards to: job-service

**Request body:**

```json
{
  "github_url": "https://github.com/username/repo"
}
```

### GET /jobs/{job_id}

Returns the current status of a job.
Forwards to: job-service

### GET /documents

Returns all stored documentation records.
Forwards to: storage-service

### GET /documents/{job_id}

Returns a single documentation record by job_id.
Forwards to: storage-service

## How to run locally

```bash
python3.11 -m venv venv
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment variables

```text
JOB_SERVICE_URL=http://localhost:8004
STORAGE_SERVICE_URL=http://localhost:8005
```

```

---

All files done! ✅
```

✅ main.py
✅ requirements.txt
✅ Dockerfile
✅ README.md

```

Also create a `.env` file:
```

JOB_SERVICE_URL=http://localhost:8004
STORAGE_SERVICE_URL=http://localhost:8005
