"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { Item, Vehicle, Trip } from "@/lib/types";
import {
  PageHeader, Card, Field, Barcode, ErrorBanner, Spinner,
  inputCls, btnPrimary, btnDanger, tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

interface Line {
  item: Item;
  qty: number;
}

export default function NewTripPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api<Vehicle[]>("/api/vehicles"), api<Item[]>("/api/items")])
      .then(([v, i]) => {
        setVehicles(v);
        setItems(i);
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  /**
   * Barcode quick-add: type or scan a barcode and press Enter.
   * USB barcode scanners emulate a keyboard ending with Enter,
   * so this field works with real scanner hardware out of the box.
   */
  function addByBarcode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = barcode.trim();
    if (!code) return;

    const item = (items ?? []).find((i) => i.barcode.toLowerCase() === code.toLowerCase());
    if (!item) {
      setError(`No item with barcode "${code}"`);
      return;
    }

    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { item, qty: 1 }];
    });
    setBarcode("");
    barcodeRef.current?.focus();
  }

  function setQty(itemId: string, qty: number) {
    setLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, qty } : l)));
  }

  async function startTrip() {
    setError("");
    if (!vehicleId) {
      setError("Pick a vehicle first");
      return;
    }
    if (lines.length === 0) {
      setError("Add at least one item");
      return;
    }
    for (const l of lines) {
      if (!Number.isFinite(l.qty) || l.qty <= 0) {
        setError(`Quantity for "${l.item.name}" must be greater than zero`);
        return;
      }
      if (l.qty > l.item.qty_on_hand) {
        setError(`Only ${l.item.qty_on_hand} ${l.item.unit} of "${l.item.name}" in stock`);
        return;
      }
    }

    setSaving(true);
    try {
      const trip = await api<Trip>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: vehicleId,
          lines: lines.map((l) => ({ item_id: l.item.id, qty: l.qty })),
        }),
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (vehicles === null || items === null) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader
        title="Start a trip"
        subtitle="Load a vehicle with items — stock is deducted when the trip starts"
      />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="1 · Vehicle">
          <Field label="Which vehicle is going out?">
            <select className={inputCls} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">— pick a vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration} ({v.type})
                </option>
              ))}
            </select>
          </Field>
        </Card>

        <Card title="2 · Add items by barcode">
          <form onSubmit={addByBarcode} className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Type or scan, then press Enter">
                <input
                  ref={barcodeRef}
                  className={inputCls + " font-mono"}
                  placeholder="e.g. CBL-001"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  list="barcodes"
                  autoFocus
                />
              </Field>
            </div>
            <button type="submit" className={btnPrimary}>
              Add
            </button>
          </form>
          <datalist id="barcodes">
            {items.map((i) => (
              <option key={i.id} value={i.barcode}>{i.name}</option>
            ))}
          </datalist>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
            Available:{" "}
            {items.filter((i) => i.qty_on_hand > 0).map((i) => i.barcode).join(" · ") ||
              "nothing in stock"}
          </p>
        </Card>
      </div>

      {lines.length > 0 && (
        <div className={tableWrapCls + " mt-4"}>
          <table className="w-full text-sm">
            <thead>
              <tr className={theadCls}>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">In stock</th>
                <th className="px-4 py-3 text-right">Qty to take</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.item.id} className={rowCls}>
                  <td className="px-4 py-2.5">
                    <Barcode code={l.item.barcode} />
                    <span className="ml-2 font-medium text-slate-800">{l.item.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                    {l.item.qty_on_hand} {l.item.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      max={l.item.qty_on_hand}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm tabular-nums transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={l.qty}
                      onChange={(e) => setQty(l.item.id, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setLines((prev) => prev.filter((x) => x.item.id !== l.item.id))}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5">
        <button onClick={startTrip} disabled={saving} className={btnPrimary}>
          {saving ? "Starting…" : "🚚 Start trip"}
        </button>
        {lines.length > 0 && (
          <span className="ml-3 text-xs text-slate-400">
            {lines.length} item{lines.length > 1 ? "s" : ""} · stock is deducted immediately
          </span>
        )}
      </div>
    </div>
  );
}
