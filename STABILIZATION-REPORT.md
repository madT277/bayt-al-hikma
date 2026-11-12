# Bayt Al-Hikma V3 — Stabilization pass

This is a repair-oriented pass on the uploaded `bayt-al-hikma` Next.js project. The original archive and the original local environment file were not modified. The repaired package intentionally excludes `.env.local`, `.git`, and `node_modules`.

## Changes made

- Replaced the duplicated server/client article route with a server-rendered article lookup and a dedicated client reader component.
- Kept reading progress and focus-reading mode; removed the simulated audio player because it did not play an actual audio source.
- Added an allow-list HTML sanitizer before rendering Tiptap article HTML.
- Corrected Tiptap v3 `Table` imports.
- Fixed issue-number calculation and date-string initialization in the issue workspace.
- Added a missing skeleton UI component and exposed `signOut` through the auth context.
- Aligned issue archive, issue detail, and sitemap lookups with the V3 `issue_number`, `title_ar`, `publish_date`, `cover_image`, and `status` field model.
- Corrected the geopolitics navigation slug (`geopolitics`, not `politics`).
- Rebuilt the homepage as a server-rendered editorial landing page with a latest-issue feature and recent-article layout.
- Added a `robots.ts` route and stopped exposing raw internal error messages on the generic error page.
- Replaced the incompatible ESLint flat-config file with a Next.js 14-compatible `.eslintrc.json`.
- Added `.env.example` and tightened `.gitignore` rules so local environment files are not committed.
- Added `npm run check` for TypeScript and ESLint validation.

## Validation

- TypeScript: `tsc --noEmit` passed with no errors.
- ESLint: passed with zero errors; remaining warnings are about native `<img>` elements in a few admin/legacy image-preview areas.
- Production build: not verified in this environment. Next.js attempted to download its Linux SWC binary, but network access to the npm registry was unavailable. Run the production build on the development machine after `npm install`.

## Important items still requiring project-owner verification

1. **Supabase schema:** the code was aligned to the V3 model visible in the source and the supplied screenshots, but no live database migration or live schema inspection was performed. Verify all column names, defaults, nullability, constraints, and foreign keys against the actual Supabase project before deploying.
2. **RLS and admin authorization:** the admin pages still need a verified server-side editor/admin authorization model. Do not treat a successful login as proof of admin permission. The current database screenshots do not establish a trusted role table/claim, so this pass does not invent one.
3. **Profile features:** `profiles` and `saved_articles` are referenced by the profile page but were not visible in the supplied table screenshots. Confirm that these tables and their RLS policies exist before using profile/bookmark features.
4. **Storage:** confirm that the `article-images` bucket exists and that its upload/read policies match the intended editor permissions.
5. **Environment:** copy `.env.example` to `.env.local` and enter the existing project URL and anon key locally. Never commit `.env.local` or a service-role key.

## Run locally

```bash
npm install
# Copy .env.example to .env.local and fill in the Supabase values.
npm run type-check
npm run lint
npm run build
npm run dev
```

Do not replace the existing working directory without first making a backup. Review this repaired copy locally, compare it with your original, and only then merge the changes into your main VS Code project.
