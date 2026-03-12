# Agent Service 🤖

## What does this service do?

This service is responsible for:

1. Receiving repository files from the Git Service
2. Analyzing the code and generating documentation
3. Returning structured documentation sections

## ⚠️ Current Status

This service is currently **mocked** — it returns hardcoded documentation.
Real AI-powered documentation using Claude API coming in a later stage.

## Where does it fit in DocBot?

```text
Git Service sends file contents
        ↓
Agent Service analyzes the code   ← YOU ARE HERE
        ↓
Doc Service formats the output
```

## API Endpoints

| Method | Endpoint | Description                                            |
| ------ | -------- | ------------------------------------------------------ |
| POST   | /analyze | Receives repo files and returns documentation sections |
| GET    | /health  | Checks if service is running                           |

## Input

```json
{
  "repo_name": "docbot",
  "total_files": 3,
  "files": [
    {
      "path": "src/main.py",
      "content": "def hello(): ..."
    }
  ]
}
```

## Output

```json
{
  "repo_name": "docbot",
  "total_sections": 4,
  "sections": [
    {
      "title": "Project Overview",
      "content": "..."
    }
  ]
}
```

## Tech Stack

- **FastAPI** → API framework
- **Pydantic** → validates input/output data
- **Uvicorn** → runs the FastAPI server
- **Claude API** → coming soon! 🔜

## How to run locally

```bash
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```
