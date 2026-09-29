import { Bodoni_Moda } from "next/font/google";
import type { WorldTheme } from "./types";

export const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });

/**
 * Default for Style Icons: a fashion-magazine feature. Warm paper tinted by the
 * icon's accent, a high-contrast serif for the big type, unhurried motion.
 */
export const icon: WorldTheme = {
  key: "icon",
  label: "Style icon (magazine feature)",
  scheme: "light",
  palette: (accent) => ({
    paper: `color-mix(in oklab, ${accent} 9%, #efebe4)`,
    paper2: `color-mix(in oklab, ${accent} 15%, #e6e1d8)`,
    paper3: `color-mix(in oklab, ${accent} 24%, #d9d3c8)`,
    ink: "#17130f",
    char: "#211c17",
    char2: "#2c261f",
    graphite: "#453d34",
    stone: "#6e6458",
    ash: "#91877a",
    fog: "#bdb3a5",
    accent: `color-mix(in oklab, ${accent} 85%, #000)`,
  }),
  fonts: { display: bodoni.style.fontFamily },
  display: { weight: 500, tracking: "-0.035em", leading: 0.92, scale: 0.96 },
  motion: { speed: 1.25 },
  backdrop: "grain",
  entrance: "fade",
  presentation: "editorial",
};
