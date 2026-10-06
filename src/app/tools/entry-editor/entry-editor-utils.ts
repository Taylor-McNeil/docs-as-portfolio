export { extractToc, slugifyHeading, type TocItem } from "@/lib/entry-headings";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { nextAampersandEntryNumber } from "@/data/aampersandEntries";
import type {
  DevlogPublicationSettings,
  DevlogRepositoryState,
} from "@/lib/entry-publication/types";

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
  version: typeof DRAFT_VERSION;
  source: string;
  settings: EntrySettings;
  publication: DevlogPublicationSettings | null;
  repository: DevlogRepositoryState | null;
}

export interface EntryWorkspaceDraft extends EntryDraft {
  id: string;
  name: string;
  updatedAt: string;
}

export interface DevlogDraftLibrary {
  version: 1;
  activeId: string;
  drafts: EntryWorkspaceDraft[];
}


export interface PasteConversion {
  markdown: string;
  omittedImages: boolean;
}

export const DRAFT_VERSION = 2;

const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);

const DEFAULT_DEVLOG_PUBLICATION: DevlogPublicationSettings = {
  slug: "entry-slug",
  coverage: { start: currentMonth, end: currentMonth },
  number: nextAampersandEntryNumber(),
  seoTitle: "Untitled Devlog — aampersand Builder Journal",
  socialDescription: "",
  jsonLdHeadline: `Untitled Devlog — aampersand Technical Devlog #${nextAampersandEntryNumber()}`,
  publishedAt: today,
  cardTitle: "Untitled Devlog",
  cardDescription: "",
  tag: "devlog",
  tagTone: "blue",
  preview: "default",
  llmsDescription: "",
};

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
    publication: DEFAULT_DEVLOG_PUBLICATION,
    repository: null,
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
    publication: null,
    repository: null,
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

export const DEVLOG_LIBRARY_STORAGE_KEY = "entry-editor-devlog-library-v1";

function createDraftId(prefix = "draft"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}:${crypto.randomUUID()}`;
  }
  return `${prefix}:${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createDevlogWorkspaceDraft(): EntryWorkspaceDraft {
  const draft = structuredClone(DEFAULT_DRAFTS.devlog);
  return {
    ...draft,
    id: createDraftId(),
    name: draft.settings.title,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDraft(value: unknown, kind: EntryKind): EntryDraft | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as {
    version?: number;
    source?: unknown;
    settings?: Partial<EntrySettings>;
    publication?: Partial<DevlogPublicationSettings> & {
      coverage?: Partial<DevlogPublicationSettings["coverage"]>;
    };
    repository?: Partial<DevlogRepositoryState> | null;
  };
  if (
    (parsed.version !== 1 && parsed.version !== DRAFT_VERSION) ||
    typeof parsed.source !== "string" ||
    !parsed.settings ||
    typeof parsed.settings.title !== "string"
  ) {
    return null;
  }

  const fallback = DEFAULT_DRAFTS[kind];
  const publication = kind === "devlog"
    ? {
        ...DEFAULT_DEVLOG_PUBLICATION,
        ...(parsed.publication ?? {}),
        coverage: {
          ...DEFAULT_DEVLOG_PUBLICATION.coverage,
          ...(parsed.publication?.coverage ?? {}),
        },
      }
    : null;
  const repository = parsed.repository &&
    typeof parsed.repository.originalSlug === "string" &&
    typeof parsed.repository.baseRevision === "string" &&
    (parsed.repository.ownership === "generated" || parsed.repository.ownership === "manual")
      ? parsed.repository as DevlogRepositoryState
      : null;

  return {
    version: DRAFT_VERSION,
    source: parsed.source,
    settings: {
      ...fallback.settings,
      ...parsed.settings,
      metadata: Array.isArray(parsed.settings.metadata) ? parsed.settings.metadata : fallback.settings.metadata,
    },
    publication,
    repository,
  };
}

export function readDraft(kind: EntryKind): EntryDraft {
  if (typeof window === "undefined") return DEFAULT_DRAFTS[kind];

  try {
    const raw = window.localStorage.getItem(draftStorageKey(kind));
    if (!raw) return DEFAULT_DRAFTS[kind];
    return normalizeDraft(JSON.parse(raw), kind) ?? DEFAULT_DRAFTS[kind];
  } catch {
    return DEFAULT_DRAFTS[kind];
  }
}

export function readDevlogDraftLibrary(): DevlogDraftLibrary {
  if (typeof window === "undefined") {
    const draft = createDevlogWorkspaceDraft();
    return { version: 1, activeId: draft.id, drafts: [draft] };
  }

  try {
    const raw = window.localStorage.getItem(DEVLOG_LIBRARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DevlogDraftLibrary>;
      const drafts = Array.isArray(parsed.drafts)
        ? parsed.drafts.flatMap((candidate) => {
            const draft = normalizeDraft(candidate, "devlog");
            if (!draft || typeof candidate.id !== "string") return [];
            return [{
              ...draft,
              id: candidate.id,
              name: typeof candidate.name === "string" ? candidate.name : draft.settings.title,
              updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
            }];
          })
        : [];
      if (drafts.length > 0) {
        const activeId = drafts.some((draft) => draft.id === parsed.activeId)
          ? parsed.activeId as string
          : drafts[0].id;
        return { version: 1, activeId, drafts };
      }
    }
  } catch {
    // Fall through to the legacy single-draft migration.
  }

  const legacy = readDraft("devlog");
  const migrated: EntryWorkspaceDraft = {
    ...structuredClone(legacy),
    id: createDraftId("migrated"),
    name: legacy.settings.title,
    updatedAt: new Date().toISOString(),
  };
  return { version: 1, activeId: migrated.id, drafts: [migrated] };
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
