"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Document {
  job_id: string;
  repo_name: string;
  file_url: string;
  created_at: string;
}

export default function HomePage() {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    api
      .getRecentDocuments()
      .then((docs) => setRecentDocs(docs.slice(0, 4)))
      .catch(() => {
        // Silently fail - recent docs is not critical
      })
      .finally(() => setLoadingDocs(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/generate?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Fallback: focus the input
      document.getElementById("hero-url")?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 122, 204, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0, 122, 204, 0.3) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-vscode-text opacity-0-initial animate-fade-in-up">
            AI-Powered Documentation
          </h1>

          <p className="text-lg text-vscode-muted mb-8 max-w-xl mx-auto opacity-0-initial animate-fade-in-up animation-delay-100">
            Transform any GitHub repository into comprehensive documentation in seconds.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="opacity-0-initial animate-fade-in-up animation-delay-200">
            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <input
                  id="hero-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full h-12 px-4 pr-12 bg-vscode-sidebar border border-vscode-border rounded-lg font-mono text-sm text-vscode-text placeholder:text-vscode-muted focus:outline-none focus:border-vscode-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-vscode-muted hover:text-vscode-accent transition-colors"
                  title="Paste from clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={!url.trim()}
                className="h-12 px-6 bg-vscode-accent hover:bg-vscode-accent-hover disabled:bg-vscode-surface disabled:text-vscode-muted disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-vscode-muted">
              Enter a public GitHub repository URL to generate documentation
            </p>
          </form>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 border-t border-vscode-border bg-vscode-sidebar">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-3 h-3 rounded-full bg-vscode-error" />
            <div className="w-3 h-3 rounded-full bg-vscode-warning" />
            <div className="w-3 h-3 rounded-full bg-vscode-success" />
            <h2 className="text-2xl font-bold ml-4 text-vscode-text">
              how_it_works.md
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-vscode-surface border border-vscode-border rounded-lg p-6 hover-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-vscode-number text-sm">01</span>
                <div className="h-px flex-1 bg-vscode-border" />
              </div>
              <div className="w-12 h-12 bg-vscode-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-vscode-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-vscode-highlight">
                Paste URL
              </h3>
              <p className="text-vscode-muted text-sm">
                Enter any public GitHub repository URL to get started
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-vscode-surface border border-vscode-border rounded-lg p-6 hover-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-vscode-number text-sm">02</span>
                <div className="h-px flex-1 bg-vscode-border" />
              </div>
              <div className="w-12 h-12 bg-vscode-keyword/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-vscode-keyword"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-vscode-highlight">
                AI Analyzes
              </h3>
              <p className="text-vscode-muted text-sm">
                Our AI reads your code, understands structure, and extracts key
                information
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-vscode-surface border border-vscode-border rounded-lg p-6 hover-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-vscode-number text-sm">03</span>
                <div className="h-px flex-1 bg-vscode-border" />
              </div>
              <div className="w-12 h-12 bg-vscode-success/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-vscode-success"
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
              </div>
              <h3 className="text-lg font-semibold mb-2 text-vscode-highlight">
                Download Docs
              </h3>
              <p className="text-vscode-muted text-sm">
                Get your polished documentation ready to share with your team
              </p>
            </div>
          </div>

          {/* CTA Banner - Show only to non-logged in users */}
          {!authLoading && !user && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-vscode-bg border border-vscode-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex w-10 h-10 bg-vscode-accent/20 rounded-lg items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-vscode-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-vscode-text font-medium">
                    <span className="text-vscode-string">3 free credits</span> when you create an account
                  </p>
                  <p className="text-sm text-vscode-muted">
                    No credit card required
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="px-5 py-2 bg-vscode-accent hover:bg-vscode-accent-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Docs Section */}
      <section className="py-20 px-4 border-t border-vscode-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-vscode-accent"
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
              <h2 className="text-xl font-bold text-vscode-text">
                Recent Documentation
              </h2>
            </div>
            <Link
              href="/docs"
              className="text-vscode-accent hover:text-vscode-accent-hover transition-colors text-sm flex items-center gap-1"
            >
              View all
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

          {loadingDocs ? (
            <div className="grid md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-vscode-surface border border-vscode-border rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : recentDocs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.job_id}
                  href={`/docs/${doc.job_id}`}
                  className="file-tree-item bg-vscode-surface border border-vscode-border rounded-lg p-4 hover-card group block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-vscode-keyword"
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
                      <div>
                        <h3 className="font-medium text-vscode-text group-hover:text-vscode-highlight transition-colors">
                          {doc.repo_name}
                        </h3>
                        <p className="text-xs text-vscode-muted">
                          {new Date(doc.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* View icon */}
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
                      {/* Download button */}
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
          ) : (
            <div className="text-center py-16 bg-vscode-surface rounded-lg border border-vscode-border">
              <div className="w-16 h-16 bg-vscode-bg rounded-lg flex items-center justify-center mx-auto mb-4 border border-vscode-border">
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
              <p className="text-vscode-muted mb-4">
                <span className="text-vscode-comment">{"// "}</span>
                No documentation yet
              </p>
              <Link
                href="/generate"
                className="text-vscode-accent hover:text-vscode-accent-hover inline-flex items-center gap-1"
              >
                Generate your first docs
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
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-vscode-border bg-vscode-sidebar">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-vscode-muted text-sm">
          <span>
            <span className="text-vscode-keyword">export</span>{" "}
            <span className="text-vscode-highlight">RepoDoc</span>{" "}
            <span className="text-vscode-comment">
              // {new Date().getFullYear()}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vscode-success animate-pulse" />
            <span>Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
