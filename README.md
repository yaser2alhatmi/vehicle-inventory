# Vehicle Inventory Management

This is my take-home submission: a small module for tracking what field crews
take out of the store and what they bring back. A crew loads a vehicle with
items (each identified by a barcode/SKU), goes out on a job, and returns with
whatever they didn't use. The app keeps stock accurate and reconciles every
trip: taken / returned / used.

Stack: Next.js (App Router) + TypeScript + Supabase (Postgres + Auth).

Live demo: https://yaser-vehicle-inventory.netlify.app
Sign in with the demo account: `yaser@store.local` / `Yaser@6070Oman`

## Running it locally

You need Node 20+ and a free Supabase project.

1. Set up the database. In your Supabase project open the SQL Editor and run
   these two files, in this order:
   - `supabase/schema.sql` (tables + the two functions that move stock)
   - `supabase/seed.sql` (demo data: items, vehicles, one finished trip and
     one trip currently out, so every screen has something to show)

   If the editor warns about Row Level Security, choose "Run without RLS" —
   see the note at the bottom about why.

2. Create a sign-in user. The app is behind a login, so in the Supabase
   dashboard go to Authentication → Users → Add user, enter any email and
   password, and check "Auto Confirm User".

3. Configure the environment:

   ```
   cp .env.example .env.local
   ```

   Fill in both values from your Supabase project (Settings → API Keys):
   the project URL and the publishable (anon) key.

4. Install and run:

   ```
   npm install
   npm run dev
   ```

   Open http://localhost:3000 and sign in with the user you created.

## What's in it

- Stock: add / edit / delete items (unique barcode, name, unit, quantity),
  plus a low-stock threshold per item that highlights items running low.
- Vehicles: add / edit (registration and type — kept light on purpose).
- Start a trip: pick a vehicle, add items by barcode with quantities.
  Stock is deducted the moment the trip starts, and the departure time is
  recorded.
- Return a trip: enter how much of each item came back. Returned quantities
  go back into stock, the trip closes, and the app shows used = taken −
  returned, per item and per trip.
- Views: current stock, trips currently out, and trip history with the full
  taken / returned / used breakdown.

Validation I handled: you can't take more than is in stock, you can't return
more than was taken, barcodes are unique (case-insensitive, trimmed), no
zero/negative quantities, no empty trips, a vehicle can't start a second trip
while one is out, every line must be settled when returning, a trip can't be
returned twice, and items that appear in trip history can't be deleted
(the history would stop making sense).

Extras I added on top of the core:

- Authentication: the whole app sits behind a Supabase Auth login. A server
  gate (Next.js proxy) redirects signed-out visitors to /login and answers
  API calls with 401, so protection isn't just hidden links — the API itself
  is closed.
- Barcode quick-add: on the trip screen you type or paste a barcode and hit
  Enter; scanning the same code again bumps the quantity. USB barcode
  scanners behave exactly like a keyboard that types the code and presses
  Enter, so this works with real scanner hardware even though none is
  required.
- Low-stock alerts: each item can have a minimum level; the stock page shows
  a warning banner and marks the items that are at or below it.
- Stock search: instant filter by name or barcode.

## Design decisions

The part I cared most about is stock consistency. Starting and returning a
trip are Postgres functions (`create_trip`, `return_trip`) that lock the
item rows, validate, and update everything in a single transaction. Two
people taking the last of an item at the same time can't both succeed, and a
trip can never half-apply. The API routes just call these functions and
translate their errors into readable 400 responses.

Other choices worth mentioning:

- "Used" is never stored — it's always computed as taken − returned, so it
  can't drift out of sync with the trip lines.
- The browser never talks to Supabase directly. Everything goes through the
  Next.js API routes, so validation and error handling live in one place and
  the database key stays on the server.
- Quantities are numeric, not integers, because units like meters make
  fractional amounts legitimate.
- The same constraints exist twice on purpose: friendly checks in the API,
  and CHECK/UNIQUE constraints in the database as the last line of defense.
- Returning is a single event that closes the trip. Partial/multiple returns
  per trip would be a real feature in a bigger system, but here it would
  complicate the model without adding much to the core idea.

About RLS: it's off because the database is only ever reached from the
server — the data key never ships to the browser, and the server gate
already requires a signed-in user for every page and API call. In a
production multi-tenant setup I'd enable RLS and write policies per role
on top of that.

## Project layout

```
supabase/         schema.sql and seed.sql
src/app/          pages (stock, vehicles, trips) and /api route handlers
src/lib/          types, supabase server client, error mapping, fetch helper
src/components/   shared UI bits
```

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET / POST | /api/items | list, create |
| GET / PUT / DELETE | /api/items/:id | view, edit, delete |
| GET / POST | /api/vehicles | list, create |
| GET / PUT | /api/vehicles/:id | view, edit |
| GET | /api/trips?status=out | list trips, optional status filter |
| POST | /api/trips | start a trip (deducts stock) |
| GET | /api/trips/:id | trip detail |
| POST | /api/trips/:id/return | return a trip (restocks, closes) |

Errors come back as `{ "error": "message" }` with status 400.
