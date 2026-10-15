# SSR and hydration

The ng222-ssr page is rendered on the server and hydrated in the browser. It shows the heading
`Render mode: server` (or `prerender`, `client` on the other routes), an `Early click` button with its count,
a list of three items fetched from `/api/items` during the server render, an `app-mismatch` paragraph, and a
`@defer (hydrate on interaction)` block holding a `Deferred click` button. The nav links switch between the
three routes. Query switches: `?mismatch=1` (structural hydration mismatch, NG0500), `?mismatch=text`
(different text on server and client, no error), `?transfer=0` (HTTP transfer cache off for the request).

## Sub-features

- `ssr-server-html` the server HTML of `/` carries `ngh` attributes, `<!--nghm-->`, `<script id="ng-state">`,
  the event dispatch contract script and `ng-server-context="ssr"` on `<app-root>`.
- `ssr-hydration` hydration completes in dev mode: `window.ng` present, `ngDevMode.hydratedComponents` 4,
  `hydratedNodes` 40, no node with a status other than `hydrated`.
- `ssr-mismatch` `?mismatch=1` marks `<app-mismatch>` as `mismatched` with expected and actual DOM and logs
  NG0500 (expected failure).
- `ssr-transfer-cache` the `/api/items` response travels in `ng-state`; the browser does not request it again on
  `/`, does on `/?transfer=0` and on `/client`.
- `ssr-defer` the `@defer` block is `dehydrated` until its button is clicked, then `hydrated`, and the click is
  replayed (`Deferred clicks: 1`).
- `ssr-event-replay` a click before `main.js` runs is queued in `window._ejsas.ng.q` and replayed after
  hydration (`Early clicks: 1`).
- `ssr-render-modes` `/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`.

## How to get to it (user POV)

- Open `<url>` (`http://localhost:4223/`); the nav links `Server route`, `Prerender route` and `Client route`
  lead to `/`, `/prerender` and `/client`.
- Press `Early click` or `Deferred click` with the mouse or keyboard.
- The query switches are typed into the address bar; they are fixture switches, not user features.

## Driving it with control-angular-dev-app

Preconditions:

- `node $S up --target ssr` and `node $S doctor --target ssr` exit 0 on a fresh page.

- **Server HTML, hydration, mismatch.** Run `playwright-cli -s=<session> --raw run-code
  --filename=.claude/skills/control-angular-dev-app/scripts/ssr-check.js > <evidenceDir>/ssr-check.json`.
  `ok` is `true` when all six checks pass; `expected-mismatch-detected` is the `?mismatch=1` case.
- **Hydration render.** `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/ssr-before.yml` contains
  `heading "Render mode: server"`, `button "Early click"`, the three list items and `button "Deferred click"`.
- **Transfer state.** `eval "() => ng.ɵgetTransferState(ng.getInjector(document.querySelector('app-root')))"`
  returns one entry keyed by a hash, with `u: "/api/items"`, `s: 200`, `b` the body. It re-reads the
  `ng-state` script and leaves out the `__nghData__` and `__nghDeferData__` keys.
- **No refetch.** `eval "() => performance.getEntriesByType('resource').filter(e => e.name.includes('/api/items')).length"`
  returns 0 on `/` and 1 after `goto <url>?transfer=0`. The server log counts every hit as `[api] GET /api/items`
  with the user agent (`ua=node` for the server render).
- **Defer block.** `eval "() => ng.ɵgetControlFlowBlocks(document.querySelector('app-page')).filter(b => b.type === 0).map(b => ({state: b.state, hydration: b.incrementalHydrationState, triggers: b.triggers}))"`
  returns `initial`, `dehydrated`, `["hydrate on interaction", "on idle"]`. Then
  `click "getByRole('button', { name: 'Deferred click' })"`; the same read returns `complete`, `hydrated`, and
  the page shows `Deferred clicks: 1`.
- **Event replay and render modes.** Run the spike probes `spikes/probes/ssr-event-replay.js` and
  `spikes/probes/ssr-render-modes.js` with `--raw run-code --filename=...`. The event-replay probe holds
  `main.js` back with `page.route`, clicks `Early click` on `/` and reads `Early clicks: 1` after hydration; the
  render-modes probe fetches and then loads `/`, `/prerender` and `/client` in full (`ng-server-context` `ssr`,
  `ssg`, and `<body ngcm>` for the client shell).
- **Proof.** `playwright-cli -s=<session> screenshot --filename=<evidenceDir>/ssr.png`.

## Gotchas

- A client navigation through the nav links does not render on the server. Load each route with `goto` to see
  its render mode.
- After hydration Angular removes the `ngh` attributes and `jsaction` attributes it has handled; only those
  inside the still dehydrated `@defer` block stay. Read hydration markers from the server HTML
  (`page.request.get`), not from the live DOM.
- `ngDevMode` counters are per page load; read them after the `Angular hydrated ...` console line.
- `__ngDebugHydrationInfo__` is a property on DOM nodes, set only in dev mode. A mismatch is recorded on the
  closest component host, not on the node that differs.
- After the `?mismatch=1` mismatch the page keeps working; the server-only `<div>` stays in `<app-mismatch>`
  before the `<p>`, and `hydratedNodes` drops from 40 to 32.
- `window._ejsas` becomes `{}` once hydration has replayed the queue; nothing records the replay itself.
- In the browser both `<app-root>` and the routed `<app-page>` carry `ng-version` (the server HTML has it on
  `<app-root>` only), so `doctor` lists two roots.
- Do not fix `app-mismatch`; it is the mismatch fixture.
