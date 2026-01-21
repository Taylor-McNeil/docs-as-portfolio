import { ReactNode } from "react";

interface KeyValueItem {
  label: string;
  value: string | number;
}

interface CardProps {
  title?: string;
  children?: ReactNode;
  items?: KeyValueItem[];
  list?: string[];
}

interface CardGroupProps {
  children: ReactNode;
  layout?: "scroll" | "grid" | "stack";
}

export function Card({ title, children, items, list }: CardProps) {
  const hasItems = items && items.length > 0;
  const hasList = list && list.length > 0;
  const hasContent = children || hasItems || hasList;

  return (
    <div className="shrink-0 w-72 rounded-lg border border-border-card bg-surface-card overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-border-card bg-surface-sidebar">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      {hasContent && (
        <div className="p-4 space-y-4">
          {children}
          {hasItems && (
            <div className="space-y-1.5">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">{item.label}:</span>
                  <span className="font-medium text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {hasList && (
            <div className={`space-y-2 ${hasItems ? "border-t border-border-card pt-4" : ""}`}>
              {list.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-foreground-muted">
                  <span className="text-accent">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CardGroup({ children, layout = "scroll" }: CardGroupProps) {
  const layoutClasses = {
    scroll: "-mx-4 px-4 overflow-x-auto",
    grid: "",
    stack: "",
  };

  const innerClasses = {
    scroll: "flex gap-4 pb-4",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4",
    stack: "space-y-4",
  };

  return (
    <div className={`my-6 ${layoutClasses[layout]}`}>
      <div className={innerClasses[layout]}>
        {children}
      </div>
    </div>
  );
}
