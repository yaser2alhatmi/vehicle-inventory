import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = supabaseServer();
    const { data, error } = await db.from("items").select("*").eq("id", id).single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const barcode = String(body.barcode ?? "").trim();
    const name = String(body.name ?? "").trim();
    const unit = String(body.unit ?? "").trim();
    const qty = Number(body.qty_on_hand);
    const minQty = Number(body.min_qty ?? 0);

    if (!barcode) return badRequest("Barcode is required");
    if (!name) return badRequest("Name is required");
    if (!unit) return badRequest("Unit is required");
    if (!Number.isFinite(qty) || qty < 0) return badRequest("Quantity must be zero or more");
    if (!Number.isFinite(minQty) || minQty < 0) return badRequest("Low-stock threshold must be zero or more");

    const db = supabaseServer();
    const { data, error } = await db
      .from("items")
      .update({ barcode, name, unit, qty_on_hand: qty, min_qty: minQty })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = supabaseServer();

    // Items with trip history can't be deleted — the FK would block it anyway,
    // but checking first gives a clearer message.
    const { count, error: countError } = await db
      .from("trip_items")
      .select("id", { count: "exact", head: true })
      .eq("item_id", id);
    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      return badRequest("This item appears in trip history and cannot be deleted");
    }

    const { error } = await db.from("items").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
