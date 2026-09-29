import "server-only";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "./supabase/public";
import type { Category, DiscoveryWorld, Drop, Product, Vibe, WorldKind, WorldRef } from "./types";

export const CATALOG_TAG = "catalog";

export const PRODUCT_SELECT = `
  id, slug, code, name, tagline, description, story, details, tags, status, is_public,
  price_minor, currency, sort, created_at,
  category:categories(id, slug, name, world, sort),
  drop:drops(id, code, title, description),
  images:product_images(id, src, alt, width, height, sort),
  vibes(id, slug, name, tagline, sort),
  worlds(id, slug, name, kind)
`;

type Row = Omit<Product, "images" | "vibes" | "worlds"> & {
  images: Product["images"] | null;
  vibes: Vibe[] | null;
  worlds?: WorldRef[] | null;
};

export function normalize(row: Row): Product {
  return {
    ...row,
    details: Array.isArray(row.details) ? row.details : [],
    images: [...(row.images ?? [])].sort((a, b) => a.sort - b.sort),
    vibes: [...(row.vibes ?? [])].sort((a, b) => a.sort - b.sort),
    worlds: row.worlds ?? [],
  };
}

/**
 * Bump when the shape of cached data changes. The data cache outlives deploys (it
 * sits in a Docker volume), and an old-shaped entry would crash the new code.
 */
const CACHE_VERSION = "v2-worlds";

const cached = <A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) =>
  unstable_cache(fn, [CACHE_VERSION, key], { tags: [CATALOG_TAG], revalidate: 300 });

export const getProducts = cached("products", async (): Promise<Product[]> => {
  const { data, error } = await supabasePublic()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_public", true)
    .order("sort");
  if (error) throw error;
  return (data as unknown as Row[]).map(normalize);
});

export const getProduct = cached("product", async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabasePublic()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data as unknown as Row) : null;
});

export const getVibes = cached("vibes", async (): Promise<Vibe[]> => {
  const { data, error } = await supabasePublic().from("vibes").select("*").order("sort");
  if (error) throw error;
  return data;
});

export const getCategories = cached("categories", async (): Promise<Category[]> => {
  const { data, error } = await supabasePublic().from("categories").select("*").order("sort");
  if (error) throw error;
  return data;
});

export const getDrop = cached("drop", async (code: string): Promise<Drop | null> => {
  const { data, error } = await supabasePublic()
    .from("drops")
    .select("id, code, title, description")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export const getDrops = cached("drops", async (): Promise<Drop[]> => {
  const { data, error } = await supabasePublic()
    .from("drops")
    .select("id, code, title, description")
    .order("sort");
  if (error) throw error;
  return data;
});

/** Pieces that share a vibe or a drop with `product`, most overlapping first. */
export function related(product: Product, all: Product[], limit = 4) {
  const vibeIds = new Set(product.vibes.map((v) => v.id));
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      score:
        p.vibes.filter((v) => vibeIds.has(v.id)).length * 2 +
        (p.drop?.id && p.drop.id === product.drop?.id ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.p.sort - b.p.sort)
    .slice(0, limit)
    .map(({ p }) => p);
}

const WORLD_SELECT = "id, kind, slug, name, eyebrow, tagline, description, cover_src, cover_alt, accent, pattern, theme_key, sort";

/** Public worlds, optionally of one kind, in their curated order. */
export const getWorlds = cached("worlds", async (kind?: WorldKind): Promise<DiscoveryWorld[]> => {
  let q = supabasePublic().from("worlds").select(WORLD_SELECT).eq("is_public", true).order("sort");
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return data as DiscoveryWorld[];
});

export const getWorld = cached("world", async (kind: WorldKind, slug: string): Promise<DiscoveryWorld | null> => {
  const { data, error } = await supabasePublic()
    .from("worlds")
    .select(WORLD_SELECT)
    .eq("kind", kind)
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error) throw error;
  return data as DiscoveryWorld | null;
});

/** Pieces that belong to a world. */
export function inWorld(products: Product[], worldId: string) {
  return products.filter((p) => p.worlds.some((w) => w.id === worldId));
}
