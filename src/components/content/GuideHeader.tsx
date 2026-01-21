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

/*
 * USAGE EXAMPLE:
 *
 * import { GuideHeader } from "@/components/content/GuideHeader";
 *
 * <GuideHeader
 *   title="Create a Message"
 *   description="Send a message to start a conversation with Claude."
 *   method="POST"
 *   endpoint="/v1/messages"
 *   mdxPath="src/app/guides/messages/page.mdx"
 *   liveDocUrl="https://docs.anthropic.com/messages"
 * />
 *
 * <GuideHeader
 *   title="Getting Started"
 *   description="Learn the basics of the API."
 * />
 *
 * Props:
 * - title: string (required) - Page title
 * - description?: string - Subtitle/description
 * - method?: "GET" | "POST" | "PUT" | "PATCH" - HTTP method badge
 * - endpoint?: string - API endpoint path
 * - mdxPath?: string - Path to MDX file (enables copy markdown button)
 * - liveDocUrl?: string - Link to live documentation
 *
 * ASCII REPRESENTATION:
 *
 * ┌──────┐
 * │ POST │  /v1/messages
 * └──────┘
 *
 * Create a Message          [See Live Doc] [Copy Markdown]
 *
 * Send a message to start a conversation with Claude.
 *
 * Features:
 * - Method badge + endpoint display
 * - Live doc button (external link)
 * - Copy markdown button (base64 encoded content)
 */