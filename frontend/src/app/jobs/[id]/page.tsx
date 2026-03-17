"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface JobStatus {
  job_id: string;
  status: string;
  progress?: number;
  file_url?: string;
}

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchJob = async () => {
      try {
        const data = await api.getJob(id);
        setJob(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch job");
        clearInterval(intervalId);
      }
    };

    fetchJob();
    intervalId = setInterval(fetchJob, 3000);

    return () => clearInterval(intervalId);
  }, [id]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded text-sm font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} status-completed`;
      case "failed":
        return `${baseClasses} status-failed`;
      case "processing":
        return `${baseClasses} status-processing`;
      default:
        return `${baseClasses} status-pending`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <svg
            className="w-5 h-5 text-vscode-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-5 h-5 text-vscode-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "processing":
        return (
          <svg
            className="w-5 h-5 text-vscode-keyword animate-spin"
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
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-vscode-warning"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-vscode-error" />
              <div className="w-3 h-3 rounded-full bg-vscode-warning" />
              <div className="w-3 h-3 rounded-full bg-vscode-success" />
            </div>
            <span className="text-vscode-muted text-sm">job_status.ts</span>
          </div>
          <h1 className="text-2xl font-bold text-vscode-text">
            <span className="text-vscode-keyword">interface</span>{" "}
            <span className="text-vscode-highlight">JobStatus</span>
          </h1>
        </div>

        {error ? (
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg overflow-hidden">
            <div className="h-10 bg-vscode-surface border-b border-vscode-border flex items-center px-4">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-vscode-error"
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
                <span className="text-vscode-error">Error</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-vscode-error mb-4">{error}</p>
              <Link
                href="/"
                className="text-vscode-accent hover:text-vscode-accent-hover inline-flex items-center gap-1"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Go back home
              </Link>
            </div>
          </div>
        ) : !job ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-vscode-muted">
              <svg
                className="w-6 h-6 animate-spin text-vscode-accent"
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
              <span>Fetching job status...</span>
            </div>
          </div>
        ) : (
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg overflow-hidden">
            {/* Panel header */}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-vscode-text">Job Details</span>
              </div>
              <span className="font-mono text-xs text-vscode-muted">
                {job.job_id.slice(0, 8)}...
              </span>
            </div>

            {/* Job content */}
            <div className="p-6 space-y-6">
              {/* Status row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="text-sm text-vscode-muted mb-1">
                      <span className="text-vscode-keyword">status</span>:
                    </div>
                    <span className={getStatusBadge(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {job.progress !== undefined && job.status === "processing" && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-vscode-muted">
                      <span className="text-vscode-keyword">progress</span>:
                    </span>
                    <span className="text-vscode-number">{job.progress}%</span>
                  </div>
                  <div className="w-full bg-vscode-bg rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-vscode-accent h-2 rounded-full transition-all duration-500 progress-glow"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-vscode-muted">
                    <span className="w-2 h-2 rounded-full bg-vscode-accent animate-pulse" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}

              {/* Download button */}
              {job.status === "completed" && job.file_url && (
                <a
                  href={job.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-vscode-success hover:bg-vscode-success/80 rounded font-medium transition-colors"
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
                  <span>Download Documentation</span>
                </a>
              )}

              {/* Failed state */}
              {job.status === "failed" && (
                <div className="text-center py-4 bg-vscode-error/10 border border-vscode-error/30 rounded-lg">
                  <p className="text-vscode-error mb-3">
                    <span className="text-vscode-comment">{"// "}</span>
                    Documentation generation failed
                  </p>
                  <Link
                    href="/generate"
                    className="text-vscode-accent hover:text-vscode-accent-hover inline-flex items-center gap-1"
                  >
                    Try again
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Terminal footer */}
            {job.status !== "completed" && job.status !== "failed" && (
              <div className="px-6 py-3 bg-vscode-bg border-t border-vscode-border">
                <div className="flex items-center gap-2 text-xs text-vscode-muted">
                  <span className="text-vscode-success">$</span>
                  <span className="text-vscode-comment">
                    {"// "}Auto-refreshing every 3 seconds
                  </span>
                  <span className="cursor-blink text-vscode-accent ml-1">
                    |
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/docs"
            className="text-vscode-muted hover:text-vscode-text transition-colors inline-flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Docs
          </Link>
        </div>
      </main>
    </div>
  );
}
