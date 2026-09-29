import type { WorldKind } from "@/lib/types";

/**
 * A family is a door into discovery ("Style Icons", "Anime", "Essentials").
 * Each one owns a URL segment and a default look; the worlds inside it come from
 * the `worlds` table (or, for Aesthetics, from `vibes`).
 *
 * Adding a family (Street, Y2K, Music…) = one entry here + worlds in the database.
 * The /[family] and /[family]/[world] routes pick it up automatically.
 */
export type Family = {
  /** URL segment: /style-icons */
  key: string;
  /** Where the family's worlds live. */
  source: { type: "worlds"; kind: WorldKind } | { type: "vibes" };
  /** Essentials-style: the family IS one world (/essentials shows its pieces directly). */
  single?: string;
  name: string;
  /** Small line above the name on cards and pages. */
  eyebrow: string;
  /** One-line invitation used on the Explore cards. */
  line: string;
  intro: string;
  /** How each world's card looks on the family page. */
  card: "portrait" | "poster" | "calm" | "type";
  /** Theme used for worlds in this family unless the world names its own. */
  defaultTheme: string;
  /** Shown on every world page of the family. */
  disclaimer?: string;
  /** Word used on "Explore the …" links. */
  noun: string;
  /** What the count on the Explore card counts, plural. */
  unit: string;
};

export const FAMILIES: Family[] = [
  {
    key: "style-icons",
    source: { type: "worlds", kind: "style_icon" },
    name: "Style Icons",
    eyebrow: "Inspired by",
    line: "Dress like the people you screenshot.",
    intro:
      "Start with someone whose style you keep coming back to. We show you the pieces that belong in the same room. A reference, not a collaboration — none of these people are affiliated with us.",
    card: "portrait",
    defaultTheme: "icon",
    disclaimer: "Style reference only. Not affiliated with, or endorsed by, the person named.",
    noun: "style",
    unit: "icons",
  },
  {
    key: "anime",
    source: { type: "worlds", kind: "anime" },
    name: "Anime",
    eyebrow: "Worlds",
    line: "Pick a world. The whole place changes.",
    intro:
      "Worlds for people who grew up on them. Step into one and everything shifts — colour, type, pace. Pieces arrive as we design them; tell us which world you want next.",
    card: "poster",
    defaultTheme: "anime",
    disclaimer: "Fan-made worlds. Not affiliated with, or endorsed by, the rights holders. No official artwork is used.",
    noun: "world",
    unit: "worlds",
  },
  {
    key: "essentials",
    source: { type: "worlds", kind: "essentials" },
    single: "essentials",
    name: "Essentials",
    eyebrow: "The Essentials",
    line: "For the days you just want to look clean.",
    intro: "The things you wear when you don't need to try too hard.",
    card: "calm",
    defaultTheme: "essentials",
    noun: "essentials",
    unit: "pieces",
  },
  {
    key: "aesthetics",
    source: { type: "vibes" },
    name: "Aesthetics",
    eyebrow: "By feeling",
    line: "Start with how you want to be seen.",
    intro: "Don't start with a category. Start with a feeling — each piece lives in more than one of these.",
    card: "type",
    defaultTheme: "brand",
    noun: "aesthetic",
    unit: "feelings",
  },
];

export function getFamily(key: string) {
  return FAMILIES.find((f) => f.key === key) ?? null;
}

export function familyForKind(kind: WorldKind) {
  return FAMILIES.find((f) => f.source.type === "worlds" && f.source.kind === kind) ?? null;
}

/** Canonical URL of a world. */
export function worldHref(kind: WorldKind, slug: string) {
  const family = familyForKind(kind);
  if (!family) return "/discover";
  return family.single ? `/${family.key}` : `/${family.key}/${slug}`;
}
