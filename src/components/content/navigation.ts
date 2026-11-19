import {
  aampersandEntryGroups,
  aampersandEntryHref,
  coverageLabel,
} from "@/data/aampersandEntries";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS";

export interface NavLink {
  type: "link";
  href: string;
  label: string;
  method: Method;
  /** Entries shown indented under this link, always visible. */
  children?: NavEntry[];
}

export interface NavGroup {
  type: "group";
  label: string;
  children: NavLink[];
  /** Start expanded (devlog seasons). Groups always open when they hold the active page. */
  defaultOpen?: boolean;
  /** Show a folder icon. */
  folder?: boolean;
}

export type NavEntry = NavLink | NavGroup;

export interface NavSection {
  title: string;
  subtitle?: string;
  items: NavEntry[];
}

const link = (href: string, label: string, method: Method, children?: NavEntry[]): NavLink => ({
  type: "link",
  href,
  label,
  method,
  ...(children ? { children } : {}),
});

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      link("/", "Introduction", "GET"),
      link("/quickstart", "Quickstart", "GET"),
    ],
  },
  {
    title: "Professional Work",
    items: [
      link("/professional-work", "Selected Documentation", "GET", [
        {
          type: "group",
          folder: true,
          label: "Tutorials",
          children: [
            link("/professional-work/tutorials/java-game-dev", "Java Game Dev", "GET"),
            link("/professional-work/tutorials/mongodb-tanstack", "MongoDB x TanStack", "GET"),
          ],
        },
        {
          type: "group",
          folder: true,
          label: "Guides",
          children: [
            link("/professional-work/guides/hmac-authentication", "HMAC Authentication", "GET"),
          ],
        },
        {
          type: "group",
          folder: true,
          label: "Case Studies",
          children: [
            link("/professional-work/case-studies/stellar-api-docs", "Stellar API Docs", "GET"),
            link("/professional-work/case-studies/on-good-tutorials", "On Good Tutorials", "HEAD"),
          ],
        },
      ]),
    ],
  },
  {
    title: "aampersand",
    subtitle: "building in public",
    items: [
      link("/aampersand", "Overview", "GET", [
        link("/aampersand/rules", "The Rules", "GET"),
        ...aampersandEntryGroups().flatMap((group): NavEntry[] => {
          const children = group.entries.map((entry) =>
            link(aampersandEntryHref(entry), coverageLabel(entry.coverage), "PUT"),
          );
          return group.season
            ? [{ type: "group", label: group.season.title, children, defaultOpen: true, folder: true }]
            : children;
        }),
      ]),
    ],
  },
  {
    title: "Field Notes",
    items: [
      link("/field-notes/on-building-a-doc-system", "Building Docs From Scratch", "OPTIONS"),
    ],
  },
  {
    title: "Log",
    items: [link("/changelog", "Changelog", "PATCH")],
  },
];
