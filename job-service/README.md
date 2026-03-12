# Job Service

Manages async documentation generation jobs. Receives a GitHub URL, creates a job and runs the full pipeline (git → agent → doc) in the background.

## Port

8004

## Endpoints

### GET /health

Returns service status.

### POST /jobs

Creates a new documentation job and starts the pipeline in the background.

**Request body:**

```json
{
  "github_url": "https://github.com/username/repo"
}
```

**Response:**

```json
{
  "job_id": "a3f8c2d1-...",
  "status": "pending",
  "message": "Job created! Documentation is being generated..."
}
```

### GET /jobs/{job_id}

Returns the current status of a job. Use this to poll for progress.

**Response:**

```json
{
  "job_id": "a3f8c2d1-...",
  "status": "processing_git",
  "progress": 10,
  "message": "Cloning repository...",
  "download_url": null
}
```

## Job statuses

```text
pending           → job created, not started yet
processing_git    → cloning repository (10%)
processing_agent  → analyzing code with AI (40%)
processing_doc    → formatting documentation (70%)
completed         → done, download_url is available (100%)
failed            → something went wrong
```

## How to run locally

```bash
python3.11 -m venv venv
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8004
```

## Dependencies

- Redis must be running on localhost:6379
- git-service must be running on localhost:8001
- agent-service must be running on localhost:8002
- doc-service must be running on localhost:8003

```

---

That's all files done! ✅
```

✅ schemas.py
✅ services/job_store.py
✅ services/pipeline.py
✅ main.py
✅ Dockerfile
✅ README.md
