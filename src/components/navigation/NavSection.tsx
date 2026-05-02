import { ReactNode } from "react";

interface NavSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function NavSection({ title, subtitle, children }: NavSectionProps) {
  return (
    <div>
      <h3 className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3 px-3">
        {title}
      </h3>
      {subtitle ? (
        <p className="-mt-2 mb-3 px-3 text-[10px] italic leading-snug text-foreground-muted">
          {subtitle}
        </p>
      ) : null}
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}
