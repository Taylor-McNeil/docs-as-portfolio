"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyMarkdownButtonProps {
  encodedMarkdown: string;
}

export function CopyMarkdownButton({ encodedMarkdown }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Decode the base64 markdown
    const markdown = atob(encodedMarkdown);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-foreground-muted hover:text-foreground bg-surface-card border border-border rounded-md hover:bg-surface-sidebar transition-colors"
      title="Copy page as Markdown"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copy Markdown</span>
        </>
      )}
    </button>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { CopyMarkdownButton } from "@/components/content/CopyMarkdownButton";
 *
 * // Markdown must be base64 encoded
 * const encodedMarkdown = btoa("# Hello World\n\nThis is markdown content.");
 *
 * <CopyMarkdownButton encodedMarkdown={encodedMarkdown} />
 *
 * Props:
 * - encodedMarkdown: string (required) - Base64 encoded markdown content
 *
 * ASCII REPRESENTATION:
 *
 * Before click:
 * ┌─────────────────────┐
 * │ [📋] Copy Markdown  │
 * └─────────────────────┘
 *
 * After click (2s feedback):
 * ┌─────────────────────┐
 * │ [✓] Copied          │
 * └─────────────────────┘
 *
 * Typically used in GuideHeader/TutorialHeader to copy page content.
 */
