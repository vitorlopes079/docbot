# DocBot Agent Service — Master Notes
# CRITICAL: Read this before working on agent-service
# Last updated: March 2026

---

## PROJECT CONTEXT

Building **DocBot** — AI-powered GitHub repo documentation generator.
Repo: https://github.com/vitorlopes079/docbot.git

The **agent-service** (port 8002) is currently MOCKED.
Goal: Replace mock with real CrewAI + Claude Haiku agents.

---

## AGENT SERVICE LOCATION

```
docbot/agent-service/
├── main.py
├── schemas.py
├── requirements.txt
├── Dockerfile
└── services/
    ├── __init__.py
    └── agent.py        ← THIS IS WHERE THE REAL CREW GOES
```

Current mock in agent.py returns 4 fake documentation sections.
We need to replace it with a real CrewAI crew.

---

## THE "THINK LIKE A BOSS" FRAMEWORK (from CrewAI tutorial)

Work BACKWARDS from the goal, then hire employees top-down:

```
GOAL → Captain (manager) → Expert (mid-level) → Worker (executor)
```

### DocBot Agent Crew Design:

```
GOAL: Generate complete documentation for a GitHub repo

Agent 1 — Documentation Architect (Captain)
  role:      "Documentation Architect"
  goal:      "Produce a complete, structured documentation plan
               for the given codebase covering architecture,
               setup, usage and API reference"
  backstory: "I am an expert in software documentation with
               decades of experience turning complex codebases
               into clear, readable docs."
  tools:     none (synthesizes output from others)

Agent 2 — Code Analyst (Expert)
  role:      "Code Analyst"
  goal:      "Analyze the provided source files and produce a
               detailed technical summary of what each component
               does, how they connect, and what patterns are used"
  backstory: "I am an expert software engineer who specializes
               in reading and understanding codebases of any size
               or language."
  tools:     file reader tool

Agent 3 — Documentation Writer (Worker)
  role:      "Documentation Writer"
  goal:      "Transform technical analysis into clear, well-structured
               markdown documentation sections that any developer
               can understand"
  backstory: "I am a senior technical writer with expertise in
               creating developer documentation, README files,
               and API references."
  tools:     none
```

---

## THE 4 RULES FOR GREAT AGENTS (from tutorial)

```
role       → job title only, short
goal       → MUST be results-driven with action verb
             BAD:  "understand the code"
             GOOD: "Produce a structured analysis of what this
                    codebase does, its architecture, and how
                    components interact"
backstory  → resume that supports the goal
             Formula: "I am an expert in X and I help teams achieve Y"
tools      → only assign what the agent actually needs
```

> WARNING: Vague goals = garbage output. Be specific about what
> the agent must PRODUCE, not just what it should "do".

---

## THE TASK TEMPLATE (most important part)

Every task must have:

```python
Task(
    description="""
        [WHAT TO DO — clear action verb]
        
        [HOW TO DO IT — step by step instructions]
        
        Your final answer MUST be [exact format expected].
        
        Parameters available to you:
        - {param1}: description of param1
        - {param2}: description of param2
    """,
    agent=agent_instance,
    expected_output="[exact description of output format]"
)
```

### DocBot Tasks:

```
Task 1 — analyze_code_task
  agent:  Code Analyst
  input:  repo files (list of file paths + contents)
  output: "A detailed technical summary covering: 1) project
           purpose, 2) architecture overview, 3) key components
           and what they do, 4) how components connect"

Task 2 — write_docs_task  
  agent:  Documentation Writer
  input:  output from Task 1
  output: "Four markdown sections: Project Overview, Architecture,
           Setup Instructions, API Reference"

Task 3 — review_docs_task
  agent:  Documentation Architect
  input:  output from Task 2
  output: "Final polished documentation ready for publishing,
           with any gaps filled in"
```

---

## HOW TO CONNECT CLAUDE TO CREWAI

```python
from crewai import LLM

llm = LLM(
    model="claude-haiku-4-5-20251001",
    api_key="YOUR_ANTHROPIC_KEY"
)

agent = Agent(
    role="Code Analyst",
    goal="...",
    backstory="...",
    llm=llm
)
```

---

## CUSTOM TOOL PATTERN (for file reading)

```python
from crewai.tools import BaseTool

class ReadFileTool(BaseTool):
    name: str = "read_file"
    description: str = "Reads the content of a source file from the cloned repository"
    
    def _run(self, file_path: str) -> str:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"
```

---

## IDEAL CREW WORKFLOW (from tutorial)

```
One large goal
    ↓
Broken into subtasks (each agent does one thing)
    ↓
Results passed sequentially agent → agent → agent
    ↓
Final agent synthesizes everything into ONE output
```

This matches DocBot perfectly:
```
repo files → Code Analyst → Documentation Writer → Doc Architect → final docs
```

---

## REQUIREMENTS FOR AGENT-SERVICE

```
crewai
anthropic (or openai for LLM routing)
```

Add to agent-service/requirements.txt when implementing.

---

## WHAT THE MOCK CURRENTLY RETURNS

```python
# Current mock output shape (agent.py):
{
    "sections": [
        {"title": "Project Overview", "content": "..."},
        {"title": "Architecture",     "content": "..."},
        {"title": "Setup",            "content": "..."},
        {"title": "API Reference",    "content": "..."}
    ]
}
```

The real CrewAI implementation must return the SAME shape
so the rest of the pipeline (doc-service, storage-service) keeps working.

---

## IMPLEMENTATION PLAN (when ready)

1. Install crewai in agent-service venv
2. Create services/tools.py — ReadFileTool
3. Create services/agents.py — 3 agents with Claude Haiku
4. Create services/tasks.py — 3 tasks with proper templates
5. Update services/agent.py — replace mock with crew.kickoff()
6. Add ANTHROPIC_API_KEY to agent-service/.env
7. Test end-to-end through job-service pipeline

---

## OTHER SERVICES STATUS (for context)

| Service          | Port | Status        |
|------------------|------|---------------|
| api-gateway      | 8000 | ✅ Done        |
| git-service      | 8001 | ✅ Done        |
| agent-service    | 8002 | 🔄 Mocked      | ← WE ARE HERE
| doc-service      | 8003 | ✅ Done        |
| job-service      | 8004 | ✅ Done        |
| storage-service  | 8005 | ✅ Done        |
| auth-service     | 8006 | 🔄 In progress |
| notification     | 8007 | ⏳ Pending     |
| frontend         | 3000 | ⏳ Pending     |