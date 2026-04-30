import { ReactNode } from "react";
import { Zap } from "lucide-react";

interface SparkEtchContrastProps {
  sparkQuote: ReactNode;
  etchQuote: ReactNode;
  title?: string;
}

export function SparkEtchContrast({ sparkQuote, etchQuote, title }: SparkEtchContrastProps) {
  return (
    <div className="my-8">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground-muted/60">
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spark */}
        <div className="rounded-lg border overflow-hidden border-border-card">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            <Zap size={13} className="text-accent" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
              Sparks
            </span>
            <span className="ml-auto font-mono text-[10px] tracking-wider text-foreground-muted/50">
              momentum
            </span>
          </div>
          <div className="p-5 bg-surface-card">
            <p className="text-sm italic leading-relaxed text-foreground m-0">
              {sparkQuote}
            </p>
          </div>
        </div>

        {/* Etch */}
        <div className="rounded-lg border overflow-hidden border-border-card">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            <span className="text-sm leading-none">✎</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-success">
              Etches
            </span>
            <span className="ml-auto font-mono text-[10px] tracking-wider text-foreground-muted/50">
              truth
            </span>
          </div>
          <div className="p-5 bg-surface-card">
            <p className="text-sm italic leading-relaxed text-foreground m-0">
              {etchQuote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
