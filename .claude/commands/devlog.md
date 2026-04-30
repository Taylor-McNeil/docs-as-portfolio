---
description: Scaffold a new monthly aampersand devlog from prose
allowed-tools: [Read, Write, Glob, Grep, Bash(mkdir:*), Bash(mv:*), Bash(ls:*)]
argument-hint: <title> | <slug> | <method> <endpoint> | <description>
---

## Your task

The user wants to create a new aampersand devlog entry. They will provide:

1. **Title** — the devlog title (e.g. "A Siren's Song")
2. **Slug** — the URL slug (e.g. "a-sirens-song")
3. **HTTP method and endpoint** — for the GuideHeader (e.g. `PUT /design/solutions`)
4. **Description** — a one-line SEO description
5. **Prose** — the full devlog content, with freeform bracketed instructions for component placement

If any of these are missing, ask for them before proceeding.

## What to create

Create two files inside `src/app/aampersand/{slug}/`:

### 1. `layout.tsx`

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "{Title} — {Short Subtitle From Description}",
  description: "{description}. aampersand devlog {N}.",
  alternates: {
    canonical: '/aampersand/{slug}',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Determine the devlog number by counting existing directories under `src/app/aampersand/`.

### 2. `page.mdx`

Follow this exact structure:

```mdx
{component imports — only import what the prose actually uses}

<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Title}",
  "description": "{short description}",
  "author": { "@type": "Person", "name": "Taylor McNeil", "url": "https://taylormcneil.dev" },
  "url": "https://taylormcneil.dev/aampersand/{slug}"
}} />

<GuideHeader
    title="{Title}"
    method="{METHOD}"
    endpoint="/aampersand/{slug}"
    mdxPath="src/app/aampersand/{slug}/page.mdx"
/>

<AnchorSidebar
    items={[
        { id: "{section-slug}", label: "{Section Title}" },
        ...
    ]}
/>

{content sections with ## headings, components placed per bracketed instructions}

<DevlogCTA
  linkText="{contextual link text}"
  linkHref="{url}"
>
{CTA body text about aampersand}
</DevlogCTA>
```

## Available components

Import from `@/components/content/` unless noted otherwise:

| Component | Import | Usage |
|-----------|--------|-------|
| `GuideHeader` | `@/components/content/GuideHeader` | Always used. Props: `title`, `method`, `endpoint`, `mdxPath` |
| `AnchorSidebar` | `@/components/layout/AnchorSidebar` | Always used. Props: `items` array of `{ id, label }` matching `##` headings |
| `JsonLd` | `@/components/content/JsonLd` | Always used. Article structured data |
| `DevlogCTA` | `@/components/content/DevlogCTA` | Always used at bottom. Props: `linkText`, `linkHref`, children |
| `Callout` | `@/components/content/Callout` | Types: `note`, `warning`, `tip`, `context`, `test`, `celebration` |
| `HeroQuote` | `@/components/content/HeroQuote` | Opening quote for a section, rendered as styled blockquote |
| `EmphasizedText` | `@/components/content/EmphasizedText` | Inline highlight. Colors: `green`, `blue`, `purple`, `orange`, `pink`, `yellow`, `cyan` |
| `LayoutDiagram` | `@/components/content/LayoutDiagram` | ASCII art diagram with title. Props: `title`. Children: template literal string |
| `CodeBlock` | `@/components/content/CodeBlock` | Code with syntax highlighting. Props: `language`, `filename` |
| `ExternalLink` | `lucide-react` | Icon for external links, typically `<ExternalLink size={12} className="inline" />` |

## Interpreting bracketed instructions

The user's prose will contain freeform bracketed instructions like:

- `[callout: tip about something]` → wrap surrounding text in `<Callout type="tip">`
- `[diagram: Title Here]` followed by ASCII art → wrap in `<LayoutDiagram title="Title Here">`
- `[hero quote]` → wrap the next paragraph in `<HeroQuote>`
- `[emphasize: color]` → wrap text in `<EmphasizedText color="color">`
- `[code: language, filename]` → wrap code block in `<CodeBlock>`
- `[context callout linking to URL]` → `<Callout type="context">` with link
- `[cta: link text | url]` → for the DevlogCTA at the bottom

Use your best judgment. The brackets indicate intent, not exact syntax. Remove the brackets from the final output and place the appropriate component.

## Section headings and AnchorSidebar

- Each `##` heading becomes an entry in `AnchorSidebar`
- The `id` is the kebab-case version of the heading text
- The `label` is the heading text as-is

## OG image handling

After scaffolding the devlog files, check for OG images in the **project root** (`e:/Programming/docs-as-portfolio/`) that need to be moved into the devlog's route directory.

### Steps

1. **Search** for image files in the project root matching common OG image names:
   - `opengraph-image.png`, `opengraph-image.jpg`, `opengraph-image.jpeg`
   - `twitter-image.png`, `twitter-image.jpg`, `twitter-image.jpeg`
   - Also check for any `og-*.png`, `og-*.jpg` variants

   Use `ls` to list matching files in the project root.

2. **Move** any found OG images into `src/app/aampersand/{slug}/`:
   - Rename to the Next.js convention: `opengraph-image.{ext}` and/or `twitter-image.{ext}`
   - If a file like `og-something.png` is found, rename it to `opengraph-image.png` when moving
   - Next.js App Router automatically generates `<meta property="og:image">` tags when these files exist in a route directory

3. **Update `layout.tsx`** — if an OG image was moved, add `openGraph` metadata to the layout so it has explicit dimensions:

   ```tsx
   export const metadata: Metadata = {
     title: "...",
     description: "...",
     alternates: { canonical: '/aampersand/{slug}' },
     openGraph: {
       title: "{Title}",
       description: "{description}",
       type: "article",
       images: [{ width: 1200, height: 630 }],
     },
     twitter: {
       card: "summary_large_image",
     },
   };
   ```

4. **Report** what was moved. If no OG images are found in the root, inform the user:
   > "No OG images found in the project root. You can generate one with the OG Image Maker at `/tools/ogmaker`, save it to the project root, and re-run this step."

## Sidebar navigation

After creating the devlog files, add the new entry to the sidebar navigation in `src/components/content/navigation.ts`.

1. Open the file and find the `aampersand` section.
2. Append a new `NavItem` to the `items` array:
   ```ts
   { href: "/aampersand/{slug}", label: "{Mon} {Year}", method: "PUT" }
   ```
   - The `label` is the abbreviated month + year of the devlog (e.g. "Apr 2026").
   - The `method` is always `"PUT"` for aampersand devlogs.
   - Keep the existing entries — only append.

## Style notes

- The devlogs are narrative essays with a literary voice — preserve the user's prose exactly
- Use `***bold italic***` for emphasis (the project's convention)
- Tables use standard markdown
- Horizontal rules (`---`) separate major thematic shifts
- The final section often ends with a teaser for next month using `<EmphasizedText>`
