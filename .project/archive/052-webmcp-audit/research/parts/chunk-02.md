# Chunk 2 — the browser-driver skill maps (Angular DevTools, Pangular Inspector, Vitest Browser Mode) plus the portal and SSR fixtures of `control-angular-dev-app`
Audited HEAD: 067dc23ced80abcc535166297084626755f438e4

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
Portal paths below are relative to `apps/insurance-portal/src/app/` in the portal checkout; `control.mjs` is this skill's script.
| `/` redirects to `/home`, which shows four domain tiles | feature | verified | read the portal checkout: `path: ''` has `redirectTo: 'home'`, `path: 'home'` loads `HomeComponent` (`app.routes.ts:5-12`), and the component renders `<a routerLink="/contract/list">` … Contracts/Claims/Complaints/Customers (`home.component.ts:16-53`) — `portal-navigation.md:4,11` |
| each home tile is a real link to `/<domain>/list` | feature | verified | read `<a routerLink="/contract/list">`, `/claim/list`, `/complaint/list`, `/customer/list` (`home.component.ts:16,26,37,49`) |
| sidebar has `List` and `Create` per domain, `List` only for Customer, plus a `Home` entry | feature | verified | read `routes: [listMetaData, createMetaData]` for contract/claim/complaint and `routes: [listMetaData]` for customer, General → Home (`sidebar.component.ts:76-101`) |
| sidebar entries are a `div` with `routerLink`, not a link | feature | verified | read `<div [routerLink]=… [routerLinkActive]=…>` (`sidebar.component.ts:46-65`) |
| only the group headings are upper-cased, through the `capitalize` pipe, which calls `toUpperCase` | feature | verified | read `{{ config.domain \| capitalize }}` (`sidebar.component.ts:38`) and `return value.toUpperCase();` (`libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9`) |
| unknown paths render `Page Not Found` and "Sorry, but the page you were trying to view does not exist." | structure | verified | read `<h1>Page Not Found</h1>` / `<p>Sorry, but the page you were trying to view does not exist.</p>` (`page-not-found.component.ts:7-8`) reachable through the `path: '**'` route (`app.routes.ts:32-36`) |
| the domain routes carry `canMatch` feature-flag guards | config | verified | read `canMatch: [featureFlagGuard('contract-list')]` (`libs/contract/routes/src/lib/routes.ts:10,16,22,28`) |
| the contract route list is `/contract/list`, `/contract/create`, `/contract/:id/edit`, `/contract/:id/details` | structure | verified | read `path: 'list' \| 'create' \| ':id/edit' \| ':id/details'` under `path: 'contract'` (`app.routes.ts:13-17`, `libs/contract/routes/src/lib/routes.ts:9,15,21,27`) |
| the header link is `https://www.ng-journal.com` and the shell is `<ng-journal-root>` | integration | verified | read `href="https://www.ng-journal.com"`, `selector: 'ng-journal-root'` (`app.component.ts:9,20`) |
| the recipes use `node $S up --target portal` / `doctor --target portal` | command | verified | the `portal` target and its doctor exit codes exist (`control.mjs:178-220,1898-1910`) |
| `snapshot --filename=home.yml` shows `heading "Home" [level=1]` and the tile/link roles | structure | unverifiable | needs the portal served (API 3000 + app 4507) and a playwright-cli snapshot |
| the sidebar role/name queries (`getByRole('navigation')…filter({hasText:'CLAIM'})`) and the resulting `/claim/create` URL | feature | unverifiable | needs a driven browser session |
| `__ngc.router()` holds the four contract routes after a visit, and `doctor` exits 0 leaving the page on `/home` | command | unverifiable | needs a running app and the skill's own session |
| the last node of a snapshot is the overlay's `button "Toggle Pangular Inspector"` | feature | unverifiable | needs the running page; the button lives in `@pangular-inspector/devtools`, outside this repository |
| "every flag is on" (so the feature-flag fall-through is not driven) | config | unverifiable | needs the running app's flag values |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
Portal paths below are in the zoneful worktree named above; `control.mjs` is this skill's script.
| the zoneful worktree exists at that path and is an isolated git worktree | structure | verified | read `.git` there is a 151-byte file `gitdir: …/worktrees/HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful`, and `git worktree list` shows it `9767523 (detached HEAD)` — `portal-zoneful-worktree.md:6-9,12-14` |
| the pin `git -C <path> rev-parse HEAD` prints `976752389c22bb563d2278c2d78f423cb2505669` | config | verified | ran `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful rev-parse HEAD` → `976752389c22bb563d2278c2d78f423cb2505669` |
| Angular 20.3.35 installed while `package.json` asks `@angular/core ^20.3.29` | structure | verified | read `"@angular/core": "^20.3.29"` and `node_modules/@angular/core/package.json` `"version": "20.3.35"` (`package.json:12` in the worktree) |
| `zone.js ^0.16.2` installed | feature | verified | read `"zone.js": "^0.16.2"` and installed `0.16.3` (satisfies the range) (`package.json:28` in the worktree) |
| the build polyfills `["zone.js"]` | feature | verified | read `"polyfills": ["zone.js"],` (`apps/insurance-portal/project.json:16` in the worktree) |
| `apps/insurance-portal/src/app/app.config.ts` names no change-detection provider | config | verified | read the file: no `changeDetection`, `provideZoneChangeDetection` or `provideZonelessChangeDetection` line |
| the derived app port is 4509 (slot 9, `4500 + slot`) | config | verified | ran the script's own hash formula (`slotOf`: sha1 of the lower-cased folder, 1-99) over the worktree path → slot 9 → 4509 (`control.mjs:185,294-304`) |
| the API is on the fixed 3000 | integration | verified | read `PORTAL_API_PORT = 3000` and the `api` port row `kind: 'fixed'` (`control.mjs:101,187-192`) |
| the `change-detection-mode` line reads `zone-based (NgZone provider: NgZone); zone.js loaded; mark_feature_usage: …`, and a `useClass: NoopNgZone` record reads `zoneless` | feature | verified | read `cdMode` (NoopNgZone → `zoneless`, other → `zone-based`) and the doctor's detail string (`control.mjs:624-629,1862-1865`) |
| the last `NgZone` provider record is the app's, which is why the doctor reads the last one | feature | verified | read `records.findLast((r) => r.token?.name === 'NgZone')` and its `useFactory → 'NgZone'` fallback (`ng-inspect.js:128-138`) |
| the record list has `ChangeDetectionScheduler` `useExisting ChangeDetectionSchedulerImpl`, an `NgZone` `useClass fn:NoopNgZone`, then the `NgZone` `useFactory fn:ngZoneFactory` beside `NgZoneChangeDetectionScheduler` and `ZoneStablePendingTask` | feature | verified | read the capture `research/raw/zone-mode-portal-zonejs.json` (environment injector `zoneRecords`), which shows exactly that order |
| `info --json` prints `slot` and `ports` naming the app port as derived and the API as fixed | command | verified | read `info()` spreading the recorded state and the port rows (`control.mjs:1913-1917,181-200`) |
| `--dir` (or `CONTROL_NG_PORTAL_DIR`) selects which checkout is served | structure | verified | read `const dirFlag = flag('dir')` and `dir: process.env['CONTROL_NG_PORTAL_DIR'] \|\| PORTAL_DEFAULT_DIR` (`control.mjs:1477,179,1984`) |
| the `up --target portal --dir <path>` run's own header line `> nx run insurance-portal:serve:development --port=4509` in `<evidenceDir>/app.log` | command | unverifiable | needs the portal started (nothing was started) |
| `doctor` exits 0 and prints the `angular-root` line with 20.3.35 | command | unverifiable | needs the served portal, the API on 3000 and a browser |
| `__ngc.injectors(...)` / `__ngc.providers(..., <i>)` on the running page print that record list | integration | unverifiable | needs a live page (`__ngc` installed by a session) |
| the 2026-11-08 behavioural capture (zone-hosted `setTimeout` ticked `applicationRef._tick` 2×, `Zone.root` 0×) | config | unverifiable | it is recorded in `features/.proven.json`, but re-taking it needs a browser and the app |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
Fixture paths below are `spikes/ng222-ssr/src/app/` unless named otherwise; `control.mjs` is this skill's script.
| the SSR fixture is served at `http://localhost:4223/` | integration | verified | read the `ssr` target's slot-0 port (`slot === 0 ? 4223 : 4400 + slot`) (`control.mjs:156-165`) |
| `ssr-check.js` lives at `.commandcode/skills/control-angular-dev-app/scripts/ssr-check.js` | structure | verified | the file exists |
| six checks named `server-html-ngh`, `server-html-transfer-state`, `dev-build-after-hydration`, `hydration-counters`, `no-mismatch-on-default-route`, `expected-mismatch-detected`, `ok` true only when all six pass | config | verified | read the results table and `ok: checks.every((c) => c.status === 'pass')` (`ssr-check.js:114-159`) |
| `ssr-check.js` returns `ok: false` without throwing | structure | verified | read the return object; no throw path after the checks (`ssr-check.js:158-163`) |
| `/api/items` is fetched during the server render and the server logs `[api] GET /api/items` with the user agent | integration | verified | read `app.get('/api/items', …)` and `console.log(\`[api] GET /api/items … ua=${req.headers['user-agent']}\`)` (`spikes/ng222-ssr/src/server.ts:18-19`) |
| `?mismatch=1` is a structural mismatch and `?mismatch=text` a text-only one | feature | verified | read the fixture comments and template (`mismatch.ts:3-8`) |
| `?transfer=0` turns the HTTP transfer cache off | feature | verified | read `transferCache: this.transfer() !== '0'` (`data-list.ts:22`) |
| the three routes and their render modes (`/` ssr, `/prerender`, `/client`) with nav links `Server route`/`Prerender route`/`Client route` and a `Render mode: …` heading | structure | verified | read `app.routes.server.ts:4-6` (`Server`/`Prerender`/`Client`), `app.routes.ts:5-7`, `app.html:2-4`, `page.ts:11` |
| the page holds an `Early click` button with its count and a `@defer (hydrate on interaction)` block with a `Deferred click` button | structure | verified | read `<button …>Early click</button>`, `Early clicks: {{ clicks() }}`, `@defer (hydrate on interaction)`, `<button …>Deferred click</button>` (`page.ts:11-21`, `deferred.ts:6-7`) |
| the server HTML carries `ngh` attributes, `<!--nghm-->`, `<script id="ng-state">`, the event-dispatch script and `ng-server-context="ssr"` | feature | unverifiable | needs the SSR app started (`up --target ssr`) and a `page.request.get` |
| hydration counters (`hydratedComponents` 4, `hydratedNodes` 40, no other status) and the `ngh`-attribute removal | feature | unverifiable | needs a browser run of the probe |
| `window._ejsas.ng.q` queues an early click and `Early clicks: 1` after hydration | feature | unverifiable | needs `ssr-event-replay.js` run against a browser |
| the defer block's states (`initial`/`dehydrated` → `complete`/`hydrated`, triggers `["hydrate on interaction", "on idle"]`) and `Deferred clicks: 1` | feature | unverifiable | needs a driven page |
| `/client` is the bare shell with `<body ngcm>` | feature | unverifiable | needs `ssr-render-modes.js` run against the served app |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` and the commands are `install\|uninstall\|status\|up\|doctor\|attach\|panel\|coexist\|info\|down` | structure | verified | read the `COMMANDS` map and `HELP` (`control.mjs:2236-2257`) |
| the extension id is `ienfalfjdbdpebioblfackkekamfmbnh` and the store page is `https://chromewebstore.google.com/detail/<id>` | integration | verified | read `EXT_ID` and `STORE_URL` (`control.mjs:108-110`) |
| supported browsers are `chrome`, `chrome-beta`, `edge`, `edge-dev` plus `test` | feature | verified | read `BROWSER_VALUES` and `BROWSERS` (`control.mjs:122-143,159`) |
| "Chrome for Testing 156.0.8078.4, revision 1248, read from `node_modules/playwright-core/browsers.json`" | structure | verified | read that file: chromium `"revision": "1248"`, `"browserVersion": "156.0.8078.4"` |
| main checkout session `ngdt`, CDP 9420; worktree session `ngdt-wt-<hash>`, CDP `9420 + slot` in 9421-9499 (slot 1-79) | feature | verified | read `flowIdOf` (`wt-<sha1[:6]>`), `SESSION`, `MAIN_CDP_PORT`, `slotOfFlow` (`control.mjs:323-343,377`) |
| `up` tries 10 slots in all | feature | verified | read `SLOT_TRIES = 10` (`control.mjs:332`) |
| profile `tmp/control-angular-devtools/profile/main`, config `tmp/control-angular-devtools/state/<flow>.cli.config.json` | command | verified | read `TMP`, `PROFILE`, `configPath` (`control.mjs:113,379,1610`) |
| the doctor prints `map-fresh`, `process`, `tree`, `ports`, `extension`, `app`, `connected-flag`, `devtools-window` | config | verified | read the doctor (`control.mjs:1789-1872`) |
| `install` copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\` | config | verified | that folder exists with `1.22.0_0` and `1.22.1_0` (newest 1.22.1) |
| the `--config`/`launchOptions` schema is playwright-cli 0.1.21's | command | verified | ran `playwright-cli --version` → `0.1.21` |
| evidence goes to `tmp/control-angular-devtools/evidence/<yyyymmdd-hhmmss>/` | feature | verified | read `evidenceStamp`/`evidenceDir` (`control.mjs:1555-1559,1608`) and the existing folders (`20261107-211420`, `20261112-165527`) |
| the panel is driven with `Extensions.extensionServer.onShowPanel({command:'showPanel', …})` on the `devtools://devtools/bundled/devtools_app.html` target and read with `Runtime.evaluate` | command | verified | read those three call sites (`control.mjs:1097,1134,1087`) |
| `coexist` takes `[--component C] [--click "<locator>"] [--di-graph]` and defaults to `app-counter` / `getByRole('button', { name: 'Increment' })` | structure | verified | read `HELP` and `BOOL_FLAGS` (`control.mjs:157,2243`) |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:198`, contradicted by `.commandcode/skills/control-angular-devtools/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| ready "when the CDP port lists the extension's `service_worker` target", measured 2.9-8 s | config | unverifiable | needs the harness started |
| the copy keeps `_metadata/` and loads with 0 manifest errors/warnings; the manifest's `key` keeps the store ID | config | unverifiable | needs loading the unpacked copy in a browser |
| "measured 2026-10-16 in the `verification-skills` worktree (`wt-423ece`, slot 10): a throwaway listener on 9430 moved the run to 9431" | feature | unverifiable | needs a run |
| `--auto-open-devtools-for-tabs` opens the DevTools window on Lars's desktop; the panel handles read from the live panel 1.22.1 (tab names, `.node-name`, `aria-label` `Start recording`) | feature | unverifiable | needs a desktop session and the live panel |
| opening `chrome-extension://<id>/index.html` in a tab fails with `TypeError: Cannot read properties of undefined (reading 'inspectedWindow')`, and `connectOverCDP` lists the extension frames with empty URLs | feature | unverifiable | needs a browser |
| `coexist` passes when the removed subscriber stops counting and DevTools recorded the cycles; `--di-graph` removes the template node from both | feature | unverifiable | needs the harness and the panel |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` | structure | verified | the file exists |
| the counter fixture is `spikes/ng222-app` at Angular 22.2.2 | feature | verified | read `spikes/ng222-app/node_modules/@angular/core/package.json` → `"version": "22.2.2"` |
| `control-angular-dev-app up --target counter` serves it and its `info` prints the URL | command | verified | read the `counter` target and `info()` spreading the state (`control-angular-dev-app/scripts/control.mjs:114-134,1913-1917`) |
| the harness commands are `node $S install`, `node $S up --app-url=<url>`, `node $S doctor`, `node $S status --browser <name>` | feature | verified | read `HELP`/`COMMANDS` (`control.mjs:2236-2257`) |
| the app page is driven in session `ngdt` | feature | verified | read `SESSION` (`control.mjs:377`) |
| the harness is headed | feature | verified | read `headless: false` in the launch options (`control.mjs:1636`) |
| evidence stays in `tmp/control-angular-devtools/evidence/`, git-ignored | feature | verified | read `.gitignore:7` (`tmp/control-angular-devtools/`) |
| the feature entry contract (H1, one paragraph, then `Sub-features`, `How to get to it (user POV)`, `Driving it with …`, `Gotchas`) | structure | verified | read the four feature files; each has those four H2s in that order |
| the full-sweep order install → attach → signal-graph → profiler matches the four feature files on disk | structure | verified | read the links and the folder listing |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | structure | unverifiable | that file is Angular DevTools source, not in this repository |
| "the scripted path uses DevTools frontend internals proven only in the test harness" and the manual-only Web Store confirmations | structure | unverifiable | need a browser and a person |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the connected marker is `window.__NG_DEVTOOLS_CONNECTED__` and the doctor reports it as `connected-flag` | config | verified | read the page probe and the check (`control.mjs:1854,1862-1866`) |
| `node $S attach` is a command | command | verified | read `COMMANDS.attach` (`control.mjs:2252`) |
| `attach` requires `isDebugMode` and otherwise exits 1 | command | verified | read `attachOk` returning `!!(r.flag && d.isAngular && d.isDebugMode && r.backendInstalled && r.backendReady)` (`control.mjs:1882-1892`) |
| the measured result `flag true (set at ~50 ms); detection {…}; backendInstalled true; backendReady at ~950 ms; Angular 22.2.2` | config | unverifiable | needs the harness up on the counter fixture |
| `isSupportedAngularVersion` means major 12+ or 0 | feature | unverifiable | that rule lives in the DevTools bundle, not this repository |
| the content script gates on `isAngularDevTools`, `isAngular` and an HTML document, and the popup shows `production.html` (built 1.22.0 `app/content_script_bundle.js`) | structure | unverifiable | that bundle is inside the Edge Dev profile, outside this repository |
| the toolbar icon turns from grey to colour | feature | unverifiable | browser UI |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the store page is `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh` | integration | verified | read `STORE_URL` (`control.mjs:110`) |
| the commands and flags are `install [--browser …] [--from …] [--profile P] [--timeout S]`, `uninstall`, `status` | command | verified | read `HELP` (`control.mjs:2237-2239`) |
| a test `uninstall` refuses while `up` runs | feature | verified | read `refuse('the test browser is up; run "down" first')` (`control.mjs:1520`) |
| the end-state doctor line is `extension: Angular DevTools <version> ENABLED (UNPACKED, …)`, and the newest folder in the Edge Dev profile is 1.22.1 | config | verified | read the doctor detail format (`control.mjs:1844-1849`) and the profile folders `1.22.0_0`, `1.22.1_0` |
| branded `status` reads installed state, version and `disable_reasons` from `<User Data>\<profile>\Extensions\<id>` and `Secure Preferences` → `extensions.settings.<id>` | config | verified | read the status reader (`control.mjs:1298-1314,1548`) |
| "Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured: install exit 0 …)" | command | unverifiable | needs Lars clicking the store's add/remove confirmations |
| "`chrome://` and `edge://` URLs passed on the command line open an empty window" | command | unverifiable | needs a branded browser |
| the extensions page toggle/Remove behaviour and "the extensions page is the authority" | feature | unverifiable | browser UI |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `node $S coexist` exists and defaults to `app-counter` with `getByRole('button', { name: 'Increment' })` | structure | verified | read `HELP` (`control.mjs:2243`) |
| `ɵsetProfiler` keeps a list of subscribers in Angular 22 and `ɵsetProfiler(null)` clears every one, while `ɵsetProfiler(cb)` returns a remover | feature | verified | read the installed Angular: `const profilerCallbacks = []`, `removeProfiler`, and `profilerCallbacks.length = 0` for `null` (`spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:136-154`) |
| the measured result `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles` | feature | unverifiable | needs the harness up with the panel recording |
| "DevTools' subscriber cannot be listed from the page (the list is module-private)" | feature | unverifiable | needs a live page |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `node $S panel signal-graph --component=app-counter` and `node $S panel screenshot` exist | structure | verified | read the panel subcommands (`control.mjs:1926,2242`) |
| the pane's nodes are `ng-signal-graph-pane .node-cont.kind-*` | feature | verified | read the `readSignalGraph` evaluate (`control.mjs:1165`) |
| the expected fixture graph `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`, and after `angular:di_graph` the pane `signal:count, effect:Effect` | feature | unverifiable | needs the live panel |
| the extra kinds `linked-signal`, `child-signal-prop`, `resource`, `unknown` | feature | unverifiable | they come from the extension's `signals-visualizer` source, not this repository (the string `child-signal-prop` appears nowhere in `control.mjs`) |
| "the pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second read" | feature | unverifiable | the doc itself marks it inferred; needs a run |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the MCP endpoint is `http://localhost:9999/__mcp` | integration | verified | read `mcpUrl: \`http://localhost:${p}/__mcp\`` (`control.mjs:1644`) |
| the portal is the standalone flow, reached through `/__pangular/` with target 9999 | feature | verified | ran `node …/control.mjs check --json` → `"mount": "standalone-cli"`, `proxy-target … "/__pangular -> http://localhost:9999"` |
| the pin is 0.0.7, declared exactly and installed | config | verified | ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)`, `installed … node_modules has 0.0.7`; pin constant at `control.mjs:103` |
| the doctor's checks are `map-fresh`, `package-pinned`, `overlay-import`, `process-alive`, `tree`, `ports`, `mcp-origin-guard`, `mcp-initialize`, `read-only`, `browser-session`, `auth-code`, `dev-build`, `overlay-page-id`, `overlay-connected`, `console-errors` | config | verified | read the doctor body (`control.mjs:2009-2220`) |
| `mcp-origin-guard` passes when a POST without `Origin` gets 403 | feature | verified | read `noOrigin.httpStatus === 403 ? 'pass' : 'fail'` (`control.mjs:2061-2065`) |
| `read-only` passes when none of the eight action tools is listed | feature | verified | read `ACTION_TOOLS` (highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api) and `readOnlyCheck` (`control.mjs:107-116,887-901`) |
| the server runs `bin.mjs dev --port 9999 --no-open --root <app> --read-only` through `__serve` | command | verified | read the spawn arguments (`control.mjs:1577-1622`) |
| a busy port refuses with `fixed port pangular 9999 held by PID <p>; pinned by …` | config | verified | read the refusal string (`control.mjs:1680`) |
| the state file is `tmp/control-pangular-inspector/state/pangular-<port>.json`, evidence `pangular-<port>-<timestamp>/` with `pangular.log`, session `pangular-<port>` | config | verified | read those paths (`control.mjs:100,1548,1605-1607,1647`) and the existing folders `pangular-9999-2026-11-13T01-12-39-702Z` |
| every feature is recorded as `external` | feature | verified | ran `fingerprint.mjs check` → five `[OK] … external since faa978feed4f`, exit 0 |
| `components` falls back to the `component-tree` resource when 0.0.7 has no `list-components` | structure | verified | read the fallback with the notice "list-components is not in this version" (`control.mjs:2238-2275`) |
| "`…/scripts/control.mjs:74` defaults to 9999" | feature | stale | asserted at `SKILL.md:42`, contradicted by `control.mjs:74` (a `State` typedef line, `@property {string} mcpUrl`); the default is `const DEFAULT_PORT = 9999` at `control.mjs:104` |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:206`, contradicted by `.commandcode/skills/control-pangular-inspector/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| "With `--read-only`, 0.0.7 lists 46 tools" | feature | unverifiable | needs the devtools server started (`node $S tools` needs a live MCP endpoint) |
| "The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it" | integration | unverifiable | needs the server running and a listener check |
| "npm 11.16 drops 27 entries from the committed lockfile on any install" | feature | unverifiable | needs an `npm install` in the portal (a change to the app) |
| "`process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows … (exit 127)" | feature | unverifiable | needs a repro run |
| the measured ready times (2.2 s for MCP `initialize`, 17-20 s for the portal) | feature | unverifiable | need runs |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `S` and `D` name the two control scripts | feature | verified | both files exist |
| "`node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check --json` → `"ok": true`, six checks, exit 0 |
| "`node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | command | verified | read the portal target (API `kind: 'fixed'` 3000, app `4500 + slot`) and computed the default portal folder's slot with the script's own hash → slot 7 → 4507 (`control-angular-dev-app/scripts/control.mjs:185-192,294-304`) |
| the session and evidence come from `node $S info`, session `pangular-9999` | feature | verified | read `session: \`pangular-${p}\`` and `info` spreading the state (`control.mjs:1647,2379-2382`) |
| tool names are given without the `pangular_` prefix | feature | verified | read `short()` used on every tool name (`control.mjs:888,1939,2194`) |
| action tools need `call … --confirm` (and `up --allow-actions`) | feature | verified | read `return ACTION_TOOLS.includes(short(name)) && !confirm` (`control.mjs:536`) |
| the feature entry contract (H1 + `Sub-features`, `How to get to it (user POV)`, `Driving it …` starting with `Preconditions:`, `Gotchas`) | structure | verified | read setup, live-inspection, navigation, source-scan, panel; each follows it |
| "the overlay reports about 250 ms after change detection, so read after the end state is visible" | feature | unverifiable | needs a live overlay |
| "Portal data is random per API start: assert on structure … not values" | integration | unverifiable | needs the API and portal running |
| "Setup claims (install, remove) are proven against git … saved next to the command output" | command | unverifiable | needs an install/remove run in the portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| MCP over HTTP at `http://localhost:9999/__mcp` | integration | verified | read the state's `mcpUrl` (`control.mjs:1644`) |
| `components` / `list-components` "on versions after 0.0.7" | feature | verified | read the `list-components` lookup and the `component-tree` fallback for 0.0.7 (`control.mjs:2250-2275`) |
| `components --depth 3 --out …` flags exist | structure | verified | read the `components` options (`control.mjs:2279-2296`) |
| `window.__pangularPageId` is the id `list-pages` must show | feature | verified | read the doctor comparing `page.pageId` against the `list-pages` text (`control.mjs:2154,2191-2214`) |
| the tree `AppComponent <ng-journal-root>`, `SidebarComponent <ng-journal-sidebar>`, `ListComponent <ng-journal-list>`, `HeaderComponent`, `Table <p-table>` | structure | unverifiable | partially confirmed statically (`scan get-components --root apps/insurance-portal` returns AppComponent/`ng-journal-root` and SidebarComponent/`ng-journal-sidebar`), but the live tree needs the portal plus the devtools server |
| `inspect-component` → `ListComponent`, path `ng-journal-root > ng-journal-list` | structure | unverifiable | needs a live read |
| `inspect-signals` → a `template` node `ng-journal-list` and a `computed` node `contracts` | feature | unverifiable | needs a live read |
| `inspect-providers` → an element injector `ng-journal-list` with its `lookupPath` | feature | unverifiable | needs a live read |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
Portal paths below are relative to the portal checkout (`apps/insurance-portal/src/app/`, `libs/…`); `control.mjs` is this skill's script.
| the drive returns `http://localhost:4507/contract/list` | integration | verified | the app port is 4507 for the default portal folder (computed slot 7 of `4500 + slot`) and `/contract/list` is a real route (`libs/contract/routes/src/lib/routes.ts:9`), though the click itself was not driven (`control-angular-dev-app/scripts/control.mjs:185`) |
| the sidebar filter text `CONTRACT` is upper-cased by the `capitalize` pipe, and the entries are `div`s | feature | verified | read `{{ config.domain \| capitalize }}` and `<div [routerLink]>` (`sidebar.component.ts:38,46`) |
| `explain-navigation` with trigger `imperative`, `from /home`, `started by RouterLink div "List"`, lazy `contract`, `list` | feature | unverifiable | needs the portal, the devtools server and a driven click |
| the outcome vocabulary `succeeded`, `cancelled`, `redirected`, `failed`, `skipped`, `pending` | feature | unverifiable | tool output lives in the package; needs a server |
| `list-routes` "12 routes, measured" and `lint-routes` "one `info` finding, `missing-title`" | structure | unverifiable | needs a live MCP read |
| "`limit` defaults to 5 (at most 50)" and "the page keeps `limits.navigations` (50) entries" | feature | unverifiable | needs the package/live page |
| "a reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list"; "`started by` appears only when the click came less than 2 s before" | feature | unverifiable | need a driven page |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the panel is at `http://localhost:4507/__pangular/` through the `ng serve` proxy | command | verified | ran `check --json`: `proxy-config … apps/insurance-portal/proxy.conf.json`, `proxy-target … http://localhost:9999`; the portal's `apps/insurance-portal/proxy.conf.json:2-7` rewrites `^/__pangular` away, and the app port is 4507 |
| the panel session is `pangular-9999` | feature | verified | read `session: \`pangular-${p}\`` (`control.mjs:1647`) |
| `Angular 22.2.2` is the portal's version | config | verified | ran `scan build-meta` → `"angularVersion": "22.2.2"`, and `node_modules/@angular/core` in the portal checkout is 22.2.2 |
| "The dashboard's source counts are 0 in this Nx workspace" | structure | verified | ran `scan get-components` at the workspace root → `[]` |
| the panel title `Pangular Inspector`, the eight tab names, `LIVE`, `Agent`/`Read-only`, and the floating button's accessible name `Toggle Pangular Inspector` | feature | unverifiable | need the panel open in a browser |
| "the doctor has answered the one-time-code prompt in this session" | feature | unverifiable | needs the server and a browser session |
| "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | feature | unverifiable | needs the running devtools server |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| `setup.check` is "six read-only facts, one line each" | feature | verified | ran `check --json` → six checks (`declared-exact`, `installed`, `overlay-import`, `dev-guard`, `proxy-config`, `proxy-target`) (`control.mjs:844-875`) |
| "`node $S check` -> six `[OK]` lines, exit 0" | command | verified | ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check` → exit 0, all six `pass` |
| the pin is exact in `devDependencies` | config | verified | ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)` |
| `remove` restores the managed files from git `HEAD`, deletes untracked ones, prunes `node_modules` and is `ok` only when the tree is clean | structure | verified | read `git checkout HEAD --`, `rmSync` for untracked, `npm install`, `ok: left.length === 0 && !diff` (`control.mjs:1492-1531`) |
| "Remove: … `gitStatus: []`, `gitDiffStat: ""`" matches the fields the command prints | command | verified | read `gitStatus: left`, `gitDiffStat: diff` and the exit condition `left.length === 0 && !diff ? 0 : 1` (`control.mjs:1527-1541`) |
| "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" | command | stale | asserted at `setup.md:31`, contradicted by `package.json:53` in that checkout (`"@pangular-inspector/devtools": "0.0.7"`): `git -C <portal> log --oneline -S'@pangular-inspector'` prints `f102b97 build(insurance-portal): add Pangular Inspector for development`, an ancestor of HEAD (`git merge-base --is-ancestor f102b97 HEAD` exit 0) whose stat touches `package.json`, `package-lock.json` (457 insertions), `main.ts`, `project.json`, `proxy.conf.json` |
| "`install --json` -> `changed` lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json`" and "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" as a live run | command | unverifiable | needs an install in a clean worktree (the 457 count does match the committed `f102b97` stat) |
| "`npm exec -- nx run insurance-portal:typecheck` exits 0 with the overlay import" | command | unverifiable | needs an Nx run in the portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "Workspace root: `node $S scan get-components` -> `[]`" | structure | verified | ran it → `"text":"[]"`, exit 0 |
| "App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`, `PageNotFoundComponent`, `SidebarComponent`" | feature | verified | ran it → exactly those four, exit 0 |
| that run's stderr warning that the folder "has no `angular.json` … so the source scans find nothing" | structure | verified | ran it → `[pangular] … has no angular.json and no package.json that depends on @angular/core, so the source scans find nothing` |
| "`build-meta` -> Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`, `ssr: false`" | feature | verified | ran `node $S scan build-meta` → `{"angularVersion":"22.2.2","projectName":"@ng-journal/source","typescript":"6.0.3","ssr":false,…}` |
| `scan <tool>` starts the stdio server, calls one tool and stops it | feature | verified | ran three `scan` invocations, each exited 0 |
| the stdio tool list holds `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`, `explain-render-mode`, `lint-pipes`, `explain-pipe` and the `analog-*` tools, and `scan nope` prints it | structure | verified | ran `node $S scan nope` → `no source tool nope; stdio has: get-routes, get-components, get-pipes, get-signals, get-providers, get-ngrx-store, build-meta, explain-render-mode, lint-pipes, explain-pipe, analog-routes, analog-explain-url, analog-server-functions, analog-api-routes, analog-render-modes, analog-prerender-plan, analog-content, analog-lint, devframe_state_read` (exit 2) |
| results with `--out` land in `tmp/control-pangular-inspector/scan/` | feature | verified | read `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` (`control.mjs:2375`) |
| "The stdio server lists no page tools (`inspect-*`, `list-pages`)" | feature | unverifiable | needs a `tools/list` against the stdio server (the `scan` command reads only the usage list) |
| "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" | structure | unverifiable | needs the CLI's scanning code, which is in the installed package, not this repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| the default attach instance is `chrome-beta-gemma4` and control-ai-browsers owns its CDP port | config | verified | read `.commandcode/skills/control-ai-browsers/instances.json`: `chrome-beta-gemma4` exists with `"port": 9334` |
| bundled mode uses Playwright's Chromium (Chrome for Testing 153) | feature | verified | read `spikes/ng222-app/node_modules/playwright-core/browsers.json` → chromium `"browserVersion": "153.0.8010.12"` (playwright 1.63.0) |
| main-checkout ports Vitest 51315 and bundled CDP 9350; a worktree takes `51400 + slot` / `9500 + slot`, apart from 9420-9499 | config | verified | read `MAIN_VITEST_PORT`, `MAIN_BUNDLED_CDP_PORT` and the two `at:` formulas (`control.mjs:151-177`) |
| `up` tries 10 slots | feature | verified | read `SLOT_TRIES = 10` (`control.mjs:341`) |
| the session is `control-vitest-<flowId>-<Vitest port>` | config | verified | read `session: \`control-vitest-${flowId}-${vitestPort}\`` (`control.mjs:1297`) |
| underneath it runs `ng test -c attach --watch` (`-c extension` for bundled) through `control.mjs __serve` | command | verified | read `testArgs` (`control.mjs:828-842`) |
| the binary is `spikes/ng222-app/node_modules/@angular/cli/bin/ng.js` | command | verified | the file exists |
| the doctor's checks are `map-fresh`, `process-alive`, `tree`, `ports`, `test-run`, `browser-cdp`, `orchestrator-tab`, `tester-frame`, `dev-build`, `vitest-runner`, `mounted-component`, `language-model`, `extension-loaded` | config | verified | read the doctor body (`control.mjs:1551-1708`) |
| `up` takes `--instance`, `--bundled`, `--extension`, `--hold`, `--timing-demo`, `--filter`, `--port`, `--timeout` (default 180 s) | command | verified | read the usage line and option parsing (`control.mjs:236-237,1874`) |
| the state file is `tmp/control-vitest-browser-angular/state/<flowId>.json` and evidence `<flowId>-<timestamp>/` | structure | verified | read `SCRATCH`, `STATE_DIR`, `evidenceDir` (`control.mjs:117-118,1285`) |
| attach mode loads the extension with `Extensions.loadUnpacked`; bundled mode passes `--load-extension` | feature | verified | read the CDP call (`control.mjs:1349`) and `vitest-extension.config.mts` |
| `vitest-base.config.mts` sets the browser port from a plugin on the project that has `test.name`, because `test.api` at the root would also start the API server on that port | integration | verified | read `VITEST_BROWSER_PORT` default 51315, the `config.test?.browser?.enabled \|\| !config.test.name` guard and the `test: { api: { … strictPort: true } }` return (`vitest-base.config.mts:7,13-18`) |
| `vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]` | config | verified | read `this.persistentContext ??= this.browser.contexts()[0];` (`vitest-attach.config.mts:20`) |
| shared code is `spikes/probes/vitest-lib.mjs` | structure | verified | the file exists |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:221`, contradicted by `.commandcode/skills/control-vitest-browser-angular/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| the ready-time measurements (5.2 s, 19.3 s, 9.9 s, 4.4 s, 21.6 s) | feature | unverifiable | need runs |
| "`window.ng`: 23 functions" in the tester iframe | feature | unverifiable | needs a run |
| "`LanguageModel` in attach mode (Gemma 4 answered a prompt from the tester iframe)" | feature | unverifiable | needs the model and a browser |
| "a DevTools panel reaches the tester iframe with `chrome.devtools.inspectedWindow.eval(expr, { frameURL })`" | feature | unverifiable | needs a loaded extension and a DevTools session |
| "Chrome 137+ branded builds ignore `--load-extension`" | feature | unverifiable | needs a branded browser |
| the 250 ms exit wait against the Node-on-Windows fetch assertion (exit 127) | feature | unverifiable | needs a run |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`node $S up --hold 90000`, then `node $S doctor` exits 0" by exit-code contract | command | verified | read the `up` usage and `--hold` parsing, and the doctor's `0 / 1` return (`control.mjs:1874,236,1712`) |
| `mounted-component` passes only while the hold test runs and `[WARN]`s otherwise | structure | verified | read `page.host ? 'pass' : 'warn'` with "no test is running (start with --hold …)" (`control.mjs:1676-1682`) |
| the held Counter's fresh state is `Clicks: 3 (double 6, cart 2)` with `CartService` overridden to `['pear', 'plum']` | feature | verified | read the spec's hold test (`setup({ cartItems: ['pear', 'plum'] })`) and `count = signal(3)` (`spikes/ng222-app/src/app/counter.spec.ts:61`, `spikes/ng222-app/src/app/counter.ts:26`) |
| never attach to a browser outside `control-ai-browsers/instances.json` | config | verified | that file exists and lists the instances |
| `ui: false` in both runner configs | config | verified | read `ui: false` in `vitest-attach.config.mts` and `vitest-extension.config.mts` |
| the feature entry contract (H1 + the four H2s in order) | structure | verified | read `counter-tests.md` and `extension-in-tester.md`; both follow it |
| a re-run is a `touch` of the spec and a `RERUN` line in `ng-test.log` | feature | verified | an archived run logs `RERUN  src/app/counter.spec.ts x1` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:48`) |
| "The verdict, the baseline in a second worktree and the repeat runs come from /lars-verify" | feature | unverifiable | that is another tool's procedure, not checkable here |
| "one browser instance at a time … a baseline (in its worktree, with its own derived Vitest port) and its change run one after the other" | config | unverifiable | needs runs |
| the `f1e4` snapshot refs and `page.frame('vitest-iframe')` reads | feature | unverifiable | need a driven run |
| "The Angular DevTools extension: not loaded into these browsers" | feature | unverifiable | needs a run to list the profile's extensions |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
Spec paths below are `spikes/ng222-app/src/app/counter.spec.ts`.
| `counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` | structure | verified | read `import { render } from 'vitest-browser-angular'` and `await render(Counter, …)` (`counter.spec.ts:3,12`) |
| two tests always run and two more run only when their env var is set | config | verified | read two `it(…)` and two `it.runIf(…)` (`counter.spec.ts:20,30,39,56`) |
| the timing demo fails with `expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` | feature | verified | an archived timing-demo run logs exactly `AssertionError: expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:20`) |
| the hold test keeps the Counter mounted for `VITE_COUNTER_HOLD_MS` | feature | verified | read `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)(…, Number(…)+30_000)` (`counter.spec.ts:56-75`) |
| failure screenshots land under `spikes/ng222-app/.vitest/attachments/failure-screenshots/` | feature | verified | the folder exists with `counter.spec.ts/Counter---shows-the-next-count-in-the-same-task-as-the-click--fails-on-purpose-.png` |
| "No run recorded (`node $S info` exits 2 with "no state file")" | command | verified | ran `node …/control.mjs info` → exit 2, `"reason": "no state file in …: nothing was started by this skill (run up first)"` |
| `tests-pass` "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" and "`test-run` reports `last summary: Tests  2 passed \| 2 skipped (4)`" | config | stale | asserted at `counter-tests.md:11,29`, contradicted by the second spec the same builder config picks up: `spikes/ng222-app/src/app/stale-view-fixture.spec.ts:1-4` (`describe('StaleViewFixture'`), which the newest attach-mode run reports as `Tests 2 failed \| 2 passed \| 2 skipped (6)` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-11-13T01-16-58-757Z/ng-test.log:77`) |
| "`test-run` passes on a failing test on purpose: it checks the run, not the results" as a live observation | feature | unverifiable | the code agrees (`testRunCheck` passes on `RUN_STARTED` without "An exception occurred", `control.mjs:727-745`), but the log evidence needs a run |
| "`up --hold <ms> --filter "keeps the counter mounted"` … without `--hold` the same filter reports `4 skipped (4)`" | feature | unverifiable | needs a run (and the count would now include the second spec) |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|---|---|---|---|
| "`node $S up --extension extension --hold 90000` (the repository's `extension/`)" | command | verified | `extension/` exists with `manifest.json`, and both flags are accepted (`control.mjs:1874`) |
| `ext-loaded` is the doctor's `extension-loaded`, which passes when the extension's service worker target exists | integration | verified | read the check (`control.mjs:1695-1708`) |
| `[SKIP]` without `--extension` | command | verified | read `add('extension-loaded', 'skip', 'no --extension given to up')` (`control.mjs:1708`) |
| in attach mode `down` uninstalls the extension and notes `uninstalled extension <id>` | feature | verified | read `Extensions.uninstall` and `notes.push(\`uninstalled extension ${state.extension.id}\`)` (`control.mjs:1791-1792`) |
| "`LanguageModel` is `available` in the tester iframe (attach mode) and not in bundled mode" | feature | unverifiable | needs Chrome Beta with the model plus a run |
| "The repository's `extension/` does not inject there (measured 2026-11-12: no execution context from its origin in the tester iframe)" | feature | unverifiable | its manifest matches `<all_urls>` (`extension/manifest.json` content_scripts), so only a run can show the absence |

## Counts (recomputed; informational, not audited rows)

- verified: 137
- stale: 6
- unverifiable: 72
- aspirational: 0
- total: 215
