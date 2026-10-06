# Portfolio shell and theme

The shared docs-style shell lets visitors navigate Taylor's portfolio, switch
themes, use a mobile menu, and follow the contact link.

## Sub-features

- `shell.desktop-nav` — desktop sidebar exposes every checked-in navigation item.
- `shell.route-transition` — internal links render the destination without losing the shell.
- `shell.theme` — Toggle theme changes the rendered theme and persists across navigation.
- `shell.mobile-nav` — the narrow header opens and closes the sidebar.
- `shell.contact` — Contact API points to Taylor's LinkedIn profile.

## How to get to it (user POV)

- Open `/` and use the left sidebar at desktop width.
- On a narrow viewport, use the menu icon in the top header.
- Use the button titled `Toggle theme` in either shell.
- Use `Contact API →` at the bottom of the sidebar.

## Driving it with Playwright or computer use

Preconditions: doctor passes; start on `/` in a fresh browser context.

- **Navigate:** click `a[href="/quickstart"]`; require URL `/quickstart` and H1 `Quickstart`.
- **History:** visit another internal route, go back and forward, and require the matching H1 each time.
- **Theme:** click the button titled `Toggle theme`; require the root `html` class to switch between `light` and `dark`, then navigate and require it to remain selected.
- **Mobile:** at 390x844, click the non-theme button in the mobile `header`; require the sidebar to enter the viewport, then close it.
- **Contact:** inspect `Contact API →`; require `href="https://linkedin.com/in/taylormcneil"` without following the external link unless requested.

## Gotchas

- Desktop and mobile each render a theme control; scope to the visible one.
- The mobile menu icon has no accessible name today. Use the header-scoped
  non-theme button as a temporary handle and report the accessibility gap if it
  blocks stable automation.
- Tool detail routes intentionally replace the shared shell with a full-screen layout.
- Theme hydration is delayed to avoid a server/client mismatch; wait for the titled button.
