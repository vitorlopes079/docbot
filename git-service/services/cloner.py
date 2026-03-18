# Responsible for cloning a GitHub repository to a temporary folder
# and cleaning up after we're done with it

import os
import re
import tempfile
import requests
from git import Repo
from fastapi import HTTPException

class ClonerService:

    def clone(self, github_url: str) -> str:
        self._check_repo_size(github_url)
        temp_dir = tempfile.mkdtemp()
        Repo.clone_from(github_url, temp_dir)
        return temp_dir

    def _check_repo_size(self, github_url: str):
        match = re.match(r"https://github\.com/([^/]+)/([^/]+?)(?:\.git)?$", github_url)
        if not match:
            return

        owner, repo = match.groups()

        try:
            response = requests.get(f"https://api.github.com/repos/{owner}/{repo}")

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Repository not found or is private.")

            if response.status_code == 200:
                size_kb = response.json().get("size", 0)

                if size_kb > 51200:
                    raise HTTPException(status_code=400, detail="Repository too large. Maximum size is 50MB.")

                print(f"Repository size: {size_kb}KB - proceeding with clone")
        except HTTPException:
            raise
        except Exception as e:
            print(f"Warning: Could not check repository size: {e}")
    
    def cleanup(self, temp_dir: str):
        if os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)