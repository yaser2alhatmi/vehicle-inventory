export interface Item {
  id: string;
  barcode: string;
  name: string;
  unit: string;
  qty_on_hand: number;
  min_qty: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  type: string;
  created_at: string;
}

export type TripStatus = "out" | "returned";

export interface TripItem {
  id: string;
  trip_id: string;
  item_id: string;
  qty_taken: number;
  qty_returned: number | null;
  item?: Item;
}

export interface Trip {
  id: string;
  vehicle_id: string;
  status: TripStatus;
  left_at: string;
  returned_at: string | null;
  notes: string | null;
  vehicle?: Vehicle;
  trip_items?: TripItem[];
}

/** Used = taken − returned; only meaningful once the trip is back. */
export function qtyUsed(line: TripItem): number | null {
  return line.qty_returned === null ? null : line.qty_taken - line.qty_returned;
}
