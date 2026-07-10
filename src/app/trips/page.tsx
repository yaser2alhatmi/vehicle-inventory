"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Trip } from "@/lib/types";
import { ErrorBanner, EmptyState, Spinner, btnPrimary } from "@/components/ui";

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function TripTable({ trips, showReturned }: { trips: Trip[]; showReturned: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Left</th>
            {showReturned && <th className="px-4 py-3">Returned</th>}
            <th className="px-4 py-3 text-right">Items</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 font-medium">
                {t.vehicle?.registration}
                <span className="ml-2 text-xs text-slate-400">{t.vehicle?.type}</span>
              </td>
              <td className="px-4 py-2 text-slate-500">{fmt(t.left_at)}</td>
              {showReturned && <td className="px-4 py-2 text-slate-500">{fmt(t.returned_at)}</td>}
              <td className="px-4 py-2 text-right">{t.trip_items?.length ?? 0}</td>
              <td className="px-4 py-2 text-right">
                <Link href={`/trips/${t.id}`} className="rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50">
                  {t.status === "out" ? "View / return" : "View"}
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

  const load = useCallback(async () => {
    try {
      setTrips(await api<Trip[]>("/api/trips"));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const out = (trips ?? []).filter((t) => t.status === "out");
  const returned = (trips ?? []).filter((t) => t.status === "returned");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trips</h1>
        <Link href="/trips/new" className={btnPrimary}>
          + Start a trip
        </Link>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {trips === null ? (
        <Spinner />
      ) : (
        <>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Currently out ({out.length})
          </h2>
          {out.length === 0 ? (
            <EmptyState title="No trips out" hint="Start a trip to load a vehicle with items." />
          ) : (
            <TripTable trips={out} showReturned={false} />
          )}

          <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            History ({returned.length})
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
