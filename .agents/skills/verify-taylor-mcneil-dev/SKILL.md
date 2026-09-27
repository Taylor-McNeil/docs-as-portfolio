---
name: verify-taylor-mcneil-dev
description: Verify the Taylor McNeil docs-as-portfolio Next.js site and its local tools through isolated launches, browser-driven user flows, and durable evidence. Use for feature verification, regression checks, visual QA, or validating site changes end to end.
---

# Verify Taylor McNeil Dev

Verify the real rendered site, not only compilation. Start with the smallest
feature recipe that covers the change, then widen coverage when shared shell,
content rendering, or navigation code changed.

## Launch

Use the bundled lever from the repository root. Every run owns its browser
context and artifact directory. It either owns a new server or records a
verified borrowed server that cleanup must preserve.

Next.js 16 permits only one development server per checkout because instances
share `.next/dev`. First inspect listeners with `lsof -nP -iTCP -sTCP:LISTEN`.
If a listener's cwd is this checkout, attach to it:

```bash
node .agents/skills/verify-taylor-mcneil-dev/scripts/verify-site.mjs attach --run <run-id> --port <port>
```

The helper rejects listeners whose cwd is not this repository. If this checkout
has no running development server, launch one:

```bash
node .agents/skills/verify-taylor-mcneil-dev/scripts/verify-site.mjs launch --run <run-id> --port <free-port>
```

Choose a unique run ID and an unused port. Launch starts
`npm run dev -- --port <port>`, waits for the home page, and writes a receipt to
`.artifacts/verification/<run-id>/receipt.json`. It refuses to borrow a port
that is already bound. Do not assume that common development ports belong to
this app; establish listener cwd and page identity through `attach`.

No auth, database, seed data, or environment variables are required for the
checked-in site. `/tools/youtube-comments-analyzer` is local-only, gitignored,
and additionally requires `yt-dlp`; treat it as optional unless the request is
about that tool.

Use the recorded `http://localhost:<port>` origin. This development server
returns `426 Upgrade Required` for `127.0.0.1`, so the hosts are not interchangeable.

## Doctor

Run before the first browser action and again after any surprising runtime
behavior:

```bash
node .agents/skills/verify-taylor-mcneil-dev/scripts/verify-site.mjs doctor --run <run-id>
```

Doctor requires the recorded process to still exist, the receipt to point at
this checkout, and the recorded origin to serve the portfolio identity plus
`/quickstart`. A generic Next.js page on the expected port is not sufficient.

## Drive

Read [the feature-map index](references/features/README.md), then read every
feature file applicable to the change. Use the available computer-use browser
against the receipt's exact `origin`, or extend the Playwright lever for a
repeatable flow. Prefer roles, accessible names, link destinations, and visible
headings from the map over coordinates or DOM position.

The bundled acceptance flow covers portfolio navigation and theme switching:

```bash
node .agents/skills/verify-taylor-mcneil-dev/scripts/verify-site.mjs smoke --run <run-id>
```

Run `npm run lint` for source-level coverage. Run `npm run build` only when the
change needs production compilation or static-generation proof; a build does
not replace browser evidence for user-facing behavior. There is no checked-in
unit or Playwright test suite today.

## Evidence

Evidence lives at `.artifacts/verification/<run-id>/` and survives cleanup.
For each claim, capture the user action and resulting state. A route response,
lint pass, or final screenshot alone does not prove an interaction.

- Navigation: record source and destination URLs, the clicked handle, visible
  destination heading, and back/forward behavior when routing changed.
- Theme or layout: capture before/after screenshots at relevant desktop and
  mobile widths; verify the root theme class and reduced-motion behavior when
  motion changed.
- Authored MDX: verify the route, H1, representative body content, in-page
  anchors, interactive embeds, and any downloads or outbound links changed.
- Browser-local mutations: verify the visible result and read it back after a
  reload or fresh page. Entry Editor drafts use localStorage with a 400 ms
  debounce, so wait before reloading.
- Export/download: capture the download event, filename, MIME/extension, and
  inspect the saved content. Clipboard feedback alone is not content proof.
- SEO/static changes: inspect the rendered head or HTTP headers on the exact
  route. `/tools/**` must remain noindex; tools are excluded from the sitemap.

Report unreachable entry points separately with the attempted path and unmet
precondition. Do not claim an untested route through another route's success.

## Cleanup

Always clean up runs launched by this skill, including failed attempts:

```bash
node .agents/skills/verify-taylor-mcneil-dev/scripts/verify-site.mjs cleanup --run <run-id>
```

Cleanup signals only a process group launched by that run. For an attached run,
it preserves the borrowed listener. Never kill by process name. Confirm the
owned process is gone, or the borrowed process remains, and that evidence still
exists.

## Helpers

`scripts/verify-site.mjs` is the supported lever:

- `attach` verifies a listener's cwd and site identity, then records it as borrowed.
- `launch` starts a dev server only when this checkout has none and records ownership.
- `doctor` performs a read-only identity and health check.
- `smoke` drives a real navigation/theme flow and saves screenshots, a trace,
  and `smoke-summary.json`.
- `cleanup` tears down only an owned process, preserves borrowed servers, and preserves evidence.

When the helper or feature map disagrees with the current app, verify the source
of truth before editing. Fix skill drift inside this skill; report real product
regressions rather than rewriting the map to describe broken behavior.
