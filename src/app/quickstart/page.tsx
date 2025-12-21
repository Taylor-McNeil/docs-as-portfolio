import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";

export default function Quickstart() {
  return (
    <div className="space-y-6">
      <ResponsePanel
        data={{
          status: 200,
          summary: {
            experience: "5+ years",
            focus: "Developer enablement",
            reach: "75k+ developers",
            events: "35+ across 6 continents",
            onboarding_impact: "-40%",
            current_mode: "Building, not traveling",
          },
          faq_count: 6,
          vibe: "acquired taste",
        }}
      />

      <PageHeader
        method="GET"
        endpoint="/quickstart"
        title="Quickstart"
        description="Why hire me? I bridge the gap between Product Engineering and Developer Advocacy."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-surface-card border border-border-card rounded-lg">
          <div className="text-2xl font-bold text-accent">40%</div>
          <div className="text-xs text-foreground-muted mt-1">onboarding ↓</div>
        </div>
        <div className="text-center p-4 bg-surface-card border border-border-card rounded-lg">
          <div className="text-2xl font-bold text-accent">75k+</div>
          <div className="text-xs text-foreground-muted mt-1">developers</div>
        </div>
        <div className="text-center p-4 bg-surface-card border border-border-card rounded-lg">
          <div className="text-2xl font-bold text-accent">6</div>
          <div className="text-xs text-foreground-muted mt-1">continents</div>
        </div>
        <div className="text-center p-4 bg-surface-card border border-border-card rounded-lg">
          <div className="text-2xl font-bold text-accent">35+</div>
          <div className="text-xs text-foreground-muted mt-1">events</div>
        </div>
      </div>
    </div>
  );
}