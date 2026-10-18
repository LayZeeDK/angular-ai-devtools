# Pangular Inspector verification map

The maintained source for managing Pangular Inspector in an app and reading the live app through it with
control-pangular-inspector. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- Run commands from the repository root. `S` is `.commandcode/skills/control-pangular-inspector/scripts/control.mjs`;
  `D` is `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`.
- Setup: `node $S check` exits 0 (pin, overlay import, proxy). If not, `node $S install`.
- App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder).
- Server: `node $S up --app-url http://localhost:4507/`, then `node $S doctor` exits 0 with
  `overlay-connected` passing. Read-only unless the recipe says `--allow-actions`.
- Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`.
- Never drive an instance this run did not start; never Lars's browsers or the sessions `cb`, `ed`, `nano`,
  `g4`, `aion`, `phi`, `ai-cb`, `ai-ed`, `ngdt`.

## Driving conventions

- The app is driven like a user in playwright-cli session `pangular-9999`; Pangular is only read.
- One user action, then a fresh snapshot, then the MCP read; the overlay reports about 250 ms after change
  detection, so read after the end state is visible, not on a timer.
- Tool names are literal and given without the `pangular_` prefix; selectors are host tags from the
  component tree (`ng-journal-list`), not CSS from templates.
- Action tools (`navigate`, `fill-form`, `form-action`, `highlight`, ...) need `up --allow-actions` and
  `call ... --confirm`; recipes here do not use them.

## Proof and skip reporting

- Drive the path a user takes; prove the state with a Pangular read taken after it, saved with `--out`.
- Capture before and after snapshots, one screenshot with the app visible, the MCP JSON, and `doctor --json`.
- Check that a read describes the page you drove: `list-pages` shows the page id and URL you expect.
- Setup claims (install, remove) are proven against git: `git status --porcelain` and `git diff --stat` saved
  next to the command output.
- A recipe that passed once after a fix runs a second time before it counts.
- Name each entry point not reached and why; do not count it as covered through another path.
- Portal data is random per API start: assert on structure (component names, signal labels), not values.

## Feature entry contract

Each feature file starts with an H1 and one paragraph of user-visible behavior, then four H2s in this order:
`Sub-features`, `How to get to it (user POV)`, `Driving it with control-pangular-inspector` (starting with
`Preconditions:`), `Gotchas`.

## Features

- [Setup](./setup.md): install, check and remove the pinned package and its configuration.
- [Live inspection](./live-inspection.md): connected pages, component tree, one component, its signals and providers.
- [Navigation](./navigation.md): explain-navigation and the current route after a user navigates.
- [Source scan](./source-scan.md): the CLI's stdio tools with no running app.
- [Panel UI](./panel.md): the full-page panel through the proxy, for a human view.

## Full sweep

A full pass drives the features in this order.

1. [Setup](./setup.md)
2. [Live inspection](./live-inspection.md)
3. [Navigation](./navigation.md)
4. [Source scan](./source-scan.md)
5. [Panel UI](./panel.md)

## Manual only

Angular DevTools (browser extension); the Pangular Chrome extension (needs a branded browser profile).
