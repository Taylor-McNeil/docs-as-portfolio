"use client";

import { useEffect, useRef } from "react";
import type { EntryDraft, EntryKind } from "./entry-editor-utils";

export interface PhonePreviewPayload {
  type: "entry-preview:update";
  draft: EntryDraft;
  kind: EntryKind;
  theme: "light" | "dark";
}

export function PhonePreview({ draft, kind, theme, width, landscape, onThemeChange }: Omit<PhonePreviewPayload, "type"> & { width: number; landscape: boolean; onThemeChange: (theme: "light" | "dark") => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const height = width === 375 ? 667 : width === 430 ? 932 : 844;
  const viewportWidth = landscape ? height : width;
  const viewportHeight = landscape ? width : height;

  useEffect(() => {
    // Synchronize the separate browsing context; drafts never enter URLs or storage.
    const send = () => frame.current?.contentWindow?.postMessage({ type: "entry-preview:update", draft, kind, theme } satisfies PhonePreviewPayload, window.location.origin);
    const receive = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "entry-preview:ready") send();
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "entry-preview:theme" && (event.data.theme === "light" || event.data.theme === "dark")) onThemeChange(event.data.theme);
    };
    window.addEventListener("message", receive);
    send();
    return () => window.removeEventListener("message", receive);
  }, [draft, kind, theme, onThemeChange]);

  return <div className="min-h-0 flex-1 overflow-auto bg-surface-terminal p-4">
    <p className="mb-3 text-center text-xs text-foreground-muted">{viewportWidth} × {viewportHeight} · {landscape ? "Landscape" : "Portrait"}</p>
    <iframe ref={frame} src="/tools/entry-editor/preview" title="Phone entry preview" className="mx-auto block rounded-2xl border-4 border-border bg-surface-bg shadow-xl" style={{ width: viewportWidth, height: viewportHeight, boxSizing: "content-box" }} />
  </div>;
}
