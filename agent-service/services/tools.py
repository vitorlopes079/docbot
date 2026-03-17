from crewai.tools import BaseTool

class ReadFileTool(BaseTool):
    name: str = "read_file"
    description: str = "Reads the content of a source file from the cloned repository. Pass the full file path as input."

    def _run(self, file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            return f"[Skipped: {file_path} is a binary file]"
        except FileNotFoundError:
            return f"[Error: {file_path} not found]"
        except Exception as e:
            return f"[Error reading {file_path}: {str(e)}]"