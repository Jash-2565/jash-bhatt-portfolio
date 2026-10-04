import { loadFont } from "@remotion/google-fonts/Sora";

export const { fontFamily: sora } = loadFont("normal", {
  weights: ["300", "400", "600", "700"],
  subsets: ["latin"],
});

// Sampled from the hero render so every scene sits on the same maroon.
export const BG = "#3d120c";
export const BG_GLOW = "#69291c";
export const CREAM = "#f6e3c4";
export const MUTED = "#e8b9a8";

// The wand's feedback states, matching the case study's mapping.
export const STATES = {
  far: { label: "Far", color: "#ff4d3d", img: "wand-red-glow.webp" },
  approaching: { label: "Approaching", color: "#ffd23f", img: "wand-yellow-glow.webp" },
  near: { label: "Near", color: "#43e06f", img: "wand-green-glow.webp" },
  found: { label: "Found", color: "#ffffff", img: "wand-white-glow.webp" },
  all: { label: "All found", color: "#c08bff", img: "wand-purple-glow.webp" },
} as const;

export const FPS = 30;
export const TRANSITION = 12;
