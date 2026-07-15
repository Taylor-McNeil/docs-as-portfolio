"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorSelection, EditorState, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  highlightSpecialChars,
  highlightWhitespace,
  keymap,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { convertRichHtmlToMarkdown } from "./entry-editor-utils";

export interface EntrySourceEditorHandle {
  focus: () => void;
  getSelection: () => { from: number; to: number };
  replaceRange: (from: number, to: number, text: string, selectionStart?: number, selectionEnd?: number) => void;
}

interface EntrySourceEditorProps {
  value: string;
  ariaLabel: string;
  showFormattingMarks: boolean;
  onChange: (value: string) => void;
  onPasteNotice: (message: string) => void;
}

class ParagraphMarkWidget extends WidgetType {
  toDOM() {
    const anchor = document.createElement("span");
    anchor.className = "entry-editor-paragraph-anchor";
    anchor.setAttribute("aria-hidden", "true");

    const mark = document.createElement("span");
    mark.className = "entry-editor-paragraph-mark";
    mark.textContent = "¶";
    anchor.append(mark);
    return anchor;
  }

  ignoreEvent() {
    return true;
  }
}

function paragraphMarks(view: EditorView): DecorationSet {
  const marks = [];
  const seen = new Set<number>();

  for (const range of view.visibleRanges) {
    let line = view.state.doc.lineAt(range.from);
    while (line.from <= range.to) {
      if (!seen.has(line.number)) {
        seen.add(line.number);
        marks.push(Decoration.widget({ widget: new ParagraphMarkWidget(), side: 1 }).range(line.to));
      }
      if (line.to >= view.state.doc.length) break;
      line = view.state.doc.line(line.number + 1);
    }
  }

  return Decoration.set(marks, true);
}

const paragraphMarkPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = paragraphMarks(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = paragraphMarks(update.view);
    }
  }
}, {
  decorations: (plugin) => plugin.decorations,
});

const formattingMarks: Extension = [
  highlightWhitespace(),
  highlightSpecialChars({
    addSpecialChars: /\u00a0/,
    render: (code) => {
      const mark = document.createElement("span");
      mark.className = "entry-editor-nbsp-mark";
      mark.textContent = code === 160 ? "⍽" : String.fromCodePoint(code);
      return mark;
    },
  }),
  paragraphMarkPlugin,
];

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "var(--color-surface-bg)",
    color: "var(--color-foreground)",
    fontSize: "13px",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    lineHeight: "24px",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "20px",
    caretColor: "var(--color-foreground)",
  },
  ".cm-line": {
    padding: "0",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, color-mix(in srgb, var(--color-accent) 70%, transparent) 18%, transparent 20%)",
  },
  ".cm-highlightTab": {
    filter: "sepia(1) saturate(4)",
  },
  ".entry-editor-paragraph-anchor": {
    position: "relative",
    display: "inline-block",
    width: "0",
    height: "1em",
    pointerEvents: "none",
  },
  ".entry-editor-paragraph-mark": {
    position: "absolute",
    left: "0",
    top: "0",
    color: "color-mix(in srgb, var(--color-accent) 65%, transparent)",
  },
  ".entry-editor-nbsp-mark": {
    color: "var(--color-method-put)",
  },
});

export const EntrySourceEditor = forwardRef<EntrySourceEditorHandle, EntrySourceEditorProps>(function EntrySourceEditor(
  { value, ariaLabel, showFormattingMarks, onChange, onPasteNotice },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onPasteNoticeRef = useRef(onPasteNotice);
  const formattingCompartmentRef = useRef(new Compartment());
  const attributesCompartmentRef = useRef(new Compartment());

  onChangeRef.current = onChange;
  onPasteNoticeRef.current = onPasteNotice;

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus(),
    getSelection: () => {
      const selection = viewRef.current?.state.selection.main;
      return selection ? { from: selection.from, to: selection.to } : { from: value.length, to: value.length };
    },
    replaceRange: (from, to, text, selectionStart = from + text.length, selectionEnd = selectionStart) => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: EditorSelection.range(selectionStart, selectionEnd),
        scrollIntoView: true,
      });
      view.focus();
    },
  }), [value.length]);

  useLayoutEffect(() => {
    if (!hostRef.current) return;
    const formattingCompartment = formattingCompartmentRef.current;
    const attributesCompartment = attributesCompartmentRef.current;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          EditorView.lineWrapping,
          editorTheme,
          keymap.of([
            {
              key: "Tab",
              run: (editor) => {
                const changes = editor.state.changeByRange((range) => ({
                  changes: { from: range.from, to: range.to, insert: "  " },
                  range: EditorSelection.cursor(range.from + 2),
                }));
                editor.dispatch(changes);
                return true;
              },
            },
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          formattingCompartment.of(showFormattingMarks ? formattingMarks : []),
          attributesCompartment.of(EditorView.contentAttributes.of({
            "aria-label": ariaLabel,
            spellcheck: "true",
            autocorrect: "on",
          })),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
          EditorView.domEventHandlers({
            paste: (event, editor) => {
              const clipboard = event.clipboardData;
              if (!clipboard) return false;
              const html = clipboard.getData("text/html");
              const hasImageFile = Array.from(clipboard.files).some((file) => file.type.startsWith("image/"));
              if (!html) {
                if (hasImageFile) {
                  onPasteNoticeRef.current("Clipboard images are not imported. Add them to /public, then insert a Figure.");
                }
                return false;
              }

              event.preventDefault();
              const converted = convertRichHtmlToMarkdown(html);
              const selection = editor.state.selection.main;
              editor.dispatch({
                changes: { from: selection.from, to: selection.to, insert: converted.markdown },
                selection: EditorSelection.cursor(selection.from + converted.markdown.length),
                scrollIntoView: true,
              });
              onPasteNoticeRef.current(converted.omittedImages || hasImageFile
                ? "Formatting imported. Clipboard images were omitted; add them to /public and insert a Figure."
                : "Rich text imported as semantic Markdown.");
              return true;
            },
          }),
        ],
      }),
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor owns its document after mount. Prop changes are synchronized below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    const head = Math.min(view.state.selection.main.head, value.length);
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: EditorSelection.cursor(head),
    });
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: formattingCompartmentRef.current.reconfigure(showFormattingMarks ? formattingMarks : []),
    });
  }, [showFormattingMarks]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: attributesCompartmentRef.current.reconfigure(EditorView.contentAttributes.of({
        "aria-label": ariaLabel,
        spellcheck: "true",
        autocorrect: "on",
      })),
    });
  }, [ariaLabel]);

  return <div ref={hostRef} className="entry-source-editor h-full min-h-0" />;
});
