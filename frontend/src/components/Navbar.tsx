"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-vscode-sidebar border-b border-vscode-border sticky top-0 z-50">
      {/* Top bar - mimics VSCode title bar */}
      <div className="h-8 bg-vscode-bg border-b border-vscode-border flex items-center px-4">
        <div className="flex items-center gap-2 text-xs text-vscode-muted">
          <span className="text-vscode-highlight">RepoDoc</span>
          <span className="breadcrumb-sep" />
          <span>AI Documentation Generator</span>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <Link href="/" className="flex items-center gap-3 group">
            {/* VSCode-style icon */}
            <div className="w-7 h-7 bg-vscode-accent rounded flex items-center justify-center group-hover:bg-vscode-accent-hover transition-colors">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="text-lg font-semibold text-vscode-text group-hover:text-white transition-colors">
              RepoDoc
            </span>
          </Link>

          {/* Tab-style navigation */}
          <div className="flex items-center">
            <div className="flex items-center border-r border-vscode-border pr-4 mr-4">
              <Link
                href="/docs"
                className={`relative px-4 py-3 text-sm transition-colors ${
                  pathname === "/docs"
                    ? "text-white tab-active"
                    : "text-vscode-muted hover:text-vscode-text"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  My Docs
                </div>
              </Link>
            </div>

            {loading ? (
              <div className="w-20 h-8 bg-vscode-surface rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Credits display */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-vscode-surface border border-vscode-border rounded">
                  <svg
                    className="w-4 h-4 text-vscode-string"
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
                  <span className="text-sm font-medium text-vscode-string">
                    {user.credits}
                  </span>
                  <span className="text-xs text-vscode-muted">credits</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 text-sm text-vscode-muted hover:text-vscode-text border border-vscode-border hover:border-vscode-accent/50 rounded transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm bg-vscode-accent hover:bg-vscode-accent-hover text-white rounded transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border glow effect */}
      <div className="h-px bg-gradient-to-r from-transparent via-vscode-accent/50 to-transparent" />
    </nav>
  );
}
