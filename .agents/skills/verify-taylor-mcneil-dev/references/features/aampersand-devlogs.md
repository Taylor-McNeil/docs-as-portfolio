# aampersand builder journal

The `/aampersand` hub presents six builder-focused devlogs and visual previews,
each leading to a long-form MDX entry.

## Sub-features

- `aampersand.hub` — overview copy, product links, and six dated cards render.
- `aampersand.card-navigation` — each writer-facing card title reaches its corresponding builder-journal route and H1.
- `aampersand.preview-art` — miniature origin, thread, clothesline, graph, spark, and queue visuals render.
- `aampersand.devlog-content` — long-form entries render custom content and interactive embeds.
- `aampersand.motion` — card hover motion respects reduced-motion preference.

## How to get to it (user POV)

- Choose `Overview` under the `aampersand` sidebar section.
- Choose a dated sidebar entry directly.
- From `/aampersand`, choose any devlog card, beginning with `What if Icarus Had Sunscreen?`.

## Driving it with Playwright or computer use

Preconditions: doctor passes; open `/aampersand` at desktop width.

- **Hub:** require H1 `aampersand`, six links whose href begins `/aampersand/`, and the two external aampersand.com links.
- **Card:** click a card by its visible title; require its exact route, corresponding builder-journal H1, and representative article text. For example, `What if Icarus Had Sunscreen?` leads to `/aampersand/a-sirens-song` with H1 `A Siren's Song`.
- **Direct entry:** navigate using the corresponding dated sidebar link; require the same route and H1 as the card path.
- **Visuals:** capture the hub at desktop and mobile widths; require the mini clothesline and mini story graph accessible labels where present.
- **Motion:** compare hover with normal motion and `prefers-reduced-motion: reduce`; reduced motion must not run the card animation.

## Gotchas

- Builder-journal entries here are intentionally distinct from writer-facing devlogs on `aampersand.com`.
- Card titles name the writer-facing companion while article H1s name the builder journal. Assert the intentional route-to-H1 mapping, not title equality.
- Interactive embeds differ by article, so also read `interactive-examples.md` when their source changed.
- Screenshot presence alone does not prove reduced-motion behavior; inspect computed animation/transition state.
