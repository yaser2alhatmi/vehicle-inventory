import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { badRequest, errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const db = supabaseServer();
    const { data, error } = await db.from("vehicles").select("*").order("registration");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const registration = String(body.registration ?? "").trim();
    const type = String(body.type ?? "").trim();

    if (!registration) return badRequest("Registration is required");
    if (!type) return badRequest("Type is required");

    const db = supabaseServer();
    const { data, error } = await db
      .from("vehicles")
      .insert({ registration, type })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
