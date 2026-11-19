import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { Archive, ArrowLeft, ExternalLink } from "lucide-react";
import { useMDXComponents as siteMdxComponents } from "@/mdx-components";
import { PageHeader } from "@/components/content/PageHeader";
import { AnchorSidebar } from "@/components/layout/AnchorSidebar";
import { extractToc, slugifyHeading } from "@/lib/entry-headings";
import { docSnapshotHref, docSnapshots, type DocSnapshot } from "@/data/docSnapshots";

export const dynamicParams = false;

export function generateStaticParams() {
  return docSnapshots.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

function findSnapshot(slug: string): DocSnapshot | undefined {
  return docSnapshots.find((snapshot) => snapshot.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const snapshot = findSnapshot((await params).slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.title} (Snapshot)`,
    description: `An archived copy of “${snapshot.title}” from the MongoDB documentation, captured ${formatDate(snapshot.capturedAt)}.`,
    // The live page on mongodb.com is the original; this copy stays out of search.
    alternates: { canonical: snapshot.sourceUrl },
    robots: { index: false, follow: true },
  };
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// The export opens with MongoDB site navigation ("This page location" and an
// llms.txt pointer) and the page title. Drop those: the page header renders
// the title, and the navigation only makes sense on mongodb.com.
function snapshotBody(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line === "" || line.startsWith("> This page location") || line.startsWith("> For the complete MongoDB documentation index")) {
      index += 1;
      continue;
    }
    if (/^#{1,2}\s/.test(line)) index += 1;
    break;
  }
  return lines.slice(index).join("\n");
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export default async function DocSnapshotPage({ params }: Props) {
  const snapshot = findSnapshot((await params).slug);
  if (!snapshot) notFound();

  const raw = readFileSync(join(process.cwd(), "src", "content", "doc-snapshots", snapshot.file), "utf8");
  const body = snapshotBody(raw);
  const sha256 = createHash("sha256").update(raw).digest("hex");
  const captured = formatDate(snapshot.capturedAt);
  const toc = extractToc(body).filter((item) => !item.duplicate);

  const { default: Content } = await evaluate(body, {
    ...runtime,
    format: "md",
    remarkPlugins: [remarkGfm],
  });

  const site = siteMdxComponents({});
  const components = {
    ...site,
    // Derive heading IDs from rendered text so they match the "On this page" list,
    // including headings that contain inline code.
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 id={slugifyHeading(textOf(children))} className="text-2xl font-bold text-foreground-heading mt-10 mb-4 scroll-mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 id={slugifyHeading(textOf(children))} className="text-xl font-semibold text-foreground-heading mt-8 mb-3 scroll-mt-6">
        {children}
      </h3>
    ),
  };

  return (
    <div className="space-y-8">
      {toc.length > 0 && <AnchorSidebar items={toc} />}

      <Link
        href="/professional-work"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-accent"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Selected Documentation
      </Link>

      <PageHeader method="GET" endpoint={docSnapshotHref(snapshot.slug)} title={snapshot.title} />

      <aside
        aria-label="About this snapshot"
        className="rounded-lg border border-border-card bg-surface-card p-5 text-sm leading-relaxed text-foreground"
      >
        <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
          <Archive size={12} aria-hidden="true" />
          Archived snapshot · {captured}
        </p>
        <p className="mt-3">
          This is a fully rendered copy of the page as it appeared on mongodb.com on {captured}, saved as a snapshot.
          The live documentation may have changed since.
          {snapshot.section && (
            <> It includes only the “{snapshot.title}” section of “{snapshot.section},” which is the part I wrote.</>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <a
            href={snapshot.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
          >
            Read the current version on mongodb.com
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a
            href={snapshot.markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
          >
            Source Markdown
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <p className="mt-4 text-xs text-foreground-muted">© MongoDB, Inc. Reproduced as a writing sample.</p>
        <p className="mt-1 break-all font-mono text-[10px] text-foreground-muted" title="SHA-256 of the saved Markdown export">
          sha256:{sha256}
        </p>
      </aside>

      <article>
        <Content components={components} />
      </article>
    </div>
  );
}
