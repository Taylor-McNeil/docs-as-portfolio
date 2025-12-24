import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Callout } from "@/components/content/Callout";
import { CodeBlock } from "@/components/content/CodeBlock";
import { InlineCode } from "@/components/content/InlineCode";
import { Children, isValidElement, ReactNode } from "react";

// Helper to extract text content from React children
function getCodeString(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getCodeString).join("");
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    if (props.children) {
      return getCodeString(props.children);
    }
  }
  return "";
}

// Helper to generate URL-friendly IDs from heading text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with auto IDs for anchor navigation
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-foreground-heading mb-4">{children}</h1>
    ),
    h2: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h2 id={id} className="text-xl font-semibold text-foreground-heading mt-10 mb-4 scroll-mt-6">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h3 id={id} className="text-lg font-semibold text-foreground-heading mt-8 mb-3 scroll-mt-6">
          {children}
        </h3>
      );
    },

    // Text
    p: ({ children }) => (
      <p className="text-foreground-muted leading-relaxed mb-4">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent/50 pl-4 italic text-foreground-muted my-4">
        {children}
      </blockquote>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 text-foreground-muted mb-4 ml-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 text-foreground-muted mb-4 ml-2">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground-muted">{children}</li>
    ),

    // Links
    a: ({ href, children }) => (
      <Link href={href || "#"} className="text-accent hover:underline">
        {children}
      </Link>
    ),

    // Inline code only (code blocks have a language className)
    code: ({ children, className }) => {
      // If it has a language class (e.g., language-js), it's part of a code block - skip styling
      if (className?.startsWith("language-")) {
        return <code className={className}>{children}</code>;
      }
      // Inline code styling - subtle background, no border
      return (
        <code className="px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
          {children}
        </code>
      );
    },

    // Code blocks - extract language and code, render with Shiki
    // Supports: ```javascript:filename.js for filename headers
    pre: ({ children }) => {
      const childArray = Children.toArray(children);
      const firstChild = childArray[0];

      // Try to get props from the first child (should be a code element)
      if (isValidElement(firstChild)) {
        const props = firstChild.props as { className?: string; children?: ReactNode };
        const className = props.className || "";

        // Parse language and optional filename from "language-javascript:filename.js"
        const langPart = className.replace(/language-/, "");
        const [language, filename] = langPart.includes(":")
          ? langPart.split(":")
          : [langPart || "text", undefined];

        const code = getCodeString(props.children);

        return <CodeBlock code={code} language={language} filename={filename} />;
      }

      // Fallback: render as plain pre with styling
      return (
        <pre className="p-4 bg-surface-card rounded-lg border border-border overflow-x-auto text-sm font-mono my-4">
          {children}
        </pre>
      );
    },

    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-surface-card border-b border-border">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="text-left p-3 text-foreground-heading font-semibold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="p-3 text-foreground-muted">{children}</td>
    ),

    // Custom components
    Callout,
    InlineCode,

    ...components,
  };
}