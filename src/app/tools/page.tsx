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
          href="/tools/tropecloud"
          className="block rounded border border-border bg-surface-card p-4 text-foreground hover:border-foreground-muted transition-colors"
        >
          <div className="font-semibold">Trope Cloud</div>
          <div className="text-sm text-foreground-muted mt-1">Visualize story tropes.</div>
        </Link>
      </div>
    </div>
  );
}
