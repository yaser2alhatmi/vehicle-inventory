import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = supabaseServer();
    const { data, error } = await db.from("vehicles").select("*").eq("id", id).single();
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
    const registration = String(body.registration ?? "").trim();
    const type = String(body.type ?? "").trim();

    if (!registration) return badRequest("Registration is required");
    if (!type) return badRequest("Type is required");

    const db = supabaseServer();
    const { data, error } = await db
      .from("vehicles")
      .update({ registration, type })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
