export type BadgeType =
  | "shipped" | "shipping"
  | "built" | "building"
  | "led" | "leading"
  | "improved" | "improving"
  | "writing"
  | "consulting"
  | "iterating";
export type VersionColor = "green" | "blue" | "purple" | "orange" | "yellow" | "gray" | "pink";

export interface ChangelogEntry {
  type: BadgeType;
  text: string;
}

export interface ChangelogVersion {
  version: string;
  title: string;
  dateRange: string;
  summary: string;
  isCurrent?: boolean;
  color: VersionColor;
  entries: ChangelogEntry[];
  stack?: string[];
}

export const changelogData: ChangelogVersion[] = [
  {
   version: "4.0.0",
   title: "Current",
   dateRange: "Sep 2025 - Present",
   summary: "Building tools that help people see complexity—whether that's a seven-book fantasy series or three competing LLM outputs. Shipping solo projects, consulting on AI evaluation, and writing docs that help developers ship faster.",
   isCurrent: true,
   color: "green",
   entries: [
    { type: "building", text: "&mpersand — creative workspace for fiction writers with Investigation Boards and modular wiki systems" },
    { type: "shipping", text: "DevRel Playground — multi-model comparison tool for evaluating AI-generated content" },
    { type: "writing", text: "Developer documentation and API guides" },
    { type: "consulting", text: "LLM evaluation rubrics and gold-standard training data" },
    { type: "iterating", text: "taylormcneil.dev — docs-as-portfolio" },
  ],
  stack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "MongoDB", "LLM APIs", "Docs-as-Code"],
  },
  {
    version: "3.2.0",
    title: "Mastercard",
    dateRange: "Jan 2023 - Jun 2024",
    summary: "Owned the full API documentation lifecycle for OpenBanking — from authoring OpenAPI specs to launching Postman workspaces to running hackathons. Made enterprise APIs feel approachable.",
    color: "orange",
    entries: [
      { type: "shipped", text: "OpenBanking docs rebuild using OpenAPI + Swagger" },
      { type: "shipped", text: "Mastercard x Postman public workspace" },
      { type: "built", text: "Interactive Postman collections and sandbox training materials" },
      { type: "led", text: "TechCrunch Disrupt 2023 — lead developer liaison" },
      { type: "led", text: "MC Internal Hackathons — 1,200+ developers, 300+ projects, 3 Continents" },
      { type: "improved", text: "Onboarding time: -23%" },
      { type: "improved", text: "Sandbox usage: +20%" },
    ],
    stack: ["OpenAPI", "Swagger", "Postman", "JavaScript", "Confluence"],
  },
  {
    version: "3.0.0",
    title: "Stellar Development Foundation",
    dateRange: "Jan 2022 - Jan 2023",
    summary: "Made blockchain accessible. Rebuilt the developer portal, created multi-language docs, and designed grant programs that kept community SDKs alive across 5 languages.",
    color: "purple",
    entries: [
      { type: "shipped", text: "Co-rebuilt developer portal using Docusaurus, MDX, and React" },
      { type: "shipped", text: "Multi-language technical documentation and code samples" },
      { type: "built", text: "SDK grant program across 5 languages" },
      { type: "led", text: "Stellar x Ledger Hackathon — Paris" },
      { type: "led", text: "Stellar NFT Hackathon x SXSW" },
      { type: "improved", text: "Integration errors: reduced to near-zero for 10,000+ monthly devs" },
      { type: "improved", text: "Developer education: 2,500+ learners through workshops" },
    ],
    stack: ["Docusaurus", "MDX", "React", "Python", "JavaScript"],
  },
  {
    version: "2.5.0",
    title: "Render Atlanta",
    dateRange: "Oct 2021 - Jul 2022",
    summary: "Community building at scale. Partnered with Dropbox to grow Atlanta's developer scene from 212 to 1,000+ members through events, content, and authentic connection.",
    color: "pink",
    entries: [
      { type: "led", text: "Developer workshops and technical Q&A sessions" },
      { type: "led", text: "Cross-functional coordination with speakers and industry professionals" },
      { type: "shipped", text: "Render x Miami - Crypto Art Basel activation"},
      { type: "shipped", text: "Render x DC - Break into Tech event"},
      { type: "shipped", text: "Render x SXSW - Render House Party x Tech panel"},
      { type: "shipped", text: "Podcasts, videos, and blog posts for developer engagement" },
      { type: "improved", text: "Community growth: 212 → 1,000+ members" },
    ],
    stack: ["Community", "Content", "Podcasting", "Events"],
  },
  {
    version: "2.0.0",
    title: "Dropbox",
    dateRange: "Sep 2021 - Jan 2022",
    summary: "Short but impactful stint modernizing legacy API docs. Migrated to OpenAPI, benchmarked against best-in-class portals, and laid groundwork for the Render Atlanta partnership.",
    color: "blue",
    entries: [
      { type: "shipped", text: "API documentation migration to OpenAPI spec" },
      { type: "shipped", text: "Technical guides and SDK documentation" },
      { type: "built", text: "Comparative research on best-in-class developer portals" },
      { type: "improved", text: "Onboarding time: -30%" },
    ],
    stack: ["OpenAPI", "JavaScript", "Git", "Notion"],
  },
  {
    version: "1.1.0",
    title: "NCR Corporation",
    dateRange: "Aug 2020 - Sep 2021",
    summary: "First real DevRel role. Built whatever developers needed — demo apps, SDKs, auth guides, video tutorials. Learned that great docs start with understanding where developers get stuck.",
    color: "yellow",
    entries: [
      { type: "shipped", text: "HMAC Authentication guide — became org-wide onboarding standard" },
      { type: "shipped", text: "Python SDK for API integration" },
      { type: "built", text: "Peachtree Burger demo app (Django + React)" },
      { type: "built", text: "Git-based documentation workflow with release cycle process" },
      { type: "led", text: "Internal developer enablement training sessions" },
      { type: "improved", text: "Auth-related support tickets: -40%" },
      { type: "improved", text: "Demo cycles: -40% for sales and dev teams" },
    ],
    stack: ["Python", "Django", "React", "JavaScript", "Confluence"],
  },
  {
    version: "1.0.0",
    title: "Origins",
    dateRange: "2018 - 2020",
    summary: "CS degree by day, community builder by night. Led PantherHackers, taught Python to 150+ students, and accidentally became a YouTuber. Discovered that explaining things was the job I wanted.",
    color: "gray",
    entries: [
      { type: "shipped", text: "B.S. Computer Science — Georgia State University" },
      { type: "shipped", text: "YouTube tutorials — 75k+ developers reached (Python, Java, game dev)" },
      { type: "shipped", text: "Tic Tac Toe in Java tutorial — 75k+ views across Medium & YouTube" },
      { type: "led", text: "CEO of PantherHackers — workshops, hackathons, weekly meetups" },
      { type: "led", text: "Taught beginner Python to 150+ students" },
      { type: "built", text: "Norfolk Southern internship — Spring Boot microservices" },
      { type: "built", text: "NCR internship — Python app for API education" },
    ],
    stack: ["Python", "Java", "Spring Boot", "JavaScript", "C#"],
  },
];