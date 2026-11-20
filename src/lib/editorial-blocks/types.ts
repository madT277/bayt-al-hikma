export type EditorialBlockType = "chart";

export type ChartType = "bar" | "line" | "pie";

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartBlockData {
  chartType: ChartType;
  title: string;
  description?: string;
  unit?: string;
  source?: string;
  data: ChartDataPoint[];
}

export interface EditorialBlockDefinition {
  type: EditorialBlockType;
  labelAr: string;
  descriptionAr: string;
}

/**
 * Central registry of editorial block types.
 * To add a new block later (e.g. "timeline", "factbox", "statstrip"),
 * append its type to EditorialBlockType, add metadata here, and register
 * its renderer in EditorialBlockRenderer.tsx.
 */
export const EDITORIAL_BLOCKS: EditorialBlockDefinition[] = [
  {
    type: "chart",
    labelAr: "رسم بياني",
    descriptionAr: "مخطط أعمدة أو خطي أو دائري لمقارنة الأرقام والبيانات.",
  },
];

/** UTF-8 safe Base64 encoding that works identically in Node SSR and browsers. */
export function encodeBlockPayload(data: unknown): string {
  const json = JSON.stringify(data);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** UTF-8 safe Base64 decoding with fallback to raw JSON. */
export function decodeBlockPayload<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return JSON.parse(trimmed) as T;
    }
    let json: string;
    if (typeof Buffer !== "undefined") {
      json = Buffer.from(trimmed, "base64").toString("utf8");
    } else {
      const binary = atob(trimmed);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      json = new TextDecoder().decode(bytes);
    }
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isValidChartData(value: unknown): value is ChartBlockData {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ChartBlockData>;
  return (
    (v.chartType === "bar" || v.chartType === "line" || v.chartType === "pie") &&
    typeof v.title === "string" &&
    Array.isArray(v.data) &&
    v.data.length > 0 &&
    v.data.every(
      (pt) =>
        pt &&
        typeof pt === "object" &&
        typeof pt.label === "string" &&
        typeof pt.value === "number" &&
        Number.isFinite(pt.value),
    )
  );
}

/** Serializes an editorial block into the HTML stored in articles.body_ar. */
export function buildEditorialBlockHtml(type: EditorialBlockType, data: unknown): string {
  const encoded = encodeBlockPayload(data);
  return `<div data-editorial-block="${type}" data-block-payload="${encoded}"></div>`;
}

export type ArticleBodySegment =
  | { kind: "html"; html: string }
  | { kind: "block"; blockType: string; payload: unknown };

const BLOCK_TAG_REGEX =
  /<div\b(?=[^>]*\bdata-editorial-block="([^"]+)")(?=[^>]*\bdata-block-payload="([^"]+)")[^>]*>(?:\s*)<\/div>/gi;

/**
 * Splits sanitized article HTML into alternating prose segments and structured
 * editorial block payloads so ArticleReader can mount interactive React blocks
 * between paragraphs.
 */
export function splitArticleBody(html: string): ArticleBodySegment[] {
  if (!html) return [];
  const segments: ArticleBodySegment[] = [];
  let lastIndex = 0;
  BLOCK_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BLOCK_TAG_REGEX.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({ kind: "html", html: before });
    }
    const blockType = match[1];
    const payload = decodeBlockPayload(match[2]);
    if (payload !== null) {
      segments.push({ kind: "block", blockType, payload });
    }
    lastIndex = match.index + match[0].length;
  }

  const tail = html.slice(lastIndex);
  if (tail.trim()) {
    segments.push({ kind: "html", html: tail });
  }
  return segments;
}
