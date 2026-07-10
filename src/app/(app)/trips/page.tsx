"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Trip } from "@/lib/types";
import {
  PageHeader, ErrorBanner, EmptyState, Spinner, StatusBadge,
  btnPrimary, btnGhost, tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function TripTable({ trips, showReturned }: { trips: Trip[]; showReturned: boolean }) {
  return (
    <div className={tableWrapCls}>
      <table className="w-full text-sm">
        <thead>
          <tr className={theadCls}>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Left</th>
            {showReturned && <th className="px-4 py-3">Returned</th>}
            <th className="px-4 py-3 text-right">Items</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id} className={rowCls}>
              <td className="px-4 py-2.5">
                <span className="font-medium text-slate-800">{t.vehicle?.registration}</span>
                <span className="ml-2 text-xs text-slate-400">{t.vehicle?.type}</span>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-4 py-2.5 text-slate-500">{fmt(t.left_at)}</td>
              {showReturned && <td className="px-4 py-2.5 text-slate-500">{fmt(t.returned_at)}</td>}
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-800">
                {t.trip_items?.length ?? 0}
              </td>
              <td className="px-4 py-2.5 text-right">
                <Link href={`/trips/${t.id}`} className={btnGhost}>
                  {t.status === "out" ? "View / return →" : "View →"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      api<Trip[]>("/api/trips")
        .then(setTrips)
        .catch((err) => setError((err as Error).message)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const out = (trips ?? []).filter((t) => t.status === "out");
  const returned = (trips ?? []).filter((t) => t.status === "returned");

  return (
    <div>
      <PageHeader
        title="Trips"
        subtitle="What each vehicle took out, brought back, and used"
        action={
          <Link href="/trips/new" className={btnPrimary}>
            + Start a trip
          </Link>
        }
      />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {trips === null ? (
        <Spinner />
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Currently out
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              {out.length}
            </span>
          </h2>
          {out.length === 0 ? (
            <EmptyState title="No trips out" hint="Start a trip to load a vehicle with items." />
          ) : (
            <TripTable trips={out} showReturned={false} />
          )}

          <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
            History
            <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {returned.length}
            </span>
          </h2>
          {returned.length === 0 ? (
            <EmptyState title="No returned trips yet" />
          ) : (
            <TripTable trips={returned} showReturned={true} />
          )}
        </>
      )}
    </div>
  );
}
