import { Terminal } from "lucide-react";
import { JsonRenderer, type JsonValue } from "./JsonRenderer";

/**
 * The right-hand "Response Body" panel, drawn inline in the page instead.
 * Used where a page needs its full width (the homepage star map).
 */
export function ResponseBody({ data, request }: { data: JsonValue; request?: string }) {
  return (
    <figure className="m-0 overflow-hidden rounded-lg border border-border bg-surface-terminal font-mono">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
          <Terminal size={10} className="mr-1.5" aria-hidden="true" /> Response Body
        </span>
        <span className="flex items-center gap-2 text-[10px]">
          {request ? <span className="text-foreground-muted">{request}</span> : null}
          <span className="rounded bg-accent-success/10 px-1.5 py-0.5 text-accent-success">200 OK</span>
        </span>
      </figcaption>
      <div className="overflow-x-auto p-4 text-xs leading-relaxed sm:text-[13px]">
        <JsonRenderer data={data} />
      </div>
    </figure>
  );
}
