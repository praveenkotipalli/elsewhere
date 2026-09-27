-- ELSEWHERE — Drop 001 seed. Real concept pieces only; no invented demand.
-- Specs describe what is planned, and may change before anything is produced.

insert into public.drops (id, code, title, description, is_public, sort) values
  ('00000000-0000-4000-8000-000000000001', '001', 'First Sighting',
   'Five pieces. None of them exist yet. The ones you want most get made.', true, 1);

insert into public.categories (slug, name, world, sort) values
  ('denim',     'Denim',     'wear',    1),
  ('outerwear', 'Outerwear', 'wear',    2),
  ('tops',      'Tops',      'wear',    3),
  ('shirts',    'Shirts',    'wear',    4),
  ('trousers',  'Trousers',  'wear',    5),
  ('knitwear',  'Knitwear',  'wear',    6),
  ('rings',     'Rings',     'objects', 7);

insert into public.vibes (slug, name, tagline, sort) values
  ('the-statement', 'The Statement', 'Loud on purpose.',                 1),
  ('after-dark',    'After Dark',    'Best seen under a flash.',          2),
  ('the-quiet',     'The Quiet',     'Says less. Gets asked about more.', 3),
  ('the-odd-one',   'The Odd One',   'Nobody else in the room has it.',  4);

with c as (select slug, id from public.categories)
insert into public.products
  (slug, code, name, tagline, description, story, details, tags, category_id, drop_id, status, is_public, sort)
values
(
  'dragon-denim', 'E-001', 'Dragon Denim',
  'One dragon. One leg. No explanation.',
  'Extra-wide raw indigo denim with a tonal dragon chain-stitched from the hip to the hem of one leg.',
  'The dragon is drawn by hand and stitched in a single pale thread, so it reads clearly in daylight and nearly disappears at night. It only goes down one leg. The other leg is left alone on purpose.',
  '[{"label":"Silhouette","value":"Extra-wide leg, mid-high rise, long pooled hem"},
    {"label":"Material","value":"Heavyweight raw indigo denim"},
    {"label":"Embroidery","value":"Tonal chain-stitch dragon, hip to hem, left leg"},
    {"label":"Hem","value":"Raw, left to fray with wear"},
    {"label":"Fit","value":"Relaxed through the thigh. Size down for less pooling"}]'::jsonb,
  array['denim','embroidery','wide-leg','indigo'],
  (select id from c where slug = 'denim'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 1
),
(
  'afterhours-bomber', 'E-002', 'Afterhours Bomber',
  'Black in the room. Something else in the photo.',
  'A boxy black satin bomber with a retroreflective panel on the chest that only lights up under a camera flash.',
  'In person it is just a very good black bomber. Point a phone at it with the flash on and the chest panel burns white in the picture. Made for nights that end up on someone''s story.',
  '[{"label":"Silhouette","value":"Boxy, dropped shoulder, ribbed collar, cuffs and hem"},
    {"label":"Shell","value":"Black satin-finish nylon"},
    {"label":"Detail","value":"Retroreflective chest panel, visible under flash"},
    {"label":"Hardware","value":"Brass two-way zip"},
    {"label":"Fit","value":"Oversized. Take your usual size"}]'::jsonb,
  array['outerwear','reflective','night','bomber'],
  (select id from c where slug = 'outerwear'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 2
),
(
  'static-tee', 'E-003', 'Static Tee',
  'Channel 00. Nothing on. Everything to look at.',
  'A heavyweight washed-charcoal tee with a framed, deliberately cracked print of dead-channel TV static.',
  'The print is laid down thick and left to crack from the first wash, so no two end up looking the same after a month. The frame is black, the static is grey-blue, and the tee is washed until it looks like it has a past.',
  '[{"label":"Silhouette","value":"Boxy, cropped body, dropped shoulder"},
    {"label":"Fabric","value":"Heavyweight cotton jersey, garment-washed charcoal"},
    {"label":"Print","value":"Framed static graphic, cracked finish by design"},
    {"label":"Neck","value":"Tight rib collar"},
    {"label":"Fit","value":"Oversized. Size down for a closer fit"}]'::jsonb,
  array['tee','graphic','washed','heavyweight'],
  (select id from c where slug = 'tops'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 3
),
(
  'red-room-overshirt', 'E-004', 'Red Room Overshirt',
  'Wear it like a room you walk into.',
  'An oversized oxblood overshirt in wide-wale corduroy, cut long and loose enough to wear open over anything.',
  'One colour, all the way through: oxblood cord, tonal stitching, dark buttons. It is loud because of the colour and the scale, not because of a logo. There isn''t one.',
  '[{"label":"Silhouette","value":"Oversized, long body, dropped shoulder"},
    {"label":"Fabric","value":"Wide-wale cotton corduroy, oxblood"},
    {"label":"Details","value":"Single patch pocket, tonal stitching, dark buttons"},
    {"label":"Wear","value":"Open as a jacket or closed as a shirt"},
    {"label":"Fit","value":"Oversized. Take your usual size"}]'::jsonb,
  array['corduroy','overshirt','red','layering'],
  (select id from c where slug = 'shirts'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 4
),
(
  'soft-metal', 'E-005', 'Soft Metal',
  'Silver that looks like it gave up and melted.',
  'Three heavy sculptural rings in polished silver, each shaped like it was cast mid-melt. Worn alone or stacked.',
  'Our first piece that is not clothing. The rings are chunky, slightly uneven, and polished bright, so they catch light when your hands move. We want to know if you want objects from us, not just clothes.',
  '[{"label":"Form","value":"Three sculptural rings, worn alone or stacked"},
    {"label":"Material","value":"Silver, high polish"},
    {"label":"Weight","value":"Heavy on purpose"},
    {"label":"Sizes","value":"To be confirmed"}]'::jsonb,
  array['rings','silver','jewellery','sculptural'],
  (select id from c where slug = 'rings'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 5
),
-- Concepts not yet photographed. Hidden until imagery exists.
(
  'bone-cargo', 'E-006', 'Bone Cargo',
  'Quiet, until you notice the pockets.',
  'Heavyweight ecru canvas cargo trousers with deep bellows pockets and drawcord parachute cuffs.',
  null,
  '[{"label":"Fabric","value":"Heavyweight ecru cotton canvas"},{"label":"Details","value":"Bellows pockets, drawcord cuffs"}]'::jsonb,
  array['cargo','ecru','canvas'],
  (select id from c where slug = 'trousers'), '00000000-0000-4000-8000-000000000001',
  'concept', false, 6
),
(
  'ghost-knit', 'E-007', 'Ghost Knit',
  'More holes than sweater.',
  'A pale grey open-knit sweater with irregular laddered holes, meant to be layered over something dark.',
  null,
  '[{"label":"Knit","value":"Open gauge, laddered by design"},{"label":"Colour","value":"Pale grey"}]'::jsonb,
  array['knit','layering','sheer'],
  (select id from c where slug = 'knitwear'), null,
  'concept', false, 7
),
(
  'signal-jacket', 'E-008', 'Signal Jacket',
  'One stripe. Painted, not printed.',
  'A black canvas chore jacket with a single hand-painted vermilion stripe across the front and one sleeve.',
  null,
  '[{"label":"Fabric","value":"Black cotton canvas"},{"label":"Detail","value":"Hand-painted stripe, every one slightly different"}]'::jsonb,
  array['workwear','hand-painted','chore-jacket'],
  (select id from c where slug = 'outerwear'), null,
  'concept', false, 8
);

-- Vibes
insert into public.product_vibes (product_id, vibe_id)
select p.id, v.id from public.products p, public.vibes v
where (p.slug, v.slug) in (
  ('dragon-denim',       'the-statement'),
  ('red-room-overshirt', 'the-statement'),
  ('afterhours-bomber',  'after-dark'),
  ('static-tee',         'after-dark'),
  ('soft-metal',         'the-quiet'),
  ('red-room-overshirt', 'the-quiet'),
  ('afterhours-bomber',  'the-odd-one'),
  ('static-tee',         'the-odd-one'),
  ('soft-metal',         'the-odd-one'),
  ('bone-cargo',         'the-quiet'),
  ('ghost-knit',         'the-quiet'),
  ('signal-jacket',      'the-odd-one')
);

-- Images (served from /public until replaced through the admin)
insert into public.product_images (product_id, src, alt, width, height, sort)
select p.id, i.src, i.alt, i.w, i.h, i.sort
from public.products p
join (values
  ('dragon-denim', '/images/drop-001/dragon-denim-01.jpg', 'Model leaning on a sunlit wall in extra-wide indigo jeans with a pale embroidered dragon down the left leg', 1536, 2048, 0),
  ('dragon-denim', '/images/drop-001/dragon-denim-02.jpg', 'Close view of the chain-stitched dragon head at the hip', 420, 560, 1),
  ('dragon-denim', '/images/drop-001/dragon-denim-03.jpg', 'The dragon''s tail curling into the raw, pooled hem', 880, 660, 2),
  ('afterhours-bomber', '/images/drop-001/afterhours-bomber-01.jpg', 'Model at night in a black satin bomber, the chest panel glowing white under flash', 1536, 2048, 0),
  ('afterhours-bomber', '/images/drop-001/afterhours-bomber-02.jpg', 'Close view of the retroreflective chest panel and brass zip', 660, 880, 1),
  ('static-tee', '/images/drop-001/static-tee-01.jpg', 'Model sitting in a dark room beside an old television, wearing a charcoal tee with a framed static print', 1536, 2048, 0),
  ('static-tee', '/images/drop-001/static-tee-02.jpg', 'Close view of the cracked static print on washed charcoal cotton', 780, 1040, 1),
  ('red-room-overshirt', '/images/drop-001/red-room-overshirt-01.jpg', 'Model in an oxblood corduroy overshirt standing in a red-painted hallway', 1395, 1860, 0),
  ('red-room-overshirt', '/images/drop-001/red-room-overshirt-02.jpg', 'Close view of the wide-wale cord, collar and a thin silver chain', 660, 880, 1),
  ('soft-metal', '/images/drop-001/soft-metal-01.jpg', 'A hand wearing three heavy molten-looking silver rings, resting against indigo denim', 1536, 2048, 0),
  ('soft-metal', '/images/drop-001/soft-metal-02.jpg', 'Close view of the three rings stacked across the fingers', 900, 1200, 1)
) as i(slug, src, alt, w, h, sort) on i.slug = p.slug;
