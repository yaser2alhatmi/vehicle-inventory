-- Seed data — run after schema.sql for a quick demo.

insert into items (barcode, name, unit, qty_on_hand, min_qty) values
  ('CBL-001', 'Coaxial cable',        'meter', 500, 100),
  ('CBL-002', 'Cat6 network cable',   'meter', 300, 50),
  ('CON-010', 'RJ45 connector',       'piece', 200, 40),
  ('SPL-020', 'Fiber splitter 1x8',   'piece', 35,  10),
  ('TAP-030', 'Insulation tape',      'roll',  80,  20),
  ('CLM-040', 'Cable clamp',          'piece', 400, 100),
  ('RTR-050', 'Customer router',      'piece', 25,  5),
  ('ONT-060', 'Fiber ONT unit',       'piece', 18,  5);

insert into vehicles (registration, type) values
  ('VAN-1042', 'Service van'),
  ('VAN-1043', 'Service van'),
  ('TRK-2201', 'Bucket truck'),
  ('PCK-3310', 'Pickup');

-- One finished trip so history isn't empty:
do $$
declare
  v_vehicle uuid;
  v_trip    uuid;
begin
  select id into v_vehicle from vehicles where registration = 'VAN-1043';

  select create_trip(v_vehicle, jsonb_build_array(
    jsonb_build_object('item_id', (select id from items where barcode = 'CBL-001'), 'qty', 120),
    jsonb_build_object('item_id', (select id from items where barcode = 'CON-010'), 'qty', 30),
    jsonb_build_object('item_id', (select id from items where barcode = 'TAP-030'), 'qty', 5)
  )) into v_trip;

  perform return_trip(v_trip, (
    select jsonb_agg(jsonb_build_object(
      'trip_item_id', ti.id,
      'qty_returned', case
        when i.barcode = 'CBL-001' then 20
        when i.barcode = 'CON-010' then 12
        else 1 end))
    from trip_items ti join items i on i.id = ti.item_id
    where ti.trip_id = v_trip
  ));
end $$;

-- And one trip currently out:
do $$
declare
  v_vehicle uuid;
begin
  select id into v_vehicle from vehicles where registration = 'VAN-1042';
  perform create_trip(v_vehicle, jsonb_build_array(
    jsonb_build_object('item_id', (select id from items where barcode = 'CBL-002'), 'qty', 80),
    jsonb_build_object('item_id', (select id from items where barcode = 'RTR-050'), 'qty', 4),
    jsonb_build_object('item_id', (select id from items where barcode = 'ONT-060'), 'qty', 4)
  ));
end $$;
