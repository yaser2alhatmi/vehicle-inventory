"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { Vehicle } from "@/lib/types";
import {
  PageHeader, Card, Field, ErrorBanner, EmptyState, Spinner,
  inputCls, btnPrimary, btnSecondary, btnGhost,
  tableWrapCls, theadCls, rowCls,
} from "@/components/ui";

const EMPTY_FORM = { registration: "", type: "" };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    () =>
      api<Vehicle[]>("/api/vehicles")
        .then(setVehicles)
        .catch((err) => setError((err as Error).message)),
    [],
  );

  useEffect(() => {
    void load();
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
      <PageHeader title="Vehicles" subtitle="The fleet that carries stock out to jobs" />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <Card title={editingId ? "Edit vehicle" : "Add vehicle"} className="mb-6">
        <form onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registration / name">
              <input className={inputCls} placeholder="VAN-1042" value={form.registration}
                onChange={(e) => setForm({ ...form, registration: e.target.value })} required />
            </Field>
            <Field label="Type">
              <input className={inputCls} placeholder="Service van, truck…" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })} required />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : editingId ? "Save changes" : "+ Add vehicle"}
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
      </Card>

      {vehicles === null ? (
        <Spinner />
      ) : vehicles.length === 0 ? (
        <EmptyState title="No vehicles yet" hint="Add your first vehicle above." />
      ) : (
        <div className={tableWrapCls}>
          <table className="w-full text-sm">
            <thead>
              <tr className={theadCls}>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className={rowCls}>
                  <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{v.registration}</td>
                  <td className="px-4 py-2.5 text-slate-500">{v.type}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => {
                        setEditingId(v.id);
                        setForm({ registration: v.registration, type: v.type });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={btnGhost}
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
