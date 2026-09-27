# Taylor McNeil site verification map

This is the maintained source for verifying the user-facing behavior of the
docs-as-portfolio site. Read the index before driving the app, then use every
feature file implicated by the change.

## Baseline preconditions

- Attach to a same-checkout development server or launch one with `scripts/verify-site.mjs`.
- Run `doctor` and require the receipt to name this checkout and origin.
- Start browser recipes from a fresh context unless persistence is under test.
- Do not use any existing listener until `attach` proves its cwd and site identity.
- Use a 1440x900 desktop viewport plus a narrow mobile viewport for shell or
  responsive-layout changes.

## Driving conventions

- Prefer accessible roles/names, exact `href` values, and visible headings.
- Capture the action and resulting state, not only a final screenshot.
- Test back/forward when navigation changed and reload when persistence changed.
- Restore browser-local state after mutation; do not remove proof artifacts.
- Treat files under ignored local-only routes as optional capabilities, not
  checked-in production behavior.

## Proof and skip reporting

- Record the feature file and entry point used with each evidence set.
- A successful HTTP response does not prove layout or interaction behavior.
- A screenshot does not prove downloads, clipboard content, or localStorage.
- Report each unreachable route with its exact prerequisite.
- Do not report a skipped entry point as verified via another path.

## Features

- [Portfolio shell and theme](portfolio-shell-and-theme.md)
- [Authored documentation and case studies](authored-content.md)
- [aampersand builder journal](aampersand-devlogs.md)
- [Interactive examples](interactive-examples.md)
- [Local and public tools](tools.md)
