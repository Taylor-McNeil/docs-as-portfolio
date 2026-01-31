import { Feather, ExternalLink } from "lucide-react";
import { ReactNode } from "react";

interface DevlogCTAProps {
  children: ReactNode;
  linkText?: string;
  linkHref?: string;
}

export function DevlogCTA({
  children,
  linkText,
  linkHref,
}: DevlogCTAProps) {
  return (
    <div className="my-10 rounded-lg border border-accent/20 bg-accent/5 overflow-hidden">
      <div className="px-4 py-2 border-b border-accent/20 bg-accent/10 flex items-center gap-2">
        <Feather size={14} className="text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          aampersand
        </span>
      </div>
      <div className="p-4 text-sm text-foreground-muted leading-relaxed [&>p]:m-0">
        {children}
        {linkText && linkHref && (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-accent font-medium hover:underline"
          >
            {linkText}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { DevlogCTA } from "@/components/content/DevlogCTA";
 *
 * <DevlogCTA
 *   linkText="Read: What if Icarus Had Sunscreen?"
 *   linkHref="https://www.aampersand.com/devlog/jan-2026"
 * >
 *   aampersand is what I built after I stopped following the sirens.
 *   A writing tool that reveals rather than manages — because writers
 *   don't need more power. They need to see what's already there.
 * </DevlogCTA>
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────────────┐
 * │ [🪶] AAMPERSAND                             │
 * ├─────────────────────────────────────────────┤
 * │                                             │
 * │   Your CTA content goes here.              │
 * │                                             │
 * │   Link Text →                              │
 * │                                             │
 * └─────────────────────────────────────────────┘
 */
