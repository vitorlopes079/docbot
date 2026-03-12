# Doc Service

Receives documentation sections from agent-service and formats them into a downloadable ZIP file containing markdown files.

## Port

8003

## Endpoints

### GET /health

Returns service status.

### POST /format

Receives documentation sections and returns a ZIP file.

**Request body:**

```json
{
  "repo_name": "my-repo",
  "total_sections": 2,
  "sections": [
    {
      "title": "Project Overview",
      "content": "This is the project..."
    }
  ]
}
```

**Response:** ZIP file download containing:

- index.md
- one .md file per section

## How to run locally

```bash
python3.11 -m venv venv
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8003
```

```

---

That's all 5 files done! ✅
```

✅ schemas.py
✅ services/formatter.py
✅ main.py
✅ Dockerfile
✅ README.md
