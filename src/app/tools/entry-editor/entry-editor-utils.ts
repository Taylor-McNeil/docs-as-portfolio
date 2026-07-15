import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

export type EntryKind = "devlog" | "project";
export type EntryMethod = "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS";

export interface MetadataRow {
  id: string;
  key: string;
  value: string;
}

export interface EntrySettings {
  title: string;
  method: EntryMethod;
  endpoint: string;
  description: string;
  metadata: MetadataRow[];
}

export interface EntryDraft {
  version: 1;
  source: string;
  settings: EntrySettings;
}

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
  duplicate: boolean;
}

export interface PasteConversion {
  markdown: string;
  omittedImages: boolean;
}

export const DRAFT_VERSION = 1;

export const DEFAULT_DRAFTS: Record<EntryKind, EntryDraft> = {
  devlog: {
    version: DRAFT_VERSION,
    settings: {
      title: "Untitled Devlog",
      method: "PUT",
      endpoint: "/aampersand/entry-slug",
      description: "",
      metadata: [],
    },
    source: `## Opening Section

Paste your Google Docs draft here, then use the toolbar to add the components that make the entry feel like the finished page.

<HeroQuote>
The preview uses the same components as the published site.
</HeroQuote>

## What Happened

Continue writing here.
`,
  },
  project: {
    version: DRAFT_VERSION,
    settings: {
      title: "Untitled Project",
      method: "POST",
      endpoint: "/side-projects/project-slug",
      description: "A concise description of the project.",
      metadata: [
        { id: "status", key: "status", value: "Shipped" },
        { id: "stack", key: "stack", value: "React, TypeScript" },
      ],
    },
    source: `## The Project

Explain what you built, who it serves, and why it matters.

<Callout type="context">
Add the context a reader needs before the deeper technical story.
</Callout>

## Interesting Problems

Describe the decisions and trade-offs that shaped the work.

## Links

- [Live site](https://example.com)
- [Source code](https://github.com)
`,
  },
};

export function draftStorageKey(kind: EntryKind): string {
  return `entry-editor-draft-v1-${kind}`;
}

export function readDraft(kind: EntryKind): EntryDraft {
  if (typeof window === "undefined") return DEFAULT_DRAFTS[kind];

  try {
    const raw = window.localStorage.getItem(draftStorageKey(kind));
    if (!raw) return DEFAULT_DRAFTS[kind];

    const parsed = JSON.parse(raw) as Partial<EntryDraft>;
    if (
      parsed.version !== DRAFT_VERSION ||
      typeof parsed.source !== "string" ||
      !parsed.settings ||
      typeof parsed.settings.title !== "string"
    ) {
      return DEFAULT_DRAFTS[kind];
    }

    return parsed as EntryDraft;
  } catch {
    return DEFAULT_DRAFTS[kind];
  }
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractToc(source: string): TocItem[] {
  const seen = new Set<string>();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const label = match[2].replace(/\s+#+\s*$/, "").trim();
    const id = slugifyHeading(label);
    if (!id) continue;

    const duplicate = seen.has(id);
    items.push({ id, label: label.replace(/[`*_~]/g, ""), level: match[1].length as 2 | 3, duplicate });
    seen.add(id);
  }

  return items;
}

export function convertRichHtmlToMarkdown(html: string): PasteConversion {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const omittedImages = document.querySelector("img") !== null;

  document.querySelectorAll("script, style, meta, link, title, img").forEach((node) => node.remove());
  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (!['href', 'colspan', 'rowspan'].includes(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });
  turndown.use(gfm);
  turndown.addRule("emptyGoogleSpan", {
    filter: (node) => node.nodeName === "SPAN" && !(node.textContent ?? "").trim(),
    replacement: () => "",
  });

  const markdown = turndown
    .turndown(document.body.innerHTML)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { markdown, omittedImages };
}

export function insertAtSelection(
  source: string,
  start: number,
  end: number,
  before: string,
  after = "",
  fallback = "",
): { source: string; selectionStart: number; selectionEnd: number } {
  const selected = source.slice(start, end) || fallback;
  const inserted = `${before}${selected}${after}`;
  return {
    source: `${source.slice(0, start)}${inserted}${source.slice(end)}`,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

export function parseMetadataValue(value: string): string | string[] {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts : value.trim();
}
