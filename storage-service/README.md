# Storage Service

Handles saving generated documentation ZIP files to Supabase Storage and metadata to Supabase PostgreSQL.

## Port

8005

## Endpoints

### GET /health

Returns service status.

### POST /store

Uploads a ZIP file to Supabase Storage and saves metadata to the database.

**Request body:**

```json
{
  "job_id": "a3f8c2d1-...",
  "repo_name": "docbot",
  "github_url": "https://github.com/username/repo",
  "zip_bytes": "<base64 encoded ZIP>"
}
```

**Response:**

```json
{
  "job_id": "a3f8c2d1-...",
  "repo_name": "docbot",
  "file_url": "https://vigpqmnmbaucdryxekkj.supabase.co/storage/v1/...",
  "message": "Documentation stored successfully!"
}
```

### GET /documents

Returns all stored documentation records.

### GET /documents/{job_id}

Returns a single documentation record by job_id.

## Dependencies

- Supabase project with a `docs` storage bucket
- Supabase `documents` table

## How to run locally

```bash
python3.11 -m venv venv
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8005
```

## Environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key
SUPABASE_BUCKET=docs
```

```

---

All files done! ✅
```

✅ schemas.py
✅ services/storage.py
✅ services/database.py
✅ main.py
✅ Dockerfile
✅ README.md
