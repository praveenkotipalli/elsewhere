import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPage } from "@/components/worlds/WorldPage";
import { getProducts, getWorld, getWorlds, inWorld } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import { FAMILIES, getFamily } from "@/lib/worlds/families";

export const revalidate = 300;
// Worlds added in the admin render on first visit without a rebuild.
export const dynamicParams = true;

export async function generateStaticParams() {
  const lists = await Promise.all(
    FAMILIES.filter((f) => f.source.type === "worlds" && !f.single).map(async (f) => {
      const worlds = f.source.type === "worlds" ? await getWorlds(f.source.kind) : [];
      return worlds.map((w) => ({ family: f.key, world: w.slug }));
    }),
  );
  return lists.flat();
}

async function load(familyKey: string, slug: string) {
  const family = getFamily(familyKey);
  if (!family || family.source.type !== "worlds" || family.single) return null;
  const world = await getWorld(family.source.kind, slug);
  return world ? { family, world, kind: family.source.kind } : null;
}

export async function generateMetadata({ params }: PageProps<"/[family]/[world]">): Promise<Metadata> {
  const { family, world: slug } = await params;
  const found = await load(family, slug);
  if (!found) return {};
  const { world } = found;
  const title =
    world.kind === "style_icon" ? `${world.name}-inspired style` : `${world.name} — ${found.family.name}`;
  const description = [world.tagline, world.description].filter(Boolean).join(" ");
  const images = world.cover_src ? [{ url: imageUrl(world.cover_src), alt: world.cover_alt ?? world.name }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${found.family.key}/${world.slug}` },
    openGraph: { title, description, images },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function WorldRoute({ params }: PageProps<"/[family]/[world]">) {
  const { family: familyKey, world: slug } = await params;
  const found = await load(familyKey, slug);
  if (!found) notFound();
  const { family, world, kind } = found;

  const [products, all] = await Promise.all([getProducts(), getWorlds(kind)]);
  const siblings = all.filter((w) => w.id !== world.id);

  return <WorldPage family={family} world={world} pieces={inWorld(products, world.id)} siblings={siblings} />;
}
