-- Internal categories the Essentials shelves are built from (customers see shelves,
-- not categories). Safe to re-run.
insert into public.categories (slug, name, world, sort) values
  ('henleys',      'Henleys',      'wear', 8),
  ('tees',         'Tees',         'wear', 9),
  ('long-sleeves', 'Long sleeves', 'wear', 10),
  ('overshirts',   'Overshirts',   'wear', 11)
on conflict (slug) do nothing;
