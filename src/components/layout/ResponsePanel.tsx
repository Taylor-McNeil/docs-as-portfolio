"use client";

import { useEffect, useMemo } from "react";
import { useRightPanel } from "./RightPanelContext";
import { JsonRenderer, JsonValue } from "../content/JsonRenderer";
import { RequestContext } from "./RequestContext";
import { Terminal, PanelRightClose } from "lucide-react";

interface ResponsePanelProps {
  data: JsonValue;
}

function ResponsePanelContent({ 
  data, 
  dataSize,
  onCollapse 
}: ResponsePanelProps & { dataSize: number; onCollapse: () => void }) {
  return (
    <div className="font-mono">
      <div className="sticky top-0 bg-surface-terminal backdrop-blur-sm p-3 border-b border-border flex justify-between items-center">
        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest flex items-center">
          <Terminal size={10} className="mr-1.5" /> Response Body
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-accent-success bg-accent-success/10 px-1.5 py-0.5 rounded">
            200 OK
          </span>
          <button
            onClick={onCollapse}
            className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
            title="Collapse panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 text-[11px] leading-relaxed">
        <JsonRenderer data={data} />
      </div>

      <RequestContext dataSize={dataSize} />
    </div>
  );
}

export function ResponsePanel({ data }: ResponsePanelProps) {
  const { setContent, setWidth, toggleCollapsed } = useRightPanel();

  // Calculate size from data
  const dataSize = useMemo(() => {
    return new Blob([JSON.stringify(data)]).size;
  }, [data]);

  useEffect(() => {
    setWidth("medium");
    setContent(
      <ResponsePanelContent
        data={data}
        dataSize={dataSize}
        onCollapse={toggleCollapsed}
      />
    );

    return () => {
      setContent(null);
      setWidth("normal");
    };
  }, [data, dataSize, setContent, setWidth, toggleCollapsed]);

  return null;
}