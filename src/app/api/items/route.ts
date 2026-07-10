import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const db = supabaseServer();
    const { data, error } = await db.from("items").select("*").order("name");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const barcode = String(body.barcode ?? "").trim();
    const name = String(body.name ?? "").trim();
    const unit = String(body.unit ?? "").trim();
    const qty = Number(body.qty_on_hand ?? 0);
    const minQty = Number(body.min_qty ?? 0);

    if (!barcode) return badRequest("Barcode is required");
    if (!name) return badRequest("Name is required");
    if (!unit) return badRequest("Unit is required");
    if (!Number.isFinite(qty) || qty < 0) return badRequest("Quantity must be zero or more");
    if (!Number.isFinite(minQty) || minQty < 0) return badRequest("Low-stock threshold must be zero or more");

    const db = supabaseServer();
    const { data, error } = await db
      .from("items")
      .insert({ barcode, name, unit, qty_on_hand: qty, min_qty: minQty })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
