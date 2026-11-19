// Archived copies of published documentation, saved as writing samples.
// Each file in src/content/doc-snapshots is MongoDB's machine-readable Markdown
// export (the page URL with `.md` appended), stored exactly as fetched on
// `capturedAt`. Do not edit those files; capture a new snapshot instead.

export interface DocSnapshot {
  slug: string;
  title: string;
  /** The human-readable page that was captured. */
  sourceUrl: string;
  /** The Markdown export the file was fetched from. */
  markdownUrl: string;
  /** ISO date the snapshot was taken. */
  capturedAt: string;
  /** File name under src/content/doc-snapshots. */
  file: string;
  /** Set when only part of the source page is the author's work. */
  section?: string;
}

export const docSnapshots: DocSnapshot[] = [
  {
    slug: "claude-agent-sdk",
    title: "Integrate MongoDB with the Claude Agent SDK",
    sourceUrl:
      "https://www.mongodb.com/docs/atlas/ai-integrations/claude-agent-sdk/#std-label-claude-agent-sdk",
    markdownUrl: "https://www.mongodb.com/docs/atlas/ai-integrations/claude-agent-sdk.md",
    capturedAt: "2026-11-18",
    file: "claude-agent-sdk.md",
  },
  {
    slug: "deepagents-virtual-file-system",
    title: "DeepAgents Virtual File System",
    sourceUrl:
      "https://www.mongodb.com/docs/atlas/ai-integrations/langchain/#deepagents-virtual-file-system",
    markdownUrl: "https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md",
    capturedAt: "2026-11-18",
    file: "deepagents-virtual-file-system.md",
    section: "Integrate MongoDB with LangChain",
  },
  {
    slug: "agent-memory",
    title: "Agent Memory",
    sourceUrl: "https://www.mongodb.com/docs/agentengine/add-features/memory-types/?client=python",
    markdownUrl: "https://www.mongodb.com/docs/agentengine/add-features/memory-types.md",
    capturedAt: "2026-11-18",
    file: "agent-memory.md",
  },
];

export function docSnapshotHref(slug: string): string {
  return `/professional-work/snapshots/${slug}`;
}
