"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Document {
  job_id: string;
  repo_name: string;
  file_url: string;
  created_at: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api
        .getDocuments()
        .then(setDocs)
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to fetch docs")
        )
        .finally(() => setLoading(false));
    }
  }, [user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-vscode-bg">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-vscode-muted">
            <svg
              className="w-5 h-5 animate-spin text-vscode-accent"
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
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header with VSCode panel style */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-vscode-error" />
                <div className="w-3 h-3 rounded-full bg-vscode-warning" />
                <div className="w-3 h-3 rounded-full bg-vscode-success" />
              </div>
              <span className="text-vscode-muted text-sm">explorer.ts</span>
            </div>
            <h1 className="text-2xl font-bold text-vscode-text">
              <span className="text-vscode-keyword">class</span>{" "}
              <span className="text-vscode-highlight">MyDocuments</span>
            </h1>
          </div>
          <Link
            href="/generate"
            className="shimmer-btn px-4 py-2 bg-vscode-accent hover:bg-vscode-accent-hover rounded text-sm font-medium transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Doc
          </Link>
        </div>

        {/* File explorer panel */}
        <div className="bg-vscode-sidebar border border-vscode-border rounded-lg overflow-hidden">
          {/* Explorer header */}
          <div className="h-10 bg-vscode-surface border-b border-vscode-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-vscode-accent"
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
              <span className="text-vscode-text">EXPLORER</span>
            </div>
            <span className="text-xs text-vscode-muted">
              {docs.length} {docs.length === 1 ? "file" : "files"}
            </span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-vscode-surface border border-vscode-border rounded animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-vscode-error/10 border border-vscode-error/30 rounded-lg p-4 text-center">
                <svg
                  className="w-8 h-8 text-vscode-error mx-auto mb-2"
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
                <p className="text-vscode-error">{error}</p>
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-vscode-surface rounded-lg flex items-center justify-center mx-auto mb-4 border border-vscode-border">
                <svg
                  className="w-8 h-8 text-vscode-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-vscode-muted mb-1">
                <span className="text-vscode-comment">{"// "}</span>
                No documentation files found
              </p>
              <p className="text-vscode-muted text-sm mb-6">
                <span className="text-vscode-comment">{"// "}</span>
                Generate your first docs to get started
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-vscode-accent hover:text-vscode-accent-hover transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Generate your first docs
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-vscode-border">
              {docs.map((doc, index) => (
                <Link
                  key={doc.job_id}
                  href={`/docs/${doc.job_id}`}
                  className="file-tree-item group hover:bg-vscode-accent/5 block"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Line number */}
                    <span className="text-vscode-muted text-sm w-8 text-right select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* File icon */}
                    <svg
                      className="w-5 h-5 text-vscode-keyword flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-vscode-text group-hover:text-vscode-highlight transition-colors truncate">
                        {doc.repo_name}
                        <span className="text-vscode-muted">.zip</span>
                      </h3>
                      <p className="text-xs text-vscode-muted mt-0.5">
                        <span className="text-vscode-comment">
                          {"// "}Modified:{" "}
                        </span>
                        {formatDate(doc.created_at)}
                      </p>
                    </div>

                    {/* Action buttons - visible on hover */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View indicator */}
                      <span className="px-4 py-2 bg-vscode-accent rounded text-sm font-medium flex items-center gap-2">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </span>

                      {/* Download button */}
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(doc.file_url, "_blank");
                        }}
                        className="px-4 py-2 bg-vscode-surface hover:bg-vscode-border border border-vscode-border rounded text-sm font-medium transition-colors flex items-center gap-2 text-vscode-text cursor-pointer"
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
                        Download
                      </span>
                    </div>

                    {/* Always visible icons for mobile */}
                    <div className="flex items-center gap-1 group-hover:hidden">
                      <span className="p-2 text-vscode-accent">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </span>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(doc.file_url, "_blank");
                        }}
                        className="p-2 text-vscode-muted hover:text-vscode-accent hover:bg-vscode-accent/10 rounded transition-all cursor-pointer"
                      >
                        <svg
                          className="w-5 h-5"
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
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Terminal footer */}
          <div className="px-4 py-3 bg-vscode-bg border-t border-vscode-border">
            <div className="flex items-center gap-2 text-xs text-vscode-muted">
              <span className="text-vscode-success">$</span>
              <span className="text-vscode-comment">
                {"// "}
                {docs.length > 0
                  ? `Showing ${docs.length} documentation ${docs.length === 1 ? "file" : "files"}`
                  : "Ready to generate documentation"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
