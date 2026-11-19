import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import { tagToneClasses, tagToneTextClasses } from "@/components/content/aampersandTones";
import { aampersandEntryHref, coverageLabel } from "@/data/aampersandEntries";
import {
  aampersandRules,
  ruleAnchor,
  ruleGroups,
  ruleSourceHref,
  ruleSubjects,
  subjectSlug,
  type AampersandRule,
  type RuleGroup,
} from "@/data/aampersandRules";
import { RulesFilter } from "./RulesFilter";
import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "The Rules — aampersand Builder Journal",
  description:
    "The numbered lessons from building aampersand, a writing tool for novelists, each linked to the devlog it came from.",
  alternates: {
    canonical: "https://taylormcneil.dev/aampersand/rules",
  },
});

export default function AampersandRulesPage() {
  const groups = ruleGroups();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" active size="md" />
          <span className="font-mono text-sm text-foreground-muted">/aampersand/rules</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground-heading">The Rules</h1>
          {/* VOICE PASS: intro copy */}
          <p className="text-lg font-semibold text-foreground">
            Building aampersand has taught me a lot about building software, because it touches
            so many different systems.
          </p>
        </div>
        <p className="text-base leading-7 text-foreground-muted">
          In the time I&apos;ve spent on it, I&apos;ve worked on the editor, the canvas and the UI
          around them; on databases, data modeling, sync and the backend; on infrastructure,
          DevOps, releases and performance; on sign-in, payments and analytics; on importing and
          exporting manuscripts; on testing, and on the agents that help me build; and on design,
          product, onboarding and even marketing.
        </p>
        <p className="text-base leading-7 text-foreground-muted">
          These are the {aampersandRules.length} things I&apos;ve learned from all of it, numbered
          in the order I learned them. Filter by subject or by the month I learned them, or open
          one to see what I was doing at the time, the line where I wrote it down, and why it
          stuck.
        </p>
      </header>

      <RulesFilter
        subjects={ruleSubjects().map(({ value, label }) => ({ value, label }))}
        months={groups
          .filter((group) => group.entry)
          .map((group) => ({
            value: group.entry!.coverage.start,
            slug: group.slug,
            label: coverageLabel(group.entry!.coverage),
            title: group.entry!.title,
          }))}
        rules={aampersandRules.map((rule) => ({
          number: rule.number,
          subject: subjectSlug(rule.domain),
          group: rule.entry,
        }))}
      />

      <div className="space-y-10">
        {groups.map((group) => (
          <RuleGroupSection key={group.slug} group={group} />
        ))}
      </div>
    </div>
  );
}

function RuleGroupSection({ group }: { group: RuleGroup }) {
  const { entry, rules } = group;
  const tone = entry?.tagTone ?? "purple";
  const first = rules[0]?.number;
  const last = rules[rules.length - 1]?.number;

  return (
    <section
      id={group.slug}
      data-rule-group={group.slug}
      data-rule-month={entry?.coverage.start}
      className="scroll-mt-6 space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] text-foreground-muted">
          {entry ? coverageLabel(entry.coverage) : ""}
        </span>
        <h2 className="text-lg font-bold text-foreground-heading">
          {entry ? (
            <Link href={aampersandEntryHref(entry)} className="hover:text-accent hover:underline">
              {entry.title}
            </Link>
          ) : (
            group.slug
          )}
        </h2>
        {entry && (
          <span
            className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${tagToneClasses[entry.tagTone]}`}
          >
            {entry.tag}
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-foreground-muted">
          {first === last ? `#${first}` : `#${first}–${last}`}
        </span>
      </div>

      <ol className="divide-y divide-border-card overflow-hidden border border-border-card bg-surface-card">
        {rules.map((rule) => (
          <RuleRow key={rule.number} rule={rule} toneText={tagToneTextClasses[tone]} postTitle={entry?.title} />
        ))}
      </ol>
    </section>
  );
}

function RuleRow({
  rule,
  toneText,
  postTitle,
}: {
  rule: AampersandRule;
  toneText: string;
  postTitle?: string;
}) {
  const source = ruleSourceHref(rule);

  return (
    <li
      id={ruleAnchor(rule.number)}
      data-rule
      data-subject={subjectSlug(rule.domain)}
      className="scroll-mt-6"
    >
      <details name="aampersand-rules" className="group/rule">
        <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-3.5 transition-colors hover:bg-surface-terminal/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
          <span className={`w-8 shrink-0 pt-0.5 text-right font-mono text-sm font-semibold ${toneText}`}>
            {String(rule.number).padStart(2, "0")}
          </span>
          <span className="flex flex-1 flex-col items-start gap-1.5">
            <span className="text-base font-semibold leading-6 text-foreground-heading">
              {rule.rule}
            </span>
            <span
              data-subject-tag={subjectSlug(rule.domain)}
              title={`Show every ${rule.domain} rule`}
              className="rounded border border-border-card px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-foreground-muted transition-colors hover:border-accent hover:text-accent"
            >
              {rule.domain}
            </span>
          </span>
          <ChevronRight
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-foreground-muted transition-transform duration-200 group-open/rule:rotate-90"
          />
        </summary>

        <dl className="grid gap-x-6 gap-y-3 border-t border-border-card bg-surface-terminal/60 px-4 py-4 pl-16 text-sm leading-6 sm:grid-cols-[130px_1fr]">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted sm:pt-1">
            Where I learned it
          </dt>
          <dd className="text-foreground">{rule.where}</dd>

          {rule.quote && (
            <>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted sm:pt-1">
                The line
              </dt>
              <dd>
                <blockquote className="border-l-2 border-accent/50 pl-3 italic text-foreground-muted">
                  &ldquo;{rule.quote}&rdquo;
                </blockquote>
              </dd>
            </>
          )}

          {rule.why && (
            <>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted sm:pt-1">
                Why it matters
              </dt>
              <dd className="text-foreground">{rule.why}</dd>
            </>
          )}

          <dt className="sr-only">Source</dt>
          <dd className="sm:col-start-2">
            {source ? (
              <a
                href={source}
                className="font-mono text-[11px] font-semibold text-accent-success hover:underline"
              >
                Read it in context: {rule.section ? `${rule.section}, ` : ""}
                {postTitle} &rarr;
              </a>
            ) : (
              <span className="font-mono text-[11px] text-foreground-muted">
                Link coming when {postTitle ?? "the post"} is published
              </span>
            )}
          </dd>
        </dl>
      </details>
    </li>
  );
}
