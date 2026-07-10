"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Vehicle } from "@/lib/types";
import { ErrorBanner, EmptyState, Spinner, inputCls, btnPrimary, btnSecondary } from "@/components/ui";

const EMPTY_FORM = { registration: "", type: "" };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setVehicles(await api<Vehicle[]>("/api/vehicles"));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api(`/api/vehicles/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/api/vehicles", { method: "POST", body: JSON.stringify(form) });
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Vehicles</h1>
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <form onSubmit={save} className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">
          {editingId ? "Edit vehicle" : "Add vehicle"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Registration / name" value={form.registration}
            onChange={(e) => setForm({ ...form, registration: e.target.value })} required />
          <input className={inputCls} placeholder="Type (van, truck…)" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add vehicle"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className={btnSecondary}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {vehicles === null ? (
        <Spinner />
      ) : vehicles.length === 0 ? (
        <EmptyState title="No vehicles yet" hint="Add your first vehicle above." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{v.registration}</td>
                  <td className="px-4 py-2 text-slate-500">{v.type}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => {
                        setEditingId(v.id);
                        setForm({ registration: v.registration, type: v.type });
                      }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
