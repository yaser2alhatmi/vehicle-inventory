"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Field, inputCls, btnPrimary } from "@/components/ui";

const DEMO = { email: "yaser@store.local", password: "Yaser@6070Oman" };

function TruckLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

const HIGHLIGHTS = [
  {
    title: "Accurate stock, always",
    text: "Every take-out and return moves stock in a single atomic transaction.",
  },
  {
    title: "Trip reconciliation",
    text: "Taken, returned and used — per item and per trip, computed live.",
  },
  {
    title: "Built for the counter",
    text: "Scan or paste a barcode and press Enter. Works with USB scanners.",
  },
];

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
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-slate-900 p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_30rem_at_80%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(30rem_20rem_at_-10%_110%,rgba(99,102,241,0.12),transparent)]" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
            <TruckLogo className="h-5.5 w-5.5" />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-white">Vehicle Inventory</p>
            <p className="text-[11px] font-medium text-slate-400">Fleet stock tracking</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Know what left the store —
            <br />
            and what came back.
          </h2>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 ring-1 ring-inset ring-blue-400/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-100">{h.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Store ⇄ vehicle reconciliation · taken · returned · used
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
              <TruckLogo className="h-5.5 w-5.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight text-slate-900">Vehicle Inventory</p>
              <p className="text-[11px] font-medium text-slate-400">Fleet stock tracking</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Use your account to manage stock and trips.
          </p>

          <form onSubmit={signIn} className="mt-8">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
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

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs leading-relaxed text-slate-500">
                <p className="font-semibold text-slate-600">Reviewer demo account</p>
                <p className="mt-0.5 font-mono">{DEMO.email}</p>
                <p className="font-mono">{DEMO.password}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO.email);
                  setPassword(DEMO.password);
                }}
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              >
                Autofill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
