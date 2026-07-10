import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { errorResponse } from "@/lib/apiError";

/**
 * Dashboard stats: overall counts plus a "most used items" list built from
 * returned trips (used = taken - returned).
 */
export async function GET() {
  try {
    const db = supabaseServer();

    const { data: items, error: itemsError } = await db.from("items").select("*");
    if (itemsError) throw itemsError;

    const { data: trips, error: tripsError } = await db.from("trips").select("id, status");
    if (tripsError) throw tripsError;

    const { data: lines, error: linesError } = await db
      .from("trip_items")
      .select("item_id, qty_taken, qty_returned, item:items(name, unit, barcode)");
    if (linesError) throw linesError;

    // aggregate used per item across all settled lines
    const usage = new Map<string, { name: string; unit: string; barcode: string; used: number }>();
    for (const l of lines ?? []) {
      if (l.qty_returned === null) continue; // trip still out, not reconciled yet
      const used = Number(l.qty_taken) - Number(l.qty_returned);
      if (used <= 0) continue;
      const item = Array.isArray(l.item) ? l.item[0] : l.item;
      const prev = usage.get(l.item_id);
      if (prev) {
        prev.used += used;
      } else {
        usage.set(l.item_id, {
          name: item?.name ?? "—",
          unit: item?.unit ?? "",
          barcode: item?.barcode ?? "",
          used,
        });
      }
    }

    const mostUsed = [...usage.values()].sort((a, b) => b.used - a.used).slice(0, 10);

    return NextResponse.json({
      totalItems: items?.length ?? 0,
      lowStock: (items ?? []).filter((i) => i.min_qty > 0 && i.qty_on_hand <= i.min_qty).length,
      tripsOut: (trips ?? []).filter((t) => t.status === "out").length,
      tripsTotal: trips?.length ?? 0,
      totalUsed: [...usage.values()].reduce((s, u) => s + u.used, 0),
      mostUsed,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
