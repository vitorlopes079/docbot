"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    api.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
        setCreditsAwarded(res.credits_awarded);
        refetchUser();
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed. Please try again.");
      });
  }, [searchParams, refetchUser]);

  return (
    <div className="min-h-screen bg-vscode-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-vscode-sidebar border border-vscode-border rounded-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 animate-spin text-vscode-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-vscode-text mb-2">Verifying your email...</h1>
            <p className="text-vscode-muted">Please wait while we verify your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-vscode-success/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-vscode-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-vscode-text mb-2">Email Verified!</h1>
            <p className="text-vscode-muted mb-4">{message}</p>
            {creditsAwarded > 0 && (
              <div className="bg-vscode-accent/10 border border-vscode-accent/30 rounded-lg px-4 py-3 mb-6">
                <p className="text-vscode-accent font-medium">
                  +{creditsAwarded} credits added to your account
                </p>
              </div>
            )}
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 bg-vscode-accent hover:bg-vscode-accent-hover rounded-lg font-medium transition-colors"
            >
              Sign In to Get Started
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-vscode-error/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-vscode-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-vscode-text mb-2">Verification Failed</h1>
            <p className="text-vscode-muted mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-11 bg-vscode-accent hover:bg-vscode-accent-hover rounded-lg font-medium transition-colors"
              >
                Go to Login
              </Link>
              <Link
                href="/resend-verification"
                className="block w-full h-11 bg-vscode-surface hover:bg-vscode-hover border border-vscode-border rounded-lg font-medium text-vscode-text transition-colors leading-[44px]"
              >
                Resend Verification Email
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-vscode-accent border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
