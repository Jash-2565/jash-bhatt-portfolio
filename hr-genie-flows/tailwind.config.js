import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // One accent for the active state, matching the portfolio's teal.
      colors: {
        accent: "#01f5d1",
        ok: "#4ade80",
        warn: "#fbbf24",
        bad: "#f87171",
        canvas: "#070b10",
        panel: "#0d141c",
        raised: "#161f28",
        line: "#243140",
      },
      fontFamily: { sans: ["Inter", ...defaultTheme.fontFamily.sans] },
    },
  },
};
