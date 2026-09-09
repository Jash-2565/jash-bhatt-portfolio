import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    // Stock Tailwind starts at sm:640px, which left every phone in the same
    // bucket. `xs` gives the 375px-class devices something to differ from.
    screens: {
      xs: "400px",
      ...defaultTheme.screens,
    },
    extend: {
      // The accent is defined once as RGB channels in index.css :root, so
      // Tailwind can apply its own alpha (text-accent/40, border-accent/25)
      // instead of every call site hardcoding an rgba() literal.
      colors: {
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-br": "rgb(var(--accent-bright-rgb) / <alpha-value>)",
        "accent-deep": "rgb(var(--accent-deep-rgb) / <alpha-value>)",
      },
      // Labels and metadata carry the schematic read, so the mono is a real
      // face rather than whatever ui-monospace resolves to per OS.
      fontFamily: {
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      // Collapse the whole radius scale to near-square. Overriding the named
      // steps rather than editing ~50 call sites keeps rounded-full intact for
      // the things that are genuinely circular (dots, avatars, the cursor).
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "3px",
        xl: "3px",
        "2xl": "4px",
        "3xl": "4px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        nudge: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        menuOpen: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        menuClose: {
          "0%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 500ms ease-out both",
        "fade-in-up": "fadeInUp 650ms ease-out both",
        nudge: "nudge 2.4s ease-in-out infinite",
        "menu-open": "menuOpen 280ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "menu-close": "menuClose 280ms cubic-bezier(0.4, 0, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
