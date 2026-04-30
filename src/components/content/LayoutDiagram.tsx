"use client";

import { ReactNode, useRef, useState } from "react";

interface LayoutDiagramProps {
  title: string;
  children: ReactNode;
}

export function LayoutDiagram({ title, children }: LayoutDiagramProps) {
  const preRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = preRef.current?.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group my-6 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-card border-b border-border">
        <span className="text-xs font-mono text-foreground-muted">
          {title}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs font-mono text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-foreground-terminal"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Diagram content */}
      <div ref={preRef} className="bg-surface-terminal overflow-x-auto">
        {typeof children === "string" ? (
          <pre
            className="mx-auto w-max p-4 text-sm leading-none text-foreground-terminal"
            style={{
              fontFamily: '"Menlo", "Cascadia Mono", "Consolas", monospace',
              letterSpacing: "0em",
            }}
          >
            {children.trim()}
          </pre>
        ) : (
          <div className="p-4">{children}</div>
        )}
      </div>
    </div>
  );
}
