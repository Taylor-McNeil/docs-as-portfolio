"use client";

import { ReactNode } from "react";

interface Annotation {
  text: string;
  tooltip: string;
}

interface AnnotatedCodeBlockProps {
  code: string;
  language?: string;
  annotations?: Annotation[];
}

function buildAnnotatedLine(line: string, annotations: Annotation[]): ReactNode[] {
  if (!annotations.length) return [line];

  const parts: ReactNode[] = [];
  let remaining = line;
  let keyIndex = 0;

  while (remaining.length > 0) {
    let earliestMatch: { index: number; annotation: Annotation } | null = null;

    for (const annotation of annotations) {
      const idx = remaining.indexOf(annotation.text);
      if (idx !== -1 && (earliestMatch === null || idx < earliestMatch.index)) {
        earliestMatch = { index: idx, annotation };
      }
    }

    if (!earliestMatch) {
      parts.push(<span key={`t-${keyIndex++}`}>{remaining}</span>);
      break;
    }

    const { index, annotation } = earliestMatch;

    if (index > 0) {
      parts.push(<span key={`t-${keyIndex++}`}>{remaining.slice(0, index)}</span>);
    }

    parts.push(
      <span key={`a-${keyIndex++}`} className="group/tip relative">
        <span className="underline decoration-dashed decoration-amber-500/60 underline-offset-2 cursor-help">
          {annotation.text}
        </span>
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-10">
          {annotation.tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
        </span>
      </span>
    );

    remaining = remaining.slice(index + annotation.text.length);
  }

  return parts;
}

export function AnnotatedCodeBlock({ code, language, annotations = [] }: AnnotatedCodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className="my-6 rounded-lg border dark:border-slate-700 border-slate-200">
      {/* Header */}
      {language && (
        <div className="flex items-center px-4 py-2 bg-[#161b22] border-b dark:border-slate-700 border-slate-200 rounded-t-lg">
          <span className="text-xs font-mono text-slate-400">{language}</span>
        </div>
      )}

      {/* Code area */}
      <div className="bg-[#0d1117] overflow-x-auto overflow-y-visible rounded-b-lg">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          <table className="border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="select-none pr-4 text-right text-slate-600 align-top w-8">
                    {i + 1}
                  </td>
                  <td className="text-slate-300">
                    {annotations.length > 0
                      ? buildAnnotatedLine(line, annotations)
                      : line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { AnnotatedCodeBlock } from "@/components/content/AnnotatedCodeBlock";
 *
 * <AnnotatedCodeBlock
 *   code="applyBeatMark(editor, beatId, from, to, false)"
 *   language="typescript"
 *   annotations={[
 *     { text: "false", tooltip: "addToHistory: false — keeps this off the undo stack" }
 *   ]}
 * />
 *
 * Props:
 * - code: string (required) - The code to display
 * - language?: string - Language label for the header
 * - annotations?: Array<{ text: string, tooltip: string }> - Hover tooltips on matching substrings
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ typescript                                          │
 * ├─────────────────────────────────────────────────────┤
 * │  1 │ applyBeatMark(editor, beatId, from, to, false)│
 * │    │                                      ┌───────┐│
 * │    │                                      │tooltip ││
 * │    │                                      └───────┘│
 * └─────────────────────────────────────────────────────┘
 *
 * Features:
 * - Unselectable line numbers
 * - Substring-matched inline tooltips (CSS hover, no JS state)
 * - Dark code theme in both light and dark mode (like Postman)
 */
