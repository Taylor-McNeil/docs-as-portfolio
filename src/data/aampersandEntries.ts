import entries from "./aampersandEntries.json";
import draftEntries from "./aampersandDraftEntries.json";

export interface AampersandCoverage {
  start: string;
  end: string;
}

export type AampersandPreview =
  | "default"
  | "origin"
  | "thread"
  | "clothesline"
  | "graph"
  | "spark"
  | "queue"
  | "translation"
  | "pot";

export type AampersandTagTone = "purple" | "blue" | "yellow" | "pink" | "green" | "warning";

export interface AampersandEntry {
  number: number;
  slug: string;
  title: string;
  cardTitle: string;
  coverage: AampersandCoverage;
  description: string;
  tag: string;
  tagTone: AampersandTagTone;
  preview: AampersandPreview;
  llmsDescription: string;
}

/**
 * Local previews only: set NEXT_PUBLIC_AAMPERSAND_PREVIEW_DRAFTS=1 to show
 * posts from aampersandDraftEntries.json (and their rules) as if published.
 * A draft is ignored once a real entry with the same slug exists.
 */
export const previewDrafts = process.env.NEXT_PUBLIC_AAMPERSAND_PREVIEW_DRAFTS === "1";

const publishedEntries = entries as AampersandEntry[];

export const aampersandEntries: AampersandEntry[] = previewDrafts
  ? [
      ...publishedEntries,
      ...(draftEntries as AampersandEntry[]).filter(
        (draft) => !publishedEntries.some((entry) => entry.slug === draft.slug),
      ),
    ]
  : publishedEntries;

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function parseCalendarMonth(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year, month } : null;
}

function monthLabel(value: string): string {
  const parsed = parseCalendarMonth(value);
  if (!parsed) return value;
  return monthFormatter.format(new Date(Date.UTC(parsed.year, parsed.month - 1, 1)));
}

export function coverageLabel(coverage: AampersandCoverage): string {
  if (coverage.start === coverage.end) return monthLabel(coverage.start);
  const start = parseCalendarMonth(coverage.start);
  const end = parseCalendarMonth(coverage.end);
  if (!start || !end) return `${coverage.start}–${coverage.end}`;
  if (start.year === end.year) {
    return `${monthLabel(coverage.start).replace(` ${start.year}`, "")}–${monthLabel(coverage.end)}`;
  }
  return `${monthLabel(coverage.start)}–${monthLabel(coverage.end)}`;
}

export function aampersandEntryHref(entry: Pick<AampersandEntry, "slug">): string {
  return `/aampersand/${entry.slug}`;
}

export function nextAampersandEntryNumber(): number {
  return Math.max(0, ...publishedEntries.map((entry) => entry.number)) + 1;
}

/**
 * Display order for readers: newest devlog first. The registry itself stays
 * in publishing order (by entry number), so numbering and the publishing
 * pipeline never change. The overview and the sidebar both read this, so
 * they always agree.
 */
export const aampersandEntriesNewestFirst: AampersandEntry[] = [...aampersandEntries].sort(
  (a, b) => b.number - a.number,
);

export function aampersandEntryBySlug(slug: string): AampersandEntry | undefined {
  return aampersandEntries.find((entry) => entry.slug === slug);
}

/**
 * Seasons group the devlogs in the sidebar and on the overview. An entry
 * belongs to the season its coverage starts in; entries after the last
 * season show above the folders until a new season is added here.
 */
export interface AampersandSeason {
  title: string;
  start: string;
  end: string;
}

export const aampersandSeasons: AampersandSeason[] = [
  { title: "Season 1", start: "2026-01", end: "2026-10" },
];

export function seasonFor(entry: AampersandEntry): AampersandSeason | undefined {
  return aampersandSeasons.find(
    (season) => entry.coverage.start >= season.start && entry.coverage.start <= season.end,
  );
}

export interface AampersandEntryGroup {
  season?: AampersandSeason;
  entries: AampersandEntry[];
}

/** Newest first: entries outside any season, then each season, newest season first. */
export function aampersandEntryGroups(): AampersandEntryGroup[] {
  const unseasoned = aampersandEntriesNewestFirst.filter((entry) => !seasonFor(entry));
  const seasons = [...aampersandSeasons]
    .sort((a, b) => b.start.localeCompare(a.start))
    .map((season) => ({
      season,
      entries: aampersandEntriesNewestFirst.filter((entry) => seasonFor(entry) === season),
    }))
    .filter((group) => group.entries.length > 0);
  return unseasoned.length > 0 ? [{ entries: unseasoned }, ...seasons] : seasons;
}
