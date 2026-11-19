/**
 * Real photography (Unsplash, free licence). Every ID below was checked to
 * resolve and to match its subject. Used as fallbacks when an article or issue
 * has no uploaded cover, and for editorial pages (about, 404, auth…).
 */
const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

export const PHOTOS = {
  about: unsplash("1524995997946-a1c2e315a42f"),        // curved library shelves
  notFound: unsplash("1481627834876-b7833e8f5570"),     // long library aisle
  newsletter: unsplash("1544716278-ca5e3f4abd8c", 1200), // open book, coffee, glasses
  auth: unsplash("1457369804613-52c61a468e7d", 1200),    // wall of open pages
  writeForUs: unsplash("1455390582262-044cdead277a", 1200), // fountain pen writing
  issueCover: unsplash("1568667256549-094345857637", 1200), // reading-room shelves
  error: unsplash("1495446815901-a7297e633e8d", 1200),   // stacked books
} as const;

const SECTION_PHOTOS: Record<string, string> = {
  geopolitics: unsplash("1589262804704-c5aa9e6def89"), // antique globe
  economy: unsplash("1611974789855-9c2a0a7236a3"),     // market chart
  culture: unsplash("1518998053901-5348d3961a04"),     // gallery hall
  science: unsplash("1446776811953-b23d57bd21aa"),     // earth from orbit
  history: unsplash("1585036156171-384164a8c675"),     // Arabic manuscript
  sports: unsplash("1461896836934-ffe607ba8211"),      // athletics start
  editorial: unsplash("1455390582262-044cdead277a"),   // fountain pen
  standalone: unsplash("1504711434969-e33886168f5c"),  // newspapers
};

/** Returns the uploaded cover if present, otherwise a section-appropriate photo. */
export function coverFor(cover: string | null | undefined, section?: string | null): string {
  if (cover && cover.trim()) return cover;
  return SECTION_PHOTOS[section ?? ""] ?? SECTION_PHOTOS.standalone;
}

export function isFallbackCover(cover: string | null | undefined): boolean {
  return !cover || !cover.trim();
}
