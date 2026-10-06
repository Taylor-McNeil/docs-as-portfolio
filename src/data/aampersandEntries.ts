import entries from "./aampersandEntries.json";

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
  | "translation";

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

export const aampersandEntries = entries as AampersandEntry[];

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
  return Math.max(0, ...aampersandEntries.map((entry) => entry.number)) + 1;
}
