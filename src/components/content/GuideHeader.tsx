import { readFileSync } from "fs";
import { join } from "path";
import { CopyMarkdownButton } from "./CopyMarkdownButton";

interface GuideHeaderProps {
  title: string;
  mdxPath?: string;
}

export function GuideHeader({ title, mdxPath }: GuideHeaderProps) {
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
        .replace(/<GuideHeader[^>]*>[\s\S]*?<\/GuideHeader>\n\n/m, "")
        .trim();
      // Base64 encode to avoid JSON serialization issues
      encodedMarkdown = Buffer.from(markdown).toString("base64");
    } catch {
      // File not found, skip copy button
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 mt-4 mb-4">
      <h1 className="text-3xl font-bold text-foreground-heading leading-none">{title}</h1>
      {encodedMarkdown && <CopyMarkdownButton encodedMarkdown={encodedMarkdown} />}
    </div>
  );
}
