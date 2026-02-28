import { Code } from "lucide-react";

interface BreadcrumbPillProps {
  path: string;
}

export function BreadcrumbPill({ path }: BreadcrumbPillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs border dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 bg-orange-50 border-orange-200 text-orange-800">
      <Code size={12} />
      {path}
    </span>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { BreadcrumbPill } from "@/components/content/BreadcrumbPill";
 *
 * <BreadcrumbPill path="/aampersand/peering-into-lethe" />
 *
 * Props:
 * - path: string (required) - The file path or route to display
 *
 * ASCII REPRESENTATION:
 *
 * ╭──────────────────────────────────────╮
 * │ [</>]  /aampersand/peering-into-lethe │
 * ╰──────────────────────────────────────╯
 *
 * Dark mode: Indigo tones (bg-indigo-500/10, text-indigo-400)
 * Light mode: Orange/cream tones (bg-orange-50, text-orange-800)
 */
