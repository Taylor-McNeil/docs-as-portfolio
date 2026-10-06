# Ampersand Content Studio and Encyclopedia

**Status:** Historical design exploration; superseded for the current implementation direction  
**Date:** September 2, 2026  
**Decision state:** The combined Backstage Content Studio direction is no longer being pursued. Encyclopedia authoring and marketing-site devlog authoring will be designed separately. This document remains as a record of the alternatives considered. See `AMPERSAND_SITE_DEVLOG_EDITOR_CONCEPT.md` for the current direction.

## Purpose

Taylor wants a comfortable, purpose-built place to write Ampersand content. The immediate inspiration is the Entry Editor in `taylor-mcneil-dev`: a private split-screen tool that accepts prose, cleans up rich-text paste, assists with special content blocks, and renders a live preview.

The new need is broader than that editor's original job:

1. Write and eventually publish **Encyclopedia documentation** used inside the Ampersand application and, later, on a public documentation site.
2. Write **Ampersand public devlogs**, whose published pages currently live in the separate `ampersand-site` repository.
3. Avoid building the entire Encyclopedia, CMS, public docs site, and cross-repository publishing system before a useful writing tool exists.
4. Preserve the possibility that the two content types share meaningful infrastructure without forcing them into one content model or one visual language.

The central design question is therefore not merely, “Where should an editor page live?” It is:

> What should be shared between Encyclopedia authoring and devlog authoring, what must remain destination-specific, and which repository should own the authoring workflow?

## The Immediate Problem

Writing is currently too entangled with implementation.

For `taylormcneil.dev`, the Entry Editor improves the drafting loop, but publishing still requires a separate repository-editing workflow. The editor is helpful because it removes several kinds of friction:

- Pasting from Google Docs without retaining noisy formatting
- Writing Markdown in a focused interface
- Seeing the result while writing
- Inserting custom visual blocks without memorizing JSX
- Catching malformed content early
- Keeping a draft between sessions

Taylor wants those advantages for Ampersand content, but the content does not have a single destination.

- Encyclopedia content belongs to the Ampersand product and is expected to become database-backed content rendered across multiple application and public surfaces.
- Public devlogs belong to `ampersand-site`, where they are currently hand-authored TSX pages with bespoke layouts and interactive elements.

Without a deliberate design, there are two obvious failure modes:

1. Build two unrelated editors and duplicate the difficult authoring behavior.
2. Build one “universal” content system that flattens the differences between documentation and narrative public writing.

## Existing System 1: The `taylor-mcneil-dev` Entry Editor

The current Entry Editor is a development-only MDX authoring workbench at `/tools/entry-editor`.

### What it currently does

- Offers Devlog and General Project draft types
- Provides a resizable source/preview layout
- Uses CodeMirror for source editing
- Converts rich clipboard HTML into semantic Markdown
- Supplies toolbar actions for Markdown and custom MDX blocks
- Compiles MDX in the browser and shows the last valid preview after an error
- Generates an H2/H3 table of contents and detects duplicate heading identifiers
- Switches between editor-only, split, and preview-only layouts
- Shows light and dark previews
- Autosaves one draft of each type to browser `localStorage`
- Copies the body MDX to the clipboard

### What it does not do

- Manage a collection of drafts
- Read or write repository files
- Publish content
- Preserve revision history
- Manage assets beyond inserting paths to files already in `/public`
- Copy or export a complete entry package including all metadata
- Guarantee an exact production preview
- Safely render database-provided content

The current preview imports many production components, but it also maintains its own Markdown element mapping, header, and page shell. That creates a drift seam: “uses many of the same pieces” is not the same as “uses the authoritative renderer.”

The editor also evaluates executable MDX in the browser. That is tolerable for a local tool containing trusted personal content. It should not become the storage or rendering model for authenticated, database-backed, or public documentation.

## Existing System 2: The Planned Encyclopedia

The current Encyclopedia reference describes a multi-surface, single-source documentation system internally modeled after Civilization's Civilopedia.

### Intended surfaces

1. Small contextual help popovers
2. A right-rail Encyclopedia support panel
3. A full in-application Encyclopedia view
4. A later external documentation site
5. Guided narrative learning experiences

### Intended content architecture

- Content stored as data rather than repository MDX
- An administrative writing interface
- Shared summaries for contextual help
- Searchable, cross-referenced entries
- Support for product areas, categories, related entries, media, localization, ordering, and publication status
- A content renderer that can adapt the same entry to different reading surfaces

### Important unresolved inconsistencies

The reference is not yet a build-ready content contract.

- The proposed table has one `body` field, while the later entry design has five independently selectable dimensions: Concept, Metaphor, Reference, Connects To, and Experience.
- One `gif_url` and one `video_url` do not represent a media-rich, block-oriented entry particularly well.
- `surface` appears to mean an Ampersand product area in the schema, but the document also uses “surface” for popover, panel, full view, and public site. `product_area` would be less ambiguous.
- `popover_locations` places potentially brittle interface identifiers inside the content record.
- The proposed draft/published status does not provide revisions, scheduled publication, rollback, or translation review despite the stated long-term ambitions.

These issues do not block building a drafting tool, but they do argue against treating the old table sketch as a settled schema.

## Where the Encyclopedia Currently Stands

The planned system has not been implemented in the active Ampersand worktree.

### Present today

- `ENCYCLOPEDIA` exists as a feature flag and is disabled.
- The Encyclopedia support-panel type is wired into the application shell.
- The support panel renders a “coming soon” placeholder.
- Ampersand has a real authenticated Backstage area for administrator-only operational tools.
- Ampersand has shared theme tokens, support-panel shells, application page layouts, feedback patterns, and save-status conventions that a future Encyclopedia can use.
- The Wiki is now a substantial full-page system with editable TipTap prose blocks, entity metadata, citations, saved passages, search, persistence, and offline behavior.

### Not present today

- Encyclopedia database tables
- Encyclopedia repository functions or authenticated routes
- Encyclopedia entry hooks
- A Markdown-to-Ampersand content renderer
- An Encyclopedia authoring interface
- Published panel or full-page Encyclopedia entries
- Help popovers backed by entries
- External documentation rendering
- Guided Encyclopedia experiences

### Consequence of the Wiki's current maturity

The older plan proposed building a generic page chassis for Encyclopedia first and allowing Wiki to inherit it later. That sequence is now historically inverted: Wiki already exists and is specialized around story-world entities.

Encyclopedia should reuse appropriate visual and interaction conventions from Wiki, but it should not automatically inherit Wiki's `etching_blocks` records, citation-aware editor, or entity persistence model. Any attempt to extract a shared page system now must be justified by real shared behavior rather than by the original build order.

## Existing System 3: Public Devlogs in `ampersand-site`

Ampersand's public devlogs live in a separate repository:

`/Users/taylor/Documents/Programming Repos/ampersand-site`

They are currently code-authored TSX pages, not MDX documents or database entries.

Each published devlog may combine ordinary prose with destination-specific elements such as:

- `PostHero`
- `DropCap`
- `Callout`
- `Polaroid`
- `FeatureWalkthrough`
- `HorizontalScroll`
- `StoryGraph`
- Planning vignettes
- `PostCTA`
- Structured metadata and JSON-LD

Publishing also involves more than the page body:

- Route creation
- Page metadata
- Open Graph assets
- The shared `devlogEntries` index
- Sitemap inclusion through that index
- Public `llms.txt` maintenance
- Verification in the public site's visual system

The public site has a development-only menu that can copy a rendered page as Markdown, but it does not contain an authoring or publishing system.

This makes the public devlog a different editorial product from an Encyclopedia entry. It has a more narrative voice, more bespoke composition, different metadata, different calls to action, and a different production renderer.

## Existing System 4: Ampersand Backstage

Backstage is the current home for authenticated, administrator-only maintenance tools inside the Ampersand application. Its server layout checks the Clerk user against `ADMIN_USER_ID` and returns a concealed 404 to unauthorized visitors. Backstage currently includes Dictionary Suggestions and Quick Import.

This makes Backstage a plausible home for a private Content Studio because:

- It already expresses the concept of internal Ampersand operations.
- It has a stronger access model than a development-only route.
- It can be available in the deployed product rather than only on one development machine.
- It can eventually use Ampersand's normal database, repository, and authenticated route patterns.
- It centralizes Taylor's content work even when the publication destinations differ.

It also creates a new responsibility: an application in one repository would initiate or prepare publication into another repository. That should be treated as an explicit publishing seam, not hidden behind an ordinary Save button.

## What Is Actually in Conflict?

Some of the tension comes from combining questions that can be decided independently.

### Authoring location versus publication destination

The studio can live in Ampersand Backstage while a devlog is ultimately published by `ampersand-site`. The editor does not have to live beside the output files.

The cost is that cross-repository publication needs an explicit mechanism: export, a local command, a shared content source, or a Git provider integration.

### Shared editor versus shared renderer

Encyclopedia entries and public devlogs can share:

- Draft management
- Source editing
- Rich-paste cleanup
- Autosave
- Validation infrastructure
- Asset selection concepts
- Block insertion interactions
- Publication-state language

They do not necessarily share:

- Their full metadata contracts
- Their complete block vocabularies
- Their page shells
- Their visual styles
- Their publication adapters
- Their authoritative previews

One studio does not require one renderer.

### Docs-as-data versus devlogs-as-code

The Encyclopedia plan favors database content because documentation changes on a different lifecycle from application code and must render in several surfaces.

The public devlogs are presently code because their pages use bespoke React compositions. Both approaches can coexist, but a studio spanning them must either:

- Produce two different output forms, or
- Move both destinations to a new shared content format.

The second choice is a much larger migration.

### Exact preview versus centralized authoring

An Encyclopedia preview inside Ampersand can use the real Encyclopedia renderer and be authoritative.

A devlog preview rendered inside Ampersand cannot be called pixel-identical while the production renderer and styles live only in `ampersand-site`. Exact devlog preview requires one of the following:

- A renderer package genuinely shared by both repositories
- A preview route hosted by `ampersand-site`
- A generated branch and deployment preview
- Migration of devlogs to shared database content rendered by the public site

Until one exists, Backstage can provide a structural editorial preview, but the public-site preview remains the acceptance surface.

### Safe content versus unlimited expression

Arbitrary MDX/JSX maximizes expressiveness but is not an appropriate database content format. A typed block vocabulary is safer and easier to validate, but every supported block becomes part of a maintained content contract.

The design must decide how much bespoke expression public devlogs require and whether rare custom experiences should remain hand-finished in code.

## Design Goals

A successful design should:

1. Make writing materially easier before the full docs system exists.
2. Give Taylor one obvious place to manage Ampersand content work.
3. Preserve the distinct voice and presentation of public devlogs.
4. Allow Encyclopedia preview to become exact across panel and full-page surfaces.
5. Avoid executable database content.
6. Avoid direct, unreviewed writes to the public site's main branch.
7. Make content portable and recoverable.
8. Keep future publication and storage mechanisms replaceable without rebuilding the editor.
9. Label preview fidelity honestly.
10. Avoid coupling Encyclopedia development to a speculative extraction from the current Wiki.

## Design Options

### Option A: Keep one editor in each destination repository

Build an Encyclopedia editor in Ampersand and a separate devlog editor in `ampersand-site`.

**Advantages**

- Each editor can use its destination's exact renderer and styles.
- Repository ownership is obvious.
- No cross-repository publishing mechanism is required.
- Public-site devlogs can retain arbitrary local React components.

**Disadvantages**

- Draft management, rich paste, toolbar interactions, validation, and autosave are duplicated.
- Taylor must remember which tool to open for which content.
- Improvements to the writing experience can drift.
- It does not create a unified view of Ampersand's editorial work.

**Best fit if:** exact preview and low architectural coupling matter more than a unified workflow.

### Option B: One Backstage shell containing two largely separate editors

Place both tools under `/backstage/content`, but allow Encyclopedia and Devlog modes to have independent models and editor implementations.

**Advantages**

- One administrative home.
- Each content type can remain highly specialized.
- Lower risk of inventing a false universal content abstraction.
- Work can begin with one content type without settling the other.

**Disadvantages**

- Visual proximity may conceal substantial duplicated implementation.
- Common improvements may still have to be made twice.
- Exact public-site preview remains unresolved.
- The “shared studio” may be mostly navigation rather than a deep module.

**Best fit if:** central discoverability matters, but the content models are expected to diverge significantly.

### Option C: Shared Content Studio with destination adapters

Build one Backstage studio for draft collection, editing, autosave, validation, and workflow. Use different content contracts, block palettes, preview adapters, and publication adapters for Encyclopedia and Devlog drafts.

**Advantages**

- One coherent writing workflow.
- Meaningful shared behavior has one implementation.
- Destination differences remain explicit.
- Encyclopedia can use an exact in-product renderer.
- Devlog publication can evolve from export to repository automation without replacing the studio.
- The adapter seam is real because at least two destinations vary there.

**Disadvantages**

- Requires disciplined interfaces to prevent a universal-content-model trap.
- Devlog preview is not exact until a public-site preview adapter exists.
- Cross-repository publication remains a separate capability.
- Some block concepts may look similar while having materially different rendering semantics.

**Best fit if:** Taylor wants one editorial home and is comfortable keeping rendering and publication destination-specific.

### Option D: Put all content in a shared database and make both applications render it

Store Encyclopedia entries and devlogs in a central content system. Ampersand and `ampersand-site` both read from it.

**Advantages**

- True centralized authoring and storage.
- No repository generation is required for normal publishing.
- Drafts, revisions, publication state, analytics, and localization can share infrastructure.
- The public site can render published content without a new code deployment.

**Disadvantages**

- This is close to building the full CMS now.
- Existing TSX devlogs require migration or a supported legacy path.
- Bespoke interactive devlog elements need a durable typed block system.
- Public content delivery, caching, availability, preview authorization, and schema evolution all become immediate concerns.
- A failure in the shared content system can affect both the product and public site.

**Best fit if:** deployless publishing and a long-term unified content platform justify a larger initial investment.

### Option E: Create a standalone local authoring application

Build a third tool whose only responsibility is authoring and exporting content to both repositories.

**Advantages**

- Neutral ownership between destinations.
- Can interact directly with local repositories when running locally.
- Exact previews could be delegated to each locally running destination.
- Does not add editorial implementation to the customer-facing product.

**Disadvantages**

- Introduces another application, dependency set, deployment story, and place to maintain.
- A local-only application is tied to a particular machine unless it gains its own hosted storage and authentication.
- It duplicates infrastructure already present in Backstage.
- It may become an internal platform before the underlying content contracts are settled.

**Best fit if:** local repository automation and strict isolation from the product outweigh operational simplicity.

## Comparison Matrix

| Criterion | A: Separate Editors | B: Backstage, Separate | C: Studio + Adapters | D: Shared Database | E: Standalone Tool |
|---|---:|---:|---:|---:|---:|
| One place to write | Low | High | High | High | High |
| Exact Encyclopedia preview | High | High | High | High | Medium–High |
| Exact devlog preview | High | Low–Medium | Medium initially | High after migration | High with local sites |
| Preserves bespoke devlogs | High | High | High | Medium | High |
| Low initial scope | Medium | Medium | Medium | Low | Low–Medium |
| Avoids duplicated authoring behavior | Low | Low–Medium | High | High | High |
| Avoids cross-repo integration | High | Low | Low | Medium | Low |
| Supports deployless publishing | Low | Low | Medium later | High | Low |
| Fits existing Backstage concept | Low | High | High | High | Low |
| Keeps destination ownership clear | High | Medium | High | Medium | High |

The matrix is directional rather than mathematical. Its purpose is to expose which value each option optimizes.

## A Plausible Hybrid to Explore

Option C currently appears to balance the stated goals, but it should remain a hypothesis until the content contracts are prototyped.

```text
Ampersand Backstage
└── Content Studio
    ├── Shared draft collection and editing workflow
    ├── Encyclopedia draft
    │   ├── Encyclopedia metadata
    │   ├── Safe documentation blocks
    │   ├── Exact panel/full-page preview
    │   └── Future database publication adapter
    └── Devlog draft
        ├── Public editorial metadata
        ├── Devlog-specific blocks and CTA
        ├── Structural preview in Backstage
        └── Export/branch/PR adapter for ampersand-site

ampersand-site
└── Authoritative public devlog renderer
    ├── Generated or reviewed TSX page
    ├── Route and metadata
    ├── Assets
    ├── devlogEntries index
    └── Deployment preview
```

The important distinction is:

> Share the writing desk and workflow. Do not assume the publications are the same kind of object.

### Possible first publication adapter

The smallest safe devlog integration is not “push directly to production.” It is an exported, versioned **Devlog Handoff Bundle** containing:

- Draft prose and typed blocks
- Devlog metadata
- CTA configuration
- Asset manifest
- Target month and slug
- SEO and structured-data fields

A local command or coding agent operating inside `ampersand-site` can consume that bundle, create the route, update shared indexes, place assets, run checks, and prepare a reviewable commit.

If that proves useful, the adapter can later create a Git branch and pull request automatically. Direct writes to the main branch should not be the default publishing contract.

## Potential Module Seams

These are candidate responsibilities, not settled filenames or interfaces.

### Draft workspace module

Owns:

- Draft collection
- Versioned draft storage
- Recovery and revision behavior
- Content-kind selection
- Autosave state

It should not know how an Encyclopedia panel or public devlog page is rendered.

### Authoring module

Owns:

- Source editing
- Rich-paste normalization
- Selection-aware formatting
- Block insertion interactions
- Shared validation presentation

It can accept destination-specific field definitions and block palettes rather than branching on every content kind internally.

### Encyclopedia content module

Owns:

- The safe Encyclopedia content contract
- Markdown or structured-block parsing
- Allowed block semantics
- Heading identifiers and outline extraction
- Internal cross-reference resolution
- Panel and full-page adaptations

The editor preview and published Encyclopedia surfaces should cross the same renderer seam.

### Devlog publication adapter

Owns:

- Conversion from a Devlog Draft into the public site's expected files or content payload
- Required imports for typed blocks
- Route metadata and structured data
- Index updates
- Asset-placement instructions
- Validation of unsupported blocks

It should produce a proposed publication result. A separate explicit action should commit, open a pull request, or publish it.

## Questions for Design Review

### Product and workflow

1. Is the primary value one place to write, or exact preview while writing?
2. Does Taylor need the Studio from multiple machines, or is a local-only first version acceptable?
3. Should devlogs and Encyclopedia entries appear in one combined content library or in visibly separate rooms within Backstage?
4. Is “Save” expected to mean save a draft, prepare a publication, or make content public?
5. How much revision history is needed before the Studio becomes trustworthy for long-form writing?

### Content model

6. Is Markdown the canonical source, or only the authoring representation for a typed document model?
7. Are the five Encyclopedia dimensions still desired, and must they exist in the first useful editor?
8. Which blocks truly belong to both content types, and which only appear superficially similar?
9. How should inline media be represented when an entry may contain multiple images, GIFs, diagrams, or videos?
10. Should related entries and contextual-help placements be authored manually, derived from application code, or managed through a separate mapping system?

### Devlog expression

11. Must every existing public devlog composition be reproducible inside the Studio?
12. Is it acceptable for uncommon devlog interactions to receive a final hand-authored TSX pass?
13. Should the Studio expose a finite devlog block palette, or support a controlled “custom site block” registry?
14. Would a structural preview plus an authoritative deployment preview feel sufficient?
15. Is preserving devlogs as code a deliberate long-term choice or merely the current implementation?

### Repository and publication

16. Should Backstage export a handoff bundle, invoke a local publishing command, or create a Git pull request?
17. Where should the versioned content contract live if two repositories eventually consume it at runtime?
18. Who owns backward compatibility when a public-site block changes?
19. Should publishing a devlog always produce a reviewable Git diff?
20. Does the eventual external docs site read directly from Ampersand's database, from a public content endpoint, or from a generated static snapshot?

### Security and operations

21. Will all Studio mutations repeat the Backstage administrator check server-side rather than relying only on page protection?
22. How are preview links protected when a draft is not public?
23. How are assets uploaded, scanned, stored, versioned, and transferred between the application and public site?
24. What is the recovery path after an accidental overwrite or publication?
25. What happens to public docs and devlogs if the content database or Ampersand application is unavailable?

## Suggested Experiments Before Choosing

These experiments are intentionally smaller than implementing the full Studio.

### Experiment 1: One real Encyclopedia entry

Represent one planned entry with its summary, body, related links, media, and panel/full preview. This will reveal whether the flat `body` model survives contact with the five-dimension idea.

### Experiment 2: One real devlog as typed content

Model an existing complex devlog—preferably one using a Polaroid, a vignette or walkthrough, and a CTA—as safe typed blocks. Measure how much hand-authored character is lost and how awkward the content becomes.

### Experiment 3: Handoff-bundle generation

Create a fixture bundle and determine whether `ampersand-site` can generate a readable, reviewable page diff from it. Do not automate Git publication yet.

### Experiment 4: Preview fidelity comparison

Render the same devlog draft in a generic Backstage preview and in the public site. Identify which differences affect writing decisions versus final visual polish.

### Experiment 5: Separate-editor baseline

Estimate the actual cost of putting a small editor directly in each repository. A shared Studio should beat this baseline through real leverage, not only through conceptual elegance.

## Current Working Conclusions

The following conclusions are supported by the current repositories, but remain open to challenge:

1. Backstage is a credible home for a unified private writing workflow.
2. Encyclopedia entries and public devlogs should not be forced into one renderer.
3. The shared opportunity is primarily the Studio workflow, not a universal published document.
4. Encyclopedia preview can become exact inside Ampersand; devlog preview cannot be exact there without additional cross-repository architecture.
5. Safe typed content is preferable to storing executable MDX or JSX.
6. Cross-repository publication should begin with an inspectable handoff or Git diff rather than a direct production push.
7. The old Encyclopedia schema and page-chassis sequence need revision against the current Wiki implementation.
8. A small prototype using one realistic entry of each kind will answer more than prematurely finalizing the entire CMS architecture.

## Repository Evidence Consulted

### `taylor-mcneil-dev`

- `src/app/tools/entry-editor/page.tsx`
- `src/app/tools/entry-editor/entry-editor.tsx`
- `src/app/tools/entry-editor/entry-source-editor.tsx`
- `src/app/tools/entry-editor/entry-editor-utils.ts`
- `src/mdx-components.tsx`
- `.claude/commands/devlog.md`
- `ENTRY_EDITOR_AND_DEVLOG.md`

### Ampersand application

- `src/app/backstage/layout.tsx`
- `src/app/backstage/page.tsx`
- `src/lib/auth/admin.ts`
- `src/config/features.ts`
- `src/components/supportPane/encyclopedia/EncyclopediaSupportSlot.tsx`
- `src/components/wiki/EntityPage.tsx`
- `src/components/wiki/blocks/WikiBlocks.tsx`
- `src/components/wiki/blocks/WikiBlockEditor.tsx`
- `src/lib/wiki/contracts.ts`
- `src/components/editor/markdown-paste-extension.ts`

### `ampersand-site`

- `src/app/devlog/*/page.tsx`
- `src/data/devlogEntries.ts`
- `src/components/layout/DevlogPostLayout.tsx`
- `src/components/dev/DevMenu.tsx`
- `src/components/ui/*`

### Planning reference

- “Docs System — Complete Reference,” compiled July 2026
