import type { WorldTheme } from "./types";

/** Quiet luxury: softer paper, lighter type, slower everything. Nothing shouts. */
export const essentials: WorldTheme = {
  key: "essentials",
  label: "Essentials (calm)",
  scheme: "light",
  palette: (accent) => ({
    paper: "#f3f0ea",
    paper2: "#ebe7df",
    paper3: "#dfdad0",
    ink: "#2b2926",
    char: "#34312d",
    char2: "#3f3b36",
    graphite: "#57534d",
    stone: "#7b766e",
    ash: "#9a948a",
    fog: "#c3bdb2",
    accent: `color-mix(in oklab, ${accent} 70%, #5d574f)`,
  }),
  display: { weight: 380, width: 100, tracking: "-0.035em", leading: 0.98, scale: 0.86 },
  motion: { speed: 1.5, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
  backdrop: "none",
  entrance: "fade",
  presentation: "essentials",
  css: `
    .grain::after { opacity: 0.04; }
    .piece-media img { transition-duration: 1.6s; }
  `,
};
