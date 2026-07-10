-- Vehicle Inventory Management — database schema
-- Run this in the Supabase SQL editor (or psql) before starting the app.

-- ============================================================
-- Tables
-- ============================================================

create table items (
  id          uuid primary key default gen_random_uuid(),
  barcode     text not null unique,
  name        text not null,
  unit        text not null,
  qty_on_hand numeric not null default 0 check (qty_on_hand >= 0),
  min_qty     numeric not null default 0 check (min_qty >= 0), -- low-stock threshold
  created_at  timestamptz not null default now()
);

create table vehicles (
  id           uuid primary key default gen_random_uuid(),
  registration text not null unique,
  type         text not null,
  created_at   timestamptz not null default now()
);

create table trips (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references vehicles (id),
  status      text not null default 'out' check (status in ('out', 'returned')),
  left_at     timestamptz not null default now(),
  returned_at timestamptz,
  notes       text
);

create table trip_items (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references trips (id) on delete cascade,
  item_id      uuid not null references items (id),
  qty_taken    numeric not null check (qty_taken > 0),
  qty_returned numeric check (qty_returned >= 0 and qty_returned <= qty_taken),
  unique (trip_id, item_id)
);

create index trip_items_item_id_idx on trip_items (item_id);
create index trips_vehicle_id_idx on trips (vehicle_id);
create index trips_status_idx on trips (status);

-- ============================================================
-- Atomic operations
-- Stock is only ever mutated inside these functions, so a trip
-- and its stock movements always succeed or fail together.
-- ============================================================

-- Start a trip: locks each item row, validates stock, deducts it.
-- lines: [{ "item_id": "...", "qty": 5 }, ...]
create or replace function create_trip(p_vehicle_id uuid, p_lines jsonb)
returns uuid
language plpgsql
as $$
declare
  v_trip_id uuid;
  v_line    record;
  v_item    items%rowtype;
begin
  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'TRIP_EMPTY: a trip needs at least one item';
  end if;

  if exists (select 1 from trips where vehicle_id = p_vehicle_id and status = 'out') then
    raise exception 'VEHICLE_BUSY: this vehicle already has a trip out';
  end if;

  insert into trips (vehicle_id) values (p_vehicle_id) returning id into v_trip_id;

  for v_line in
    select (l ->> 'item_id')::uuid as item_id, (l ->> 'qty')::numeric as qty
    from jsonb_array_elements(p_lines) l
  loop
    if v_line.qty is null or v_line.qty <= 0 then
      raise exception 'QTY_INVALID: quantity must be greater than zero';
    end if;

    select * into v_item from items where id = v_line.item_id for update;
    if not found then
      raise exception 'ITEM_NOT_FOUND: item % does not exist', v_line.item_id;
    end if;

    if v_item.qty_on_hand < v_line.qty then
      raise exception 'INSUFFICIENT_STOCK: only % % of "%" in stock',
        v_item.qty_on_hand, v_item.unit, v_item.name;
    end if;

    update items set qty_on_hand = qty_on_hand - v_line.qty where id = v_line.item_id;

    insert into trip_items (trip_id, item_id, qty_taken)
    values (v_trip_id, v_line.item_id, v_line.qty);
  end loop;

  return v_trip_id;
end;
$$;

-- Return a trip: validates every returned qty, restocks, closes the trip.
-- lines: [{ "trip_item_id": "...", "qty_returned": 3 }, ...]
create or replace function return_trip(p_trip_id uuid, p_lines jsonb)
returns void
language plpgsql
as $$
declare
  v_trip  trips%rowtype;
  v_line  record;
  v_ti    trip_items%rowtype;
  v_count int;
begin
  select * into v_trip from trips where id = p_trip_id for update;
  if not found then
    raise exception 'TRIP_NOT_FOUND: trip % does not exist', p_trip_id;
  end if;
  if v_trip.status = 'returned' then
    raise exception 'TRIP_ALREADY_RETURNED: this trip was already returned';
  end if;

  -- every line of the trip must be accounted for
  select count(*) into v_count from trip_items where trip_id = p_trip_id;
  if v_count <> jsonb_array_length(coalesce(p_lines, '[]'::jsonb)) then
    raise exception 'RETURN_INCOMPLETE: every item on the trip must have a returned quantity';
  end if;

  for v_line in
    select (l ->> 'trip_item_id')::uuid as trip_item_id,
           (l ->> 'qty_returned')::numeric as qty_returned
    from jsonb_array_elements(p_lines) l
  loop
    select * into v_ti from trip_items
    where id = v_line.trip_item_id and trip_id = p_trip_id
    for update;
    if not found then
      raise exception 'LINE_NOT_ON_TRIP: line % is not part of this trip', v_line.trip_item_id;
    end if;

    if v_line.qty_returned is null or v_line.qty_returned < 0 then
      raise exception 'QTY_INVALID: returned quantity cannot be negative';
    end if;
    if v_line.qty_returned > v_ti.qty_taken then
      raise exception 'RETURN_EXCEEDS_TAKEN: cannot return more than was taken';
    end if;

    update trip_items set qty_returned = v_line.qty_returned where id = v_ti.id;
    update items set qty_on_hand = qty_on_hand + v_line.qty_returned where id = v_ti.item_id;
  end loop;

  update trips set status = 'returned', returned_at = now() where id = p_trip_id;
end;
$$;

-- Items referenced by any trip cannot be deleted (history must stay accurate);
-- the API surfaces this as a friendly error.
