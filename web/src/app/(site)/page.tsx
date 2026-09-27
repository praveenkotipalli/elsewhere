import { DropSpreads } from "@/components/home/DropSpreads";
import { FinalCallActions } from "@/components/home/FinalCall";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { VibeIndex, type VibeRow } from "@/components/home/VibeIndex";
import { Worlds } from "@/components/home/Worlds";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { getDrop, getProducts, getVibes } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";

export const revalidate = 300;

export default async function Home() {
  const [products, vibes, drop] = await Promise.all([getProducts(), getVibes(), getDrop("001")]);
  const dropPieces = drop ? products.filter((p) => p.drop?.id === drop.id) : [];

  // Each vibe previews with a detail frame so the page never repeats a cover.
  const vibeRows: VibeRow[] = vibes.map((v) => {
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

  return (
    <>
      <Hero pieceCount={dropPieces.length} />
      <Statement />
      {drop && dropPieces.length > 0 && <DropSpreads drop={drop} products={dropPieces} />}

      <section id="vibes" aria-labelledby="vibes-title" className="grain scroll-mt-16 bg-ink py-[clamp(6rem,12vw,11rem)] text-bone">
        <div className="gutter grid gap-y-8 pb-12 md:grid-cols-12 md:gap-x-6 md:pb-20">
          <p className="t-meta text-ash md:col-span-3">(Shop by feeling)</p>
          <Lines
            as="h2"
            id="vibes-title"
            lines={["Don't start with", <span key="v" className="t-voice">a category.</span>]}
            className="t-display md:col-span-9"
          />
          <Reveal className="md:col-span-4 md:col-start-4" delay={150}>
            <p className="t-body text-fog">Start with how you want to be seen. Each piece lives in more than one of these.</p>
          </Reveal>
        </div>
        <div className="gutter">
          <VibeIndex vibes={vibeRows} />
        </div>
      </section>

      <Worlds />

      <section aria-labelledby="final-title" className="grain bg-ink pb-[clamp(5rem,10vw,9rem)] pt-[clamp(7rem,16vw,15rem)] text-bone">
        <div className="gutter">
          <p className="t-meta text-ash">(End of the page)</p>
          <Lines
            as="h2"
            id="final-title"
            lines={["You found", <span key="v" className="t-voice">it.</span>]}
            className="t-mega mt-8"
          />
          <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-x-6">
            <Reveal className="md:col-span-5">
              <p className="t-lede text-fog">
                Most people scroll straight past. You didn&rsquo;t. Make an account, save what you like, and tell us what
                deserves to exist. We&rsquo;ll tell you first when it does.
              </p>
            </Reveal>
            <Reveal delay={150} className="md:col-span-6 md:col-start-7 md:self-end">
              <FinalCallActions />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
