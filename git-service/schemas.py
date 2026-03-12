from pydantic import BaseModel

class CloneRequest(BaseModel):
    github_url: str

class FileContent(BaseModel):
    path: str
    content: str

class CloneResponse(BaseModel):
    repo_name: str
    files: list[FileContent]
    total_files: int
