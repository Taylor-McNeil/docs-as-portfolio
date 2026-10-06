"use client";

import { Component, useMemo, type ErrorInfo, type ReactElement, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { AlertTriangle, ExternalLink, Ghost, Pencil, Zap } from "lucide-react";
import { Callout } from "@/components/content/Callout";
import { AnatomyOfABeat } from "@/components/content/AnatomyOfABeat";
import {
  AnnotatedMermaid,
  type AnnotatedMermaidProps,
} from "@/components/content/AnnotatedMermaid";
import { BreadcrumbPill } from "@/components/content/BreadcrumbPill";
import { Card, CardGroup } from "@/components/content/Card";
import { CodeBlock } from "@/components/content/CodeBlock";
import { ContrastCallout } from "@/components/content/ContrastCallout";
import { DevlogCallout } from "@/components/content/DevlogCallout";
import { DevlogCTA } from "@/components/content/DevlogCTA";
import { DiagramFigure } from "@/components/content/DiagramFigure";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { FeatureCard, FeatureCardGroup } from "@/components/content/FeatureCard";
import { Figure } from "@/components/content/Figure";
import { FooterTeaser } from "@/components/content/FooterTeaser";
import { HeroQuote } from "@/components/content/HeroQuote";
import { JsonLd } from "@/components/content/JsonLd";
import { LayoutDiagram } from "@/components/content/LayoutDiagram";
import { Mermaid } from "@/components/content/Mermaid";
import { SceneBreak } from "@/components/content/SceneBreak";
import { WriterRestoreDemo } from "@/components/content/WriterRestoreDemo";
import { JsonRenderer, type JsonValue } from "@/components/content/JsonRenderer";
import { MySpaceCustomizer } from "@/components/interactive/MySpaceCustomizer";
import { StoryGraph } from "@/components/interactive/story-graph";
import { GuideHeaderContent } from "@/components/content/GuideHeaderContent";
import {
  ComponentRegistry,
  type ComponentRegistrySources,
} from "@/components/interactive/ComponentRegistry";
import {
  parseMetadataValue,
  slugifyHeading,
  type EntrySettings,
  type MetadataRow,
} from "./entry-editor-utils";
import type { AnnotatedMermaidComposerValue } from "./annotated-mermaid-composer";

export function PreviewHeader({ settings }: { settings: EntrySettings }) {
  return <GuideHeaderContent {...settings} />;
}

export function ProjectMetadata({ rows }: { rows: MetadataRow[] }) {
  const data = useMemo<JsonValue>(() => {
    return Object.fromEntries(
      rows
        .filter((row) => row.key.trim())
        .map((row) => [row.key.trim(), parseMetadataValue(row.value)]),
    );
  }, [rows]);

  if (rows.every((row) => !row.key.trim())) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-border bg-surface-terminal font-mono">
      <div className="flex items-center justify-between border-b border-border bg-surface-card px-4 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">Response body</span>
        <span className="rounded bg-accent-success/10 px-1.5 py-0.5 text-[10px] text-accent-success">200 OK</span>
      </div>
      <div className="p-4 text-[11px] leading-relaxed">
        <JsonRenderer data={data} />
      </div>
    </section>
  );
}

export function createPreviewComponents(
  componentRegistrySources: ComponentRegistrySources,
  onEditAnnotatedMermaid?: (
    value: AnnotatedMermaidComposerValue,
    selectionStart: number,
    selectionEnd: number,
  ) => void,
): MDXComponents {
  const RegistryPreview = () => (
    <ComponentRegistry sources={componentRegistrySources} />
  );
  const EditableAnnotatedMermaid = ({
    __entryEditorSourceStart,
    __entryEditorSourceEnd,
    ...props
  }: AnnotatedMermaidProps & {
    __entryEditorSourceStart?: number;
    __entryEditorSourceEnd?: number;
  }) => {
    const canEdit = onEditAnnotatedMermaid &&
      typeof __entryEditorSourceStart === "number" &&
      typeof __entryEditorSourceEnd === "number";

    return (
      <div className="group relative my-6" data-entry-editor-annotated-mermaid>
        <AnnotatedMermaid {...props} className={`${props.className ?? ""} [&>figure]:!my-0`.trim()} />
        {canEdit && (
          <button
            type="button"
            aria-label={`Edit annotated diagram: ${props.label}`}
            onClick={() => onEditAnnotatedMermaid(
              { chart: props.chart, label: props.label, annotationSet: props.annotationSet },
              __entryEditorSourceStart,
              __entryEditorSourceEnd,
            )}
            className="absolute right-3 top-3 z-20 rounded-md border border-border bg-surface-bg/90 p-2 text-foreground-muted shadow-sm backdrop-blur transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
    );
  };

  return {
    h1: ({ children }) => <h1 className="mb-5 mt-10 text-3xl font-bold text-foreground-heading">{children}</h1>,
    h2: ({ children }) => {
      const id = slugifyHeading(String(children));
      return <h2 id={id} className="mb-4 mt-10 scroll-mt-6 text-2xl font-bold text-foreground-heading">{children}</h2>;
    },
    h3: ({ children }) => {
      const id = slugifyHeading(String(children));
      return <h3 id={id} className="mb-3 mt-8 scroll-mt-6 text-xl font-semibold text-foreground-heading">{children}</h3>;
    },
    p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground-muted">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-outside list-disc space-y-1 pl-5 text-foreground-muted">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-outside list-decimal space-y-4 pl-5 text-foreground-muted">{children}</ol>,
    li: ({ children }) => <li className="pl-1 [&>p]:mb-2">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    a: ({ href, children }) => <a href={href} className="text-accent hover:underline">{children}</a>,
    blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-border pl-5 italic text-foreground-muted">{children}</blockquote>,
    hr: () => (
      <div className="my-10 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs tracking-widest text-foreground-muted/40">~#~</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    ),
    table: ({ children }) => <div className="my-6 overflow-x-auto"><table className="w-full overflow-hidden rounded-lg border border-border text-sm">{children}</table></div>,
    thead: ({ children }) => <thead className="bg-surface-card text-foreground-heading">{children}</thead>,
    th: ({ children }) => <th className="border-b border-border px-4 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b border-border px-4 py-2 text-left text-foreground-muted">{children}</td>,
    pre: ({ children }) => {
      const codeElement = children as ReactElement<{ className?: string; children?: string }>;
      const className = codeElement?.props?.className ?? "";
      const code = codeElement?.props?.children ?? "";
      const match = className.match(/language-([^:]+)(?::(.+))?/);
      return <CodeBlock code={String(code).trim()} language={match?.[1]} filename={match?.[2]} />;
    },
    code: ({ className, children }) => className
      ? <code className={className}>{children}</code>
      : <code className="rounded bg-surface-card px-1.5 py-0.5 font-mono text-sm text-accent">{children}</code>,
    AlertTriangle,
    AnatomyOfABeat,
    AnnotatedMermaid: EditableAnnotatedMermaid,
    BreadcrumbPill,
    Callout,
    Card,
    CardGroup,
    CodeBlock,
    ComponentRegistry: RegistryPreview,
    ContrastCallout,
    DevlogCallout,
    DevlogCTA,
    DiagramFigure,
    EmphasizedText,
    ExternalLink,
    FeatureCard,
    FeatureCardGroup,
    Figure,
    FooterTeaser,
    Ghost,
    HeroQuote,
    JsonLd,
    LayoutDiagram,
    Mermaid,
    MySpaceCustomizer,
    SceneBreak,
    StoryGraph,
    WriterRestoreDemo,
    Zap,
    LiveComponentRegistry: RegistryPreview,
  };
}

export function findUnregisteredComponent(
  source: string,
  previewComponents: MDXComponents
): string | null {
  const registered = new Set(Object.keys(previewComponents));
  for (const match of source.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)) {
    if (!registered.has(match[1])) return match[1];
  }
  return null;
}

function annotatedMermaidTagEnd(source: string, start: number): number | null {
  let braceDepth = 0;
  let quote: "\"" | "'" | "`" | null = null;
  let escaped = false;

  for (let index = start; index < source.length - 1; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
    } else if (character === "{") {
      braceDepth += 1;
    } else if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
    } else if (character === "/" && source[index + 1] === ">" && braceDepth === 0) {
      return index + 2;
    }
  }

  return null;
}

function addAnnotatedMermaidSourceRanges(source: string): string {
  const tagName = "<AnnotatedMermaid";
  const parts: string[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf(tagName, cursor);
    if (start < 0) break;
    const end = annotatedMermaidTagEnd(source, start + tagName.length);
    if (end == null) break;
    parts.push(
      source.slice(cursor, start + tagName.length),
      ` __entryEditorSourceStart={${start}} __entryEditorSourceEnd={${end}}`,
      source.slice(start + tagName.length, end),
    );
    cursor = end;
  }

  if (parts.length === 0) return source;
  parts.push(source.slice(cursor));
  return parts.join("");
}

export function previewCompatibleSource(source: string): string {
  return addAnnotatedMermaidSourceRanges(source).replace(
    /\bicon=\{(AlertTriangle|Ghost)\}/g,
    "icon={(props) => <$1 {...props} />}",
  );
}

export class PreviewErrorBoundary extends Component<
  { children: ReactNode; onError: (error: Error) => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Entry Editor preview render failed", error, info);
    this.props.onError(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-method-put/50 bg-method-put/5 p-5 text-sm text-method-put">
          This preview could not render. Your MDX source is still safe in the editor.
        </div>
      );
    }
    return this.props.children;
  }
}

