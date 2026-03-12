import zipfile
import io
from schemas import DocumentationSection
from typing import List


class FormatterService:

    def format(self, repo_name: str, sections: List[DocumentationSection]) -> bytes:
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:

            index_content = f"# {repo_name} Documentation\n\n## Sections\n\n"

            for i, section in enumerate(sections):
                file_name = self._slugify(section.title)
                file_path = f"{file_name}.md"

                markdown_content = f"# {section.title}\n\n{section.content}\n"
                zip_file.writestr(file_path, markdown_content)

                index_content += f"- [{section.title}](./{file_path})\n"

            zip_file.writestr("index.md", index_content)

        zip_buffer.seek(0)
        return zip_buffer.read()

    def _slugify(self, title: str) -> str:
        return title.lower().replace(" ", "-").replace("/", "-")