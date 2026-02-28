import { Anchor, Database, FileText } from "lucide-react";
import { ReactNode } from "react";

interface AnatomyOfABeatProps {
  databaseSlot: ReactNode;
  editorSlot: ReactNode;
  title?: string;
}

export function AnatomyOfABeat({ databaseSlot, editorSlot, title }: AnatomyOfABeatProps) {
  return (
    <div className="my-8">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider mb-4 dark:text-slate-500 text-slate-400">
          {title}
        </h4>
      )}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Database Side */}
        <div className="flex-1 w-full rounded-lg border overflow-hidden border-border-card">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            <Database size={13} className="text-accent" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
              Database: The Story
            </span>
          </div>
          <div className="p-4 font-mono text-xs leading-loose bg-surface-terminal [&_span.key]:text-foreground-muted [&_span.val]:text-accent">
            {databaseSlot}
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center gap-1 shrink-0 py-2">
          <Anchor size={20} className="text-accent" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-foreground-muted">
            Anchors to
          </span>
        </div>

        {/* Editor Side */}
        <div className="flex-1 w-full rounded-lg border overflow-hidden border-border-card">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-card bg-surface-sidebar">
            <FileText size={13} className="text-foreground-muted" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
              Editor: The Document
            </span>
          </div>
          <div className="p-4 text-base leading-relaxed bg-surface-card text-foreground font-serif [&>p]:m-0">
            {editorSlot}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { AnatomyOfABeat } from "@/components/content/AnatomyOfABeat";
 *
 * <AnatomyOfABeat
 *   title="The Anatomy of a Beat"
 *   databaseSlot={
 *     <div className="space-y-2">
 *       <div className="flex justify-between"><span className="key">BEAT_ID:</span> <span className="val font-bold">8f92a</span></div>
 *       <div className="flex justify-between"><span className="key">Plotline:</span> <span className="val">"The Theft"</span></div>
 *       <div className="flex justify-between"><span className="key">Scene:</span> <span className="val">12</span></div>
 *       <div className="flex justify-between"><span className="key">Status:</span> <span className="val">HEALTHY</span></div>
 *     </div>
 *   }
 *   editorSlot={
 *     <p>The headmaster noted the <mark className="bg-indigo-100 dark:bg-indigo-500/20 px-0.5 rounded">missing ingredients</mark> upon entering the classroom.</p>
 *   }
 * />
 *
 * Props:
 * - databaseSlot: ReactNode (required) - Free-form content for the database/left side
 * - editorSlot: ReactNode (required) - Free-form content for the editor/right side
 * - title?: string - Optional title above the component
 *
 * ASCII REPRESENTATION:
 *
 * ┌─ DATABASE: THE STORY ──┐         ┌─ EDITOR: THE DOCUMENT ──────┐
 * │ BEAT_ID:       8f92a   │    ⚓    │ The headmaster noted the     │
 * │ Plotline:  "The Theft" │ ANCHORS │ [missing ingredients] upon   │
 * │ Scene:            12   │   TO    │ entering the classroom. He   │
 * │ Status:      HEALTHY   │         │ immediately suspected...     │
 * └────────────────────────┘         └──────────────────────────────┘
 *
 * Database side: Dark terminal / light monospace with header bar
 * Connector: Anchor icon + "ANCHORS TO" label
 * Editor side: White document with serif text and header bar
 */
