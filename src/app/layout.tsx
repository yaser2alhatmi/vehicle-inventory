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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-8 px-4 py-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base text-white shadow-md shadow-blue-600/20 transition-transform group-hover:scale-105">
                🚚
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                  Vehicle Inventory
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Fleet stock tracking
                </span>
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-400">
            Vehicle Inventory — store ⇄ vehicle stock reconciliation
          </div>
        </footer>
      </body>
    </html>
  );
}
