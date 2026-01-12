"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      fontFamily: "inherit",
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
  }, [chart]);

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
