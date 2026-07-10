"use client";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] " +
        "transition-shadow hover:shadow-md hover:shadow-slate-900/[0.05] " +
        "dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none " +
        className
      }
    >
      {title && (
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          {title}
        </p>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
        <span className="h-1 w-1 rounded-full bg-emerald-500" />
        {label}
      </span>
      {children}
    </label>
  );
}

export function StatusBadge({ status }: { status: "out" | "returned" }) {
  return status === "out" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      </span>
      OUT
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      RETURNED
    </span>
  );
}

export function Barcode({ code }: { code?: string }) {
  return (
    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:ring-slate-600">
      {code}
    </span>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm shadow-red-900/5 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      <span className="flex items-start gap-2">
        <span aria-hidden>⛔</span>
        {message}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-md px-1 font-bold text-red-400 transition-colors hover:text-red-700"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-700">
        📦
      </span>
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      Loading…
    </div>
  );
}

export const tableWrapCls =
  "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03] " +
  "dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none";
export const theadCls =
  "border-b-2 border-emerald-300 bg-emerald-100 text-left text-[11px] font-bold uppercase tracking-wider text-emerald-800 " +
  "dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200 [&_th]:px-5 [&_th]:py-3.5";
// clear zebra striping + emerald hover + comfortable cell padding + column dividers
export const rowCls =
  "border-b border-slate-200 transition-colors odd:bg-white even:bg-slate-100/80 hover:bg-emerald-100/70 last:border-0 " +
  "dark:border-slate-700 dark:odd:bg-slate-800/40 dark:even:bg-slate-900/40 dark:hover:bg-emerald-500/10 " +
  "[&_td]:px-5 [&_td]:py-3.5 [&_td]:border-r [&_td]:border-slate-100 [&_td:last-child]:border-r-0 " +
  "dark:[&_td]:border-slate-700/50";

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition-all " +
  "hover:border-slate-400 " +
  "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 " +
  "dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 " +
  "dark:hover:border-slate-500";

export const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 px-4 py-2 " +
  "text-sm font-medium text-white shadow-sm shadow-emerald-600/25 transition-all " +
  "hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md hover:shadow-emerald-600/30 " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium " +
  "text-slate-700 shadow-sm transition-colors hover:bg-slate-50 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const btnGhost =
  "rounded-md px-2 py-1 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 " +
  "dark:text-emerald-400 dark:hover:bg-emerald-500/10";

export const btnDanger =
  "rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 " +
  "dark:text-red-400 dark:hover:bg-red-500/10";
