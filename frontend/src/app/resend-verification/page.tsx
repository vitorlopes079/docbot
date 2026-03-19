"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await api.resendVerification(email);
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to send verification email");
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg flex flex-col">
      <header className="p-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-vscode-muted hover:text-vscode-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to Login</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-vscode-text">Resend Verification</h1>
            <p className="text-vscode-muted text-sm mt-1">
              Enter your email to receive a new verification link
            </p>
          </div>

          <div className="bg-vscode-sidebar border border-vscode-border rounded-xl p-6">
            {status === "success" ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-vscode-success/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-vscode-text mb-4">{message}</p>
                <Link href="/login" className="text-vscode-accent hover:text-vscode-accent-hover text-sm">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-vscode-text mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 bg-vscode-bg border border-vscode-border rounded-lg text-vscode-text placeholder:text-vscode-muted focus:outline-none focus:border-vscode-accent transition-colors"
                    required
                  />
                </div>

                {status === "error" && (
                  <div className="px-4 py-3 bg-vscode-error/10 border border-vscode-error/30 rounded-lg">
                    <span className="text-sm text-vscode-error">{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-11 bg-vscode-accent hover:bg-vscode-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Verification Email</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-vscode-muted">
          RepoDoc &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
