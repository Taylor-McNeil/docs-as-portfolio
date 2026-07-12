# Portfolio Project Brief

## Project Overview

Building a Next.js 16 portfolio for Taylor McNeil, a Developer Experience Engineer. The portfolio is styled as API documentation — treating the candidate as a product/dependency to evaluate.

**Tech Stack:**
- Next.js 16.1.0 with App Router
- npm runtime
- Tailwind CSS v4
- MDX for content pages
- highlight.js for syntax highlighting (migrated from Shiki)
- TypeScript

**Repo Location:** `E:\Programming\docs-as-portfolio`

---

## Design System

### Color Tokens (in globals.css via @theme)

| Token | Usage |
|-------|-------|
| `surface-bg` | Page background |
| `surface-card` | Card backgrounds |
| `surface-terminal` | Code blocks, terminal UI |
| `foreground` | Primary text |
| `foreground-muted` | Secondary text |
| `foreground-heading` | Headings |
| `foreground-terminal` | Terminal text |
| `accent` | Primary accent (orange in light, blue in dark) |
| `accent-success` | Green/teal accents |
| `border` | Borders |
| `method-get` | GET badge color |
| `method-post` | POST badge color |
| `method-put` | PUT badge color |
| `method-patch` | PATCH badge color |
| `timeline-pink` | Timeline pink (orange in light, pink in dark) |

### Layout

Three-panel layout:
- Left: Navigation sidebar (fixed)
- Middle: Main content (scrollable)
- Right: Response panel with JSON data (contextual, collapsible)

Right panel has two widths:
- `normal` (w-96) — for ResponsePanel
- `narrow` (w-56) — for AnchorSidebar (TOC)

Right panel is collapsible via button in panel header.

---

## Components Built

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Shell` | `src/components/layout/Shell.tsx` | Three-panel layout wrapper |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Navigation |
| `RightPanelContext` | `src/components/layout/RightPanelContext.tsx` | Context for right panel content + width + collapse |
| `ResponsePanel` | `src/components/layout/ResponsePanel.tsx` | JSON response display for right panel |
| `RequestContext` | `src/components/layout/RequestContext.tsx` | Dynamic metrics (size, load time, trace ID) |
| `AnchorSidebar` | `src/components/layout/AnchorSidebar.tsx` | Table of contents for guides/tutorials |
| `ThemeProvider` | `src/components/layout/ThemeProvider.tsx` | next-themes provider |
| `ThemeToggle` | `src/components/layout/ThemeToggle.tsx` | Light/dark mode toggle |

### Content Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageHeader` | `src/components/content/PageHeader.tsx` | Page title + description |
| `GuideHeader` | `src/components/content/GuideHeader.tsx` | Guide title + description + copy markdown button |
| `TutorialHeader` | `src/components/content/TutorialHeader.tsx` | Tutorial title + stats (read time, views, date, source) |
| `JsonRenderer` | `src/components/content/JsonRenderer.tsx` | Syntax-highlighted JSON display |
| `CodeBlock` | `src/components/content/CodeBlock.tsx` | Code block with copy button, uses highlight.js |
| `CodeHighlight` | `src/components/content/Highlight.tsx` | highlight.js wrapper component |
| `CollapsibleCode` | `src/components/content/CollapsibleCode.tsx` | Expandable code block for long snippets |
| `CodeTabs` | `src/components/content/CodeTabs.tsx` | Tabbed code blocks (JS/Python toggle) |
| `Callout` | `src/components/content/Callout.tsx` | Callout boxes (note, warning, tip, context, test, celebration) |
| `Example` | `src/components/content/Example.tsx` | Single-line format examples |
| `Figure` | `src/components/content/Figure.tsx` | Images with captions |
| `MethodBadge` | `src/components/content/MethodBadge.tsx` | HTTP method badges |

### Changelog Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TimelineItem` | `src/components/content/TimelineItem.tsx` | Expandable timeline entry |
| `ChangelogBadge` | `src/components/content/ChangelogBadge.tsx` | SHIPPED, BUILT, LED, IMPROVED badges |

### Interactive Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TicTacToeGame` | `src/components/interactive/TicTacToeGame.tsx` | Playable Tic Tac Toe in terminal style |

---

## Content Data Files

| File | Purpose |
|------|---------|
| `src/components/changelog/changelog.ts` | Career timeline data with versions, entries, colors, stacks |
| `src/components/snippets/tictactoe-snippets.ts` | Java code snippets for tutorial |

---

## Pages Built

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Introduction page |
| `/quickstart` | ✅ | Config-as-candidate metaphor, test suite output |
| `/changelog` | ✅ | Career timeline with expandable entries |
| `/guides/hmac-authentication` | ✅ | Full guide with CodeTabs (JS/Python) |
| `/tutorials/java-game-dev` | ✅ | Full tutorial with interactive game |
| `/test-game` | ✅ | Standalone TicTacToe game page |

---

## Callout Types

```tsx
type CalloutType = "note" | "warning" | "tip" | "context" | "test" | "celebration";
```

| Type | Icon | Color | Use For |
|------|------|-------|---------|
| `note` | Info | accent | Important information |
| `warning` | AlertTriangle | method-put | Caution |
| `tip` | Lightbulb | accent-success | Helpful suggestions |
| `context` | FileText | Muted | Background info |
| `test` | FlaskConical | method-get | Test your code prompts |
| `celebration` | PartyPopper | accent-success | Celebrate achievements |

---

## Changelog Badge Types

```tsx
type BadgeType = "shipped" | "built" | "led" | "improved"|"wrote"|"contributed";
```

| Type | Color | Use For |
|------|-------|---------|
| `shipped` | Green | Major deliverables (docs, SDKs) |
| `built` | Blue | Apps, tools, demos |
| `led` | Purple | Events, hackathons, programs |
| `improved` | Yellow | Metrics, optimizations |

---

## Changelog Version Colors

```tsx
type VersionColor = "green" | "blue" | "purple" | "orange" | "yellow" | "gray" | "pink";
```

Mapped to timeline dot and line colors per role.

**Note:** `pink` is theme-aware — displays as orange in light mode, pink in dark mode (uses `--color-timeline-pink` CSS variable).

---

## Key Technical Decisions

### Syntax Highlighting: highlight.js (not Shiki)

**Why:** Shiki runs at build time through MDX pipeline. Custom components like `CollapsibleCode` that take code as a prop bypass the pipeline. highlight.js runs at runtime, making it work everywhere consistently.

**Config:**
- Languages registered: java, javascript, js, typescript, ts, python, py, bash, shell, json, css, html, xml, yaml, yml, plaintext, text
- Theme: Custom GitHub Dark-inspired in `globals.css`
- Uses `hljs.highlight()` with `dangerouslySetInnerHTML` (not `highlightElement`) to avoid hydration issues

### MDX Setup

```ts
// next.config.ts
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [], // No rehype-pretty-code anymore
  },
});
```

### Code Snippets in Separate Files

Long code blocks are stored in `.ts` files and imported into MDX:

```tsx
// src/components/snippets/tictactoe-snippets.ts
export const buildBoardCode = `public class TicTacToe { ... }`;

// In MDX
import { buildBoardCode } from "@/components/snippets/tictactoe-snippets";
<CodeBlock code={buildBoardCode} language="java" filename="TicTacToe.java" />
```

---

## mdx-components.tsx Structure

Registers all custom components for MDX:
- HTML element overrides: h2, h3, p, ul, ol, strong, a, table, thead, th, td, pre, code
- Custom components: InlineCode, Callout, Example, CodeBlock, CodeTabs, CollapsibleCode, TutorialHeader, Figure, TicTacToeGame

The `pre` handler extracts language/filename from className and passes to CodeBlock.

---

## Images Needed

| Path | Description |
|------|-------------|
| `/public/images/tutorials/tictactoe-indices.png` | Board with array indices [0][0], etc. |
| `/public/images/tutorials/tictactoe-wins.png` | Win condition diagram |

---

## TicTacToeGame Features

- 3x3 board with colored X (green) and O (orange)
- Commands: 1-9 (move), `help`, `score`, `play`/`reset`
- Computer "thinking" delay (600ms)
- Input validation (doesn't crash on "apple")
- Score tracking across games
- Message history with color-coded types
- Terminal aesthetic matching site theme

---

## Tic Tac Toe Tutorial Structure

1. **About This Tutorial** — What you'll learn
2. **Prerequisites** — JDK 17+, IDE, basic Java knowledge
3. **Building the Board** — 2D char array, printBoard()
4. **Placing Pieces** — updateBoard() with switch statement (CollapsibleCode)
5. **Getting Player Input** — Scanner, playerMove()
6. **Validating Moves** — isValidMove() (CollapsibleCode) + "Full Code So Far" milestone
7. **Simulating the Computer** — Random, computerMove()
8. **Winning the Game** — isGameOver() with all win conditions (CollapsibleCode)
9. **Creating the Game Loop** — main() game loop (CollapsibleCode)
10. **Complete Code** — Full working game (CollapsibleCode)
11. **Try It Yourself** — Interactive TicTacToeGame component
12. **2025 Retrospective** — Separation of concerns, input robustness, coordinate math, "meeting people where they are"

---

## Pending Work

| Task | Priority |
|------|----------|
| Add images to /public/images/tutorials/ | High (tutorial needs them) |
| Update navigation to include tutorials | High |
| Build remaining guide/tutorial stub pages | Medium |
| Playground pages (Year Calendar API) | Medium |
| Active Builds pages (&mpersand, LLM Evaluator) | Medium |
| Methodology pages | Medium |
| Mobile menu auto-close | Low |
| SEO metadata per page | Low |
| Deploy to Vercel | Final |

---

## Commands

```bash
cd E:\Programming\docs-as-portfolio
npm run dev      # Development server (uses Webpack)
npm run build    # Production build
npm start        # Run production build
```

---

## User Context

Taylor McNeil:
- 5+ years DevRel experience (NCR, Dropbox, Stellar, Mastercard)
- Currently freelance Technical Writer + AI Consultant
- Building &mpersand (visual outlining tool for fiction writers)
- Targeting DevEx Engineer roles
- 75k+ developers reached, 6 continents, 11+ hackathons led
