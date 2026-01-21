"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isDark = resolvedTheme === "dark";

    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      fontFamily: "inherit",
      themeVariables: isDark
        ? {
            background: "transparent",
            primaryColor: "#3b82f6",
            primaryTextColor: "#e5e7eb",
            primaryBorderColor: "#4b5563",
            lineColor: "#6b7280",
            secondaryColor: "#1f2937",
            tertiaryColor: "#374151",
            titleColor: "#e5e7eb",
            nodeTextColor: "#e5e7eb",
          }
        : {
            background: "transparent",
            primaryColor: "#1e293b",
            primaryTextColor: "#1e293b",
            primaryBorderColor: "#334155",
            lineColor: "#64748b",
            secondaryColor: "#e2e8f0",
            tertiaryColor: "#f1f5f9",
            titleColor: "#0f172a",
            nodeTextColor: "#f8fafc",
            edgeLabelBackground: "#1e293b",
          },
    });

    const renderChart = async () => {
      if (containerRef.current) {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        try {
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (error) {
          console.error("Mermaid rendering error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    renderChart();
  }, [chart, resolvedTheme, mounted]);

  return (
    <div ref={containerRef} className="my-6 overflow-x-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-32 bg-surface-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-foreground-muted text-sm">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading diagram...</span>
          </div>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { Mermaid } from "@/components/content/Mermaid";
 *
 * <Mermaid chart={`
 * graph TD
 *     A[Client] --> B[API Gateway]
 *     B --> C[Auth Service]
 *     B --> D[Message Service]
 *     D --> E[(Database)]
 * `} />
 *
 * <Mermaid chart={`
 * sequenceDiagram
 *     participant User
 *     participant API
 *     participant Claude
 *     User->>API: Send message
 *     API->>Claude: Forward request
 *     Claude-->>API: Generate response
 *     API-->>User: Return response
 * `} />
 *
 * Props:
 * - chart: string (required) - Mermaid diagram definition
 *
 * ASCII REPRESENTATION:
 *
 * Loading state:
 * ┌─────────────────────────────────────┐
 * │                                     │
 * │        [⟳] Loading diagram...       │
 * │                                     │
 * └─────────────────────────────────────┘
 *
 * Rendered flowchart:
 * ┌─────────────────────────────────────┐
 * │         ┌──────────┐                │
 * │         │  Client  │                │
 * │         └────┬─────┘                │
 * │              │                      │
 * │              ▼                      │
 * │       ┌────────────┐                │
 * │       │ API Gateway│                │
 * │       └──────┬─────┘                │
 * │         ┌────┴────┐                 │
 * │         ▼         ▼                 │
 * │    ┌───────┐ ┌─────────┐            │
 * │    │ Auth  │ │ Message │            │
 * │    └───────┘ └────┬────┘            │
 * │                   ▼                 │
 * │              ┌─────────┐            │
 * │              │   DB    │            │
 * │              └─────────┘            │
 * └─────────────────────────────────────┘
 *
 * Supports: flowcharts, sequence diagrams, etc.
 * Uses neutral theme with inherited fonts.
 */
