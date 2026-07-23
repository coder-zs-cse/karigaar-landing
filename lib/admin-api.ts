import { backendBaseUrl, clearAdminToken, getAdminToken } from "./admin-auth";

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new AdminApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new AdminApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: string;
  phone_number: string;
  role: string;
  name: string | null;
  created_at: string | null;
  last_call_at: string | null;
};

export type Customer = {
  id: string;
  user_id: string;
  locality: string | null;
  created_at: string | null;
};

export type Worker = {
  id: string;
  user_id: string;
  worker_type: string | null;
  locality: string | null;
  experience_years: number;
  availability: string;
  current_job_id: string | null;
  registered_at: string | null;
};

export type Job = {
  id: string;
  customer_id: string;
  worker_id: string | null;
  offered_worker_id: string | null;
  service_type: string | null;
  job_description: string | null;
  locality: string | null;
  job_status: string;
  created_at: string | null;
  paired_at: string | null;
  completed_at: string | null;
};

export type Call = {
  id: string;
  vendor: string;
  vendor_call_id: string;
  user_id: string | null;
  direction: string | null;
  caller_phone: string | null;
  call_status: string | null;
  hangup_reason: string | null;
  conversation_duration: number | null;
  has_recording: boolean;
  recording_url: string | null;
  first_seen_at: string | null;
};

export type CallEvent = {
  id: string;
  event_type: string;
  message: string | null;
  payload: Record<string, unknown>;
  created_at: string | null;
};

export function login(username: string, password: string) {
  return adminFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function listUsers() {
  return adminFetch<User[]>("/users?limit=100");
}

export function listCustomers() {
  return adminFetch<Customer[]>("/customers?limit=100");
}

export function listWorkers() {
  return adminFetch<Worker[]>("/workers?limit=100");
}

export function listJobs() {
  return adminFetch<Job[]>("/jobs?limit=100");
}

export function listCalls() {
  return adminFetch<Call[]>("/calls?limit=100");
}

export function listCallEvents(callId: string) {
  return adminFetch<CallEvent[]>(`/calls/${callId}/events`);
}

export function getRecordingUrl(callId: string) {
  return adminFetch<{ url: string }>(`/calls/${callId}/recording`);
}
