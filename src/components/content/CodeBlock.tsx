"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { CodeHighlight } from "@/components/content/Highlight";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-card border-b border-border">
        <span className="text-xs font-mono text-foreground-muted">
          {filename || language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-surface-bg transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-accent-success" />
          ) : (
            <Copy size={14} className="text-foreground-muted" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-surface-terminal overflow-x-auto">
        <pre className="p-4 text-sm leading-tight font-mono">
          <CodeHighlight code={code} language={language} />
        </pre>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { CodeBlock } from "@/components/content/CodeBlock";
 *
 * <CodeBlock
 *   code={`const greeting = "Hello, World!";
 * console.log(greeting);`}
 *   language="javascript"
 *   filename="example.js"
 * />
 *
 * Props:
 * - code: string (required) - The code to display
 * - language?: string - Language for syntax highlighting
 * - filename?: string - Displayed in header (falls back to language)
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────────────┐
 * │ example.js                            [📋] │
 * ├─────────────────────────────────────────────┤
 * │                                             │
 * │  const greeting = "Hello, World!";          │
 * │  console.log(greeting);                     │
 * │                                             │
 * └─────────────────────────────────────────────┘
 *
 * Features:
 * - Syntax highlighting via CodeHighlight
 * - Copy button with success feedback
 * - Horizontal scroll for long lines
 */