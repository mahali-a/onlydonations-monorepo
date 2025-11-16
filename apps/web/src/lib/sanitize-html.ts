import sanitize from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "code",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "pre",
  "hr",
];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
    },
  });
}
