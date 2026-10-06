# Ampersand Marketing Devlog Editor

**Status:** Current conceptual direction  
**Date:** September 2, 2026  
**Target repository:** `/Users/taylor/Documents/Programming Repos/ampersand-site`  
**Implementation state:** Not started

## Decision

The marketing-site devlog editor should be built inside the `ampersand-site` repository. It should be modeled on the Entry Editor in `taylor-mcneil-dev`, but adapted to the marketing site's actual devlog layout, components, metadata, assets, and publishing workflow.

It should not be combined with:

- The Ampersand Encyclopedia
- Ampersand Backstage
- The Encyclopedia content renderer
- Encyclopedia database storage
- A cross-repository content platform

The two efforts may independently reuse general lessons about authoring interfaces, but they no longer share an implementation plan.

## Why the Direction Changed

The combined Content Studio idea treated two distinct needs as though their shared need for “an editor” implied a shared content system.

That was the wrong level of abstraction.

Encyclopedia content is product documentation intended to render from one source across contextual help, a support panel, a full application view, and eventually a public documentation site. Its concerns include concise summaries, product taxonomy, cross-references, multiple reading surfaces, localization, and database publication.

Marketing devlogs are public narrative essays. Their concerns include literary pacing, visual storytelling, search and social metadata, campaign calls to action, bespoke imagery, and interactive presentation. They are published by a separate Next.js repository with its own visual language and deployment lifecycle.

The overlap is mostly interaction-level knowledge:

- A split source/preview layout is useful.
- Rich-text paste cleanup is useful.
- Component insertion tools are useful.
- Draft recovery is useful.
- Immediate visual feedback is useful.

Those are patterns worth repeating. They are not evidence that the content belongs to one domain model, renderer, database, or administrative application.

## The Problem to Solve

Creating a marketing devlog currently requires working directly in a large TSX page. The writer must think about prose and implementation at the same time:

- JSX structure
- Imports
- Escaped punctuation and entities
- Layout wrappers
- Metadata
- JSON-LD
- Image paths
- Specialized marketing components
- Sidebar/index registration
- Sitemap discovery
- `llms.txt`
- Final visual verification

This makes the codebase the writing interface. It is powerful, but it imposes implementation details during the most editorial part of the process.

The desired editor should let Taylor concentrate first on the essay—its language, rhythm, sections, images, and special visual moments—while still producing content that fits naturally into the existing marketing site.

The goal is not to remove code from the publication process entirely. It is to move code out of the ordinary writing loop.

## Current Marketing-Site Reality

The current devlogs live under:

`src/app/devlog/{month-year}/page.tsx`

They are hand-authored React pages rather than MDX documents. A typical entry assembles:

- `DevlogPostLayout`
- `Header`
- `PostHero`
- `ProseLayout`
- `DropCap`
- `Footer`
- `PostCTA`
- Entry-specific visual components

Across existing entries, the additional vocabulary includes:

- `Callout`
- `Polaroid`
- `FeatureWalkthrough`
- `HorizontalScroll`
- `ScrollImage`
- `StoryGraph`
- `ProseTable`
- `Divider`
- `Card`
- Planning vignettes
- `AppDemo`

Publication also relies on `src/data/devlogEntries.ts`. That list drives the Devlog sidebar, index page, and sitemap. Open Graph images live under `public/og`, while entry images live under `public/devlog-images/{month-year}`. The public `llms.txt` file may also require an entry.

The repository already includes `turndown`, and its development-only `DevMenu` can copy a rendered article as Markdown. It does not currently contain a source editor, MDX compiler, draft store, or publishing workflow.

## Where the Editor Should Live

The proposed route is:

`/tools/devlog-editor`

It should exist only during local development, following the same basic protection model as the `taylor-mcneil-dev` Entry Editor:

```tsx
if (process.env.NODE_ENV !== "development") {
  notFound();
}
```

The route should also be linked from the existing development menu so it is discoverable while working locally but absent from production.

This placement provides several advantages:

- The editor sits beside the content it produces.
- It can import the real marketing-site components.
- It can preview with the real marketing-site fonts, tokens, and layout.
- It can inspect existing devlog routes and assets without crossing repository boundaries.
- A later publishing action can safely generate files in the current repository.
- Git shows the complete publication result in one worktree.
- The Encyclopedia remains free to choose an architecture appropriate to product documentation.

## Proposed Writing Experience

The primary interface should preserve the strongest parts of the existing Entry Editor.

### Top bar

- Draft title
- Target month and year
- Draft status
- Editor / Split / Preview layout controls
- Reset or discard action
- Export or prepare-publication action

### Source pane

- Title
- Slug derived from month and year, with an explicit override if needed
- Display date and devlog number
- SEO title
- SEO description
- Social description
- Canonical URL preview
- Open Graph image path
- JSON-LD headline and publication date
- Markdown/MDX source editor
- Formatting and component toolbar
- Save state and word count

### Preview pane

- The real `DevlogPostLayout`
- The real site header
- The real `PostHero`
- The real `ProseLayout` and prose styling
- The real marketing components used by the draft
- The real `PostCTA`
- Desktop and narrow-reading-width previews
- Clear compile or validation errors without losing the last valid preview

The preview does not need a second invented theme. It should render the marketing site exactly as the marketing site is designed.

## Recommended Content Direction

The cleanest incremental direction is to allow **new devlogs to be authored as MDX**, while leaving existing TSX devlogs untouched.

This follows the successful shape already used in `taylor-mcneil-dev`:

```text
src/app/devlog/sep-2026/
├── layout.tsx      # metadata and canonical/social configuration
├── page.mdx        # prose and approved marketing components
└── optional route-local assets
```

Existing January–June TSX pages do not need to be migrated merely to build the editor. Next.js can support old TSX entries and new MDX entries simultaneously.

### Why MDX is appropriate here

- The tool is local and the author is trusted.
- The published destination is still source-controlled code.
- The marketing essays legitimately use React presentation components.
- Markdown keeps ordinary prose readable.
- Component syntax remains available for the exceptional visual moments.
- The editor can render the same MDX that will become the published page.
- The final Git diff remains inspectable.

The earlier warning against executable MDX applied to database-provided Encyclopedia content. It does not imply that trusted, repository-owned marketing content cannot use MDX.

## Authoritative Renderer

The editor should not duplicate the marketing site's prose rules and call the result exact.

A shared repo-local devlog rendering module should own the published shell used by both new MDX pages and the editor preview. Conceptually:

```tsx
<DevlogArticle metadata={draft.metadata}>
  <RenderedMdx source={draft.body} />
</DevlogArticle>
```

`DevlogArticle` would hide the repetitive implementation now spread across individual pages:

- `DevlogPostLayout`
- `Header`
- Structured data
- `PostHero`
- `ProseLayout`
- Article prose classes
- Optional `PostCTA`
- `Footer`

The MDX component registry would also be shared. Adding or changing a supported component in one place would update both authoring preview and published MDX entries.

This is the key seam. The editor should consume the renderer; it should not carry a parallel imitation of it.

## Supported Component Palette

The initial toolbar should focus on components that already recur across public devlogs.

### Basic formatting

- H2
- H3
- Bold
- Italic
- Link
- Blockquote
- Ordered and unordered lists
- Horizontal divider

### Devlog components

- Drop cap
- Callout
- Polaroid
- Single image
- Image grid
- Horizontal image sequence
- Prose table
- Card
- CTA

### Advanced components

These can initially be inserted as templates rather than receiving elaborate visual forms:

- Feature walkthrough
- Story graph
- Application demo
- Planning vignette

The toolbar should be generated from a component definition registry containing each component's label, insertion template, editable properties, validation rules, and preview registration. This avoids maintaining unrelated toolbar, compiler, and publishing lists.

## Draft Model

The editor needs a complete draft, not only a body string.

```ts
interface DevlogDraft {
  version: 1;
  id: string;
  title: string;
  month: number;
  year: number;
  number: number;
  slug: string;
  body: string;
  seo: {
    title: string;
    description: string;
    socialDescription: string;
    jsonLdHeadline: string;
    canonicalUrl: string;
    publishedAt: string;
    ogImagePath: string;
  };
  cta: null | {
    variant: string;
    title: string;
    description: string;
    buttonText: string;
    loadingText: string;
    successText: string;
    formId: string;
  };
  updatedAt: string;
}
```

The precise field names remain open, but the invariants matter:

- A draft is versioned.
- The full publication metadata travels with the prose.
- Slug, canonical URL, dates, and asset paths can be validated together.
- Exporting a draft does not silently omit publication-critical information.

## Draft Persistence

The first version does not need accounts, a database, or a CMS.

It should support multiple local drafts through browser storage. IndexedDB would be more appropriate than one `localStorage` value because the editor may eventually retain several long essays and richer metadata.

The first version should also provide explicit backup:

- Export draft JSON
- Import draft JSON
- Copy body MDX
- Copy complete publication handoff

Browser autosave is convenience, not a backup strategy. The interface should say where the draft is stored and provide a way to move it before the browser profile becomes the only copy.

## Rich-Paste Behavior

The existing Entry Editor's Google Docs paste behavior should be adapted rather than copied blindly.

The marketing editor should preserve:

- Paragraphs
- H2/H3 headings
- Bold and italic emphasis
- Links
- Lists
- Blockquotes
- Tables where practical

It should remove:

- Font and color styling
- Google-specific spans and identifiers
- Scripts and embedded objects
- Unsupported attributes

Pasted images should not vanish silently. The editor should report them and explain that they must be added under the draft's intended `public/devlog-images/{slug}` folder before inserting an image component.

## Preparing a Publication

The editor should distinguish three actions:

### Save draft

Persist the current draft locally. This has no repository or public effect.

### Prepare publication

Generate or preview the proposed repository changes:

- `src/app/devlog/{slug}/page.mdx`
- `src/app/devlog/{slug}/layout.tsx`
- Entry in `src/data/devlogEntries.ts`
- Expected Open Graph image path
- Expected devlog image folder
- Proposed `public/llms.txt` entry

The first implementation can copy or download this handoff rather than writing files.

### Create publication files

A later development-only server action can write the validated files into the repository. It should:

- Require development mode
- Accept only a validated slug
- Resolve every destination beneath fixed repository directories
- Refuse to overwrite an existing route unless the user explicitly chooses an update workflow
- Show the exact files that will be created or changed
- Never run Git commit, push, or merge as an implicit side effect

Git review, testing, commit, and push remain ordinary repository operations. They can be assisted separately after the generated files exist.

## Validation

Before a draft is ready for publication, the editor should check:

- Required title and descriptions
- Valid month, year, sequence number, and slug
- Canonical URL consistency
- JSON-LD publication date consistency
- Open Graph path and expected dimensions
- Duplicate H2 identifiers
- Unsupported MDX components
- Missing required component properties
- Broken internal devlog links where detectable
- Missing alt text
- Referenced local assets that do not exist once repository writing is introduced
- CTA completeness
- Whether the `devlogEntries` target already exists

Errors that prevent compilation should preserve and display the last valid preview. Publication-blocking errors should be distinguished from editorial warnings.

## Scope for the First Useful Version

### Include

- Development-only `/tools/devlog-editor` route
- One shared devlog renderer used by preview
- Multiple local drafts
- Complete metadata form
- Markdown/MDX editor
- Google Docs rich-paste cleanup
- Live preview using real marketing components
- Basic and recurring component insertion tools
- Outline and duplicate-heading feedback
- Autosave with visible status
- JSON import/export
- Complete publication handoff generation
- Focused tests for draft migration, paste conversion, validation, and insertion behavior
- Browser verification of the real rendered editor

### Defer

- Database storage
- User authentication
- Ampersand Backstage integration
- Encyclopedia concepts or fields
- Automatic Git commits
- Automatic Git pushes
- Git provider credentials
- Pull-request creation
- Vercel deployment control
- Migration of existing TSX devlogs
- General-purpose CMS behavior
- Multi-author review workflows

## Suggested Module Shape

The editor should be composed around a few deep modules rather than one very large client file.

### `devlog-draft`

Interface responsibilities:

- Create and migrate drafts
- Derive slug, canonical URL, and sequence defaults
- Validate a complete draft
- Serialize and restore portable draft files

### `devlog-source`

Interface responsibilities:

- Normalize rich paste
- Insert formatting and component templates at a selection
- Extract the outline
- Diagnose unsupported components and duplicate headings

### `devlog-renderer`

Interface responsibilities:

- Compile trusted local MDX
- Provide the single supported component registry
- Render the authoritative devlog article shell
- Return useful compile failures without destroying the last valid result

### `devlog-publication`

Interface responsibilities:

- Produce the page source
- Produce route metadata
- Produce index and `llms.txt` changes
- Produce an asset manifest
- Report conflicts before any file changes

The editor page coordinates these modules. It should not reimplement their behavior.

## Candidate File Layout

This is illustrative rather than final:

```text
src/
├── app/
│   └── tools/
│       └── devlog-editor/
│           ├── page.tsx
│           └── DevlogEditor.tsx
├── components/
│   └── devlog/
│       ├── DevlogArticle.tsx
│       └── devlogMdxComponents.tsx
└── lib/
    └── devlog-editor/
        ├── draft.ts
        ├── paste.ts
        ├── source.ts
        ├── validation.ts
        ├── publication.ts
        └── storage.ts
```

If the editor grows, its client interface can be split further. The important rule is that renderer and publication behavior must not become private logic inside the route-level editor file.

## Delivery Phases

### Phase 1: Authoring foundation

- Add development-only route
- Add versioned multi-draft storage
- Add metadata form
- Add source editor
- Add rich-paste conversion
- Add basic Markdown preview

**Exit condition:** Taylor can paste and comfortably revise a complete devlog without working in a TSX page.

### Phase 2: Authoritative marketing preview

- Extract the shared `DevlogArticle` shell
- Add MDX support for new routes
- Build the shared component registry
- Add recurring component insertion dialogs
- Add desktop and narrow preview modes

**Exit condition:** The editor renders a draft using the same shell and registered components as a new published MDX devlog.

### Phase 3: Publication handoff

- Generate `page.mdx`
- Generate `layout.tsx`
- Generate index and `llms.txt` proposals
- Validate asset locations
- Export one complete handoff bundle

**Exit condition:** The generated handoff contains everything needed to create a reviewable devlog diff without reconstructing metadata manually.

### Phase 4: Safe repository writing

- Preview the exact proposed file changes
- Add development-only file generation
- Refuse accidental overwrites
- Verify the resulting route locally

**Exit condition:** A deliberate action creates a complete draft route in the current worktree, ready for Git review. Git operations remain separate.

## Open Questions

1. Should new devlogs officially move to MDX, or should the editor generate TSX while keeping Markdown only as its internal authoring representation?
2. Should `PostCTA` be part of every draft's structured metadata or remain an optional body component?
3. Should the editor manage several drafts, or is one “next devlog” slot sufficient initially?
4. Should metadata default from the month and sequence but remain independently editable?
5. Which three specialized components are most important to support through friendly insertion forms in the first release?
6. Is importing an existing TSX devlog into the editor a real workflow, or can editing begin only with new drafts?
7. Should “Prepare publication” download files, copy a structured handoff, or show a patch-like preview?
8. Are route-local images preferable for new entries, or should the current `public/devlog-images/{slug}` convention remain authoritative?
9. Does the editor need mobile authoring, or only responsive preview?
10. What proof should be required before a generated route is considered ready to commit?

## Current Recommendation

Build the editor in `ampersand-site` as a local development tool. Preserve the interaction model of the `taylor-mcneil-dev` Entry Editor, but give it the marketing site's own draft contract, component palette, renderer, metadata, and publication generator.

Adopt MDX for new devlogs if a short prototype proves that the most expressive existing entry can be represented without losing its character. Do not migrate old devlogs as part of the editor project.

Begin with drafting, recovery, and accurate preview. Generate an inspectable publication handoff before adding repository writes. Keep Git commit and push outside the editor until the writing and file-generation workflow has proven trustworthy.

Most importantly, allow the editor to remain a good local tool. It does not need to become the first layer of a universal Ampersand content platform in order to justify its existence.

## Evidence Consulted

### `taylor-mcneil-dev`

- `src/app/tools/entry-editor/page.tsx`
- `src/app/tools/entry-editor/entry-editor.tsx`
- `src/app/tools/entry-editor/entry-source-editor.tsx`
- `src/app/tools/entry-editor/entry-editor-utils.ts`
- `src/mdx-components.tsx`
- `.claude/commands/devlog.md`
- `ENTRY_EDITOR_AND_DEVLOG.md`

### `ampersand-site`

- `package.json`
- `next.config.ts`
- `src/app/layout.tsx`
- `src/app/devlog/*/page.tsx`
- `src/data/devlogEntries.ts`
- `src/components/dev/DevMenu.tsx`
- `src/components/layout/DevlogPostLayout.tsx`
- `src/components/layout/DevlogSidebar.tsx`
- `src/components/index.ts`
- `src/components/ui/index.ts`
- `src/components/ui/*`
- `src/app/sitemap.ts`
- `public/llms.txt`
