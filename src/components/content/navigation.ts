import {
  aampersandEntries,
  aampersandEntryHref,
  coverageLabel,
} from "@/data/aampersandEntries";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS";

export interface NavItem {
  href: string;
  label: string;
  method: Method;
}

export interface NavSection {
  title: string;
  subtitle?: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/", label: "Introduction", method: "GET" },
      { href: "/quickstart", label: "Quickstart", method: "GET" },
    ],
  },
   {
     title: "aampersand",
     subtitle: "building in public",
     items: [
       { href: "/aampersand", label: "Overview", method: "GET" },
       ...aampersandEntries.map((entry) => ({
         href: aampersandEntryHref(entry),
         label: coverageLabel(entry.coverage),
         method: "PUT" as const,
       })),
     ],
 },
  {
    title: "Field Notes",
    items: [
      { href: "/field-notes/on-building-a-doc-system", label: "Building Docs From Scratch", method: "OPTIONS" },
    ],
  },
   {
     title: "Side Projects",
     items: [
  //     { href: "/active-builds/ampersand", label: "&mpersand", method: "POST" },
  //     { href: "/side-projects/llm-evaluator", label: "LLM Evaluator", method: "POST" },
        { href: "/side-projects/the-longview", label: "The Long View", method: "POST"}
     ],
   },
   {
    title: "Tutorials",
     items: [
  //     { href: "/tutorials/year-calendar", label: "Year Calendar", method: "GET" },
       { href: "/tutorials/java-game-dev", label: "Java Game Dev", method: "GET" },
       { href: "/tutorials/mongodb-tanstack", label: "MongoDB x TanStack", method: "GET" },

     ],
   },
  {
    title: "Guides",
    items: [
      { href: "/guides/hmac-authentication", label: "HMAC Authentication", method: "GET" },
     // { href: "/guides/openapi-patterns", label: "OpenAPI Patterns", method: "GET" },
    ],
  },
  // {
  //   title: "Methodology",
  //   items: [
  //     { href: "/methodology/llm-evaluation", label: "LLM Evaluation Framework", method: "GET" },
  //     { href: "/methodology/release-notes", label: "Automating Release Notes", method: "GET" },
  //     { href: "/methodology/ai-doc-review", label: "AI-Assisted Doc Review", method: "GET" },
  //   ],
  // },
  {
    title: "Case Studies",
    items:[
      { href: "/case-studies/stellar-api-docs",label:"Stellar API Docs",method:"GET" },
      { href: "/case-studies/on-good-tutorials", label:" On Good Tutorials", method: "HEAD"}
    ]
  },
  {
    title: "Log",
    items: [
      {href: "/changelog", label:"Changelog", method:"PATCH"}
    ]
  }
];
