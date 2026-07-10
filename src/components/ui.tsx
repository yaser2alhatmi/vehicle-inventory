"use client";

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 font-bold text-red-400 hover:text-red-700">
          ✕
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-600">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return <p className="py-8 text-center text-sm text-slate-400">Loading…</p>;
}

export const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm " +
  "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export const btnPrimary =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm " +
  "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium " +
  "text-slate-700 shadow-sm hover:bg-slate-50";

export const btnDanger =
  "rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50";
