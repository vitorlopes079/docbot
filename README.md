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
Agent Service analyzes code with AI agents
        ↓
Doc Service formats the documentation
        ↓
Storage Service saves to S3 + PostgreSQL
        ↓
User navigates docs online or downloads ZIP
```

## AI Agents

DocBot uses **CrewAI** to orchestrate a team of three AI agents that work together sequentially to analyze code and generate documentation.

### The Agents

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Code Analyst** | Technical Analysis | Analyzes source files and produces detailed technical summaries covering architecture, key components, interactions, and technologies used |
| **Documentation Writer** | Content Creation | Transforms technical analysis into clear, well-structured markdown documentation with sections for Overview, Architecture, Setup, and API Reference |
| **Documentation Architect** | Quality Control | Reviews and polishes all documentation sections, ensures consistency in tone and formatting, and prepares the final output for publishing |

### How the Agents Work Together

```text
Repository Files (from Git Service)
        ↓
Preprocessing: Filters junk files and summarizes code in batches
        ↓
Code Analyst: Produces detailed technical summary
        ↓
Documentation Writer: Creates 4 markdown sections
        ↓
Documentation Architect: Reviews, polishes, and finalizes
        ↓
Final Documentation Output
```

**Preprocessing Step:** Before the agents analyze the code, the system filters out non-essential files (like `node_modules`, `.git`, lock files, images, etc.) and creates condensed summaries of the remaining files in batches. This reduces the amount of data the agents need to process.

**LLM Backend:** The agents use Google Gemini 2.5 Flash as the underlying language model for analysis and generation.

## Services

| Service                | Description                                 | Port |
| ---------------------- | ------------------------------------------- | ---- |
| `api-gateway`          | Single entry point for all requests         | 8000 |
| `git-service`          | Clones repos and extracts file contents     | 8001 |
| `agent-service`        | AI agents that analyze code with Claude     | 8002 |
| `doc-service`          | Formats and structures documentation        | 8003 |
| `job-service`          | Manages async jobs with Celery + Redis      | 8004 |
| `storage-service`      | Saves generated docs to S3 + PostgreSQL     | 8005 |
| `auth-service`         | Handles login and JWT tokens                | 8006 |
| `notification-service` | Sends email alerts when docs are ready      | 8007 |
| `frontend`             | Web interface to navigate and download docs | 3000 |

## Tech Stack

- **Python** → all backend services
- **FastAPI** → API framework
- **CrewAI** → AI agent orchestration
- **Claude API** → AI model for code analysis
- **Redis** → job queue and status tracking
- **Docker** → containerization
- **Supabase** → PostgreSQL database + file storage

## What users get

- 🌐 A page to navigate their documentation online
- 📦 A download button to get the docs as a ZIP
- 📚 A history of all their past documentation requests

## How to run

```bash
docker-compose up
```

## Services Status

| Service                | Status           |
| ---------------------- | ---------------- |
| `git-service`          | ✅ Done          |
| `agent-service`        | ✅ Done          |
| `doc-service`          | ✅ Done          |
| `job-service`          | ✅ Done          |
| `storage-service`      | ✅ Done          |
| `api-gateway`          | ✅ Done          |
| `auth-service`         | ✅ Done          |
| `notification-service` | ⏳ Pending       |
| `frontend`             | ✅ Done          |

## Next Steps

- **Email Provider Integration** → Set up a third-party email service (e.g., SendGrid, Resend, AWS SES) to enable:
  - Contact form functionality
  - Forgot password / password reset flow
  - Notifications when documentation is ready
