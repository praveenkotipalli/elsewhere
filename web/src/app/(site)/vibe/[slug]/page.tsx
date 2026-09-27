import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { PieceCard } from "@/components/product/PieceCard";
import { getProducts, getVibes } from "@/lib/catalog";
import { pad } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getVibes()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vibe/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vibe = (await getVibes()).find((v) => v.slug === slug);
  if (!vibe) return {};
  return {
    title: vibe.name,
    description: `${vibe.tagline ?? ""} Pieces from Elsewhere that feel like ${vibe.name.toLowerCase()}.`.trim(),
    alternates: { canonical: `/vibe/${vibe.slug}` },
  };
}

export default async function VibePage({ params }: PageProps<"/vibe/[slug]">) {
  const { slug } = await params;
  const [vibes, products] = await Promise.all([getVibes(), getProducts()]);
  const vibe = vibes.find((v) => v.slug === slug);
  if (!vibe) notFound();
  const pieces = products.filter((p) => p.vibes.some((v) => v.id === vibe.id));
  const others = vibes.filter((v) => v.id !== vibe.id);

  return (
    <div className="gutter pb-[clamp(5rem,10vw,9rem)] pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]">
      <header className="grid gap-y-6 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">(Vibe — {pad(pieces.length)} pieces)</p>
        <div className="md:col-span-9">
          <Lines as="h1" lines={[vibe.name]} className="t-mega" />
          <Reveal delay={200}>
            <p className="t-voice mt-6 text-3xl text-stone md:text-4xl">{vibe.tagline}</p>
          </Reveal>
        </div>
      </header>

      {pieces.length === 0 ? (
        <p className="t-lede mt-24 max-w-[30ch] text-stone">Nothing in this one yet. It&rsquo;s coming.</p>
      ) : (
        <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-14 md:mt-24 md:grid-cols-12 md:gap-x-6">
          {pieces.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 100} className={i % 2 === 0 ? "md:col-span-5" : "md:col-span-4 md:col-start-8 md:mt-40"}>
              <PieceCard product={p} showTagline preload={i < 2} sizes="(min-width: 768px) 40vw, 50vw" />
            </Reveal>
          ))}
        </div>
      )}

      <nav aria-label="Other vibes" className="mt-[clamp(6rem,12vw,10rem)] border-t border-ink/15 pt-5">
        <p className="t-meta mb-6 text-stone">Or try another feeling</p>
        <ul className="flex flex-col">
          {others.map((v) => (
            <li key={v.id} className="border-b border-ink/10">
              <Link href={`/vibe/${v.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                <span className="t-headline transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {v.name}
                </span>
                <span className="t-voice hidden text-xl text-stone md:inline">{v.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
