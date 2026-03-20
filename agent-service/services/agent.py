import os
import time
import google.generativeai as genai
from crewai import Crew, Process
from dotenv import load_dotenv
from schemas import AgentRequest, AgentResponse, DocumentationSection, FileContent
from services.agents import get_code_analyst, get_documentation_writer, get_documentation_architect
from services.tasks import get_analyze_code_task, get_write_docs_task, get_review_docs_task

load_dotenv()

# Configure Gemini for direct API calls (preprocessing)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Directories to skip entirely
SKIP_DIRECTORIES = {
    "node_modules", ".git", "__pycache__", ".next", "dist", "build",
    "venv", ".venv", "env", ".env", "vendor", "coverage", ".cache",
    ".idea", ".vscode", "target", "out", "bin", "obj"
}

# File extensions to skip
SKIP_EXTENSIONS = {
    ".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".min.js", ".min.css", ".map",
    ".pyc", ".pyo", ".so", ".dll", ".exe", ".bin", ".pdf", ".zip",
    ".tar", ".gz", ".rar", ".7z", ".mp3", ".mp4", ".mov", ".avi"
}


def filter_files(files: list[FileContent]) -> list[FileContent]:
    """Filter out junk files that don't need to be analyzed."""
    filtered = []

    for file in files:
        path_lower = file.path.lower()

        # Check if file is in a skip directory
        path_parts = file.path.split("/")
        if any(part in SKIP_DIRECTORIES for part in path_parts):
            continue

        # Check if file has a skip extension
        if any(path_lower.endswith(ext) for ext in SKIP_EXTENSIONS):
            continue

        # Skip empty files
        if not file.content or not file.content.strip():
            continue

        filtered.append(file)

    print(f"Filtered files: {len(files)} -> {len(filtered)} files to process")
    return filtered


def call_gemini_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Call Gemini API with retry logic for rate limits."""
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
    delays = [30, 60, 120]  # Seconds to wait on each retry

    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_str = str(e).lower()
            error_type = type(e).__name__

            # Log full error details
            print(f"[GEMINI ERROR] Exception type: {error_type}")
            print(f"[GEMINI ERROR] Full message: {e}")

            # Try to extract status code and response details if available
            if hasattr(e, 'status_code'):
                print(f"[GEMINI ERROR] Status code: {e.status_code}")
            if hasattr(e, 'response'):
                print(f"[GEMINI ERROR] Response: {e.response}")
            if hasattr(e, 'message'):
                print(f"[GEMINI ERROR] Message: {e.message}")

            # Check if it's a rate limit error
            if "429" in str(e) or "rate" in error_str or "quota" in error_str:
                if attempt < max_retries:
                    wait_time = delays[attempt]
                    print(f"[GEMINI RETRY] Rate limit detected, waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                    time.sleep(wait_time)
                else:
                    print(f"[GEMINI RETRY] Rate limit persists after {max_retries} retries, raising error")
                    raise
            else:
                # Not a rate limit error, raise immediately
                print(f"[GEMINI ERROR] Non-retryable error, raising immediately")
                raise


def preprocess_files(files: list[FileContent]) -> str:
    """
    Preprocess files by summarizing them in batches.
    Returns a condensed summary string for the agents to work with.
    """
    # First filter out junk files
    filtered_files = filter_files(files)

    if not filtered_files:
        return "No source code files found to analyze."

    # Split into batches of 8 files
    batch_size = 8
    batches = []
    for i in range(0, len(filtered_files), batch_size):
        batches.append(filtered_files[i:i + batch_size])

    print(f"Processing {len(filtered_files)} files in {len(batches)} batches...")

    summaries = []

    for i, batch in enumerate(batches):
        print(f"Processing batch {i + 1}/{len(batches)}...")

        # Build batch content
        batch_content = ""
        for file in batch:
            # Truncate very long files to first 200 lines
            lines = file.content.split("\n")
            truncated_content = "\n".join(lines[:200])
            if len(lines) > 200:
                truncated_content += f"\n... (truncated, {len(lines) - 200} more lines)"

            batch_content += f"\n\n=== FILE: {file.path} ===\n{truncated_content}"

        prompt = f"""Summarize these code files briefly. For each file describe in 2-3 sentences what it does and its role in the project. Be concise.

{batch_content}

Provide a brief summary for each file."""

        try:
            print(f"[GEMINI] Calling Gemini for batch {i + 1}/{len(batches)}...")
            batch_start = time.time()
            summary = call_gemini_with_retry(prompt)
            batch_elapsed = int((time.time() - batch_start) * 1000)
            print(f"[GEMINI] Response received for batch {i + 1}/{len(batches)} (time={batch_elapsed}ms)")
            summaries.append(summary)
        except Exception as e:
            error_type = type(e).__name__
            print(f"[BATCH ERROR] Failed processing batch {i + 1}/{len(batches)}")
            print(f"[BATCH ERROR] Exception type: {error_type}")
            print(f"[BATCH ERROR] Full error: {e}")
            print(f"[BATCH ERROR] Files in batch: {[f.path for f in batch]}")
            # Add a fallback summary for failed batches
            file_list = ", ".join([f.path for f in batch])
            summaries.append(f"Files in this batch ({file_list}): Could not be summarized due to an error.")

        # Wait between batches to avoid rate limits
        if i < len(batches) - 1:
            print(f"Batch {i + 1} complete, waiting 3s...")
            time.sleep(3)

    # Combine all summaries
    condensed_summary = "\n\n".join(summaries)

    # Add a file list header
    file_list = "\n".join([f"- {f.path}" for f in filtered_files])
    header = f"""## Repository Files ({len(filtered_files)} files)
{file_list}

## File Summaries
"""

    print(f"Preprocessing complete. Generated condensed summary.")
    return header + condensed_summary


class AgentService:

    def analyze(self, request: AgentRequest) -> AgentResponse:

        # Step 1: Preprocess files into a condensed summary
        print("Starting file preprocessing...")
        condensed_summary = preprocess_files(request.files)

        # Create our three agents
        code_analyst = get_code_analyst()
        doc_writer = get_documentation_writer()
        doc_architect = get_documentation_architect()

        # Create our three tasks with condensed summary
        analyze_task = get_analyze_code_task(code_analyst, condensed_summary)
        write_task = get_write_docs_task(doc_writer, request.repo_name)
        review_task = get_review_docs_task(doc_architect, request.repo_name)

        # Step callback to add delay between agent calls
        def step_callback(step_output):
            print(f"Agent task completed, waiting 5s before next task...")
            time.sleep(5)

        # Assemble the crew with step callback
        crew = Crew(
            agents=[code_analyst, doc_writer, doc_architect],
            tasks=[analyze_task, write_task, review_task],
            process=Process.sequential,
            verbose=True,
            step_callback=step_callback,
        )

        # Kick it off!
        print("Starting CrewAI agents...")
        result = crew.kickoff()

        # Parse the result into our sections format
        sections = self._parse_result(str(result))

        # DEBUG: Print what we're returning
        print(f"[DEBUG] Agent service returning {len(sections)} sections for {request.repo_name}")
        for i, section in enumerate(sections):
            print(f"[DEBUG] Section {i}: '{section.title}' ({len(section.content)} chars)")

        response = AgentResponse(
            repo_name=request.repo_name,
            sections=sections,
            total_sections=len(sections)
        )
        print(f"[DEBUG] AgentResponse created successfully")
        return response

    def _parse_result(self, result: str) -> list[DocumentationSection]:
        sections = []
        current_title = None
        current_content = []

        for line in result.split("\n"):
            if line.startswith("## "):
                if current_title:
                    sections.append(DocumentationSection(
                        title=current_title,
                        content="\n".join(current_content).strip()
                    ))
                current_title = line.replace("## ", "").strip()
                current_content = []
            else:
                current_content.append(line)

        if current_title:
            sections.append(DocumentationSection(
                title=current_title,
                content="\n".join(current_content).strip()
            ))

        if not sections:
            sections.append(DocumentationSection(
                title="Documentation",
                content=result
            ))

        return sections
