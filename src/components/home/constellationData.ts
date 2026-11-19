import {
  aampersandEntries,
  aampersandEntryHref,
  coverageLabel,
} from "@/data/aampersandEntries";

/**
 * The homepage constellation: career releases as one arc (oldest left),
 * docs hanging off the release they came from, and the aampersand devlogs
 * trailing down from aampersand in order.
 *
 * Positions are fractions of the canvas: `d` for desktop, `m` for phones
 * (canvas narrower than 640px). Career versions follow the changelog's
 * numbering; keep them in sync with src/components/changelog/changelog.ts.
 */

export type StarKind = "career" | "break" | "now" | "docs" | "devlog" | "latest";

export interface Star {
  id: string;
  label: string;
  kind: StarKind;
  d: [number, number];
  m: [number, number];
  r: number;
  meta: string;
  text: string;
  href: string;
  /** Short line drawn next to the star: a version, or a devlog number. */
  short: string;
}

type Fixed = Omit<Star, "d" | "m"> & { d: [number, number]; m: [number, number] };

// Changelog anchors are the first word of each release's title, lowercased.
const career: Fixed[] = [
  { id: "origins", label: "Origins", kind: "career", d: [0.05, 0.22], m: [0.084, 0.528], r: 5, meta: "v1.0.0 · 2018 - 2020", text: "CS degree by day, community builder by night. Led PantherHackers, taught Python to 150+ students.", href: "/changelog#origins", short: "v1.0.0" },
  { id: "ncr", label: "NCR", kind: "career", d: [0.125, 0.15], m: [0.072, 0.404], r: 5, meta: "v1.1.0 · Aug 2020 - Sep 2021", text: "First real DevRel role. Demo apps, SDKs, auth guides, video tutorials.", href: "/changelog#ncr", short: "v1.1.0" },
  { id: "dropbox", label: "Dropbox", kind: "career", d: [0.205, 0.115], m: [0.114, 0.286], r: 5, meta: "v2.0.0 · Sep 2021 - Jan 2022", text: "Modernized legacy API docs and migrated them to OpenAPI.", href: "/changelog#dropbox", short: "v2.0.0" },
  { id: "render", label: "Render Atlanta", kind: "career", d: [0.285, 0.1], m: [0.202, 0.187], r: 5, meta: "v2.5.0 · Oct 2021 - Jul 2022", text: "Grew Atlanta's developer scene from 212 to 1,000+ members.", href: "/changelog#render", short: "v2.5.0" },
  { id: "stellar", label: "Stellar", kind: "career", d: [0.365, 0.1], m: [0.327, 0.123], r: 6, meta: "v3.0.0 · Jan 2022 - Jan 2023", text: "Rebuilt the developer portal, multi-language docs, and grant programs for community SDKs.", href: "/changelog#stellar", short: "v3.0.0" },
  { id: "mastercard", label: "Mastercard", kind: "career", d: [0.445, 0.115], m: [0.47, 0.1], r: 6, meta: "v3.2.0 · Jan 2023 - Jun 2024", text: "Owned the OpenBanking API docs lifecycle, from OpenAPI specs to hackathons.", href: "/changelog#mastercard", short: "v3.2.0" },
  { id: "travel", label: "Travel & Writing", kind: "break", d: [0.52, 0.14], m: [0.613, 0.123], r: 5, meta: "v4.0.0 · Jun 2024 - Sep 2025", text: "A break between roles. Traveled, wrote books, and started pondering the tool that became aampersand.", href: "/changelog#travel", short: "v4.0.0" },
  { id: "mongodb", label: "MongoDB", kind: "career", d: [0.585, 0.17], m: [0.738, 0.187], r: 7, meta: "v4.1.0 · Sep 2025 - now", text: "Docs where databases meet AI: AI and agent integrations, agent skills, sample apps and tutorials.", href: "/changelog#mongodb", short: "v4.1.0" },
  { id: "ai", label: "AI Eval Consulting", kind: "career", d: [0.665, 0.2], m: [0.826, 0.286], r: 5.5, meta: "v4.1.1 · Sep 2025 - now", text: "Consulting on how AI output gets judged: evaluation rubrics and gold-standard examples.", href: "/changelog#ai", short: "v4.1.1" },
  { id: "site", label: "taylormcneil.dev", kind: "career", d: [0.745, 0.25], m: [0.868, 0.404], r: 5.5, meta: "v4.1.2 · Dec 2025 - now", text: "This site, built as a working documentation system with its own publishing tools.", href: "/changelog#taylormcneil.dev", short: "v4.1.2" },
  { id: "aamp", label: "aampersand", kind: "now", d: [0.815, 0.33], m: [0.856, 0.528], r: 8, meta: "v4.2.0 · Nov 2025 - now", text: "A creative writing tool for fiction writers, built in public.", href: "/aampersand", short: "v4.2.0" },
];

const docs: Fixed[] = [
  { id: "java", label: "Java Game Dev", kind: "docs", d: [0.09, 0.37], m: [0.21, 0.6], r: 4.5, meta: "Tutorial · from Origins", text: "Building a game in Java.", href: "/professional-work/tutorials/java-game-dev", short: "" },
  { id: "hmac", label: "HMAC Authentication", kind: "docs", d: [0.15, 0.285], m: [0.21, 0.44], r: 4.5, meta: "Guide · from NCR", text: "The one a room once heard as \"hammock.\"", href: "/professional-work/guides/hmac-authentication", short: "" },
  { id: "sdocs", label: "Stellar API Docs", kind: "docs", d: [0.39, 0.25], m: [0.36, 0.27], r: 4.5, meta: "Case study · from Stellar", text: "How the Stellar developer docs were rebuilt.", href: "/professional-work/case-studies/stellar-api-docs", short: "" },
  { id: "tanstack", label: "MongoDB x TanStack", kind: "docs", d: [0.545, 0.355], m: [0.62, 0.3], r: 4.5, meta: "Tutorial · from MongoDB", text: "A recent fullstack tutorial.", href: "/professional-work/tutorials/mongodb-tanstack", short: "" },
  { id: "hub", label: "On Good Tutorials", kind: "docs", d: [0.72, 0.47], m: [0.66, 0.36], r: 4.5, meta: "Case study · on this site", text: "My learnings and thoughts on tutorials.", href: "/professional-work/case-studies/on-good-tutorials", short: "" },
  { id: "field", label: "Building Docs From Scratch", kind: "docs", d: [0.715, 0.585], m: [0.56, 0.47], r: 4.5, meta: "Field notes · on this site", text: "Why this portfolio is a docs site.", href: "/field-notes/on-building-a-doc-system", short: "" },
];

/** Each doc hangs off the release it came from. */
export const docLinks: [string, string][] = [
  ["java", "origins"],
  ["hmac", "ncr"],
  ["sdocs", "stellar"],
  ["tanstack", "mongodb"],
  ["hub", "site"],
  ["field", "site"],
];

export const careerOrder = career.map((s) => s.id);

/** The most devlogs the trail shows; older ones stay on /aampersand. */
const TRAIL_MAX = 10;

type Pt = [number, number];
function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}
const round = (p: Pt): Pt => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000];

// The devlog trail curls down from aampersand. New devlogs are spaced out along
// the same curve, so the shape holds as the series grows.
const TRAIL_DESKTOP: [Pt, Pt, Pt, Pt] = [[0.815, 0.33], [0.985, 0.43], [1.0, 0.84], [0.8, 0.915]];
const TRAIL_PHONE: [Pt, Pt, Pt, Pt] = [[0.856, 0.528], [0.93, 0.7], [0.76, 0.93], [0.38, 0.95]];

function devlogStars(): Star[] {
  const published = [...aampersandEntries].sort((a, b) => a.number - b.number).slice(-TRAIL_MAX);
  const n = published.length;
  return published.map((entry, i) => {
    const t = (i + 1) / n;
    const latest = i === n - 1;
    const num = String(entry.number).padStart(2, "0");
    return {
      id: `devlog-${entry.number}`,
      label: entry.title,
      kind: latest ? "latest" : "devlog",
      d: round(bezier(...TRAIL_DESKTOP, t)),
      m: round(bezier(...TRAIL_PHONE, t)),
      r: latest ? 4.5 : 3.5,
      meta: `Devlog ${num} · ${coverageLabel(entry.coverage)}${latest ? " · latest" : ""}`,
      text: `Tag: ${entry.tag}`,
      href: aampersandEntryHref(entry),
      short: latest ? `${num} · latest` : num,
    };
  });
}

export function constellationStars(): { stars: Star[]; trail: string[] } {
  const devlogs = devlogStars();
  return {
    stars: [...career, ...devlogs, ...docs],
    trail: ["aamp", ...devlogs.map((s) => s.id)],
  };
}

export const devlogCount = aampersandEntries.length;
