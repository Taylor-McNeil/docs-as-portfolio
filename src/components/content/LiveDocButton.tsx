import { ExternalLink } from "lucide-react";

interface LiveDocButtonProps {
  href: string;
}

export function LiveDocButton({ href }: LiveDocButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-foreground-muted hover:text-foreground bg-surface-card border border-border rounded-md hover:bg-surface-sidebar transition-colors"
      title="See the live documentation"
    >
      <ExternalLink size={14} />
      <span>See Live Doc</span>
    </a>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { LiveDocButton } from "@/components/content/LiveDocButton";
 *
 * <LiveDocButton href="https://docs.anthropic.com/en/api/messages" />
 *
 * <div className="flex gap-2">
 *   <LiveDocButton href="https://docs.example.com/guide" />
 *   <CopyMarkdownButton encodedMarkdown={content} />
 * </div>
 *
 * Props:
 * - href: string (required) - External documentation URL
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────┐
 * │ [↗] See Live Doc    │  <- Opens in new tab
 * └─────────────────────┘
 *
 * Hover state:
 * ┌─────────────────────┐
 * │ [↗] See Live Doc    │  <- Background and text color change
 * └─────────────────────┘
 *
 * Used in GuideHeader alongside CopyMarkdownButton.
 * Links to external documentation source.
 */
