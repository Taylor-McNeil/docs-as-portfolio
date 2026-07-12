"use client";

import { ReactNode } from "react";

interface DiagramFigureProps {
  children: ReactNode;
  caption: ReactNode;
}

export function DiagramFigure({ children, caption }: DiagramFigureProps) {
  return (
    <figure className="my-8">
      <div className="border border-border/70 bg-surface-card/20 px-4 py-3 md:px-5">
        {children}
      </div>
      <figcaption className="mt-2 border-t border-border/40 pt-2 text-[12px] leading-5 text-foreground-muted/85">
        <span className="mr-2 align-baseline text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground-muted/55">
          Diagram
        </span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
