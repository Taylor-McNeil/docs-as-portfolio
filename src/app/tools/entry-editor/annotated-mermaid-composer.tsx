"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Eraser,
  MousePointer2,
  Pencil,
  Redo2,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { AnnotationSurface } from "@/components/content/AnnotationSurface";
import {
  annotatedMermaidMarkup,
  createAnnotationSet,
  type AnnotationMark,
  type AnnotationTool,
  type TextAnnotation,
} from "@/components/content/annotation-model";
import { Mermaid } from "@/components/content/Mermaid";

const DEFAULT_CHART = `flowchart TD
  ZIP[Manuscript.docx] --> WORD[word/]
  WORD --> DOCUMENT[document.xml]
  WORD --> STYLES[styles.xml]
  WORD --> COMMENTS[comments.xml]
  DOCUMENT --> QUESTION{What does Heading 1 mean?}`;

const inputClass = "w-full rounded-md border border-border bg-surface-bg px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent";
const DEFAULT_ANNOTATION_COLOR = "#43a6f6";
const ANNOTATION_COLORS = [
  { label: "Blue", value: "#43a6f6" },
  { label: "Orange", value: "#f97316" },
  { label: "Pink", value: "#ec4899" },
  { label: "Purple", value: "#a855f7" },
  { label: "Green", value: "#22c55e" },
  { label: "White", value: "#e5e7eb" },
] as const;

interface AnnotatedMermaidComposerProps {
  selectedText: string;
  initialValue?: AnnotatedMermaidComposerValue;
  onClose: () => void;
  onInsert: (markup: string) => void;
}

export interface AnnotatedMermaidComposerValue {
  chart: string;
  label: string;
  annotationSet: ReturnType<typeof createAnnotationSet>;
}

function looksLikeMermaid(value: string): boolean {
  return /^\s*(?:---[\s\S]*?---\s*)?(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph)\b/m.test(value);
}

export function AnnotatedMermaidComposer({
  selectedText,
  initialValue,
  onClose,
  onInsert,
}: AnnotatedMermaidComposerProps) {
  const [chart, setChart] = useState(initialValue?.chart ?? (looksLikeMermaid(selectedText) ? selectedText.trim() : DEFAULT_CHART));
  const [label, setLabel] = useState(initialValue?.label ?? "Annotated diagram");
  const [marks, setMarks] = useState<AnnotationMark[]>(initialValue?.annotationSet.marks ?? []);
  const [undoStack, setUndoStack] = useState<AnnotationMark[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationMark[][]>([]);
  const [tool, setTool] = useState<AnnotationTool>(initialValue ? "select" : "pen");
  const [selectedMarkId, setSelectedMarkId] = useState<string | null>(null);
  const [textColor, setTextColor] = useState(DEFAULT_ANNOTATION_COLOR);
  const [penColor, setPenColor] = useState(DEFAULT_ANNOTATION_COLOR);
  const [showBackground, setShowBackground] = useState(initialValue?.annotationSet.showBackground !== false);
  const annotationSet = useMemo(() => {
    const next = createAnnotationSet(chart, marks, showBackground);
    if (initialValue?.annotationSet.artboard) {
      next.artboard = { ...initialValue.annotationSet.artboard };
    }
    return next;
  }, [chart, initialValue, marks, showBackground]);
  const selectedTextMark = marks.find(
    (mark): mark is TextAnnotation => mark.id === selectedMarkId && mark.type === "text",
  );

  const updateMarks = (next: AnnotationMark[]) => {
    setUndoStack((current) => [...current, marks]);
    setMarks(next);
    setRedoStack([]);
  };

  const undo = () => {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack((current) => [...current, marks]);
    setMarks(previous);
  };

  const redo = () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setUndoStack((current) => [...current, marks]);
    setRedoStack(redoStack.slice(0, -1));
    setMarks(next);
  };

  const selectMark = (id: string | null) => {
    setSelectedMarkId(id);
    const selected = marks.find((mark) => mark.id === id && mark.type === "text");
    if (selected) setTextColor(selected.color ?? DEFAULT_ANNOTATION_COLOR);
  };

  const updateSelectedText = (patch: Partial<TextAnnotation>) => {
    if (!selectedTextMark) return;
    updateMarks(marks.map((mark) => (
      mark.id === selectedTextMark.id && mark.type === "text"
        ? { ...mark, ...patch }
        : mark
    )));
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    if (selectedTextMark) updateSelectedText({ color });
  };

  const tools: Array<{ id: AnnotationTool; label: string; icon: typeof Pencil }> = [
    { id: "select", label: "Select", icon: MousePointer2 },
    { id: "pen", label: "Pen", icon: Pencil },
    { id: "arrow", label: "Arrow", icon: ArrowUpRight },
    { id: "text", label: "Text", icon: Type },
    { id: "erase", label: "Eraser", icon: Eraser },
  ];

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-3" role="dialog" aria-modal="true" aria-labelledby="annotated-mermaid-title">
      <section className="flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-border bg-surface-sidebar shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Visual explanation</p>
            <h2 id="annotated-mermaid-title" className="mt-1 text-xl font-semibold text-foreground-heading">
              {initialValue ? "Edit annotated Mermaid diagram" : "Create an annotated Mermaid diagram"}
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">The diagram and marks share one artboard, so the composition stays aligned when it scales.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close annotated diagram composer" className="rounded p-1 text-foreground-muted hover:bg-surface-card"><X size={18} /></button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-border p-4 lg:border-b-0 lg:border-r">
            <label className="block text-xs font-medium text-foreground-muted">
              Accessible description
              <input className={`${inputClass} mt-1`} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="What does this diagram explain?" />
            </label>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-bg p-3">
              <input
                type="checkbox"
                checked={showBackground}
                onChange={(event) => setShowBackground(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>
                <span className="block text-xs font-medium text-foreground">Artboard background</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground-muted">
                  {showBackground ? "Filled panel" : "Transparent when published"}
                </span>
              </span>
            </label>
            <label className="mt-4 block text-xs font-medium text-foreground-muted">
              Mermaid source
              <textarea
                rows={16}
                spellCheck={false}
                className={`${inputClass} mt-1 resize-y font-mono text-[11px] leading-relaxed`}
                value={chart}
                onChange={(event) => setChart(event.target.value)}
              />
            </label>
            <p className="mt-3 text-[11px] leading-relaxed text-foreground-muted">
              Tip: select raw Mermaid source before opening this composer to start with it here.
            </p>
          </aside>

          <div className="min-h-0 overflow-auto p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Annotation tools">
              {tools.map(({ id, label: toolLabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={toolLabel}
                  aria-pressed={tool === id}
                  onClick={() => setTool(id)}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition ${tool === id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-bg text-foreground-muted hover:text-foreground"}`}
                >
                  <Icon size={14} /> {toolLabel}
                </button>
              ))}
              <span className="mx-1 h-6 w-px bg-border" />
              <button type="button" aria-label="Undo annotation" disabled={!undoStack.length} onClick={undo} className="rounded-md border border-border p-2 text-foreground-muted hover:text-foreground disabled:opacity-30"><Undo2 size={14} /></button>
              <button type="button" aria-label="Redo annotation" disabled={!redoStack.length} onClick={redo} className="rounded-md border border-border p-2 text-foreground-muted hover:text-foreground disabled:opacity-30"><Redo2 size={14} /></button>
              <button type="button" aria-label="Clear annotations" disabled={!marks.length} onClick={() => { updateMarks([]); setSelectedMarkId(null); }} className="rounded-md border border-border p-2 text-foreground-muted hover:text-method-put disabled:opacity-30"><Trash2 size={14} /></button>
              <span className="ml-auto text-[11px] text-foreground-muted">{marks.length} {marks.length === 1 ? "mark" : "marks"}</span>
            </div>

            {(tool === "text" || tool === "select" || selectedTextMark) && (
              <div className="mb-3 rounded-lg border border-border bg-surface-bg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-medium text-foreground-muted">
                    {selectedTextMark ? "Selected text" : "New text"}
                  </span>
                  {ANNOTATION_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      aria-label={`Text color ${color.label.toLowerCase()}`}
                      aria-pressed={textColor === color.value}
                      onClick={() => applyTextColor(color.value)}
                      className={`h-6 w-6 rounded-full border-2 transition ${textColor === color.value ? "border-foreground ring-2 ring-accent/40" : "border-border"}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                  <label className="ml-1 flex items-center gap-2 text-[11px] text-foreground-muted">
                    Custom
                    <input
                      type="color"
                      aria-label="Custom text color"
                      value={textColor}
                      onChange={(event) => applyTextColor(event.target.value)}
                      className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                  </label>
                </div>

                {selectedTextMark && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-[11px] text-foreground-muted">
                      <span className="flex justify-between gap-3"><span>Wrap width</span><span>{selectedTextMark.width ?? 310}px</span></span>
                      <input
                        type="range"
                        min={180}
                        max={520}
                        step={10}
                        value={selectedTextMark.width ?? 310}
                        aria-label="Text wrap width"
                        onChange={(event) => updateSelectedText({ width: Number(event.target.value) })}
                        className="mt-1 w-full accent-accent"
                      />
                    </label>
                    <label className="text-[11px] text-foreground-muted">
                      <span className="flex justify-between gap-3"><span>Rotation</span><span>{selectedTextMark.rotation ?? 0}°</span></span>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={selectedTextMark.rotation ?? 0}
                        aria-label="Text rotation"
                        onChange={(event) => updateSelectedText({ rotation: Number(event.target.value) })}
                        className="mt-1 w-full accent-accent"
                      />
                    </label>
                  </div>
                )}

                <p className="mt-2 text-[10px] leading-relaxed text-foreground-muted">
                  {selectedTextMark
                    ? "With Select, drag the note to move it or click it to edit. Enter adds a line break; Cmd/Ctrl+Enter saves."
                    : "Choose Text and click the artboard to add a note. Enter adds a line break; Cmd/Ctrl+Enter saves."}
                </p>
              </div>
            )}

            {tool === "pen" && (
              <div className="mb-3 rounded-lg border border-border bg-surface-bg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-medium text-foreground-muted">Pen color</span>
                  {ANNOTATION_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      aria-label={`Pen color ${color.label.toLowerCase()}`}
                      aria-pressed={penColor === color.value}
                      onClick={() => setPenColor(color.value)}
                      className={`h-6 w-6 rounded-full border-2 transition ${penColor === color.value ? "border-foreground ring-2 ring-accent/40" : "border-border"}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                  <label className="ml-1 flex items-center gap-2 text-[11px] text-foreground-muted">
                    Custom
                    <input
                      type="color"
                      aria-label="Custom pen color"
                      value={penColor}
                      onChange={(event) => setPenColor(event.target.value)}
                      className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                  </label>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-foreground-muted">
                  New pen strokes use this color. Existing strokes keep the color they were drawn with.
                </p>
              </div>
            )}

            <AnnotationSurface
              label={label || "Annotated diagram"}
              marks={marks}
              showBackground={showBackground}
              tool={tool}
              penColor={penColor}
              textColor={textColor}
              selectedMarkId={selectedMarkId}
              onSelectMark={selectMark}
              onChange={updateMarks}
              className="!my-0"
            >
              <Mermaid chart={chart} className="!my-0" />
            </AnnotationSurface>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="text-xs text-foreground-muted">Select moves notes; click a note to edit it. Text places notes. Pen and arrows drag. Eraser removes marks.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm text-foreground-muted hover:bg-surface-card">Cancel</button>
            <button
              type="button"
              disabled={!chart.trim() || !label.trim()}
              onClick={() => onInsert(annotatedMermaidMarkup({ chart, label, annotationSet }))}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {initialValue ? "Update annotated diagram" : "Insert annotated diagram"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
