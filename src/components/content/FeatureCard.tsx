import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type FeatureCardColor = "orange" | "slate" | "teal";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  color?: FeatureCardColor;
  children: ReactNode;
}

interface FeatureCardGroupProps {
  children: ReactNode;
}

const colorStyles: Record<FeatureCardColor, { icon: string; title: string }> = {
  orange: {
    icon: "text-method-put",
    title: "text-method-put",
  },
  slate: {
    icon: "text-foreground-muted",
    title: "text-foreground",
  },
  teal: {
    icon: "text-accent-success",
    title: "text-accent-success",
  },
};

export function FeatureCard({ icon: Icon, title, color = "orange", children }: FeatureCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="rounded-lg border p-5 bg-surface-card border-border-card">
      <div className="flex items-center gap-2.5 mb-3">
        <Icon size={18} className={styles.icon} />
        <h4 className={`text-sm font-bold ${styles.title}`}>{title}</h4>
      </div>
      <div className="text-sm leading-relaxed text-foreground-muted [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}

export function FeatureCardGroup({ children }: FeatureCardGroupProps) {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { FeatureCard, FeatureCardGroup } from "@/components/content/FeatureCard";
 * import { AlertTriangle, Ghost } from "lucide-react";
 *
 * <FeatureCardGroup>
 *   <FeatureCard icon={AlertTriangle} title="Stale Beats" color="orange">
 *     The mark exists, but the text drifted. The system flags it gently.
 *   </FeatureCard>
 *   <FeatureCard icon={Ghost} title="Ghost Beats" color="slate">
 *     The mark is gone. The paragraph was deleted entirely.
 *   </FeatureCard>
 * </FeatureCardGroup>
 *
 * Props (FeatureCard):
 * - icon: LucideIcon (required) - Icon component from lucide-react
 * - title: string (required) - Card title
 * - color?: "orange" | "slate" | "teal" (default: "orange")
 * - children: ReactNode (required) - Description content
 *
 * ASCII REPRESENTATION:
 *
 * ┌──────────────────────┐  ┌──────────────────────┐
 * │ [⚠] Stale Beats      │  │ [👻] Ghost Beats      │
 * │                      │  │                      │
 * │ The mark exists but  │  │ The mark is gone.    │
 * │ the text drifted.    │  │ The paragraph was    │
 * │                      │  │ deleted entirely.    │
 * └──────────────────────┘  └──────────────────────┘
 *
 * Dark: Deep slate bg with subtle borders
 * Light: Cream/white bg with light gray borders
 */
