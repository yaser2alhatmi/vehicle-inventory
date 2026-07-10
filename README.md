# Vehicle Inventory Management

A small fleet-inventory module: field crews load a vehicle with stock items
(identified by barcode/SKU), drive out, and return with what they didn't use.
The system keeps stock accurate and reconciles every trip — **taken / returned / used**.

Built with **Next.js (App Router) + TypeScript + Supabase (Postgres)**.

## Features

- **Stock** — create / edit / delete items (unique barcode, name, unit, qty on hand), with low-stock alerts.
- **Vehicles** — create / edit vehicles (registration + type).
- **Start a trip** — pick a vehicle, add items *by barcode* with quantities; stock is deducted atomically.
- **Return a trip** — record returned quantities; stock is restocked and *used = taken − returned* is shown.
- **Views** — current stock, trips currently out, and full trip history with reconciliation.
- **Validation everywhere** — can't take more than is in stock, can't return more than was taken,
  duplicate barcodes rejected, one open trip per vehicle, items with history can't be deleted.

### Bonus features (fully working)

1. **Barcode quick-add** — on the trip screen, type/paste a barcode and press Enter to add the item
   (adds +1 on repeat scans). USB barcode scanners emulate a keyboard ending with Enter, so this
   works with real scanner hardware without any extra code.
2. **Low-stock alerts** — each item has an optional threshold; the stock page highlights items
   at or below it with a warning banner.

## How to run locally

### 1. Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

### 2. Set up the database

In your Supabase project, open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — tables + atomic `create_trip` / `return_trip` functions
2. `supabase/seed.sql` — demo items, vehicles, one finished trip, one trip currently out

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in from Supabase → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Design decisions

- **Stock mutations live in the database.** Starting/returning a trip calls a Postgres function
  (`create_trip` / `return_trip`) that locks the item rows, validates, and updates stock in one
  transaction. Two clerks starting trips at the same moment can never oversell stock, and a trip
  can never half-apply.
- **The browser never talks to Supabase.** All access goes through Next.js API routes
  (`/api/*`), so validation and error mapping live in one place and the DB key stays server-side.
- **`used` is computed, never stored** (`taken − returned`) — it can't drift out of sync.
- **Constraints are duplicated at the DB level** (`unique`, `check`) as a last line of defense;
  the API returns friendly 400 messages for each known violation.
- **One open trip per vehicle** — returning is per-trip and closes it; simple and predictable.

## Project structure

```
supabase/            schema.sql + seed.sql (run in Supabase SQL editor)
src/lib/             types, Supabase server client, API error mapping, fetch helper
src/app/api/         REST route handlers (items, vehicles, trips, trip return)
src/app/             pages: stock (/), vehicles, trips list/new/detail
src/components/      small shared UI pieces
```

## API overview

| Method | Path                     | Purpose                                  |
| ------ | ------------------------ | ---------------------------------------- |
| GET/POST | `/api/items`           | list / create items                      |
| GET/PUT/DELETE | `/api/items/:id` | view / edit / delete an item             |
| GET/POST | `/api/vehicles`        | list / create vehicles                   |
| GET/PUT | `/api/vehicles/:id`     | view / edit a vehicle                    |
| GET | `/api/trips?status=out`     | list trips (optionally filter by status) |
| POST | `/api/trips`               | start a trip `{ vehicle_id, lines: [{item_id, qty}] }` |
| GET | `/api/trips/:id`            | trip detail with reconciliation          |
| POST | `/api/trips/:id/return`    | return `{ lines: [{trip_item_id, qty_returned}] }` |

Errors are always `{ "error": "human-readable message" }` with status 400.
