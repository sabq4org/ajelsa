import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Tajawal"', "system-ui", "sans-serif"],
        serif: ['"Amiri"', "Georgia", "serif"],
      },
      colors: {
        // Burgundy palette — صحيفة عاجل
        bg: {
          DEFAULT: "#fbf7f4",
          2: "#f5efe9",
        },
        paper: {
          DEFAULT: "#ffffff",
          2: "#faf5f1",
        },
        burgundy: {
          DEFAULT: "#8c1d2b",
          dark: "#6b1421",
          soft: "#b53d4a",
        },
        rose: {
          DEFAULT: "#d8a5aa",
          soft: "#f0d4d6",
          cream: "#fce8e9",
        },
        ink: {
          DEFAULT: "#1f1a1c",
          2: "#4a3f43",
          soft: "#7a6d72",
          faint: "#b3a8ac",
        },
        line: {
          DEFAULT: "#ede4dd",
          soft: "#f3ebe3",
        },
        gold: "#b8924a",
        sage: "#7a9081",
        navy: "#3a4a5e",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31, 26, 28, 0.04), 0 4px 12px rgba(31, 26, 28, 0.04)",
        card: "0 2px 4px rgba(31, 26, 28, 0.06), 0 12px 32px rgba(31, 26, 28, 0.08)",
        red: "0 8px 24px rgba(140, 29, 43, 0.12)",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 50s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
