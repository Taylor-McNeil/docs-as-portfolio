/**
 * Headline text helpers. A headline is one string where the highlighted part is
 * wrapped in asterisks: "What if Icarus Had *Sunscreen?*". Spaces are typed
 * normally, so there is nothing to remember about trailing spaces.
 */

export type HeadlineSegment = { text: string; highlight: boolean };

/** Splits a headline into plain and highlighted runs. An unclosed "*" is kept as text. */
export function parseHeadline(headline: string): HeadlineSegment[] {
  const segments: HeadlineSegment[] = [];
  const pattern = /\*([^*]+)\*/g;
  let last = 0;
  for (const match of headline.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: headline.slice(last, start), highlight: false });
    segments.push({ text: match[1], highlight: true });
    last = start + match[0].length;
  }
  if (last < headline.length) segments.push({ text: headline.slice(last), highlight: false });
  return segments;
}

/** The headline as plain text, highlight markers removed. */
export function stripMarkers(headline: string): string {
  return parseHeadline(headline).map((s) => s.text).join("");
}

/**
 * The two lines of a stacked headline. A line break wins; otherwise the
 * highlighted part becomes the bottom line and everything else the top.
 */
export function splitStacked(headline: string): [string, string] {
  const newline = headline.indexOf("\n");
  if (newline !== -1) {
    return [stripMarkers(headline.slice(0, newline)).trim(), stripMarkers(headline.slice(newline + 1)).trim()];
  }
  const segments = parseHeadline(headline);
  const bottom = segments.filter((s) => s.highlight).map((s) => s.text).join(" ").trim();
  if (!bottom) return [stripMarkers(headline).trim(), ""];
  const top = segments.filter((s) => !s.highlight).map((s) => s.text).join("").replace(/\s+/g, " ").trim();
  return [top, bottom];
}

/** Wraps a title's last word in highlight markers: "Stranded in *Crete*". */
export function highlightLastWord(title: string): string {
  const trimmed = title.trim();
  const space = trimmed.lastIndexOf(" ");
  if (space === -1) return trimmed ? `*${trimmed}*` : "";
  return `${trimmed.slice(0, space + 1)}*${trimmed.slice(space + 1)}*`;
}

/** Lowercase, hyphenated, ASCII-ish: "July–August 2026" → "july-august-2026". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The final download name: base, optional version suffix, ".png". */
export function buildFileName(base: string, suffix: string): string {
  const cleanBase = base.trim().replace(/\.png$/i, "") || "og-image";
  const cleanSuffix = slugify(suffix);
  return `${cleanBase}${cleanSuffix ? `-${cleanSuffix}` : ""}.png`;
}
