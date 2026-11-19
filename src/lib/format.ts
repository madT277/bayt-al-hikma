const AR_DIGITS = new Intl.NumberFormat("ar-EG");

export function arNumber(value: number | string | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? AR_DIGITS.format(n) : String(value ?? "");
}

/**
 * Parses dates defensively. Some legacy rows store publish_date as a JSON-ish
 * string like `["2026-04-16","18:47Z"]`, so we fall back to the first YYYY-MM-DD.
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime()) && /\d{4}-\d{2}-\d{2}T/.test(value)) return direct;
  const iso = String(value).match(/\d{4}-\d{2}-\d{2}/);
  if (iso) {
    const d = new Date(`${iso[0]}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return Number.isNaN(direct.getTime()) ? null : direct;
}

export function formatDate(value: string | null | undefined, style: "long" | "month" = "long"): string {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(
    "ar-EG",
    style === "month"
      ? { month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  ).format(date);
}

/** Arabic-correct minutes label: دقيقة واحدة / دقيقتان / ٣ دقائق / ١٥ دقيقة */
export function readingTimeLabel(minutes: number | null | undefined): string {
  const m = Math.max(1, Math.round(Number(minutes) || 1));
  if (m === 1) return "دقيقة واحدة";
  if (m === 2) return "دقيقتان";
  if (m <= 10) return `${arNumber(m)} دقائق`;
  return `${arNumber(m)} دقيقة`;
}

/** Arabic-correct count label for articles. */
export function articlesLabel(count: number): string {
  if (count === 0) return "لا مقالات";
  if (count === 1) return "مقال واحد";
  if (count === 2) return "مقالان";
  if (count <= 10) return `${arNumber(count)} مقالات`;
  return `${arNumber(count)} مقالاً`;
}
