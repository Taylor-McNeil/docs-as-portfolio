import { FileText, Code, Download } from "lucide-react";
import { ReactNode } from "react";

type FileType = "document" | "code";

interface DownloadCardProps {
  title: string;
  fileType: FileType;
  format: string;
  href: string;
  filename?: string;
}

interface DownloadCardGroupProps {
  children: ReactNode;
  layout?: "grid" | "stack";
}

const icons: Record<FileType, ReactNode> = {
  document: <FileText size={24} className="text-foreground-muted" />,
  code: <Code size={24} className="text-foreground-muted" />,
};

const labels: Record<FileType, string> = {
  document: "Document",
  code: "Code",
};

export function DownloadCard({ title, fileType, format, href, filename }: DownloadCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border-card bg-surface-card">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-surface-sidebar flex items-center justify-center">
          {icons[fileType]}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-xs text-foreground-muted">
            {labels[fileType]} &middot; {format.toUpperCase()}
          </div>
        </div>
      </div>
      <a
        href={href}
        download={filename}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
      >
        <Download size={14} />
        Download
      </a>
    </div>
  );
}

export function DownloadCardGroup({ children, layout = "grid" }: DownloadCardGroupProps) {
  const layoutClass = layout === "grid"
    ? "grid grid-cols-1 md:grid-cols-2 gap-3"
    : "space-y-3";

  return (
    <div className={`my-6 ${layoutClass}`}>
      {children}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { DownloadCard, DownloadCardGroup } from "@/components/content/DownloadCard";
 *
 * <DownloadCardGroup layout="grid">
 *   <DownloadCard
 *     title="API Reference Guide"
 *     fileType="document"
 *     format="pdf"
 *     href="/downloads/api-reference.pdf"
 *     filename="api-reference.pdf"
 *   />
 *   <DownloadCard
 *     title="Example Project"
 *     fileType="code"
 *     format="zip"
 *     href="/downloads/example-project.zip"
 *   />
 * </DownloadCardGroup>
 *
 * <DownloadCardGroup layout="stack">
 *   <DownloadCard
 *     title="Quick Start Template"
 *     fileType="code"
 *     format="tar.gz"
 *     href="/downloads/template.tar.gz"
 *   />
 * </DownloadCardGroup>
 *
 * Props (DownloadCard):
 * - title: string (required) - File title
 * - fileType: "document" | "code" - Icon and label type
 * - format: string - File format (shown uppercase)
 * - href: string (required) - Download URL
 * - filename?: string - Downloaded filename
 *
 * Props (DownloadCardGroup):
 * - children: ReactNode - DownloadCard components
 * - layout?: "grid" | "stack" - Layout style (default: "grid")
 *
 * ASCII REPRESENTATION (grid layout):
 *
 * ┌─────────────────────────────────┐ ┌─────────────────────────────────┐
 * │ ┌────┐                          │ │ ┌────┐                          │
 * │ │ 📄 │  API Reference Guide     │ │ │ </> │  Example Project        │
 * │ └────┘  Document · PDF          │ │ └────┘  Code · ZIP              │
 * │                     [Download]  │ │                     [Download]  │
 * └─────────────────────────────────┘ └─────────────────────────────────┘
 *
 * ASCII REPRESENTATION (stack layout):
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ ┌────┐                                                               │
 * │ │ </> │  Quick Start Template                               [Download] │
 * │ └────┘  Code · TAR.GZ                                                │
 * └──────────────────────────────────────────────────────────────────────┘
 */
