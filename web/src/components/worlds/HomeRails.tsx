import Link from "next/link";
import { Lines, Reveal } from "@/components/motion/Reveal";
import type { DiscoveryWorld } from "@/lib/types";
import { PortraitCard, PosterCard } from "./WorldCard";

/** "Inspired by": the style icons as a row of magazine tiles. */
export function IconsRail({ worlds }: { worlds: DiscoveryWorld[] }) {
  if (worlds.length === 0) return null;
  return (
    <section aria-labelledby="icons-title" className="pb-[clamp(5rem,11vw,10rem)]">
      <div className="gutter mb-10 flex flex-col gap-6 border-t border-ink/15 pt-5 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-meta text-stone">(Style icons)</p>
          <Lines
            as="h2"
            id="icons-title"
            lines={["Inspired by", <span key="v" className="t-voice">people you screenshot.</span>]}
            className="t-display mt-6"
          />
        </div>
        <div className="flex max-w-[34ch] flex-col gap-4 md:items-end md:text-right">
          <p className="text-sm text-stone">A style reference, never a collaboration. None of them know we exist.</p>
          <Link href="/style-icons" className="t-meta link-line w-fit">
            All style icons
          </Link>
        </div>
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
        {worlds.slice(0, 4).map((w, i) => (
          <li key={w.id} className={`w-[72vw] shrink-0 snap-center md:w-auto ${i % 2 === 1 ? "md:mt-20" : ""}`}>
            <Reveal delay={i * 80}>
              <PortraitCard world={w} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Anime worlds as a night strip — the first hint that entering one changes the
 * whole site. Always a horizontal row, so it reads like a shelf of posters.
 */
export function AnimeRail({ worlds }: { worlds: DiscoveryWorld[] }) {
  if (worlds.length === 0) return null;
  return (
    <section aria-labelledby="anime-title" className="grain bg-[#0c0b0d] py-[clamp(5rem,10vw,9rem)] text-[#f2eee6]">
      <div className="gutter mb-10 grid gap-y-6 md:mb-14 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-[#8e8b85] md:col-span-3">(Anime worlds)</p>
        <div className="md:col-span-9">
          <Lines
            as="h2"
            id="anime-title"
            lines={["Step into a world.", <span key="v" className="t-voice">The whole place changes.</span>]}
            className="t-display"
          />
          <Reveal className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3" delay={150}>
            <p className="max-w-[40ch] text-sm text-[#b9b5ad]">
              Colour, type, pace — each world has its own. Pieces arrive as we design them; vote for the world you want next.
            </p>
            <Link href="/anime" className="t-meta link-line">
              All anime worlds
            </Link>
          </Reveal>
        </div>
      </div>
      {/* Swipe on phones; on desktop every poster fits on the shelf. */}
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:gap-4 md:overflow-visible">
        {worlds.map((w, i) => (
          <li key={w.id} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-0 md:min-w-0 md:flex-1">
            <PosterCard world={w} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
