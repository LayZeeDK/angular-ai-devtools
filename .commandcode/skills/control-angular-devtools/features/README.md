# Angular DevTools feature map

What a developer does with Angular DevTools, and how `control-angular-devtools` reaches it. `S` is
`.commandcode/skills/control-angular-devtools/scripts/control.mjs`.

## Baseline preconditions

- A development build of an Angular app is serving (`window.ng` present); the counter fixture at
  `spikes/ng222-app` (Angular 22.2.2) through `control-angular-dev-app up --target counter` (its `info` prints the URL to pass as `--app-url`).
- Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0.
- Branded browser: `node $S status --browser <name>` says installed.
- Desktop session available (the harness is headed).

## Driving conventions

- App page: playwright-cli session `ngdt`; roles and accessible names first.
- Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`).
- Wait on an observable end state (a message topic, a DOM text change, a CDP target), never a sleep.

## Proof and skip reporting

- Drive what a developer does: open the Angular tab, select a component, open the signal graph, record a
  profile. Do not call the backend message bus directly in place of the panel.
- Record the state before and after the action: the pane's node list and a DevTools window screenshot.
- Check the page side too: `ng.ɵgetSignalGraph` next to the pane, profiler counters next to the recording.
- A claim about a fix runs on the old state and the new one and reports verified, not verified or
  inconclusive. A result that passed once after a change runs a second time before it counts.
- Name every entry point a run did not reach and why (see Manual only); never report it as covered.
- Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored).

## Feature entry contract

One file per feature: H1, one paragraph of user-visible behaviour, then `Sub-features`,
`How to get to it (user POV)`, `Driving it with control-angular-devtools`, `Gotchas`.

## Features

- [install.md](install.md) - install, uninstall and status per browser
- [attach.md](attach.md) - extension detects the app, injects its backend, shows the Angular version
- [signal-graph.md](signal-graph.md) - Components tab, signal graph pane
- [profiler.md](profiler.md) - Profiler tab recording, coexistence with other `ɵsetProfiler` subscribers

## Full sweep

A full pass drives the features in this order.

1. [install.md](install.md)
2. [attach.md](attach.md)
3. [signal-graph.md](signal-graph.md)
4. [profiler.md](profiler.md)

## Manual only

- The panel in branded browsers (press F12, pick the Angular tab): the scripted path uses DevTools frontend
  internals proven only in the test harness.
- The Web Store "Add" confirmation and the Remove confirmation on the extensions page: browser UI.
- Injector Tree, Router Tree and Transfer State tabs: reachable by the same panel driver, not yet mapped.
  Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only
  for a hydrated (SSR) app.
