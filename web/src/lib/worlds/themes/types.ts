/**
 * A world theme re-skins the whole site while the visitor is inside that world.
 *
 * It works by re-pointing the design tokens the site is already built on
 * (--color-*, --font-*, the display-type variables and motion speed), so no
 * component needs to know which world it is in. Anything more specific goes in
 * `css`, scoped automatically to the world.
 *
 * To add a world-specific look: create a file in this folder that exports a
 * WorldTheme, register it in ./index.ts, and set the world's `theme_key` to its key.
 */
export type Palette = {
  /** Page background ("paper"). Token: bone. */
  paper: string;
  /** Slightly deeper surfaces: bone-2, bone-3. */
  paper2: string;
  paper3: string;
  /** Primary text and dark bands ("ink"). Tokens: ink, char, char-2. */
  ink: string;
  char: string;
  char2: string;
  /** Secondary text ramp: graphite (strong) → fog (faint). */
  graphite: string;
  stone: string;
  ash: string;
  fog: string;
  /** The one accent. Token: signal. */
  accent: string;
};

export type Backdrop = "none" | "grain" | "speedlines" | "halftone" | "ink" | "rings";

export type WorldTheme = {
  key: string;
  label: string;
  scheme: "light" | "dark";
  /** Palette, or a function of the world's accent colour so one theme can serve many worlds. */
  palette: Palette | ((accent: string) => Palette);
  fonts?: {
    /** CSS font-family for big display type (t-mega, t-display, t-headline). */
    display?: string;
    /** CSS font-family for body text. */
    body?: string;
    /** CSS font-family for the italic "voice" accents. */
    voice?: string;
  };
  display?: {
    weight?: number;
    /** Variable width axis, where the font has one (Archivo: 62–125). */
    width?: number;
    tracking?: string;
    leading?: number;
    scale?: number;
    uppercase?: boolean;
  };
  motion?: {
    /** Multiplier on reveal durations: 0.6 = snappy, 1.4 = slow and soft. */
    speed?: number;
    /** Replaces the site's main ease-out curve. */
    ease?: string;
  };
  /** Full-page background treatment behind the content. */
  backdrop?: Backdrop;
  /** How you arrive: a colour wipe, a fade, or nothing. */
  entrance?: "wipe" | "fade" | "none";
  /** How the world's pieces are laid out. */
  presentation: "editorial" | "essentials" | "poster";
  /** Extra CSS. Every rule is scoped to this world; write selectors as if at the root. */
  css?: string;
};

export type ResolvedTheme = Omit<WorldTheme, "palette"> & { palette: Palette };
