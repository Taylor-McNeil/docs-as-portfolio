# Interactive examples

Long-form pages embed working demonstrations including story graphs, a MySpace
customizer, writer-state restoration, a component registry, and Tic-Tac-Toe.

## Sub-features

- `interactive.story-graph` — visitors switch between linear and graph views and select nodes.
- `interactive.myspace` — visitors customize the embedded profile presentation.
- `interactive.writer-restore` — the demo mutates and resets visible writing state.
- `interactive.tictactoe` — the tutorial's terminal game accepts moves and restart commands.
- `interactive.registry` — Entry Editor previews registered components and their usage details.

## How to get to it (user POV)

- Open `/aampersand/oily-bodies-in-karpathos` for Story Graph.
- Open `/aampersand/a-broken-astrolabe` for MySpace Customizer.
- Open `/aampersand/a-seed-of-intention` for Writer Restore.
- Open `/tutorials/java-game-dev` for Tic-Tac-Toe.
- Open `/tools/entry-editor` in development for the Live Component Registry.

## Driving it with Playwright or computer use

Preconditions: doctor passes; scroll the chosen article until the embed is visible.

- **Story Graph:** click buttons with `aria-pressed` for linear and graph modes; require the SVG label beginning `Interactive visualization of chapter connections`, then select a labeled node and require its selected state/details.
- **Writer Restore:** mutate the demo using its visible controls, require changed state, click `Reset writer restore demo`, and require baseline state.
- **Tic-Tac-Toe:** fill the input whose placeholder begins `Enter move (1-9)`, submit a legal move, and require the board/output to change; finish or restart only when relevant.
- **Registry:** in Entry Editor, use `Choose a component`, switch the active item, and require the corresponding labeled preview and details regions.
- **MySpace:** capture the initial profile, change one visible customization control, and require a visible style/content change.

## Gotchas

- These embeds are client-side; server HTML or route status is not interaction proof.
- D3 force layouts can settle differently between runs. Assert labels, modes, selection, and connectivity rather than exact node coordinates.
- Some demos are below long articles; wait for hydration after scrolling them into view.
- Keep animation and reduced-motion checks separate from static screenshots.
