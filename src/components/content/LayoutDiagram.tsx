import { ReactNode } from "react";

interface LayoutDiagramProps {
  title: string;
  children: ReactNode;
}

export function LayoutDiagram({ title, children }: LayoutDiagramProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-surface-card border-b border-border">
        <span className="text-xs font-mono text-foreground-muted">
          {title}
        </span>
      </div>

      {/* ASCII Diagram */}
      <div className="bg-surface-terminal overflow-x-auto">
        <pre
          className="p-4 text-sm leading-none text-foreground-terminal"
          style={{
            fontFamily: '"Menlo", "Cascadia Mono", "Consolas", monospace',
            letterSpacing: "0em",
          }}
        >
          {typeof children === "string" ? children.trim() : children}
        </pre>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { LayoutDiagram } from "@/components/content/LayoutDiagram";
 *
 * <LayoutDiagram title="Design-One">
 * {`
 * ┌─────────────────────────────────────┐
 * │           Header                    │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │ Sidebar  │    Main (Editor)         │
 * │ (fixed)  │                          │
 * │          │                          │
 * └──────────┴──────────────────────────┘
 * `}
 * </LayoutDiagram>
 *
 * Props:
 * - title: string (required) - Label shown in the header bar
 * - children: ReactNode (required) - Raw ASCII string as template literal
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────────────┐
 * │ Design-One                                  │
 * ├─────────────────────────────────────────────┤
 * │                                             │
 * │  ┌───────────────────────────────────────┐  │
 * │  │           Header                      │  │
 * │  ├──────────┬────────────────────────────┤  │
 * │  │ Sidebar  │    Main (Editor)           │  │
 * │  └──────────┴────────────────────────────┘  │
 * │                                             │
 * └─────────────────────────────────────────────┘
 *
 * CSS fixes for pixel-perfect ASCII alignment:
 * - leading-none (line-height: 1) eliminates gaps between rows
 * - fontVariantLigatures: none disables Fira Code ligatures
 * - fontFeatureSettings disables liga and calt OpenType features
 * - letterSpacing: 0 ensures uniform character width
 */
