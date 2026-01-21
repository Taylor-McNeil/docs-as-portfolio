"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { CodeHighlight } from "@/components/content/Highlight";

interface CollapsibleCodeProps {
  title: string;
  code: string;
  language?: string;
  filename?: string;
  defaultOpen?: boolean;
}

export function CollapsibleCode({
  title,
  code,
  language = "java",
  filename,
  defaultOpen = false,
}: CollapsibleCodeProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="my-6 border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-card">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
        >
          {isOpen ? (
            <ChevronDown size={16} className="text-foreground-muted" />
          ) : (
            <ChevronRight size={16} className="text-foreground-muted" />
          )}
          <span className="font-mono text-sm text-foreground">{title}</span>
          {filename && (
            <span className="text-xs text-foreground-muted">({filename})</span>
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-foreground-muted">{lineCount} lines</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-surface-terminal hover:bg-surface-bg transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check size={14} className="text-accent-success" />
            ) : (
              <Copy size={14} className="text-foreground-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      {isOpen && (
        <div className="bg-surface-terminal border-t border-border overflow-x-auto">
          <pre className="p-4 text-sm leading-relaxed">
            <CodeHighlight code={code} language={language} />
          </pre>
        </div>
      )}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { CollapsibleCode } from "@/components/content/CollapsibleCode";
 *
 * <CollapsibleCode
 *   title="View full implementation"
 *   code={`public class Example {
 *     public static void main(String[] args) {
 *         System.out.println("Hello!");
 *     }
 * }`}
 *   language="java"
 *   filename="Example.java"
 *   defaultOpen={false}
 * />
 *
 * Props:
 * - title: string (required) - Header text
 * - code: string (required) - The code to display
 * - language?: string - Language for highlighting (default: "java")
 * - filename?: string - Shown in parentheses after title
 * - defaultOpen?: boolean - Start expanded (default: false)
 *
 * ASCII REPRESENTATION (collapsed):
 *
 * ┌─────────────────────────────────────────────┐
 * │ ▶ View full implementation (Example.java)  │
 * │                              42 lines [📋] │
 * └─────────────────────────────────────────────┘
 *
 * ASCII REPRESENTATION (expanded):
 *
 * ┌─────────────────────────────────────────────┐
 * │ ▼ View full implementation (Example.java)  │
 * │                              42 lines [📋] │
 * ├─────────────────────────────────────────────┤
 * │                                             │
 * │  public class Example {                     │
 * │      public static void main(...) {         │
 * │          System.out.println("Hello!");      │
 * │      }                                      │
 * │  }                                          │
 * │                                             │
 * └─────────────────────────────────────────────┘
 */