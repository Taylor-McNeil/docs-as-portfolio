import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Callout } from "@/components/content/Callout";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { RandomRules, type RandomRuleCard } from "./RandomRules";
import { tagToneClasses, tagToneTextClasses } from "@/components/content/aampersandTones";
import {
  aampersandEntriesNewestFirst,
  aampersandEntryBySlug,
  aampersandEntryGroups,
  aampersandEntryHref,
  coverageLabel,
  type AampersandEntry,
} from "@/data/aampersandEntries";
import {
  aampersandRules,
  ruleHref,
  ruleRangeLabel,
  rulesForEntry,
} from "@/data/aampersandRules";
import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "aampersand",
  description:
    "Building aampersand, a writing tool for novelists: the systems behind it, the rules it taught me, and a monthly builder's journal.",
  alternates: {
    canonical: "https://taylormcneil.dev/aampersand",
  },
});

/**
 * Project status, shown in the right-hand response panel like the rest of the site.
 * CHECK BEFORE MERGE: update when the stage or version changes.
 */
const status = {
  stage: "friends & family",
  version: "0.2.0",
  next: "learning how to make marketing content on Threads",
  team: "just me",
};

/**
 * The engineering layer: each system, the problem that makes it hard, and the
 * devlog that tells its story. A devlog that isn't published yet is skipped.
 * VOICE PASS: descriptions.
 */
const systems: { path: string; name: string; problem: string; devlogs: string[] }[] = [
  {
    path: "/editor",
    name: "Manuscript editor",
    problem: "Parts, chapters, and scenes as structure, with annotations that survive every edit and an undo that agrees with the database.",
    devlogs: ["a-sirens-song", "peering-into-lethe"],
  },
  {
    path: "/graph",
    name: "Story graph",
    problem: "A story is a graph, with several systems layered on top of it: characters, places, plotlines, Sparks, and Etches, all read from the same connections.",
    devlogs: ["oily-bodies-in-karpathos", "a-sword-for-every-hand"],
  },
  {
    path: "/lab",
    name: "Visual planning",
    problem: "Several interactive views, from the Clothesline to the Lab's boards, drawn from the same story data.",
    devlogs: ["a-broken-astrolabe", "a-sword-for-every-hand"],
  },
  {
    path: "/sync",
    name: "Offline sync",
    problem: "A replay queue, ids made on the client, and a server that stays the source of truth.",
    devlogs: ["a-seed-of-intention"],
  },
  {
    path: "/import",
    name: "Manuscript import",
    problem: "Scrivener, Word, and Markdown turned into one structure, and shown to the writer before anything is saved.",
    devlogs: ["an-alphabet-too-short"],
  },
  {
    path: "/themes",
    name: "Design system",
    problem: "Rigid primitives and tokens, so components never decide their own look.",
    devlogs: ["a-broken-astrolabe"],
  },
  {
    path: "/qa",
    name: "Testing and release",
    problem: "Tests written as promises about what must stay true, with gates an agent has to pass before I review.",
    devlogs: ["a-tortoise-in-a-bronze-pot"],
  },
];

export default function AampersandPage() {
  const latestSlug = aampersandEntriesNewestFirst[0]?.slug;
  const groups = aampersandEntryGroups();
  const rulePool: RandomRuleCard[] = aampersandRules.map((rule) => {
    const entry = aampersandEntryBySlug(rule.entry);
    return {
      number: rule.number,
      rule: rule.rule,
      href: ruleHref(rule.number),
      postTitle: entry?.title,
      toneClass: entry ? tagToneTextClasses[entry.tagTone] : "text-accent",
    };
  });

  return (
    <div className="space-y-10">
      <ResponsePanel data={statusResponse()} />
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .aampersand-devlog-card {
            transition:
              box-shadow 260ms ease,
              transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .aampersand-devlog-card:hover,
          .aampersand-devlog-card:focus-visible {
            animation: aampersand-card-breathe 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
            box-shadow: 0 6px 18px rgb(0 0 0 / 0.08);
          }
        }

        @keyframes aampersand-card-breathe {
          0% {
            transform: translateY(0) scale(1);
          }
          45% {
            transform: translateY(-3px) scale(1.006);
          }
          100% {
            transform: translateY(-2px) scale(1.003);
          }
        }
      `}</style>

      {/* Layer 1: what aampersand is */}
      <header className="space-y-5">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" active size="md" />
          <span className="font-mono text-sm text-foreground-muted">/aampersand</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground-heading">aampersand</h1>
          <p className="text-lg font-semibold text-foreground">
            A book is a world written in lines. aampersand unfolds it.
          </p>
        </div>

        <div className="space-y-4 text-base leading-7 text-foreground-muted">
          <p>
            I&apos;m building a writing tool that treats your manuscript as a world to explore, not a
            document to organize. You write your prose, tag what matters, and the system unfolds your
            story across connected surfaces. Tag a murder weapon, and it leads you to the killer&apos;s
            arc, the plotline of the investigation, and the family tree that made it inevitable.
            Created by you in your prose, with your words. Your story, connected.
          </p>
          <p>
            The waitlist is over on{" "}
            <a
              href="https://www.aampersand.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-success hover:underline"
            >
              aampersand.com
            </a>
            . This section is my builder&apos;s journal: what I&apos;ve built, the rules it taught me,
            and a monthly devlog tracking the ideas, the architecture, the wrong turns, and the
            breakthroughs.
          </p>
        </div>
      </header>

      {/* Layer 2: what I built and why it's hard */}
      <section className="space-y-4 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground-heading">What I&apos;ve built</h2>
          <p className="text-sm text-foreground-muted">
            The systems underneath, what makes each one hard, and where I wrote about it.
          </p>
        </div>

        <div className="divide-y divide-border-card border border-border-card bg-surface-card">
          {systems.map((system) => (
            <SystemRow key={system.path} system={system} />
          ))}
        </div>
      </section>

      {/* The rules */}
      <section className="space-y-4 border-t border-border pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground-heading">The Rules</h2>
            {/* VOICE PASS */}
            <p className="text-sm text-foreground-muted">
              Building aampersand teaches me a lot, so I&apos;ve collected what I&apos;ve learned
              into rules. Here are a few at random.
            </p>
          </div>
          <Link
            href="/aampersand/rules"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-accent-success hover:underline"
          >
            all {aampersandRules.length} rules <ArrowRight size={12} />
          </Link>
        </div>

        <RandomRules rules={rulePool} />
      </section>

      {/* Layer 3: the builder's journal, newest first */}
      <section className="space-y-4 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground-heading">Builder&apos;s journal</h2>
          <p className="text-sm text-foreground-muted">
            {/* VOICE PASS */}
            These are some of my musings: long-form pieces on the technical side of building
            aampersand, what each one taught me, and the mistakes I made along the way.
          </p>
        </div>
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.season?.title ?? "latest"} className="space-y-4">
              {group.season && (
                <h3 className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">
                  {group.season.title}
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  <span className="font-normal normal-case tracking-normal">
                    {group.entries.length} devlogs
                  </span>
                </h3>
              )}
              {group.entries.map((devlog) => (
                <DevlogCard key={devlog.slug} devlog={devlog} isLatest={devlog.slug === latestSlug} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <Callout type="context" label="Note">
        <p>
          These are the builder&apos;s versions. The writer-facing devlogs, and aampersand itself,
          live at{" "}
          <a
            href="https://www.aampersand.com/devlog"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-success hover:underline"
          >
            aampersand.com/devlog
          </a>
          .
        </p>
      </Callout>
    </div>
  );
}

function statusResponse() {
  return {
    status: 200,
    data: {
      stage: status.stage,
      version: status.version,
      next: status.next,
      team: status.team,
      devlogs: aampersandEntriesNewestFirst.length,
      rules: aampersandRules.length,
    },
  };
}

function SystemRow({
  system,
}: {
  system: { path: string; name: string; problem: string; devlogs: string[] };
}) {
  const devlogs = system.devlogs
    .map((slug) => aampersandEntryBySlug(slug))
    .filter((entry): entry is AampersandEntry => Boolean(entry));

  return (
    <div className="grid gap-2 px-4 py-4 md:grid-cols-[180px_1fr] md:gap-6">
      <div className="space-y-1">
        <div className="font-mono text-xs text-method-get">{system.path}</div>
        <div className="text-sm font-semibold text-foreground-heading">{system.name}</div>
      </div>
      <div className="space-y-2">
        <p className="text-sm leading-6 text-foreground-muted">{system.problem}</p>
        {devlogs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {devlogs.map((entry) => (
              <Link
                key={entry.slug}
                href={aampersandEntryHref(entry)}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-semibold hover:underline ${tagToneClasses[entry.tagTone]}`}
              >
                {entry.title} <ArrowRight size={10} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DevlogCard({ devlog, isLatest = false }: { devlog: AampersandEntry; isLatest?: boolean }) {
  const rules = rulesForEntry(devlog.slug);
  const range = ruleRangeLabel(devlog.slug);

  return (
    <article className="aampersand-devlog-card group relative grid overflow-hidden border border-border-card bg-surface-card focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent md:grid-cols-[1fr_220px]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-bold text-foreground-heading">
            <Link href={aampersandEntryHref(devlog)} className="after:absolute after:inset-0 focus:outline-none">
              <span className="mr-2 font-mono text-xs font-normal text-foreground-muted">
                #{String(devlog.number).padStart(2, "0")}
              </span>
              {devlog.cardTitle}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
            {isLatest && <span className="mr-2 font-semibold text-accent">latest</span>}
            {coverageLabel(devlog.coverage)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">{devlog.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded px-2 py-1 font-mono text-[10px] font-semibold ${tagToneClasses[devlog.tagTone]}`}
          >
            {devlog.tag}
          </span>
          {rules.length > 0 && (
            <Link
              href={ruleHref(rules[0].number)}
              className="relative z-10 inline-flex rounded border border-border-card px-2 py-1 font-mono text-[10px] text-foreground-muted hover:border-accent hover:text-accent"
            >
              rules {range}
            </Link>
          )}
        </div>
      </div>
      <div className="min-h-32 border-t border-border-card bg-surface-terminal/60 p-4 md:border-l md:border-t-0">
        <Preview type={devlog.preview} />
      </div>
    </article>
  );
}

function Preview({ type }: { type: AampersandEntry["preview"] }) {
  switch (type) {
    case "default":
      return <DefaultPreview />;
    case "origin":
      return <OriginPreview />;
    case "thread":
      return <ThreadPreview />;
    case "clothesline":
      return <ClotheslinePreview />;
    case "graph":
      return <GraphPreview />;
    case "spark":
      return <SparkPreview />;
    case "queue":
      return <QueuePreview />;
    case "translation":
      return <TranslationPreview />;
    case "pot":
      return <PotPreview />;
  }
}

function DefaultPreview() {
  return (
    <div className="flex h-full items-center justify-center" aria-label="Devlog entry preview">
      <div className="grid w-full max-w-36 gap-2 font-mono text-[9px] text-foreground-muted">
        <span className="h-1.5 w-3/4 rounded bg-accent/60" />
        <span className="h-px w-full bg-border" />
        <span className="h-px w-5/6 bg-border" />
        <span className="h-px w-2/3 bg-border" />
      </div>
    </div>
  );
}

function PotPreview() {
  return (
    <div
      className="flex h-full min-h-24 flex-col items-center justify-center font-mono text-[10px] text-foreground-muted"
      aria-label="A bronze pot with its lid tilted open and one wisp of steam rising between a checkmark and an X"
    >
      <svg viewBox="0 0 120 92" className="h-20 w-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* one wisp of steam, a check on its left and an X on its right */}
        <path
          d="M47 47 C 41 41, 53 37, 47 31 C 42 26, 50 23, 48 19"
          className="stroke-foreground-muted/60"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />
        <path d="M8 24 L14 30 L25 17" className="stroke-accent-success" strokeWidth="3" />
        <path d="M99 18 L109 28 M109 18 L99 28" className="stroke-red-500 dark:stroke-red-400" strokeWidth="3" />
        {/* lid, hinged on the right rim and lifted on the left */}
        <g transform="rotate(24 90 50)">
          <path d="M52 50 Q 71 36 90 50 Z" className="fill-method-put/20 stroke-method-put" strokeWidth="2" />
          <path d="M71 43 v-5" className="stroke-method-put" strokeWidth="2.5" />
        </g>
        {/* pot */}
        <path d="M30 52 H90" className="stroke-method-put" strokeWidth="2.5" />
        <path d="M33 52 C 31 70, 42 82, 60 82 C 78 82, 89 70, 87 52" className="fill-method-put/15 stroke-method-put" strokeWidth="2" />
        <path d="M33 56 C 26 56, 24 64, 31 66 M87 56 C 94 56, 96 64, 89 66" className="stroke-method-put" strokeWidth="2" />
        <path d="M46 82 L44 88 M74 82 L76 88" className="stroke-method-put" strokeWidth="2" />
        <path d="M40 64 H80" className="stroke-method-put/40" strokeWidth="1" />
      </svg>
      <p className="mt-2 text-center italic text-foreground-muted/70">ask what you know, keep what&apos;s true</p>
    </div>
  );
}

function TranslationPreview() {
  return (
    <div className="flex h-full min-h-24 items-center justify-center font-mono text-[10px] text-foreground-muted" aria-label="Scrivener binder, Word styles, and Markdown headings translate into parts, chapters, and scenes">
      <div className="w-full max-w-[180px]">
        <div className="space-y-1 border border-method-get/25 bg-surface-terminal px-3 py-2">
          {[
            [".scriv", "binder"],
            [".docx", "styles"],
            [".md", "#  ---"],
          ].map(([format, structure]) => (
            <div key={format} className="grid grid-cols-[60px_1fr] gap-2">
              <span className="text-method-get">{format}</span>
              <span className="whitespace-pre">{structure}</span>
            </div>
          ))}
        </div>
        <div className="py-1 text-center text-method-get" aria-hidden="true">↓</div>
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span className="text-method-patch">part</span>
          <span aria-hidden="true">▸</span>
          <span className="text-method-put">chapter</span>
          <span aria-hidden="true">▸</span>
          <span className="text-method-get">scene</span>
        </div>
        <p className="mt-3 text-center italic text-foreground-muted/70">
          close enough is a book
        </p>
      </div>
    </div>
  );
}

function QueuePreview() {
  const rows = [
    {
      label: "chapter",
      fill: "w-5",
      tail: "░░",
      tone: "text-method-put",
      bar: "bg-method-put/70",
      rail: "bg-method-put/10 border-method-put/30",
      rule: "border-method-put/20",
    },
    {
      label: "scene",
      fill: "w-3",
      tail: "░░░",
      tone: "text-method-get",
      bar: "bg-method-get/70",
      rail: "bg-method-get/10 border-method-get/30",
      rule: "border-method-get/20",
    },
    {
      label: "spark",
      fill: "w-3",
      tail: "░░░",
      tone: "text-method-head",
      bar: "bg-method-head/70",
      rail: "bg-method-head/10 border-method-head/30",
      rule: "border-method-head/20",
    },
    {
      label: "prose",
      fill: "w-7",
      tail: "░",
      tone: "text-accent-success",
      bar: "bg-accent-success/75",
      rail: "bg-accent-success/10 border-accent-success/30",
      rule: "border-accent-success/20",
    },
  ];

  return (
    <div className="flex h-full min-h-24 flex-col justify-center font-mono text-[10px] text-foreground-muted">
      <div className="mx-auto w-full max-w-[164px] border border-[color:var(--color-callout-warn)]/25 bg-surface-terminal px-2 py-2">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center gap-2 ${index > 0 ? `border-t ${row.rule} pt-1` : ""} ${index < rows.length - 1 ? "pb-1" : ""}`}
          >
            <span className={`w-12 ${row.tone}`}>{row.label}</span>
            <span className={`flex h-2 w-8 overflow-hidden border ${row.rail}`}>
              <span className={`${row.bar} ${row.fill}`} />
            </span>
            <span className={`tracking-[-0.08em] ${row.tone} opacity-65`}>{row.tail}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-foreground-muted/55">replay</span>
          <span className="text-accent">&rarr;</span>
          <span className="text-accent font-semibold">server</span>
        </div>
      </div>
      <p className="mt-3 italic text-center text-foreground-muted/70">
        seeds in, truth out
      </p>
    </div>
  );
}

function SparkPreview() {
  const surfaces: { surface: string; color: "get" | "put" | "patch" | "head" }[] = [
    { surface: "highlight", color: "patch" },
    { surface: "pin", color: "put" },
    { surface: "checkbox", color: "get" },
    { surface: "notification", color: "head" },
  ];

  const colorClassName = {
    get: "text-method-get",
    put: "text-method-put",
    patch: "text-method-patch",
    head: "text-method-head",
  } as const;

  return (
    <div className="flex h-full min-h-24 flex-col justify-center font-mono text-[10px] text-foreground-muted">
      <div className="space-y-1.5">
        {surfaces.map(({ surface, color }) => (
          <div key={surface} className="flex items-center gap-2">
            <Zap size={10} className="fill-method-put text-method-put" />
            <span className="text-foreground-muted/50">&rarr;</span>
            <span className={colorClassName[color]}>{surface}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 italic text-foreground-muted/70">
        same spark, different light
      </p>
    </div>
  );
}

function OriginPreview() {
  const lines = [
    "POV: Azim",
    "The Harbinger of Doom",
    "was about to be robbed",
    "again.",
    "",
    "Azim flicked his wrist,",
    "and obsidian dripped",
    "down his hand.",
  ];

  return (
    <div className="font-mono text-[9px] leading-5 text-foreground-muted">
      {lines.map((line, index) => (
        <div
          key={`${line}-${index}`}
          className={index > 0 && index < 4 ? "bg-method-put/10 text-method-put" : ""}
        >
          <span className="mr-3 text-foreground-muted/50">{index + 1}</span>
          {line || "\u00a0"}
        </div>
      ))}
    </div>
  );
}

function ThreadPreview() {
  return (
    <div className="flex h-full min-h-24 items-center justify-center">
      <div className="space-y-2 font-mono text-[9px] text-foreground-muted">
        <TaggedLine text='"obsidian dripped down..."' tag="etch" color="head" />
        <TaggedLine text='"Reid gets mugged"' tag="beat" color="put" />
        <TaggedLine text='"Ghazi watches..."' tag="foreshadow" color="put" />
        <TaggedLine text='"Reid lies during..."' tag="catalyst" color="head" />
        <TaggedLine text='"the necklace appears"' tag="clue" color="patch" />
      </div>
    </div>
  );
}

function TaggedLine({
  text,
  tag,
  color,
}: {
  text: string;
  tag: string;
  color: "head" | "put" | "patch";
}) {
  const tagClassName =
    color === "head"
      ? "bg-method-head/10 text-method-head"
      : color === "put"
        ? "bg-method-put/10 text-method-put"
        : "bg-method-patch/10 text-method-patch";

  return (
    <div className="flex items-center justify-end gap-2">
      <span>{text}</span>
      <span className={`rounded px-1.5 py-0.5 ${tagClassName}`}>{tag}</span>
    </div>
  );
}

function ClotheslinePreview() {
  return (
    <svg
      className="h-full min-h-28 w-full"
      viewBox="0 0 180 92"
      role="img"
      aria-label="Mini clothesline timeline with chapter markers and stacked plotline threads"
    >
      <line
        x1="12"
        y1="18"
        x2="168"
        y2="18"
        stroke="var(--color-foreground-muted)"
        strokeOpacity="0.45"
      />
      {[22, 49, 76, 103, 130, 157].map((x, index) => (
        <g key={x}>
          <circle
            cx={x}
            cy="18"
            r="3.3"
            fill="var(--color-foreground-muted)"
            fillOpacity="0.75"
          />
          <text
            x={x}
            y="30"
            textAnchor="middle"
            className="fill-foreground-muted font-mono text-[8px]"
          >
            {index === 0 ? "P" : index}
          </text>
        </g>
      ))}

      <rect x="11.5" y="39" width="21" height="5" fill="var(--color-edge-consequence)" />
      <rect x="11.5" y="47" width="21" height="5" fill="var(--color-edge-promise)" />
      <rect x="11.5" y="55" width="21" height="5" fill="var(--color-edge-clue)" />

      <rect x="38.5" y="39" width="21" height="5" fill="var(--color-edge-promise)" />
      <rect x="38.5" y="47" width="21" height="5" fill="var(--color-edge-consequence)" />

      <rect x="65.5" y="39" width="21" height="5" fill="var(--color-edge-character)" />
      <rect x="65.5" y="47" width="21" height="5" fill="var(--color-edge-promise)" />
      <rect x="65.5" y="55" width="21" height="5" fill="var(--color-edge-consequence)" />
      <rect x="65.5" y="63" width="21" height="5" fill="var(--color-edge-clue)" />

      <rect x="92.5" y="39" width="21" height="5" fill="var(--color-edge-clue)" />

      <rect x="119.5" y="39" width="21" height="5" fill="var(--color-edge-promise)" />
      <rect x="119.5" y="47" width="21" height="5" fill="var(--color-edge-consequence)" />

      <rect x="146.5" y="39" width="21" height="5" fill="var(--color-edge-character)" />
      <rect x="146.5" y="47" width="21" height="5" fill="var(--color-edge-promise)" />
      <rect x="146.5" y="55" width="21" height="5" fill="var(--color-edge-clue)" />
      <rect x="146.5" y="63" width="21" height="5" fill="var(--color-edge-consequence)" />

      <rect x="42" y="79" width="5" height="4" fill="var(--color-edge-consequence)" />
      <text x="50" y="83" className="fill-foreground-muted font-mono text-[8px]">
        recon.
      </text>
      <rect x="84" y="79" width="5" height="4" fill="var(--color-edge-promise)" />
      <text x="92" y="83" className="fill-foreground-muted font-mono text-[8px]">
        necklace
      </text>
      <rect x="134" y="79" width="5" height="4" fill="var(--color-edge-clue)" />
      <text x="142" y="83" className="fill-foreground-muted font-mono text-[8px]">
        ghazi
      </text>
    </svg>
  );
}

function GraphPreview() {
  return (
    <svg
      className="mx-auto h-full min-h-28 w-full max-w-44"
      viewBox="0 0 170 118"
      role="img"
      aria-label="Mini story graph connecting chapter nodes to character nodes"
    >
      <line x1="42" y1="32" x2="70" y2="76" stroke="var(--color-method-patch)" strokeOpacity="0.65" />
      <line x1="85" y1="32" x2="70" y2="76" stroke="var(--color-method-patch)" strokeOpacity="0.65" />
      <line x1="85" y1="32" x2="104" y2="76" stroke="var(--color-method-get)" strokeOpacity="0.65" />
      <line x1="128" y1="32" x2="104" y2="76" stroke="var(--color-method-get)" strokeOpacity="0.65" />
      <line x1="42" y1="32" x2="85" y2="32" stroke="var(--color-method-patch)" strokeOpacity="0.35" />
      <line x1="85" y1="32" x2="128" y2="32" stroke="var(--color-method-patch)" strokeOpacity="0.35" />

      <GraphNode x={42} y={32} label="Ch1" color="patch" />
      <GraphNode x={85} y={32} label="Ch3" color="patch" />
      <GraphNode x={128} y={32} label="Ch8" color="patch" />
      <GraphNode x={70} y={76} label="Azim" color="head" />
      <GraphNode x={104} y={76} label="Reid" color="get" />

      <text
        x="85"
        y="108"
        textAnchor="middle"
        className="fill-foreground-muted font-mono text-[9px] italic"
      >
        not a line — a graph
      </text>
    </svg>
  );
}

function GraphNode({
  x,
  y,
  label,
  color,
}: {
  x: number;
  y: number;
  label: string;
  color: "patch" | "head" | "get";
}) {
  const stroke =
    color === "patch"
      ? "var(--color-method-patch)"
      : color === "head"
        ? "var(--color-method-head)"
        : "var(--color-method-get)";

  return (
    <g>
      <circle cx={x} cy={y} r="16" fill="var(--color-surface-terminal)" />
      <circle cx={x} cy={y} r="16" fill={stroke} fillOpacity="0.18" stroke={stroke} />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className="font-mono text-[8px]"
        fill={stroke}
      >
        {label}
      </text>
    </g>
  );
}
