-- ELSEWHERE — initial schema
-- Validation-phase catalogue: products are browsed publicly, desire is measured
-- through wishlists (saves) and interests ("I want this"). No commerce tables yet;
-- ids, price-in-minor-units and the drop/category model are shaped so variants,
-- inventory and orders can hang off `products` later without migration pain.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────── enums
create type public.product_status as enum (
  'concept', 'validating', 'coming_soon', 'drop_soon', 'selected', 'archived'
);

create type public.interest_status as enum ('active', 'withdrawn');

create type public.world as enum ('wear', 'objects', 'room', 'tech', 'carry');

-- ─────────────────────────────────────────────────────────────── people
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  college     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Admin membership lives in its own table so no user-writable row can grant it.
create table public.admins (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  granted_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Mirror every new auth user into profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────── catalogue
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name       text not null,
  world      public.world not null default 'wear',
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table public.vibes (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name       text not null,
  tagline    text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table public.drops (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,           -- '001'
  title       text not null,                  -- 'First Sighting'
  description text,
  is_public   boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  code          text,                          -- catalogue number, e.g. 'E-001'
  name          text not null check (char_length(name) between 1 and 80),
  tagline       text,
  description   text,
  story         text,
  -- [{ "label": "Silhouette", "value": "…" }, …]
  details       jsonb not null default '[]'::jsonb check (jsonb_typeof(details) = 'array'),
  tags          text[] not null default '{}',
  category_id   uuid references public.categories (id) on delete set null,
  drop_id       uuid references public.drops (id) on delete set null,
  status        public.product_status not null default 'concept',
  is_public     boolean not null default false,
  -- Indicative only. Minor units (paise) so real pricing can reuse the column later.
  price_minor   int check (price_minor is null or price_minor >= 0),
  currency      char(3) not null default 'INR',
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_public_idx on public.products (is_public, sort);
create index products_category_idx on public.products (category_id);
create index products_drop_idx on public.products (drop_id);

create table public.product_vibes (
  product_id uuid not null references public.products (id) on delete cascade,
  vibe_id    uuid not null references public.vibes (id) on delete cascade,
  primary key (product_id, vibe_id)
);

create index product_vibes_vibe_idx on public.product_vibes (vibe_id);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Either an absolute URL / site path, or a path inside the product-images bucket.
  src        text not null,
  alt        text not null default '',
  width      int,
  height     int,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort);

-- ─────────────────────────────────────────────────────────────── desire signals
create table public.wishlists (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index wishlists_product_idx on public.wishlists (product_id, created_at);

-- One row per (user, product). Withdrawing keeps the row so history survives.
create table public.product_interests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  status      public.interest_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index product_interests_product_idx on public.product_interests (product_id, status, created_at);

-- Product page views, for interest conversion. Written only through record_view().
create table public.product_views (
  id          bigint generated always as identity primary key,
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid references public.profiles (id) on delete set null,
  visitor_id  text not null check (char_length(visitor_id) between 8 and 64),
  created_at  timestamptz not null default now()
);

create index product_views_product_idx on public.product_views (product_id, created_at);
create index product_views_visitor_idx on public.product_views (visitor_id, product_id, created_at desc);

-- ─────────────────────────────────────────────────────────────── updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger interests_touch before update on public.product_interests
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────── RLS
alter table public.profiles          enable row level security;
alter table public.admins            enable row level security;
alter table public.categories        enable row level security;
alter table public.vibes             enable row level security;
alter table public.drops             enable row level security;
alter table public.products          enable row level security;
alter table public.product_vibes     enable row level security;
alter table public.product_images    enable row level security;
alter table public.wishlists         enable row level security;
alter table public.product_interests enable row level security;
alter table public.product_views     enable row level security;

-- profiles: you see yourself; admins see everyone. Users may edit only safe columns.
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated, anon;
grant update (full_name, college, avatar_url) on public.profiles to authenticated;

-- admins: readable by admins only (so the UI can check membership), never writable via API.
create policy "admins: admin read" on public.admins
  for select to authenticated using ((select public.is_admin()) or user_id = (select auth.uid()));

-- taxonomy: public read, admin write.
create policy "categories: read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "vibes: read" on public.vibes for select using (true);
create policy "vibes: admin write" on public.vibes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "drops: read public" on public.drops for select
  using (is_public or (select public.is_admin()));
create policy "drops: admin write" on public.drops for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- products: public rows are readable by anyone; everything else admin only.
create policy "products: read public" on public.products for select
  using (is_public or (select public.is_admin()));
create policy "products: admin write" on public.products for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_vibes: read" on public.product_vibes for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_public or (select public.is_admin()))));
create policy "product_vibes: admin write" on public.product_vibes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_images: read" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_public or (select public.is_admin()))));
create policy "product_images: admin write" on public.product_images for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- wishlists: own rows; admins read all. Only public products can be saved.
create policy "wishlists: read own" on public.wishlists for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "wishlists: insert own" on public.wishlists for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.products p where p.id = product_id and p.is_public)
  );
create policy "wishlists: delete own" on public.wishlists for delete to authenticated
  using (user_id = (select auth.uid()));

-- interests: own rows; admins read all. Status flips go through set_interest().
create policy "interests: read own" on public.product_interests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- views: admins read; writes only via record_view().
create policy "views: admin read" on public.product_views for select to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────── RPCs (user)
-- Register or withdraw interest. Idempotent; one row per user/product.
create or replace function public.set_interest(p_product_id uuid, p_interested boolean)
returns public.interest_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_status public.interest_status := case when p_interested then 'active' else 'withdrawn' end;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.products p where p.id = p_product_id and p.is_public) then
    raise exception 'product not found' using errcode = 'P0002';
  end if;

  insert into public.product_interests (user_id, product_id, status)
  values (v_uid, p_product_id, v_status)
  on conflict (user_id, product_id) do update set status = excluded.status;

  return v_status;
end;
$$;

revoke execute on function public.set_interest(uuid, boolean) from public, anon;
grant execute on function public.set_interest(uuid, boolean) to authenticated;

-- Record a product view. Collapses repeat views by the same visitor within 30 minutes.
create or replace function public.record_view(p_product_id uuid, p_visitor_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visitor_id is null or char_length(p_visitor_id) not between 8 and 64 then
    return;
  end if;
  if not exists (select 1 from public.products p where p.id = p_product_id and p.is_public) then
    return;
  end if;
  if exists (
    select 1 from public.product_views v
    where v.visitor_id = p_visitor_id
      and v.product_id = p_product_id
      and v.created_at > now() - interval '30 minutes'
  ) then
    return;
  end if;
  insert into public.product_views (product_id, user_id, visitor_id)
  values (p_product_id, auth.uid(), p_visitor_id);
end;
$$;

grant execute on function public.record_view(uuid, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────── RPCs (admin analytics)
create or replace function public.assert_admin()
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
end;
$$;

-- Per-product validation numbers within an optional window and category.
create or replace function public.admin_product_stats(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_category uuid default null
)
returns table (
  product_id uuid,
  name text,
  slug text,
  status public.product_status,
  is_public boolean,
  category text,
  cover text,
  created_at timestamptz,
  viewers bigint,
  saves bigint,
  interested bigint,
  conversion numeric
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
  ), s as (
    select
      p.id, p.name, p.slug, p.status, p.is_public, c.name as category,
      (select i.src from public.product_images i where i.product_id = p.id order by i.sort limit 1) as cover,
      p.created_at,
      (select count(distinct v.visitor_id) from public.product_views v, win
         where v.product_id = p.id and v.created_at between win.f and win.t) as viewers,
      (select count(*) from public.wishlists w, win
         where w.product_id = p.id and w.created_at between win.f and win.t) as saves,
      (select count(*) from public.product_interests pi, win
         where pi.product_id = p.id and pi.status = 'active' and pi.created_at between win.f and win.t) as interested
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p_category is null or p.category_id = p_category
  )
  select s.id, s.name, s.slug, s.status, s.is_public, s.category, s.cover, s.created_at,
         s.viewers, s.saves, s.interested,
         round(s.interested::numeric / nullif(s.viewers, 0), 4)
  from s;
end;
$$;

-- Daily interest / save / signup counts for charts.
create or replace function public.admin_daily_activity(
  p_from timestamptz,
  p_to timestamptz,
  p_product uuid default null
)
returns table (day date, interests bigint, saves bigint, signups bigint, viewers bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  -- Days are bucketed in IST: the audience is local and "yesterday" should mean theirs.
  return query
  select
    d::date,
    (select count(*) from public.product_interests pi
       where pi.status = 'active' and (pi.created_at at time zone 'Asia/Kolkata')::date = d::date
         and (p_product is null or pi.product_id = p_product)),
    (select count(*) from public.wishlists w
       where (w.created_at at time zone 'Asia/Kolkata')::date = d::date
         and (p_product is null or w.product_id = p_product)),
    (select count(*) from public.profiles pr
       where (pr.created_at at time zone 'Asia/Kolkata')::date = d::date),
    (select count(distinct v.visitor_id) from public.product_views v
       where (v.created_at at time zone 'Asia/Kolkata')::date = d::date
         and (p_product is null or v.product_id = p_product))
  from generate_series((p_from at time zone 'Asia/Kolkata')::date,
                       (p_to at time zone 'Asia/Kolkata')::date,
                       interval '1 day') as d
  order by 1;
end;
$$;

create or replace function public.admin_overview(p_from timestamptz, p_to timestamptz)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result json;
begin
  perform public.assert_admin();
  select json_build_object(
    'total_users',      (select count(*) from public.profiles),
    'new_users',        (select count(*) from public.profiles where created_at between p_from and p_to),
    'active_interests', (select count(*) from public.product_interests where status = 'active'),
    'new_interests',    (select count(*) from public.product_interests where status = 'active' and created_at between p_from and p_to),
    'interested_users', (select count(distinct user_id) from public.product_interests where status = 'active'),
    'total_saves',      (select count(*) from public.wishlists),
    'new_saves',        (select count(*) from public.wishlists where created_at between p_from and p_to),
    'viewers',          (select count(distinct visitor_id) from public.product_views where created_at between p_from and p_to),
    'public_products',  (select count(*) from public.products where is_public),
    'total_products',   (select count(*) from public.products)
  ) into result;
  return result;
end;
$$;

revoke execute on function public.admin_product_stats(timestamptz, timestamptz, uuid) from public, anon;
revoke execute on function public.admin_daily_activity(timestamptz, timestamptz, uuid) from public, anon;
revoke execute on function public.admin_overview(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_product_stats(timestamptz, timestamptz, uuid) to authenticated;
grant execute on function public.admin_daily_activity(timestamptz, timestamptz, uuid) to authenticated;
grant execute on function public.admin_overview(timestamptz, timestamptz) to authenticated;

-- ─────────────────────────────────────────────────────────────── storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product-images: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product-images: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
