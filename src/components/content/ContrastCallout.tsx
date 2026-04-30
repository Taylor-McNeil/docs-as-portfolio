import { ReactNode } from "react";

interface ContrastCalloutProps {
  leftLabel: string;
  rightLabel: string;
  leftChildren: ReactNode;
  rightChildren: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftDescriptor?: string;
  rightDescriptor?: string;
  variant?: "callout" | "card";
}

export function ContrastCallout({
  leftLabel,
  rightLabel,
  leftChildren,
  rightChildren,
  leftIcon,
  rightIcon,
  leftDescriptor,
  rightDescriptor,
  variant = "callout",
}: ContrastCalloutProps) {
  if (variant === "card") {
    return (
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border overflow-hidden border-border-card flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            {leftIcon}
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
              {leftLabel}
            </span>
            {leftDescriptor && (
              <span className="ml-auto font-mono text-[10px] tracking-wider text-foreground-muted/50">
                {leftDescriptor}
              </span>
            )}
          </div>
          <div className="p-5 bg-surface-card flex-1">
            <div className="text-sm italic leading-relaxed text-foreground [&>p]:m-0">
              {leftChildren}
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden border-border-card flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            {rightIcon}
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-success">
              {rightLabel}
            </span>
            {rightDescriptor && (
              <span className="ml-auto font-mono text-[10px] tracking-wider text-foreground-muted/50">
                {rightDescriptor}
              </span>
            )}
          </div>
          <div className="p-5 bg-surface-card flex-1">
            <div className="text-sm italic leading-relaxed text-foreground [&>p]:m-0">
              {rightChildren}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border-2 p-5 bg-callout-warn-bg border-callout-warn/30">
        <span className="block font-mono text-xs font-bold uppercase tracking-wider mb-3 text-callout-warn">
          {leftLabel}
        </span>
        <div className="text-sm italic leading-relaxed text-foreground [&>p]:m-0">
          {leftChildren}
        </div>
      </div>

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
