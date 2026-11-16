// Tailwind CSS v3 PostCSS pipeline (Next.js 14).
// NOTE: do not use "@tailwindcss/postcss" here — that plugin is for Tailwind v4,
// while this project is pinned to tailwindcss@3.x with a tailwind.config.ts.
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
