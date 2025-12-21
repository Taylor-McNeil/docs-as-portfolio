import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";

export default function Home() {
  return (
    <div className="space-y-6">
      <ResponsePanel
        data={{
          status: 200,
          data: {
            role: "Developer Experience Engineer",
            location: "Atlanta, GA",
            email: "mcneiltaylor@live.com",
            github: "https://github.com/taylor-mcneil",
            linkedin: "https://linkedin.com/in/taylormcneil",
            availability: "Open for opportunities",
          },
        }}
      />

      <PageHeader
        method="GET"
        endpoint="/taylor-mcneil/readme"
        title="Introduction"
        description="I design developer systems that reduce friction and scale adoption."
      />

      <p className="text-foreground-muted">
        Unlike traditional technical writers, I treat documentation as{" "}
        <strong className="text-foreground">infrastructure</strong>. I build the pipelines,
        the portals, and the tooling that make developer experience measurable and reliable.
      </p>
    </div>
  );
}