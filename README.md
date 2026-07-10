# Vehicle Inventory Management

Tracks what field crews take out of the store and bring back. A crew loads a
vehicle with items (by barcode), goes out, and returns with what they didn't
use. The app keeps stock accurate and reconciles each trip: **taken / returned / used**.

**Stack:** Next.js (App Router) + TypeScript + Supabase (Postgres + Auth)

**Live demo:** https://yaser-vehicle-inventory.netlify.app
Sign in with: `yaser@store.local` / `Yaser@6070Oman`

## Features

- **Stock** — add, edit, delete items (barcode, name, unit, quantity) + low-stock alerts.
- **Vehicles** — add, edit (registration + type).
- **Start a trip** — pick a vehicle, add items by barcode; stock is deducted right away.
- **Return a trip** — enter what came back; stock is topped up and *used = taken − returned*.
- **Views** — current stock, trips out now, and full trip history.
- **Login** — the whole app is behind Supabase Auth.

Validation: can't take more than in stock, can't return more than taken,
barcodes are unique, no negative amounts, one open trip per vehicle, and items
with history can't be deleted.

## Run it locally

Needs Node 20+ and a free [Supabase](https://supabase.com) project.

1. **Database** — in Supabase → SQL Editor, run `supabase/schema.sql` then
   `supabase/seed.sql` (if it warns about RLS, choose "Run without RLS").

2. **Login user** — Supabase → Authentication → Users → Add user. Enter an
   email + password and tick "Auto Confirm User".

3. **Environment** — copy the example file and fill in your keys from
   Supabase → Settings → API Keys:

   ```
   cp .env.example .env.local
   ```

4. **Start:**

   ```
   npm install
   npm run dev
   ```

   Open http://localhost:3000 and sign in.

## How it's built

- **Stock moves atomically.** Starting/returning a trip runs a Postgres
  function (`create_trip` / `return_trip`) that locks the rows, validates, and
  updates stock in one transaction — so two people can't oversell the last item.
- **Used is computed** (taken − returned), never stored, so it can't drift.
- **The browser never touches Supabase directly** — all data goes through the
  Next.js API routes, so validation lives in one place and the key stays server-side.
- **Constraints exist twice** — in the API for clear messages, and in the
  database (CHECK / UNIQUE) as a safety net.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | /api/items | list, create |
| GET / PUT / DELETE | /api/items/:id | view, edit, delete |
| GET / POST | /api/vehicles | list, create |
| GET / PUT | /api/vehicles/:id | view, edit |
| GET | /api/trips | list (optional `?status=out`) |
| POST | /api/trips | start a trip |
| GET | /api/trips/:id | trip detail |
| POST | /api/trips/:id/return | return a trip |

---

© 2026 Yasser-ALhatmi. All rights reserved.
