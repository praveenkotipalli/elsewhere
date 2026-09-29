import Image from "next/image";
import Link from "next/link";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { imageUrl } from "@/lib/images";
import { pad } from "@/lib/format";
import type { DiscoveryWorld, Product } from "@/lib/types";
import type { Family } from "@/lib/worlds/families";
import { resolveTheme } from "@/lib/worlds/themes";
import { EditorialPieces, EssentialsShelves, PosterPieces } from "./presentations";
import { WorldArt } from "./WorldArt";
import { WorldBreadcrumb } from "./WorldBreadcrumb";
import { initials, PortraitCard, PosterCard } from "./WorldCard";
import { bodoni } from "@/lib/worlds/themes/icon";
import { WorldThemeScope } from "./WorldThemeScope";
import { WorldTracker } from "./WorldTracker";
import { WorldVote } from "./WorldVote";

/**
 * One world, fully dressed in its theme. Everything visual that differs between
 * worlds comes from the theme; this component only decides the order of things.
 */
export function WorldPage({
  family,
  world,
  pieces,
  siblings,
}: {
  family: Family;
  world: DiscoveryWorld;
  pieces: Product[];
  siblings: DiscoveryWorld[];
}) {
  const theme = resolveTheme(world.theme_key, family.defaultTheme, world.accent);
  const accent = world.accent ?? theme.palette.accent;
  const scope = `${family.key}-${world.slug}`;
  const href = family.single ? `/${family.key}` : `/${family.key}/${world.slug}`;
  const trail = family.single ? [{ label: family.name }] : [{ label: family.name, href: `/${family.key}` }, { label: world.name }];

  return (
    <WorldThemeScope theme={theme} scope={scope} accent={accent}>
      <WorldTracker worldId={world.id} name={world.name} family={family.key} href={href} />

      <header className="gutter pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--header-h)+1.5rem)]">
        <WorldBreadcrumb trail={trail} />
        {family.card === "calm" ? (
          <CalmHero world={world} pieces={pieces} />
        ) : family.card === "poster" ? (
          <PosterHero world={world} family={family} accent={accent} />
        ) : (
          <PortraitHero world={world} family={family} accent={accent} />
        )}
      </header>

      <section aria-label={`${world.name} pieces`} className="gutter pb-[clamp(4rem,8vw,7rem)]">
        {theme.presentation === "essentials" ? (
          <EssentialsShelves products={pieces} />
        ) : pieces.length > 0 ? (
          <>
            <p className="t-meta mb-10 flex justify-between border-t border-ink/15 pt-4 text-stone">
              <span>
                {family.card === "portrait" ? `${world.name}-inspired` : `From the ${world.name} world`}
              </span>
              <span>{pad(pieces.length)} pieces</span>
            </p>
            {theme.presentation === "poster" ? <PosterPieces products={pieces} /> : <EditorialPieces products={pieces} />}
          </>
        ) : null}
      </section>

      <section className="gutter grid gap-y-8 border-t border-ink/15 py-[clamp(4rem,8vw,7rem)] md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">{pieces.length === 0 ? "(Nothing here yet)" : "(Want more?)"}</p>
        <Reveal className="md:col-span-8">
          <WorldVote
            world={{ id: world.id, name: world.name }}
            prompt={
              family.card === "calm"
                ? "Want the shelves filled? Tell us, and essentials move up the list."
                : pieces.length === 0
                  ? `No pieces for ${world.name} yet. Enough votes and this is the next world we design for.`
                  : `Want more from ${world.name}? Votes decide which world gets the next pieces.`
            }
          />
        </Reveal>
      </section>

      {siblings.length > 0 && (
        <section aria-labelledby="more-worlds" className="gutter pb-[clamp(4rem,8vw,7rem)]">
          <div className="mb-8 flex items-end justify-between gap-6 border-t border-ink/15 pt-4">
            <h2 id="more-worlds" className="t-headline">
              More {family.name.toLowerCase()}
            </h2>
            <Link href={`/${family.key}`} className="t-meta link-line shrink-0">
              All {family.name.toLowerCase()}
            </Link>
          </div>
          <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
            {siblings.slice(0, 3).map((w, i) => (
              <li key={w.id} className="w-[70vw] shrink-0 snap-start md:w-auto">
                {family.card === "poster" ? <PosterCard world={w} index={i} /> : <PortraitCard world={w} index={i} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      {family.disclaimer && (
        <p className="gutter pb-10 text-xs text-stone">
          {family.disclaimer}
        </p>
      )}
    </WorldThemeScope>
  );
}

function Cover({ world, accent, sizes }: { world: DiscoveryWorld; accent: string; sizes: string }) {
  return world.cover_src ? (
    <Image src={imageUrl(world.cover_src)} alt={world.cover_alt ?? ""} fill preload sizes={sizes} className="object-cover" />
  ) : (
    <WorldArt pattern={world.pattern} accent={accent} seed={world.slug} className="absolute inset-0 size-full" />
  );
}

/** Style icon: a feature opener — name huge in the theme's display face, a tall plate beside it. */
function PortraitHero({ world, family, accent }: { world: DiscoveryWorld; family: Family; accent: string }) {
  return (
    <div className="mt-10 grid gap-y-10 md:mt-16 md:grid-cols-12 md:gap-x-6">
      <div className="flex flex-col justify-end gap-6 md:col-span-7">
        <p className="t-meta text-stone">
          {family.eyebrow} — {world.eyebrow}
        </p>
        <Lines onLoad as="h1" lines={[world.name]} className="t-mega" />
        {world.tagline && (
          <Reveal onLoad delay={250}>
            <p className="t-voice max-w-[24ch] text-3xl text-stone md:text-4xl">{world.tagline}</p>
          </Reveal>
        )}
        {world.description && (
          <Reveal onLoad delay={400}>
            <p className="t-body max-w-[48ch]">{world.description}</p>
          </Reveal>
        )}
      </div>
      <Reveal onLoad delay={150} className="relative aspect-[3/4] overflow-hidden bg-bone-3 md:col-span-4 md:col-start-9">
        <Cover world={world} accent={accent} sizes="(min-width: 768px) 30vw, 100vw" />
        {!world.cover_src && (
          // A typographic portrait: never a likeness.
          <span
            aria-hidden
            className={`${bodoni.className} pointer-events-none absolute -right-[0.1em] bottom-[-0.12em] select-none text-[clamp(10rem,26vw,24rem)] italic leading-[0.8] tracking-[-0.06em]`}
            style={{ color: `color-mix(in oklab, ${accent} 75%, #17130f)` }}
          >
            {initials(world.name)}
          </span>
        )}
      </Reveal>
    </div>
  );
}

/** Anime: a full-bleed poster band with the name crashing over it. */
function PosterHero({ world, family, accent }: { world: DiscoveryWorld; family: Family; accent: string }) {
  return (
    <div className="relative mt-8 md:mt-12">
      <div className="relative -mx-[var(--gutter)] h-[62svh] min-h-[24rem] overflow-hidden bg-bone-2">
        <Cover world={world} accent={accent} sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-bone via-bone/30 to-transparent" aria-hidden />
      </div>
      <div className="relative -mt-[18svh] flex flex-col gap-5">
        <p className="t-meta text-signal">
          {family.name} / {world.eyebrow}
        </p>
        <Lines onLoad as="h1" lines={[world.name]} className="t-mega" />
        <div className="grid gap-6 md:grid-cols-12 md:gap-x-6">
          {world.tagline && (
            <Reveal onLoad delay={200} className="md:col-span-5">
              <p className="t-lede">{world.tagline}</p>
            </Reveal>
          )}
          {world.description && (
            <Reveal onLoad delay={300} className="md:col-span-4 md:col-start-8">
              <p className="t-body text-stone">{world.description}</p>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}

/** Essentials: say it quietly and step back. */
function CalmHero({ world, pieces }: { world: DiscoveryWorld; pieces: Product[] }) {
  // The close-up, so the hero doesn't repeat the photograph on the shelf below.
  const image = pieces[0]?.images[1] ?? pieces[0]?.images[0];
  return (
    <div className="mt-12 grid gap-y-12 md:mt-20 md:grid-cols-12 md:gap-x-6">
      <div className="flex flex-col gap-8 md:col-span-7">
        <p className="t-meta text-stone">{world.eyebrow}</p>
        <Lines onLoad as="h1" lines={["The things you wear", "when you don't need", "to try too hard."]} className="t-display" />
        {world.description && (
          <Reveal onLoad delay={400}>
            <p className="t-body max-w-[44ch] text-stone">{world.description}</p>
          </Reveal>
        )}
      </div>
      {image && (
        <Reveal onLoad delay={200} className="relative aspect-[4/5] overflow-hidden bg-bone-2 md:col-span-4 md:col-start-9">
          <Image src={imageUrl(image.src)} alt={image.alt} fill preload sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </Reveal>
      )}
    </div>
  );
}
