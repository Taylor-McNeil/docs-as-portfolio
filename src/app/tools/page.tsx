import Link from "next/link";

export const metadata = {
  title: "Tools",
  alternates: { canonical: "https://taylormcneil.dev/tools" },
  robots: { index: false, follow: false },
};

export default function ToolsIndex() {
  return (
    <div className="space-y-6">
      <h1 className="text-foreground-heading text-2xl font-bold">Tools</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/tools/ogmaker"
          className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
        >
          <div className="font-semibold">OG Image Maker</div>
          <div className="text-sm text-foreground-muted mt-1">Generate 1200×630 OG images.</div>
        </Link>
        <Link
          href="/tools/ao3formatter"
          className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
        >
          <div className="font-semibold">AO3 Formatter</div>
          <div className="text-sm text-foreground-muted mt-1">Tag mixed-format chapter prose and export AO3-ready HTML.</div>
        </Link>
        <Link
          href="/tools/tropecloud"
          className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
        >
          <div className="font-semibold">Trope Cloud</div>
          <div className="text-sm text-foreground-muted mt-1">Visualize story tropes.</div>
        </Link>
        {/* Local-only tools are hidden here in production. Individual routes
            also guard themselves when they cannot run safely when deployed. */}
        {process.env.NODE_ENV === "development" && (
          <>
            <Link
              href="/tools/entry-editor"
              className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
            >
              <div className="font-semibold">Entry Editor</div>
              <div className="text-sm text-foreground-muted mt-1">Paste, compose, and preview component-rich MDX entries locally.</div>
            </Link>
            <Link
              href="/tools/youtube-comments-analyzer"
              className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
            >
              <div className="font-semibold">YouTube Comments Analyzer</div>
              <div className="text-sm text-foreground-muted mt-1">Pull YouTube comments locally and explore them with filters, summaries, and exports.</div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
