# Git Service 🔍

## What does this service do?

This service is responsible for:

1. Receiving a GitHub URL
2. Cloning the repository to a temporary folder
3. Reading all files recursively
4. Returning the content to whoever called it

## Where does it fit in DocBot?

```text
User submits GitHub URL
        ↓
API Gateway receives it
        ↓
Git Service clones & reads the repo   ← YOU ARE HERE
        ↓
Agent Service generates documentation
```

## API Endpoints

| Method | Endpoint | Description                                         |
| ------ | -------- | --------------------------------------------------- |
| POST   | /clone   | Receives a GitHub URL and returns all file contents |
| GET    | /health  | Checks if service is running                        |

## Input

```json
{
  "github_url": "https://github.com/user/repo"
}
```

## Output

```json
{
  "repo_name": "repo",
  "files": [
    {
      "path": "src/main.py",
      "content": "def hello(): ..."
    }
  ],
  "total_files": 42
}
```

## Tech Stack

- **FastAPI** → API framework
- **GitPython** → clones and reads repos
- **Pydantic** → validates input/output data
- **Uvicorn** → runs the FastAPI server

## Files explained

| File                 | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `main.py`            | FastAPI entry point, defines the API endpoints |
| `schemas.py`         | Data models for input and output               |
| `services/cloner.py` | Clones the GitHub repo                         |
| `services/reader.py` | Reads all files from cloned repo               |
| `Dockerfile`         | Containerizes the service                      |

## How to run locally

```bash
source venv/bin/activate
python3.11 -m pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Environment Variables

| Variable | Description             | Example |
| -------- | ----------------------- | ------- |
| PORT     | Port to run the service | 8001    |
