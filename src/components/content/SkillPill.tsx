import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type SkillCategory = "frontend" | "backend" | "database" | "tool" | "language" | "cloud" | "default";

interface SkillPillProps {
  label: string;
  category?: SkillCategory;
  icon?: LucideIcon;
}

interface SkillListProps {
  children: ReactNode;
  layout?: "horizontal" | "vertical";
  title?: string;
}

const categoryStyles: Record<SkillCategory, string> = {
  frontend: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
  backend: "bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400",
  database: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400",
  tool: "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400",
  language: "bg-pink-500/10 text-pink-600 border-pink-500/30 dark:text-pink-500",
  cloud: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:text-cyan-400",
  default: "bg-accent/10 text-accent border-accent/30",
};

export function SkillPill({ label, category = "default", icon: Icon }: SkillPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryStyles[category]}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}

export function SkillList({ children, layout = "horizontal", title }: SkillListProps) {
  const layoutClass = layout === "horizontal"
    ? "flex flex-wrap gap-2"
    : "flex flex-col gap-2 items-start";

  return (
    <div className="my-4">
      {title && (
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">
          {title}
        </p>
      )}
      <div className={layoutClass}>
        {children}
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { SkillPill, SkillList } from "@/components/content/SkillPill";
 * import { Code, Database, Cloud } from "lucide-react";
 *
 * // Horizontal layout (default)
 * <SkillList title="Technologies">
 *   <SkillPill label="React" category="frontend" />
 *   <SkillPill label="TypeScript" category="language" />
 *   <SkillPill label="Node.js" category="backend" />
 *   <SkillPill label="PostgreSQL" category="database" />
 *   <SkillPill label="AWS" category="cloud" />
 *   <SkillPill label="Docker" category="tool" />
 * </SkillList>
 *
 * // Vertical layout
 * <SkillList layout="vertical" title="Stack">
 *   <SkillPill label="Next.js" category="frontend" icon={Code} />
 *   <SkillPill label="Prisma" category="database" icon={Database} />
 *   <SkillPill label="Vercel" category="cloud" icon={Cloud} />
 * </SkillList>
 *
 * // Without title
 * <SkillList>
 *   <SkillPill label="Git" category="tool" />
 *   <SkillPill label="VS Code" category="tool" />
 * </SkillList>
 *
 * Props (SkillPill):
 * - label: string (required) - The skill name
 * - category?: "frontend" | "backend" | "database" | "tool" | "language" | "cloud" | "default"
 * - icon?: LucideIcon - Optional icon to display
 *
 * Props (SkillList):
 * - children: ReactNode - SkillPill components
 * - layout?: "horizontal" | "vertical" - Layout direction (default: "horizontal")
 * - title?: string - Optional section title
 *
 * ASCII REPRESENTATION (horizontal):
 *
 * TECHNOLOGIES
 * ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌────────────┐
 * │  React   │ │ TypeScript │ │ Node.js │ │ PostgreSQL │
 * └──────────┘ └────────────┘ └─────────┘ └────────────┘
 *
 * ASCII REPRESENTATION (vertical):
 *
 * STACK
 * ┌──────────┐
 * │  Next.js │
 * └──────────┘
 * ┌──────────┐
 * │  Prisma  │
 * └──────────┘
 * ┌──────────┐
 * │  Vercel  │
 * └──────────┘
 *
 * Categories have distinct colors:
 * - frontend: blue
 * - backend: green
 * - database: purple
 * - tool: orange
 * - language: yellow
 * - cloud: cyan
 * - default: accent color
 */
