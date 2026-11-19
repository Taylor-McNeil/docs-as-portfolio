import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/content/JsonLd";
import { docSnapshotHref } from "@/data/docSnapshots";

const PAGE_URL = "https://taylormcneil.dev/professional-work";
const DESCRIPTION =
  "A selection of published technical documentation covering AI agents, SDK integrations, application development, and developer architecture.";

export const metadata = {
  title: "Selected Documentation",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Selected Documentation | Taylor McNeil",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Taylor McNeil",
    type: "website",
  },
};

// Tag colors carry meaning, reusing the method color tokens the way the
// aampersand devlog cards do.
type TagKind = "mongodb" | "ai" | "framework";

const tagKinds: Record<TagKind, { label: string; className: string }> = {
  mongodb: { label: "MongoDB", className: "bg-method-post/10 text-method-post" },
  ai: { label: "AI & agent tooling", className: "bg-method-patch/10 text-method-patch" },
  framework: { label: "Application framework", className: "bg-method-get/10 text-method-get" },
};

interface DocLink {
  href: string;
  label: string;
  external?: boolean;
}

interface DocSample {
  title: string;
  type: string;
  description: string;
  tags: { label: string; kind: TagKind }[];
  contribution?: string;
  links: DocLink[];
}

const READ_ON_MONGODB = "Read on mongodb.com";
const snapshotLink = (slug: string): DocLink => ({
  href: docSnapshotHref(slug),
  label: "Read the archived snapshot",
});

const samples: DocSample[] = [
  {
    title: "Claude Agent SDK",
    type: "Integration Documentation",
    description:
      "Documentation for integrating MongoDB-backed persistence with Claude Agent SDK workflows, covering setup, session management, and operational considerations.",
    tags: [
      { label: "Claude Agent SDK", kind: "ai" },
      { label: "MongoDB Atlas", kind: "mongodb" },
    ],
    contribution: "Authored the integration documentation.",
    links: [
      {
        href: "https://www.mongodb.com/docs/atlas/ai-integrations/claude-agent-sdk/#std-label-claude-agent-sdk",
        label: READ_ON_MONGODB,
        external: true,
      },
      snapshotLink("claude-agent-sdk"),
    ],
  },
  {
    title: "DeepAgents Virtual File System",
    type: "Integration Documentation",
    description:
      "Documentation explaining how MongoDB integrates with DeepAgents to support file storage, retrieval, and indexing across multiple services.",
    tags: [
      { label: "DeepAgents", kind: "ai" },
      { label: "LangChain", kind: "ai" },
      { label: "MongoDB Atlas", kind: "mongodb" },
    ],
    contribution: "Authored the DeepAgents virtual file system integration section.",
    links: [
      {
        href: "https://www.mongodb.com/docs/atlas/ai-integrations/langchain/#deepagents-virtual-file-system",
        label: READ_ON_MONGODB,
        external: true,
      },
      snapshotLink("deepagents-virtual-file-system"),
    ],
  },
  {
    title: "Agent Memory",
    type: "Conceptual Documentation",
    description:
      "Documentation explaining agent memory models, including short-term and long-term memory and the architectural concepts supporting stateful AI applications.",
    tags: [
      { label: "AI agents", kind: "ai" },
      { label: "MongoDB", kind: "mongodb" },
    ],
    contribution: "Authored the agent memory conceptual documentation.",
    links: [
      {
        href: "https://www.mongodb.com/docs/agentengine/add-features/memory-types/?client=python",
        label: READ_ON_MONGODB,
        external: true,
      },
      snapshotLink("agent-memory"),
    ],
  },
  {
    title: "MongoDB + TanStack Start",
    type: "Tutorial and Case Study",
    description:
      "Full-stack application integration tutorial accompanied by a technical writing retrospective discussing documentation design, developer learning, and maintainability.",
    tags: [
      { label: "TanStack Start", kind: "framework" },
      { label: "MongoDB Atlas", kind: "mongodb" },
    ],
    links: [
      { href: "/professional-work/tutorials/mongodb-tanstack", label: "Read the tutorial" },
      {
        href: "/professional-work/tutorials/mongodb-tanstack#retrospective",
        label: "Jump to the retrospective",
      },
    ],
  },
];

function Tag({ label, kind }: { label: string; kind: TagKind }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 font-mono text-[10px] font-semibold ${tagKinds[kind].className}`}
    >
      {label}
    </span>
  );
}

const linkClass = "inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline";

function SampleLink({ link }: { link: DocLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {link.label}
        <ExternalLink size={14} aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {link.label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

function SampleCard({ sample }: { sample: DocSample }) {
  return (
    <article className="border border-border-card bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-bold text-foreground-heading">{sample.title}</h3>
        <span className="shrink-0 font-mono text-[10px] text-foreground-muted">{sample.type}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-foreground-muted">{sample.description}</p>
      {sample.contribution && (
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          <span className="font-semibold text-foreground">Contribution:</span> {sample.contribution}
        </p>
      )}
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
        {sample.tags.map((tag) => (
          <li key={tag.label}>
            <Tag {...tag} />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border-card pt-4">
        {sample.links.map((link) => (
          <SampleLink key={link.href} link={link} />
        ))}
      </div>
    </article>
  );
}

export default function SelectedDocumentationPage() {
  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Selected Documentation",
          description: DESCRIPTION,
          url: PAGE_URL,
          author: { "@type": "Person", name: "Taylor McNeil" },
        }}
      />

      <PageHeader method="GET" endpoint="/professional-work" title="Selected Documentation" />

      <section className="space-y-4 text-base leading-7 text-foreground-muted">
        <p>{DESCRIPTION}</p>
        <p>
          Each MongoDB sample links to the live page and to an archived snapshot saved here, so the writing
          stays readable even after the published docs change.
        </p>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground-heading">Published Documentation</h2>
          <ul className="flex flex-wrap gap-2" aria-label="Tag colors">
            {(Object.keys(tagKinds) as TagKind[]).map((kind) => (
              <li key={kind}>
                <Tag label={tagKinds[kind].label} kind={kind} />
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          {samples.map((sample) => (
            <SampleCard key={sample.title} sample={sample} />
          ))}
        </div>
      </section>
    </div>
  );
}
