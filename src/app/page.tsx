"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Item } from "@/lib/types";
import { ErrorBanner, EmptyState, Spinner, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/ui";

const EMPTY_FORM = { barcode: "", name: "", unit: "", qty_on_hand: "0", min_qty: "0" };

export default function StockPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<Item[]>("/api/items"));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(item: Item) {
    setEditingId(item.id);
    setForm({
      barcode: item.barcode,
      name: item.name,
      unit: item.unit,
      qty_on_hand: String(item.qty_on_hand),
      min_qty: String(item.min_qty),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        barcode: form.barcode,
        name: form.name,
        unit: form.unit,
        qty_on_hand: Number(form.qty_on_hand),
        min_qty: Number(form.min_qty),
      };
      if (editingId) {
        await api(`/api/items/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/items", { method: "POST", body: JSON.stringify(payload) });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`Delete "${item.name}" (${item.barcode})?`)) return;
    setError("");
    try {
      await api(`/api/items/${item.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const lowStock = (items ?? []).filter((i) => i.min_qty > 0 && i.qty_on_hand <= i.min_qty);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Stock</h1>
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {lowStock.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Low stock: {lowStock.map((i) => `${i.name} (${i.qty_on_hand} ${i.unit})`).join(" · ")}
        </div>
      )}

      <form onSubmit={save} className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">
          {editingId ? "Edit item" : "Add item"}
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <input className={inputCls} placeholder="Barcode / SKU" value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
          <input className={inputCls} placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className={inputCls} placeholder="Unit (piece, meter…)" value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          <input className={inputCls} type="number" min="0" step="any" placeholder="Qty on hand"
            value={form.qty_on_hand}
            onChange={(e) => setForm({ ...form, qty_on_hand: e.target.value })} required />
          <input className={inputCls} type="number" min="0" step="any" placeholder="Low-stock alert at"
            value={form.min_qty}
            onChange={(e) => setForm({ ...form, min_qty: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className={btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" hint="Add your first stock item above." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">On hand</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const low = item.min_qty > 0 && item.qty_on_hand <= item.min_qty;
                return (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{item.barcode}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-slate-500">{item.unit}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={low ? "font-semibold text-amber-600" : ""}>
                        {item.qty_on_hand}
                        {low && " ⚠️"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => startEdit(item)} className="mr-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50">
                        Edit
                      </button>
                      <button onClick={() => remove(item)} className={btnDanger}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
