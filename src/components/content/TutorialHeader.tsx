import { readFileSync } from "fs";
import { join } from "path";
import { Clock, Eye, Calendar, ExternalLink } from "lucide-react";
import { CopyMarkdownButton } from "./CopyMarkdownButton";

interface TutorialHeaderProps {
  title: string;
  description?: string;
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
    <header className="mt-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground-heading">{title}</h1>
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