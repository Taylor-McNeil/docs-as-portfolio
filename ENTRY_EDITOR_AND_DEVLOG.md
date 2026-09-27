# The Entry Editor & the `/devlog` Skill

This site has no CMS — every page you see (blog posts, project write-ups, devlogs) is a hand-written file in the repo. That's great for keeping the site simple and fast, but it means publishing anything new is more manual than posting to something like WordPress or Notion. Two tools exist to make that manual process bearable: a browser-based **Entry Editor** and a Claude Code skill called **`/devlog`**. They tackle two different halves of the same problem.

## The problem they're solving

Writing a new post here means writing raw MDX (Markdown mixed with custom JSX components) directly in code, then hand-wiring it into several other places: an SEO metadata file, the sidebar navigation, an AI-crawler index, and (ideally) a social preview image. Doing all of that by hand for every post is slow and easy to get wrong. There's no way to "see" what a draft looks like until it's built and loaded in a browser.

## Tool 1: The Entry Editor — for *writing and previewing*

**What it is:** A private page at `/tools/entry-editor` that only exists when running the site locally in development — it's invisible on the live, published site. Think of it as a personal writing desk bolted onto the side of the codebase.

**What it looks like:** A split screen. On the left, a plain text/Markdown editor. On the right, a live preview that renders exactly like the real published page would (same fonts, spacing, dark/light mode).

**What it does:**
- You can paste a draft straight out of Google Docs, and it automatically cleans up the rich text into proper Markdown.
- A toolbar lets you insert the site's special content blocks — callouts, pull quotes, code blocks, diagrams, project cards — by clicking a button and filling in a small form, instead of memorizing the underlying JSX syntax.
- It warns you if you've used a component the preview doesn't recognize, so mistakes show up immediately rather than after publishing.
- It supports two content "kinds": a **Devlog** entry and a **General Project** write-up (which has extra fields like status and tech stack).
- Everything you type is autosaved in the browser as you go, so you don't lose work.
- A "Copy body MDX" button grabs the finished, cleaned-up source once you're happy with it.

**In short:** it's a WYSIWYG-style writing and formatting aid. It doesn't publish anything by itself — it just makes it much easier to go from messy prose to polished, correctly-formatted MDX that you can then hand off to the next step.

## Tool 2: `/devlog` — for *scaffolding and publishing*

**What it is:** A Claude Code skill (a slash command you type in the terminal, defined in `.claude/commands/devlog.md`). Where the Entry Editor helps you *write*, `/devlog` helps you *ship*.

**What you give it:** A title, a URL slug, a cosmetic "header" (styled like an API call, e.g. `PUT /aampersand/a-sirens-song`), a one-line SEO description, and the finished prose — including simple bracketed hints like `[callout: ...]` or `[hero quote]` marking where special formatting should go.

**What it does, step by step:**
1. Creates the two files a new devlog page needs (a metadata file and the actual content file) in the right folder.
2. Figures out the devlog's sequence number and publish date automatically, based on how many devlogs already exist.
3. Writes a separate, more technical SEO headline for search engines and social previews.
4. Converts your bracketed hints into the real formatted components (turning `[callout: ...]` into an actual styled callout box, etc.) and builds the page's sidebar table of contents from your headings.
5. Finds any social preview image you've dropped in the project and moves it into place, updating the page's metadata to use it.
6. Adds the new devlog to the site's navigation sidebar so readers can find it.
7. Adds a short entry to `llms.txt`, a plain-text index some AI tools use to understand what's on the site.

**In short:** it's an automation script (run by an AI assistant) that handles all the tedious "plumbing" of publishing — file creation, SEO wiring, navigation, image handling — so the only thing left for a person to supply is the actual writing.

## How they fit together

They're two separate tools, built at the same time, that aren't wired into each other in code — but they're meant to be used one after the other as part of the same personal publishing pipeline:

**Write in the Entry Editor → refine/preview the formatting → hand the finished prose + metadata to `/devlog` → `/devlog` scaffolds the real page and wires it into the site.**

The Entry Editor solves the "writing feels clunky and I can't see what it'll look like" problem. `/devlog` solves the "publishing correctly requires touching four different files by hand" problem. Together they turn "write a devlog" from a multi-step, error-prone chore into: write prose, preview it, run one command.
