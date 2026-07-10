import Link from "next/link";
import NavLinks from "@/components/nav";
import UserMenu from "@/components/userMenu";
import { ThemeToggle } from "@/components/theme";

function Brand({ onDark }: { onDark: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/40 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className={"text-[15px] font-semibold tracking-tight " + (onDark ? "text-white" : "text-slate-900 dark:text-white")}>
          Vehicle Inventory
        </span>
        <span className="text-[11px] font-medium text-emerald-300">Fleet stock tracking</span>
      </span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop sidebar (always dark emerald) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-gradient-to-b from-emerald-950 to-emerald-900 shadow-xl shadow-emerald-950/50 md:flex">
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <Brand onDark />
          <ThemeToggle onDark />
        </div>

        <div className="mx-4 mb-4 border-t border-emerald-400/15" />

        <p className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300/60">
          Menu
        </p>
        <div className="px-3">
          <NavLinks orientation="side" />
        </div>

        <div className="mt-auto space-y-3 px-4 pb-5">
          <div className="border-t border-emerald-400/15 pt-4">
            <UserMenu />
          </div>
          <p className="px-1 text-[11px] leading-relaxed text-emerald-200/70">
            © {new Date().getFullYear()} Yasser-ALhatmi
            <br />
            All rights reserved
          </p>
        </div>
      </aside>

      {/* Mobile top bar: brand row + its own nav row so tabs never crowd */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Brand onDark={false} />
          <ThemeToggle />
        </div>
        <div className="overflow-x-auto border-t border-slate-100 px-2 pb-2 dark:border-slate-800">
          <NavLinks orientation="top" />
        </div>
      </header>

      <main className="px-4 py-8 md:ml-60 md:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </>
  );
}
