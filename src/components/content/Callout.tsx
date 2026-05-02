import { Info, AlertTriangle, Lightbulb, FileText, FlaskConical, PartyPopper } from "lucide-react";
import { ReactNode } from "react";

type CalloutType = "note" | "warning" | "tip" | "context" | "test" | "celebration";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  label?: string | false;
  children: ReactNode;
}

const styles: Record<CalloutType, string> = {
  note: "border-accent bg-accent/5",
  warning: "border-method-put bg-method-put/5",
  tip: "border-accent-success bg-accent-success/5",
  context: "border-foreground-muted/20 bg-surface-card/50",
  test: "border-method-get bg-method-get/5",
  celebration: "border-accent-success bg-accent-success/5",
};

const icons: Record<CalloutType, ReactNode> = {
  note: <Info size={16} className="text-accent" />,
  warning: <AlertTriangle size={16} className="text-method-put" />,
  tip: <Lightbulb size={16} className="text-accent-success" />,
  context: <FileText size={16} className="text-foreground-muted" />,
  test: <FlaskConical size={16} className="text-method-get" />,
  celebration: <PartyPopper size={16} className="text-accent-success" />,
};

const labels: Record<CalloutType, string> = {
  note: "Note",
  warning: "Warning",
  tip: "Tip",
  context: "Context",
  test: "Test Your Code",
  celebration: "Celebrate",
};

export function Callout({ type = "note", title, label, children }: CalloutProps) {
  const displayLabel = label === undefined ? labels[type] : label;

  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-6 ${styles[type]}`}>
      {displayLabel && (
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
            {displayLabel}
          </span>
        </div>
      )}
      {title && (
        <div className="mt-1 text-sm font-semibold text-foreground">
          {title}
        </div>
      )}
      <div className={`${displayLabel || title ? "mt-2" : ""} text-sm text-foreground-muted [&>p]:m-0 [&_a]:text-accent [&_a]:underline [&_a]:hover:opacity-80`}>{children}</div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { Callout } from "@/components/content/Callout";
 *
 * <Callout type="note">
 *   This is a note callout with default styling.
 * </Callout>
 *
 * <Callout type="warning" title="Be Careful">
 *   This action cannot be undone.
 * </Callout>
 *
 * <Callout type="tip">
 *   Pro tip: Use keyboard shortcuts for faster navigation.
 * </Callout>
 *
 * Types: "note" | "warning" | "tip" | "context" | "test" | "celebration"
 *
 * ASCII REPRESENTATION:
 *
 * ┌────────────────────────────────────────┐
 * │ ▌  [i] NOTE                            │
 * │ ▌  Optional Title                      │
 * │ ▌                                      │
 * │ ▌  Your callout content goes here.    │
 * │ ▌  Can include links and formatting.  │
 * └────────────────────────────────────────┘
 *
 * The left border color changes based on type:
 * - note:        blue accent
 * - warning:     orange/put color
 * - tip:         green success
 * - context:     gray muted
 * - test:        blue/get color
 * - celebration: green success
 */
