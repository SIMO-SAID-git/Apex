import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#050608",
          900: "#0a0c10",
          800: "#111318",
          700: "#191c22",
        },
        accent: {
          DEFAULT: "#7CFF6B",
          dim: "#4E8A48",
        },
        status: {
          quiet: "#5FE0A0",
          moderate: "#F5C24D",
          peak: "#F5654D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.06) inset",
        elevated: "0 20px 60px -20px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.2,0.6,0.35,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
