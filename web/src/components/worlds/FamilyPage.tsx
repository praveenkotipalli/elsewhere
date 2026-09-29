import { VibeIndex, type VibeRow } from "@/components/home/VibeIndex";
import { Lines, Reveal } from "@/components/motion/Reveal";
import type { DiscoveryWorld } from "@/lib/types";
import type { Family } from "@/lib/worlds/families";
import { resolveTheme } from "@/lib/worlds/themes";
import { WorldBreadcrumb } from "./WorldBreadcrumb";
import { PortraitCard, PosterCard } from "./WorldCard";
import { WorldThemeScope } from "./WorldThemeScope";
import { WorldTracker } from "./WorldTracker";

/** Neutral accents for a family's own index page (before any one world is chosen). */
const FAMILY_ACCENT: Record<string, string> = {
  "style-icons": "#a8845c",
  anime: "#d8402f",
};

/**
 * The index of one family. Already themed like the family, so choosing Anime
 * turns the lights down before you even pick a world.
 */
export function FamilyPage({ family, worlds, vibes }: { family: Family; worlds: DiscoveryWorld[]; vibes?: VibeRow[] }) {
  const accent = FAMILY_ACCENT[family.key] ?? null;
  const theme = resolveTheme(null, family.defaultTheme, accent);

  const body = (
    <>
      <WorldTracker worldId={null} name={family.name} family={family.key} href={`/${family.key}`} />
      <header className="gutter grid gap-y-8 pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--header-h)+1.5rem)] md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-12">
          <WorldBreadcrumb trail={[{ label: family.name }]} />
        </div>
        <div className="mt-10 md:col-span-9 md:mt-16">
          <p className="t-meta mb-6 text-stone">{family.eyebrow}</p>
          <Lines onLoad as="h1" lines={[family.name]} className="t-mega" />
        </div>
        <Reveal onLoad delay={250} className="md:col-span-5 md:col-start-4">
          <p className="t-lede">{family.intro}</p>
        </Reveal>
      </header>

      <section aria-label={family.name} className="gutter pb-[clamp(4rem,8vw,7rem)]">
        {family.card === "type" && vibes ? (
          <div className="grain -mx-[var(--gutter)] bg-ink px-[var(--gutter)] py-16 text-bone">
            <VibeIndex vibes={vibes} />
          </div>
        ) : family.card === "poster" ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {worlds.map((w, i) => (
              <li key={w.id} className={i % 3 === 1 ? "md:mt-16" : ""}>
                <Reveal delay={(i % 3) * 70}>
                  <PosterCard world={w} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:gap-6">
            {worlds.map((w, i) => (
              <li key={w.id} className={["md:col-span-5", "md:col-span-4 md:col-start-8 md:mt-32", "md:col-span-4 md:col-start-2", "md:col-span-5 md:col-start-7 md:mt-24"][i % 4]}>
                <Reveal delay={(i % 2) * 100}>
                  <PortraitCard world={w} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      {family.disclaimer && <p className="gutter pb-10 text-xs text-stone">{family.disclaimer}</p>}
    </>
  );

  if (theme.key === "brand") return <div>{body}</div>;
  return (
    <WorldThemeScope theme={theme} scope={`family-${family.key}`} accent={accent ?? theme.palette.accent}>
      {body}
    </WorldThemeScope>
  );
}
