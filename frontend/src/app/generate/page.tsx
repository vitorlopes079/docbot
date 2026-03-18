"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

function GenerateContent() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, refetchUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill URL from query params
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      // Preserve the URL param when redirecting to login
      const urlParam = searchParams.get("url");
      const redirect = urlParam ? `/generate?url=${encodeURIComponent(urlParam)}` : "/generate";
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check credits before submitting
    if (!user || user.credits <= 0) {
      setError("No credits remaining. Please purchase more credits to continue.");
      return;
    }

    setLoading(true);

    try {
      const job = await api.createJob(url);
      // Refetch user to update credits display
      await refetchUser();
      router.push(`/jobs/${job.job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Fallback: focus the input so user can paste manually
      document.getElementById("github-url")?.focus();
    }
  };

  const handleClear = () => {
    setUrl("");
    setError("");
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

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-vscode-text mb-3">
            Generate Documentation
          </h1>
          <p className="text-vscode-muted">
            Enter a GitHub repository URL to generate AI-powered documentation
          </p>
        </div>

        {/* Main form card */}
        <div className="bg-vscode-sidebar border border-vscode-border rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Input section */}
            <div className="p-6">
              <label
                htmlFor="github-url"
                className="block text-sm font-medium text-vscode-text mb-3"
              >
                GitHub Repository URL
              </label>

              {/* Input with buttons */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    id="github-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full h-12 px-4 pr-10 bg-vscode-bg border border-vscode-border rounded-lg font-mono text-sm text-vscode-text placeholder:text-vscode-muted focus:outline-none focus:border-vscode-accent"
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vscode-muted hover:text-vscode-text transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Paste button */}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="h-12 px-4 bg-vscode-surface border border-vscode-border rounded-lg text-vscode-muted hover:text-vscode-text hover:border-vscode-accent transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm">Paste</span>
                </button>
              </div>

              {/* Helper text */}
              <p className="mt-2 text-xs text-vscode-muted">
                Example: https://github.com/facebook/react
              </p>

              {/* No credits warning */}
              {user && user.credits <= 0 && (
                <div className="mt-4 px-4 py-3 bg-vscode-keyword/10 border border-vscode-keyword/30 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-vscode-keyword flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm text-vscode-keyword">You have no credits remaining. Please purchase more credits to generate documentation.</span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 px-4 py-3 bg-vscode-error/10 border border-vscode-error/30 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-vscode-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-vscode-error">{error}</span>
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="px-6 pb-6">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full h-12 bg-vscode-accent hover:bg-vscode-accent-hover disabled:bg-vscode-surface disabled:text-vscode-muted disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Documentation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-vscode-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-vscode-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-vscode-muted">Public repos</p>
          </div>
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-vscode-keyword/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-vscode-keyword" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-xs text-vscode-muted">Any language</p>
          </div>
          <div className="bg-vscode-sidebar border border-vscode-border rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-vscode-success/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <p className="text-xs text-vscode-muted">Up to 10MB</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-vscode-bg">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-vscode-muted">
            <svg className="w-5 h-5 animate-spin text-vscode-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    }>
      <GenerateContent />
    </Suspense>
  );
}
