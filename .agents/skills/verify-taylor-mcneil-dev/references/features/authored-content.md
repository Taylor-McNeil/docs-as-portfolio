# Authored documentation and case studies

Visitors read portfolio pages, tutorials, guides, field notes, case studies,
side projects, and changelog entries rendered from TSX or MDX.

## Sub-features

- `content.primary` — Introduction, Quickstart, and Changelog render their headers and body.
- `content.long-form` — tutorials, guides, field notes, and case studies render MDX components.
- `content.navigation` — sidebar and in-article links reach their intended routes or anchors.
- `content.downloads` — report cards download the intended PDFs.
- `content.metadata` — title, canonical URL, structured data, robots, and sitemap match route intent.

## How to get to it (user POV)

- Use the sidebar sections Getting Started, Field Notes, Side Projects,
  Tutorials, Guides, Case Studies, and Log.
- Use in-article links such as `Building Docs from Scratch` on `/`.
- Open `/case-studies/on-good-tutorials` and use its report download cards.

## Driving it with Playwright or computer use

Preconditions: doctor passes; choose each route named by the changed source.

- **Render:** navigate through the visible sidebar link; require the expected URL, one visible H1, representative body text, and no Next.js error overlay.
- **MDX components:** drive every changed component using its visible label or control and capture before/after states.
- **Anchors:** click an in-page table-of-contents or hash link; require the URL hash and target heading to agree.
- **Downloads:** accept the browser download, require the expected PDF filename, and inspect that the file begins with a PDF header and is non-empty.
- **Metadata:** inspect `document.title`, canonical link, JSON-LD when present, and the route's robots behavior; compare sitemap entries to checked-in public pages.

## Gotchas

- A 200 response can still hide an MDX compile error or a client-only component failure.
- Navigation labels intentionally use HTTP-method badges as visual language; the badge does not describe the route's actual HTTP method.
- `/tools/**` is intentionally excluded from the sitemap and receives an `X-Robots-Tag` noindex header.
- External documentation and project links are separate systems; verify their hrefs by default, not the remote destination.
