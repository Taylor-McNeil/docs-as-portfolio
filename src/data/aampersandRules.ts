import rules from "./aampersandRules.json";
import {
  aampersandEntries,
  aampersandEntryHref,
  type AampersandEntry,
} from "./aampersandEntries";

/**
 * The rules: one numbered lesson per entry in this file, in the order they
 * were learned. Each one points back to the devlog (and, where there is one,
 * the exact line) it came from.
 *
 * source: "stated" means the post says it nearly word for word.
 *         "drawn" means the rule is a new wording of what the post shows.
 */
export interface AampersandRule {
  number: number;
  /** Slug of the devlog this rule came from. */
  entry: string;
  rule: string;
  /** The subject area the rule belongs to (UI, Databases, Testing…). */
  domain: string;
  source: "stated" | "drawn";
  /** The sentence in the post, shown as a quote. */
  quote?: string;
  /** Text the "read it in context" link scrolls to (a text fragment). */
  fragment: string;
  /** Heading of the section in the post where the line lives. */
  section?: string;
  /** What I was doing when I learned it. */
  where: string;
  /** Why it stuck. */
  why?: string;
}

const allRules = rules as AampersandRule[];

/**
 * Rules only appear once their devlog is published (i.e. it's in the entries
 * registry). NEXT_PUBLIC_AAMPERSAND_PREVIEW_DRAFTS=1 adds draft posts to the
 * registry locally, which brings their rules with them.
 */
const publishedSlugs = new Set(aampersandEntries.map((entry) => entry.slug));

export const aampersandRules: AampersandRule[] = allRules
  .filter((rule) => publishedSlugs.has(rule.entry))
  .sort((a, b) => a.number - b.number);

export function ruleAnchor(number: number): string {
  return `rule-${number}`;
}

export function ruleHref(number: number): string {
  return `/aampersand/rules#${ruleAnchor(number)}`;
}

/** Encode text for a #:~:text= fragment (dashes, commas and ampersands are syntax there). */
function encodeTextFragment(text: string): string {
  return encodeURIComponent(text).replace(/-/g, "%2D").replace(/,/g, "%2C");
}

/** Link to the exact line in the post, or null if the post isn't published. */
export function ruleSourceHref(rule: AampersandRule): string | null {
  if (!publishedSlugs.has(rule.entry) || !rule.fragment) return null;
  return `${aampersandEntryHref({ slug: rule.entry })}#:~:text=${encodeTextFragment(rule.fragment)}`;
}

export function rulesForEntry(slug: string): AampersandRule[] {
  return aampersandRules.filter((rule) => rule.entry === slug);
}

/** "#24–26", or "#21" for a single rule. Empty string if the entry has none. */
export function ruleRangeLabel(slug: string): string {
  const numbers = rulesForEntry(slug).map((rule) => rule.number);
  if (numbers.length === 0) return "";
  const first = Math.min(...numbers);
  const last = Math.max(...numbers);
  return first === last ? `#${first}` : `#${first}–${last}`;
}

export interface RuleGroup {
  slug: string;
  /** Undefined for a post that isn't published yet (draft preview only). */
  entry?: AampersandEntry;
  rules: AampersandRule[];
}

/** Rules grouped by the devlog they came from, in the order they were learned. */
export function ruleGroups(): RuleGroup[] {
  const groups: RuleGroup[] = [];
  for (const rule of aampersandRules) {
    let group = groups.find((g) => g.slug === rule.entry);
    if (!group) {
      group = {
        slug: rule.entry,
        entry: aampersandEntries.find((entry) => entry.slug === rule.entry),
        rules: [],
      };
      groups.push(group);
    }
    group.rules.push(rule);
  }
  return groups;
}

/** URL-safe form of a rule's subject: "Data modeling" → "data-modeling". */
export function subjectSlug(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface RuleSubject {
  value: string;
  label: string;
  count: number;
}

/** Every subject that has at least one published rule, most rules first. */
export function ruleSubjects(): RuleSubject[] {
  const counts = new Map<string, number>();
  for (const rule of aampersandRules) counts.set(rule.domain, (counts.get(rule.domain) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ value: subjectSlug(label), label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
