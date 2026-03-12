# Responsible for reading all files from a cloned repository
# and returning their content as a list

import os
from schemas import FileContent

class ReaderService:

    IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.exe']
    IGNORED_FOLDERS = ['.git', 'node_modules', '__pycache__', '.venv', 'venv']

    def read(self, repo_path: str) -> list[FileContent]:
        files = []

        for root, dirs, filenames in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in self.IGNORED_FOLDERS]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in self.IGNORED_EXTENSIONS):
                    continue

                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, repo_path)

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        files.append(FileContent(path=relative_path, content=content))
                except Exception:
                    continue

        return files