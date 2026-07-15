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
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import {
  Braces,
  Check,
  Clipboard,
  Code2,
  Columns2,
  Copy,
  FileImage,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  ListTree,
  MessageSquareQuote,
  Minus,
  Moon,
  PanelLeft,
  PanelRight,
  Pilcrow,
  Plus,
  Quote,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Callout } from "@/components/content/Callout";
import { Card, CardGroup } from "@/components/content/Card";
import { CodeBlock } from "@/components/content/CodeBlock";
import { DiagramFigure } from "@/components/content/DiagramFigure";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { Figure } from "@/components/content/Figure";
import { HeroQuote } from "@/components/content/HeroQuote";
import { JsonLd } from "@/components/content/JsonLd";
import { LayoutDiagram } from "@/components/content/LayoutDiagram";
import { Mermaid } from "@/components/content/Mermaid";
import { SceneBreak } from "@/components/content/SceneBreak";
import { JsonRenderer, type JsonValue } from "@/components/content/JsonRenderer";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import {
  ComponentRegistry,
  type ComponentRegistrySources,
} from "@/components/interactive/ComponentRegistry";
import {
  DEFAULT_DRAFTS,
  draftStorageKey,
  extractToc,
  insertAtSelection,
  parseMetadataValue,
  readDraft,
  slugifyHeading,
  type EntryDraft,
  type EntryKind,
  type EntryMethod,
  type EntrySettings,
  type MetadataRow,
} from "./entry-editor-utils";
import { EntrySourceEditor, type EntrySourceEditorHandle } from "./entry-source-editor";

type LayoutMode = "split" | "editor" | "preview";
type PreviewTheme = "light" | "dark";
type DialogKind = "callout" | "figure" | "code" | "mermaid" | "diagram" | "layout" | "emphasis" | "card";

interface DialogState {
  kind: DialogKind;
  selectionStart: number;
  selectionEnd: number;
  selectedText: string;
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
  componentRegistrySources: ComponentRegistrySources
): MDXComponents {
  const RegistryPreview = () => (
    <ComponentRegistry sources={componentRegistrySources} />
  );

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
    Callout,
    Card,
    CardGroup,
    CodeBlock,
    ComponentRegistry: RegistryPreview,
    DiagramFigure,
    EmphasizedText,
    Figure,
    HeroQuote,
    JsonLd,
    LayoutDiagram,
    Mermaid,
    SceneBreak,
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
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded border px-2 text-xs transition hover:border-accent hover:text-foreground ${active ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-bg text-foreground-muted"}`}
    >
      {children}
    </button>
  );
}

function SettingsPanel({ kind, settings, onChange }: { kind: EntryKind; settings: EntrySettings; onChange: (settings: EntrySettings) => void }) {
  const update = <K extends keyof EntrySettings>(key: K, value: EntrySettings[K]) => onChange({ ...settings, [key]: value });

  const updateRow = (id: string, patch: Partial<MetadataRow>) => {
    update("metadata", settings.metadata.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  return (
    <div className="border-b border-border bg-surface-sidebar/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-foreground-muted">
          Title
          <input className={`${inputClass} mt-1`} value={settings.title} onChange={(event) => update("title", event.target.value)} />
        </label>
        <label className="text-xs font-medium text-foreground-muted">
          Endpoint
          <div className="mt-1 flex gap-2">
            <select className="rounded-md border border-border bg-surface-bg px-2 text-xs text-foreground" value={settings.method} onChange={(event) => update("method", event.target.value as EntryMethod)}>
              {METHODS.map((method) => <option key={method}>{method}</option>)}
            </select>
            <input className={inputClass} value={settings.endpoint} onChange={(event) => update("endpoint", event.target.value)} />
          </div>
        </label>
        <label className="text-xs font-medium text-foreground-muted sm:col-span-2">
          Description <span className="font-normal opacity-60">(preview only)</span>
          <input className={`${inputClass} mt-1`} value={settings.description} onChange={(event) => update("description", event.target.value)} />
        </label>
      </div>

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
                <button type="button" aria-label="Remove metadata row" onClick={() => update("metadata", settings.metadata.filter((item) => item.id !== row.id))} className="rounded p-2 text-foreground-muted hover:bg-surface-card hover:text-method-put">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
    diagram: "Insert diagram figure",
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
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded p-1 text-foreground-muted hover:bg-surface-card"><X size={18} /></button>
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
          {state.kind === "emphasis" && <label className="block text-xs text-foreground-muted">Content<textarea required rows={4} className={`${inputClass} mt-1 resize-y`} value={values.content} onChange={(event) => set("content", event.target.value)} /></label>}
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
      return `<EmphasizedText color="${values.color}">\n${content}\n</EmphasizedText>`;
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

export default function EntryEditor({
  componentRegistrySources,
}: {
  componentRegistrySources: ComponentRegistrySources;
}) {
  const [kind, setKind] = useState<EntryKind>("devlog");
  const [drafts, setDrafts] = useState<Record<EntryKind, EntryDraft>>(DEFAULT_DRAFTS);
  const [restored, setRestored] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [editorWidth, setEditorWidth] = useState(46);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("dark");
  const [notice, setNotice] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [compileError, setCompileError] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState(true);
  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [PreviewContent, setPreviewContent] = useState<ComponentType<{ components?: MDXComponents }> | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const sourceEditorRef = useRef<EntrySourceEditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ startX: number; width: number } | null>(null);

  const draft = drafts[kind];
  const previewComponents = useMemo(
    () => createPreviewComponents(componentRegistrySources),
    [componentRegistrySources]
  );
  const toc = useMemo(() => extractToc(draft.source), [draft.source]);
  const duplicates = toc.filter((item) => item.duplicate);

  const setDraft = useCallback((next: EntryDraft) => {
    setDrafts((current) => ({ ...current, [kind]: next }));
  }, [kind]);

  const setSource = useCallback((source: string) => setDraft({ ...draft, source }), [draft, setDraft]);
  const setSettings = useCallback((settings: EntrySettings) => setDraft({ ...draft, settings }), [draft, setDraft]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDrafts({ devlog: readDraft("devlog"), project: readDraft("project") });
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftStorageKey("devlog"), JSON.stringify(drafts.devlog));
      window.localStorage.setItem(draftStorageKey("project"), JSON.stringify(drafts.project));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [drafts, restored]);

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
        const result = await evaluate(draft.source, {
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
  }, [draft.source, previewComponents]);

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

  function handleDialogInsert(values: DialogValues) {
    if (!dialog) return;
    insertBlock(dialogMarkup(dialog.kind, values), dialog.selectionStart, dialog.selectionEnd);
    setDialog(null);
  }

  async function copySource() {
    await navigator.clipboard.writeText(draft.source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function resetDraft() {
    if (!window.confirm(`Reset the ${kind === "devlog" ? "Devlog" : "General Project"} draft? This cannot be undone.`)) return;
    const clean = structuredClone(DEFAULT_DRAFTS[kind]);
    setDrafts((current) => ({ ...current, [kind]: clean }));
    window.localStorage.removeItem(draftStorageKey(kind));
    setNotice("Draft reset.");
  }

  const paneStyle = { "--editor-width": `${editorWidth}%` } as CSSProperties;

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-surface-bg text-foreground" style={paneStyle}>
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
            <button type="button" aria-label="Editor only" title="Editor only" onClick={() => setLayoutMode("editor")} className={`rounded p-1.5 ${layoutMode === "editor" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><PanelLeft size={15} /></button>
            <button type="button" aria-label="Split view" title="Split view" onClick={() => setLayoutMode("split")} className={`rounded p-1.5 ${layoutMode === "split" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Columns2 size={15} /></button>
            <button type="button" aria-label="Preview only" title="Preview only" onClick={() => setLayoutMode("preview")} className={`rounded p-1.5 ${layoutMode === "preview" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><PanelRight size={15} /></button>
          </div>
          <button type="button" onClick={resetDraft} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs text-foreground-muted hover:bg-surface-card hover:text-method-put"><RotateCcw size={13} /> Reset</button>
          <button type="button" onClick={copySource} className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy body MDX"}</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className={`${layoutMode === "preview" ? "hidden" : "flex"} min-h-[50%] min-w-0 flex-col border-b border-border lg:min-h-0 lg:border-b-0 ${layoutMode === "editor" ? "lg:w-full" : "lg:w-[var(--editor-width)]"}`} aria-label="Editor pane">
          <SettingsPanel kind={kind} settings={draft.settings} onChange={setSettings} />

          <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface-card/60 px-3 py-2">
            <ToolButton label="Heading 2" onClick={() => replaceSelection("## ")}><Heading2 size={14} /></ToolButton>
            <ToolButton label="Heading 3" onClick={() => replaceSelection("### ")}><Heading3 size={14} /></ToolButton>
            <ToolButton label="Bold" onClick={() => replaceSelection("**", "**", "bold text")}><Type size={14} /></ToolButton>
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
            <ToolButton label="Diagram figure" onClick={() => openDialog("diagram")}><Highlighter size={14} /></ToolButton>
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
          </div>

          {(notice || duplicates.length > 0 || compileError) && (
            <div className="space-y-1 border-b border-border bg-surface-sidebar px-3 py-2 text-xs">
              {notice && <div className="flex items-start justify-between gap-3 text-accent-success"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={13} /></button></div>}
              {duplicates.length > 0 && <p className="text-method-put">Duplicate heading IDs: {duplicates.map((item) => item.id).join(", ")}</p>}
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
              ariaLabel={`${kind === "devlog" ? "Devlog" : "General Project"} Markdown and MDX source`}
            />
            {showFormattingMarks && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-border bg-surface-card/95 px-2 py-1 font-mono text-[10px] text-foreground-muted shadow-sm">
                <span className="text-accent">·</span> space&nbsp;&nbsp;
                <span className="text-accent">→</span> tab&nbsp;&nbsp;
                <span className="text-accent">¶</span> line break&nbsp;&nbsp;
                <span className="text-method-put">⍽</span> nonbreaking space
              </div>
            )}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-surface-card/90 px-2 py-1 text-[10px] text-foreground-muted shadow-sm">
              Autosaved locally · {draft.source.length.toLocaleString()} chars
            </div>
          </div>
        </section>

        {layoutMode === "split" && (
          <button
            type="button"
            aria-label="Resize editor and preview"
            title="Drag to resize"
            onMouseDown={(event) => {
              resizeRef.current = { startX: event.clientX, width: editorWidth };
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="group hidden w-1.5 shrink-0 cursor-col-resize bg-border transition hover:bg-accent lg:block"
          >
            <span className="sr-only">Resize panes</span>
          </button>
        )}

        <section className={`${layoutMode === "editor" ? "hidden" : "flex"} min-h-[50%] min-w-0 flex-1 flex-col bg-surface-sidebar`} aria-label="Preview pane">
          <div className="flex min-h-11 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Preview
              {isCompiling && <span className="font-normal normal-case tracking-normal opacity-60">Updating…</span>}
              {compileError && !isCompiling && <span className="font-normal normal-case tracking-normal text-method-put">Showing last valid version</span>}
            </div>
            <div className="flex rounded-md border border-border bg-surface-bg p-0.5">
              <button type="button" aria-label="Light preview" onClick={() => setPreviewTheme("light")} className={`rounded p-1.5 ${previewTheme === "light" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Sun size={14} /></button>
              <button type="button" aria-label="Dark preview" onClick={() => setPreviewTheme("dark")} className={`rounded p-1.5 ${previewTheme === "dark" ? "bg-surface-card text-accent" : "text-foreground-muted"}`}><Moon size={14} /></button>
            </div>
          </div>

          <div className={previewTheme === "dark" ? "dark min-h-0 flex-1" : "entry-preview-light min-h-0 flex-1"}>
            <div className="grid h-full min-h-0 grid-cols-1 bg-surface-bg xl:grid-cols-[minmax(0,1fr)_190px]">
              <div ref={previewRef} className="min-h-0 overflow-y-auto scroll-smooth px-6 py-7 md:px-10">
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

      {dialog && <InsertDialog key={`${dialog.kind}-${dialog.selectionStart}-${dialog.selectionEnd}`} state={dialog} onClose={() => setDialog(null)} onInsert={handleDialogInsert} />}
    </div>
  );
}
