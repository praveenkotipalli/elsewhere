import { DropSpreads } from "@/components/home/DropSpreads";
import { FinalCallActions } from "@/components/home/FinalCall";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { Worlds } from "@/components/home/Worlds";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { ExploreYourWorld } from "@/components/worlds/ExploreYourWorld";
import { AnimeRail, IconsRail } from "@/components/worlds/HomeRails";
import { getDrop, getProducts, getWorlds } from "@/lib/catalog";
import { getRooms } from "@/lib/worlds/rooms";

export const revalidate = 300;

export default async function Home() {
  const [products, drop, rooms, icons, anime] = await Promise.all([
    getProducts(),
    getDrop("001"),
    getRooms(),
    getWorlds("style_icon"),
    getWorlds("anime"),
  ]);
  const dropPieces = drop ? products.filter((p) => p.drop?.id === drop.id) : [];

  return (
    <>
      <Hero pieceCount={dropPieces.length} />
      <Statement />
      {drop && dropPieces.length > 0 && <DropSpreads drop={drop} products={dropPieces} />}

      <ExploreYourWorld rooms={rooms} />
      <IconsRail worlds={icons} />
      <AnimeRail worlds={anime} />

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
