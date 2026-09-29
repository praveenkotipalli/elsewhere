import { anime } from "./anime";
import { brand } from "./brand";
import { essentials } from "./essentials";
import { icon } from "./icon";
import type { Palette, ResolvedTheme, WorldTheme } from "./types";

/**
 * Every theme the site knows. A world uses `worlds.theme_key` if it is set and
 * registered here, otherwise its family's default.
 *
 * World-specific themes go below the family defaults, e.g.
 *   import { onePiece } from "./one-piece";
 *   ...
 *   [onePiece.key]: onePiece,
 */
export const THEMES: Record<string, WorldTheme> = {
  [brand.key]: brand,
  [essentials.key]: essentials,
  [icon.key]: icon,
  [anime.key]: anime,
};

export const DEFAULT_ACCENT = "#c73a1f";

export function resolveTheme(themeKey: string | null, fallbackKey: string, accent: string | null): ResolvedTheme {
  const theme = (themeKey && THEMES[themeKey]) || THEMES[fallbackKey] || brand;
  const palette: Palette = typeof theme.palette === "function" ? theme.palette(accent ?? DEFAULT_ACCENT) : theme.palette;
  return { ...theme, palette };
}

const TOKEN: Record<keyof Palette, string> = {
  paper: "--color-bone",
  paper2: "--color-bone-2",
  paper3: "--color-bone-3",
  ink: "--color-ink",
  char: "--color-char",
  char2: "--color-char-2",
  graphite: "--color-graphite",
  stone: "--color-stone",
  ash: "--color-ash",
  fog: "--color-fog",
  accent: "--color-signal",
};

/** Guard against a stray `}` or `<` in a value breaking out of the style block. */
const clean = (v: string) => v.replace(/[<>{};]/g, "");

/**
 * The CSS for a theme, scoped with :has() so it applies to the whole document
 * (header and footer included) only while the world's marker is on the page.
 * Server-rendered, so a refresh lands directly in the world.
 */
export function themeCss(theme: ResolvedTheme, scope: string) {
  if (theme.key === "brand") return "";
  const root = `:root:has([data-world-theme="${scope}"])`;
  const vars: string[] = [];
  for (const [k, token] of Object.entries(TOKEN) as [keyof Palette, string][]) {
    vars.push(`${token}: ${clean(theme.palette[k])};`);
  }
  if (theme.fonts?.display) vars.push(`--font-display: ${clean(theme.fonts.display)};`);
  if (theme.fonts?.body) vars.push(`--font-sans: ${clean(theme.fonts.body)};`);
  if (theme.fonts?.voice) vars.push(`--font-serif: ${clean(theme.fonts.voice)};`);
  const d = theme.display;
  if (d?.weight) vars.push(`--display-weight: ${d.weight};`);
  if (d?.width) vars.push(`--display-wdth: ${d.width};`);
  if (d?.tracking) vars.push(`--display-tracking: ${clean(d.tracking)};`);
  if (d?.leading) vars.push(`--display-leading: ${d.leading};`);
  if (d?.scale) vars.push(`--display-scale: ${d.scale};`);
  if (d?.uppercase) vars.push(`--display-case: uppercase;`);
  if (theme.motion?.speed) vars.push(`--motion-speed: ${theme.motion.speed};`);
  if (theme.motion?.ease) vars.push(`--ease-out-expo: ${clean(theme.motion.ease)};`);
  vars.push(`color-scheme: ${theme.scheme};`);

  // Colour changes glide instead of snapping when moving between worlds.
  const base = `${root} { ${vars.join(" ")} }
${root} body { transition: background-color .6s ease, color .6s ease; }`;
  const extra = theme.css ? `\n${root} { ${theme.css} }` : "";
  return base + extra;
}
