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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
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
        className
      }
    >
      {title && (
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function StatusBadge({ status }: { status: "out" | "returned" }) {
  return status === "out" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      </span>
      OUT
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      RETURNED
    </span>
  );
}

export function Barcode({ code }: { code?: string }) {
  return (
    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
      {code}
    </span>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm shadow-red-900/5">
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg">
        📦
      </span>
      <p className="font-medium text-slate-600">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      Loading…
    </div>
  );
}

export const tableWrapCls =
  "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]";
export const theadCls =
  "border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
export const rowCls =
  "border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40";

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition-all " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25";

export const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-2 " +
  "text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition-all " +
  "hover:from-blue-500 hover:to-blue-600 hover:shadow-md hover:shadow-blue-600/30 " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium " +
  "text-slate-700 shadow-sm transition-colors hover:bg-slate-50";

export const btnGhost =
  "rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50";

export const btnDanger =
  "rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50";
