import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FamilyPage } from "@/components/worlds/FamilyPage";
import { WorldPage } from "@/components/worlds/WorldPage";
import { getProducts, getVibes, getWorld, getWorlds, inWorld } from "@/lib/catalog";
import { FAMILIES, getFamily } from "@/lib/worlds/families";
import { buildVibeRows } from "@/lib/worlds/rooms";

export const revalidate = 300;
// Only registered families exist; anything else at this level is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ family: f.key }));
}

export async function generateMetadata({ params }: PageProps<"/[family]">): Promise<Metadata> {
  const { family: key } = await params;
  const family = getFamily(key);
  if (!family) return {};
  return {
    title: family.single ? family.name : `${family.name} — ${family.eyebrow}`,
    description: family.intro,
    alternates: { canonical: `/${family.key}` },
  };
}

export default async function FamilyRoute({ params }: PageProps<"/[family]">) {
  const { family: key } = await params;
  const family = getFamily(key);
  if (!family) notFound();

  if (family.source.type === "vibes") {
    const [products, vibes] = await Promise.all([getProducts(), getVibes()]);
    return <FamilyPage family={family} worlds={[]} vibes={buildVibeRows(products, vibes)} />;
  }

  const kind = family.source.kind;

  // A single-world family (Essentials) is the world itself.
  if (family.single) {
    const [world, products] = await Promise.all([getWorld(kind, family.single), getProducts()]);
    if (!world) notFound();
    return <WorldPage family={family} world={world} pieces={inWorld(products, world.id)} siblings={[]} />;
  }

  const worlds = await getWorlds(kind);
  return <FamilyPage family={family} worlds={worlds} />;
}
