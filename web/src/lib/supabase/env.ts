export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  // A hosted build (Vercel) can't reach the Supabase running on a developer's machine.
  if (process.env.VERCEL && /\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:|\/|$)/.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is "${url}", which is your local Supabase. Vercel can't reach it. ` +
        "Set it (and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to your hosted project's values in Vercel → Settings → Environment Variables.",
    );
  }
  return { url, key };
}
