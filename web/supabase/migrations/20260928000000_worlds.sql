-- ELSEWHERE — discovery worlds.
-- Customer-facing discovery is by world (style icons, anime, essentials, …), not by
-- category. Categories stay as internal organisation. A product can live in any number
-- of worlds; how a world looks is decided in code by its theme (theme_key), what it
-- contains is decided here.

create type public.world_kind as enum ('style_icon', 'anime', 'essentials', 'aesthetic', 'collection');

create table public.worlds (
  id           uuid primary key default gen_random_uuid(),
  kind         public.world_kind not null,
  slug         text not null check (slug ~ '^[a-z0-9-]+$'),
  name         text not null check (char_length(name) between 1 and 80),
  eyebrow      text,               -- "The Classic"
  tagline      text,
  description  text,
  -- Cover art: a site path, absolute URL, or a path in the product-images bucket.
  -- Must be original or licensed; placeholder treatments render when it is null.
  cover_src    text,
  cover_alt    text,
  accent       text check (accent is null or accent ~ '^#[0-9a-fA-F]{6}$'),
  pattern      text,               -- placeholder art treatment key (see src/lib/worlds/patterns)
  theme_key    text,               -- code theme; null = the family's default theme
  is_public    boolean not null default false,
  sort         int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (kind, slug)
);

create index worlds_kind_idx on public.worlds (kind, is_public, sort);

create trigger worlds_touch before update on public.worlds
  for each row execute function public.touch_updated_at();

create table public.product_worlds (
  product_id uuid not null references public.products (id) on delete cascade,
  world_id   uuid not null references public.worlds (id) on delete cascade,
  primary key (product_id, world_id)
);

create index product_worlds_world_idx on public.product_worlds (world_id);

-- "Make something for this world": a vote for a world that has few or no pieces yet.
create table public.world_interests (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  world_id   uuid not null references public.worlds (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, world_id)
);

create index world_interests_world_idx on public.world_interests (world_id, created_at);

-- Discovery trail. Written only through track_event(); read only by admins.
create table public.discovery_events (
  id          bigint generated always as identity primary key,
  event       text not null check (event in (
                'family_view', 'world_view', 'world_time',
                'product_view', 'save', 'interest', 'world_vote')),
  visitor_id  text not null check (char_length(visitor_id) between 8 and 64),
  user_id     uuid references public.profiles (id) on delete set null,
  world_id    uuid references public.worlds (id) on delete set null,
  product_id  uuid references public.products (id) on delete set null,
  family      text check (family is null or family ~ '^[a-z0-9-]{1,40}$'),
  duration_ms int check (duration_ms is null or duration_ms between 0 and 3600000),
  created_at  timestamptz not null default now()
);

create index discovery_events_world_idx on public.discovery_events (world_id, event, created_at);
create index discovery_events_product_idx on public.discovery_events (product_id, event, created_at);

-- ─────────────────────────────────────────────────────────────── RLS
alter table public.worlds           enable row level security;
alter table public.product_worlds   enable row level security;
alter table public.world_interests  enable row level security;
alter table public.discovery_events enable row level security;

create policy "worlds: read public" on public.worlds for select
  using (is_public or (select public.is_admin()));
create policy "worlds: admin write" on public.worlds for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_worlds: read" on public.product_worlds for select
  using (
    (select public.is_admin())
    or (
      exists (select 1 from public.worlds w where w.id = world_id and w.is_public)
      and exists (select 1 from public.products p where p.id = product_id and p.is_public)
    )
  );
create policy "product_worlds: admin write" on public.product_worlds for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "world_interests: read own" on public.world_interests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "world_interests: insert own" on public.world_interests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.worlds w where w.id = world_id and w.is_public)
  );
create policy "world_interests: delete own" on public.world_interests for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "discovery_events: admin read" on public.discovery_events for select to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────── tracking
create or replace function public.track_event(
  p_event text,
  p_visitor_id text,
  p_world_id uuid default null,
  p_product_id uuid default null,
  p_family text default null,
  p_duration_ms int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visitor_id is null or char_length(p_visitor_id) not between 8 and 64 then
    return;
  end if;
  if p_event not in ('family_view', 'world_view', 'world_time', 'product_view', 'save', 'interest', 'world_vote') then
    return;
  end if;
  -- Only public things can be tracked; unknown ids are dropped rather than erroring.
  if p_world_id is not null and not exists (select 1 from public.worlds w where w.id = p_world_id and w.is_public) then
    p_world_id := null;
  end if;
  if p_product_id is not null and not exists (select 1 from public.products p where p.id = p_product_id and p.is_public) then
    return;
  end if;
  -- Collapse repeat world views by the same visitor within 10 minutes.
  if p_event = 'world_view' and exists (
    select 1 from public.discovery_events e
    where e.visitor_id = p_visitor_id and e.event = 'world_view' and e.world_id = p_world_id
      and e.created_at > now() - interval '10 minutes'
  ) then
    return;
  end if;

  insert into public.discovery_events (event, visitor_id, user_id, world_id, product_id, family, duration_ms)
  values (p_event, p_visitor_id, auth.uid(), p_world_id, p_product_id,
          case when p_family ~ '^[a-z0-9-]{1,40}$' then p_family end,
          case when p_duration_ms between 0 and 3600000 then p_duration_ms end);
end;
$$;

grant execute on function public.track_event(text, text, uuid, uuid, text, int) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────── admin analytics
-- Per world: who came, how long they stayed, and what they wanted from it.
create or replace function public.admin_world_stats(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  world_id uuid,
  kind public.world_kind,
  slug text,
  name text,
  is_public boolean,
  products bigint,
  visitors bigint,
  avg_seconds numeric,
  product_views bigint,
  saves bigint,
  interests bigint,
  votes bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  with win as (
    select coalesce(p_from, '-infinity'::timestamptz) as f, coalesce(p_to, 'infinity'::timestamptz) as t
  ), ev as (
    select e.* from public.discovery_events e, win where e.created_at between win.f and win.t
  )
  select
    w.id, w.kind, w.slug, w.name, w.is_public,
    (select count(*) from public.product_worlds pw where pw.world_id = w.id),
    (select count(distinct ev.visitor_id) from ev where ev.world_id = w.id and ev.event = 'world_view'),
    (select round(avg(ev.duration_ms) / 1000.0, 1) from ev where ev.world_id = w.id and ev.event = 'world_time'),
    (select count(*) from ev where ev.world_id = w.id and ev.event = 'product_view'),
    (select count(*) from ev where ev.world_id = w.id and ev.event = 'save'),
    (select count(*) from ev where ev.world_id = w.id and ev.event = 'interest'),
    (select count(*) from public.world_interests wi, win where wi.world_id = w.id and wi.created_at between win.f and win.t)
  from public.worlds w
  order by w.kind, w.sort;
end;
$$;

-- For one world: which pieces people reached from it, and what they did.
create or replace function public.admin_world_products(
  p_world uuid,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (product_id uuid, name text, slug text, views bigint, saves bigint, interests bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  select p.id, p.name, p.slug,
    count(*) filter (where e.event = 'product_view'),
    count(*) filter (where e.event = 'save'),
    count(*) filter (where e.event = 'interest')
  from public.discovery_events e
  join public.products p on p.id = e.product_id
  where e.world_id = p_world
    and e.created_at between coalesce(p_from, '-infinity'::timestamptz) and coalesce(p_to, 'infinity'::timestamptz)
  group by p.id, p.name, p.slug
  order by 6 desc, 5 desc, 4 desc;
end;
$$;

revoke execute on function public.admin_world_stats(timestamptz, timestamptz) from public, anon;
revoke execute on function public.admin_world_products(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_world_stats(timestamptz, timestamptz) to authenticated;
grant execute on function public.admin_world_products(uuid, timestamptz, timestamptz) to authenticated;

-- ─────────────────────────────────────────────────────────────── starting worlds
-- Style icons are an aesthetic reference only: no affiliation or endorsement is implied,
-- and no likeness is used. Anime worlds use placeholder art until licensed artwork exists.
insert into public.worlds (kind, slug, name, eyebrow, tagline, description, accent, pattern, is_public, sort) values
  ('style_icon', 'brad-pitt', 'Brad Pitt', 'The Classic',
   'Faded denim. Loose shirts. Nothing trying too hard.',
   'Style inspired by the relaxed, sun-worn classic: washed denim, easy shirts, a jacket that has been lived in. An aesthetic reference only — not an endorsement.',
   '#a8845c', 'portrait-grain', true, 1),
  ('style_icon', 'tyler-the-creator', 'Tyler, The Creator', 'The Colour Theory',
   'Pastels, prep and one thing that shouldn''t work but does.',
   'Style inspired by playful, colour-first dressing: unexpected palettes, clean shapes, details you only notice the second time. An aesthetic reference only — not an endorsement.',
   '#d88fb0', 'portrait-bands', true, 2),
  ('style_icon', 'travis-scott', 'Travis Scott', 'The Earth Tones',
   'Washed-out browns, heavy denim, everything slightly oversized.',
   'Style inspired by the dusty, heavyweight side of streetwear: earth tones, baggy denim, pieces that look found rather than bought. An aesthetic reference only — not an endorsement.',
   '#8a6b4f', 'portrait-dust', true, 3),
  ('style_icon', 'david-beckham', 'David Beckham', 'The Clean Cut',
   'Sharp, simple, and somehow never boring.',
   'Style inspired by clean, confident basics done perfectly: good denim, a white tee, one detail. An aesthetic reference only — not an endorsement.',
   '#6f7f8f', 'portrait-lines', true, 4),

  ('anime', 'one-piece',      'One Piece',      'Anime world', 'Salt air, loud colour, a long way from home.', 'Pieces for people who grew up on the open sea.', '#d8402f', 'waves',      true, 1),
  ('anime', 'naruto',         'Naruto',         'Anime world', 'Orange, stubborn, and never quitting.',         'Pieces for people who never gave up on anything.', '#e8792b', 'spiral',     true, 2),
  ('anime', 'jujutsu-kaisen', 'Jujutsu Kaisen', 'Anime world', 'Cursed energy, dressed in black.',              'Pieces for the ones who like it dark.',            '#5b4fd6', 'ink',        true, 3),
  ('anime', 'bleach',         'Bleach',         'Anime world', 'Black robes, white noise.',                     'Pieces in black, white and nothing else.',          '#e9e6df', 'slash',      true, 4),
  ('anime', 'dragon-ball',    'Dragon Ball',    'Anime world', 'Power levels, spiky hair, orange everything.',  'Pieces with a lot of energy.',                      '#f0a020', 'speedlines', true, 5),

  ('essentials', 'essentials', 'Essentials', 'The Essentials',
   'The things you wear when you don''t need to try too hard.',
   'Henleys, long sleeves, plain heavyweight tees, clean denim, easy overshirts. Pieces for the days you just want to look clean.',
   '#b8b1a4', 'calm', true, 1);

-- Starting associations. Only honest fits; the rest is managed from the admin.
insert into public.product_worlds (product_id, world_id)
select p.id, w.id
from public.products p
join public.worlds w on (p.slug, w.slug) in (
  ('little-bones',     'essentials'),
  ('little-bones',     'brad-pitt'),
  ('little-bones',     'david-beckham'),
  ('red-dragon-denim', 'travis-scott'),
  ('koi-denim',        'tyler-the-creator')
)
on conflict do nothing;
