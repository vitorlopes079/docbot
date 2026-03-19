"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { user, login, register, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    setError("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate confirm password for registration
    if (tab === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
        router.push("/");
      } else {
        const result = await register(email, password);
        if (result.requiresVerification) {
          setRegisteredEmail(result.email);
          setShowVerificationMessage(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-vscode-bg flex flex-col">
      {/* Minimal header */}
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-vscode-muted hover:text-vscode-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Verification Success Message */}
          {showVerificationMessage ? (
            <div className="bg-vscode-sidebar border border-vscode-border rounded-xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-vscode-success/20 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-vscode-text mb-2">Check your email</h2>
              <p className="text-vscode-muted mb-4">
                We&apos;ve sent a verification link to <span className="text-vscode-text">{registeredEmail}</span>
              </p>
              <p className="text-sm text-vscode-muted mb-6">
                Please verify your email to receive your free credits and start using RepoDoc.
              </p>
              <button
                onClick={() => {
                  setShowVerificationMessage(false);
                  handleTabChange("login");
                }}
                className="w-full h-11 bg-vscode-accent hover:bg-vscode-accent-hover rounded-lg font-medium transition-colors"
              >
                Go to Sign In
              </button>
              <Link
                href="/resend-verification"
                className="block mt-4 text-sm text-vscode-muted hover:text-vscode-accent transition-colors"
              >
                Didn&apos;t receive an email? Resend verification
              </Link>
            </div>
          ) : (
          <>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-vscode-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-vscode-accent/20">
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-2xl font-bold text-vscode-text">Welcome to RepoDoc</h1>
            <p className="text-vscode-muted text-sm mt-1">
              {tab === "login" ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-vscode-sidebar border border-vscode-border rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                  tab === "login"
                    ? "text-vscode-text bg-vscode-surface"
                    : "text-vscode-muted hover:text-vscode-text"
                }`}
              >
                Sign In
                {tab === "login" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vscode-accent" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                  tab === "register"
                    ? "text-vscode-text bg-vscode-surface"
                    : "text-vscode-muted hover:text-vscode-text"
                }`}
              >
                Create Account
                {tab === "register" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vscode-accent" />
                )}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-vscode-text mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 bg-vscode-bg border border-vscode-border rounded-lg text-vscode-text placeholder:text-vscode-muted focus:outline-none focus:border-vscode-accent transition-colors"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-vscode-text mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 bg-vscode-bg border border-vscode-border rounded-lg text-vscode-text placeholder:text-vscode-muted focus:outline-none focus:border-vscode-accent transition-colors"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {/* Confirm Password - only for registration */}
              {tab === "register" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-vscode-text mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-11 px-4 bg-vscode-bg border rounded-lg text-vscode-text placeholder:text-vscode-muted focus:outline-none transition-colors ${
                      confirmPassword && password !== confirmPassword
                        ? "border-vscode-error focus:border-vscode-error"
                        : "border-vscode-border focus:border-vscode-accent"
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-vscode-error flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="mt-1.5 text-xs text-vscode-success flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-vscode-error/10 border border-vscode-error/30 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-vscode-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-vscode-error">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-vscode-accent hover:bg-vscode-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{tab === "login" ? "Sign In" : "Create Account"}</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-vscode-muted mt-6">
            {tab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className="text-vscode-accent hover:text-vscode-accent-hover"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-vscode-accent hover:text-vscode-accent-hover"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-vscode-muted">
          RepoDoc &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
