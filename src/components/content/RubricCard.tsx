import { Square } from "lucide-react";

interface WeightedCriteria {
  name: string;
  weight: number;
}

interface RubricCardProps {
  title: string;
  criteria: WeightedCriteria[];
  checklist: string[];
}

export function RubricCard({ title, criteria, checklist }: RubricCardProps) {
  return (
    <div className="shrink-0 w-72 rounded-lg border border-border-card bg-surface-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border-card bg-surface-sidebar">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          {criteria.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="text-foreground-muted">{item.name}:</span>
              <span className="font-medium text-accent">{item.weight}%</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border-card pt-4 space-y-2">
          {checklist.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-foreground-muted">
              <Square size={12} className="flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RubricCardGroupProps {
  children: React.ReactNode;
}

export function RubricCardGroup({ children }: RubricCardGroupProps) {
  return (
    <div className="my-6 -mx-4 px-4 overflow-x-auto">
      <div className="flex gap-4 pb-4">
        {children}
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { RubricCard, RubricCardGroup } from "@/components/content/RubricCard";
 *
 * <RubricCardGroup>
 *   <RubricCard
 *     title="Code Quality"
 *     criteria={[
 *       { name: "Readability", weight: 30 },
 *       { name: "Performance", weight: 40 },
 *       { name: "Testing", weight: 30 }
 *     ]}
 *     checklist={[
 *       "Code follows style guide",
 *       "No obvious performance issues",
 *       "Unit tests included"
 *     ]}
 *   />
 *   <RubricCard
 *     title="Documentation"
 *     criteria={[
 *       { name: "Completeness", weight: 50 },
 *       { name: "Clarity", weight: 50 }
 *     ]}
 *     checklist={[
 *       "All public APIs documented",
 *       "Examples provided"
 *     ]}
 *   />
 * </RubricCardGroup>
 *
 * Props (RubricCard):
 * - title: string (required) - Card header
 * - criteria: { name: string, weight: number }[] - Weighted criteria
 * - checklist: string[] - Checklist items
 *
 * Props (RubricCardGroup):
 * - children: ReactNode - RubricCard components
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────┐  ┌─────────────────────┐
 * │ Code Quality        │  │ Documentation       │
 * ├─────────────────────┤  ├─────────────────────┤
 * │ Readability:    30% │  │ Completeness:   50% │
 * │ Performance:    40% │  │ Clarity:        50% │
 * │ Testing:        30% │  │                     │
 * ├─────────────────────┤  ├─────────────────────┤
 * │ □ Code follows...   │  │ □ All public APIs.. │
 * │ □ No obvious perf.. │  │ □ Examples provided │
 * │ □ Unit tests incl.. │  │                     │
 * └─────────────────────┘  └─────────────────────┘
 *          ◄────── Horizontally scrollable ──────►
 *
 * Fixed width cards (w-72) in horizontal scroll container.
 */
