"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Eye, FileCode } from "lucide-react";
import { convertMarkdownToAo3Html } from "./ao3-html";

const sampleMarkdown = `# Chapter Title

First paragraph with *italic*, **bold**, and <u>AO3 inline HTML</u>.
One soft line break stays inside the paragraph.

---

> A quoted line
> with another quoted line.

- A list item
- Another list item

| Detail | Value |
| --- | --- |
| Status | Ready |

<script>alert("nope")</script><font color="red">Unsupported tags are unwrapped.</font>`;

type ActiveTab = "html" | "preview";

export default function Ao3Previewer() {
  const [markdown, setMarkdown] = useState("");
  const [ao3Html, setAo3Html] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("html");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAo3Html(convertMarkdownToAo3Html(markdown));
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [markdown]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(ao3Html);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              aria-label="Back to tools"
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-950">AO3 Chapter Previewer</h1>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  dev tool
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Markdown in, AO3-safe HTML out.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMarkdown(sampleMarkdown)}
            className="hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex"
          >
            Load sample
          </button>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 p-4 sm:p-6">
        <section>
          <label htmlFor="ao3-markdown" className="mb-2 block text-sm font-semibold text-gray-700">
            Markdown
          </label>
          <textarea
            id="ao3-markdown"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            placeholder="Paste your markdown here..."
            spellCheck={false}
            className="h-[40vh] min-h-72 w-full resize-y rounded-md border border-gray-300 bg-white p-4 font-mono text-sm leading-6 text-gray-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </section>

        <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-md border border-gray-200 bg-white p-1" role="tablist" aria-label="Output tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "html"}
                onClick={() => setActiveTab("html")}
                className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "html" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <FileCode className="h-4 w-4" />
                AO3 HTML
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "preview"}
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "preview" ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={copyHtml}
              disabled={!ao3Html}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy HTML"}
            </button>
          </div>

          {activeTab === "html" ? (
            <pre className="h-[50vh] min-h-96 overflow-auto bg-[#0d1117] p-4 font-mono text-sm leading-6 text-slate-100">
              <code>{ao3Html || "<!-- Converted AO3 HTML will appear here. -->"}</code>
            </pre>
          ) : (
            <div className="h-[50vh] min-h-96 overflow-auto bg-white p-5">
              <div
                className="ao3-work-preview mx-auto"
                dangerouslySetInnerHTML={{
                  __html: ao3Html || "<p>Preview will appear here.</p>",
                }}
              />
            </div>
          )}
        </section>
      </main>

      <style>{`
        .ao3-work-preview {
          max-width: 700px;
          color: #333;
          font-family: Georgia, serif;
          font-size: 16px;
          line-height: 1.5;
        }

        .ao3-work-preview p {
          margin: 1em 0;
        }

        .ao3-work-preview h1 {
          font-size: 2em;
          margin: 0.67em 0;
        }

        .ao3-work-preview h2 {
          font-size: 1.5em;
          margin: 0.83em 0;
        }

        .ao3-work-preview h3 {
          font-size: 1.3em;
          margin: 1em 0;
        }

        .ao3-work-preview h4 {
          font-size: 1.1em;
          font-style: italic;
          margin: 1.33em 0;
        }

        .ao3-work-preview h5 {
          font-size: 1em;
          margin: 1.67em 0;
        }

        .ao3-work-preview h6 {
          font-size: 0.9em;
          margin: 2.33em 0;
        }

        .ao3-work-preview blockquote {
          border-left: 3px solid #ccc;
          color: #555;
          margin-left: 0;
          padding-left: 1em;
        }

        .ao3-work-preview hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 2em auto;
          width: 30%;
        }

        .ao3-work-preview pre,
        .ao3-work-preview code {
          background: #f5f5f5;
          font-family: monospace;
          padding: 2px 4px;
        }

        .ao3-work-preview pre {
          overflow-x: auto;
          padding: 1em;
        }

        .ao3-work-preview pre code {
          padding: 0;
        }

        .ao3-work-preview table {
          border-collapse: collapse;
          margin: 1em 0;
          width: 100%;
        }

        .ao3-work-preview th,
        .ao3-work-preview td {
          border: 1px solid #ccc;
          padding: 0.35em 0.5em;
          text-align: left;
        }

        .ao3-work-preview img {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
