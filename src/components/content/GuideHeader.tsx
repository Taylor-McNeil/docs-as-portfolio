import { readFileSync } from "fs";
import { join } from "path";
import { CopyMarkdownButton } from "./CopyMarkdownButton";
import { LiveDocButton } from "./LiveDocButton";
import { MethodBadge } from "../navigation/MethodBadge";

type Method = "GET" | "POST" | "PUT" | "PATCH";

interface GuideHeaderProps {
  title: string;
  description?: string;
  method?: Method;
  endpoint?: string;
  mdxPath?: string;
  liveDocUrl?: string;
}

export function GuideHeader({ title, description, method, endpoint, mdxPath, liveDocUrl }: GuideHeaderProps) {
  let encodedMarkdown: string | undefined;

  if (mdxPath) {
    try {
      const fullPath = join(process.cwd(), mdxPath);
      const content = readFileSync(fullPath, "utf-8");
      // Strip the import statements and metadata export at the top
      const markdown = content
        .replace(/^import .+;\n/gm, "")
        .replace(/^export const metadata[\s\S]*?};\n\n/m, "")
        .replace(/<AnchorSidebar[\s\S]*?\/>\n\n/m, "")
        .replace(/<GuideHeader[^>]*\/?>\n\n/m, "")
        .trim();
      // Base64 encode to avoid JSON serialization issues
      encodedMarkdown = Buffer.from(markdown).toString("base64");
    } catch {
      // File not found, skip copy button
    }
  }

  return (
    <header className="mt-4 mb-6 space-y-4">
      {method && endpoint && (
        <div className="flex items-center gap-3">
          <MethodBadge method={method} active size="md" />
          <span className="font-mono text-sm text-foreground-muted">{endpoint}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground-heading leading-none">{title}</h1>
        <div className="flex items-center gap-2">
          {liveDocUrl && <LiveDocButton href={liveDocUrl} />}
          {encodedMarkdown && <CopyMarkdownButton encodedMarkdown={encodedMarkdown} />}
        </div>
      </div>
      {description && (
        <p className="text-lg text-foreground-muted">{description}</p>
      )}
    </header>
  );
}