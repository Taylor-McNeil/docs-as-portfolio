import { ReactNode } from "react";

type DevlogCalloutVariant = "purple" | "warning";

interface DevlogCalloutProps {
  variant?: DevlogCalloutVariant;
  badge?: string;
  children: ReactNode;
}

const variantStyles: Record<DevlogCalloutVariant, { container: string; badge: string }> = {
  purple: {
    container:
      "dark:bg-purple-950/40 dark:border-purple-500 dark:text-purple-200 bg-surface-sidebar border-accent text-foreground",
    badge:
      "dark:bg-purple-500/20 dark:text-purple-300 bg-accent/10 text-accent",
  },
  warning: {
    container:
      "dark:bg-amber-950/40 dark:border-amber-500 dark:text-amber-200 bg-method-put/5 border-method-put text-foreground",
    badge:
      "dark:bg-amber-500/20 dark:text-amber-300 bg-method-put/15 text-method-put",
  },
};

export function DevlogCallout({ variant = "purple", badge, children }: DevlogCalloutProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-6 ${styles.container}`}>
      {badge && (
        <span
          className={`inline-block px-2 py-0.5 mb-3 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
        >
          {badge}
        </span>
      )}
      <div className="text-sm leading-relaxed [&>p]:m-0 [&_a]:underline [&_a]:hover:opacity-80">
        {children}
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { DevlogCallout } from "@/components/content/DevlogCallout";
 *
 * <DevlogCallout variant="purple" badge="CONTEXT">
 *   This is the design companion to Red Thread, Isle Eight.
 * </DevlogCallout>
 *
 * <DevlogCallout variant="warning" badge="WARNING">
 *   This action has side effects.
 * </DevlogCallout>
 *
 * Props:
 * - variant?: "purple" | "warning" (default: "purple")
 * - badge?: string - Optional uppercase badge pill at the top
 * - children: ReactNode (required) - The callout content
 *
 * ASCII REPRESENTATION:
 *
 * ┌────────────────────────────────────────┐
 * │ ▌  [CONTEXT]                           │
 * │ ▌                                      │
 * │ ▌  Your callout content goes here.    │
 * │ ▌  Can include links and formatting.  │
 * └────────────────────────────────────────┘
 *
 * Dark purple: Deep purple bg, purple border/text
 * Light purple: Pale blue bg, blue border/text (Postman style)
 * Dark warning: Amber tinted
 * Light warning: Orange tinted (Postman orange)
 */
