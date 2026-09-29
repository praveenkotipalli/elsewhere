-- Swap Drop 001 over to the three real designs WITHOUT resetting the database
-- (accounts, admins and profiles are kept). Deleting the old products also
-- removes their saves, interest votes and views, since those cascade.
-- Run it in Supabase Studio (http://127.0.0.1:54323) > SQL editor, once Docker is up.

begin;

delete from public.products;

update public.drops
   set description = 'Three pieces of denim. None of them exist yet. The ones you want most get made.'
 where code = '001';

insert into public.vibes (slug, name, tagline, sort) values
  ('minimal', 'Minimal', 'One small thing. Nothing else.', 5)
on conflict (slug) do nothing;

with c as (select slug, id from public.categories)
insert into public.products
  (slug, code, name, tagline, description, story, details, tags, category_id, drop_id, status, is_public, sort)
values
(
  'red-dragon-denim', 'E-001', 'Red Dragon Denim',
  'It starts at the pocket and doesn''t stop.',
  'Washed-black extra-wide denim with a red dragon embroidered across the back: head over one pocket, body coiling up and around the other.',
  'The dragon is stitched dense and raised, scale by scale, in one saturated red. Its head hangs upside down over the left back pocket and its body climbs the seat, crosses the waist and closes into a full ring over the right. A red croc-embossed leather patch at the waistband is the only other colour on the whole pair.',
  '[{"label":"Silhouette","value":"Extra-wide leg, low-slung, long pooled hem"},
    {"label":"Denim","value":"Washed black, soft hand"},
    {"label":"Embroidery","value":"Raised red dragon across both back pockets, head on the left, coil on the right"},
    {"label":"Patch","value":"Red croc-embossed leather back patch"},
    {"label":"Fit","value":"Baggy through the seat and thigh. Take your usual size"}]'::jsonb,
  array['denim','embroidery','wide-leg','black','dragon'],
  (select id from c where slug = 'denim'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 1
),
(
  'koi-denim', 'E-002', 'Koi Denim',
  'A whole pond, down one leg.',
  'Mid-indigo wide-leg jeans with small raised koi and flower bursts hand-embroidered down the leg, as if they swam in.',
  'Every koi is its own little knot of thread in coral, orange and gold, with a few tiny flowers in green and pink drifting between them. They gather at the hip and scatter toward the hem, so the pair looks different depending on how you stand.',
  '[{"label":"Silhouette","value":"Wide leg, mid rise, relaxed through the thigh"},
    {"label":"Denim","value":"Mid-indigo with a faint tonal texture"},
    {"label":"Embroidery","value":"Raised koi in coral, orange and gold, with small flower bursts, hip to hem"},
    {"label":"Hem","value":"Full length, meant to stack over trainers"},
    {"label":"Fit","value":"Relaxed. Take your usual size"}]'::jsonb,
  array['denim','embroidery','wide-leg','indigo','koi'],
  (select id from c where slug = 'denim'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 2
),
(
  'little-bones', 'E-003', 'Little Bones',
  'One small skeleton. That''s it.',
  'Vintage-wash wide-leg jeans with a single tiny skeleton, raised in cream thread, standing just under the front pocket.',
  'Everything about this pair is plain except one thing: a small skeleton, a few centimetres tall, stitched in thick cream cord right where your hand goes into your pocket. Most people won''t see it. The ones who do will ask.',
  '[{"label":"Silhouette","value":"Wide leg, mid rise, long straight fall"},
    {"label":"Denim","value":"Vintage mid-wash with a faint tonal texture"},
    {"label":"Embroidery","value":"Single raised cream skeleton below the front right pocket"},
    {"label":"Hardware","value":"Copper rivets and button"},
    {"label":"Fit","value":"Relaxed. Take your usual size"}]'::jsonb,
  array['denim','embroidery','wide-leg','minimal','skeleton'],
  (select id from c where slug = 'denim'), '00000000-0000-4000-8000-000000000001',
  'validating', true, 3
);

-- Vibes
insert into public.product_vibes (product_id, vibe_id)
select p.id, v.id from public.products p, public.vibes v
where (p.slug, v.slug) in (
  ('red-dragon-denim', 'the-statement'),
  ('red-dragon-denim', 'after-dark'),
  ('koi-denim',        'the-statement'),
  ('koi-denim',        'the-odd-one'),
  ('little-bones',     'minimal'),
  ('little-bones',     'the-quiet'),
  ('little-bones',     'the-odd-one')
);

-- Images (served from /public until replaced through the admin)
insert into public.product_images (product_id, src, alt, width, height, sort)
select p.id, i.src, i.alt, i.w, i.h, i.sort
from public.products p
join (values
  ('red-dragon-denim', '/images/drop-001/red-dragon-denim-01.jpg', 'Model seen from behind in washed-black wide jeans, a red embroidered dragon coiling across both back pockets', 1536, 2304, 0),
  ('red-dragon-denim', '/images/drop-001/red-dragon-denim-03.jpg', 'Close view of the raised red dragon: its head over the left pocket, its body ringed over the right', 1528, 2048, 1),
  ('red-dragon-denim', '/images/drop-001/red-dragon-denim-02.jpg', 'Model crouching in the black dragon jeans, the red leather patch at the waistband', 1530, 2048, 2),
  ('koi-denim', '/images/drop-001/koi-denim-01.jpg', 'Model crouching in mid-indigo wide jeans with small embroidered koi scattered down the leg', 1024, 1536, 0),
  ('koi-denim', '/images/drop-001/koi-denim-02.jpg', 'Close view of the raised koi in coral, orange and gold, with small flower bursts', 1024, 1476, 1),
  ('little-bones', '/images/drop-001/little-bones-01.jpg', 'Model in a white tee and vintage-wash wide jeans, hands in pockets, a tiny skeleton below the front pocket', 1304, 2398, 0),
  ('little-bones', '/images/drop-001/little-bones-02.jpg', 'Close view of the small raised cream skeleton stitched under the front pocket', 1306, 2398, 1)
) as i(slug, src, alt, w, h, sort) on i.slug = p.slug;

commit;
