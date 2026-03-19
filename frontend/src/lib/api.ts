const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("docbot_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// Auth
export interface User {
  id: string;
  email: string;
  credits: number;
  email_verified: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  credits_awarded: number;
}

export interface MessageResponse {
  message: string;
}

export const api = {
  register: (email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  verifyEmail: (token: string) =>
    request<VerificationResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    request<MessageResponse>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Jobs
  createJob: (github_url: string) =>
    request<{ job_id: string; status: string }>("/jobs", {
      method: "POST",
      body: JSON.stringify({ github_url }),
    }),

  getJob: (id: string) =>
    request<{
      job_id: string;
      status: string;
      progress?: number;
      file_url?: string;
    }>(`/jobs/${id}`),

  // Documents
  // Get current user's documents (requires auth)
  getDocuments: () =>
    request<
      Array<{
        job_id: string;
        repo_name: string;
        file_url: string;
        created_at: string;
      }>
    >("/documents"),

  // Get recent public documents (no auth required)
  getRecentDocuments: () =>
    fetch(`${API_URL}/documents/recent`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent documents");
        return res.json();
      })
      .then(
        (data) =>
          data as Array<{
            job_id: string;
            repo_name: string;
            file_url: string;
            created_at: string;
          }>,
      ),
};
