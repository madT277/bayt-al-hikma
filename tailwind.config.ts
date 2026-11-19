import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";

/**
 * Bayt Al-Hikma design system
 * ───────────────────────────
 * Colour   : paper + ink neutrals, ONE accent (lapis), semantic success/warning/danger,
 *            and a separate 6-step categorical palette (`data-*`) used ONLY for
 *            comparisons (charts, comparison tables, section legends).
 * Type     : Markazi Text (editorial serif: headlines + reading)
 *            IBM Plex Sans Arabic (interface: nav, labels, meta, forms)
 * Radius   : ONE radius (4px) — every rounded-* utility resolves to it.
 *            `rounded-full` is kept only for genuinely circular things (dots, avatars).
 * Spacing  : Tailwind's 4px scale, used in a fixed rhythm:
 *            1 · 2 · 3 · 4 · 6 · 8 · 12 · 16 · 24  (4 → 96px).
 *            Page sections use the `.section` / `.wrap` helpers in globals.css.
 */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    borderRadius: {
      none: "0",
      DEFAULT: "var(--radius)",
      sm: "var(--radius)",
      md: "var(--radius)",
      lg: "var(--radius)",
      xl: "var(--radius)",
      "2xl": "var(--radius)",
      "3xl": "var(--radius)",
      full: "9999px",
    },
    extend: {
      colors: {
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
          soft: "hsl(var(--accent-soft))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neutrals by name, for editorial layouts
        paper: "hsl(var(--background))",
        ink: {
          DEFAULT: "hsl(var(--foreground))",
          soft: "hsl(var(--ink-soft))",
        },
        rule: "hsl(var(--border))",
        // Semantic states (never used decoratively)
        success: { DEFAULT: "hsl(var(--success))", soft: "hsl(var(--success-soft))" },
        warning: { DEFAULT: "hsl(var(--warning))", soft: "hsl(var(--warning-soft))" },
        danger: { DEFAULT: "hsl(var(--destructive))", soft: "hsl(var(--danger-soft))" },
        // Categorical palette — comparisons only
        data: {
          1: "hsl(var(--data-1))",
          2: "hsl(var(--data-2))",
          3: "hsl(var(--data-3))",
          4: "hsl(var(--data-4))",
          5: "hsl(var(--data-5))",
          6: "hsl(var(--data-6))",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Legacy aliases still used in admin screens
        "arabic-serif": ["var(--font-serif)", "Georgia", "serif"],
        label: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modular type scale (≈1.25) tuned for Arabic
        xs: ["0.8125rem", { lineHeight: "1.6" }],
        sm: ["0.9375rem", { lineHeight: "1.7" }],
        base: ["1.0625rem", { lineHeight: "1.85" }],
        lg: ["1.25rem", { lineHeight: "1.75" }],
        xl: ["1.5rem", { lineHeight: "1.5" }],
        "2xl": ["1.875rem", { lineHeight: "1.4" }],
        "3xl": ["2.375rem", { lineHeight: "1.3" }],
        "4xl": ["3rem", { lineHeight: "1.2" }],
        "5xl": ["3.75rem", { lineHeight: "1.15" }],
      },
      maxWidth: {
        prose: "40rem",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [animate, typography, containerQueries],
} satisfies Config;
