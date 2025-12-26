"use client";

import { useEffect, useState } from "react";

interface RequestContextProps {
  dataSize: number;
}

export function RequestContext({ dataSize }: RequestContextProps) {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [traceId] = useState(() => `tm-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const timer = setTimeout(() => {
      const entries = performance.getEntriesByType("navigation");
      if (entries.length > 0) {
        const timing = entries[0] as PerformanceNavigationTiming;
        const time = Math.round(timing.responseEnd - timing.requestStart);
        setLoadTime(time > 0 ? time : Math.round(timing.domContentLoadedEventEnd - timing.startTime));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)}kb`;
    }
    return `${bytes}b`;
  };

  return (
    <div className="p-4 border-t border-border mt-4 bg-surface-card/30">
      <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3">
        Request Context
      </div>
      <table className="w-full text-[11px]">
        <tbody>
          <tr>
            <td className="text-foreground-muted py-1">Content-Type</td>
            <td className="text-foreground-terminal font-mono text-right py-1">application/json</td>
          </tr>
          <tr>
            <td className="text-foreground-muted py-1">Size</td>
            <td className="text-foreground-terminal font-mono text-right py-1">{formatSize(dataSize)}</td>
          </tr>
          <tr>
            <td className="text-foreground-muted py-1">Time</td>
            <td className="text-foreground-terminal font-mono text-right py-1">
              {loadTime !== null ? `${loadTime}ms` : "—"}
            </td>
          </tr>
          <tr>
            <td className="text-foreground-muted py-1">Trace ID</td>
            <td className="text-foreground-terminal font-mono text-right py-1">{traceId}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}