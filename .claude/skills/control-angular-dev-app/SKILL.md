---
name: control-angular-dev-app
description: Drive, screenshot, inspect and reproduce behaviour in an Angular application running in development mode, in the browser through playwright-cli, with ng.* recipes for the component list, inputs and change detection, signal graphs, injector resolution paths and providers, and router state. Launches one of two fixtures in isolation (the ng222-app counter in spikes/ng222-app, or the ng-journal Insurance Portal with its API) or attaches to any dev-mode Angular app by URL. Use to verify a change in the browser, prove what ng.* returns on a real page, or check that a page is an Angular dev build.
---

# control-angular-dev-app

Launches the counter fixture or the Insurance Portal on derived ports, or attaches to any running dev-mode
Angular app by URL; checks the page is an Angular development build; drives it through a named playwright-cli
session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started.
Skip it for production builds (no `window.ng`), for unit tests, and for Lars's own browsers: never attach to
Chrome Beta or Edge Dev (`--cdp`, `--extension`), and never use the sessions `cb`, `ed`, `ai-cb`, `ai-ed`.

All commands below run from the repository root (`D:\projects\sandbox\angular-ai-devtools`); playwright-cli
sessions are looked up from there. `S` stands for `.claude/skills/control-angular-dev-app/scripts/control.mjs`.

## Pick a flow

| Flow | Command | App port | Notes |
|---|---|---|---|
| Counter fixture | `node $S up --target counter` | 4222 in the main checkout; derived (4300-4799, hash of the fixture path) when the fixture sits in a git worktree | `spikes/ng222-app`, Angular 22.2.2, zoneless, `provideRouter` with no routes |
| Insurance Portal | `node $S up --target portal` | 4200 in a main checkout; derived when the folder is a git worktree. The default folder `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` is a worktree, so it gets 4775 | API always on 3000 (the portal hard-codes `http://localhost:3000/api/`). Override the folder with `--dir <path>` or `CONTROL_NG_PORTAL_DIR` |
| Any dev-mode app | `node $S up --url http://localhost:<port>/` | whatever the app uses | Nothing is launched or stopped; process checks report skipped |

A worktree is detected by `.git` being a file. From a worktree, `up` refuses the main checkout's port; use
`--url` when you mean to drive that instance. Every command takes `--target <name>` (with `--port`/`--dir` if
you passed them to `up`) or `--url <url>` to pick the flow; with exactly one flow running, neither is needed.

## Launch

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json
```

- Counter runs `node node_modules/@angular/cli/bin/ng.js serve --port <port>` in the fixture folder.
- Portal runs two processes in the portal folder: `node node_modules/nx/dist/bin/nx.js run api:serve` with
  `PORT=3000`, and `node node_modules/nx/dist/bin/nx.js run insurance-portal:serve --port=<port>` with `PORT`
  removed from its environment. Both get `NX_DAEMON=false` and `NX_TUI=false`, so no Nx daemon outlives `down`.
- Readiness: each URL answers (portal API: `/api/customers`) and the app's index HTML contains its root tag
  (`<app-root>`, `<ng-journal-root>`). The doctor then checks the rendered page.
- The portal API starts first and the app only after the API answers. Started together, the two cold `nx run`
  processes timed out in the Nx plugin worker ("did not receive a load message within 10 seconds") in 3 of 4 runs
  (2026-10-11). Started one at a time, 2 of 2 runs passed (2026-10-12).
- Measured time to ready, warm caches: counter 2.6-8 s (four runs), portal 18.5-20.5 s with the API first (two
  runs). The first portal build after a change can take minutes; `--timeout <seconds>` (default 240).
- Server output goes to `<evidenceDir>/app.log` (and `api.log`).
- `up` refuses (exit 2) a port already in use and names the owning PID; that may be Lars's own server.

## Doctor

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs doctor [--target ...|--url ...] [--json]
```

Answers "is this instance worth driving?". One line per check:

- `process-alive:<name>`, `port-owned:<name>` (the listening PID is in the recorded process tree),
  `build-log:<name>` (no `[ERROR]`, `error TS`, `NGxxxx` lines; `[vite]` runtime entries such as proxy errors,
  with the `Error: read ECONNRESET` and `at ...` lines that follow them, and the browser console forwarded as
  `(client)` are ignored, `console-errors` covers those). Skipped with `--url`.
- `pangular-auth` (portal, only when the Pangular overlay asks): with a Pangular server behind `/__pangular`
  the overlay opens a `prompt` for a one-time code that blocks every playwright-cli command. Doctor reads the
  code from control-pangular-inspector's `pangular.log` (via its state file `pangular-9999.json`) and enters it;
  with no such state file it dismisses the prompt and warns.
- `browser-session`: opens (or reuses) the run's session `control-ngdev-<flowId>` and goes to the app URL.
- `angular-root`: an element with `[ng-version]`; prints the version and root tags. `app-marker`: the fixture's
  root tag.
- `dev-build`: `window.ng` exists. Missing means a production build or `ngDevMode=false`; `ng.*` recipes will
  not work.
- `ng-core-functions`: the 11 public functions plus `ɵgetSignalGraph` and the four `ɵ` injector functions.
- `router-globals`: `ɵgetRouterInstance`, `ɵgetLoadedRoutes`, `ɵnavigateByUrl` (present only with
  `provideRouter`; absent with `RouterModule.forRoot`). Absence is a warning, not a failure.
- `change-detection-mode`: zoneless or zone-based from the root environment injector's `NgZone` provider record
  (last record; `NoopNgZone` = zoneless), plus whether zone.js is loaded and `mark_feature_usage` marks.
- `pangular-overlay` (portal only, warning): the console errors the dev-only Pangular overlay logs, with what
  listens on port 9999. Without a server: three `__connection.json` 404/502 and `[pangular] No devtools server
  found` ("it found no devtools server"). With control-pangular-inspector's server: one `__connection.json` 404,
  which is expected ("expected while a devtools server runs").
- `console-errors`: `playwright-cli console error` reports zero errors besides the `pangular-overlay` ones.

Exit 0 healthy, 1 a check failed (named), 2 could not run. The doctor also installs the `__ngc` helpers
(Inspect). It navigates to the app root, so do not run it mid-recipe.

## Drive

Session: `playwright-cli -s=<session>`; take `<session>` from `info` (`control-ngdev-counter-4222`,
`control-ngdev-portal-4775` for the defaults).

- Selector order: role plus accessible name (`getByRole('button', { name: 'Increment' })`), visible text
  scoped to a landmark (`getByRole('navigation').getByText(...)`), snapshot refs for one-off steps, CSS last.
  Neither fixture has test ids.
- Loop: `snapshot --filename=<evidenceDir>/<step>-before.yml`, one action, a fresh snapshot, then check the
  expected change (`find`, `eval`, or the snapshot text).
- Waiting: no fixed sleeps. Use `run-code "async page => { await page.waitForURL('**/contract/list'); await
  page.locator('table tbody tr').first().waitFor(); return page.url(); }"`.
- Router setup shortcut (not a user path): `eval "() => __ngc.navigate('/claim/list')"` calls
  `ng.ɵnavigateByUrl`. Prove user paths by clicking the nav.

Recipes per feature: [features/README.md](features/README.md).

## Inspect

`__ngc` is installed by `doctor`, or by
`playwright-cli -s=<session> --raw run-code --filename=.claude/skills/control-angular-dev-app/scripts/ng-inspect.js`
(also registered for later page loads). All helpers are read-only. Call them with
`playwright-cli -s=<session> --raw eval "() => __ngc.<fn>(...)"` and return objects, not `JSON.stringify`
(that double-encodes). `<host>` is a CSS selector or an index from `components()`.

| Helper | What it calls | Returns |
|---|---|---|
| `components()` | `ng.getComponent` over the DOM | `{i, tag, name}`; dev class names lose their leading `_` |
| `inspect(host)` | `getComponent`, `getDirectiveMetadata`, `getListeners`, `getDirectives`, `getOwningComponent` | name, `changeDetection` (`OnPush`/`Eager`), inputs with values, outputs, host listeners, directives, owner, own fields (signals unwrapped) |
| `signals(host)` | `ng.ɵgetSignalGraph(ng.getInjector(host))` | nodes `{kind, label, value, epoch}`, edges as `consumer -> producer` labels |
| `dependenciesOf(host, label)` | same | direct producers of one signal, e.g. `double` -> `["count"]` |
| `injectors(host)` | `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` | the lookup path: type, source, provider count |
| `providers(host, i)` | `ɵgetInjectorProviders` on path entry `i` | token names, `isViewProvider`, import path |
| `router()` | `ng.ɵgetRouterInstance`, `ng.ɵgetLoadedRoutes` | current URL and the route tree, lazy children once loaded; `{present: false}` without router globals |
| `navigate(url)` | `ng.ɵnavigateByUrl` | `{ok, url}` |

Also: `playwright-cli -s=<session> console`, `requests` (the portal calls `http://localhost:3000/api/...`),
and raw `ng.*` through `eval`, for example the button's listeners:
`eval "() => ng.getListeners(document.querySelector('app-counter button')).map(l => l.name)"`.

Not reachable: Angular DevTools (browser extension, manual only); the Nx and Angular CLI MCP servers are not
used (the script cannot call MCP tools).

## Evidence

Evidence and logs go to `tmp/control-angular-dev-app/<flowId>-<timestamp>/` (git-ignored; `info` prints it).
Pass `--filename=<evidenceDir>/...` to every `snapshot` and `screenshot`, or they land in `.playwright-cli/`.
A proof holds: a before and after snapshot, a screenshot showing the app (the header "Insurance Portal" or
the counter line), the side effect (URL, `requests`, an `__ngc` read saved with `--raw ... > file.json`), and
the server log. Proof rules: [features/README.md](features/README.md#proof-and-skip-reporting).

## Cleanup

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs down [--target ...|--url ...]
```

Checks every recorded PID against its recorded start time and command line, closes the run's playwright-cli
session, stops each recorded process tree (`taskkill /T /F` by PID), deletes the state file, keeps the
evidence directory. A PID that no longer runs is noted, not refused. Never `playwright-cli close-all` or
`kill-all`: they reach Lars's sessions.

## Helpers

`scripts/control.mjs <command> [--target counter|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]`

| Command | Does | Output | Exit |
|---|---|---|---|
| `up` | launch (`--target`) or attach (`--url`); writes `tmp/control-angular-dev-app/state/<flowId>.json` | flowId, url, port, session, evidenceDir, procs `{name, pid, port, start, commandLine, log}`, `readyInSeconds` | 0 ready; 2 refused (port in use, worktree on the main port, state exists), process exited, timeout |
| `doctor` | checks above | one line per check, or `checks[]` with `--json` | 0 / 1 / 2 |
| `info` | prints the state | state plus `statePath` | 0; 2 no state |
| `down` | teardown | notes per process and the session | 0 done (also when the PID is already gone); 2 missing state file, or PID start time / command mismatch (nothing stopped) |

`scripts/ng-inspect.js` is a playwright-cli `run-code` file: it installs `__ngc` and returns the doctor's page
facts.

## Gotchas

- `PORT` in the environment beats `--port` on the Angular dev server: with `PORT=3000` set for the API, the
  portal served on 3000 (measured). The script strips `PORT` for the app process; keep it that way.
- Nx 23's CLI entry is `node_modules/nx/dist/bin/nx.js`; the script reads it from `package.json` `bin`.
- The dev servers listen on `[::1]` only; use `localhost`, not `127.0.0.1`.
- The portal API port is fixed at 3000, so only one portal flow runs at a time on this machine.
- Portal data is generated by faker when the API starts: names, policy numbers and ids change with every
  `up`. Assert on structure (row count 20, column headers), not values.
- The portal sidebar entries are `div`s with `routerLink`, not links: target them with
  `getByRole('navigation').getByRole('listitem').filter({ hasText: 'CONTRACT' }).getByText('List')`.
- Form labels in the portal are not associated with their inputs (`textbox` with no name); use the snapshot ref
  or the label text's sibling.
- The portal loads the Pangular Inspector overlay in development builds (`main.ts`, since the portal commit
  `f102b97`). It adds `div#pangular-popup-root` (shadow root) and a floating `button "Toggle Pangular
  Inspector"` that appears last in every snapshot; recipes do not use it. Without a Pangular server on 9999 it
  logs four console errors (doctor: `pangular-overlay` warning). With control-pangular-inspector's server
  running, the first page load in a new session asks for a one-time code in a `prompt` and playwright-cli
  commands fail with "does not handle the modal state" until it is answered (`dialog-accept <code>`, the code
  from that skill's `pangular.log`). `doctor` answers it (`pangular-auth`); a session opened by hand must run
  `dialog-accept` itself. `run-code` and `eval` errors do not name the dialog; `snapshot` does.
- Snapshot refs in the portal carry a prefix that changes between page loads (`f12e325`); take refs from
  the latest snapshot only.
- `/claim/create` shows the heading "Complaint Create" (app bug, reported, not patched).
- Never run Angular's in-page tool `angular:di_graph` and never call `injector.get` on a node injector's
  `ViewContainerRef`: afterwards `ng.ɵgetSignalGraph` loses the template node for the rest of the page's life
  (research/05-spikes.md). The helpers read providers through `ɵgetInjectorProviders` only.
- Never call `ng.ɵsetProfiler(null)`: it clears every profiler, Angular DevTools' included.
- Since Angular 22.0 a component without `changeDetection` is OnPush: `getDirectiveMetadata(...)
  .changeDetection === 0`. `Eager` means the author opted out.
- Neither fixture gets the `NgZoneless` mark (it is set only inside `provideZonelessChangeDetection()`), and
  the portal loads zone.js yet is zoneless. Read zone mode from the LAST `NgZone` provider record, as the doctor
  does: bootstrap adds a `NoopNgZone` record before the app's providers and the profiler keeps both, so a
  Zone.js app lists `NoopNgZone` first and `NgZone` (`useFactory`) last. Measured 2026-10-12 on both fixtures
  (zoneless) and on the portal with `provideZoneChangeDetection()` added and reverted (zone-based).
- The counter's `effect` writes a signal on purpose (anti-pattern fixture). Do not fix it.
