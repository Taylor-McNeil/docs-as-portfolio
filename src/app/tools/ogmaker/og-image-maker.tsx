"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toBlob, toPng } from "html-to-image";
import { ArrowLeft, Check, Copy, Download, LayoutTemplate, RefreshCw, RotateCcw } from "lucide-react";
import { loadFonts } from "./lib/fonts";
import { buildFileName } from "./lib/text";
import { SITES, TEMPLATES, TEMPLATES_BY_ID, type SharedText, type SiteId } from "./templates";
import type { TemplateSettings } from "./templates/types";
import { Divider } from "./ui/controls";

/*
 * The OG image maker shell: site and template pickers, the template's own
 * controls, a 1200×630 preview, and PNG export at 2x. The templates live in
 * ./templates; this file knows nothing about any one of them.
 */

const WIDTH = 1200;
const HEIGHT = 630;
const STORAGE_KEY = "ogmaker:v2";

type Saved = {
  templateId: string;
  text: SharedText;
  settingsById: Record<string, TemplateSettings>;
  suffix: string;
};

function initialState(): Saved {
  const fallback: Saved = {
    templateId: TEMPLATES[0].id,
    text: TEMPLATES[0].sampleText,
    settingsById: {},
    suffix: "",
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<Saved>;
    return {
      templateId: saved.templateId && TEMPLATES_BY_ID[saved.templateId] ? saved.templateId : fallback.templateId,
      text: { ...fallback.text, ...saved.text },
      settingsById: saved.settingsById && typeof saved.settingsById === "object" ? saved.settingsById : {},
      suffix: typeof saved.suffix === "string" ? saved.suffix : "",
    };
  } catch {
    return fallback;
  }
}

type Status = { kind: "idle" } | { kind: "busy"; action: "export" | "copy" } | { kind: "copied" } | { kind: "error"; message: string };

const chip = (active: boolean) =>
  `py-2 px-2 text-sm rounded-md border transition-colors ${active ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`;

export default function OgImageMaker() {
  const [state] = useState(initialState);
  const [templateId, setTemplateId] = useState(state.templateId);
  const [text, setTextState] = useState<SharedText>(state.text);
  const [settingsById, setSettingsById] = useState(state.settingsById);
  const [suffix, setSuffix] = useState(state.suffix);
  const [nameOverride, setNameOverride] = useState<{ base: string; value: string } | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [scale, setScale] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES_BY_ID[templateId];
  const settings = { ...template.defaults, ...settingsById[templateId] };
  const autoName = template.fileName(text, settings);
  const baseName = nameOverride && nameOverride.base === autoName ? nameOverride.value : autoName;
  const fileName = buildFileName(baseName, suffix);
  const { Controls, Render } = template;

  useEffect(() => {
    let cancelled = false;
    loadFonts().then(
      () => !cancelled && setFontsReady(true),
      (error: unknown) => {
        if (cancelled) return;
        setFontError(error instanceof Error ? error.message : "Fonts failed to load.");
        setFontsReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / WIDTH)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const saved: Saved = { templateId, text, settingsById, suffix };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage can be unavailable (private windows); the tool still works.
    }
  }, [templateId, text, settingsById, suffix]);

  const setText = (patch: Partial<SharedText>) => setTextState((prev) => ({ ...prev, ...patch }));
  const updateSettings = (patch: Partial<TemplateSettings>) =>
    setSettingsById((prev) => ({ ...prev, [templateId]: { ...prev[templateId], ...patch } }));

  const switchSite = (site: SiteId) => {
    const first = TEMPLATES.find((t) => t.site === site);
    if (first) setTemplateId(first.id);
  };

  const resetTemplate = () => {
    setTextState(template.sampleText);
    setSettingsById((prev) => {
      const next = { ...prev };
      delete next[templateId];
      return next;
    });
    setNameOverride(null);
  };

  const renderOptions = async () => ({
    width: WIDTH,
    height: HEIGHT,
    pixelRatio: 2,
    fontEmbedCSS: await loadFonts(),
    backgroundColor: template.background(settings),
    // Applied to the clone only: the on-screen preview keeps its scale.
    style: { transform: "none", opacity: "1" },
  });

  const handleExport = async () => {
    const node = nodeRef.current;
    if (!node) return;
    setStatus({ kind: "busy", action: "export" });
    try {
      const dataUrl = await toPng(node, await renderOptions());
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setStatus({ kind: "idle" });
    } catch (error) {
      console.error("Failed to export image:", error);
      setStatus({ kind: "error", message: "Export failed. Check the console for details." });
    }
  };

  const handleCopy = async () => {
    const node = nodeRef.current;
    if (!node) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      setStatus({ kind: "error", message: "This browser can't copy images. Use Export PNG instead." });
      return;
    }
    setStatus({ kind: "busy", action: "copy" });
    try {
      // The ClipboardItem gets the promise itself so Safari keeps the user gesture.
      const blob = renderOptions()
        .then((options) => toBlob(node, options))
        .then((b) => {
          if (!b) throw new Error("Empty image");
          return b;
        });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus({ kind: "copied" });
      window.setTimeout(() => setStatus((s) => (s.kind === "copied" ? { kind: "idle" } : s)), 2000);
    } catch (error) {
      console.error("Failed to copy image:", error);
      setStatus({ kind: "error", message: "Copy failed. Check the console for details." });
    }
  };

  const busy = status.kind === "busy";
  const sitePresets = TEMPLATES.filter((t) => t.site === template.site);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[400px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto md:h-screen shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 border-b pb-4">
            <Link href="/tools" aria-label="Back to tools" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LayoutTemplate className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">OG Image Maker</h1>
          </div>
          <div className="space-y-6">
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2">Site</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SITES.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => switchSite(site.id)}
                    className={`${chip(template.site === site.id)} ${site.id === "taylormcneil" ? "text-xs font-mono" : ""}`}
                  >
                    {site.id === "aampersand" ? (
                      <>
                        <span style={{ fontFamily: "'Fraunces', serif" }}>&amp;</span>
                        {site.label}
                      </>
                    ) : (
                      site.label
                    )}
                  </button>
                ))}
              </div>
            </div>
            <Divider />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-sm font-semibold text-gray-700">Templates</span>
                <button
                  type="button"
                  onClick={resetTemplate}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="Put back this template's example words and settings"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to template
                </button>
              </div>
              <div className={`grid gap-2 ${sitePresets.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {sitePresets.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTemplateId(t.id)} className={chip(templateId === t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Your words stay put when you switch site or template.</p>
            </div>
            <Divider />

            <Controls text={text} setText={setText} settings={settings} defaults={template.defaults} update={updateSettings} />
          </div>
        </div>

        {/* Sticky Footer Controls */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-[1fr_4.5rem] gap-2">
            <label className="block">
              <span className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1">
                File name
                {baseName !== autoName && (
                  <button type="button" onClick={() => setNameOverride(null)} className="text-indigo-500 hover:text-indigo-700">
                    Use automatic
                  </button>
                )}
              </span>
              <input
                type="text"
                value={baseName}
                spellCheck={false}
                onChange={(e) => setNameOverride({ base: autoName, value: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-gray-500 mb-1">Version</span>
              <input
                type="text"
                value={suffix}
                placeholder="v2"
                spellCheck={false}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>
          <p className="text-[11px] text-gray-400 -mt-1">
            Saves as <span className="font-mono text-gray-600">{fileName}</span>. Add a version when replacing a live image so
            chat apps and social sites don&apos;t show the cached old one.
          </p>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={busy || !fontsReady}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {status.kind === "busy" && status.action === "export" ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {status.kind === "busy" && status.action === "export" ? "Generating..." : "Export PNG"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={busy || !fontsReady}
              title="Copy the image to paste into chat or a CMS"
              className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {status.kind === "copied" ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : status.kind === "busy" && status.action === "copy" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {status.kind === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
          {status.kind === "error" && (
            <p role="alert" className="text-xs text-red-600">
              {status.message}
            </p>
          )}
          <p className="text-center text-xs text-gray-500">Renders a high-res 2400×1260 image (2x)</p>
        </div>
      </div>

      {/* RIGHT WORKSPACE - PREVIEW */}
      <div className="flex-grow p-6 md:p-12 flex flex-col items-center justify-center overflow-hidden bg-[#e5e7eb] relative">
        {!fontsReady && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading fonts…
          </div>
        )}
        {fontError && (
          <div role="alert" className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 text-xs font-medium px-3 py-1.5 rounded-full z-50">
            {fontError} Exports may use fallback fonts.
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full max-w-[1200px] mx-auto shadow-2xl relative rounded-md overflow-hidden"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        >
          <div
            id="og-preview-node"
            ref={nodeRef}
            style={{
              width: `${WIDTH}px`,
              height: `${HEIGHT}px`,
              backgroundColor: template.background(settings),
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: template.baseFont,
              opacity: fontsReady ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <Render text={text} settings={settings} fontsReady={fontsReady} />
          </div>
        </div>
      </div>
    </div>
  );
}
