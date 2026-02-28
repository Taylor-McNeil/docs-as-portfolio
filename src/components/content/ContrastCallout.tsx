import { ReactNode } from "react";

interface ContrastCalloutProps {
  leftLabel: string;
  rightLabel: string;
  leftChildren: ReactNode;
  rightChildren: ReactNode;
}

export function ContrastCallout({
  leftLabel,
  rightLabel,
  leftChildren,
  rightChildren,
}: ContrastCalloutProps) {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left (negative / siren's song) */}
      <div className="rounded-lg border-2 p-5 bg-callout-warn-bg border-callout-warn/30">
        <span className="block font-mono text-xs font-bold uppercase tracking-wider mb-3 text-callout-warn">
          {leftLabel}
        </span>
        <div className="text-sm italic leading-relaxed text-foreground [&>p]:m-0">
          {leftChildren}
        </div>
      </div>

      {/* Right (positive / the truth) */}
      <div className="rounded-lg border-2 p-5 bg-callout-ok-bg border-callout-ok/30">
        <span className="block font-mono text-xs font-bold uppercase tracking-wider mb-3 text-callout-ok">
          {rightLabel}
        </span>
        <div className="text-sm italic leading-relaxed text-foreground [&>p]:m-0">
          {rightChildren}
        </div>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { ContrastCallout } from "@/components/content/ContrastCallout";
 *
 * <ContrastCallout
 *   leftLabel="The Siren's Song"
 *   rightLabel="The Truth"
 *   leftChildren={<p>"Every action in a text editor must be undoable."</p>}
 *   rightChildren={<p>"Structural story decisions are permanent until the writer decides otherwise."</p>}
 * />
 *
 * Props:
 * - leftLabel: string (required) - Label for the left (negative) side
 * - rightLabel: string (required) - Label for the right (positive) side
 * - leftChildren: ReactNode (required) - Content for the left side
 * - rightChildren: ReactNode (required) - Content for the right side
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────┐  ┌─────────────────────┐
 * │ THE SIREN'S SONG    │  │ THE TRUTH            │
 * │                     │  │                      │
 * │ "Every action in a  │  │ "Structural story    │
 * │  text editor must   │  │  decisions are       │
 * │  be undoable."      │  │  permanent until..." │
 * └─────────────────────┘  └─────────────────────┘
 *
 * Dark: Red-tinted left vs Green-tinted right
 * Light: Orange-tinted left vs Teal-tinted right (Postman style)
 */
