import type { ReactNode } from "react";

/**
 * The devlog badge icons, copied verbatim from ICON_PATHS in ampersand-site's
 * src/components/devlog/DevlogCover.tsx. Each is drawn on a 24px grid in the
 * band colour. When the site adds an icon, copy its paths here too.
 */
export const DEVLOG_ICONS = ["sunscreen", "yarn", "horns", "baby-oil", "puddle", "silhouette", "column", "ampersand"] as const;
export type DevlogIcon = (typeof DEVLOG_ICONS)[number];

export const ICON_PATHS: Record<Exclude<DevlogIcon, "ampersand">, ReactNode> = {
  // #1: sunscreen, sun on the label
  sunscreen: (
    <>
      <path d="M10 2.5h4v2.8h-4z" />
      <path d="M8 5.3h8v14.2A1.5 1.5 0 0 1 14.5 21h-5A1.5 1.5 0 0 1 8 19.5z" />
      <circle cx="12" cy="13.3" r="1.7" />
      <path d="M12 9.6v1M12 16v1M8.6 13.3h1M14.4 13.3h1M9.8 11.1l.6.6M13.6 14.9l.6.6M9.8 15.5l.6-.6M13.6 11.7l.6-.6" />
    </>
  ),
  // #2: ball of yarn with a long tail
  yarn: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M4.4 6.2c4.3-.2 8.6 2.2 11.2 6.8" />
      <path d="M3.3 10.6c3.7-.6 7.7.9 10.3 4.4" />
      <path d="M5.6 15c2.4-.6 5 0 6.9 1.8" />
      <path d="M8.2 3.3c3.4 1.4 6.2 4.4 7.6 8.6" />
      <path d="M15.4 14.6c.6 2 1.8 4.6 4 5.6 1 .4 2 .1 2.4-.8" />
    </>
  ),
  // #3: Minoan horns of consecration, on their altar
  horns: (
    <>
      <path d="M4 3.5c-.3 6.2 1.6 9.7 5 9.7h6c3.4 0 5.3-3.5 5-9.7" />
      <path d="M4 3.5c1.2 4 2.5 5.6 4.5 5.6 1 0 1.8-.6 3.5-.6s2.5.6 3.5.6c2 0 3.3-1.6 4.5-5.6" />
      <path d="M4.5 13.2h15v2.6h-15zM6 15.8v4.7M18 15.8v4.7M4 20.5h16" />
    </>
  ),
  // #4: baby oil in a pump bottle
  "baby-oil": (
    <>
      <path d="M9 2.5h5.5M12 2.5v3" />
      <path d="M10 5.5h4v2h-4z" />
      <path d="M8 7.5h8v12A1.5 1.5 0 0 1 14.5 21h-5A1.5 1.5 0 0 1 8 19.5z" />
      <path d="M12 11.5c-1.3 2-1.7 2.8-1.7 3.5a1.7 1.7 0 0 0 3.4 0c0-.7-.4-1.5-1.7-3.5z" />
    </>
  ),
  // #5: a puddle that reads as a lake, with a reed
  puddle: (
    <>
      <path d="M2.5 16c0-2.4 2.4-3.2 4.4-3.6 2.1-.4 3-2.2 5.6-2.2 4.2 0 9 1.8 9 4.8 0 3-3.6 4.8-9 4.8S2.5 18.6 2.5 16z" />
      <path d="M8 15.6c2.6.7 5.6.7 8.2 0" />
      <path d="M17 11.2V4.5M17 6.5c-1.2-.4-1.8-1.6-1.6-2.8 1 .2 1.6 1.3 1.6 2.8" />
      <path d="M19.2 11.6V7" />
    </>
  ),
  // #6: a Victorian silhouette portrait in an oval frame
  silhouette: (
    <>
      <ellipse cx="12" cy="12" rx="8" ry="10" strokeWidth="1.5" />
      <path d="M6.6 19.5c.6-1.8 1.6-3.2 2.4-4.3.2-.9 0-1.6-.6-2.4-.8-1-1.2-2.2-1.2-3.4 0-2.6 2-4.4 4.8-4.4 1.8 0 3 .9 3.5 2.2l1.6 3.4-1 .4.4.6-.5.4.4.6-.6.5c0 .9-.6 1.5-1.6 1.5h-.6l.2 1.5c1.4.5 3.2 1.9 4 3.8z" fill="currentColor" stroke="none" />
      <circle cx="7.8" cy="8.4" r="1.9" fill="currentColor" stroke="none" />
    </>
  ),
  // #7: a herm is a pillar, so a column tilting on level ground
  column: (
    <>
      <g transform="rotate(14 12 13)">
        <path d="M6.5 4.5h11M7.5 6.5h9" />
        <path d="M8.5 6.5v12.5M15.5 6.5V19M11 6.5V19M13 6.5V19" />
        <path d="M7 19h10" />
      </g>
      <path d="M3 21.5h18" />
    </>
  ),
};
