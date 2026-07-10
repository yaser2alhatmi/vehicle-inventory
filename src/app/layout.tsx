import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle Inventory",
  description: "Track what field crews take out and bring back",
};

function Brand({ onDark }: { onDark: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/30 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className={"text-[15px] font-semibold tracking-tight " + (onDark ? "text-white" : "text-slate-900")}>
          Vehicle Inventory
        </span>
        <span className={"text-[11px] font-medium " + (onDark ? "text-slate-400" : "text-slate-400")}>
          Fleet stock tracking
        </span>
      </span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-slate-900 md:flex">
          <div className="px-5 pb-6 pt-6">
            <Brand onDark />
          </div>
          <div className="px-3">
            <NavLinks orientation="side" />
          </div>
          <div className="mt-auto px-5 pb-5">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Store ⇄ vehicle reconciliation
              <br />
              taken · returned · used
            </p>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <Brand onDark={false} />
            <NavLinks orientation="top" />
          </div>
        </header>

        <main className="px-4 py-8 md:ml-60 md:px-10">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
