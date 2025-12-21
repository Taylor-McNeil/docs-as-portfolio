"use client";

import { useEffect } from "react";
import { useRightPanel } from "./RightPanelContext";
import { JsonRenderer } from "../content/JsonRenderer";
import { Terminal } from "lucide-react";

interface ResponsePanelProps {
  data: Record<string, unknown>;
}

export function ResponsePanel({ data }: ResponsePanelProps) {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(
      <div className="font-mono">
        <div className="sticky top-0 bg-surface-terminal backdrop-blur-sm p-3 border-b border-border flex justify-between items-center z-10">
          <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest flex items-center">
            <Terminal size={10} className="mr-1.5" /> Response Body
          </span>
          <span className="text-[10px] font-mono text-accent-success bg-accent-success/10 px-1.5 py-0.5 rounded">
            200 OK
          </span>
        </div>

        <div className="p-4 text-[11px] leading-relaxed">
          <JsonRenderer data={data} />
        </div>

        <div className="p-4 border-t border-border mt-4 bg-surface-card/30">
          <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3">
            Request Context
          </div>
          <div className="space-y-2.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Content-Type</span>
              <span className="text-foreground">application/json</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Size</span>
              <span className="text-foreground">1.2kb</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Time</span>
              <span className="text-foreground">24ms</span>
            </div>
          </div>
        </div>
      </div>
    );

    return () => setContent(null);
  }, [data, setContent]);

  return null;
}