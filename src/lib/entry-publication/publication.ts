import "server-only";

import { compile } from "@mdx-js/mdx";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import remarkGfm from "remark-gfm";
import {
  coverageLabel,
  type AampersandEntry,
  type AampersandPreview,
  type AampersandTagTone,
} from "@/data/aampersandEntries";
import type {
  DevlogPublicationDraft,
  PublicationChange,
  PublicationIssue,
  PublicationPlan,
  RepositoryEntryDraft,
} from "./types";

const ROUTE_ROOT = "src/app/aampersand";
const ENTRIES_FILE = "src/data/aampersandEntries.json";
const LLMS_FILE = "public/llms.txt";
const GENERATED_MARKER = "entry-editor:generated";

const PREVIEWS = new Set<AampersandPreview>([
  "default", "origin", "thread", "clothesline", "graph", "spark", "queue",
]);
const TAG_TONES = new Set<AampersandTagTone>(["purple", "blue", "yellow", "pink", "green", "warning"]);

const COMPONENT_IMPORTS: Record<string, { path: string; imported?: string }> = {
  AnnotatedMermaid: { path: "@/components/content/AnnotatedMermaid" },
  AlertTriangle: { path: "lucide-react" },
  AnatomyOfABeat: { path: "@/components/content/AnatomyOfABeat" },
  BreadcrumbPill: { path: "@/components/content/BreadcrumbPill" },
  Callout: { path: "@/components/content/Callout" },
  Card: { path: "@/components/content/Card" },
  CardGroup: { path: "@/components/content/Card" },
  CodeBlock: { path: "@/components/content/CodeBlock" },
  ComponentRegistry: { path: "@/components/interactive/LiveComponentRegistry", imported: "LiveComponentRegistry" },
  ContrastCallout: { path: "@/components/content/ContrastCallout" },
  DevlogCallout: { path: "@/components/content/DevlogCallout" },
  DevlogCTA: { path: "@/components/content/DevlogCTA" },
  DiagramFigure: { path: "@/components/content/DiagramFigure" },
  EmphasizedText: { path: "@/components/content/EmphasizedText" },
  ExternalLink: { path: "lucide-react" },
  FeatureCard: { path: "@/components/content/FeatureCard" },
  FeatureCardGroup: { path: "@/components/content/FeatureCard" },
  Figure: { path: "@/components/content/Figure" },
  FooterTeaser: { path: "@/components/content/FooterTeaser" },
  Ghost: { path: "lucide-react" },
  HeroQuote: { path: "@/components/content/HeroQuote" },
  LayoutDiagram: { path: "@/components/content/LayoutDiagram" },
  LiveComponentRegistry: { path: "@/components/interactive/LiveComponentRegistry" },
  Mermaid: { path: "@/components/content/Mermaid" },
  MySpaceCustomizer: { path: "@/components/interactive/MySpaceCustomizer" },
  SceneBreak: { path: "@/components/content/SceneBreak" },
  StoryGraph: { path: "@/components/interactive/story-graph" },
  WriterRestoreDemo: { path: "@/components/content/WriterRestoreDemo" },
  Zap: { path: "lucide-react" },
};

function repoRoot(): string {
  return process.env.ENTRY_EDITOR_REPO_ROOT ?? process.cwd();
}

function safeRepoPath(relative: string): string {
  const root = repoRoot();
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Resolved path is outside the repository.");
  }
  return resolved;
}

async function maybeRead(relative: string): Promise<string | null> {
  try {
    return await readFile(safeRepoPath(relative), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function hashParts(parts: Array<string | null>): string {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part ?? "<missing>").update("\0");
  return hash.digest("hex");
}

function routeFiles(slug: string) {
  const root = `${ROUTE_ROOT}/${slug}`;
  return {
    page: `${root}/page.mdx`,
    layout: `${root}/layout.tsx`,
    ogImage: `${root}/opengraph-image.png`,
  };
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function headings(source: string): Array<{ id: string; label: string }> {
  const items: Array<{ id: string; label: string }> = [];
  let inFence = false;
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const label = match[1].replace(/\s+#+\s*$/, "").replace(/[`*_~]/g, "").trim();
    const id = slugifyHeading(label);
    if (id) items.push({ id, label });
  }
  return items;
}

function usedComponents(source: string): string[] {
  return [...new Set([...source.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]))];
}

function renderImports(source: string): string {
  const grouped = new Map<string, string[]>();
  for (const component of usedComponents(source)) {
    const definition = COMPONENT_IMPORTS[component];
    if (!definition) continue;
    const name = definition.imported ? `${definition.imported} as ${component}` : component;
    grouped.set(definition.path, [...(grouped.get(definition.path) ?? []), name]);
  }
  return [...grouped.entries()]
    .map(([modulePath, names]) => `import { ${names.sort().join(", ")} } from ${JSON.stringify(modulePath)};`)
    .join("\n");
}

function renderPage(draft: DevlogPublicationDraft): string {
  const { publication } = draft.settings;
  const canonical = `https://taylormcneil.dev/aampersand/${publication.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: publication.jsonLdHeadline,
    datePublished: publication.publishedAt,
    author: { "@type": "Person", name: "Taylor McNeil" },
    url: canonical,
  };
  const optionalImports = renderImports(draft.source);
  const imports = [
    'import { GuideHeader } from "@/components/content/GuideHeader";',
    'import { AnchorSidebar } from "@/components/layout/AnchorSidebar";',
    'import { JsonLd } from "@/components/content/JsonLd";',
    optionalImports,
  ].filter(Boolean).join("\n");

  return `${imports}

{/* ${GENERATED_MARKER} */}

<JsonLd data={${JSON.stringify(jsonLd, null, 2)}} />

<GuideHeader
  title={${JSON.stringify(draft.settings.title)}}
  description={${JSON.stringify(draft.settings.description)}}
  method="PUT"
  endpoint={${JSON.stringify(`/aampersand/${publication.slug}`)}}
  mdxPath={${JSON.stringify(`${ROUTE_ROOT}/${publication.slug}/page.mdx`)}}
/>

<AnchorSidebar items={${JSON.stringify(headings(draft.source), null, 2)}} />

${draft.source.trim()}
`;
}

function renderLayout(draft: DevlogPublicationDraft): string {
  const { publication } = draft.settings;
  const canonical = `https://taylormcneil.dev/aampersand/${publication.slug}`;
  const socialDescription = publication.socialDescription.trim() || draft.settings.description.trim();
  return `// ${GENERATED_MARKER}
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: ${JSON.stringify(publication.seoTitle)},
  description: ${JSON.stringify(draft.settings.description)},
  alternates: { canonical: ${JSON.stringify(canonical)} },
  openGraph: {
    title: ${JSON.stringify(draft.settings.title)},
    description: ${JSON.stringify(socialDescription)},
    type: "article",
    url: ${JSON.stringify(canonical)},
    images: [{ url: ${JSON.stringify(`${canonical}/opengraph-image.png`)}, width: 1200, height: 630, alt: ${JSON.stringify(draft.settings.title)} }],
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(draft.settings.title)},
    description: ${JSON.stringify(socialDescription)},
    images: [${JSON.stringify(`${canonical}/opengraph-image.png`)}],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
`;
}

function parseEntries(source: string): AampersandEntry[] {
  const value = JSON.parse(source) as unknown;
  if (!Array.isArray(value)) throw new Error("The aampersand entry registry is not an array.");
  return value as AampersandEntry[];
}

function publicationEntry(draft: DevlogPublicationDraft): AampersandEntry {
  const { publication } = draft.settings;
  return {
    number: publication.number,
    slug: publication.slug,
    title: draft.settings.title.trim(),
    cardTitle: publication.cardTitle.trim() || draft.settings.title.trim(),
    coverage: publication.coverage,
    description: publication.cardDescription.trim() || draft.settings.description.trim(),
    tag: publication.tag.trim(),
    tagTone: publication.tagTone,
    preview: publication.preview,
    llmsDescription: publication.llmsDescription.trim() || publication.cardDescription.trim() || draft.settings.description.trim(),
  };
}

function updateEntries(source: string, draft: DevlogPublicationDraft): string {
  const entries = parseEntries(source);
  const next = publicationEntry(draft);
  const existing = entries.findIndex((entry) => entry.slug === next.slug);
  if (existing >= 0 && JSON.stringify(entries[existing]) === JSON.stringify(next)) return source;
  if (existing >= 0) entries[existing] = next;
  else entries.push(next);
  entries.sort((a, b) => a.number - b.number);
  return `${JSON.stringify(entries, null, 2)}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateLlms(source: string, draft: DevlogPublicationDraft): string {
  const entry = publicationEntry(draft);
  const url = `https://taylormcneil.dev/aampersand/${entry.slug}`;
  const line = `- [${entry.title} (${coverageLabel(entry.coverage)})](${url}): ${entry.llmsDescription}`;
  const existing = new RegExp(`^- \\[.*?\\]\\(${escapeRegExp(url)}\\):.*$`, "m");
  if (existing.test(source)) return source.replace(existing, line);
  const sectionStart = source.indexOf("## aampersand (Building in Public)");
  if (sectionStart < 0) throw new Error("Could not find the aampersand section in llms.txt.");
  const nextSection = source.indexOf("\n## ", sectionStart + 1);
  const insertion = nextSection < 0 ? source.length : nextSection;
  return `${source.slice(0, insertion).trimEnd()}\n${line}\n\n${source.slice(insertion).trimStart()}`;
}

function required(value: string, field: string, label: string, issues: PublicationIssue[]) {
  if (!value.trim()) issues.push({ severity: "error", code: "required", field, message: `${label} is required.` });
}

function validCalendarMonth(value: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return Boolean(match && Number(match[2]) >= 1 && Number(match[2]) <= 12);
}

function validateDraft(draft: DevlogPublicationDraft, entries: AampersandEntry[]): PublicationIssue[] {
  const issues: PublicationIssue[] = [];
  const { publication } = draft.settings;
  required(draft.settings.title, "title", "Title", issues);
  required(draft.settings.description, "description", "SEO description", issues);
  required(publication.slug, "slug", "Slug", issues);
  required(publication.seoTitle, "seoTitle", "SEO title", issues);
  required(publication.jsonLdHeadline, "jsonLdHeadline", "JSON-LD headline", issues);
  required(publication.cardDescription, "cardDescription", "Index-card description", issues);
  required(publication.tag, "tag", "Index tag", issues);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(publication.slug)) {
    issues.push({ severity: "error", code: "invalid-slug", field: "slug", message: "Slug may contain lowercase letters, numbers, and single hyphens only." });
  }
  if (!validCalendarMonth(publication.coverage.start) || !validCalendarMonth(publication.coverage.end)) {
    issues.push({ severity: "error", code: "invalid-coverage", field: "coverage", message: "Coverage must use valid calendar months." });
  } else if (publication.coverage.start > publication.coverage.end) {
    issues.push({ severity: "error", code: "coverage-order", field: "coverage.end", message: "Coverage end cannot be before coverage start." });
  }
  if (!Number.isInteger(publication.number) || publication.number < 1) {
    issues.push({ severity: "error", code: "invalid-number", field: "number", message: "Devlog number must be a positive whole number." });
  }
  const published = /^\d{4}-\d{2}-\d{2}$/.test(publication.publishedAt)
    ? new Date(`${publication.publishedAt}T00:00:00Z`)
    : null;
  if (!published || Number.isNaN(published.valueOf()) || published.toISOString().slice(0, 10) !== publication.publishedAt) {
    issues.push({ severity: "error", code: "invalid-date", field: "publishedAt", message: "Publication date must be a valid calendar date." });
  }
  if (!PREVIEWS.has(publication.preview)) {
    issues.push({ severity: "error", code: "invalid-preview", field: "preview", message: "Select a supported index preview." });
  }
  if (!TAG_TONES.has(publication.tagTone)) {
    issues.push({ severity: "error", code: "invalid-tag-tone", field: "tagTone", message: "Select a supported tag color." });
  }
  const numberConflict = entries.find((entry) => entry.number === publication.number && entry.slug !== publication.slug);
  if (numberConflict) {
    issues.push({ severity: "error", code: "duplicate-number", field: "number", message: `Devlog #${publication.number} already belongs to /aampersand/${numberConflict.slug}.` });
  }
  const seen = new Set<string>();
  for (const item of headings(draft.source)) {
    if (seen.has(item.id)) issues.push({ severity: "error", code: "duplicate-heading", field: "source", message: `Duplicate heading ID “${item.id}”.` });
    seen.add(item.id);
  }
  if (/^\s*(?:import|export)\s/m.test(draft.source)) {
    issues.push({ severity: "error", code: "body-module-syntax", field: "source", message: "Body MDX cannot contain imports or exports; publication generates imports automatically." });
  }
  for (const component of usedComponents(draft.source)) {
    if (!COMPONENT_IMPORTS[component]) {
      issues.push({ severity: "error", code: "unsupported-component", field: "source", message: `${component} is not supported by the publication generator.` });
    }
  }
  if (!draft.source.trim()) issues.push({ severity: "error", code: "empty-body", field: "source", message: "The entry body is empty." });
  return issues;
}

async function repositoryIssues(draft: DevlogPublicationDraft): Promise<PublicationIssue[]> {
  const issues: PublicationIssue[] = [];
  const files = routeFiles(draft.settings.publication.slug);
  const page = await maybeRead(files.page);
  const layout = await maybeRead(files.layout);
  const repository = draft.repository;
  const isLoadedRoute = repository?.originalSlug === draft.settings.publication.slug;
  if (repository && !isLoadedRoute) {
    issues.push({ severity: "error", code: "repository-slug-change", field: "slug", message: "Existing entries cannot be renamed in the editor yet. Keep the published slug unchanged." });
  }
  if (((page && !page.includes(GENERATED_MARKER)) || (layout && !layout.includes(GENERATED_MARKER))) && !isLoadedRoute) {
    issues.push({ severity: "error", code: "manual-route-conflict", field: "slug", message: "This route exists but is not owned by the Entry Editor." });
  }
  if (repository && isLoadedRoute && repository.baseRevision !== await publicationRevision(repository.originalSlug)) {
    issues.push({ severity: "error", code: "stale-revision", message: "Repository files changed after this entry was opened. Reload the published entry before saving." });
  }
  try {
    const bytes = await readFile(safeRepoPath(files.ogImage));
    const isPng = bytes.length >= 24 && bytes.toString("ascii", 1, 4) === "PNG";
    if (!isPng) throw new Error("not-png");
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    const validDimensions = (width === 1200 && height === 630) || (width === 2400 && height === 1260);
    if (!validDimensions) {
      issues.push({ severity: "error", code: "og-dimensions", field: "ogImage", message: `Open Graph image is ${width}×${height}; expected 1200×630 or 2400×1260.` });
    }
  } catch {
    issues.push({ severity: "error", code: "missing-og", field: "ogImage", message: `Add a 1200×630 PNG at ${files.ogImage} before saving.` });
  }
  return issues;
}

async function publicationRevision(slug: string): Promise<string> {
  const files = routeFiles(slug);
  return hashParts(await Promise.all([
    maybeRead(files.page),
    maybeRead(files.layout),
    maybeRead(ENTRIES_FILE),
    maybeRead(LLMS_FILE),
  ]));
}

function removeSelfClosingBlock(source: string, component: string): string {
  const start = source.indexOf(`<${component}`);
  if (start < 0) return source;
  const end = source.indexOf("/>", start);
  if (end < 0) throw new Error(`The published entry's ${component} block is incomplete.`);
  return `${source.slice(0, start)}${source.slice(end + 2)}`;
}

function bodyFromPage(source: string): string {
  let body = source.replace(/^import\s+[^\n]+\n/gm, "");
  body = body.replace(/\{\/\*\s*entry-editor:generated\s*\*\/\}/g, "");
  for (const component of ["JsonLd", "GuideHeader", "AnchorSidebar"]) {
    body = removeSelfClosingBlock(body, component);
  }
  return body.replace(/\n{3,}/g, "\n\n").trim();
}

function quotedProperties(source: string, property: string): string[] {
  const pattern = new RegExp(`${property}\\s*:\\s*("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`, "g");
  return [...source.matchAll(pattern)].flatMap((match) => {
    const quoted = match[1];
    if (quoted.startsWith('"')) {
      try {
        return [JSON.parse(quoted) as string];
      } catch {
        return [];
      }
    }
    return [quoted.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\")];
  });
}

function jsonLdValue(source: string, property: string): string | undefined {
  const pattern = new RegExp(`"${property}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`);
  const match = pattern.exec(source);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as string;
  } catch {
    return undefined;
  }
}

export async function loadRepositoryEntry(slug: string): Promise<RepositoryEntryDraft> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid entry slug.");
  const entriesSource = await maybeRead(ENTRIES_FILE);
  if (entriesSource === null) throw new Error("The aampersand entry registry is missing.");
  const entry = parseEntries(entriesSource).find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error("Published entry not found.");

  const files = routeFiles(slug);
  const [page, layout] = await Promise.all([maybeRead(files.page), maybeRead(files.layout)]);
  if (page === null || layout === null) throw new Error("Published entry files are incomplete.");
  const descriptions = quotedProperties(layout, "description");
  const titles = quotedProperties(layout, "title");
  const publishedAt = jsonLdValue(page, "datePublished") ?? `${entry.coverage.end}-01`;
  const headline = jsonLdValue(page, "headline") ?? `${entry.title} — aampersand Technical Devlog #${entry.number}`;

  return {
    version: 2,
    source: bodyFromPage(page),
    settings: {
      title: entry.title,
      description: descriptions[0] ?? entry.description,
      publication: {
        slug: entry.slug,
        coverage: entry.coverage,
        number: entry.number,
        seoTitle: titles[0] ?? `${entry.title} — aampersand Builder Journal`,
        socialDescription: descriptions[1] ?? descriptions[0] ?? entry.description,
        jsonLdHeadline: headline,
        publishedAt,
        cardTitle: entry.cardTitle,
        cardDescription: entry.description,
        tag: entry.tag,
        tagTone: entry.tagTone,
        preview: entry.preview,
        llmsDescription: entry.llmsDescription,
      },
    },
    repository: {
      originalSlug: slug,
      baseRevision: await publicationRevision(slug),
      ownership: page.includes(GENERATED_MARKER) && layout.includes(GENERATED_MARKER) ? "generated" : "manual",
    },
  };
}

export async function planPublication(draft: DevlogPublicationDraft): Promise<PublicationPlan> {
  const entriesBefore = await maybeRead(ENTRIES_FILE);
  const llmsBefore = await maybeRead(LLMS_FILE);
  if (entriesBefore === null || llmsBefore === null) throw new Error("Publication registry files are missing.");
  const entries = parseEntries(entriesBefore);
  const issues = validateDraft(draft, entries);
  const files = routeFiles(draft.settings.publication.slug);
  const pageAfter = renderPage(draft);
  try {
    await compile(pageAfter, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    issues.push({ severity: "error", code: "mdx-compile", field: "source", message: error instanceof Error ? error.message : "The generated MDX page could not be compiled." });
  }
  issues.push(...await repositoryIssues(draft));

  const proposed: Array<[string, string]> = [
    [files.page, pageAfter],
    [files.layout, renderLayout(draft)],
    [ENTRIES_FILE, updateEntries(entriesBefore, draft)],
    [LLMS_FILE, updateLlms(llmsBefore, draft)],
  ];
  const changes: PublicationChange[] = [];
  for (const [relative, after] of proposed) {
    const before = await maybeRead(relative);
    if (before !== after) changes.push({ path: relative, kind: before === null ? "create" : "update", before, after });
  }
  return {
    revision: await publicationRevision(draft.settings.publication.slug),
    changes,
    issues,
  };
}

export async function applyPublication(draft: DevlogPublicationDraft, approvedRevision: string): Promise<{ revision: string }> {
  const plan = await planPublication(draft);
  if (plan.revision !== approvedRevision) throw new Error("The repository changed after review. Prepare the publication again.");
  if (plan.issues.some((issue) => issue.severity === "error")) throw new Error("Publication has blocking validation errors.");

  const snapshots = new Map<string, string | null>();
  const staged: Array<{ target: string; temp: string }> = [];
  try {
    for (const change of plan.changes) {
      const target = safeRepoPath(change.path);
      await mkdir(path.dirname(target), { recursive: true });
      snapshots.set(target, change.before);
      const temp = `${target}.entry-editor-${randomUUID()}.tmp`;
      await writeFile(temp, change.after, "utf8");
      staged.push({ target, temp });
    }
    for (const file of staged) await rename(file.temp, file.target);
  } catch (error) {
    await Promise.all(staged.map(async ({ target, temp }) => {
      await rm(temp, { force: true }).catch(() => undefined);
      const before = snapshots.get(target);
      if (before === null) await rm(target, { force: true }).catch(() => undefined);
      else if (typeof before === "string") await writeFile(target, before, "utf8").catch(() => undefined);
    }));
    throw error;
  }
  return { revision: await publicationRevision(draft.settings.publication.slug) };
}
