/**
 * Every font a template draws with, served from /public/fonts. loadFonts()
 * registers each face with the page AND forces it to download (a face the
 * preview hasn't used yet would otherwise stay unloaded), then builds the
 * @font-face CSS with the files inlined as data URIs for html-to-image, so an
 * export never falls back to system fonts.
 */

type LocalFont = { family: string; style: "normal" | "italic"; weight: string; src: string };

export const LOCAL_FONTS: LocalFont[] = [
  { family: "Fraunces", style: "normal", weight: "400", src: "/fonts/fraunces-latin-400.woff2" },
  { family: "Fraunces", style: "normal", weight: "700", src: "/fonts/fraunces-latin-700.woff2" },
  // Variable weight + optical size, as aampersand.com loads it: big titles get the display cut.
  { family: "Fraunces Variable", style: "normal", weight: "100 900", src: "/fonts/fraunces-latin-opsz-variable.woff2" },
  { family: "Playfair Display", style: "normal", weight: "400", src: "/fonts/playfair-latin-400.woff2" },
  { family: "Playfair Display", style: "normal", weight: "700", src: "/fonts/playfair-latin-700.woff2" },
  { family: "Playfair Display", style: "normal", weight: "900", src: "/fonts/playfair-latin-900.woff2" },
  { family: "Playfair Display", style: "italic", weight: "400", src: "/fonts/playfair-latin-italic-400.woff2" },
  { family: "Inter", style: "normal", weight: "500", src: "/fonts/inter-latin-500.woff2" },
  { family: "JetBrains Mono", style: "normal", weight: "400", src: "/fonts/jetbrains-mono-latin-400.woff2" },
  { family: "DM Sans", style: "normal", weight: "400", src: "/fonts/dm-sans-latin-400.woff2" },
  { family: "DM Sans", style: "normal", weight: "600", src: "/fonts/dm-sans-latin-600.woff2" },
  { family: "DM Sans", style: "italic", weight: "400", src: "/fonts/dm-sans-latin-italic-400.woff2" },
  { family: "Crimson Pro", style: "italic", weight: "400", src: "/fonts/crimson-pro-latin-italic-400.woff2" },
];

function fontFaceRule(font: LocalFont, src: string): string {
  return `@font-face { font-family: '${font.family}'; font-style: ${font.style}; font-weight: ${font.weight}; font-display: block; src: url(${src}) format('woff2'); }`;
}

function toDataUri(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([buffer], { type: "font/woff2" }));
  });
}

async function loadOne(font: LocalFont): Promise<string> {
  const response = await fetch(font.src);
  if (!response.ok) throw new Error(`Could not load ${font.src} (${response.status})`);
  const buffer = await response.arrayBuffer();
  const face = new FontFace(font.family, buffer.slice(0), { style: font.style, weight: font.weight });
  await face.load();
  document.fonts.add(face);
  return fontFaceRule(font, await toDataUri(buffer));
}

let pending: Promise<string> | null = null;

/** Resolves with the inlined @font-face CSS once every font is ready. Runs once per page. */
export function loadFonts(): Promise<string> {
  if (!pending) {
    pending = Promise.all(LOCAL_FONTS.map(loadOne)).then((rules) => rules.join("\n"));
    // Let a failed load be retried on the next export.
    pending.catch(() => {
      pending = null;
    });
  }
  return pending;
}
