import { Quote, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface AnnotationProps {
  label?: string;
  children: ReactNode;
  icon?: LucideIcon;
}

export function Annotation({ label = "Prompt", children, icon: Icon = Quote }: AnnotationProps) {
  return (
    <div className="my-6 rounded-lg border border-border-card bg-surface-card overflow-hidden">
      <div className="px-4 py-2 border-b border-border-card bg-surface-sidebar flex items-center gap-2">
        <Icon size={14} className="text-foreground-muted" />
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {label}
        </span>
      </div>
      <div className="p-4 text-sm text-foreground italic [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { Annotation } from "@/components/content/Annotation";
 * import { MessageSquare, Code, Lightbulb } from "lucide-react";
 *
 * <Annotation>
 *   Write a haiku about programming in the rain.
 * </Annotation>
 *
 * <Annotation label="System Prompt">
 *   You are a helpful assistant that responds in haiku format.
 * </Annotation>
 *
 * <Annotation label="User Message" icon={MessageSquare}>
 *   Can you explain how APIs work?
 * </Annotation>
 *
 * <Annotation label="Code Note" icon={Code}>
 *   This function handles authentication.
 * </Annotation>
 *
 * Props:
 * - label?: string - Header label (default: "Prompt")
 * - children: ReactNode - The quoted content
 * - icon?: LucideIcon - Any lucide-react icon (default: Quote)
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────────────┐
 * │ [❝] PROMPT                                  │
 * ├─────────────────────────────────────────────┤
 * │                                             │
 * │   Write a haiku about programming in the    │
 * │   rain.                                     │
 * │                                             │
 * └─────────────────────────────────────────────┘
 *
 * Content is displayed in italics.
 * Good for showing prompts, quotes, or user input examples.
 */
