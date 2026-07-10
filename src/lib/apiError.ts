import { NextResponse } from "next/server";

/**
 * The Postgres functions raise errors like "INSUFFICIENT_STOCK: only 5 …".
 * Map those codes (and common constraint violations) to clean 400 responses.
 */
const KNOWN_CODES = [
  "TRIP_EMPTY",
  "VEHICLE_BUSY",
  "VEHICLE_NOT_FOUND",
  "QTY_INVALID",
  "ITEM_NOT_FOUND",
  "INSUFFICIENT_STOCK",
  "TRIP_NOT_FOUND",
  "TRIP_ALREADY_RETURNED",
  "RETURN_INCOMPLETE",
  "LINE_NOT_ON_TRIP",
  "RETURN_EXCEEDS_TAKEN",
] as const;

export function errorResponse(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : String(err);

  for (const code of KNOWN_CODES) {
    if (message.includes(code)) {
      return NextResponse.json(
        { error: message.slice(message.indexOf(code)) },
        { status: 400 },
      );
    }
  }

  if (message.includes("duplicate key") && message.includes("barcode")) {
    return NextResponse.json({ error: "That barcode already exists" }, { status: 400 });
  }
  if (message.includes("duplicate key") && message.includes("registration")) {
    return NextResponse.json({ error: "That registration already exists" }, { status: 400 });
  }
  if (message.includes("violates foreign key constraint")) {
    return NextResponse.json(
      { error: "This record is referenced by trip history and cannot be deleted" },
      { status: 400 },
    );
  }

  console.error(err);
  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}
