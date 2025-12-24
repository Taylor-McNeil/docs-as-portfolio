"use client";

import { useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";
import { codeToHtml } from "shiki";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code?: string;
  children?: ReactNode;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, children, language = "text", filename }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Support both code prop and children
  const codeString = code || (typeof children === "string" ? children : "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

    codeToHtml(codeString, {
      lang: language,
      theme,
    }).then(setHtml);
  }, [codeString, language, resolvedTheme, mounted]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = resolvedTheme === "dark";

  // Show plain code before hydration
  if (!html) {
    return (
      <div className="relative group my-4 rounded-lg border border-border overflow-hidden">
        {filename && (
          <div className="px-4 py-2 border-b border-border bg-surface-card/50 flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted">{filename}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-foreground-muted uppercase">{language}</span>
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded border transition-all ${
                  copied
                    ? "bg-accent-success/20 border-accent-success/30 text-accent-success"
                    : "bg-surface-card border-border text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground"
                }`}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
        <pre className="p-4 overflow-x-auto text-sm bg-surface-card">
          <code className="font-mono">{codeString}</code>
        </pre>
        {!filename && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1.5 rounded border transition-all ${
              copied
                ? "bg-accent-success/20 border-accent-success/30 text-accent-success"
                : "bg-surface-card border-border text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground"
            }`}
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group my-4 rounded-lg border border-border overflow-hidden">
      {filename && (
        <div className="px-4 py-2 border-b border-border bg-surface-card/50 flex items-center justify-between">
          <span className="text-xs font-mono text-foreground-muted">{filename}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-foreground-muted uppercase">{language}</span>
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded border transition-all ${
                copied
                  ? "bg-accent-success/20 border-accent-success/30 text-accent-success"
                  : "bg-surface-card border-border text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground"
              }`}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}
      <div
        className="shiki-wrapper overflow-x-auto text-sm"
        style={{ backgroundColor: isDark ? "#0d1117" : "#f6f8fa" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!filename && (
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded border transition-all ${
            copied
              ? "bg-accent-success/20 border-accent-success/30 text-accent-success"
              : "bg-surface-card border-border text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground"
          }`}
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
    </div>
  );
}
