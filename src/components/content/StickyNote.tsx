"use client";

import { useState, type ReactNode } from "react";

interface StickyNoteProps {
  /** What's written on the note. */
  note: ReactNode;
  /** The text the note is stuck on top of. Always in the DOM, so it stays readable to assistive tech. */
  children: ReactNode;
}

/**
 * A sticky note stuck over the end of a passage. Hovering lifts its corner;
 * clicking peels it off to reveal what's underneath. It can be stuck back.
 */
export function StickyNote({ note, children }: StickyNoteProps) {
  const [peeled, setPeeled] = useState(false);

  return (
    <div className="relative pb-10">
      <div>{children}</div>

      <button
        type="button"
        onClick={() => setPeeled(true)}
        aria-hidden={peeled}
        tabIndex={peeled ? -1 : 0}
        aria-label="Peel off the sticky note to read what’s underneath"
        className={`group absolute -bottom-1 right-2 z-10 w-56 drop-shadow-[0_2px_3px_rgb(0_0_0/0.2)] hover:drop-shadow-[0_10px_14px_rgb(0_0_0/0.25)] focus-visible:drop-shadow-[0_10px_14px_rgb(0_0_0/0.25)] origin-top-left cursor-pointer text-left outline-none transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:w-72 ${
          peeled
            ? "pointer-events-none -translate-y-16 translate-x-24 rotate-[18deg] scale-105 opacity-0"
            : "-rotate-3 hover:-translate-y-1 hover:-rotate-1 focus-visible:-translate-y-1 focus-visible:-rotate-1"
        }`}
      >
        <span
          className="relative block bg-[#fde68a] px-4 pb-3 pt-4 text-[12.5px] leading-snug text-stone-800 transition-[clip-path] duration-300 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_18px),calc(100%_-_18px)_100%,0_100%)] group-hover:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_30px),calc(100%_-_30px)_100%,0_100%)] group-focus-visible:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_30px),calc(100%_-_30px)_100%,0_100%)]"
        >
          <span className="block font-medium italic">{note}</span>
          <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600">
            peel me ↗
          </span>
        </span>
        {/* tape strip */}
        <span
          className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-2 bg-white/60 shadow-sm dark:bg-white/30"
          aria-hidden="true"
        />
        {/* curled corner: the flap grows as the note lifts */}
        <span
          className="absolute bottom-0 right-0 h-[18px] w-[18px] bg-gradient-to-br from-[#f8d775] to-[#d9a62e] shadow-[-2px_-2px_4px_rgb(0_0_0/0.12)] transition-all duration-300 [clip-path:polygon(0_0,100%_0,0_100%)] group-hover:h-[30px] group-hover:w-[30px] group-focus-visible:h-[30px] group-focus-visible:w-[30px] motion-reduce:transition-none"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute inset-0 rounded-sm ring-accent group-focus-visible:ring-2" aria-hidden="true" />
      </button>

      {peeled && (
        <button
          type="button"
          onClick={() => setPeeled(false)}
          className="absolute bottom-0 right-2 font-mono text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent"
        >
          stick it back
        </button>
      )}
    </div>
  );
}
