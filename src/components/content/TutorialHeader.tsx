import { readFileSync } from "fs";
import { join } from "path";
import { Clock, Eye, Calendar, ExternalLink } from "lucide-react";
import { CopyMarkdownButton } from "./CopyMarkdownButton";
import { MethodBadge } from "../navigation/MethodBadge";

type Method = "GET" | "POST" | "PUT" | "PATCH";

interface TutorialHeaderProps {
  title: string;
  description?: string;
  method?: Method;
  endpoint?: string;
  readTime?: string;
  views?: string;
  date?: string;
  source?: {
    name: string;
    url: string;
  };
  mdxPath?: string;
}

export function TutorialHeader({
  title,
  description,
  method,
  endpoint,
  readTime,
  views,
  date,
  source,
  mdxPath,
}: TutorialHeaderProps) {
  let encodedMarkdown: string | undefined;

  if (mdxPath) {
    try {
      const fullPath = join(process.cwd(), mdxPath);
      const content = readFileSync(fullPath, "utf-8");
      // Strip the import statements and metadata export at the top
      const markdown = content
        .replace(/^import .+;\n/gm, "")
        .replace(/^export const metadata[\s\S]*?};\n\n/m, "")
        .replace(/<ResponsePanel[\s\S]*?\/>\n\n/m, "")
        .replace(/<AnchorSidebar[\s\S]*?\/>\n\n/m, "")
        .replace(/<TutorialHeader[^>]*\/?>\n\n/m, "")
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
        {encodedMarkdown && <CopyMarkdownButton encodedMarkdown={encodedMarkdown} />}
      </div>
      
      {description && (
        <p className="mt-3 text-lg text-foreground">{description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-foreground-muted">
        {readTime && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{readTime}</span>
          </div>
        )}
        {views && (
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{views}</span>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
        )}
        {source && (
         <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground-muted hover:underline"
          >
            <ExternalLink size={14} />
            <span>{source.name}</span>
          </a>
        )}
      </div>
    </header>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { TutorialHeader } from "@/components/content/TutorialHeader";
 *
 * <TutorialHeader
 *   title="Building a Chatbot with Claude"
 *   description="Learn how to create an interactive chatbot using the Messages API."
 *   method="POST"
 *   endpoint="/v1/messages"
 *   readTime="15 min read"
 *   views="12.5k views"
 *   date="March 2024"
 *   source={{
 *     name: "Anthropic Docs",
 *     url: "https://docs.anthropic.com/tutorials/chatbot"
 *   }}
 *   mdxPath="src/app/tutorials/chatbot/page.mdx"
 * />
 *
 * Props:
 * - title: string (required) - Tutorial title
 * - description?: string - Brief description
 * - method?: "GET" | "POST" | "PUT" | "PATCH" - API method badge
 * - endpoint?: string - API endpoint
 * - readTime?: string - Estimated reading time
 * - views?: string - View count
 * - date?: string - Publication date
 * - source?: { name: string, url: string } - External source link
 * - mdxPath?: string - Path for copy markdown button
 *
 * ASCII REPRESENTATION:
 *
 * ┌──────┐
 * │ POST │  /v1/messages
 * └──────┘
 *
 * Building a Chatbot with Claude       [Copy Markdown]
 *
 * Learn how to create an interactive chatbot using the
 * Messages API.
 *
 * [🕐] 15 min read  [👁] 12.5k views  [📅] March 2024  [↗] Anthropic Docs
 *
 * More metadata than GuideHeader - suited for tutorials/articles.
 */