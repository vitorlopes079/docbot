import os
from crewai import Agent, LLM
from dotenv import load_dotenv

load_dotenv()

llm = LLM(
    model=f"gemini/{os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')}",
    api_key=os.getenv("GEMINI_API_KEY")
)


def get_code_analyst() -> Agent:
    return Agent(
        role="Code Analyst",
        goal=(
            "Analyze the provided source files and produce a detailed technical "
            "summary of what the project does, its architecture, key components, "
            "and how they connect to each other"
        ),
        backstory=(
            "I am an expert software engineer who specializes in reading and "
            "understanding codebases of any size or language. I help teams "
            "produce clear technical summaries from raw source code."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def get_documentation_writer() -> Agent:
    return Agent(
        role="Documentation Writer",
        goal=(
            "Transform technical analysis into clear, well-structured markdown "
            "documentation sections that any developer can understand, covering "
            "project overview, architecture, setup and API reference"
        ),
        backstory=(
            "I am a senior technical writer with expertise in creating developer "
            "documentation, README files, and API references. I help engineering "
            "teams turn complex technical analysis into readable documentation."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def get_documentation_architect() -> Agent:
    return Agent(
        role="Documentation Architect",
        goal=(
            "Review and polish the documentation produced by the writer, fill any "
            "gaps, ensure consistency, and produce the final complete documentation "
            "ready for publishing"
        ),
        backstory=(
            "I am an expert in software documentation architecture with decades of "
            "experience turning complex codebases into clear, readable docs. I ensure "
            "documentation is complete, consistent and useful for developers."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )