# Chunk 2 — the browser-driver skill maps (Angular DevTools, Pangular Inspector, Vitest Browser Mode) plus the portal and SSR fixtures of `control-angular-dev-app`

Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

Verdicts come from reading this repository's scripts, fixtures and manifests and from running the read-only commands named below; no browser was driven, no server was started, nothing was installed.

## .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

Portal paths below are relative to `apps/insurance-portal/src/app/` in the portal checkout; `control.mjs` is this skill's script.

- current: `/` redirects to `/home`, which shows four domain tiles — read the portal checkout: `path: ''` has `redirectTo: 'home'`, `path: 'home'` loads `HomeComponent` (`app.routes.ts:5-12`), and the component renders `<a routerLink="/contract/list">` … Contracts/Claims/Complaints/Customers (`home.component.ts:16-53`) — `portal-navigation.md:4,11`
- current: each home tile is a real link to `/<domain>/list` — read `<a routerLink="/contract/list">`, `/claim/list`, `/complaint/list`, `/customer/list` (`home.component.ts:16,26,37,49`)
- current: sidebar has `List` and `Create` per domain, `List` only for Customer, plus a `Home` entry — read `routes: [listMetaData, createMetaData]` for contract/claim/complaint and `routes: [listMetaData]` for customer, General → Home (`sidebar.component.ts:76-101`)
- current: sidebar entries are a `div` with `routerLink`, not a link — read `<div [routerLink]=… [routerLinkActive]=…>` (`sidebar.component.ts:46-65`)
- current: only the group headings are upper-cased, through the `capitalize` pipe, which calls `toUpperCase` — read `{{ config.domain | capitalize }}` (`sidebar.component.ts:38`) and `return value.toUpperCase();` (`libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9`)
- current: unknown paths render `Page Not Found` and "Sorry, but the page you were trying to view does not exist." — read `<h1>Page Not Found</h1>` / `<p>Sorry, but the page you were trying to view does not exist.</p>` (`page-not-found.component.ts:7-8`) reachable through the `path: '**'` route (`app.routes.ts:32-36`)
- current: the domain routes carry `canMatch` feature-flag guards — read `canMatch: [featureFlagGuard('contract-list')]` (`libs/contract/routes/src/lib/routes.ts:10,16,22,28`)
- current: the contract route list is `/contract/list`, `/contract/create`, `/contract/:id/edit`, `/contract/:id/details` — read `path: 'list' | 'create' | ':id/edit' | ':id/details'` under `path: 'contract'` (`app.routes.ts:13-17`, `libs/contract/routes/src/lib/routes.ts:9,15,21,27`)
- current: the header link is `https://www.ng-journal.com` and the shell is `<ng-journal-root>` — read `href="https://www.ng-journal.com"`, `selector: 'ng-journal-root'` (`app.component.ts:9,20`)
- current: the recipes use `node $S up --target portal` / `doctor --target portal` — the `portal` target and its doctor exit codes exist (`control.mjs:178-220,1898-1910`)
- unverifiable: `snapshot --filename=home.yml` shows `heading "Home" [level=1]` and the tile/link roles — needs the portal served (API 3000 + app 4507) and a playwright-cli snapshot
- unverifiable: the sidebar role/name queries (`getByRole('navigation')…filter({hasText:'CLAIM'})`) and the resulting `/claim/create` URL — needs a driven browser session
- unverifiable: `__ngc.router()` holds the four contract routes after a visit, and `doctor` exits 0 leaving the page on `/home` — needs a running app and the skill's own session
- unverifiable: the last node of a snapshot is the overlay's `button "Toggle Pangular Inspector"` — needs the running page; the button lives in `@pangular-inspector/devtools`, outside this repository
- unverifiable: "every flag is on" (so the feature-flag fall-through is not driven) — needs the running app's flag values

## .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md

Portal paths below are in the zoneful worktree named above; `control.mjs` is this skill's script.

- current: the zoneful worktree exists at that path and is an isolated git worktree — read `.git` there is a 151-byte file `gitdir: …/worktrees/HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful`, and `git worktree list` shows it `9767523 (detached HEAD)` — `portal-zoneful-worktree.md:6-9,12-14`
- current: the pin `git -C <path> rev-parse HEAD` prints `976752389c22bb563d2278c2d78f423cb2505669` — ran `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful rev-parse HEAD` → `976752389c22bb563d2278c2d78f423cb2505669`
- current: Angular 20.3.35 installed while `package.json` asks `@angular/core ^20.3.29` — read `"@angular/core": "^20.3.29"` and `node_modules/@angular/core/package.json` `"version": "20.3.35"` (`package.json:12` in the worktree)
- current: `zone.js ^0.16.2` installed — read `"zone.js": "^0.16.2"` and installed `0.16.3` (satisfies the range) (`package.json:28` in the worktree)
- current: the build polyfills `["zone.js"]` — read `"polyfills": ["zone.js"],` (`apps/insurance-portal/project.json:16` in the worktree)
- current: `apps/insurance-portal/src/app/app.config.ts` names no change-detection provider — read the file: no `changeDetection`, `provideZoneChangeDetection` or `provideZonelessChangeDetection` line
- current: the derived app port is 4509 (slot 9, `4500 + slot`) — ran the script's own hash formula (`slotOf`: sha1 of the lower-cased folder, 1-99) over the worktree path → slot 9 → 4509 (`control.mjs:185,294-304`)
- current: the API is on the fixed 3000 — read `PORTAL_API_PORT = 3000` and the `api` port row `kind: 'fixed'` (`control.mjs:101,187-192`)
- current: the `change-detection-mode` line reads `zone-based (NgZone provider: NgZone); zone.js loaded; mark_feature_usage: …`, and a `useClass: NoopNgZone` record reads `zoneless` — read `cdMode` (NoopNgZone → `zoneless`, other → `zone-based`) and the doctor's detail string (`control.mjs:624-629,1862-1865`)
- current: the last `NgZone` provider record is the app's, which is why the doctor reads the last one — read `records.findLast((r) => r.token?.name === 'NgZone')` and its `useFactory → 'NgZone'` fallback (`ng-inspect.js:128-138`)
- current: the record list has `ChangeDetectionScheduler` `useExisting ChangeDetectionSchedulerImpl`, an `NgZone` `useClass fn:NoopNgZone`, then the `NgZone` `useFactory fn:ngZoneFactory` beside `NgZoneChangeDetectionScheduler` and `ZoneStablePendingTask` — read the capture `research/raw/zone-mode-portal-zonejs.json` (environment injector `zoneRecords`), which shows exactly that order
- current: `info --json` prints `slot` and `ports` naming the app port as derived and the API as fixed — read `info()` spreading the recorded state and the port rows (`control.mjs:1913-1917,181-200`)
- current: `--dir` (or `CONTROL_NG_PORTAL_DIR`) selects which checkout is served — read `const dirFlag = flag('dir')` and `dir: process.env['CONTROL_NG_PORTAL_DIR'] || PORTAL_DEFAULT_DIR` (`control.mjs:1477,179,1984`)
- unverifiable: the `up --target portal --dir <path>` run's own header line `> nx run insurance-portal:serve:development --port=4509` in `<evidenceDir>/app.log` — needs the portal started (nothing was started)
- unverifiable: `doctor` exits 0 and prints the `angular-root` line with 20.3.35 — needs the served portal, the API on 3000 and a browser
- unverifiable: `__ngc.injectors(...)` / `__ngc.providers(..., <i>)` on the running page print that record list — needs a live page (`__ngc` installed by a session)
- unverifiable: the 2026-11-08 behavioural capture (zone-hosted `setTimeout` ticked `applicationRef._tick` 2×, `Zone.root` 0×) — it is recorded in `features/.proven.json`, but re-taking it needs a browser and the app

## .commandcode/skills/control-angular-dev-app/features/ssr.md

Fixture paths below are `spikes/ng222-ssr/src/app/` unless named otherwise; `control.mjs` is this skill's script.

- current: the SSR fixture is served at `http://localhost:4223/` — read the `ssr` target's slot-0 port (`slot === 0 ? 4223 : 4400 + slot`) (`control.mjs:156-165`)
- current: `ssr-check.js` lives at `.commandcode/skills/control-angular-dev-app/scripts/ssr-check.js` — the file exists
- current: six checks named `server-html-ngh`, `server-html-transfer-state`, `dev-build-after-hydration`, `hydration-counters`, `no-mismatch-on-default-route`, `expected-mismatch-detected`, `ok` true only when all six pass — read the results table and `ok: checks.every((c) => c.status === 'pass')` (`ssr-check.js:114-159`)
- current: `ssr-check.js` returns `ok: false` without throwing — read the return object; no throw path after the checks (`ssr-check.js:158-163`)
- current: `/api/items` is fetched during the server render and the server logs `[api] GET /api/items` with the user agent — read `app.get('/api/items', …)` and `console.log(\`[api] GET /api/items … ua=${req.headers['user-agent']}\`)` (`spikes/ng222-ssr/src/server.ts:18-19`)
- current: `?mismatch=1` is a structural mismatch and `?mismatch=text` a text-only one — read the fixture comments and template (`mismatch.ts:3-8`)
- current: `?transfer=0` turns the HTTP transfer cache off — read `transferCache: this.transfer() !== '0'` (`data-list.ts:22`)
- current: the three routes and their render modes (`/` ssr, `/prerender`, `/client`) with nav links `Server route`/`Prerender route`/`Client route` and a `Render mode: …` heading — read `app.routes.server.ts:4-6` (`Server`/`Prerender`/`Client`), `app.routes.ts:5-7`, `app.html:2-4`, `page.ts:11`
- current: the page holds an `Early click` button with its count and a `@defer (hydrate on interaction)` block with a `Deferred click` button — read `<button …>Early click</button>`, `Early clicks: {{ clicks() }}`, `@defer (hydrate on interaction)`, `<button …>Deferred click</button>` (`page.ts:11-21`, `deferred.ts:6-7`)
- unverifiable: the server HTML carries `ngh` attributes, `<!--nghm-->`, `<script id="ng-state">`, the event-dispatch script and `ng-server-context="ssr"` — needs the SSR app started (`up --target ssr`) and a `page.request.get`
- unverifiable: hydration counters (`hydratedComponents` 4, `hydratedNodes` 40, no other status) and the `ngh`-attribute removal — needs a browser run of the probe
- unverifiable: `window._ejsas.ng.q` queues an early click and `Early clicks: 1` after hydration — needs `ssr-event-replay.js` run against a browser
- unverifiable: the defer block's states (`initial`/`dehydrated` → `complete`/`hydrated`, triggers `["hydrate on interaction", "on idle"]`) and `Deferred clicks: 1` — needs a driven page
- unverifiable: `/client` is the bare shell with `<body ngcm>` — needs `ssr-render-modes.js` run against the served app

## .commandcode/skills/control-angular-devtools/SKILL.md

- current: `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` and the commands are `install|uninstall|status|up|doctor|attach|panel|coexist|info|down` — read the `COMMANDS` map and `HELP` (`control.mjs:2236-2257`)
- current: the extension id is `ienfalfjdbdpebioblfackkekamfmbnh` and the store page is `https://chromewebstore.google.com/detail/<id>` — read `EXT_ID` and `STORE_URL` (`control.mjs:108-110`)
- current: supported browsers are `chrome`, `chrome-beta`, `edge`, `edge-dev` plus `test` — read `BROWSER_VALUES` and `BROWSERS` (`control.mjs:122-143,159`)
- current: "Chrome for Testing 156.0.8078.4, revision 1248, read from `node_modules/playwright-core/browsers.json`" — read that file: chromium `"revision": "1248"`, `"browserVersion": "156.0.8078.4"`
- current: main checkout session `ngdt`, CDP 9420; worktree session `ngdt-wt-<hash>`, CDP `9420 + slot` in 9421-9499 (slot 1-79) — read `flowIdOf` (`wt-<sha1[:6]>`), `SESSION`, `MAIN_CDP_PORT`, `slotOfFlow` (`control.mjs:323-343,377`)
- current: `up` tries 10 slots in all — read `SLOT_TRIES = 10` (`control.mjs:332`)
- current: profile `tmp/control-angular-devtools/profile/main`, config `tmp/control-angular-devtools/state/<flow>.cli.config.json` — read `TMP`, `PROFILE`, `configPath` (`control.mjs:113,379,1610`)
- current: the doctor prints `map-fresh`, `process`, `tree`, `ports`, `extension`, `app`, `connected-flag`, `devtools-window` — read the doctor (`control.mjs:1789-1872`)
- current: `install` copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\` — that folder exists with `1.22.0_0` and `1.22.1_0` (newest 1.22.1)
- current: the `--config`/`launchOptions` schema is playwright-cli 0.1.21's — ran `playwright-cli --version` → `0.1.21`
- current: evidence goes to `tmp/control-angular-devtools/evidence/<yyyymmdd-hhmmss>/` — read `evidenceStamp`/`evidenceDir` (`control.mjs:1555-1559,1608`) and the existing folders (`20261107-211420`, `20261112-165527`)
- current: the panel is driven with `Extensions.extensionServer.onShowPanel({command:'showPanel', …})` on the `devtools://devtools/bundled/devtools_app.html` target and read with `Runtime.evaluate` — read those three call sites (`control.mjs:1097,1134,1087`)
- current: `coexist` takes `[--component C] [--click "<locator>"] [--di-graph]` and defaults to `app-counter` / `getByRole('button', { name: 'Increment' })` — read `HELP` and `BOOL_FLAGS` (`control.mjs:157,2243`)
- stale: "Every other script has a `node:test` file beside it (`*.test.mjs`)" — asserted at `SKILL.md:198`, contradicted by `.commandcode/skills/control-angular-devtools/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`)
- unverifiable: ready "when the CDP port lists the extension's `service_worker` target", measured 2.9-8 s — needs the harness started
- unverifiable: the copy keeps `_metadata/` and loads with 0 manifest errors/warnings; the manifest's `key` keeps the store ID — needs loading the unpacked copy in a browser
- unverifiable: "measured 2026-10-16 in the `verification-skills` worktree (`wt-423ece`, slot 10): a throwaway listener on 9430 moved the run to 9431" — needs a run
- unverifiable: `--auto-open-devtools-for-tabs` opens the DevTools window on Lars's desktop; the panel handles read from the live panel 1.22.1 (tab names, `.node-name`, `aria-label` `Start recording`) — needs a desktop session and the live panel
- unverifiable: opening `chrome-extension://<id>/index.html` in a tab fails with `TypeError: Cannot read properties of undefined (reading 'inspectedWindow')`, and `connectOverCDP` lists the extension frames with empty URLs — needs a browser
- unverifiable: `coexist` passes when the removed subscriber stops counting and DevTools recorded the cycles; `--di-graph` removes the template node from both — needs the harness and the panel

## .commandcode/skills/control-angular-devtools/features/README.md

- current: `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` — the file exists
- current: the counter fixture is `spikes/ng222-app` at Angular 22.2.2 — read `spikes/ng222-app/node_modules/@angular/core/package.json` → `"version": "22.2.2"`
- current: `control-angular-dev-app up --target counter` serves it and its `info` prints the URL — read the `counter` target and `info()` spreading the state (`control-angular-dev-app/scripts/control.mjs:114-134,1913-1917`)
- current: the harness commands are `node $S install`, `node $S up --app-url=<url>`, `node $S doctor`, `node $S status --browser <name>` — read `HELP`/`COMMANDS` (`control.mjs:2236-2257`)
- current: the app page is driven in session `ngdt` — read `SESSION` (`control.mjs:377`)
- current: the harness is headed — read `headless: false` in the launch options (`control.mjs:1636`)
- current: evidence stays in `tmp/control-angular-devtools/evidence/`, git-ignored — read `.gitignore:7` (`tmp/control-angular-devtools/`)
- current: the feature entry contract (H1, one paragraph, then `Sub-features`, `How to get to it (user POV)`, `Driving it with …`, `Gotchas`) — read the four feature files; each has those four H2s in that order
- current: the full-sweep order install → attach → signal-graph → profiler matches the four feature files on disk — read the links and the folder listing
- unverifiable: "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" — that file is Angular DevTools source, not in this repository
- unverifiable: "the scripted path uses DevTools frontend internals proven only in the test harness" and the manual-only Web Store confirmations — need a browser and a person

## .commandcode/skills/control-angular-devtools/features/attach.md

- current: the connected marker is `window.__NG_DEVTOOLS_CONNECTED__` and the doctor reports it as `connected-flag` — read the page probe and the check (`control.mjs:1854,1862-1866`)
- current: `node $S attach` is a command — read `COMMANDS.attach` (`control.mjs:2252`)
- current: `attach` requires `isDebugMode` and otherwise exits 1 — read `attachOk` returning `!!(r.flag && d.isAngular && d.isDebugMode && r.backendInstalled && r.backendReady)` (`control.mjs:1882-1892`)
- unverifiable: the measured result `flag true (set at ~50 ms); detection {…}; backendInstalled true; backendReady at ~950 ms; Angular 22.2.2` — needs the harness up on the counter fixture
- unverifiable: `isSupportedAngularVersion` means major 12+ or 0 — that rule lives in the DevTools bundle, not this repository
- unverifiable: the content script gates on `isAngularDevTools`, `isAngular` and an HTML document, and the popup shows `production.html` (built 1.22.0 `app/content_script_bundle.js`) — that bundle is inside the Edge Dev profile, outside this repository
- unverifiable: the toolbar icon turns from grey to colour — browser UI

## .commandcode/skills/control-angular-devtools/features/install.md

- current: the store page is `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh` — read `STORE_URL` (`control.mjs:110`)
- current: the commands and flags are `install [--browser …] [--from …] [--profile P] [--timeout S]`, `uninstall`, `status` — read `HELP` (`control.mjs:2237-2239`)
- current: a test `uninstall` refuses while `up` runs — read `refuse('the test browser is up; run "down" first')` (`control.mjs:1520`)
- current: the end-state doctor line is `extension: Angular DevTools <version> ENABLED (UNPACKED, …)`, and the newest folder in the Edge Dev profile is 1.22.1 — read the doctor detail format (`control.mjs:1844-1849`) and the profile folders `1.22.0_0`, `1.22.1_0`
- current: branded `status` reads installed state, version and `disable_reasons` from `<User Data>\<profile>\Extensions\<id>` and `Secure Preferences` → `extensions.settings.<id>` — read the status reader (`control.mjs:1298-1314,1548`)
- unverifiable: "Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured: install exit 0 …)" — needs Lars clicking the store's add/remove confirmations
- unverifiable: "`chrome://` and `edge://` URLs passed on the command line open an empty window" — needs a branded browser
- unverifiable: the extensions page toggle/Remove behaviour and "the extensions page is the authority" — browser UI

## .commandcode/skills/control-angular-devtools/features/profiler.md

- current: `node $S coexist` exists and defaults to `app-counter` with `getByRole('button', { name: 'Increment' })` — read `HELP` (`control.mjs:2243`)
- current: `ɵsetProfiler` keeps a list of subscribers in Angular 22 and `ɵsetProfiler(null)` clears every one, while `ɵsetProfiler(cb)` returns a remover — read the installed Angular: `const profilerCallbacks = []`, `removeProfiler`, and `profilerCallbacks.length = 0` for `null` (`spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:136-154`)
- unverifiable: the measured result `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles` — needs the harness up with the panel recording
- unverifiable: "DevTools' subscriber cannot be listed from the page (the list is module-private)" — needs a live page

## .commandcode/skills/control-angular-devtools/features/signal-graph.md

- current: `node $S panel signal-graph --component=app-counter` and `node $S panel screenshot` exist — read the panel subcommands (`control.mjs:1926,2242`)
- current: the pane's nodes are `ng-signal-graph-pane .node-cont.kind-*` — read the `readSignalGraph` evaluate (`control.mjs:1165`)
- unverifiable: the expected fixture graph `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`, and after `angular:di_graph` the pane `signal:count, effect:Effect` — needs the live panel
- unverifiable: the extra kinds `linked-signal`, `child-signal-prop`, `resource`, `unknown` — they come from the extension's `signals-visualizer` source, not this repository (the string `child-signal-prop` appears nowhere in `control.mjs`)
- unverifiable: "the pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second read" — the doc itself marks it inferred; needs a run

## .commandcode/skills/control-pangular-inspector/SKILL.md

- current: the MCP endpoint is `http://localhost:9999/__mcp` — read `mcpUrl: \`http://localhost:${p}/__mcp\`` (`control.mjs:1644`)
- current: the portal is the standalone flow, reached through `/__pangular/` with target 9999 — ran `node …/control.mjs check --json` → `"mount": "standalone-cli"`, `proxy-target … "/__pangular -> http://localhost:9999"`
- current: the pin is 0.0.7, declared exactly and installed — ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)`, `installed … node_modules has 0.0.7`; pin constant at `control.mjs:103`
- current: the doctor's checks are `map-fresh`, `package-pinned`, `overlay-import`, `process-alive`, `tree`, `ports`, `mcp-origin-guard`, `mcp-initialize`, `read-only`, `browser-session`, `auth-code`, `dev-build`, `overlay-page-id`, `overlay-connected`, `console-errors` — read the doctor body (`control.mjs:2009-2220`)
- current: `mcp-origin-guard` passes when a POST without `Origin` gets 403 — read `noOrigin.httpStatus === 403 ? 'pass' : 'fail'` (`control.mjs:2061-2065`)
- current: `read-only` passes when none of the eight action tools is listed — read `ACTION_TOOLS` (highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api) and `readOnlyCheck` (`control.mjs:107-116,887-901`)
- current: the server runs `bin.mjs dev --port 9999 --no-open --root <app> --read-only` through `__serve` — read the spawn arguments (`control.mjs:1577-1622`)
- current: a busy port refuses with `fixed port pangular 9999 held by PID <p>; pinned by …` — read the refusal string (`control.mjs:1680`)
- current: the state file is `tmp/control-pangular-inspector/state/pangular-<port>.json`, evidence `pangular-<port>-<timestamp>/` with `pangular.log`, session `pangular-<port>` — read those paths (`control.mjs:100,1548,1605-1607,1647`) and the existing folders `pangular-9999-2026-11-13T01-12-39-702Z`
- current: every feature is recorded as `external` — ran `fingerprint.mjs check` → five `[OK] … external since faa978feed4f`, exit 0
- current: `components` falls back to the `component-tree` resource when 0.0.7 has no `list-components` — read the fallback with the notice "list-components is not in this version" (`control.mjs:2238-2275`)
- stale: "`…/scripts/control.mjs:74` defaults to 9999" — asserted at `SKILL.md:42`, contradicted by `control.mjs:74` (a `State` typedef line, `@property {string} mcpUrl`); the default is `const DEFAULT_PORT = 9999` at `control.mjs:104`
- stale: "Every other script has a `node:test` file beside it (`*.test.mjs`)" — asserted at `SKILL.md:206`, contradicted by `.commandcode/skills/control-pangular-inspector/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`)
- unverifiable: "With `--read-only`, 0.0.7 lists 46 tools" — needs the devtools server started (`node $S tools` needs a live MCP endpoint)
- unverifiable: "The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it" — needs the server running and a listener check
- unverifiable: "npm 11.16 drops 27 entries from the committed lockfile on any install" — needs an `npm install` in the portal (a change to the app)
- unverifiable: "`process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows … (exit 127)" — needs a repro run
- unverifiable: the measured ready times (2.2 s for MCP `initialize`, 17-20 s for the portal) — need runs

## .commandcode/skills/control-pangular-inspector/features/README.md

- current: `S` and `D` name the two control scripts — both files exist
- current: "`node $S check` exits 0 (pin, overlay import, proxy)" — ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check --json` → `"ok": true`, six checks, exit 0
- current: "`node $D up --target portal` (API 3000, app 4507 for the default portal folder)" — read the portal target (API `kind: 'fixed'` 3000, app `4500 + slot`) and computed the default portal folder's slot with the script's own hash → slot 7 → 4507 (`control-angular-dev-app/scripts/control.mjs:185-192,294-304`)
- current: the session and evidence come from `node $S info`, session `pangular-9999` — read `session: \`pangular-${p}\`` and `info` spreading the state (`control.mjs:1647,2379-2382`)
- current: tool names are given without the `pangular_` prefix — read `short()` used on every tool name (`control.mjs:888,1939,2194`)
- current: action tools need `call … --confirm` (and `up --allow-actions`) — read `return ACTION_TOOLS.includes(short(name)) && !confirm` (`control.mjs:536`)
- current: the feature entry contract (H1 + `Sub-features`, `How to get to it (user POV)`, `Driving it …` starting with `Preconditions:`, `Gotchas`) — read setup, live-inspection, navigation, source-scan, panel; each follows it
- unverifiable: "the overlay reports about 250 ms after change detection, so read after the end state is visible" — needs a live overlay
- unverifiable: "Portal data is random per API start: assert on structure … not values" — needs the API and portal running
- unverifiable: "Setup claims (install, remove) are proven against git … saved next to the command output" — needs an install/remove run in the portal

## .commandcode/skills/control-pangular-inspector/features/live-inspection.md

- current: MCP over HTTP at `http://localhost:9999/__mcp` — read the state's `mcpUrl` (`control.mjs:1644`)
- current: `components` / `list-components` "on versions after 0.0.7" — read the `list-components` lookup and the `component-tree` fallback for 0.0.7 (`control.mjs:2250-2275`)
- current: `components --depth 3 --out …` flags exist — read the `components` options (`control.mjs:2279-2296`)
- current: `window.__pangularPageId` is the id `list-pages` must show — read the doctor comparing `page.pageId` against the `list-pages` text (`control.mjs:2154,2191-2214`)
- unverifiable: the tree `AppComponent <ng-journal-root>`, `SidebarComponent <ng-journal-sidebar>`, `ListComponent <ng-journal-list>`, `HeaderComponent`, `Table <p-table>` — partially confirmed statically (`scan get-components --root apps/insurance-portal` returns AppComponent/`ng-journal-root` and SidebarComponent/`ng-journal-sidebar`), but the live tree needs the portal plus the devtools server
- unverifiable: `inspect-component` → `ListComponent`, path `ng-journal-root > ng-journal-list` — needs a live read
- unverifiable: `inspect-signals` → a `template` node `ng-journal-list` and a `computed` node `contracts` — needs a live read
- unverifiable: `inspect-providers` → an element injector `ng-journal-list` with its `lookupPath` — needs a live read

## .commandcode/skills/control-pangular-inspector/features/navigation.md

Portal paths below are relative to the portal checkout (`apps/insurance-portal/src/app/`, `libs/…`); `control.mjs` is this skill's script.

- current: the drive returns `http://localhost:4507/contract/list` — the app port is 4507 for the default portal folder (computed slot 7 of `4500 + slot`) and `/contract/list` is a real route (`libs/contract/routes/src/lib/routes.ts:9`), though the click itself was not driven (`control-angular-dev-app/scripts/control.mjs:185`)
- current: the sidebar filter text `CONTRACT` is upper-cased by the `capitalize` pipe, and the entries are `div`s — read `{{ config.domain | capitalize }}` and `<div [routerLink]>` (`sidebar.component.ts:38,46`)
- unverifiable: `explain-navigation` with trigger `imperative`, `from /home`, `started by RouterLink div "List"`, lazy `contract`, `list` — needs the portal, the devtools server and a driven click
- unverifiable: the outcome vocabulary `succeeded`, `cancelled`, `redirected`, `failed`, `skipped`, `pending` — tool output lives in the package; needs a server
- unverifiable: `list-routes` "12 routes, measured" and `lint-routes` "one `info` finding, `missing-title`" — needs a live MCP read
- unverifiable: "`limit` defaults to 5 (at most 50)" and "the page keeps `limits.navigations` (50) entries" — needs the package/live page
- unverifiable: "a reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list"; "`started by` appears only when the click came less than 2 s before" — need a driven page

## .commandcode/skills/control-pangular-inspector/features/panel.md

- current: the panel is at `http://localhost:4507/__pangular/` through the `ng serve` proxy — ran `check --json`: `proxy-config … apps/insurance-portal/proxy.conf.json`, `proxy-target … http://localhost:9999`; the portal's `apps/insurance-portal/proxy.conf.json:2-7` rewrites `^/__pangular` away, and the app port is 4507
- current: the panel session is `pangular-9999` — read `session: \`pangular-${p}\`` (`control.mjs:1647`)
- current: `Angular 22.2.2` is the portal's version — ran `scan build-meta` → `"angularVersion": "22.2.2"`, and `node_modules/@angular/core` in the portal checkout is 22.2.2
- current: "The dashboard's source counts are 0 in this Nx workspace" — ran `scan get-components` at the workspace root → `[]`
- unverifiable: the panel title `Pangular Inspector`, the eight tab names, `LIVE`, `Agent`/`Read-only`, and the floating button's accessible name `Toggle Pangular Inspector` — need the panel open in a browser
- unverifiable: "the doctor has answered the one-time-code prompt in this session" — needs the server and a browser session
- unverifiable: "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" — needs the running devtools server

## .commandcode/skills/control-pangular-inspector/features/setup.md

- current: `setup.check` is "six read-only facts, one line each" — ran `check --json` → six checks (`declared-exact`, `installed`, `overlay-import`, `dev-guard`, `proxy-config`, `proxy-target`) (`control.mjs:844-875`)
- current: "`node $S check` -> six `[OK]` lines, exit 0" — ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check` → exit 0, all six `pass`
- current: the pin is exact in `devDependencies` — ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)`
- current: `remove` restores the managed files from git `HEAD`, deletes untracked ones, prunes `node_modules` and is `ok` only when the tree is clean — read `git checkout HEAD --`, `rmSync` for untracked, `npm install`, `ok: left.length === 0 && !diff` (`control.mjs:1492-1531`)
- current: "Remove: … `gitStatus: []`, `gitDiffStat: ""`" matches the fields the command prints — read `gitStatus: left`, `gitDiffStat: diff` and the exit condition `left.length === 0 && !diff ? 0 : 1` (`control.mjs:1527-1541`)
- stale: "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" — asserted at `setup.md:31`, contradicted by `package.json:53` in that checkout (`"@pangular-inspector/devtools": "0.0.7"`): `git -C <portal> log --oneline -S'@pangular-inspector'` prints `f102b97 build(insurance-portal): add Pangular Inspector for development`, an ancestor of HEAD (`git merge-base --is-ancestor f102b97 HEAD` exit 0) whose stat touches `package.json`, `package-lock.json` (457 insertions), `main.ts`, `project.json`, `proxy.conf.json`
- unverifiable: "`install --json` -> `changed` lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json`" and "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" as a live run — needs an install in a clean worktree (the 457 count does match the committed `f102b97` stat)
- unverifiable: "`npm exec -- nx run insurance-portal:typecheck` exits 0 with the overlay import" — needs an Nx run in the portal

## .commandcode/skills/control-pangular-inspector/features/source-scan.md

- current: "Workspace root: `node $S scan get-components` -> `[]`" — ran it → `"text":"[]"`, exit 0
- current: "App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`, `PageNotFoundComponent`, `SidebarComponent`" — ran it → exactly those four, exit 0
- current: that run's stderr warning that the folder "has no `angular.json` … so the source scans find nothing" — ran it → `[pangular] … has no angular.json and no package.json that depends on @angular/core, so the source scans find nothing`
- current: "`build-meta` -> Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`, `ssr: false`" — ran `node $S scan build-meta` → `{"angularVersion":"22.2.2","projectName":"@ng-journal/source","typescript":"6.0.3","ssr":false,…}`
- current: `scan <tool>` starts the stdio server, calls one tool and stops it — ran three `scan` invocations, each exited 0
- current: the stdio tool list holds `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`, `explain-render-mode`, `lint-pipes`, `explain-pipe` and the `analog-*` tools, and `scan nope` prints it — ran `node $S scan nope` → `no source tool nope; stdio has: get-routes, get-components, get-pipes, get-signals, get-providers, get-ngrx-store, build-meta, explain-render-mode, lint-pipes, explain-pipe, analog-routes, analog-explain-url, analog-server-functions, analog-api-routes, analog-render-modes, analog-prerender-plan, analog-content, analog-lint, devframe_state_read` (exit 2)
- current: results with `--out` land in `tmp/control-pangular-inspector/scan/` — read `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` (`control.mjs:2375`)
- unverifiable: "The stdio server lists no page tools (`inspect-*`, `list-pages`)" — needs a `tools/list` against the stdio server (the `scan` command reads only the usage list)
- unverifiable: "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" — needs the CLI's scanning code, which is in the installed package, not this repository

## .commandcode/skills/control-vitest-browser-angular/SKILL.md

- current: the default attach instance is `chrome-beta-gemma4` and control-ai-browsers owns its CDP port — read `.commandcode/skills/control-ai-browsers/instances.json`: `chrome-beta-gemma4` exists with `"port": 9334`
- current: bundled mode uses Playwright's Chromium (Chrome for Testing 153) — read `spikes/ng222-app/node_modules/playwright-core/browsers.json` → chromium `"browserVersion": "153.0.8010.12"` (playwright 1.63.0)
- current: main-checkout ports Vitest 51315 and bundled CDP 9350; a worktree takes `51400 + slot` / `9500 + slot`, apart from 9420-9499 — read `MAIN_VITEST_PORT`, `MAIN_BUNDLED_CDP_PORT` and the two `at:` formulas (`control.mjs:151-177`)
- current: `up` tries 10 slots — read `SLOT_TRIES = 10` (`control.mjs:341`)
- current: the session is `control-vitest-<flowId>-<Vitest port>` — read `session: \`control-vitest-${flowId}-${vitestPort}\`` (`control.mjs:1297`)
- current: underneath it runs `ng test -c attach --watch` (`-c extension` for bundled) through `control.mjs __serve` — read `testArgs` (`control.mjs:828-842`)
- current: the binary is `spikes/ng222-app/node_modules/@angular/cli/bin/ng.js` — the file exists
- current: the doctor's checks are `map-fresh`, `process-alive`, `tree`, `ports`, `test-run`, `browser-cdp`, `orchestrator-tab`, `tester-frame`, `dev-build`, `vitest-runner`, `mounted-component`, `language-model`, `extension-loaded` — read the doctor body (`control.mjs:1551-1708`)
- current: `up` takes `--instance`, `--bundled`, `--extension`, `--hold`, `--timing-demo`, `--filter`, `--port`, `--timeout` (default 180 s) — read the usage line and option parsing (`control.mjs:236-237,1874`)
- current: the state file is `tmp/control-vitest-browser-angular/state/<flowId>.json` and evidence `<flowId>-<timestamp>/` — read `SCRATCH`, `STATE_DIR`, `evidenceDir` (`control.mjs:117-118,1285`)
- current: attach mode loads the extension with `Extensions.loadUnpacked`; bundled mode passes `--load-extension` — read the CDP call (`control.mjs:1349`) and `vitest-extension.config.mts`
- current: `vitest-base.config.mts` sets the browser port from a plugin on the project that has `test.name`, because `test.api` at the root would also start the API server on that port — read `VITEST_BROWSER_PORT` default 51315, the `config.test?.browser?.enabled || !config.test.name` guard and the `test: { api: { … strictPort: true } }` return (`vitest-base.config.mts:7,13-18`)
- current: `vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]` — read `this.persistentContext ??= this.browser.contexts()[0];` (`vitest-attach.config.mts:20`)
- current: shared code is `spikes/probes/vitest-lib.mjs` — the file exists
- stale: "Every other script has a `node:test` file beside it (`*.test.mjs`)" — asserted at `SKILL.md:221`, contradicted by `.commandcode/skills/control-vitest-browser-angular/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`)
- unverifiable: the ready-time measurements (5.2 s, 19.3 s, 9.9 s, 4.4 s, 21.6 s) — need runs
- unverifiable: "`window.ng`: 23 functions" in the tester iframe — needs a run
- unverifiable: "`LanguageModel` in attach mode (Gemma 4 answered a prompt from the tester iframe)" — needs the model and a browser
- unverifiable: "a DevTools panel reaches the tester iframe with `chrome.devtools.inspectedWindow.eval(expr, { frameURL })`" — needs a loaded extension and a DevTools session
- unverifiable: "Chrome 137+ branded builds ignore `--load-extension`" — needs a branded browser
- unverifiable: the 250 ms exit wait against the Node-on-Windows fetch assertion (exit 127) — needs a run

## .commandcode/skills/control-vitest-browser-angular/features/README.md

- current: "`node $S up --hold 90000`, then `node $S doctor` exits 0" by exit-code contract — read the `up` usage and `--hold` parsing, and the doctor's `0 / 1` return (`control.mjs:1874,236,1712`)
- current: `mounted-component` passes only while the hold test runs and `[WARN]`s otherwise — read `page.host ? 'pass' : 'warn'` with "no test is running (start with --hold …)" (`control.mjs:1676-1682`)
- current: the held Counter's fresh state is `Clicks: 3 (double 6, cart 2)` with `CartService` overridden to `['pear', 'plum']` — read the spec's hold test (`setup({ cartItems: ['pear', 'plum'] })`) and `count = signal(3)` (`spikes/ng222-app/src/app/counter.spec.ts:61`, `spikes/ng222-app/src/app/counter.ts:26`)
- current: never attach to a browser outside `control-ai-browsers/instances.json` — that file exists and lists the instances
- current: `ui: false` in both runner configs — read `ui: false` in `vitest-attach.config.mts` and `vitest-extension.config.mts`
- current: the feature entry contract (H1 + the four H2s in order) — read `counter-tests.md` and `extension-in-tester.md`; both follow it
- current: a re-run is a `touch` of the spec and a `RERUN` line in `ng-test.log` — an archived run logs `RERUN  src/app/counter.spec.ts x1` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:48`)
- unverifiable: "The verdict, the baseline in a second worktree and the repeat runs come from /lars-verify" — that is another tool's procedure, not checkable here
- unverifiable: "one browser instance at a time … a baseline (in its worktree, with its own derived Vitest port) and its change run one after the other" — needs runs
- unverifiable: the `f1e4` snapshot refs and `page.frame('vitest-iframe')` reads — need a driven run
- unverifiable: "The Angular DevTools extension: not loaded into these browsers" — needs a run to list the profile's extensions

## .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

Spec paths below are `spikes/ng222-app/src/app/counter.spec.ts`.

- current: `counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` — read `import { render } from 'vitest-browser-angular'` and `await render(Counter, …)` (`counter.spec.ts:3,12`)
- current: two tests always run and two more run only when their env var is set — read two `it(…)` and two `it.runIf(…)` (`counter.spec.ts:20,30,39,56`)
- current: the timing demo fails with `expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` — an archived timing-demo run logs exactly `AssertionError: expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:20`)
- current: the hold test keeps the Counter mounted for `VITE_COUNTER_HOLD_MS` — read `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)(…, Number(…)+30_000)` (`counter.spec.ts:56-75`)
- current: failure screenshots land under `spikes/ng222-app/.vitest/attachments/failure-screenshots/` — the folder exists with `counter.spec.ts/Counter---shows-the-next-count-in-the-same-task-as-the-click--fails-on-purpose-.png`
- current: "No run recorded (`node $S info` exits 2 with "no state file")" — ran `node …/control.mjs info` → exit 2, `"reason": "no state file in …: nothing was started by this skill (run up first)"`
- stale: `tests-pass` "the two default tests pass (`Tests 2 passed | 2 skipped (4)` without flags)" and "`test-run` reports `last summary: Tests  2 passed | 2 skipped (4)`" — asserted at `counter-tests.md:11,29`, contradicted by the second spec the same builder config picks up: `spikes/ng222-app/src/app/stale-view-fixture.spec.ts:1-4` (`describe('StaleViewFixture'`), which the newest attach-mode run reports as `Tests 2 failed | 2 passed | 2 skipped (6)` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-11-13T01-16-58-757Z/ng-test.log:77`)
- unverifiable: "`test-run` passes on a failing test on purpose: it checks the run, not the results" as a live observation — the code agrees (`testRunCheck` passes on `RUN_STARTED` without "An exception occurred", `control.mjs:727-745`), but the log evidence needs a run
- unverifiable: "`up --hold <ms> --filter "keeps the counter mounted"` … without `--hold` the same filter reports `4 skipped (4)`" — needs a run (and the count would now include the second spec)

## .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

- current: "`node $S up --extension extension --hold 90000` (the repository's `extension/`)" — `extension/` exists with `manifest.json`, and both flags are accepted (`control.mjs:1874`)
- current: `ext-loaded` is the doctor's `extension-loaded`, which passes when the extension's service worker target exists — read the check (`control.mjs:1695-1708`)
- current: `[SKIP]` without `--extension` — read `add('extension-loaded', 'skip', 'no --extension given to up')` (`control.mjs:1708`)
- current: in attach mode `down` uninstalls the extension and notes `uninstalled extension <id>` — read `Extensions.uninstall` and `notes.push(\`uninstalled extension ${state.extension.id}\`)` (`control.mjs:1791-1792`)
- unverifiable: "`LanguageModel` is `available` in the tester iframe (attach mode) and not in bundled mode" — needs Chrome Beta with the model plus a run
- unverifiable: "The repository's `extension/` does not inject there (measured 2026-11-12: no execution context from its origin in the tester iframe)" — its manifest matches `<all_urls>` (`extension/manifest.json` content_scripts), so only a run can show the absence

## Counts

| Verdict | Claims |
| --- | --- |
| current | 137 |
| stale | 6 |
| unverifiable | 72 |
| **total** | **215** |
