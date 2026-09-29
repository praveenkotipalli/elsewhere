import type { WorldTheme } from "./types";

/**
 * The Elsewhere house style. Listed so it can be chosen explicitly, but it
 * produces no overrides: the tokens in globals.css already are the brand.
 */
export const brand: WorldTheme = {
  key: "brand",
  label: "Elsewhere (house style)",
  scheme: "light",
  palette: {
    paper: "#ece9e3",
    paper2: "#e1ddd5",
    paper3: "#d3cec4",
    ink: "#0d0d0c",
    char: "#181816",
    char2: "#232320",
    graphite: "#3b3a37",
    stone: "#6b6862",
    ash: "#8e8b85",
    fog: "#b9b5ad",
    accent: "#c73a1f",
  },
  presentation: "editorial",
  entrance: "none",
};
