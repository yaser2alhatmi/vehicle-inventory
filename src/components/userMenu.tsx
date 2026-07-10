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

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-200">{email ?? "…"}</p>
        <p className="text-[10px] text-slate-500">Signed in</p>
      </div>
      <button
        onClick={signOut}
        title="Sign out"
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
