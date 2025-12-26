export type Method = "GET" | "POST" | "PUT" | "PATCH";

export interface NavItem {
  href: string;
  label: string;
  method: Method;
}

export interface NavSection {
  title: string;
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
  // {
  //   title: "Playground",
  //   items: [
  //     { href: "/playground/year-calendar-api", label: "Year Calendar API", method: "GET" },
  //   ],
  // },
  // {
  //   title: "Active Builds",
  //   items: [
  //     { href: "/active-builds/ampersand", label: "&mpersand", method: "POST" },
  //     { href: "/active-builds/llm-evaluator", label: "LLM Evaluator", method: "POST" },
  //   ],
  // },
   {
    title: "Tutorials",
     items: [
  //     { href: "/tutorials/year-calendar", label: "Year Calendar", method: "GET" },
  //     { href: "/tutorials/react-integration", label: "MongoDB + React", method: "GET" },
       { href: "/tutorials/java-game-dev", label: "Java Game Dev", method: "GET" },
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
    title: "Log",
    items: [
      {href: "/changelog", label:"Changelog", method:"PATCH"}
    ]
  }
];