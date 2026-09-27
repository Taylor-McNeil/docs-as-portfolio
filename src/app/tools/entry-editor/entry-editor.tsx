"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type ErrorInfo,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import mermaid from "mermaid";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import {
  AlertTriangle,
  BookOpen,
  Bold,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Code2,
  Columns2,
  Copy,
  Eye,
  ExternalLink,
  FileImage,
  FilePlus2,
  Ghost,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  ListTree,
  LoaderCircle,
  MessageSquareQuote,
  Minus,
  Moon,
  PanelLeft,
  PanelRight,
  Pencil,
  Pilcrow,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
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
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import {
  aampersandEntries,
  coverageLabel,
} from "@/data/aampersandEntries";
import type {
  DevlogPublicationDraft,
  DevlogPublicationSettings,
  PublicationPlan,
  RepositoryEntryDraft,
} from "@/lib/entry-publication/types";
import {
  ComponentRegistry,
  type ComponentRegistrySources,
} from "@/components/interactive/ComponentRegistry";
import {
  DEFAULT_DRAFTS,
  DEVLOG_LIBRARY_STORAGE_KEY,
  createDevlogWorkspaceDraft,
  draftStorageKey,
  extractToc,
  insertAtSelection,
  parseMetadataValue,
  readDraft,
  readDevlogDraftLibrary,
  slugifyHeading,
  type EntryDraft,
  type EntryKind,
  type EntryMethod,
  type EntrySettings,
  type EntryWorkspaceDraft,
  type MetadataRow,
} from "./entry-editor-utils";
import { EntrySourceEditor, type EntrySourceEditorHandle } from "./entry-source-editor";
import {
  AnnotatedMermaidComposer,
  type AnnotatedMermaidComposerValue,
} from "./annotated-mermaid-composer";
import {
  extractMermaidCharts,
  formatMermaidIssue,
  type MermaidIssue,
} from "./mermaid-diagnostics";

type LayoutMode = "split" | "editor" | "preview";
type PreviewTheme = "light" | "dark";
type DialogKind = "callout" | "figure" | "code" | "mermaid" | "diagram" | "layout" | "emphasis" | "card";

const ENTRY_LIBRARY_COLLAPSED_STORAGE_KEY = "ampersand:entry-editor:library-collapsed";

interface DialogState {
  kind: DialogKind;
  selectionStart: number;
  selectionEnd: number;
  selectedText: string;
}

interface SourceSelectionState {
  selectionStart: number;
  selectionEnd: number;
  selectedText: string;
}

interface AnnotationComposerState extends SourceSelectionState {
  initialValue?: AnnotatedMermaidComposerValue;
}

interface DialogValues {
  title: string;
  type: string;
  src: string;
  alt: string;
  caption: string;
  language: string;
  filename: string;
  content: string;
  color: string;
}

const METHODS: EntryMethod[] = ["GET", "POST", "PUT", "PATCH", "HEAD", "OPTIONS"];

const DIALOG_DEFAULTS: DialogValues = {
  title: "",
  type: "note",
  src: "/images/example.png",
  alt: "",
  caption: "",
  language: "typescript",
  filename: "",
  content: "",
  color: "orange",
};

const inputClass = "w-full rounded-md border border-border bg-surface-bg px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent";

function EditorTooltip({
  label,
  children,
  placement = "top",
  wrapperClassName = "",
}: {
  label: string;
  children: ReactNode;
  placement?: "top" | "bottom";
  wrapperClassName?: string;
}) {
  return (
    <span className={`group/editor-tooltip relative inline-flex ${wrapperClassName}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute left-1/2 z-[120] w-max max-w-56 -translate-x-1/2 rounded-md border border-border bg-surface-terminal px-2 py-1 text-center text-[11px] font-medium leading-tight text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/editor-tooltip:visible group-hover/editor-tooltip:opacity-100 group-focus-within/editor-tooltip:visible group-focus-within/editor-tooltip:opacity-100 ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
      >
        {label}
      </span>
    </span>
  );
}

function PreviewHeader({ settings }: { settings: EntrySettings }) {
  return (
    <header className="mb-6 mt-2 space-y-4">
      <div className="flex items-center gap-3">
        <MethodBadge method={settings.method} active size="md" />
        <span className="font-mono text-sm text-foreground-muted">{settings.endpoint}</span>
      </div>
      <h1 className="text-3xl font-bold leading-none text-foreground-heading">{settings.title}</h1>
      {settings.description && <p className="text-lg text-foreground-muted">{settings.description}</p>}
    </header>
  );
}

function ProjectMetadata({ rows }: { rows: MetadataRow[] }) {
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

function createPreviewComponents(
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

function findUnregisteredComponent(
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

function previewCompatibleSource(source: string): string {
  return addAnnotatedMermaidSourceRanges(source).replace(
    /\bicon=\{(AlertTriangle|Ghost)\}/g,
    "icon={(props) => <$1 {...props} />}",
  );
}

class PreviewErrorBoundary extends Component<
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

function ToolButton({ label, children, onClick, active = false }: { label: string; children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <EditorTooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active || undefined}
        className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded border px-2 text-xs transition hover:border-accent hover:text-foreground ${active ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-bg text-foreground-muted"}`}
      >
        {children}
      </button>
    </EditorTooltip>
  );
}

function PublicationDialog({
  plan,
  busy,
  onClose,
  onApply,
}: {
  plan: PublicationPlan;
  busy: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  const errors = plan.issues.filter((issue) => issue.severity === "error");
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="publication-title">
      <section className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-surface-sidebar shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">Repository review</p>
            <h2 id="publication-title" className="mt-1 text-xl font-semibold text-foreground-heading">Publish this devlog to the site</h2>
            <p className="mt-1 text-xs text-foreground-muted">Nothing is written until you confirm this exact plan.</p>
          </div>
          <EditorTooltip label="Close publication review">
            <button type="button" aria-label="Close publication review" className="rounded p-1 text-foreground-muted hover:bg-surface-card" onClick={onClose}><X size={18} /></button>
          </EditorTooltip>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {plan.issues.length > 0 && (
            <div className={`mb-4 space-y-1 rounded-lg border p-3 text-xs ${errors.length ? "border-method-put/50 bg-method-put/5 text-method-put" : "border-border bg-surface-card text-foreground-muted"}`}>
              {plan.issues.map((issue, index) => <p key={`${issue.code}-${index}`}><strong>{issue.severity === "error" ? "Error" : "Warning"}:</strong> {issue.message}</p>)}
            </div>
          )}
          <div className="space-y-3">
            {plan.changes.length === 0 ? (
              <p className="rounded-lg border border-border bg-surface-card p-4 text-sm text-foreground-muted">The repository already matches this draft.</p>
            ) : plan.changes.map((change) => (
              <details key={change.path} className="overflow-hidden rounded-lg border border-border bg-surface-bg" open>
                <summary className="cursor-pointer px-4 py-3 font-mono text-xs text-foreground-heading">
                  <span className={`mr-2 rounded px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase ${change.kind === "create" ? "bg-accent-success/10 text-accent-success" : "bg-accent/10 text-accent"}`}>{change.kind}</span>
                  {change.path}
                </summary>
                <div className="grid gap-px border-t border-border bg-border lg:grid-cols-2">
                  {change.before !== null && <section className="min-w-0 bg-surface-terminal p-3"><h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Before</h3><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-foreground-muted">{change.before}</pre></section>}
                  <section className="min-w-0 bg-surface-terminal p-3"><h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">After</h3><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-foreground">{change.after}</pre></section>
                </div>
              </details>
            ))}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-border p-4">
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm text-foreground-muted hover:bg-surface-card" onClick={onClose}>Keep editing</button>
          <button type="button" className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" disabled={busy || errors.length > 0 || plan.changes.length === 0} onClick={onApply}>
            <Save size={15} /> {busy ? "Saving…" : "Confirm and save"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function SettingsPanel({
  kind,
  settings,
  publication,
  disabled,
  onChange,
  onPublicationChange,
}: {
  kind: EntryKind;
  settings: EntrySettings;
  publication: DevlogPublicationSettings | null;
  disabled?: boolean;
  onChange: (settings: EntrySettings) => void;
  onPublicationChange: (publication: DevlogPublicationSettings) => void;
}) {
  const update = <K extends keyof EntrySettings>(key: K, value: EntrySettings[K]) => onChange({ ...settings, [key]: value });
  const updatePublication = <K extends keyof DevlogPublicationSettings>(key: K, value: DevlogPublicationSettings[K]) => {
    if (publication) onPublicationChange({ ...publication, [key]: value });
  };

  const updateRow = (id: string, patch: Partial<MetadataRow>) => {
    update("metadata", settings.metadata.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  return (
    <fieldset disabled={disabled} className="max-h-[48vh] shrink-0 overflow-y-auto border-b border-border bg-surface-sidebar/60 p-4 disabled:opacity-65">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-foreground-muted">
          Title
          <input className={`${inputClass} mt-1`} value={settings.title} onChange={(event) => update("title", event.target.value)} />
        </label>
        {kind === "devlog" && publication ? (
          <label className="text-xs font-medium text-foreground-muted">
            Slug
            <div className="mt-1 flex gap-2">
              <span className="flex items-center rounded-md border border-border bg-surface-card px-2 font-mono text-xs text-method-put">PUT</span>
              <input className={inputClass} value={publication.slug} onChange={(event) => updatePublication("slug", event.target.value)} />
            </div>
          </label>
        ) : (
          <label className="text-xs font-medium text-foreground-muted">
            Endpoint
            <div className="mt-1 flex gap-2">
              <select className="rounded-md border border-border bg-surface-bg px-2 text-xs text-foreground" value={settings.method} onChange={(event) => update("method", event.target.value as EntryMethod)}>
                {METHODS.map((method) => <option key={method}>{method}</option>)}
              </select>
              <input className={inputClass} value={settings.endpoint} onChange={(event) => update("endpoint", event.target.value)} />
            </div>
          </label>
        )}
        <label className="text-xs font-medium text-foreground-muted sm:col-span-2">
          {kind === "devlog" ? "SEO description" : "Description"}
          <input className={`${inputClass} mt-1`} value={settings.description} onChange={(event) => update("description", event.target.value)} />
        </label>
        {kind === "devlog" && publication && (
          <label className="text-xs font-medium text-foreground-muted sm:col-span-2">
            Index-card description <span className="font-normal opacity-60">(required for the aampersand listing)</span>
            <textarea
              rows={2}
              className={`${inputClass} mt-1 resize-y`}
              value={publication.cardDescription}
              onChange={(event) => updatePublication("cardDescription", event.target.value)}
            />
          </label>
        )}
      </div>

      {kind === "devlog" && publication && (
        <details className="mt-4 border-t border-border pt-3">
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            <span>Publication metadata</span>
            <span className="font-mono text-[10px] font-normal normal-case tracking-normal">{coverageLabel(publication.coverage)} · /aampersand/{publication.slug || "entry-slug"}</span>
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-foreground-muted">Coverage starts<input type="month" className={`${inputClass} mt-1`} value={publication.coverage.start} onChange={(event) => onPublicationChange({ ...publication, coverage: { ...publication.coverage, start: event.target.value } })} /></label>
            <label className="text-xs font-medium text-foreground-muted">Coverage ends<input type="month" className={`${inputClass} mt-1`} value={publication.coverage.end} onChange={(event) => onPublicationChange({ ...publication, coverage: { ...publication.coverage, end: event.target.value } })} /></label>
            <label className="text-xs font-medium text-foreground-muted">Devlog number<input type="number" min="1" className={`${inputClass} mt-1`} value={publication.number} onChange={(event) => updatePublication("number", Number(event.target.value))} /></label>
            <label className="text-xs font-medium text-foreground-muted">Publication date<input type="date" className={`${inputClass} mt-1`} value={publication.publishedAt} onChange={(event) => updatePublication("publishedAt", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted sm:col-span-2">SEO title<input className={`${inputClass} mt-1`} value={publication.seoTitle} onChange={(event) => updatePublication("seoTitle", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted sm:col-span-2">Social description <span className="font-normal opacity-60">(defaults to SEO description)</span><textarea rows={2} className={`${inputClass} mt-1 resize-y`} value={publication.socialDescription} onChange={(event) => updatePublication("socialDescription", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted sm:col-span-2">JSON-LD headline<input className={`${inputClass} mt-1`} value={publication.jsonLdHeadline} onChange={(event) => updatePublication("jsonLdHeadline", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted">Index-card title <span className="font-normal opacity-60">(defaults to title)</span><input className={`${inputClass} mt-1`} value={publication.cardTitle} onChange={(event) => updatePublication("cardTitle", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted">Index tag<input className={`${inputClass} mt-1`} value={publication.tag} onChange={(event) => updatePublication("tag", event.target.value)} /></label>
            <label className="text-xs font-medium text-foreground-muted">Tag color<select className={`${inputClass} mt-1`} value={publication.tagTone} onChange={(event) => updatePublication("tagTone", event.target.value as DevlogPublicationSettings["tagTone"])}>{["blue", "green", "purple", "yellow", "pink", "warning"].map((tone) => <option key={tone} value={tone}>{tone}</option>)}</select></label>
            <label className="text-xs font-medium text-foreground-muted">Card preview<select className={`${inputClass} mt-1`} value={publication.preview} onChange={(event) => updatePublication("preview", event.target.value as DevlogPublicationSettings["preview"])}>{["default", "origin", "thread", "clothesline", "graph", "spark", "queue"].map((preview) => <option key={preview} value={preview}>{preview}</option>)}</select></label>
            <label className="text-xs font-medium text-foreground-muted sm:col-span-2">LLM index description <span className="font-normal opacity-60">(defaults to index description)</span><textarea rows={2} className={`${inputClass} mt-1 resize-y`} value={publication.llmsDescription} onChange={(event) => updatePublication("llmsDescription", event.target.value)} /></label>
          </div>
          <div className="mt-3 grid gap-2 rounded-lg border border-border bg-surface-card/60 p-3 font-mono text-[10px] text-foreground-muted sm:grid-cols-2">
            <span>Coverage: {coverageLabel(publication.coverage)}</span>
            <span>Canonical: https://taylormcneil.dev/aampersand/{publication.slug || "entry-slug"}</span>
            <span>Route: src/app/aampersand/{publication.slug || "entry-slug"}</span>
            <span>OG: src/app/aampersand/{publication.slug || "entry-slug"}/opengraph-image.png</span>
          </div>
        </details>
      )}

      {kind === "project" && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Project metadata</span>
            <button
              type="button"
              onClick={() => update("metadata", [...settings.metadata, { id: crypto.randomUUID(), key: "", value: "" }])}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus size={12} /> Add row
            </button>
          </div>
          <div className="space-y-2">
            {settings.metadata.map((row) => (
              <div key={row.id} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] gap-2">
                <input aria-label="Metadata key" className={inputClass} placeholder="key" value={row.key} onChange={(event) => updateRow(row.id, { key: event.target.value })} />
                <input aria-label="Metadata value" className={inputClass} placeholder="value or comma-separated list" value={row.value} onChange={(event) => updateRow(row.id, { value: event.target.value })} />
                <EditorTooltip label="Remove metadata row">
                  <button type="button" aria-label="Remove metadata row" onClick={() => update("metadata", settings.metadata.filter((item) => item.id !== row.id))} className="rounded p-2 text-foreground-muted hover:bg-surface-card hover:text-method-put">
                    <Trash2 size={14} />
                  </button>
                </EditorTooltip>
              </div>
            ))}
          </div>
        </div>
      )}
    </fieldset>
  );
}

function InsertDialog({ state, onClose, onInsert }: { state: DialogState; onClose: () => void; onInsert: (values: DialogValues) => void }) {
  const [values, setValues] = useState<DialogValues>(() => ({ ...DIALOG_DEFAULTS, content: state.selectedText }));
  const set = (key: keyof DialogValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const titles: Record<DialogKind, string> = {
    callout: "Insert callout",
    figure: "Insert figure",
    code: "Insert code block",
    mermaid: "Insert Mermaid diagram",
    diagram: "Insert captioned Mermaid",
    layout: "Insert layout diagram",
    emphasis: "Insert emphasized text",
    card: "Insert project card",
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    onInsert(values);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-border bg-surface-sidebar p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground-heading">{titles[state.kind]}</h2>
          <EditorTooltip label="Close dialog">
            <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded p-1 text-foreground-muted hover:bg-surface-card"><X size={18} /></button>
          </EditorTooltip>
        </div>

        <div className="space-y-3">
          {state.kind === "callout" && <>
            <label className="block text-xs text-foreground-muted">Type<select className={`${inputClass} mt-1`} value={values.type} onChange={(event) => set("type", event.target.value)}>{["note", "warning", "tip", "context", "test", "celebration"].map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="block text-xs text-foreground-muted">Optional title<input className={`${inputClass} mt-1`} value={values.title} onChange={(event) => set("title", event.target.value)} /></label>
          </>}
          {state.kind === "figure" && <>
            <label className="block text-xs text-foreground-muted">Public image path<input className={`${inputClass} mt-1`} value={values.src} onChange={(event) => set("src", event.target.value)} /></label>
            <label className="block text-xs text-foreground-muted">Alt text<input required className={`${inputClass} mt-1`} value={values.alt} onChange={(event) => set("alt", event.target.value)} /></label>
            <label className="block text-xs text-foreground-muted">Caption<input className={`${inputClass} mt-1`} value={values.caption} onChange={(event) => set("caption", event.target.value)} /></label>
          </>}
          {state.kind === "code" && <>
            <label className="block text-xs text-foreground-muted">Language<input className={`${inputClass} mt-1`} value={values.language} onChange={(event) => set("language", event.target.value)} /></label>
            <label className="block text-xs text-foreground-muted">Filename<input className={`${inputClass} mt-1`} value={values.filename} onChange={(event) => set("filename", event.target.value)} /></label>
          </>}
          {state.kind === "layout" && <label className="block text-xs text-foreground-muted">Title<input required className={`${inputClass} mt-1`} value={values.title} onChange={(event) => set("title", event.target.value)} /></label>}
          {state.kind === "diagram" && <label className="block text-xs text-foreground-muted">Caption<input required className={`${inputClass} mt-1`} value={values.caption} onChange={(event) => set("caption", event.target.value)} /></label>}
          {state.kind === "emphasis" && <label className="block text-xs text-foreground-muted">Color<select className={`${inputClass} mt-1`} value={values.color} onChange={(event) => set("color", event.target.value)}>{["orange", "green", "blue", "purple", "pink", "yellow", "cyan"].map((color) => <option key={color}>{color}</option>)}</select></label>}
          {state.kind === "card" && <label className="block text-xs text-foreground-muted">Card title<input className={`${inputClass} mt-1`} value={values.title} onChange={(event) => set("title", event.target.value)} /></label>}

          {!["figure", "emphasis"].includes(state.kind) && (
            <label className="block text-xs text-foreground-muted">
              {state.kind === "mermaid" || state.kind === "diagram" ? "Mermaid chart" : state.kind === "layout" ? "Diagram text" : state.kind === "code" ? "Code" : "Content"}
              <textarea
                required
                rows={state.kind === "mermaid" || state.kind === "diagram" || state.kind === "code" || state.kind === "layout" ? 8 : 5}
                className={`${inputClass} mt-1 resize-y font-mono`}
                value={values.content}
                placeholder={state.kind === "mermaid" || state.kind === "diagram" ? "graph TD\n  A --> B" : "Write content here"}
                onChange={(event) => set("content", event.target.value)}
              />
            </label>
          )}
          {state.kind === "emphasis" && <label className="block text-xs text-foreground-muted">Content<input required className={`${inputClass} mt-1`} value={values.content} placeholder="Short emphasized statement" onChange={(event) => set("content", event.target.value)} /></label>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm text-foreground-muted hover:bg-surface-card">Cancel</button>
          <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Insert component</button>
        </div>
      </form>
    </div>
  );
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function dialogMarkup(kind: DialogKind, values: DialogValues): string {
  const content = values.content.trim();
  switch (kind) {
    case "callout":
      return `<Callout type="${values.type}"${values.title ? ` title="${escapeAttribute(values.title)}"` : ""}>\n${content}\n</Callout>`;
    case "figure":
      return `<Figure\n  src="${escapeAttribute(values.src)}"\n  alt="${escapeAttribute(values.alt)}"${values.caption ? `\n  caption="${escapeAttribute(values.caption)}"` : ""}\n/>`;
    case "code":
      return `\`\`\`${values.language}${values.filename ? `:${values.filename}` : ""}\n${content}\n\`\`\``;
    case "mermaid":
      return `<Mermaid chart={\`\n${content}\n\`} />`;
    case "diagram":
      return `<DiagramFigure caption={<>${values.caption}</>}>\n<Mermaid chart={\`\n${content}\n\`} />\n</DiagramFigure>`;
    case "layout":
      return `<LayoutDiagram title="${escapeAttribute(values.title)}">{\`\n${content}\n\`}</LayoutDiagram>`;
    case "emphasis":
      return `<EmphasizedText color="${values.color}">${content.replace(/\s*\n+\s*/g, " ")}</EmphasizedText>`;
    case "card":
      return `<Card${values.title ? ` title="${escapeAttribute(values.title)}"` : ""}>\n${content}\n</Card>`;
  }
}

function EntryToc({ items, previewRef }: { items: ReturnType<typeof extractToc>; previewRef: React.RefObject<HTMLDivElement | null> }) {
  if (!items.length) return <p className="p-4 text-xs text-foreground-muted">Add H2 or H3 headings to build the table of contents.</p>;

  return (
    <nav className="border-l border-border">
      {items.map((item, index) => (
        <button
          key={`${item.id}-${index}`}
          type="button"
          onClick={() => previewRef.current?.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className={`block w-full border-l py-1.5 text-left text-[11px] leading-relaxed transition ${item.level === 3 ? "pl-5" : "pl-3"} ${item.duplicate ? "border-method-put text-method-put" : "border-transparent text-foreground-muted hover:border-accent hover:text-foreground"}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function EntryLibrary({
  drafts,
  activeId,
  viewingSlug,
  loadingSlug,
  collapsed,
  onAdd,
  onToggle,
  onSelectDraft,
  onSelectPublished,
}: {
  drafts: EntryWorkspaceDraft[];
  activeId: string;
  viewingSlug: string | null;
  loadingSlug: string;
  collapsed: boolean;
  onAdd: () => void;
  onToggle: () => void;
  onSelectDraft: (id: string) => void;
  onSelectPublished: (slug: string) => void;
}) {
  return (
    <aside className={`hidden h-full shrink-0 flex-col border-r border-border bg-surface-terminal transition-[width] duration-200 md:flex ${collapsed ? "w-14" : "w-64"}`} aria-label="Entry library">
      {collapsed ? (
        <div className="flex justify-center border-b border-border p-2">
          <EditorTooltip label="Open entry library">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Open entry library"
              aria-expanded="false"
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-bg text-accent transition hover:border-accent hover:bg-surface-card"
            >
              <BookOpen size={16} />
              <ChevronRight size={10} className="absolute -right-0.5 -bottom-0.5 rounded-full bg-surface-terminal" />
            </button>
          </EditorTooltip>
        </div>
      ) : (
        <div className="border-b border-border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">AAMPERSAND</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse entry library"
              aria-expanded="true"
              className="flex min-w-0 items-center gap-2 rounded-md text-sm font-semibold text-foreground-heading transition hover:text-accent"
            >
              <BookOpen size={15} className="shrink-0 text-accent" />
              <span className="truncate">Entry library</span>
              <ChevronLeft size={13} className="shrink-0 text-foreground-muted" />
            </button>
            <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-md border border-border bg-surface-bg px-2 py-1.5 text-[11px] font-medium text-foreground-muted transition hover:border-accent hover:text-foreground">
              <FilePlus2 size={12} /> New
            </button>
          </div>
        </div>
      )}

      {!collapsed && <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-wider text-foreground-muted">Working drafts</p>
        <div className="space-y-1">
          {drafts.map((draft) => (
            <button
              key={draft.id}
              type="button"
              onClick={() => onSelectDraft(draft.id)}
              className={`block w-full rounded-md border px-2.5 py-2 text-left transition ${!viewingSlug && draft.id === activeId ? "border-accent bg-accent/10" : "border-transparent hover:border-border hover:bg-surface-card"}`}
            >
              <span className="block truncate text-xs font-medium text-foreground-heading">{draft.name}</span>
              <span className="mt-0.5 block truncate font-mono text-[9px] text-foreground-muted">
                {draft.repository ? `Edit · ${draft.repository.originalSlug}` : "Local draft"}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 px-2 pb-2 text-[9px] font-semibold uppercase tracking-wider text-foreground-muted">Published entries</p>
        <div className="space-y-1">
          {aampersandEntries.map((entry) => {
            const loading = loadingSlug === entry.slug;
            const selected = viewingSlug === entry.slug;
            return (
              <button
                key={entry.slug}
                type="button"
                disabled={loading}
                onClick={() => onSelectPublished(entry.slug)}
                className={`block w-full rounded-md border px-2.5 py-2 text-left transition disabled:cursor-wait ${selected ? "border-method-put bg-method-put/10" : "border-transparent hover:border-border hover:bg-surface-card"}`}
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-heading">
                  {loading && <LoaderCircle size={11} className="animate-spin" />}
                  <span className="truncate">{String(entry.number).padStart(2, "0")} · {entry.title}</span>
                </span>
                <span className="mt-0.5 block font-mono text-[9px] text-foreground-muted">{coverageLabel(entry.coverage)}</span>
              </button>
            );
          })}
        </div>
      </div>}
    </aside>
  );
}

export default function EntryEditor({
  componentRegistrySources,
}: {
  componentRegistrySources: ComponentRegistrySources;
}) {
  const [kind, setKind] = useState<EntryKind>("devlog");
  const [projectDraft, setProjectDraft] = useState<EntryDraft>(DEFAULT_DRAFTS.project);
  const [devlogDrafts, setDevlogDrafts] = useState<EntryWorkspaceDraft[]>([{
    ...DEFAULT_DRAFTS.devlog,
    id: "initial",
    name: DEFAULT_DRAFTS.devlog.settings.title,
    updatedAt: "",
  }]);
  const [activeDevlogId, setActiveDevlogId] = useState("initial");
  const [repositoryView, setRepositoryView] = useState<EntryWorkspaceDraft | null>(null);
  const [loadingEntrySlug, setLoadingEntrySlug] = useState("");
  const [entryLibraryCollapsed, setEntryLibraryCollapsed] = useState(false);
  const [restored, setRestored] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [editorWidth, setEditorWidth] = useState(46);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("dark");
  const [notice, setNotice] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [compileError, setCompileError] = useState<string>("");
  const [mermaidIssues, setMermaidIssues] = useState<Array<MermaidIssue & { diagram: number }>>([]);
  const [isCompiling, setIsCompiling] = useState(true);
  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [publicationPlan, setPublicationPlan] = useState<PublicationPlan | null>(null);
  const [publicationBusy, setPublicationBusy] = useState(false);
  const [PreviewContent, setPreviewContent] = useState<ComponentType<{ components?: MDXComponents }> | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [annotationComposer, setAnnotationComposer] = useState<AnnotationComposerState | null>(null);
  const sourceEditorRef = useRef<EntrySourceEditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ startX: number; width: number } | null>(null);

  const isViewingRepository = kind === "devlog" && repositoryView?.id === activeDevlogId;
  const activeDevlogDraft = isViewingRepository
    ? repositoryView
    : devlogDrafts.find((candidate) => candidate.id === activeDevlogId) ?? devlogDrafts[0] ?? {
        ...DEFAULT_DRAFTS.devlog,
        id: "fallback",
        name: DEFAULT_DRAFTS.devlog.settings.title,
        updatedAt: "",
      };
  const draft = kind === "devlog" ? activeDevlogDraft : projectDraft;
  const editAnnotatedMermaid = useCallback((
    initialValue: AnnotatedMermaidComposerValue,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    if (isViewingRepository) return;
    setAnnotationComposer({
      selectionStart,
      selectionEnd,
      selectedText: draft.source.slice(selectionStart, selectionEnd),
      initialValue,
    });
  }, [draft.source, isViewingRepository]);
  const previewComponents = useMemo(
    () => createPreviewComponents(
      componentRegistrySources,
      isViewingRepository ? undefined : editAnnotatedMermaid,
    ),
    [componentRegistrySources, editAnnotatedMermaid, isViewingRepository]
  );
  const toc = useMemo(() => extractToc(draft.source), [draft.source]);
  const previewSource = useMemo(() => previewCompatibleSource(draft.source), [draft.source]);
  const duplicates = toc.filter((item) => item.duplicate);

  const setDraft = useCallback((next: EntryDraft) => {
    if (kind === "project") {
      setProjectDraft(next);
      return;
    }
    if (isViewingRepository) return;
    setDevlogDrafts((current) => current.map((candidate) => candidate.id === activeDevlogId
      ? {
          ...candidate,
          ...next,
          name: next.settings.title,
          updatedAt: new Date().toISOString(),
        }
      : candidate));
  }, [activeDevlogId, isViewingRepository, kind]);

  const setSource = useCallback((source: string) => setDraft({ ...draft, source }), [draft, setDraft]);
  const setSettings = useCallback((settings: EntrySettings) => setDraft({ ...draft, settings }), [draft, setDraft]);
  const setPublication = useCallback((publication: DevlogPublicationSettings) => {
    setDraft({
      ...draft,
      publication,
      settings: {
        ...draft.settings,
        method: "PUT",
        endpoint: `/aampersand/${publication.slug}`,
      },
    });
  }, [draft, setDraft]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const library = readDevlogDraftLibrary();
      setDevlogDrafts(library.drafts);
      setActiveDevlogId(library.activeId);
      setProjectDraft(readDraft("project"));
      setEntryLibraryCollapsed(window.localStorage.getItem(ENTRY_LIBRARY_COLLAPSED_STORAGE_KEY) === "true");
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(DEVLOG_LIBRARY_STORAGE_KEY, JSON.stringify({
        version: 1,
        activeId: activeDevlogId,
        drafts: devlogDrafts,
      }));
      window.localStorage.setItem(draftStorageKey("project"), JSON.stringify(projectDraft));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [activeDevlogId, devlogDrafts, projectDraft, restored]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void (async () => {
        const issues: Array<MermaidIssue & { diagram: number }> = [];
        for (const { chart, diagram } of extractMermaidCharts(draft.source)) {
          try {
            await mermaid.parse(chart);
          } catch (error) {
            issues.push({ diagram, ...formatMermaidIssue(chart, error) });
          }
        }
        if (!cancelled) setMermaidIssues(issues);
      })();
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [draft.source]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsCompiling(true);
      try {
        const unregistered = findUnregisteredComponent(
          draft.source,
          previewComponents
        );
        if (unregistered) {
          throw new Error(`${unregistered} is not registered for preview. The source is preserved and can still be copied.`);
        }
        const result = await evaluate(previewSource, {
          ...runtime,
          remarkPlugins: [remarkGfm],
          development: false,
        });
        if (cancelled) return;
        setPreviewContent(() => result.default as ComponentType<{ components?: MDXComponents }>);
        setCompileError("");
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "The MDX preview could not be compiled.";
        const unknown = /Expected component `([^`]+)` to be defined/.exec(message)?.[1];
        setCompileError(unknown ? `${unknown} is not registered for preview. The source is preserved and can still be copied.` : message);
      } finally {
        if (!cancelled) setIsCompiling(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [draft.source, previewComponents, previewSource]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = ((event.clientX - resizeRef.current.startX) / window.innerWidth) * 100;
      setEditorWidth(Math.min(70, Math.max(30, resizeRef.current.width + delta)));
    };
    const up = () => {
      resizeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  async function loadPublishedEntry(slug: string) {
    setKind("devlog");
    setLoadingEntrySlug(slug);
    setNotice("");
    try {
      const response = await fetch(`/api/tools/entry-editor/publication?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load the published entry.");
      const loaded = result as RepositoryEntryDraft;
      const view: EntryWorkspaceDraft = {
        version: loaded.version,
        id: `view:${slug}`,
        name: loaded.settings.title,
        updatedAt: new Date().toISOString(),
        source: loaded.source,
        repository: loaded.repository,
        publication: loaded.settings.publication,
        settings: {
          title: loaded.settings.title,
          description: loaded.settings.description,
          method: "PUT",
          endpoint: `/aampersand/${loaded.settings.publication.slug}`,
          metadata: [],
        },
      };
      setRepositoryView(view);
      setActiveDevlogId(view.id);
      setPublicationPlan(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load the published entry.");
    } finally {
      setLoadingEntrySlug("");
    }
  }

  function selectLocalDraft(id: string) {
    setKind("devlog");
    setRepositoryView(null);
    setActiveDevlogId(id);
    setPublicationPlan(null);
    setNotice("");
  }

  function addDevlogDraft() {
    const next = createDevlogWorkspaceDraft();
    setDevlogDrafts((current) => [next, ...current]);
    setRepositoryView(null);
    setActiveDevlogId(next.id);
    setKind("devlog");
    setPublicationPlan(null);
    setNotice("New local draft created.");
  }

  function promoteRepositoryEntry() {
    if (!repositoryView?.repository) return;
    const existing = devlogDrafts.find((candidate) =>
      candidate.repository?.originalSlug === repositoryView.repository?.originalSlug
    );
    if (existing) {
      setRepositoryView(null);
      setActiveDevlogId(existing.id);
      setNotice("Opened the existing local draft for this entry.");
      return;
    }

    const promoted: EntryWorkspaceDraft = {
      ...repositoryView,
      id: createDevlogWorkspaceDraft().id,
      name: repositoryView.settings.title,
      updatedAt: new Date().toISOString(),
    };
    setDevlogDrafts((current) => [promoted, ...current]);
    setRepositoryView(null);
    setActiveDevlogId(promoted.id);
    setNotice(repositoryView.repository.ownership === "manual"
      ? "Editable draft created. The first save will show the hand-authored page migration for review."
      : "Editable local draft created from the published entry.");
  }

  function replaceSelection(before: string, after = "", fallback = "") {
    const editor = sourceEditorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const result = insertAtSelection(draft.source, selection.from, selection.to, before, after, fallback);
    editor.replaceRange(
      selection.from,
      selection.to,
      result.source.slice(selection.from, result.source.length - (draft.source.length - selection.to)),
      result.selectionStart,
      result.selectionEnd,
    );
  }

  function insertBlock(markup: string, selectionStart?: number, selectionEnd?: number) {
    const editor = sourceEditorRef.current;
    const selection = editor?.getSelection();
    const start = selectionStart ?? selection?.from ?? draft.source.length;
    const end = selectionEnd ?? selection?.to ?? start;
    const prefix = start > 0 && !draft.source.slice(0, start).endsWith("\n\n") ? "\n\n" : "";
    const suffix = end < draft.source.length && !draft.source.slice(end).startsWith("\n\n") ? "\n\n" : "";
    const insertion = `${prefix}${markup}${suffix}`;
    const caret = start + prefix.length + markup.length;
    editor?.replaceRange(start, end, insertion, caret, caret);
  }

  function openDialog(dialogKind: DialogKind) {
    const selection = sourceEditorRef.current?.getSelection();
    const selectionStart = selection?.from ?? draft.source.length;
    const selectionEnd = selection?.to ?? selectionStart;
    setDialog({ kind: dialogKind, selectionStart, selectionEnd, selectedText: draft.source.slice(selectionStart, selectionEnd) });
  }

  function openAnnotationComposer() {
    const selection = sourceEditorRef.current?.getSelection();
    const selectionStart = selection?.from ?? draft.source.length;
    const selectionEnd = selection?.to ?? selectionStart;
    setAnnotationComposer({
      selectionStart,
      selectionEnd,
      selectedText: draft.source.slice(selectionStart, selectionEnd),
    });
  }

  function handleDialogInsert(values: DialogValues) {
    if (!dialog) return;
    insertBlock(dialogMarkup(dialog.kind, values), dialog.selectionStart, dialog.selectionEnd);
    setDialog(null);
  }

  function handleAnnotatedMermaidInsert(markup: string) {
    if (!annotationComposer) return;
    insertBlock(markup, annotationComposer.selectionStart, annotationComposer.selectionEnd);
    setAnnotationComposer(null);
  }

  async function copySource() {
    await navigator.clipboard.writeText(draft.source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function publicationDraft(): DevlogPublicationDraft | null {
    if (kind !== "devlog" || !draft.publication) return null;
    return {
      source: draft.source,
      settings: {
        title: draft.settings.title,
        description: draft.settings.description,
        publication: draft.publication,
      },
      repository: draft.repository,
    };
  }

  async function preparePublication() {
    const payload = publicationDraft();
    if (!payload) return;
    setPublicationBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/tools/entry-editor/publication", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent: "plan", draft: payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not prepare publication changes.");
      setPublicationPlan(result as PublicationPlan);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not prepare publication changes.");
    } finally {
      setPublicationBusy(false);
    }
  }

  async function applyPublication() {
    const payload = publicationDraft();
    if (!payload || !publicationPlan) return;
    setPublicationBusy(true);
    try {
      const response = await fetch("/api/tools/entry-editor/publication", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent: "apply", draft: payload, revision: publicationPlan.revision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save publication files.");
      setDevlogDrafts((current) => current.map((candidate) => candidate.id === activeDevlogId
        ? {
            ...candidate,
            repository: {
              originalSlug: payload.settings.publication.slug,
              baseRevision: result.revision as string,
              ownership: "generated" as const,
            },
            updatedAt: new Date().toISOString(),
          }
        : candidate));
      setPublicationPlan(null);
      setNotice("Saved to the repository. Review, test, and commit the generated changes when ready.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save publication files.");
    } finally {
      setPublicationBusy(false);
    }
  }

  function resetDraft() {
    if (isViewingRepository) return;
    if (!window.confirm(`Reset the ${kind === "devlog" ? "Devlog" : "General Project"} draft? This cannot be undone.`)) return;
    const clean = structuredClone(DEFAULT_DRAFTS[kind]);
    if (kind === "devlog") {
      setDevlogDrafts((current) => current.map((candidate) => candidate.id === activeDevlogId
        ? { ...clean, id: candidate.id, name: clean.settings.title, updatedAt: new Date().toISOString() }
        : candidate));
    } else {
      setProjectDraft(clean);
      window.localStorage.removeItem(draftStorageKey("project"));
    }
    setNotice("Draft reset.");
  }

  function toggleEntryLibrary() {
    setEntryLibraryCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(ENTRY_LIBRARY_COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }

  const paneStyle = { "--editor-width": `${editorWidth}%` } as CSSProperties;

  return (
    <div className="flex h-screen min-h-[680px] overflow-hidden bg-surface-bg text-foreground" style={paneStyle}>
      {kind === "devlog" && (
        <EntryLibrary
          drafts={devlogDrafts}
          activeId={activeDevlogId}
          viewingSlug={isViewingRepository ? repositoryView?.repository?.originalSlug ?? null : null}
          loadingSlug={loadingEntrySlug}
          collapsed={entryLibraryCollapsed}
          onAdd={addDevlogDraft}
          onToggle={toggleEntryLibrary}
          onSelectDraft={selectLocalDraft}
          onSelectPublished={loadPublishedEntry}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-sidebar px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Sparkles size={17} /></div>
          <div>
            <h1 className="text-sm font-bold text-foreground-heading">Entry Editor</h1>
            <p className="text-[10px] text-foreground-muted">Local MDX authoring workbench</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-bg p-1" aria-label="Entry type">
          {(["devlog", "project"] as EntryKind[]).map((entryKind) => (
            <button key={entryKind} type="button" onClick={() => setKind(entryKind)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${kind === entryKind ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground"}`}>
              {entryKind === "devlog" ? "Devlog" : "General Project"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border bg-surface-bg p-0.5">
            <EditorTooltip label="Editor only" placement="bottom">
              <button type="button" aria-label="Editor only" onClick={() => setLayoutMode("editor")} className={`rounded p-1.5 ${layoutMode === "editor" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><PanelLeft size={15} /></button>
            </EditorTooltip>
            <EditorTooltip label="Split view" placement="bottom">
              <button type="button" aria-label="Split view" onClick={() => setLayoutMode("split")} className={`rounded p-1.5 ${layoutMode === "split" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Columns2 size={15} /></button>
            </EditorTooltip>
            <EditorTooltip label="Preview only" placement="bottom">
              <button type="button" aria-label="Preview only" onClick={() => setLayoutMode("preview")} className={`rounded p-1.5 ${layoutMode === "preview" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><PanelRight size={15} /></button>
            </EditorTooltip>
          </div>
          <button type="button" disabled={isViewingRepository} onClick={resetDraft} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs text-foreground-muted hover:bg-surface-card hover:text-method-put disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw size={13} /> Reset</button>
          <button type="button" onClick={copySource} className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy body MDX"}</button>
          {kind === "devlog" && (isViewingRepository ? (
            <button type="button" onClick={promoteRepositoryEntry} className="flex items-center gap-1.5 rounded-md bg-accent-success px-3 py-2 text-xs font-semibold text-white hover:opacity-90"><Pencil size={14} /> Edit this entry</button>
          ) : (
            <button type="button" disabled={publicationBusy} onClick={preparePublication} className="flex items-center gap-1.5 rounded-md bg-accent-success px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} />{publicationBusy ? "Preparing…" : "Review publication"}</button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className={`${layoutMode === "preview" ? "hidden" : "flex"} min-h-[50%] min-w-0 flex-col border-b border-border lg:min-h-0 lg:border-b-0 ${layoutMode === "editor" ? "lg:w-full" : "lg:w-[var(--editor-width)]"}`} aria-label="Editor pane">
          <SettingsPanel kind={kind} settings={draft.settings} publication={draft.publication} disabled={isViewingRepository} onChange={setSettings} onPublicationChange={setPublication} />

          <fieldset disabled={isViewingRepository} className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface-card/60 px-3 py-2 disabled:opacity-55">
            <ToolButton label="Heading 2" onClick={() => replaceSelection("## ")}><Heading2 size={14} /></ToolButton>
            <ToolButton label="Heading 3" onClick={() => replaceSelection("### ")}><Heading3 size={14} /></ToolButton>
            <ToolButton label="Bold" onClick={() => replaceSelection("**", "**", "bold text")}><Bold size={14} /></ToolButton>
            <ToolButton label="Italic" onClick={() => replaceSelection("*", "*", "italic text")}><Italic size={14} /></ToolButton>
            <ToolButton label="Link" onClick={() => replaceSelection("[", "](https://example.com)", "link text")}><LinkIcon size={14} /></ToolButton>
            <ToolButton
              label={showFormattingMarks ? "Hide formatting marks" : "Show formatting marks"}
              active={showFormattingMarks}
              onClick={() => setShowFormattingMarks((current) => !current)}
            >
              <Pilcrow size={14} />
            </ToolButton>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolButton label="Callout" onClick={() => openDialog("callout")}><Braces size={14} /><span className="hidden xl:inline">Callout</span></ToolButton>
            <ToolButton label="Figure" onClick={() => openDialog("figure")}><FileImage size={14} /></ToolButton>
            <ToolButton label="Code block" onClick={() => openDialog("code")}><Code2 size={14} /></ToolButton>
            <ToolButton label="Mermaid" onClick={() => openDialog("mermaid")}><ListTree size={14} /></ToolButton>
            <ToolButton label="Annotated Mermaid" onClick={openAnnotationComposer}><Highlighter size={14} /></ToolButton>
            <ToolButton label="Captioned Mermaid" onClick={() => openDialog("diagram")}><Highlighter size={14} /></ToolButton>
            <ToolButton label="Layout diagram" onClick={() => openDialog("layout")}><Columns2 size={14} /></ToolButton>
            <ToolButton label="Horizontal rule" onClick={() => insertBlock("---")}><Minus size={14} /></ToolButton>
            {kind === "devlog" ? <>
              <span className="mx-1 h-5 w-px bg-border" />
              <ToolButton label="Hero quote" onClick={() => replaceSelection("<HeroQuote>\n", "\n</HeroQuote>", "Quote text")}><Quote size={14} /></ToolButton>
              <ToolButton label="Emphasized text" onClick={() => openDialog("emphasis")}><MessageSquareQuote size={14} /></ToolButton>
              <ToolButton label="Scene break" onClick={() => insertBlock("<SceneBreak />")}><Sparkles size={14} /></ToolButton>
            </> : <>
              <span className="mx-1 h-5 w-px bg-border" />
              <ToolButton label="Project card" onClick={() => openDialog("card")}><Clipboard size={14} /></ToolButton>
              <ToolButton label="Wrap cards in group" onClick={() => replaceSelection("<CardGroup layout=\"grid\">\n", "\n</CardGroup>", "<Card title=\"Card\">Content</Card>")}><Columns2 size={14} /></ToolButton>
            </>}
          </fieldset>

          {(isViewingRepository || notice || duplicates.length > 0 || mermaidIssues.length > 0 || compileError) && (
            <div className="space-y-1 border-b border-border bg-surface-sidebar px-3 py-2 text-xs" aria-label="Editor issues">
              {isViewingRepository && <p className="flex items-center gap-1.5 text-method-put"><Eye size={13} /> Published entry preview. Choose “Edit this entry” to create a safe local working draft.</p>}
              {notice && <div className="flex items-start justify-between gap-3 text-accent-success"><span>{notice}</span><EditorTooltip label="Dismiss notice"><button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={13} /></button></EditorTooltip></div>}
              {duplicates.length > 0 && <p className="text-method-put">Duplicate heading IDs: {duplicates.map((item) => item.id).join(", ")}</p>}
              {mermaidIssues.map((issue) => (
                <p key={`${issue.diagram}-${issue.line ?? "unknown"}-${issue.excerpt ?? "error"}`} className="flex items-start gap-1.5 text-method-put" role="alert">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold">Mermaid diagram {issue.diagram}{issue.line ? ` · line ${issue.line}` : ""}:</span>{" "}
                    {issue.summary}{issue.hint ? ` ${issue.hint}` : ""}
                    {issue.excerpt && <code className="ml-1 rounded bg-surface-card px-1 py-0.5 font-mono text-[10px]">{issue.excerpt}</code>}
                  </span>
                </p>
              ))}
              {compileError && <p className="whitespace-pre-wrap text-method-put">{compileError}</p>}
            </div>
          )}

          <div className="relative min-h-0 flex-1">
            <EntrySourceEditor
              ref={sourceEditorRef}
              value={draft.source}
              onChange={setSource}
              onPasteNotice={setNotice}
              showFormattingMarks={showFormattingMarks}
              readOnly={isViewingRepository}
              ariaLabel={`${kind === "devlog" ? "Devlog" : "General Project"} Markdown and MDX source`}
            />
            {showFormattingMarks && (
              <div className="pointer-events-none absolute bottom-3 left-28 rounded border border-border bg-surface-card/95 px-2 py-1 font-mono text-[10px] text-foreground-muted shadow-sm">
                <span className="text-accent">·</span> space&nbsp;&nbsp;
                <span className="text-accent">→</span> tab&nbsp;&nbsp;
                <span className="text-accent">¶</span> line break&nbsp;&nbsp;
                <span className="text-method-put">⍽</span> nonbreaking space
              </div>
            )}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-surface-card/90 px-2 py-1 text-[10px] text-foreground-muted shadow-sm">
              {isViewingRepository ? "Published source · read only" : "Autosaved locally"} · {draft.source.length.toLocaleString()} chars
            </div>
          </div>
        </section>

        {layoutMode === "split" && (
          <EditorTooltip label="Drag to resize editor and preview" wrapperClassName="hidden w-1.5 shrink-0 lg:inline-flex">
            <button
              type="button"
              aria-label="Resize editor and preview"
              onMouseDown={(event) => {
                resizeRef.current = { startX: event.clientX, width: editorWidth };
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
              className="h-full w-full cursor-col-resize bg-border transition hover:bg-accent"
            >
              <span className="sr-only">Resize panes</span>
            </button>
          </EditorTooltip>
        )}

        <section className={`${layoutMode === "editor" ? "hidden" : "flex"} min-h-[50%] min-w-0 flex-1 flex-col bg-surface-sidebar`} aria-label="Preview pane">
          <div className="flex min-h-11 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Preview
              {isCompiling && <span className="font-normal normal-case tracking-normal opacity-60">Updating…</span>}
              {compileError && !isCompiling && <span className="font-normal normal-case tracking-normal text-method-put">Showing last valid version</span>}
            </div>
            <div className="flex rounded-md border border-border bg-surface-bg p-0.5">
              <EditorTooltip label="Light entry preview">
                <button type="button" aria-label="Light preview" onClick={() => setPreviewTheme("light")} className={`rounded p-1.5 ${previewTheme === "light" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Sun size={14} /></button>
              </EditorTooltip>
              <EditorTooltip label="Dark entry preview">
                <button type="button" aria-label="Dark preview" onClick={() => setPreviewTheme("dark")} className={`rounded p-1.5 ${previewTheme === "dark" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Moon size={14} /></button>
              </EditorTooltip>
            </div>
          </div>

          <div className={previewTheme === "dark" ? "dark min-h-0 flex-1" : "entry-preview-light min-h-0 flex-1"}>
            <div className="grid h-full min-h-0 grid-cols-1 bg-surface-bg xl:grid-cols-[minmax(0,1fr)_190px]">
              <div ref={previewRef} className="min-h-0 overflow-y-auto scroll-smooth px-6 pb-20 pt-7 md:px-10">
                <article className="mx-auto max-w-3xl">
                  {kind === "project" && <ProjectMetadata rows={draft.settings.metadata} />}
                  <PreviewHeader settings={draft.settings} />
                  {PreviewContent ? (
                    <PreviewErrorBoundary
                      key={draft.source}
                      onError={(error) => setCompileError(error.message)}
                    >
                      <PreviewContent components={previewComponents} />
                    </PreviewErrorBoundary>
                  ) : <div className="rounded-lg border border-border bg-surface-card p-8 text-center text-sm text-foreground-muted">Preparing preview…</div>}
                </article>
              </div>
              <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-surface-terminal p-4 xl:block">
                <div className="mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-foreground-muted"><ListTree size={11} /> On this page</div>
                <EntryToc items={toc} previewRef={previewRef} />
              </aside>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <EditorTooltip label="Toggle application theme">
          <ThemeToggle nativeTooltip={false} />
        </EditorTooltip>
      </div>

      {dialog && <InsertDialog key={`${dialog.kind}-${dialog.selectionStart}-${dialog.selectionEnd}`} state={dialog} onClose={() => setDialog(null)} onInsert={handleDialogInsert} />}
      {annotationComposer && (
        <AnnotatedMermaidComposer
          key={`${annotationComposer.selectionStart}-${annotationComposer.selectionEnd}`}
          selectedText={annotationComposer.selectedText}
          initialValue={annotationComposer.initialValue}
          onClose={() => setAnnotationComposer(null)}
          onInsert={handleAnnotatedMermaidInsert}
        />
      )}
      {publicationPlan && <PublicationDialog plan={publicationPlan} busy={publicationBusy} onClose={() => setPublicationPlan(null)} onApply={applyPublication} />}
      </div>
    </div>
  );
}
