import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        // The Door Sheet palette (DESIGN-BRIEF.md section 3).
        paper: "#FAF7F2",
        desk: "#EDE6DA", // the tinted surface the sheet rests on
        ink: { DEFAULT: "#1F2430", soft: "#5B6170" },
        pen: { DEFAULT: "#1D4ED8", tint: "#EEF2FD" },
        rule: "#D9D2C5",
        field: "#8A8478",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        // One soft, warm lift for the sheet: close contact shadow plus a wide, low falloff.
        sheet:
          "0 1px 2px rgb(31 36 48 / 0.05), 0 10px 28px -8px rgb(31 36 48 / 0.10), 0 32px 64px -28px rgb(74 58 34 / 0.18)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // The only motion: a line opening, and the ink filling in.
        "line-open": {
          from: { maxHeight: "0", opacity: "0" },
          to: { maxHeight: "40rem", opacity: "1" },
        },
        "ink-in": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "line-open": "line-open 240ms ease-out",
        "ink-in": "ink-in 600ms ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
