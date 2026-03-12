from pydantic import BaseModel

class FileContent(BaseModel):
    path: str
    content: str

class AgentRequest(BaseModel):
    repo_name: str
    files: list[FileContent]
    total_files: int

class DocumentationSection(BaseModel):
    title: str
    content: str

class AgentResponse(BaseModel):
    repo_name: str
    sections: list[DocumentationSection]
    total_sections: int