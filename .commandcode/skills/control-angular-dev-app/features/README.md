# Angular dev app verification map

The maintained source for driving the three fixtures through control-angular-dev-app. Read this index, then use
the matching feature file as the recipe. For an app attached with `--url`, write its features here in the
same shape before claiming coverage.

## Baseline preconditions

- Run commands from the repository root. `S` is `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`.
- Counter: `node $S up --target counter`, then `node $S doctor` exits 0. Fresh page state: `count` 3,
  `double` 6, cart 1 item.
- SSR: `node $S up --target ssr`, then `node $S doctor --target ssr` exits 0 on `/`. Fresh page state:
  heading `Render mode: server`, `Early clicks: 0`, list Alpha, Beta, Gamma, `@defer` block dehydrated.
- Portal: `node $S up --target portal` (API on 3000, app on the derived port, 4507 for the default portal folder), then
  `node $S doctor --target portal` exits 0. No login. Every flag in
  `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route
  exist.
- Take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`. Desktop viewport (playwright-cli default).
- Never drive an instance this skill did not start, unless it was attached on purpose with `--url`.

## Driving conventions

- Every command is `playwright-cli -s=<session> ...`. Commands are literal.
- Roles and accessible names first, landmark-scoped text next, snapshot refs for one-off steps, CSS last.
- One action per step; snapshot before and after into `<evidenceDir>`.
- Wait on an end state with `run-code` (`waitForURL`, `locator(...).waitFor()`), never a sleep.
- PrimeNG dropdowns: click the `combobox` by name, then `getByRole('option')`. Date fields: click the
  `combobox`, then a day in the calendar `grid`; typed dates do not reach the form.
- `__ngc.navigate(url)` is a setup shortcut. A claim about navigation is proven by clicking.

## Proof and skip reporting

- Drive the path a user takes: clicks and typing, not component setters or `ng.applyChanges`.
- Capture the action and the state after it: snapshots before and after, one screenshot with the app visible.
- Check the side effect next to the screen: the URL, `requests` for API calls, an `__ngc` read for Angular
  state.
- A claim that names an entry point is driven through that entry point; a different path does not count.
- Mocks only behind an existing production boundary; these fixtures have none.
- For a fix, run the same recipe on the old state (a second checkout on its own derived port) and on the
  change; the verdict (verified, not verified, or inconclusive) comes from lars-verify. The portal's API port
  is fixed at 3000, so a portal baseline and its change run one after the other, never side by side.
- A failed `doctor` makes the claim inconclusive; a `dev-build` failure means a production build, which these
  recipes cannot prove anything about.
- A recipe that passed once after a fix runs a second time before it counts.
- Name each entry point you did not reach and why; do not count it as covered through another path.
- Portal data is random per API start: assert on structure, not on names or ids.

## Feature entry contract

Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order:
`Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app` (starting with
`Preconditions:`), `Gotchas`.

## Features

- [Counter](./counter.md): the ng222-app counter, its signals and its effect.
- [SSR and hydration](./ssr.md): server HTML, hydration counters and mismatches, transfer cache, `@defer`
  hydrate triggers, event replay, render mode per route.
- [Portal navigation](./portal-navigation.md): header, sidebar, home tiles, lazy routes, not-found page.
- [Portal contracts](./portal-contracts.md): list, details, edit and save, create and save.
- [Portal claims](./portal-claims.md): list, details, create form.
- [Portal complaints and customers](./portal-complaints-customers.md): both lists, complaint details, complaint
  create and save, customer details.

## Full sweep

A full pass drives the features in this order.

1. [Counter](./counter.md)
2. [SSR and hydration](./ssr.md)
3. [Portal navigation](./portal-navigation.md)
4. [Portal contracts](./portal-contracts.md)
5. [Portal claims](./portal-claims.md)
6. [Portal complaints and customers](./portal-complaints-customers.md)

## Manual only

- Angular DevTools panels (Components, Profiler, Injector Tree, Router Tree).
- The external link `https://www.ng-journal.com` in the portal header (leaves the app).
- The Pangular Inspector panel and its floating button: driven by control-pangular-inspector, not here.
