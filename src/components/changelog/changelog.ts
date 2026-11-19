export type BadgeType =
  | "shipped" | "shipping"
  | "built" | "building"
  | "led" | "leading"
  | "improved" | "improving"
  | "wrote"
  | "consulted"
  | "iterated"
  | "contributed";
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
   version: "4.2.0",
   title: "aampersand",
   dateRange: "Nov 2025 - Present",
   summary: "Solo-designing and engineering a creative writing tool built on a relational annotation graph. Every product surface (editor, wiki, clothesline, investigation boards) is a query projection over the same underlying data.",
   isCurrent: true,
   color: "green",
   entries: [
    { type: "building", text: "Scene-based ProseMirror editor: each scene is its own TipTap instance, constant typing performance regardless of manuscript length" },
    { type: "building", text: "Annotation graph system: sparks (narrative beats) and etches (world facts) live as decorations, never persisting in stored HTML" },
    { type: "building", text: "Offline resilience: IndexedDB-backed mutation replay outboxes for prose, scenes, and chapters" },
    { type: "building", text: "Clothesline planning surface: chapters hang as pins from a horizontal wire; sparks appear as clips beneath them; plotline threads render as colored SVG bezier curves weaving across the book's reading order, making narrative gaps and convergences immediately visible"},
    { type: "built", text: "Multi-theme design system with Zustand two-layer store (persisted wardrobe + transient studio state) and full-screen Theme Editor" },
    { type: "built", text: "In-browser spell checker via hunspell-wasm in a Web Worker with wiki entity dictionary injection" },
    { type: "built", text: "Dictionary and thesaurus panel (Datamuse + Free Dictionary API integration)" },
    { type: "built", text: "Modular wiki system: Wikipedia-style base pages with Notion-style block canvas and inline citation via drag-to-sentence" },
  ],
  stack: ["Next.js", "React 19", "TypeScript", "TipTap/ProseMirror", "Neon PostgreSQL", "Clerk", "Zustand", "TanStack Query", "Vercel"],
  },
  {
    version: "4.1.2",
    title: "taylormcneil.dev",
    dateRange: "Dec 2025 - Present",
    summary: "Designing and building this site as a working documentation system, not a static portfolio: written like API reference docs, published through its own tooling, and checked in a real browser before changes ship.",
    color: "pink",
    entries: [
      { type: "built", text: "Docs-as-portfolio site in Next.js and MDX, structured like an API reference: every page is an endpoint with a method, a request and a response" },
      { type: "built", text: "Entry Editor: a publishing workbench that turns a devlog draft into its page, metadata, link previews, index card and llms.txt entry in one reviewed step" },
      { type: "wrote", text: "The aampersand builder's journal: monthly long-form devlogs and a numbered, filterable set of the rules they taught me" },
      { type: "built", text: "Custom documentation components: diagrams, code tabs, response panels and callouts that work in both themes and on phones" },
      { type: "built", text: "Browser verification harness that checks routes, redirects, metadata and rendering before a change goes live" },
      { type: "shipped", text: "Archived snapshots of published documentation, so writing samples stay readable after the originals change" },
      { type: "improved", text: "Discoverability: canonical URLs, sitemap, structured data, per-page link previews and an llms.txt for AI agents" },
      { type: "built", text: "Small tools along the way: an Open Graph image maker and a YouTube comments extractor" },
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "MDX", "Tailwind CSS v4", "Playwright"],
  },
  {
    version: "4.1.1",
    title: "AI Evaluation Consulting",
    dateRange: "Sep 2025 - Present",
    summary: "Consulting for external clients on how AI output gets judged: designing evaluation rubrics and writing the gold-standard examples models are trained and measured against.",
    color: "yellow",
    entries: [
      { type: "consulted", text: "AI evaluation rubrics for external clients" },
      { type: "wrote", text: "Gold-standard training data that sets the bar model output is measured against" },
    ],
  },
  {
   version: "4.1.0",
   title: "MongoDB",
   dateRange: "Sep 2025 - Present",
   summary: "Documentation engineer working where databases meet AI: writing the docs for MongoDB's AI and agent integrations, contributing to open-source AI documentation, writing agent skills, and building the sample apps and fullstack tutorials developers learn from.",
   color: "blue",
   entries: [
    { type: "wrote", text: "AI integration docs for the Claude Agent SDK and LangChain DeepAgents" },
    { type: "wrote", text: "Conceptual documentation on agent memory for stateful AI applications" },
    { type: "contributed", text: "Open-source AI documentation across MongoDB's AI and agent ecosystem" },
    { type: "wrote", text: "Agent skills that teach AI coding assistants to work with MongoDB" },
    { type: "built", text: "Sample applications with a unified frontend and 3 separate backend implementations" },
    { type: "built", text: "Testing suites for sample applications and select high traffic pages" },
    { type: "wrote", text: "Fullstack tutorials for implementing MongoDB with TanStack, Vue, and Actix" },
    { type: "improved", text: "Full programming language documentation set: comprehensive update and modernization" },
  ],
  stack: ["MongoDB", "Claude Agent SDK", "LangChain", "TanStack", "Vue", "Actix"],
  },
  {
    version: "4.0.0",
    title: "Travel and Writing",
    dateRange: "Jun 2024 - Sep 2025",
    summary: "A break between roles. I traveled, wrote books, and started pondering the writing tool that became aampersand.",
    color: "gray",
    entries: [
      { type: "wrote", text: "Books, written while traveling" },
      { type: "iterated", text: "The first ideas for aampersand, shaped by what I needed as a writer" },
    ],
  },
  {
    version: "3.2.0",
    title: "Mastercard",
    dateRange: "Jan 2023 - Jun 2024",
    summary: "Owned the full API documentation lifecycle for OpenBanking, from authoring OpenAPI specs to launching Postman workspaces to running hackathons. Made enterprise APIs feel approachable.",
    color: "orange",
    entries: [
      { type: "shipped", text: "OpenBanking docs rebuild using OpenAPI + Swagger" },
      { type: "shipped", text: "Mastercard x Postman public workspace" },
      { type: "built", text: "Interactive Postman collections and sandbox training materials" },
      { type: "led", text: "TechCrunch Disrupt 2023: lead developer liaison" },
      { type: "led", text: "MC Internal Hackathons: 1,200+ developers, 300+ projects, 3 Continents" },
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
      { type: "led", text: "Stellar x Ledger Hackathon in Paris" },
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
    summary: "First real DevRel role. Built whatever developers needed: demo apps, SDKs, auth guides, video tutorials. Learned that great docs start with understanding where developers get stuck.",
    color: "yellow",
    entries: [
      { type: "shipped", text: "HMAC Authentication guide, which became the org-wide onboarding standard" },
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
      { type: "shipped", text: "B.S. Computer Science, Georgia State University" },
      { type: "shipped", text: "YouTube tutorials: 75k+ developers reached (Python, Java, game dev)" },
      { type: "shipped", text: "Tic Tac Toe in Java tutorial: 75k+ views across Medium & YouTube" },
      { type: "led", text: "CEO of PantherHackers: workshops, hackathons, weekly meetups" },
      { type: "led", text: "Taught beginner Python to 150+ students" },
      { type: "built", text: "Norfolk Southern internship: Spring Boot microservices" },
      { type: "built", text: "NCR internship: Python app for API education" },
    ],
    stack: ["Python", "Java", "Spring Boot", "JavaScript", "C#"],
  },
];