"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { ShellInner } from "@/components/layout/Shell";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnchorSidebar } from "@/components/layout/AnchorSidebar";
import type { ComponentRegistrySources } from "@/components/interactive/ComponentRegistry";
import { extractToc } from "../entry-editor-utils";
import { createPreviewComponents, findUnregisteredComponent, previewCompatibleSource, PreviewErrorBoundary, PreviewHeader, ProjectMetadata } from "../entry-preview-rendering";
import type { PhonePreviewPayload } from "../phone-preview";

export function PreviewFrame({ componentRegistrySources }: { componentRegistrySources: ComponentRegistrySources }) {
  const [payload, setPayload] = useState<PhonePreviewPayload | null>(null);
  const [Content, setContent] = useState<ComponentType<{ components?: MDXComponents }> | null>(null);
  const [error, setError] = useState("");
  const components = useMemo(() => createPreviewComponents(componentRegistrySources), [componentRegistrySources]);
  const source = payload?.draft.source;
  const toc = useMemo(() => source !== undefined ? extractToc(source).map(({ id, label, level }) => ({ id, label, level })) : [], [source]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "entry-preview:update") return;
      setPayload(event.data as PhonePreviewPayload);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "entry-preview:ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (source === undefined) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const unknown = findUnregisteredComponent(source, components);
        if (unknown) throw new Error(`${unknown} is not registered for preview.`);
        const result = await evaluate(previewCompatibleSource(source), { ...runtime, remarkPlugins: [remarkGfm], development: false });
        if (!cancelled) { setContent(() => result.default); setError(""); }
      } catch (issue) {
        if (!cancelled) setError(issue instanceof Error ? issue.message : "Could not compile preview.");
      }
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [source, components]);

  const themeControl = <button type="button" aria-label="Toggle theme" title="Toggle theme" className="rounded-full p-2 text-foreground-muted hover:bg-surface-card" onClick={() => window.parent.postMessage({ type: "entry-preview:theme", theme: payload?.theme === "dark" ? "light" : "dark" }, window.location.origin)}>{payload?.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>;
  // Include next-themes in the initial server render so its initialization script
  // is parsed by the browser, rather than inserted after the draft arrives.
  return <ThemeProvider attribute="class" forcedTheme={payload?.theme ?? "dark"} storageKey="entry-phone-preview-theme" enableSystem={false}><div onClickCapture={(event) => {
    const link = (event.target as Element).closest("a");
    if (!link || link.getAttribute("href")?.startsWith("#") || !link.href) return;
    // Keep navigation from replacing the live draft's browsing context.
    event.preventDefault();
    event.stopPropagation();
    window.open(link.href, "_blank", "noopener,noreferrer");
  }}>
    {payload ? (
    <ShellInner sidebar={<Sidebar themeControl={themeControl} />} themeControl={themeControl} publishedPreview>
      <AnchorSidebar items={toc} />
      {payload.kind === "project" && <ProjectMetadata rows={payload.draft.settings.metadata} />}
      <PreviewHeader settings={payload.draft.settings} />
      {error && <p role="alert" className="mb-4 rounded border border-method-put p-3 text-sm text-method-put">Showing last valid version. {error}</p>}
      {Content ? <PreviewErrorBoundary key={payload.draft.source} onError={(issue) => setError(issue.message)}><Content components={components} /></PreviewErrorBoundary> : <p>Preparing preview…</p>}
    </ShellInner>
    ) : <p className="p-6 text-foreground-muted">Waiting for editor…</p>}
  </div></ThemeProvider>;
}
