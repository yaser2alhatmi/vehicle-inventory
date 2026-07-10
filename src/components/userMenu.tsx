"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/login";
  }

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-semibold text-white shadow-sm">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-emerald-50">{email ?? "…"}</p>
          <p className="flex items-center gap-1 text-[10px] text-emerald-300/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Signed in
          </p>
        </div>
      </div>
      <button
        onClick={signOut}
        title="Sign out"
        className="shrink-0 rounded-md p-1.5 text-emerald-200/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      </button>
    </div>
  );
}
