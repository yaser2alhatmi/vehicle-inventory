"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Field, inputCls, btnPrimary } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Wrong email or password"
          : error.message,
      );
      setLoading(false);
      return;
    }
    // full navigation so the auth cookie is picked up by the server gate
    window.location.href = "/";
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-emerald-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_28rem_at_75%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(35rem_22rem_at_-5%_110%,rgba(20,184,166,0.12),transparent)]" />

      <div className="absolute right-4 top-4">
        <ThemeToggle onDark />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-900/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" />
              <circle cx="7" cy="18" r="2" />
            </svg>
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white">Vehicle Inventory</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to manage store stock and trips</p>
          </div>
        </div>

        <form
          onSubmit={signIn}
          className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-slate-950/50 dark:bg-slate-800 dark:border-slate-700"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                autoComplete="email"
                className={inputCls}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                autoComplete="current-password"
                className={inputCls}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </div>
          <button type="submit" disabled={loading} className={btnPrimary + " mt-6 w-full justify-center"}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Yasser-ALhatmi · All rights reserved
        </p>
      </div>
    </div>
  );
}
