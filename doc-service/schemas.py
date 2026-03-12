from pydantic import BaseModel
from typing import List

class DocumentationSection(BaseModel):
    title: str
    content: str

class DocRequest(BaseModel):
    repo_name: str
    sections: List[DocumentationSection]
    total_sections: int

class DocResponse(BaseModel):
    repo_name: str
    total_files: int
    message: str