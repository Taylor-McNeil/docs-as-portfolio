"use client";

import { ReactNode, useRef, useState } from "react";

interface LayoutDiagramProps {
  title: string;
  children: ReactNode;
}

function normalizeLayoutDiagram(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  if (lines[0]?.trim() === "") {
    lines.shift();
  }

  if (lines[lines.length - 1]?.trim() === "") {
    lines.pop();
  }

  return lines.join("\n");
}

export function LayoutDiagram({ title, children }: LayoutDiagramProps) {
  const preRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const diagramText =
    typeof children === "string" ? normalizeLayoutDiagram(children) : null;

  function handleCopy() {
    const text = diagramText ?? preRef.current?.textContent;
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
        {diagramText ? (
          <pre
            className="mx-auto w-max p-4 text-sm leading-none text-foreground-terminal"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0",
              fontVariantLigatures: "none",
            }}
          >
            {diagramText}
          </pre>
        ) : (
          <div className="p-4">{children}</div>
        )}
      </div>
    </div>
  );
}
