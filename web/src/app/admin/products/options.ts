import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function formOptions(supabase: SupabaseClient) {
  const [categories, drops, vibes, worlds] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort"),
    supabase.from("drops").select("id, code, title").order("sort"),
    supabase.from("vibes").select("id, name").order("sort"),
    supabase.from("worlds").select("id, name, kind, is_public").order("kind").order("sort"),
  ]);
  return {
    categories: categories.data ?? [],
    drops: (drops.data ?? []).map((d) => ({ id: d.id, name: `${d.code} — ${d.title}` })),
    vibes: vibes.data ?? [],
    worlds: worlds.data ?? [],
  };
}
