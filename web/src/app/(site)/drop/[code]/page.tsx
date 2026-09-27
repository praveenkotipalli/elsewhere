import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { PieceCard } from "@/components/product/PieceCard";
import { getDrop, getDrops, getProducts } from "@/lib/catalog";
import { pad } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getDrops()).map((d) => ({ code: d.code }));
}

export async function generateMetadata({ params }: PageProps<"/drop/[code]">): Promise<Metadata> {
  const { code } = await params;
  const drop = await getDrop(code);
  if (!drop) return {};
  return {
    title: `Drop ${drop.code} — ${drop.title}`,
    description: drop.description ?? undefined,
    alternates: { canonical: `/drop/${drop.code}` },
  };
}

export default async function DropPage({ params }: PageProps<"/drop/[code]">) {
  const { code } = await params;
  const [drop, products] = await Promise.all([getDrop(code), getProducts()]);
  if (!drop) notFound();
  const pieces = products.filter((p) => p.drop?.id === drop.id);

  return (
    <div className="pb-[clamp(5rem,10vw,9rem)]">
      <header className="grain bg-ink pb-[clamp(3rem,6vw,5rem)] pt-[calc(var(--header-h)+clamp(4rem,10vw,9rem))] text-bone">
        <div className="gutter grid gap-y-10 md:grid-cols-12 md:gap-x-6">
          <p className="t-meta text-ash md:col-span-3">Drop — {pad(pieces.length)} pieces</p>
          <div className="md:col-span-9">
            <Lines
              as="h1"
              lines={[
                drop.code,
                <span key="t" className="t-voice">
                  {drop.title}.
                </span>,
              ]}
              className="t-mega"
            />
          </div>
          <Reveal className="md:col-span-5 md:col-start-4" delay={200}>
            <p className="t-lede text-fog">{drop.description}</p>
            <p className="t-body mt-6 text-ash">
              Every piece below is designed and photographed, and none of them are made. Tap &ldquo;I&rsquo;m
              interested&rdquo; on the ones you&rsquo;d actually wear. The most-wanted go into production.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="gutter mt-[clamp(4rem,8vw,7rem)] grid gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-40">
        {pieces.map((p, i) => (
          <Reveal key={p.id} className={i % 2 === 0 ? "md:col-span-6" : "md:col-span-5 md:col-start-8 md:mt-[30vh]"}>
            <p className="t-meta mb-4 text-stone">({pad(i + 1)})</p>
            <PieceCard product={p} showTagline preload={i === 0} sizes="(min-width: 768px) 48vw, 100vw" />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
