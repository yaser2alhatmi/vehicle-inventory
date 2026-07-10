"use client";

import { use, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Trip } from "@/lib/types";
import { qtyUsed } from "@/lib/types";
import {
  PageHeader, Barcode, ErrorBanner, Spinner, StatusBadge,
  btnPrimary, tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [returnQty, setReturnQty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      api<Trip>(`/api/trips/${id}`)
        .then((t) => {
          setTrip(t);
          // default: everything unused comes back (crew returns what they didn't use)
          setReturnQty(
            Object.fromEntries((t.trip_items ?? []).map((ti) => [ti.id, String(ti.qty_taken)])),
          );
        })
        .catch((err) => setError((err as Error).message)),
    [id],
  );

  useEffect(() => {
    void load();
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
  const totals = (trip.trip_items ?? []).reduce(
    (acc, ti) => {
      acc.taken += ti.qty_taken;
      if (ti.qty_returned !== null) {
        acc.returned += ti.qty_returned;
        acc.used += ti.qty_taken - ti.qty_returned;
      }
      return acc;
    },
    { taken: 0, returned: 0, used: 0 },
  );

  return (
    <div>
      <PageHeader
        title={`Trip — ${trip.vehicle?.registration ?? ""}`}
        subtitle={
          `Left ${new Date(trip.left_at).toLocaleString()}` +
          (trip.returned_at ? ` · Returned ${new Date(trip.returned_at).toLocaleString()}` : "")
        }
        action={<StatusBadge status={trip.status} />}
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className={tableWrapCls}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadCls}>
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
                <tr key={ti.id} className={rowCls}>
                  <td className="px-4 py-2.5">
                    <Barcode code={ti.item?.barcode} />
                    <span className="ml-2 font-medium text-slate-800">{ti.item?.name}</span>
                    <span className="ml-1.5 text-xs text-slate-400">({ti.item?.unit})</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-800">
                    {ti.qty_taken}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {isOut ? (
                      <input
                        type="number"
                        min="0"
                        step="any"
                        max={ti.qty_taken}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm tabular-nums transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={returnQty[ti.id] ?? ""}
                        onChange={(e) => setReturnQty({ ...returnQty, [ti.id]: e.target.value })}
                      />
                    ) : (
                      <span className="text-slate-800">{ti.qty_returned}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {used === null ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      <span className={"font-semibold " + (used > 0 ? "text-blue-700" : "text-slate-400")}>
                        {used}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {!isOut && (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <td className="px-4 py-2.5 text-xs uppercase tracking-wide">Totals</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.taken}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.returned}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-blue-700">{totals.used}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {isOut && (
        <div className="mt-5">
          <button onClick={returnTrip} disabled={saving} className={btnPrimary}>
            {saving ? "Returning…" : "↩ Return trip"}
          </button>
          <span className="ml-3 text-xs text-slate-400">
            Returned quantities go back into stock · used = taken − returned
          </span>
        </div>
      )}
    </div>
  );
}
