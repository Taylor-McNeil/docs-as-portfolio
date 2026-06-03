import Link from "next/link";
import { Zap } from "lucide-react";
import { Callout } from "@/components/content/Callout";
import { MethodBadge } from "@/components/navigation/MethodBadge";

export const metadata = {
  title: "aampersand",
  description:
    "A builder's journal for aampersand, a writing tool that helps fiction writers unfold the shape of their story.",
  alternates: {
    canonical: "https://taylormcneil.dev/aampersand",
  },
};

type Devlog = {
  href: string;
  title: string;
  date: string;
  description: string;
  tag: string;
  tagClassName: string;
  preview: "origin" | "thread" | "clothesline" | "graph" | "spark";
};

const devlogs: Devlog[] = [
  {
    href: "/aampersand/a-sirens-song",
    title: "What if Icarus Had Sunscreen?",
    date: "Jan 2026",
    description:
      "The origin. A seven-book series, a missing character, and the question that started everything: why can't I see my own story?",
    tag: "origin",
    tagClassName: "bg-method-patch/10 text-method-patch",
    preview: "origin",
  },
  {
    href: "/aampersand/peering-into-lethe",
    title: "Red Thread, Isle Eight",
    date: "Feb 2026",
    description:
      'Tagging as structural concept. How annotations survive the edit and turning decorations into navigation.',
    tag: "tagging",
    tagClassName: "bg-method-get/10 text-method-get",
    preview: "thread",
  },
  {
    href: "/aampersand/a-broken-astrolabe",
    title: "Stranded in Crete",
    date: "Mar 2026",
    description:
      "The Clothesline emerges. Plotlines visualized as colored threads across chapters. And the discovery that beats aren't all created equal.",
    tag: "clothesline",
    tagClassName: "bg-method-put/10 text-method-put",
    preview: "clothesline",
  },
  {
    href: "/aampersand/oily-bodies-in-karpathos",
    title: "Oily Bodies In Karpathos",
    date: "Apr 2026",
    description:
      "Sparks and Etches. The annotation graph. The discovery that stories aren't just linear. They are also graphs.",
    tag: "breakthrough",
    tagClassName: "bg-method-head/10 text-method-head",
    preview: "graph",
  },
  {
    href: "/aampersand/a-sword-for-every-hand",
    title: "A Sword for Every Hand",
    date: "May 2026",
    description:
      "Validation of a product. One demo, five writers, unlimited requests.",
    tag: "validation",
    tagClassName: "bg-method-post/10 text-method-post",
    preview: "spark",
  },
];

export default function AampersandPage() {
  return (
    <div className="space-y-8">
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
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" active size="md" />
          <span className="font-mono text-sm text-foreground-muted">
            /aampersand
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground-heading">
            aampersand
          </h1>
          <p className="text-lg font-semibold text-foreground">
            A book is a world written in lines. aampersand unfolds it.
          </p>
        </div>
      </header>

      <section className="space-y-4 text-base leading-7 text-foreground-muted">
        <p>
          I&apos;m building a writing tool that treats your manuscript as a world to
          explore, not a document to organize. You write your prose, tag what
          matters, and the system unfolds your story across connected surfaces.
          Tag a murder weapon, and it leads you to the killer&apos;s arc, the
          plotline of the investigation, and the family tree that made it
          inevitable. Created by you in your prose, with your words. Your story,
          connected.
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
          . This section is my builder&apos;s journal: a monthly devlog tracking the
          ideas, the architecture, the wrong turns, and the breakthroughs.
        </p>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-xl font-bold text-foreground-heading">Devlog</h2>
        <div className="space-y-4">
          {devlogs.map((devlog) => (
            <DevlogCard key={devlog.href} devlog={devlog} />
          ))}
        </div>
      </section>

      <Callout type="context" label="Note">
        <p>
          Each devlog here is the builder&apos;s version: architecture, decisions,
          wrong turns. The writer-facing versions live at{" "}
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

function DevlogCard({ devlog }: { devlog: Devlog }) {
  return (
    <Link
      href={devlog.href}
      className="aampersand-devlog-card group grid overflow-hidden border border-border-card bg-surface-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:grid-cols-[1fr_220px]"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-bold text-foreground-heading">
            {devlog.title}
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
            {devlog.date}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          {devlog.description}
        </p>
        <span
          className={`mt-4 inline-flex rounded px-2 py-1 font-mono text-[10px] font-semibold ${devlog.tagClassName}`}
        >
          {devlog.tag}
        </span>
      </div>
      <div className="min-h-32 border-t border-border-card bg-surface-terminal/60 p-4 md:border-l md:border-t-0">
        <Preview type={devlog.preview} />
      </div>
    </Link>
  );
}

function Preview({ type }: { type: Devlog["preview"] }) {
  switch (type) {
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
  }
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
