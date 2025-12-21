import { ReactNode } from "react";

interface NavSectionProps {
  title: string;
  children: ReactNode;
}

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <div>
      <h3 className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-3 px-3">
        {title}
      </h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}