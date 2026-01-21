interface InlineCodeProps {
  children: React.ReactNode;
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="px-1.5 py-0.5 bg-surface-card border border-border rounded text-sm font-mono">
      {children}
    </code>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { InlineCode } from "@/components/content/InlineCode";
 *
 * <p>
 *   Use the <InlineCode>console.log()</InlineCode> function to debug.
 * </p>
 *
 * <p>
 *   Set <InlineCode>NODE_ENV</InlineCode> to <InlineCode>production</InlineCode>.
 * </p>
 *
 * Props:
 * - children: ReactNode (required) - The code text to display
 *
 * ASCII REPRESENTATION:
 *
 * Regular text with ┌──────────────┐ inline code styling.
 *                   │ console.log  │
 *                   └──────────────┘
 *
 * Use the `console.log()` function to debug your code.
 *       └────────────┘
 *       Styled with background, border, and monospace font
 *
 * For short code snippets within paragraphs.
 * For multi-line code, use CodeBlock instead.
 */
