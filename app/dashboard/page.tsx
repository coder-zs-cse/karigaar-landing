"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AdminApiError,
  Call,
  CallEvent,
  Customer,
  Job,
  User,
  Worker,
  getRecordingUrl,
  listCallEvents,
  listCalls,
  listCustomers,
  listJobs,
  listUsers,
  listWorkers,
} from "@/lib/admin-api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";

type Tab = "jobs" | "calls" | "customers" | "workers" | "users";

function fmt(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function fmtTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("jobs");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [events, setEvents] = useState<CallEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [j, c, cu, w, u] = await Promise.all([
        listJobs(),
        listCalls(),
        listCustomers(),
        listWorkers(),
        listUsers(),
      ]);
      setJobs(j);
      setCalls(c);
      setCustomers(cu);
      setWorkers(w);
      setUsers(u);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (ready) {
      void load();
    }
  }, [ready, load]);

  async function openEvents(callId: string) {
    setSelectedCallId(callId);
    setEventsLoading(true);
    setEvents([]);
    try {
      setEvents(await listCallEvents(callId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  }

  async function openRecording(callId: string) {
    try {
      const { url } = await getRecordingUrl(callId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open recording");
    }
  }

  function logout() {
    clearAdminToken();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-100 text-slate-600">
        Checking session…
      </main>
    );
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "jobs", label: "Jobs", count: jobs.length },
    { id: "calls", label: "Calls", count: calls.length },
    { id: "customers", label: "Customers", count: customers.length },
    { id: "workers", label: "Workers", count: workers.length },
    { id: "users", label: "Users", count: users.length },
  ];

  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">CallKaarigar dashboard</h1>
          <p className="text-xs text-slate-500">Read-only ops view</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="bg-slate-900 px-3 py-1.5 text-sm text-white"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="mb-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-sm border ${
                tab === t.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </nav>

        {error ? (
          <p className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="mb-3 text-sm text-slate-500">Loading…</p>
        ) : null}

        {tab === "jobs" ? (
          <Table
            headers={[
              "Status",
              "Service",
              "Locality",
              "Customer",
              "Worker",
              "Created",
            ]}
            rows={jobs.map((j) => [
              j.job_status,
              fmt(j.service_type),
              fmt(j.locality),
              j.customer_id.slice(0, 8),
              j.worker_id ? j.worker_id.slice(0, 8) : "—",
              fmtTime(j.created_at),
            ])}
          />
        ) : null}

        {tab === "calls" ? (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Table
              headers={[
                "Status",
                "Phone",
                "Direction",
                "Vendor",
                "Duration",
                "Seen",
                "Actions",
              ]}
              rows={calls.map((c) => [
                fmt(c.call_status),
                fmt(c.caller_phone),
                fmt(c.direction),
                c.vendor,
                c.conversation_duration != null
                  ? `${c.conversation_duration}s`
                  : "—",
                fmtTime(c.first_seen_at),
                <span key={c.id} className="flex gap-2">
                  <button
                    type="button"
                    className="underline text-slate-700"
                    onClick={() => void openEvents(c.id)}
                  >
                    Events
                  </button>
                  {c.has_recording ? (
                    <button
                      type="button"
                      className="underline text-slate-700"
                      onClick={() => void openRecording(c.id)}
                    >
                      Recording
                    </button>
                  ) : (
                    "—"
                  )}
                </span>,
              ])}
            />
            <aside className="border border-slate-200 bg-white p-3">
              <h2 className="mb-2 text-sm font-semibold">
                Call events
                {selectedCallId
                  ? ` · ${selectedCallId.slice(0, 8)}`
                  : ""}
              </h2>
              {!selectedCallId ? (
                <p className="text-sm text-slate-500">
                  Select a call to view its event timeline.
                </p>
              ) : eventsLoading ? (
                <p className="text-sm text-slate-500">Loading events…</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-slate-500">No events.</p>
              ) : (
                <ul className="space-y-2 max-h-[28rem] overflow-auto text-sm">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="border-b border-slate-100 pb-2 last:border-0"
                    >
                      <div className="font-medium">{e.event_type}</div>
                      <div className="text-xs text-slate-500">
                        {fmtTime(e.created_at)}
                      </div>
                      {e.message ? (
                        <div className="text-slate-700">{e.message}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        ) : null}

        {tab === "customers" ? (
          <Table
            headers={["ID", "User", "Locality", "Created"]}
            rows={customers.map((c) => [
              c.id.slice(0, 8),
              c.user_id.slice(0, 8),
              fmt(c.locality),
              fmtTime(c.created_at),
            ])}
          />
        ) : null}

        {tab === "workers" ? (
          <Table
            headers={[
              "Type",
              "Availability",
              "Locality",
              "Exp",
              "Job",
              "Registered",
            ]}
            rows={workers.map((w) => [
              fmt(w.worker_type),
              w.availability,
              fmt(w.locality),
              String(w.experience_years),
              w.current_job_id ? w.current_job_id.slice(0, 8) : "—",
              fmtTime(w.registered_at),
            ])}
          />
        ) : null}

        {tab === "users" ? (
          <Table
            headers={["Phone", "Role", "Name", "Last call", "Created"]}
            rows={users.map((u) => [
              u.phone_number,
              u.role,
              fmt(u.name),
              fmtTime(u.last_call_at),
              fmtTime(u.created_at),
            ])}
          />
        ) : null}
      </div>
    </main>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        No rows yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
