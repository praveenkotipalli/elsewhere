import { Anton } from "next/font/google";
import type { WorldTheme } from "./types";

export const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

/**
 * Default for anime worlds until a world gets its own theme: night paper tinted
 * by the world's colour, condensed uppercase display, snappy motion, speed lines.
 * Deliberately generic — no characters, symbols or artwork from any series.
 */
export const anime: WorldTheme = {
  key: "anime",
  label: "Anime (base)",
  scheme: "dark",
  palette: (accent) => ({
    paper: `color-mix(in oklab, ${accent} 7%, #0b0b0c)`,
    paper2: `color-mix(in oklab, ${accent} 11%, #121214)`,
    paper3: `color-mix(in oklab, ${accent} 16%, #1b1b1e)`,
    ink: "#f2eee6",
    char: "#e4dfd5",
    char2: "#d2ccc0",
    graphite: "#bdb7ab",
    stone: "#9a958b",
    ash: "#7c776f",
    fog: "#4d4a45",
    accent,
  }),
  fonts: { display: anton.style.fontFamily },
  display: { weight: 400, width: 100, tracking: "0.005em", leading: 0.9, scale: 0.92, uppercase: true },
  motion: { speed: 0.6, ease: "cubic-bezier(0.7, 0, 0.2, 1)" },
  backdrop: "speedlines",
  entrance: "wipe",
  presentation: "poster",
  css: `
    ::selection { background: var(--color-signal); color: var(--color-bone); }
    .piece:hover .piece-media { outline: 2px solid var(--color-signal); outline-offset: 4px; }
    .piece-media { transition: outline-color .2s; }
  `,
};
