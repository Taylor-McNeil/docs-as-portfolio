import { BadgeType } from "@/components/changelog/changelog";

interface ChangelogBadgeProps {
  type: BadgeType;
}

const badgeStyles: Record<BadgeType, string> = {
  // shipped/shipping - green
  shipped: "bg-accent-success/10 text-accent-success border-accent-success/30",
  shipping: "bg-accent-success/10 text-accent-success border-accent-success/30",
  // built/building - blue
  built: "bg-method-get/10 text-method-get border-method-get/30",
  building: "bg-method-get/10 text-method-get border-method-get/30",
  // led/leading - purple
  led: "bg-method-patch/10 text-method-patch border-method-patch/30",
  leading: "bg-method-patch/10 text-method-patch border-method-patch/30",
  // improved/improving - orange
  improved: "bg-method-put/10 text-method-put border-method-put/30",
  improving: "bg-method-put/10 text-method-put border-method-put/30",
  // writing - pink
  writing: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  // consulting - yellow
  consulting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  // iterating - cyan
  iterating: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};

const badgeLabels: Record<BadgeType, string> = {
  shipped: "SHIPPED",
  shipping: "SHIPPING",
  built: "BUILT",
  building: "BUILDING",
  led: "LED",
  leading: "LEADING",
  improved: "IMPROVED",
  improving: "IMPROVING",
  writing: "WRITING",
  consulting: "CONSULTING",
  iterating: "ITERATING",
};

export function ChangelogBadge({ type }: ChangelogBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center w-20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded ${badgeStyles[type]}`}
    >
      {badgeLabels[type]}
    </span>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { ChangelogBadge } from "@/components/content/ChangelogBadge";
 *
 * <ChangelogBadge type="shipped" />
 * <ChangelogBadge type="built" />
 * <ChangelogBadge type="led" />
 * <ChangelogBadge type="improved" />
 *
 * Types: "shipped" | "built" | "led" | "improved"
 *
 * ASCII REPRESENTATION:
 *
 * ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
 * │ SHIPPED  │  │  BUILT   │  │   LED    │  │ IMPROVED │
 * └──────────┘  └──────────┘  └──────────┘  └──────────┘
 *    green         blue        purple        orange
 *
 * Fixed-width badge (w-20) with uppercase text.
 * Used in TimelineItem to label changelog entries.
 */