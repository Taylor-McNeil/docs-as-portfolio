# Local and public tools

The `/tools` area contains standalone browser utilities. OG Image Maker, AO3
Formatter, and Trope Cloud are public; Entry Editor is development-only; the
YouTube analyzer is an optional ignored local capability.

## Sub-features

- `tools.index` — the index exposes public tools and development-only cards in development.
- `tools.ogmaker` — visitors configure and export a 1200x630 social image.
- `tools.ao3formatter` — visitors import prose or HTML, tag rows, preview, and export AO3-ready output.
- `tools.tropecloud` — visitors edit tags and visual formatting for a trope graphic.
- `tools.entry-editor` — local authors edit MDX, preview components, switch layouts/themes, copy, and restore drafts.
- `tools.youtube-comments` — local users fetch, filter, and export comments when the ignored source and `yt-dlp` exist.

## How to get to it (user POV)

- Open `/tools`; tool routes intentionally do not appear in the main sidebar.
- Choose `OG Image Maker`, `AO3 Formatter`, or `Trope Cloud`.
- In development, choose `Entry Editor`; it returns 404 in production.
- Use the YouTube analyzer only when its ignored route is present locally.

## Driving it with Playwright or computer use

Preconditions: doctor passes; use a fresh browser context and avoid real external fetches unless requested.

- **Index:** require H1 `Tools`, the three public cards, development-only `Entry Editor`, and the full-screen tool layout after navigation.
- **OG Image Maker:** change one visible field such as the endpoint placeholder `/api/v1/users`; require the 1200x630 preview to update, then capture and inspect the exported image when export changed.
- **AO3 Formatter:** fill `Paste your chapter here...`, run the visible import action, require tag rows, change one classification, open preview, and verify copied/downloaded HTML content rather than feedback alone.
- **Trope Cloud:** add a tag through `Add tag…`, change a control in the `Text alignment` or `Line formatting` group, and require the preview to update before export inspection.
- **Entry Editor:** fill `Devlog Markdown and MDX source`, wait at least 500 ms, require `Preview pane` to update, reload and require the draft to restore; also exercise `Editor only`, `Split view`, `Preview only`, and preview-theme controls when relevant.
- **YouTube analyzer:** first prove the route and `yt-dlp` prerequisite exist. Use an explicitly supplied video, capture the fetch result and filters, then inspect JSON/CSV downloads.

## Gotchas

- Tool routes bypass the portfolio shell by design.
- Browser-local state can leak between tests; use a fresh context unless persistence is the behavior under test.
- Entry Editor autosaves both devlog and project drafts to localStorage after a 400 ms debounce.
- Clipboard APIs may need browser permissions. Download or DOM inspection is stronger evidence than the `Copied` label.
- The YouTube analyzer is ignored from git and may not exist in another checkout; do not make it a baseline doctor requirement.
