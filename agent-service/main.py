# Entry point for the Agent Service
# Receives repository files and returns generated documentation

from fastapi import FastAPI, HTTPException
from schemas import AgentRequest, AgentResponse
from services.agent import AgentService

app = FastAPI(
    title="DocBot - Agent Service",
    description="Analyzes repository files and generates documentation",
    version="1.0.0"
)

agent = AgentService()

@app.get("/health")
def health():
    return {"status": "ok", "service": "agent-service"}

@app.post("/analyze", response_model=AgentResponse)
def analyze_repo(request: AgentRequest):
    print(f"\n{'='*60}")
    print(f"[AGENT SERVICE] Received /analyze request: {len(request.files)} files, repo={request.repo_name}")
    print(f"{'='*60}")
    try:
        result = agent.analyze(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))