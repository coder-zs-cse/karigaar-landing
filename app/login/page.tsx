"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError, login } from "@/lib/admin-api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(username, password);
      setAdminToken(token.access_token);
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : "Login failed. Check backend URL and credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-100 px-4 font-sans text-slate-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          CallKaarigar internal dashboard
        </p>
        <label className="mb-3 grid gap-1 text-sm font-medium">
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </label>
        <label className="mb-4 grid gap-1 text-sm font-medium">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </label>
        {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
