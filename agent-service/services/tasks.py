from crewai import Task, Agent


def get_analyze_code_task(agent: Agent, condensed_summary: str) -> Task:
    return Task(
        description=f"""
            Analyze the repository based on the file summaries provided below.
            These summaries describe each source file and its role in the project.

            {condensed_summary}

            Your job is to:
            1. Understand what the project does and its main purpose
            2. Identify the architecture and how components are structured
            3. Identify the key components and what each one does
            4. Understand how the components connect and interact

            Your final answer MUST be a detailed technical summary covering:
            - Project purpose and what problem it solves
            - Architecture overview
            - Key components and what they do
            - How components connect and interact
            - Technologies and frameworks used
        """,
        agent=agent,
        expected_output=(
            "A detailed technical summary covering project purpose, "
            "architecture, key components, their interactions, and "
            "technologies used."
        ),
    )


def get_write_docs_task(agent: Agent, repo_name: str) -> Task:
    return Task(
        description=f"""
            Using the technical analysis provided to you, write complete
            documentation for the repository: {repo_name}

            Your job is to transform the technical analysis into four
            clear markdown documentation sections:

            1. Project Overview
               - What the project does
               - What problem it solves
               - Who it is for

            2. Architecture
               - High level architecture description
               - Key components and their responsibilities
               - How data flows through the system

            3. Setup Instructions
               - Prerequisites
               - Installation steps
               - Environment variables needed
               - How to run the project

            4. API Reference
               - Available endpoints or public interfaces
               - What each one does
               - Expected inputs and outputs

            Write in clear, simple English that any developer can understand.
            Use markdown formatting with headers, bullet points and code blocks.

            Your final answer MUST be the four sections above in markdown format,
            clearly separated with ## headers.
        """,
        agent=agent,
        expected_output=(
            "Four markdown sections: Project Overview, Architecture, "
            "Setup Instructions, and API Reference."
        ),
    )


def get_review_docs_task(agent: Agent, repo_name: str) -> Task:
    return Task(
        description=f"""
            Review and polish the documentation written for: {repo_name}

            Your job is to:
            1. Read through all four documentation sections
            2. Fix any gaps or missing information
            3. Ensure consistency in tone and formatting
            4. Make sure each section is complete and useful
            5. Ensure the documentation is ready for publishing

            Your final answer MUST be the complete polished documentation
            with all four sections:
            - Project Overview
            - Architecture
            - Setup Instructions
            - API Reference

            Each section must start with a ## header.
            Use clean markdown formatting throughout.
        """,
        agent=agent,
        expected_output=(
            "Complete polished documentation with four sections: "
            "Project Overview, Architecture, Setup Instructions, "
            "and API Reference, ready for publishing."
        ),
    )