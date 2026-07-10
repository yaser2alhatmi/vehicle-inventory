"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { Item, Vehicle, Trip } from "@/lib/types";
import { ErrorBanner, Spinner, inputCls, btnPrimary, btnDanger } from "@/components/ui";

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
      <h1 className="mb-4 text-xl font-semibold">Start a trip</h1>
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Vehicle</label>
        <select className={inputCls} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">— pick a vehicle —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} ({v.type})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Add item by barcode <span className="font-normal text-slate-400">(type or scan, then Enter)</span>
        </label>
        <form onSubmit={addByBarcode} className="flex gap-2">
          <input
            ref={barcodeRef}
            className={inputCls + " font-mono"}
            placeholder="e.g. CBL-001"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            autoFocus
          />
          <button type="submit" className={btnPrimary}>
            Add
          </button>
        </form>
        <datalist id="barcodes">
          {items.map((i) => (
            <option key={i.id} value={i.barcode}>{i.name}</option>
          ))}
        </datalist>
        <p className="mt-2 text-xs text-slate-400">
          Available: {items.filter((i) => i.qty_on_hand > 0).map((i) => i.barcode).join(" · ") || "nothing in stock"}
        </p>
      </div>

      {lines.length > 0 && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">In stock</th>
                <th className="px-4 py-3 text-right">Qty to take</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.item.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs text-slate-400">{l.item.barcode}</span>{" "}
                    {l.item.name}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-500">
                    {l.item.qty_on_hand} {l.item.unit}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      max={l.item.qty_on_hand}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm"
                      value={l.qty}
                      onChange={(e) => setQty(l.item.id, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
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

      <button onClick={startTrip} disabled={saving} className={btnPrimary}>
        {saving ? "Starting…" : "Start trip (deducts stock)"}
      </button>
    </div>
  );
}
