"use client";

import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Trip } from "@/lib/types";
import { qtyUsed } from "@/lib/types";
import { ErrorBanner, Spinner, btnPrimary } from "@/components/ui";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [returnQty, setReturnQty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await api<Trip>(`/api/trips/${id}`);
      setTrip(t);
      // default: everything unused comes back (crew returns what they didn't use)
      setReturnQty(
        Object.fromEntries((t.trip_items ?? []).map((ti) => [ti.id, String(ti.qty_taken)])),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function returnTrip() {
    if (!trip) return;
    setError("");

    for (const ti of trip.trip_items ?? []) {
      const qty = Number(returnQty[ti.id]);
      if (!Number.isFinite(qty) || qty < 0) {
        setError(`Returned quantity for "${ti.item?.name}" cannot be negative`);
        return;
      }
      if (qty > ti.qty_taken) {
        setError(`Cannot return more ${ti.item?.name} than was taken (${ti.qty_taken})`);
        return;
      }
    }

    setSaving(true);
    try {
      await api(`/api/trips/${trip.id}/return`, {
        method: "POST",
        body: JSON.stringify({
          lines: (trip.trip_items ?? []).map((ti) => ({
            trip_item_id: ti.id,
            qty_returned: Number(returnQty[ti.id]),
          })),
        }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (trip === null) {
    return (
      <div>
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        <Spinner />
      </div>
    );
  }

  const isOut = trip.status === "out";

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          Trip — {trip.vehicle?.registration}
        </h1>
        <span
          className={
            "rounded-full px-3 py-0.5 text-xs font-semibold " +
            (isOut ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")
          }
        >
          {isOut ? "OUT" : "RETURNED"}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Left: {new Date(trip.left_at).toLocaleString()}
        {trip.returned_at && <> · Returned: {new Date(trip.returned_at).toLocaleString()}</>}
      </p>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Taken</th>
              <th className="px-4 py-3 text-right">Returned</th>
              <th className="px-4 py-3 text-right">Used</th>
            </tr>
          </thead>
          <tbody>
            {(trip.trip_items ?? []).map((ti) => {
              const used = qtyUsed(ti);
              return (
                <tr key={ti.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs text-slate-400">{ti.item?.barcode}</span>{" "}
                    {ti.item?.name}
                    <span className="ml-1 text-xs text-slate-400">({ti.item?.unit})</span>
                  </td>
                  <td className="px-4 py-2 text-right">{ti.qty_taken}</td>
                  <td className="px-4 py-2 text-right">
                    {isOut ? (
                      <input
                        type="number"
                        min="0"
                        step="any"
                        max={ti.qty_taken}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm"
                        value={returnQty[ti.id] ?? ""}
                        onChange={(e) => setReturnQty({ ...returnQty, [ti.id]: e.target.value })}
                      />
                    ) : (
                      ti.qty_returned
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {used === null ? "—" : used}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isOut && (
        <button onClick={returnTrip} disabled={saving} className={btnPrimary}>
          {saving ? "Returning…" : "Return trip (restocks returned quantities)"}
        </button>
      )}
    </div>
  );
}
