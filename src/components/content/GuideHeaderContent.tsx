import { CopyMarkdownButton } from "./CopyMarkdownButton";
import { LiveDocButton } from "./LiveDocButton";
import { MethodBadge } from "../navigation/MethodBadge";

export interface GuideHeaderContentProps {
  title: string;
  description?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS";
  endpoint?: string;
  liveDocUrl?: string;
  encodedMarkdown?: string;
}

export function GuideHeaderContent({ title, description, method, endpoint, liveDocUrl, encodedMarkdown }: GuideHeaderContentProps) {
  return (
    <header className="mt-4 mb-6 space-y-4">
      {method && endpoint && (
        <div className="flex items-center gap-3">
          <MethodBadge method={method} active size="md" />
          <span className="font-mono text-sm text-foreground-muted">{endpoint}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground-heading leading-none">{title}</h1>
        <div className="flex items-center gap-2 shrink-0">
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
