# DocBot 🤖

## What is DocBot?

DocBot is an AI-powered tool that automatically generates documentation for any GitHub repository.
Paste a GitHub URL and DocBot will clone the repo, analyze the code and generate full documentation.

## ⚠️ Disclaimer

This project is intentionally over-engineered for learning purposes.
The microservices architecture used here is more complex than necessary for a project of this size.
The goal is to learn and practice real-world concepts like microservices, Docker, AI agents, async queues and cloud storage — not to build the simplest solution possible.

## How it works

```text
User submits GitHub URL
        ↓
API Gateway routes the request
        ↓
Git Service clones & reads the repo
        ↓
Agent Service analyzes code with Claude AI
        ↓
Doc Service formats the documentation
        ↓
Storage Service saves to S3
        ↓
User receives a documentation link
```

## Services

| Service                | Description                             | Port |
| ---------------------- | --------------------------------------- | ---- |
| `api-gateway`          | Single entry point for all requests     | 8000 |
| `git-service`          | Clones repos and extracts file contents | 8001 |
| `agent-service`        | AI agents that analyze code with Claude | 8002 |
| `doc-service`          | Formats and structures documentation    | 8003 |
| `job-service`          | Manages async jobs with Celery + Redis  | 8004 |
| `storage-service`      | Saves generated docs to S3              | 8005 |
| `auth-service`         | Handles login and JWT tokens            | 8006 |
| `notification-service` | Sends email alerts when docs are ready  | 8007 |
| `frontend`             | Web interface for users                 | 3000 |

## Tech Stack

- **Python** → all backend services
- **FastAPI** → API framework
- **CrewAI** → AI agent orchestration
- **Claude API** → AI model for code analysis
- **Celery + Redis** → async job queue
- **Docker** → containerization
- **AWS S3** → documentation storage

## How to run

```bash
docker-compose up
```

## Services Status

| Service                | Status         |
| ---------------------- | -------------- |
| `git-service`          | ✅ Done        |
| `agent-service`        | 🔄 In progress |
| `doc-service`          | ⏳ Pending     |
| `job-service`          | ⏳ Pending     |
| `storage-service`      | ⏳ Pending     |
| `api-gateway`          | ⏳ Pending     |
| `auth-service`         | ⏳ Pending     |
| `notification-service` | ⏳ Pending     |
| `frontend`             | ⏳ Pending     |
