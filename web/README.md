# Elsewhere

A validation-phase brand site for a Gen-Z fashion and lifestyle label. Nothing is for sale. Every piece is a
proposal; signed-in visitors **save** pieces and say **"I'm interested"**, and the admin decision board shows
which pieces to manufacture.

Next.js 16 (App Router, React 19) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) ·
Motion · Lenis

---

## Run it locally

Requires Node 20.9+ and Docker Desktop.

```bash
npm install
npx supabase start          # local Postgres/Auth/Storage; applies migrations + seed
cp .env.example .env.local  # then paste the local URL + publishable key printed above
npm run dev                 # http://localhost:3000
```

- Sign-in emails land in the local mail catcher at http://127.0.0.1:54324.
- Supabase Studio: http://127.0.0.1:54323.
- `npx supabase db reset` rebuilds the database from `supabase/migrations` + `supabase/seed.sql`.

### Make someone an admin

Admin membership is deliberately not writable through the API — not even by admins. After the person has
signed in once, run in the SQL editor (Studio locally, or the hosted dashboard):

```sql
insert into public.admins (user_id)
select id from public.profiles where email = 'you@example.com';
```

Then open `/admin`. Everyone else gets a 404 there.

---

## Going live (hosted Supabase + Vercel or any Node host)

1. **Create a Supabase project**, then push the schema:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   psql "$DATABASE_URL" -f supabase/seed.sql   # Drop 001 content
   ```
2. **Auth → URL configuration:** Site URL = your domain; add `https://your-domain/**` to redirect URLs.
3. **Auth → Email templates → Magic link** (and **Confirm signup**): the site signs people in with a 6-digit
   code, so the template must contain `{{ .Token }}`. Paste `supabase/templates/magic_link.html`.
   Configure custom SMTP (Resend, Postmark…) before launch — the built-in sender is rate-limited.
4. **Google sign-in (recommended):** create an OAuth client in Google Cloud (Web application), authorised
   redirect URI `https://<ref>.supabase.co/auth/v1/callback`. Paste the client id/secret into
   Auth → Providers → Google, then set `NEXT_PUBLIC_AUTH_GOOGLE=true`. The button is hidden until then.
5. **Env vars on the host:** everything in `.env.example`. Only public keys are used — the app never needs the
   service-role key.

---

## Deploy on a VPS with Docker

The repo ships a production image (`Dockerfile`, Next.js standalone output) and a compose file that puts
[Caddy](https://caddyserver.com) in front for automatic HTTPS. Supabase stays hosted (steps 1–4 above).

On the VPS (Docker + Compose installed, ports 80/443 open, the domain's A record pointing at the server):

```bash
git clone <your repo> elsewhere && cd elsewhere/web
cp .env.example .env        # fill DOMAIN and the NEXT_PUBLIC_* values
```

- **Server already runs nginx (or another proxy) on 80/443** — the usual shared-VPS case:
  `docker compose up -d --build`, then install `deploy/nginx.conf.example` as a site and run
  `sudo certbot --nginx -d <domain>`. The app listens on `127.0.0.1:3010` (change with `WEB_PORT` in `.env`).
- **Fresh server, nothing on 80/443:** `docker compose --profile caddy up -d --build` — Caddy terminates HTTPS
  and issues the certificate on first start (`docker compose logs -f caddy`).

- **Rebuild after changing any `NEXT_PUBLIC_*` value** (`docker compose up -d --build`): they are baked into the
  browser bundle at build time.
- **The build needs to reach Supabase** — public pages are pre-rendered during `docker build`.
- **Update:** `git pull && docker compose up -d --build`. The ISR cache and certificates live in named volumes.
- `NEXT_PUBLIC_SITE_URL` must be `https://<DOMAIN>`, and that URL must be in Supabase's redirect URLs.
- Health check: `GET /api/health`. The app listens only on the internal Docker network; Caddy is the only
  thing exposed.
- No domain yet? Temporarily replace `{$DOMAIN}` in the `Caddyfile` with `:80` and browse to the server IP
  (no HTTPS, and Google sign-in will not work until you have a real domain).

---

## How it's built

### Routes

| Route | What it is |
|---|---|
| `/` | Campaign home: hero → statement + how validation works → Drop 001 spreads → shop by vibe → beyond clothes → close |
| `/drop/[code]` | A drop as a two-up campaign |
| `/pieces` | Everything, filterable by world / type / vibe (URL params) |
| `/pieces/[slug]` | Editorial product page: gallery + zoom, spec, story, save / I'm interested, more like this, next piece |
| `/vibe/[slug]` | Aesthetic-led discovery |
| `/manifesto` | The brand, in its own words |
| `/account`, `/account/saved`, `/account/list` | Profile, wishlist, interests (signed-in) |
| `/admin` … | Decision board, interest explorer + CSV, pieces CRUD with image upload, people |

### Data flow

- **Public catalogue** is read with a cookie-less anon client through `unstable_cache` tagged `catalog`
  (`src/lib/catalog.ts`), so public pages are static/ISR. Admin writes call `revalidateTag("catalog")` and the
  site updates immediately.
- **Per-person state** (saved, interested) loads client-side in `SessionProvider` after hydration, so public
  pages never become per-request just to paint a heart.
- **Writes** go straight from the browser to Postgres with the user's session; Row Level Security is the
  authority. Interest changes go through the `set_interest()` function so a person counts once per piece.
- **"Sign in, then do what I meant":** tapping Save or I'm interested while signed out opens the auth sheet with
  the piece in it. The intent is replayed right after sign-in — including across the Google redirect (stashed
  in `localStorage`, 15-minute TTL).

### Database (`supabase/migrations/20260927000000_init.sql`)

| Table | Notes |
|---|---|
| `profiles` | 1:1 with `auth.users` (trigger). Users may edit only `full_name`, `college`, `avatar_url`. |
| `admins` | Membership. Readable by admins, never writable through the API. |
| `products` | `status` enum (concept → validating → coming_soon → drop_soon → selected → archived), `is_public`, `details` jsonb, `tags`, `price_minor` + `currency` (indicative now, real pricing later) |
| `product_images` | Site path or storage path, width/height, sort (0 = cover, 1 = hover frame) |
| `categories` (with `world`), `vibes`, `product_vibes`, `drops` | Taxonomy |
| `wishlists` | PK (user, product) — no duplicates by construction |
| `product_interests` | UNIQUE (user, product), `status` active/withdrawn; withdrawing keeps history |
| `product_views` | Unique-visitor page views (30-min dedupe) for conversion; written only via `record_view()` |

Admin analytics are `security definer` functions that refuse non-admins: `admin_overview`,
`admin_product_stats` (viewers, saves, interested, conversion), `admin_daily_activity` (IST days).

**Future commerce:** products already have stable UUIDs, a price in minor units and a status lifecycle. Variants
(`product_variants`: sku, size, stock), carts and orders can hang off `products.id` without reshaping anything.

### Design system

- **Type:** Archivo (variable width) for display and body, Instrument Serif italic as the human voice,
  Geist Mono for catalogue metadata. Utilities in `globals.css`: `t-mega`, `t-display`, `t-headline`, `t-title`,
  `t-voice`, `t-meta`, `t-lede`, `t-body`.
- **Colour:** bone `#ece9e3`, ink `#0d0d0c`, a grey ramp, and one signal red `#c73a1f` that only ever means
  "live" or "you're on the list". Photography carries the colour.
- **Motion:** masked line reveals and clip-reveals driven by one shared `IntersectionObserver`
  (`RevealObserver`); above-the-fold reveals are pure CSS so they never wait for hydration. Card → product page
  image morphs with React `<ViewTransition>`. Lenis smooth scroll on fine pointers only. Everything respects
  `prefers-reduced-motion`.

### Imagery

Drop 001 photography was generated as concept campaign imagery and lives in `public/images/`.
`scripts/process-images.mjs` crops and compresses the raw frames (alternate views are true detail crops of the
same frame, so a garment never changes between views). New photography should go through the admin uploader,
which stores it in the `product-images` bucket.

Three concepts (Bone Cargo, Ghost Knit, Signal Jacket) are seeded **hidden** — they have no photographs yet.
Add images in `/admin/products` and flip them public.
