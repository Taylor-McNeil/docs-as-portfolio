# docs-as-portfolio

My portfolio, structured as API documentation—because if I'm going to say I think in systems, I should probably show it.

## What is this?

A Next.js site that treats my career like an API:
- **`/quickstart`** — TLDR
- **`/changelog`** — Career History 
- **`/guides`** — ... guides?
- **`/case-studies`** — Documentation architecture work
- **`/tutorials`** — ... tutorials?

## Stack

- Next.js 15 
- Tailwind CSS v4
- MDX
- TypeScript

## Live

→ [taylormcneil.dev](https://taylormcneil.dev)

## Local tools

### YouTube Comments Analyzer

The route `/tools/youtube-comments-analyzer` is a local-first research utility. It is not intended to be deploy-safe on a typical hosted Next.js setup because it shells out to a local `yt-dlp` CLI install.

Requirements:

- `yt-dlp` installed locally and available on your PATH

Install `yt-dlp` with Homebrew:

```bash
brew install yt-dlp
```

What it does:

- accepts a YouTube URL
- runs a local `yt-dlp` CLI comment extraction with no video download
- normalizes the returned payload into a searchable in-browser workspace
- lets you export the current run as JSON or CSV

Known limitations:

- videos with disabled comments or restricted availability will fail cleanly, but cannot be analyzed
- very large videos can take a while because v1 fetches the full available comment set
- results are session-scoped in the UI unless you export them
