---
name: control-angular-dev-app
description: Drive, screenshot, inspect and reproduce behaviour in an Angular application running in development mode, in the browser through playwright-cli, with ng.* recipes for the component list, inputs and change detection, signal graphs, injector resolution paths and providers, and router state. Launches one of three fixtures in isolation (the ng222-app counter in spikes/ng222-app, the ng222-ssr server-rendered app in spikes/ng222-ssr with hydration, transfer state, @defer hydrate triggers and a mismatch switch, or the ng-journal Insurance Portal with its API) or attaches to any dev-mode Angular app by URL. Use to verify a change in the browser, prove what ng.* returns on a real page, read SSR and hydration state, or check that a page is an Angular dev build.
---

# control-angular-dev-app

Launches the counter fixture, the SSR fixture or the Insurance Portal on derived ports, or attaches to any running dev-mode
Angular app by URL; checks the page is an Angular development build; drives it through a named playwright-cli
session; reads Angular state through `window.ng` helpers; captures evidence; tears down only what it started.
Skip it for production builds (no `window.ng`), for unit tests, and for Lars's own browsers: never attach to
Chrome Beta or Edge Dev (`--cdp`, `--extension`), and never use the sessions `cb`, `ed`, `ai-cb`, `ai-ed`.

All commands below run from the root of the checkout you drive (the main checkout or a worktree); playwright-cli
sessions are looked up from there. `S` stands for `.claude/skills/control-angular-dev-app/scripts/control.mjs`.

## Pick a flow

| Flow | Command | Notes |
|---|---|---|
| Counter fixture | `node $S up --target counter` | `spikes/ng222-app`, Angular 22.2.2, zoneless, `provideRouter` with no routes |
| SSR fixture | `node $S up --target ssr` | `spikes/ng222-ssr`, Angular 22.2.2, `@angular/ssr`, zoneless, `provideClientHydration()`; routes `/` (`RenderMode.Server`), `/prerender` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`); local data at `/api/items` from `src/server.ts` |
| Insurance Portal | `node $S up --target portal` | The portal checkout `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` (a git worktree of the portal repository); override it with `--dir <path>` or `CONTROL_NG_PORTAL_DIR` |
| Any dev-mode app | `node $S up --url http://localhost:<port>/` | Nothing is launched or stopped; process and port checks report skipped |

Ports. The main checkout uses slot 0, the defaults below. A worktree session (this checkout's `.git` is a file, or the target folder's: the portal
folder is a worktree of its own repository) takes slot 1-99 from a hash of the fixture or portal folder, so its ports stay the
same from run to run: counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot` (measured
2026-10-16 in the `verification-skills` worktree: counter 4336, SSR 4464; the default portal folder: 4507). When a derived port is busy, `up` tries the next
slot, 10 slots in all, and records the slot and the ports it used (`info --json`: `slot`, `ports`).

| Port | Kind | Default | How it moves |
|---|---|---|---|
| counter app | derived | 4222 | `--port`, passed to `ng serve --port` (measured: listened on 4336, and on its fallback 4337 while a throwaway listener held 4336) |
| SSR app | derived | 4223 | `--port`, passed to `ng serve --port` (measured: listened on 4464) |
| portal app | derived | 4200 | `--port`, passed to `nx run insurance-portal:serve --port=` (measured: listened on 4507) |
| portal api | fixed | 3000 | `.claude/skills/control-angular-dev-app/scripts/control.mjs:66` keeps it at 3000 because the portal checkout (outside this repository) hardcodes `http://localhost:3000/api/` at `libs/shared/utils/src/lib/injection-tokens.ts:5`; the API itself takes `PORT`. One portal per machine |
| portal pangular | external | 9999 | control-pangular-inspector starts it; the portal proxies `/__pangular` to it. This skill never starts or stops it |
| `--url` app | external | the URL's port | whatever runs it; this skill never starts or stops it |

- `--port N` sets the app port with no fallback for it: a busy `N` exits 2 naming its holder's PID; from a
  worktree the main checkout's port is refused (use `--url` to drive that instance on purpose), and so are a
  bare `--port` and a value equal to the flow's fixed or external port (3000, 9999).
- A process that loses its port to another one after the check (the other one answers the readiness probe,
  or the server exits with "already in use" in its log) is stopped, and `up` tries the next slot; each attempt
  logs to its own file (`app.log`, `app-2.log`, ...).
- A busy fixed port exits 2: `fixed port api 3000 held by PID <p>; pinned by
  libs/shared/utils/src/lib/injection-tokens.ts:5 in the portal checkout <dir>`. The holder may be another
  session's portal or Lars's own; it is never stopped.
- One instance per flow per checkout: `up` refuses while the flow's state file exists. A second session runs
  its own instance from its own worktree.
- Every command takes `--target <name>` or `--url <url>` to pick the flow; with exactly one flow running,
  neither is needed.

## Launch

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json
```

- Counter runs `node node_modules/@angular/cli/bin/ng.js serve --port <port>` in the fixture folder.
- SSR runs `node node_modules/@angular/cli/bin/ng.js serve --port <port> --no-hmr` in `spikes/ng222-ssr`. The
  dev server renders every request on the server through `src/server.ts` (development mode, so `window.ng`
  exists after hydration). `--no-hmr` because HMR, the dev-server default, loads every `@defer` dependency
  eagerly (NG0751 in the log), which hides incremental hydration.
- Portal runs two processes in the portal folder: `node node_modules/nx/dist/bin/nx.js run api:serve --inspect=false`
  with `PORT=3000`, and `node node_modules/nx/dist/bin/nx.js run insurance-portal:serve --port=<port>` with `PORT`
  removed from its environment. Both get `NX_DAEMON=false` and `NX_TUI=false`, so no Nx daemon outlives `down`.
- Readiness: each URL answers (portal API: `/api/customers`) and the app's index HTML contains its root tag
  (`<app-root>`, `<ng-journal-root>`). The doctor then checks the rendered page.
- The portal API starts first and the app only after the API answers. Started together, the two cold `nx run`
  processes timed out in the Nx plugin worker ("did not receive a load message within 10 seconds") in 3 of 4 runs
  (2026-10-11). Started one at a time, 2 of 2 runs passed (2026-10-12).
- Readiness polls wait up to 60 s per request: the first SSR render compiles on demand, and aborting it at the
  old 3 s limit left an `AbortError` in the server log, which failed `build-log` (measured 2026-10-12).
- Measured time to ready, warm caches: counter 2.6-8 s (four runs), SSR 7.5-14.5 s (four runs, 2026-10-12), portal 15.3-20.5 s with
  the API first (three runs). In a fresh worktree with a cold `.angular` cache: counter 13.6-21 s, SSR 16.7-19.3 s
  (2026-10-15, 2026-10-16); the first portal start of a session took 81.7 s (2026-10-16). The first portal build
  after a change can take minutes; `--timeout <seconds>` (default 240; a missing value or one that is not a
  positive number exits 2).
- Server output goes to `<evidenceDir>/app.log` (and `api.log`).
- A port another process holds is never taken over: a derived one moves the run to the next slot (also when
  the server finds its port taken after the check: `up` stops the tree it started and tries the next slot); a
  busy fixed port or `--port` exits 2 naming the holder's PID (see Pick a flow).

## Doctor

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs doctor [--target ...|--url ...] [--json]
```

Answers "is this instance worth driving?". One line per check:

- `map-fresh` (first): whether each feature file still matches the source it was proven against, from
  `scripts/fingerprint.mjs` and `features/.proven.json`. `[WARN]` names the stale and unproven features; it never
  changes the exit code. The four portal features are recorded as external: the portal lives outside this
  repository, so no file in it can be hashed.
- `process-alive:<name>`; `ports`: every derived and fixed port of the run listens and its PID is in a recorded
  process tree, and every port is listed with its kind
  (`[OK] ports: app 4507 (derived), api 3000 (fixed: libs/shared/utils/src/lib/injection-tokens.ts:5 in the portal checkout ...), pangular 9999 (external: ...)`;
  `[SKIP] ports: --url given; ownership not checked`);
  `build-log:<name>` (no `[ERROR]`, `error TS`, `NGxxxx` lines; a `[vite]` runtime entry is ignored up to the
  next entry: proxy errors with their `Error: read ECONNRESET` and `at ...` lines, and the browser console
  forwarded as `(client)`, including the multi-line NG0500 that `ssr-check.js` provokes on `?mismatch=1`;
  `console-errors` covers those). Skipped with `--url`.
- `pangular-auth` (only when a code prompt blocks the session): with a Pangular server behind `/__pangular`
  the overlay opens a `prompt` for a one-time code that blocks every playwright-cli command. For the portal,
  when the current tab's URL (from `tab-list`, which answers while the prompt is open) has the run's origin,
  doctor reads the code from control-pangular-inspector's `pangular.log` (via its state file
  `pangular-9999.json`) and enters it; with no such state file it dismisses
  the prompt and warns, and a failed `dialog-accept` warns with its error (the code itself is never printed).
  Any other page (another origin, another target, or an `--url` attach) never gets the code: its prompt is
  dismissed with a warning.
- `browser-session`: opens (or reuses) the run's session (`control-ngdev-<target>-<port>`, or `control-ngdev-url-<port>`) and goes to the app URL.
- `angular-root`: an element with `[ng-version]`; prints the version and root tags. `app-marker`: the fixture's
  root tag (fails too when the page has no Angular root). Page text in a detail is printed with its control
  characters escaped.
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
`control-ngdev-portal-4507` for the defaults).

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

SSR target: `playwright-cli -s=<session> --raw run-code --filename=.claude/skills/control-angular-dev-app/scripts/ssr-check.js
> <evidenceDir>/ssr-check.json` reads the server HTML of `/` and `/?mismatch=1` (`ngh` count, `<script
id="ng-state">`, `ng-server-context`), loads each page, and returns `window.ng`, the `ngDevMode` hydration
counters, every node whose `__ngDebugHydrationInfo__` status is not `hydrated` (with expected and actual DOM)
and console errors, plus six named checks and `ok`. It navigates the session's page and ends on `/`. The SSR
reads in [features/ssr.md](features/ssr.md) cover transfer state, `@defer` blocks, event replay and render
modes.

Not reachable: Angular DevTools (browser extension, manual only); the Nx and Angular CLI MCP servers are not
used (the script cannot call MCP tools).

## Evidence

Evidence and logs go to `tmp/control-angular-dev-app/<flowId>-<timestamp>/` (git-ignored; `info` prints it).
Pass `--filename=<evidenceDir>/...` to every `snapshot` and `screenshot`, or they land in `.playwright-cli/`.
A proof holds: a before and after snapshot, a screenshot showing the app (the header "Insurance Portal", the
counter line, or the SSR heading "Render mode: server"), the side effect (URL, `requests`, an `__ngc` read saved with `--raw ... > file.json`), and
the server log. Proof rules: [features/README.md](features/README.md#proof-and-skip-reporting).

## Cleanup

```bash
node .claude/skills/control-angular-dev-app/scripts/control.mjs down [--target ...|--url ...]
```

Checks every recorded PID against its recorded start time and command line, closes the run's playwright-cli
session, stops each recorded process tree (`taskkill /T /F` by PID), deletes the state file, keeps the
evidence directory. A PID that no longer runs is noted, not refused; the child processes it left (those whose
parent is that PID, that started after it and whose command line names the target folder, such as an Nx executor) are stopped by PID with their trees. Never `playwright-cli close-all` or
`kill-all`: they reach Lars's sessions.

## Helpers

`scripts/control.mjs <command> [--target counter|ssr|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]`

| Command | Does | Output | Exit |
|---|---|---|---|
| `up` | launch (`--target`) or attach (`--url`); writes `tmp/control-angular-dev-app/state/<flowId>.json` | flowId (the target, or `url-<port>`; a URL without a port uses 80 or 443), url, port, slot, ports `{name, port, kind, reason?}`, session, evidenceDir, procs `{name, pid, port, start, commandLine, log}`, `readyInSeconds` | 0 ready; 2 refused (10 slots busy, a busy fixed port, a busy `--port`, worktree on the main port, state exists), process exited, timeout |
| `doctor` | checks above | one line per check, or `checks[]` with `--json` | 0 / 1 / 2 |
| `info` | prints the state | state plus `statePath` | 0; 2 no state |
| `down` | teardown | notes per process and the session | 0 done (also when the PID is already gone); 2 missing state file, or PID start time / command mismatch (nothing stopped) |

`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here) keeps the proof manifest
`features/.proven.json`:

- `node .claude/skills/control-angular-dev-app/scripts/fingerprint.mjs record --feature <id> --entries <path>...`
  records the files feature `<id>` depends on (the TypeScript import closure of the repository-relative entries,
  plus templates and styles) with their git blob hashes. Without `--entries` it reuses the recorded ones. Exit 0
  written or unchanged, 2 refused (an entry outside the repository, a missing feature file). With
  `--external "<reason>"` in place of `--entries` it records a feature whose source lives outside the repository.
- `node .claude/skills/control-angular-dev-app/scripts/fingerprint.mjs check [--feature <id>] [--json]` prints
  `fresh`, `stale` (with the changed files), `unproven` or `external` per feature. Exit 0 every feature fresh or
  external, 1 one is stale or unproven, 2 could not run.

Each script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them and
`npm run check` type-checks the scripts.

`scripts/ng-inspect.js` is a playwright-cli `run-code` file: it installs `__ngc` and returns the doctor's page
facts. `scripts/ssr-check.js` is a `run-code` file for the SSR target (Inspect).

## Gotchas

- The portal API's `@nx/js:node` serve target opens the Node inspector on 9229 by default (measured 2026-10-16:
  the API process listened on 3000, 127.0.0.1:9229 and [::1]:9229). The script passes `--inspect=false`,
  so the stack opens only the ports in the table; any other Node process on the machine may hold 9229.
- `PORT` in the environment beats `--port` on the Angular dev server: with `PORT=3000` set for the API, the
  portal served on 3000 (measured). The script strips `PORT` for the app process; keep it that way.
- Nx 23's CLI entry is `node_modules/nx/dist/bin/nx.js`; the script reads it from `package.json` `bin`.
- The dev servers listen on `[::1]` only; use `localhost`, not `127.0.0.1`.
- The portal API port is fixed at 3000, so only one portal flow runs at a time on this machine; a second
  session's `up --target portal` exits 2 naming the first one's API PID.
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
- The SSR fixture's `app-mismatch` component is a deliberate hydration mismatch fixture (`REQUEST` tells server
  from client, `Renderer2` adds a server-only node). Do not fix it. `?mismatch=1` logs NG0500 on purpose;
  `?mismatch=text` renders different text on server and client, which hydration overwrites with no error.
- On the SSR fixture, run `doctor` on `/` only: `console-errors` fails on `?mismatch=1` by design.
- Under `ng serve`, `/prerender` is rendered per request like `/` but marked `ng-server-context="ssg"`.
  Production prerendering (HTML written at build time) is not what the dev server shows.
- `/client` (`RenderMode.Client`) is served as the bare shell: `<body ngcm>`, an empty `<app-root>`, no `ngh`,
  no `ng-state`. Hydration recipes need `/` or `/prerender`.
