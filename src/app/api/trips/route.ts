import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

const TRIP_SELECT = "*, vehicle:vehicles(*), trip_items(*, item:items(*))";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const db = supabaseServer();

    let query = db.from("trips").select(TRIP_SELECT).order("left_at", { ascending: false });
    if (status === "out" || status === "returned") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * Start a trip. Body: { vehicle_id, lines: [{ item_id, qty }] }
 * Stock deduction happens atomically inside the create_trip DB function.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vehicleId = String(body.vehicle_id ?? "");
    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!vehicleId) return badRequest("Pick a vehicle");
    if (lines.length === 0) return badRequest("Add at least one item");

    // merge duplicate lines for the same item (typed the same barcode twice)
    const merged = new Map<string, number>();
    for (const line of lines) {
      const itemId = String(line.item_id ?? "");
      const qty = Number(line.qty);
      if (!itemId) return badRequest("Every line needs an item");
      if (!Number.isFinite(qty) || qty <= 0) return badRequest("Every quantity must be greater than zero");
      merged.set(itemId, (merged.get(itemId) ?? 0) + qty);
    }

    const db = supabaseServer();
    const { data: tripId, error } = await db.rpc("create_trip", {
      p_vehicle_id: vehicleId,
      p_lines: [...merged].map(([item_id, qty]) => ({ item_id, qty })),
    });
    if (error) throw error;

    const { data, error: fetchError } = await db
      .from("trips")
      .select(TRIP_SELECT)
      .eq("id", tripId)
      .single();
    if (fetchError) throw fetchError;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
