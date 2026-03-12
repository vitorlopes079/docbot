# Responsible for cloning a GitHub repository to a temporary folder
# and cleaning up after we're done with it

import os
import tempfile
from git import Repo

class ClonerService:
    
    def clone(self, github_url: str) -> str:
        temp_dir = tempfile.mkdtemp()
        Repo.clone_from(github_url, temp_dir)
        return temp_dir
    
    def cleanup(self, temp_dir: str):
        if os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)