#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start Redis
docker run -d -p 6379:6379 --name docbot-redis redis:7 2>/dev/null || echo "Redis already running"

# Start all services in background
cd "$ROOT/api-gateway" && source venv/bin/activate && uvicorn main:app --reload --port 8000 &
cd "$ROOT/git-service" && source venv/bin/activate && uvicorn main:app --reload --port 8001 &
cd "$ROOT/agent-service" && source venv/bin/activate && uvicorn main:app --reload --port 8002 &
cd "$ROOT/doc-service" && source venv/bin/activate && uvicorn main:app --reload --port 8003 &
cd "$ROOT/job-service" && source venv/bin/activate && uvicorn main:app --reload --port 8004 &
cd "$ROOT/storage-service" && source venv/bin/activate && uvicorn main:app --reload --port 8005 &
cd "$ROOT/auth-service" && source venv/bin/activate && uvicorn main:app --reload --port 8006 &
cd "$ROOT/notification-service" && source venv/bin/activate && uvicorn main:app --reload --port 8007 &
cd "$ROOT/frontend" && npm run dev &

# Keep script running, Ctrl+C kills all
wait