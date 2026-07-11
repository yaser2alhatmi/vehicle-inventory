"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Item } from "@/lib/types";
import {
  PageHeader, Card, Field, Barcode, ErrorBanner, EmptyState, Spinner,
  inputCls, btnPrimary, btnSecondary, btnGhost, btnDanger,
  tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

const EMPTY_FORM = { barcode: "", name: "", unit: "", qty_on_hand: "0", min_qty: "0" };

// common stock units — a dropdown keeps them consistent instead of free typing
const UNITS = ["piece", "meter", "roll", "box", "pack", "liter", "kg", "set"];

export default function StockPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(
    () =>
      api<Item[]>("/api/items")
        .then(setItems)
        .catch((err) => setError((err as Error).message)),
    [],
  );

  useEffect(() => {
    void load();
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  const q = search.trim().toLowerCase();
  const visible = (items ?? []).filter(
    (i) => !q || i.name.toLowerCase().includes(q) || i.barcode.toLowerCase().includes(q),
  );

  return (
    <div>
      <PageHeader title="Stock" subtitle="Current inventory levels in the store" />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {lowStock.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span aria-hidden>⚠️</span>
          <span>
            <span className="font-semibold">Low stock:</span>{" "}
            {lowStock.map((i) => `${i.name} (${i.qty_on_hand} ${i.unit})`).join(" · ")}
          </span>
        </div>
      )}

      <Card title={editingId ? "Edit item" : "Add item"} className="mb-6">
        <form onSubmit={save}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Field label="Barcode / SKU">
              <input className={inputCls + " font-mono"} placeholder="CBL-001" value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
            </Field>
            <Field label="Name">
              <input className={inputCls} placeholder="Coaxial cable" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Unit">
              <select className={inputCls} value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })} required>
                <option value="">— choose —</option>
                {(form.unit && !UNITS.includes(form.unit) ? [form.unit, ...UNITS] : UNITS).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Qty on hand">
              <input className={inputCls} type="number" min="0" step="any" value={form.qty_on_hand}
                onChange={(e) => setForm({ ...form, qty_on_hand: e.target.value })} required />
            </Field>
            <Field label="Low-stock alert at">
              <input className={inputCls} type="number" min="0" step="any" value={form.min_qty}
                onChange={(e) => setForm({ ...form, min_qty: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : editingId ? "Save changes" : "+ Add item"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className={btnSecondary}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      {items !== null && items.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <input
            className={inputCls + " max-w-xs"}
            placeholder="Search by name or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="whitespace-nowrap text-xs text-slate-400">
            {visible.length} of {items.length} items
          </span>
        </div>
      )}

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" hint="Add your first stock item above." />
      ) : visible.length === 0 ? (
        <EmptyState title="No items match your search" hint="Try a different name or barcode." />
      ) : (
        <div className={tableWrapCls}>
          <table className="w-full text-sm">
            <thead>
              <tr className={theadCls}>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">On hand</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const low = item.min_qty > 0 && item.qty_on_hand <= item.min_qty;
                return (
                  <tr key={item.id} className={rowCls}>
                    <td className="px-4 py-2.5">
                      <Barcode code={item.barcode} />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{item.unit}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <span className={low ? "font-semibold text-amber-600 dark:text-amber-400" : "font-medium text-slate-700 dark:text-slate-200"}>
                        {item.qty_on_hand}
                      </span>
                      {low && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(item)} className={btnGhost}>
                        Edit
                      </button>
                      <button onClick={() => remove(item)} className={btnDanger + " ml-1"}>
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
