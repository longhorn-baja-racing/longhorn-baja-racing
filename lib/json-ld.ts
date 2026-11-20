/**
 * Serializes structured data for a <script type="application/ld+json"> tag.
 * Escaping "<" keeps text such as "</script>" or "<!--" in a value from ending
 * the script element early; JSON parsers read "<" back as "<".
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
