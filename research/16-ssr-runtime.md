# 16 - SSR spike: what a server-rendered page exposes at runtime

Question: which SSR and hydration facts can a browser extension read from a running Angular 22.2 page in
development mode, and which SSR feature candidates in `docs/feature-proposals.md` does the page support?

Status: done (2026-10-12). Author: Claude, for Lars.

Labels: **[measured]** = observed in a run, with its raw file; **[documented]** = read in Angular 22.2.2 source
under `spikes/ng222-ssr/node_modules/@angular/*` (file and line named); **[inferred]** = Claude's reading, not
run.

## Setup

- Fixture: `spikes/ng222-ssr`, created with `ng new ng222-ssr --ssr --routing --style css --skip-git
--skip-tests --ai-config none --zoneless` from `@angular/cli@22.2.2` (the counter's version). Angular
  22.2.2, standalone, zoneless, `provideClientHydration()` with no features, `provideHttpClient(withFetch())`,
  `withComponentInputBinding()` so query parameters reach inputs.
- Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client`
  `RenderMode.Client`. All three show the same `Page` component, so the render mode is the only difference.
- `Page`: an `Early click` button (signal counter), `DataList` (`httpResource` on `/api/items`), `Mismatch`, and
  `@defer (hydrate on interaction) { <app-deferred/> }` with a `Deferred click` button.
- Data: `app.get('/api/items')` in `src/server.ts`, logging each hit with its user agent. The dev server runs
  `server.ts`, so the route answers under `ng serve` **[measured, `app.log` lines `[api] GET /api/items ...`]**.
- Switches: `?mismatch=1` makes `Mismatch` insert a `<div>` before its `<p>` on the server only (`REQUEST` is
  null in the browser); `?mismatch=text` renders different text on server and client; `?transfer=0` sets
  `transferCache: false` on the request.
- Server: `ng serve --port 4223 --no-hmr` through `control-angular-dev-app` (`--target ssr`). HMR is off
  because under HMR Angular loads every `@defer` dependency eagerly and logs NG0751 **[measured, first run's
  `app.log`]**. Results are dev-server results, not a production server.
- Browser: the skill's playwright-cli session (headless Chromium 154). Probes in `spikes/probes/ssr-*.js`,
  run as `playwright-cli -s=control-ngdev-ssr-4223 --raw run-code --filename=<probe>`; output in
  `research/raw/ssr-*.json`.

## Findings

### 1. `__ngDebugHydrationInfo__` and the `ngDevMode` counters

Raw: `research/raw/ssr-hydration.json`.

- `__ngDebugHydrationInfo__` is an expando property on DOM nodes, `{status}` with `status` one of
  `hydrated`, `skipped`, `mismatched` **[documented, `core/fesm2022/_debug_node-chunk.mjs:2496-2509`]**. On a
  clean `/`, 34 nodes under `<body>` carry it, all `{status: "hydrated"}` and no other key **[measured]**.
- A mismatched entry has `{status, expectedNodeDetails, actualNodeDetails}`, both strings **[measured]**.
- Counters on `ngDevMode` (a page global): `hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`,
  `dehydratedViewsCleanupRuns`, `componentsSkippedHydration`, `deferBlocksWithIncrementalHydration`
  **[documented, `_pending_tasks-chunk.mjs:616-621`]**. Values per page load **[measured]**:

| Page              | hydratedNodes | hydratedComponents | dehydratedViewsRemoved | dehydratedViewsCleanupRuns | componentsSkippedHydration | deferBlocksWithIncrementalHydration |
| ----------------- | ------------- | ------------------ | ---------------------- | -------------------------- | -------------------------- | ----------------------------------- |
| `/`               | 40            | 4                  | 0                      | 1                          | 0                          | 1                                   |
| `/?mismatch=1`    | 32            | 4                  | 0                      | 1                          | 0                          | 1                                   |
| `/?mismatch=text` | 40            | 4                  | 0                      | 1                          | 0                          | 1                                   |

- The counters keep counting after the first hydration: `hydratedComponents` went from 4 to 5 when the
  `@defer` block hydrated **[measured, `research/raw/ssr-defer.json`]**.
- The same numbers appear in one console line after hydration: "Angular hydrated 4 component(s) and 40
  node(s), 0 component(s) were skipped. 1 defer block(s) were configured to use incremental hydration."
  **[measured]**.
- 40 counted nodes against 34 nodes with the property in the DOM: the difference is likely nodes claimed
  and later removed or replaced **[inferred]**.

### 2. The mismatch

Raw: `research/raw/ssr-hydration.json` (`/?mismatch=1`).

- Expected and actual node: `expectedNodeDetails` is `<app-mismatch>\n  <p>…</p>  <-- AT THIS LOCATION\n
…\n</app-mismatch>`, `actualNodeDetails` the same with `<div>…</div>` **[measured]**.
- Component: the info is set on the closest component host, `<app-mismatch>`, not on the `<div>` that
  differs; `ng.getComponent(host)` names the class (`_Mismatch` in dev, with the leading `_`) **[measured;
  the host walk is in `_debug_node-chunk.mjs:2541-2549`, documented]**.
- How the page shows it: one console error, `ERROR RuntimeError: NG0500: During hydration Angular expected
  <p> but found <div>.`, with the expected and actual DOM, the component name ("check the \"_Mismatch\"
  component"), a hint about third-party scripts, and a stack **[measured]**. No overlay: `<body>`'s children
  are the same five elements as on a clean page, and no `pageerror` fired **[measured]**.
- The app keeps running. The server-only `<div>` stays in the DOM before the client's `<p>`, the list and the
  buttons work, and `hydratedNodes` drops from 40 to 32 **[measured]**.
- A text difference is no mismatch: `?mismatch=text` serves `server text`, the page ends with `client text`,
  and there is no error and no non-hydrated node **[measured]**. Hydration matches nodes by type and tag, so
  text and attribute differences are overwritten without a trace **[inferred from the measurement and the
  NG0500 note "attributes are only displayed ... have no effect on hydration mismatches"]**.

### 3. `ng.ɵgetTransferState` and the `HttpTransferCache` entries

Raw: `research/raw/ssr-transfer.json`.

- `ng.ɵgetTransferState(ng.getInjector(appRoot))` re-reads `<script id="ng-state">` from the document and
  leaves out Angular's internal hydration keys **[documented, `_debug_node-chunk.mjs:12893-12903`]**.
- On `/` it returns one key, a 64-hex-character hash, holding the transfer cache entry `{b, h, s, st, u, rt}`:
  `b` the body (the three items), `h` headers (`{}`), `s` 200, `st` `"OK"`, `u` `"/api/items"`, `rt`
  `"json"` **[measured]**. The URL is readable from `u`; the key itself is a hash.
- The raw `ng-state` JSON has two more keys, `__nghData__` (an array of 4, one per hydrated view) and
  `__nghDeferData__` (`{d0: ...}`), which `ɵgetTransferState` filters out **[measured]**.
- The `ng-state` script stays in the DOM after hydration **[measured]**, so the read works at any later time.
  It shows what the server sent, not what the client cache still holds **[inferred from the source above]**.
- With `?transfer=0` the entry is absent and `ɵgetTransferState` returns `{}`; on `/client` there is no
  `ng-state` script and it returns `{}` **[measured]**.

### 4. Whether the request runs again after hydration

Raw: `research/raw/ssr-transfer.json`; server log of the run (`[api]` lines, 4 new hits during the probe).

| Page                         | Resource Timing entries for `/api/items`        | Browser requests seen by Playwright | Server log hits                     |
| ---------------------------- | ----------------------------------------------- | ----------------------------------- | ----------------------------------- |
| `/` (cache hit)              | 0                                               | 0                                   | 1, `ua=node` (the server render)    |
| `/?transfer=0`               | 1, `initiatorType: fetch`, `responseStatus` 200 | 1                                   | 2: `ua=node`, then `HeadlessChrome` |
| `/client` (no server render) | 1, `initiatorType: fetch`                       | 1                                   | 1, `HeadlessChrome`                 |

All three **[measured]**. A cache hit leaves no Resource Timing entry, so "the browser did not request X" is
observable as an absence, matched against the `u` fields in transfer state. The cache serves only until the
app is stable: `provideClientHydration` sets `_CACHE_ACTIVE.isActive = false` after `whenStable()`
**[documented, `platform-browser.mjs:355-372`]**; a later request for the same URL goes to the network
**[inferred, not run]**.

### 5. Event replay

Raw: `research/raw/ssr-event-replay.json` (main.js held with `page.route`, one click, then released);
`research/raw/ssr-defer.json` (incremental hydration).

- `withEventReplay()` is on by default in 22.2: `provideClientHydration()` adds `withIncrementalHydration()`
  unless `withNoIncrementalHydration()` is passed, and `withIncrementalHydration()` includes
  `withEventReplay()` **[documented, `platform-browser.mjs:355`, `core.mjs:638-639`]**. The page sets the
  `NgEventReplay` and `NgIncrementalHydration` `mark_feature_usage` marks **[measured]**. The fixture adds no
  explicit `withEventReplay()`.
- Before hydration: the server HTML has the inline `ng-event-dispatch-contract` script and
  `window.__jsaction_bootstrap(document.body,"ng",["click","keydown"],[])` **[measured]**. `window._ejsas.ng`
  is `{c, q, et, etc, d, h}`: container `<body>`, event types `["click","keydown"]`, capture types `[]`, queue
  `q` empty. Every element with a template listener has `jsaction="click:;"` (the three nav links and both
  buttons; `<app-deferred>` has `click:;keydown:;`) **[measured]**.
- After an early click on `Early click`, still before hydration: `q` holds one entry, `{eventType: "click",
targetElement: <button> "Early click", timeStamp}` **[measured]**. `window.ng` is absent at this point.
- After hydration: `window._ejsas` is `{}` (the `ng` entry is deleted), `jsaction` attributes are gone from
  everything outside the dehydrated `@defer` block, and the page shows `Early clicks: 1`, so the click was
  replayed **[measured]**. Nothing at runtime records that a replay happened; the only traces are the result
  (the counter) and the marks.
- Incremental hydration: the click on `Deferred click` in the dehydrated block hydrated it and was replayed
  (`Deferred clicks: 1`); the button had `jsaction="click:;"` and `ngb="d0"` before, and only `type` after
  **[measured]**.
- So an extension sees the queue only if its script runs in the page's main world before `main.js`
  (`document_start`) **[inferred]**; once `window.ng` exists the queue is gone.

### 6. Render mode per route

Raw: `research/raw/ssr-render-modes.json` (each route a full load; raw HTML read with `page.request.get`
before the browser load).

| Route (declared)           | Response headers                                                                                         | Server HTML                                                                                                        | DOM after load                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `/` (`Server`)             | `vary`, `x-powered-by: Express`, `content-type`, `date`, `connection`, `keep-alive`, `transfer-encoding` | `<app-root ng-version ngh="3" ng-server-context="ssr">`, 5 `ngh`, `<!--nghm-->`, `ng-state`, event contract script | `ng-server-context="ssr"`, 1 `ngh` left, 40 nodes hydrated                     |
| `/prerender` (`Prerender`) | the same set                                                                                             | the same, but `ng-server-context="ssg"`                                                                            | `ng-server-context="ssg"`, 40 nodes hydrated                                   |
| `/client` (`Client`)       | the same set                                                                                             | `<body ngcm="">`, empty `<app-root>`, no `ngh`, no `ng-state`, no event contract                                   | `<body ngcm>`, no `ng-server-context`, 0 nodes hydrated, no `NgHydration` mark |

All **[measured]**. The headers do not differ between modes under `ng serve`. The browser tells the modes
apart by `ng-server-context` (`ssr`, `ssg`) and by `ngcm` on `<body>` for client mode
(`CLIENT_RENDER_MODE_FLAG`, **[documented, `core.mjs:550-553`]**). Under `ng serve` the prerender route is
rendered per request; a production build writes its HTML at build time (`ng build` printed "Prerendered 1
static route" **[measured]**), and what a production server sends for it was not measured. The `ngh`
attributes are removed during hydration (5 in the HTML, 1 left in the DOM, on the dehydrated `@defer`
content), so an extension reads them from the server HTML or before hydration **[measured]**.

### 7. `ng.ɵgetControlFlowBlocks` on the `@defer` block

Raw: `research/raw/ssr-defer.json`.

- `ɵgetControlFlowBlocks(node)` returns the `@defer` (`type: 0`) and `@for` (`type: 1`) blocks of the view that
  holds `node`, filtered to blocks inside `node` **[documented, `_debug_node-chunk.mjs:11934-11990`]**. On
  `<body>` it returns `[]`; on `<app-root>` and `<app-page>` both blocks; on `<h1>` only the `@for` **[measured]**.
- Before the trigger: `{type: 0, state: "initial", incrementalHydrationState: "dehydrated", triggers:
["hydrate on interaction", "on idle"], placeholderBlock: {exists: true, minimumTime: null}, loadingBlock:
{exists: false, minimumTime: null, afterTime: null}, hasErrorBlock: false, hostNode: <!--ngh=d0-->,
rootNodes: [<app-deferred>]}` **[measured]**. The implicit `on idle` main trigger is listed.
- After one click: `state: "complete"`, `incrementalHydrationState: "hydrated"`, the rest unchanged
  **[measured]**.
- The `@for` entry carries `items` (the actual data), `trackExpression`, `hasEmptyBlock`, `rootNodes`
  **[measured]**.
- No timings: the block reports configured `minimumTime` and `afterTime`, not when it loaded or hydrated
  **[measured]**.

### 8. `Server-Timing`

Raw: `research/raw/ssr-render-modes.json`.

- `performance.getEntriesByType('navigation')[0].serverTiming` is `[]` on all three routes, and no
  `server-timing` response header is sent **[measured]**. `@angular/build` and `@angular/ssr` 22.2.2 contain
  no `Server-Timing` string **[measured, `rg` over both packages, zero hits]**. A server timing feature would
  need the app's own server to set the header **[inferred]**.

## Verdicts per SSR feature candidate

| Candidate                                       | Supported by the page?        | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N5 as it stands (Hydration and `@defer` doctor) | **Yes, with two corrections** | `defer_blocks`: state, triggers and incremental hydration state are there (7). `hydration_status`: counters and per-component mismatches with expected and actual DOM are there (1, 2). Corrections: `defer_blocks` has no timings, only configured `minimumTime`/`afterTime`; the mismatch sits on the component host, and text differences never show (2). "Why did hydration skip `app-map`?" depends on the `skipped` status and `componentsSkippedHydration`, documented but not exercised here (no `ngSkipHydration` in the fixture). |
| Transfer State row in section 5                 | **Yes**                       | `ng.ɵgetTransferState` answers "what did the server pass" with readable entries (3). It shows the server's payload at any time after load; it does not say which entries the client used.                                                                                                                                                                                                                                                                                                                                                   |
| Transfer cache explainer                        | **Yes**                       | Transfer state entries (`u`, `s`, `b`) plus Resource Timing tell hit from miss per URL: 0 entries on a hit, 1 on a miss (4). The rule that the cache stops at app stability is documented, not measured.                                                                                                                                                                                                                                                                                                                                    |
| Event replay inspector                          | **Partly**                    | Configuration is readable (marks, contract script, `jsaction` attributes in the server HTML), and the queue is readable before hydration (5). After hydration nothing records what was replayed; an inspector would have to read `window._ejsas` from a main-world script at `document_start` and diff it with the result.                                                                                                                                                                                                                  |
| Render mode per route                           | **Yes, per full page load**   | `ng-server-context` (`ssr`, `ssg`) and `<body ngcm>` tell the three modes apart (6). A client-side navigation renders nothing on the server, so the mark belongs to the first loaded route only. Under `ng serve` prerender is per request; production prerender was not measured.                                                                                                                                                                                                                                                          |
| Server timing                                   | **No** (not by Angular)       | Neither the dev server nor `@angular/ssr` sets `Server-Timing` (8). The extension can read `serverTiming` if an app's server sets it, which is an app feature, not an Angular one.                                                                                                                                                                                                                                                                                                                                                          |

## Not reachable from a browser extension

- Server-side errors: an exception during the server render, a failed server `HttpClient` call, or the render
  timing stays in the server process log (`app.log` here). The browser gets the HTML, or an error page,
  without the cause **[inferred; the `[api]` log lines and the readiness `AbortError` only ever appeared in
  `app.log`]**.
- Server-only DOM work (the `?mismatch=1` `<div>`): the browser sees only its effect, the mismatch (2).
- The server's view of `REQUEST`, `RESPONSE_INIT`, and the server route table (`app.routes.server.ts`): the
  page carries only the result, `ng-server-context` or `ngcm` (6).
- Whether a prerendered page came from the build or from a request in production: the page looks the same
  apart from the context value (6) **[inferred]**.
- Requests the server made and did not cache (POST, requests with auth headers, `transferCache: false`): they
  leave no trace in `ng-state` (3, `?transfer=0`).
- What was replayed: gone after hydration (5).
- `ngh` markers and the event queue after hydration: removed or emptied; reachable only from the server HTML
  or a `document_start` main-world script (5, 6).
- Main-world only: `__ngDebugHydrationInfo__` (a DOM expando), `ngDevMode`, `window.ng` and `window._ejsas` are
  page JavaScript state, so an isolated-world content script cannot read them **[inferred from how isolated
  worlds work; research/11 covers the extension contexts]**.

## Raw files

- `research/raw/ssr-hydration.json` (1, 2): `spikes/probes/ssr-hydration.js`
- `research/raw/ssr-transfer.json` (3, 4): `spikes/probes/ssr-transfer.js`
- `research/raw/ssr-event-replay.json` (5): `spikes/probes/ssr-event-replay.js`
- `research/raw/ssr-render-modes.json` (6, 8): `spikes/probes/ssr-render-modes.js`
- `research/raw/ssr-defer.json` (5, 7): `spikes/probes/ssr-defer.js`
