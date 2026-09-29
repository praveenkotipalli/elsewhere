import type { MetadataRoute } from "next";
import { getDrops, getProducts, getVibes, getWorlds } from "@/lib/catalog";
import { FAMILIES, worldHref } from "@/lib/worlds/families";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, drops, vibes, worlds] = await Promise.all([getProducts(), getDrops(), getVibes(), getWorlds()]);
  const u = (path: string) => new URL(path, site.url).toString();

  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    { url: u("/pieces"), changeFrequency: "weekly", priority: 0.8 },
    { url: u("/manifesto"), changeFrequency: "monthly", priority: 0.5 },
    { url: u("/discover"), changeFrequency: "weekly", priority: 0.8 },
    ...FAMILIES.map((f) => ({ url: u(`/${f.key}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...worlds
      .filter((w) => !FAMILIES.some((f) => f.single === w.slug))
      .map((w) => ({ url: u(worldHref(w.kind, w.slug)), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...drops.map((d) => ({ url: u(`/drop/${d.code}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...vibes.map((v) => ({ url: u(`/vibe/${v.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...products.map((p) => ({
      url: u(`/pieces/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.slice(0, 3).map((i) => new URL(imageUrl(i.src), site.url).toString()),
    })),
  ];
}
