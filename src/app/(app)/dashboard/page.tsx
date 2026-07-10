"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import {
  PageHeader, Card, Barcode, ErrorBanner, EmptyState, Spinner,
  tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

interface UsedItem {
  name: string;
  unit: string;
  barcode: string;
  used: number;
}

interface Stats {
  totalItems: number;
  lowStock: number;
  tripsOut: number;
  tripsTotal: number;
  totalUsed: number;
  mostUsed: UsedItem[];
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={"mt-2 text-3xl font-semibold tabular-nums " + (accent ?? "text-slate-900")}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      api<Stats>("/api/dashboard")
        .then(setStats)
        .catch((err) => setError((err as Error).message)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A quick overview of stock and usage" />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {stats === null ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Items in stock" value={stats.totalItems} />
            <StatCard label="Trips out now" value={stats.tripsOut} accent="text-amber-600" />
            <StatCard label="Total used" value={stats.totalUsed} accent="text-blue-700" />
            <StatCard label="Low stock" value={stats.lowStock} accent={stats.lowStock > 0 ? "text-red-600" : "text-slate-900"} />
          </div>

          <Card title="Most used items">
            {stats.mostUsed.length === 0 ? (
              <EmptyState title="No usage yet" hint="Return a trip to see which items get used most." />
            ) : (
              <div className={tableWrapCls}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={theadCls}>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-right">Total used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostUsed.map((u) => (
                      <tr key={u.barcode} className={rowCls}>
                        <td className="px-4 py-2.5">
                          <Barcode code={u.barcode} />
                          <span className="ml-2 font-medium text-slate-800">{u.name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-blue-700">
                          {u.used} <span className="font-normal text-slate-400">{u.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
