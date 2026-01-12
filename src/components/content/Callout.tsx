import { Info, AlertTriangle, Lightbulb, FileText, FlaskConical, PartyPopper } from "lucide-react";
import { ReactNode } from "react";

type CalloutType = "note" | "warning" | "tip" | "context" | "test" | "celebration";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
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

export function Callout({ type = "note", title, children }: CalloutProps) {
  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-6 ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
          {labels[type]}
        </span>
      </div>
      {title && (
        <div className="mt-1 text-sm font-semibold text-foreground">
          {title}
        </div>
      )}
      <div className="mt-2 text-sm text-foreground-muted [&>p]:m-0 [&_a]:text-accent [&_a]:underline [&_a]:hover:opacity-80">{children}</div>
    </div>
  );
}