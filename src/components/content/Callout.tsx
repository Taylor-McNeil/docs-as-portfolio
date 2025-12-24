import { ReactNode } from "react";
import { Info, AlertTriangle, Lightbulb } from "lucide-react";

interface CalloutProps {
  type?: "note" | "warning" | "tip";
  children: ReactNode;
}

const styles = {
  note: "border-accent/50 bg-accent/5",
  warning: "border-method-put/50 bg-method-put/5",
  tip: "border-accent-success/50 bg-accent-success/5",
};

const icons = {
  note: <Info size={16} className="text-accent" />,
  warning: <AlertTriangle size={16} className="text-method-put" />,
  tip: <Lightbulb size={16} className="text-accent-success" />,
};

const labels = {
  note: "Note",
  warning: "Warning",
  tip: "Tip",
};

export function Callout({ type = "note", children }: CalloutProps) {
  return (
    <div className={`border-l-4 rounded-r-lg p-4 ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
          {labels[type]}
        </span>
      </div>
      <div className="mt-2 text-sm text-foreground-muted">{children}</div>
    </div>
  );
}