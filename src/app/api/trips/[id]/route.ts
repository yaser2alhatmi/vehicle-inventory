import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { errorResponse } from "@/lib/apiError";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = supabaseServer();
    const { data, error } = await db
      .from("trips")
      .select("*, vehicle:vehicles(*), trip_items(*, item:items(*))")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
