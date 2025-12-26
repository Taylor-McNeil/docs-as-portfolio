import { BadgeType } from "@/components/changelog/changelog";

interface ChangelogBadgeProps {
  type: BadgeType;
}

const badgeStyles: Record<BadgeType, string> = {
  shipped: "bg-accent-success/10 text-accent-success border-accent-success/30",
  built: "bg-method-get/10 text-method-get border-method-get/30",
  led: "bg-method-patch/10 text-method-patch border-method-patch/30",
  improved: "bg-method-put/10 text-method-put border-method-put/30",
};

const badgeLabels: Record<BadgeType, string> = {
  shipped: "SHIPPED",
  built: "BUILT",
  led: "LED",
  improved: "IMPROVED",
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