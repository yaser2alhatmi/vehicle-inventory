import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

type Params = { params: Promise<{ id: string }> };

/**
 * Return a trip. Body: { lines: [{ trip_item_id, qty_returned }] }
 * Restocking + closing the trip happens atomically in the return_trip DB function.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (lines.length === 0) return badRequest("Provide returned quantities");
    for (const line of lines) {
      const qty = Number(line.qty_returned);
      if (!line.trip_item_id) return badRequest("Every line needs a trip_item_id");
      if (!Number.isFinite(qty) || qty < 0) return badRequest("Returned quantities cannot be negative");
    }

    const db = supabaseServer();
    const { error } = await db.rpc("return_trip", {
      p_trip_id: id,
      p_lines: lines.map((l: { trip_item_id: string; qty_returned: number }) => ({
        trip_item_id: l.trip_item_id,
        qty_returned: Number(l.qty_returned),
      })),
    });
    if (error) throw error;

    const { data, error: fetchError } = await db
      .from("trips")
      .select("*, vehicle:vehicles(*), trip_items(*, item:items(*))")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
