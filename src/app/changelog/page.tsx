import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { TimelineItem } from "@/components/content/TimelineItem";
import { changelogData } from "@/components/changelog/changelog";
import { PageHeader } from "@/components/content/PageHeader";

const responseData = {
  total_uptime: "5 Years",
  deprecated: ["Static PDFs", "Manual Testing", "Road Warrior Mode"],
  excited_by: [
    "LLMs for customized learning",
    "AI-Chatbots for personalization",
    "AI usage for language acquisition"
  ],
  latest_release: "AI-Enhanced Workflows",
  weeks_since_friday_deployment: "0",
};

export const metadata = {
  title: "Career Timeline",
  description: "Career history as semantic versioning — from community building at Georgia State to API documentation at Stellar, Mastercard, and beyond.",
  alternates: {
    canonical: 'https://taylormcneil.dev/changelog',
  },
};


export default function Changelog() {
  return (
    <div className="space-y-8">
      <ResponsePanel data={responseData} />

      <PageHeader
        method="PATCH"
        endpoint="/log/changelog"
        title="Changelog"
      />

      {/* Timeline */}
      <div className="mt-8">
        {changelogData.map((version, index) => (
          <TimelineItem
            key={version.version}
            version={version}
            defaultExpanded={index === 0}
            isLast={index === changelogData.length - 1}
          />
        ))}
      </div>
    </div>
  );
}