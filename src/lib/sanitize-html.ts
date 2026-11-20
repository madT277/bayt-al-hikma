const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "pre", "code", "hr", "a", "img", "figure",
  "figcaption", "table", "thead", "tbody", "tr", "th", "td", "div", "span",
]);
const VOID_TAGS = new Set(["br", "hr", "img"]);

/** A conservative allow-list sanitizer for HTML produced by the editorial Tiptap editor. */
export function sanitizeArticleHtml(input: string): string {
  if (!input) return "";
  let html = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|svg|math)\b[^>]*\/?\s*>/gi, "");

  html = html.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (whole, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    const closing = whole.startsWith("</");
    if (closing) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;

    const attrs: string[] = [];
    const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let match: RegExpExecArray | null;
    while ((match = attrPattern.exec(rawAttrs))) {
      const name = match[1].toLowerCase();
      const value = match[2] ?? match[3] ?? match[4] ?? "";
      if (name.startsWith("on") || name === "style" || name === "srcdoc") continue;
      if (name === "class" || name === "dir" || name === "title" || name === "alt" || name === "width" || name === "height" || name === "colspan" || name === "rowspan") {
        attrs.push(`${name}="${escapeAttribute(value)}"`);
      }
      if (tag === "div" && (name === "data-editorial-block" || name === "data-block-payload")) {
        if (name === "data-editorial-block" && /^[a-z0-9-]+$/i.test(value)) {
          attrs.push(`${name}="${escapeAttribute(value)}"`);
        } else if (name === "data-block-payload" && /^[A-Za-z0-9+/=]+$/.test(value)) {
          attrs.push(`${name}="${escapeAttribute(value)}"`);
        }
      }
      if (name === "href" || name === "src") {
        const safeUrl = isSafeUrl(value);
        if (safeUrl) attrs.push(`${name}="${escapeAttribute(value)}"`);
      }
      if (name === "target" && value === "_blank" && tag === "a") attrs.push('target="_blank"');
    }
    if (tag === "a" && attrs.some((a) => a.startsWith("target="))) attrs.push('rel="noopener noreferrer"');
    return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}${VOID_TAGS.has(tag) ? " />" : ""}>`;
  });
  return html;
}

function isSafeUrl(value: string): boolean {
  const normalized = value.trim().replace(/[\u0000-\u0020]+/g, "");
  return /^(https?:|mailto:|tel:|\/|#)/i.test(normalized) && !/^\/\//.test(normalized);
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
