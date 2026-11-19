"use client";

import { useEffect, useMemo, useState } from "react";
import { MethodBadge } from "@/components/navigation/MethodBadge";

export interface RulesFilterMonth {
  /** Coverage start month of the devlog, e.g. "2026-09". Used in the URL. */
  value: string;
  /** Devlog slug, matches data-rule-group on the page. */
  slug: string;
  label: string;
  title: string;
}

export interface RulesFilterSubject {
  /** URL-safe subject, matches data-subject on each rule. */
  value: string;
  label: string;
}

export interface RulesFilterRule {
  number: number;
  subject: string;
  /** Devlog slug. */
  group: string;
}

interface Filters {
  subject: string | null;
  month: string | null;
}

const NONE: Filters = { subject: null, month: null };

/** Opens the rule named in the URL hash (e.g. #rule-27). */
function ruleFromHash(): HTMLDetailsElement | null {
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith("rule-")) return null;
  return document.querySelector<HTMLDetailsElement>(`#${CSS.escape(hash)} > details`);
}

function readFiltersFromUrl(subjects: RulesFilterSubject[], months: RulesFilterMonth[]): Filters {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  const month = params.get("month");
  return {
    subject: subjects.some((s) => s.value === subject) ? subject : null,
    month: months.some((m) => m.value === month) ? month : null,
  };
}

function writeFiltersToUrl(filters: Filters) {
  const url = new URL(window.location.href);
  url.searchParams.delete("subject");
  url.searchParams.delete("month");
  if (filters.subject) url.searchParams.set("subject", filters.subject);
  if (filters.month) url.searchParams.set("month", filters.month);
  window.history.replaceState(window.history.state, "", url);
}

/**
 * The rules page filter, styled as the request it makes:
 * GET /aampersand/rules?subject=testing&month=2026-09 → 200 OK · 4 rules.
 *
 * Two facets (subject and devlog month), combined with AND. The count on each
 * chip is what you'd get if you picked it, given the other facet. Clicking a
 * subject tag on a rule filters by that subject. Filters live in the query
 * string, so a filtered view can be shared.
 *
 * Also owns two behaviors for the rule rows: only one rule open at a time, and
 * #rule-N links land on that rule opened. The rows are server-rendered
 * <details>, so the page still works without JS.
 */
export function RulesFilter({
  subjects,
  months,
  rules,
}: {
  subjects: RulesFilterSubject[];
  months: RulesFilterMonth[];
  rules: RulesFilterRule[];
}) {
  const [filters, setFilters] = useState<Filters>(NONE);

  const monthBySlug = useMemo(() => new Map(months.map((m) => [m.slug, m.value])), [months]);
  const matches = (rule: RulesFilterRule, f: Filters) =>
    (!f.subject || rule.subject === f.subject) && (!f.month || monthBySlug.get(rule.group) === f.month);

  const visibleCount = rules.filter((rule) => matches(rule, filters)).length;
  const subjectCount = (value: string) =>
    rules.filter((rule) => matches(rule, { ...filters, subject: value })).length;
  const monthCount = (value: string) =>
    rules.filter((rule) => matches(rule, { ...filters, month: value })).length;

  // Pick up a shared ?subject=…&month=… link. Has to run after hydration, since
  // the page is static and the server never sees the query string.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
    setFilters(readFiltersFromUrl(subjects, months));
  }, [subjects, months]);

  // Apply the filter to the server-rendered rows.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-rule-group]").forEach((group) => {
      const groupMonth = monthBySlug.get(group.dataset.ruleGroup ?? "");
      let shown = 0;
      group.querySelectorAll<HTMLElement>("[data-rule]").forEach((row) => {
        const hide =
          (!!filters.subject && row.dataset.subject !== filters.subject) ||
          (!!filters.month && groupMonth !== filters.month);
        row.hidden = hide;
        if (!hide) shown += 1;
      });
      group.hidden = shown === 0;
    });
  }, [filters, monthBySlug]);

  useEffect(() => {
    // One rule open at a time. (Browsers that support <details name> already do this.)
    function onToggle(event: Event) {
      const opened = event.target as HTMLDetailsElement;
      if (!opened.matches?.("[data-rule] > details") || !opened.open) return;
      document.querySelectorAll<HTMLDetailsElement>("[data-rule] > details[open]").forEach((details) => {
        if (details !== opened) details.open = false;
      });
    }

    // A subject tag on a rule filters by that subject instead of opening the rule.
    function onTagClick(event: MouseEvent) {
      const tag = (event.target as HTMLElement).closest<HTMLElement>("[data-subject-tag]");
      if (!tag) return;
      event.preventDefault();
      event.stopPropagation();
      const value = tag.dataset.subjectTag ?? null;
      setFilters((current) => {
        const next = { ...current, subject: current.subject === value ? null : value };
        writeFiltersToUrl(next);
        return next;
      });
    }

    function openFromHash() {
      const details = ruleFromHash();
      if (!details) return;
      if (details.closest("[hidden]")) {
        setFilters(NONE);
        writeFiltersToUrl(NONE);
      }
      details.open = true;
    }

    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("click", onTagClick, true);
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
    return () => {
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onTagClick, true);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  function update(next: Filters) {
    setFilters(next);
    writeFiltersToUrl(next);
  }

  const chip = (
    facet: "subject" | "month",
    value: string,
    label: string,
    count: number,
    pressed: boolean,
    onClick: () => void,
    title?: string,
  ) => (
    <button
      key={`${facet}-${value}`}
      type="button"
      data-facet={facet}
      data-value={value}
      aria-pressed={pressed}
      title={title}
      disabled={count === 0 && !pressed}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-35 ${
        pressed
          ? "border-accent bg-accent/10 font-semibold text-accent"
          : "border-border-card text-foreground-muted enabled:hover:border-accent enabled:hover:text-accent"
      }`}
    >
      {label}
      <span className={`text-[10px] ${pressed ? "text-accent" : "opacity-60"}`}>{count}</span>
    </button>
  );

  const active = Boolean(filters.subject || filters.month);
  const query: [string, string][] = [];
  if (filters.subject) query.push(["subject", filters.subject]);
  if (filters.month) query.push(["month", filters.month]);

  return (
    <div data-rules-filter className="overflow-hidden rounded border border-border-card bg-surface-terminal/60">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-card px-3 py-2">
        <MethodBadge method="GET" active size="sm" />
        <code data-rules-query className="min-w-0 flex-1 break-all font-mono text-[12px] text-foreground">
          /aampersand/rules
          {query.map(([key, value], i) => (
            <span key={key}>
              <span className="text-foreground-muted">
                {i === 0 ? "?" : "&"}
                {key}=
              </span>
              <span className="font-semibold text-accent">{value}</span>
            </span>
          ))}
        </code>
        <span
          aria-live="polite"
          data-rules-status
          className={`font-mono text-[11px] font-semibold ${
            visibleCount ? "text-accent-success" : "text-foreground-muted"
          }`}
        >
          {visibleCount
            ? `200 OK · ${visibleCount} ${visibleCount === 1 ? "rule" : "rules"}`
            : "204 No Content"}
        </span>
      </div>

      <div className="grid items-start gap-x-3 gap-y-2.5 px-3 py-3 sm:grid-cols-[64px_1fr]">
        <span className="pt-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
          subject
        </span>
        <div role="group" aria-label="Filter rules by subject" className="flex flex-wrap gap-1.5">
          {subjects.map((s) =>
            chip("subject", s.value, s.label, subjectCount(s.value), filters.subject === s.value, () =>
              update({ ...filters, subject: filters.subject === s.value ? null : s.value }),
            ),
          )}
        </div>

        <span className="pt-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
          month
        </span>
        <div role="group" aria-label="Filter rules by devlog month" className="flex flex-wrap gap-1.5">
          {months.map((m) =>
            chip(
              "month",
              m.value,
              m.label,
              monthCount(m.value),
              filters.month === m.value,
              () => update({ ...filters, month: filters.month === m.value ? null : m.value }),
              m.title,
            ),
          )}
        </div>
      </div>

      {active && (
        <div className="flex items-center justify-between gap-3 border-t border-border-card px-3 py-2 font-mono text-[11px] text-foreground-muted">
          <span>{visibleCount ? "Tap a chip again to drop it." : "No rules match both."}</span>
          <button type="button" onClick={() => update(NONE)} className="font-semibold text-accent hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
