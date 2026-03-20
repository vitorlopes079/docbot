"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import JSZip from "jszip";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface MarkdownFile {
  name: string;
  path: string;
  content: string;
}

interface Document {
  job_id: string;
  repo_name: string;
  file_url: string;
  created_at: string;
}

function getDisplayName(path: string): string {
  // Extract just the filename from path
  const parts = path.split("/");
  return parts[parts.length - 1];
}

function getFileIcon(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === "readme.md") return "book";
  if (lower.includes("api")) return "api";
  if (lower.includes("config") || lower.includes("setup")) return "gear";
  if (lower.includes("install") || lower.includes("getting")) return "rocket";
  if (lower.includes("contribut")) return "people";
  if (lower.includes("changelog") || lower.includes("history")) return "history";
  if (lower.includes("license")) return "license";
  return "file";
}

export default function DocViewerPage() {
  const params = useParams();
  const jobId = params.job_id as string;
  const { user } = useAuth();

  const [doc, setDoc] = useState<Document | null>(null);
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch document metadata (public - no auth required)
  useEffect(() => {
    if (jobId) {
      api
        .getRecentDocuments()
        .then((docs) => {
          const found = docs.find((d) => d.job_id === jobId);
          if (found) {
            setDoc(found);
          } else {
            setError("Document not found");
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to fetch document");
          setLoading(false);
        });
    }
  }, [jobId]);

  // Fetch and extract ZIP file
  useEffect(() => {
    if (doc?.file_url) {
      fetch(doc.file_url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch documentation archive");
          return res.arrayBuffer();
        })
        .then(async (buffer) => {
          const zip = await JSZip.loadAsync(buffer);
          const mdFiles: MarkdownFile[] = [];

          // Extract all .md files
          const promises: Promise<void>[] = [];
          zip.forEach((relativePath, file) => {
            if (!file.dir && relativePath.endsWith(".md")) {
              promises.push(
                file.async("string").then((content) => {
                  mdFiles.push({
                    name: getDisplayName(relativePath),
                    path: relativePath,
                    content,
                  });
                })
              );
            }
          });

          await Promise.all(promises);

          // Sort files: README first, then alphabetically
          mdFiles.sort((a, b) => {
            const aIsReadme = a.name.toLowerCase() === "readme.md";
            const bIsReadme = b.name.toLowerCase() === "readme.md";
            if (aIsReadme && !bIsReadme) return -1;
            if (!aIsReadme && bIsReadme) return 1;
            return a.name.localeCompare(b.name);
          });

          setFiles(mdFiles);
          if (mdFiles.length > 0) {
            setActiveFile(mdFiles[0].path);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load documentation");
        })
        .finally(() => setLoading(false));
    }
  }, [doc]);

  const activeContent = files.find((f) => f.path === activeFile);

  // File icon component
  const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "book":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "api":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "gear":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "rocket":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "people":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "history":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "license":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg flex flex-col">
      <Navbar />

      {/* Header bar */}
      <div className="h-12 bg-vscode-surface border-b border-vscode-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href={user ? "/docs" : "/"}
            className="flex items-center gap-2 text-vscode-muted hover:text-vscode-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">{user ? "Back to Docs" : "Back to Home"}</span>
          </Link>
          {doc && (
            <>
              <span className="text-vscode-border">/</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-vscode-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-vscode-text text-sm font-medium">
                  {doc.repo_name}
                  <span className="text-vscode-muted">.zip</span>
                </span>
              </div>
            </>
          )}
        </div>

        {doc && (
          <a
            href={doc.file_url}
            download
            className="px-4 py-1.5 bg-vscode-accent hover:bg-vscode-accent-hover rounded text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download ZIP
          </a>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="w-8 h-8 animate-spin text-vscode-accent"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div className="text-vscode-muted text-sm">
                <span className="text-vscode-comment">{"// "}</span>
                Extracting documentation...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 bg-vscode-error/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-vscode-error/30">
                <svg
                  className="w-8 h-8 text-vscode-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-vscode-error mb-4">{error}</p>
              {doc && (
                <a
                  href={doc.file_url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-vscode-accent hover:bg-vscode-accent-hover rounded text-sm font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download ZIP Instead
                </a>
              )}
              <Link
                href="/docs"
                className="block mt-4 text-vscode-muted hover:text-vscode-accent transition-colors text-sm"
              >
                Back to Documents
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar - File Explorer */}
            <aside className="w-72 bg-vscode-sidebar border-r border-vscode-border flex flex-col flex-shrink-0">
              {/* Sidebar header */}
              <div className="h-9 bg-vscode-surface border-b border-vscode-border flex items-center px-4">
                <div className="flex items-center gap-2 text-xs text-vscode-muted uppercase tracking-wider">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span>Explorer</span>
                </div>
              </div>

              {/* Folder header */}
              <div className="px-2 py-2 border-b border-vscode-border">
                <div className="flex items-center gap-2 px-2 py-1 text-vscode-text text-sm">
                  <svg className="w-4 h-4 text-vscode-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <svg className="w-4 h-4 text-vscode-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="font-medium truncate">{doc?.repo_name || "docs"}</span>
                </div>
              </div>

              {/* File list */}
              <nav className="flex-1 overflow-y-auto py-1">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setActiveFile(file.path)}
                    className={`w-full text-left px-2 py-0.5 transition-all duration-100 group ${
                      activeFile === file.path
                        ? "bg-vscode-accent/20"
                        : "hover:bg-vscode-accent/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 pl-6 pr-2 py-1.5">
                      <span
                        className={`transition-colors ${
                          activeFile === file.path
                            ? "text-vscode-accent"
                            : "text-vscode-muted group-hover:text-vscode-keyword"
                        }`}
                      >
                        <FileIcon type={getFileIcon(file.name)} />
                      </span>
                      <span
                        className={`text-sm truncate transition-colors ${
                          activeFile === file.path
                            ? "text-vscode-text"
                            : "text-vscode-muted group-hover:text-vscode-text"
                        }`}
                      >
                        {file.name}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Sidebar footer */}
              <div className="px-4 py-3 border-t border-vscode-border bg-vscode-bg">
                <div className="text-xs text-vscode-muted">
                  <span className="text-vscode-comment">{"// "}</span>
                  {files.length} {files.length === 1 ? "file" : "files"}
                </div>
              </div>
            </aside>

            {/* Content area */}
            <main className="flex-1 overflow-hidden flex flex-col bg-vscode-bg">
              {/* Tab bar */}
              {activeContent && (
                <div className="h-9 bg-vscode-surface border-b border-vscode-border flex items-center px-2 flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1 bg-vscode-bg border-t-2 border-vscode-accent rounded-t text-sm">
                    <span className="text-vscode-keyword">
                      <FileIcon type={getFileIcon(activeContent.name)} />
                    </span>
                    <span className="text-vscode-text">{activeContent.name}</span>
                  </div>
                </div>
              )}

              {/* Markdown content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                  {activeContent && (
                    <article className="markdown-content animate-fade-in">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold text-vscode-highlight mt-0 mb-6 pb-4 border-b border-vscode-border">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-bold text-vscode-highlight mt-10 mb-4 pb-2 border-b border-vscode-border/50">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-semibold text-vscode-text mt-8 mb-3">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-lg font-semibold text-vscode-text mt-6 mb-2">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-vscode-text leading-relaxed mb-4">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-vscode-text">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-vscode-text">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-vscode-text leading-relaxed">{children}</li>
                          ),
                          code: ({ className, children }) => {
                            const isInline = !className;
                            if (isInline) {
                              return (
                                <code className="bg-vscode-surface px-1.5 py-0.5 rounded text-vscode-string text-sm font-mono">
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code className="block text-sm text-vscode-text font-mono">
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="bg-vscode-surface border border-vscode-border rounded-lg p-4 overflow-x-auto mb-4 text-sm">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-vscode-accent bg-vscode-accent/5 pl-4 pr-4 py-2 italic text-vscode-muted my-4 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => {
                            // Check if it's an external URL
                            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");

                            if (isExternal) {
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-vscode-accent hover:text-vscode-accent-hover underline underline-offset-2 transition-colors"
                                >
                                  {children}
                                </a>
                              );
                            }

                            // Check if it's a link to another .md file in our list
                            const targetFile = files.find(
                              (f) => f.name === href || f.path === href || f.path.endsWith(`/${href}`)
                            );

                            if (targetFile) {
                              return (
                                <button
                                  onClick={() => setActiveFile(targetFile.path)}
                                  className="text-vscode-accent hover:text-vscode-accent-hover underline underline-offset-2 transition-colors"
                                >
                                  {children}
                                </button>
                              );
                            }

                            // For other relative links (like .htm files), just render as plain text
                            return (
                              <span className="text-vscode-text">
                                {children}
                              </span>
                            );
                          },
                          hr: () => <hr className="border-vscode-border my-8" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-6 rounded-lg border border-vscode-border">
                              <table className="min-w-full">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-vscode-surface">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-3 text-left text-vscode-text font-semibold border-b border-vscode-border text-sm">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-3 text-vscode-text border-b border-vscode-border/50 text-sm">
                              {children}
                            </td>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-vscode-highlight">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-vscode-text">{children}</em>
                          ),
                          img: ({ src, alt }) => (
                            <img
                              src={src}
                              alt={alt || ""}
                              className="max-w-full h-auto rounded-lg border border-vscode-border my-4"
                            />
                          ),
                        }}
                      >
                        {activeContent.content}
                      </ReactMarkdown>
                    </article>
                  )}
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
