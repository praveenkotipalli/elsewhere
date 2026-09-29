import "server-only";
import { getProducts, getVibes, getWorlds, inWorld } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import type { RoomData } from "@/components/worlds/ExploreYourWorld";

/** Counts and previews for the Explore rooms, from live data only. */
export async function getRooms(): Promise<RoomData[]> {
  const [products, vibes, icons, anime, essentials] = await Promise.all([
    getProducts(),
    getVibes(),
    getWorlds("style_icon"),
    getWorlds("anime"),
    getWorlds("essentials"),
  ]);
  const ess = essentials[0];
  const essPieces = ess ? inWorld(products, ess.id) : [];
  const cover = essPieces[0]?.images[0];

  return [
    { key: "style-icons", count: icons.length, names: icons.map((w) => w.name) },
    { key: "anime", count: anime.length, names: anime.map((w) => w.name) },
    {
      key: "essentials",
      count: essPieces.length,
      names: [],
      image: cover ? { src: imageUrl(cover.src), alt: cover.alt } : null,
    },
    { key: "aesthetics", count: vibes.length, names: vibes.map((v) => v.name) },
  ];
}

/** Aesthetics (vibes) as index rows, each previewed with a detail frame. */
export function buildVibeRows(products: import("@/lib/types").Product[], vibes: import("@/lib/types").Vibe[]) {
  return vibes.map((v) => {
    const members = products.filter((p) => p.vibes.some((pv) => pv.id === v.id));
    const pick = members[0];
    const img = pick?.images[1] ?? pick?.images[0];
    return {
      slug: v.slug,
      name: v.name,
      tagline: v.tagline,
      count: members.length,
      image: img ? { src: imageUrl(img.src), alt: img.alt } : null,
    };
  });
}
