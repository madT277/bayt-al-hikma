import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui semantic tokens (driven by CSS variables in globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Bayt Al-Hikma brand palette (used directly by pages/components)
        teal: {
          DEFAULT: "#003434",
          light: "#0b4f4e",
          dark: "#062e2d",
        },
        gold: {
          DEFAULT: "#E5B95F",
          dark: "#B8902F",
        },
        cream: {
          DEFAULT: "#F7F5F0",
          2: "#EFEBE1",
        },
        ink: {
          DEFAULT: "#0D1F1F",
          2: "#3D4F4E",
          3: "#6B7A79",
        },

        // Material-style surface tokens (from the original design mockups)
        surface: {
          DEFAULT: "hsl(var(--background))",
          "container-low": "#F3F0E8",
          container: "#EEEAE0",
          "container-high": "#E8E3D7",
        },
        "on-surface": {
          DEFAULT: "hsl(var(--foreground))",
          variant: "hsl(var(--muted-foreground))",
        },
        outline: {
          DEFAULT: "#7A8584",
          variant: "hsl(var(--border))",
        },
        error: "hsl(var(--destructive))",
        "on-secondary": "hsl(var(--secondary-foreground))",
      },
      fontFamily: {
        // Amiri (editorial serif) with Cairo fallback — both loaded via next/font in layout.tsx
        "arabic-serif": ["var(--font-amiri)", "var(--font-arabic)", "serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
        label: ["var(--font-arabic)", "system-ui", "sans-serif"],
        serif: ["var(--font-amiri)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate, typography, containerQueries],
} satisfies Config;
