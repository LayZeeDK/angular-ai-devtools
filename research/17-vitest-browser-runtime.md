# 17 - Vitest Browser Mode spike: can the extension be present, and what does the tester iframe expose

Questions, in Lars's order:

1. "Is it even possible to add a web extension like Angular AI DevTools when running Vitest Browser (with
   Playwright)+Angular unit tests?"
2. "Could we support the Angular AI DevTools web extension in Vitest Browser+Playwright attaching to real
   Chrome/Edge browser+Angular?"
3. Once the extension is present: what do `window.ng`, the signal graph, the profiler, the injector and
   `LanguageModel` report from the tester iframe, and which of the four section 6.3 candidates does the page
   support?

Status: done (2026-10-12). Author: Claude, for Lars.

Labels: **[measured]** = observed in a run, with its raw file; **[documented]** = read in installed package source
(`spikes/ng222-app/node_modules/...`, file named) or a vendor statement; **[inferred]** = Claude's reading, not run.

## Answer first

**Yes, the extension can be present, and the best route is attaching to a real branded browser.** Route 2 (attach
to a running per-model instance) works with a 30-line custom provider in the fixture's Vitest config. In
Chrome Beta 156 with Gemma 4 it gave everything the four candidates need, plus the on-device model. The S1 test
extension's content scripts ran in the tester iframe in both worlds. The DevTools panel reached the tester frame
through `inspectedWindow.eval` with `frameURL`. `window.ng` worked there, and `LanguageModel` answered "OK" from
inside the tester iframe **[measured, `research/raw/vitest-attach-gemma4.json`]**.

| Route                                                                                                      | Extension loads                                                                                   | Content script in tester iframe             | DevTools panel reaches tester iframe | `LanguageModel` there                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 1. Vitest's Playwright provider, `persistentContext` + `--load-extension`, bundled Chromium                | yes **[measured]**                                                                                | yes, isolated and MAIN world **[measured]** | yes, with `frameURL` **[measured]**  | `typeof` function, `availability()` `unavailable` (no model in Chrome for Testing 153) **[measured]** |
| 2. Attach to a running branded instance over CDP (custom provider), extension by `Extensions.loadUnpacked` | yes **[measured]**                                                                                | yes, both worlds **[measured]**             | yes, with `frameURL` **[measured]**  | `available`, `contextWindow` 9216, answered "OK" in 10.8 s **[measured]**                             |
| 2b. Attach, but pages in a new context (`browser.newContext()`)                                            | loaded, but not in the test page **[measured]**                                                   | no **[measured]**                           | panel not registered **[measured]**  | not read: the instance stopped responding **[measured]**                                              |
| 2a. Vitest's own `connectOptions`                                                                          | not applicable: needs a Playwright `launchServer` endpoint, cannot attach to CDP **[documented]** | -                                           | -                                    | -                                                                                                     |
| 3. Vitest's `preview` provider                                                                             | not measured                                                                                      | not measured                                | not measured                         | would match the browser it opens **[inferred]**                                                       |

Raw files: `research/raw/vitest-attach-gemma4.json` (route 2), `research/raw/vitest-chromium-bundled.json`
(route 1), `research/raw/vitest-attach-gemma4-newcontext.json` (route 2b),
`research/raw/vitest-attach-gemma4-doctor-before.json` and `-after.json` (the instance's doctor
around the route 2 run). Probes: `spikes/probes/vitest-attach.mjs` (runner) and
`spikes/probes/vitest-iframe-probe.js` (evaluated in the tester iframe).

## Setup

- Fixture: `spikes/ng222-app` (Angular 22.2.2, zoneless, standalone). Added, all pinned exactly: `vitest`
  5.0.3 (was `^5.0.0`, 5.0.3 installed), `@vitest/browser` 5.0.3, `@vitest/browser-playwright` 5.0.3,
  `playwright` 1.63.0, `vitest-browser-angular` 0.5.1. Removed `jsdom`. `@vitest/browser` is pinned directly
  because `vitest-browser-angular`'s peer range otherwise resolved `@vitest/browser` 5.0.4, whose peer is
  `vitest` 5.0.4, and npm 11 failed with `Cannot read properties of null (reading 'explain')` **[measured]**.
- Runner: Angular's own `@angular/build:unit-test` builder. Angular 22.2 has a `browsers` option, and it picks
  the first installed of `@vitest/browser-playwright`, `-webdriverio`, `-preview`
  (`@angular/build/src/builders/unit-test/runners/vitest/browser-provider.js:49-60`) **[documented]**.
  `angular.json` `test`: options `runnerConfig: true`; configurations `headless` (default,
  `browsers: ["ChromiumHeadless"]`), `attach` (`vitest-attach.config.mts`) and `extension`
  (`vitest-extension.config.mts`).
- `vitest-base.config.mts`: Vitest's default browser port 63315 lies in a Windows excluded TCP range on this
  machine (63297-63396), so the run first failed with `listen EACCES: permission denied ::1:63315`
  **[measured]**. Vitest 5 takes the browser server port from the project's `test.api`, not from
  `test.browser.api` (`vitest/dist/chunks/index.DpLw24bj.js:9579`) **[documented]**. Setting `test.api` at the
  root also started Vitest's API server on the same port ("Port 51315 is already in use") **[measured]**. The
  config therefore sets it from a plugin, only on the project Angular builds, from `VITEST_BROWSER_PORT`
  (default 51315).
- Tests, `src/app/counter.spec.ts`, using `render` from `vitest-browser-angular` and DOM assertions:
  1. "shows the next count after the user clicks Increment" (passes);
  2. "shows the cart size from an overridden CartService" (passes; `providers` with
     `{ provide: CartService, useValue: { items: signal(['pear', 'plum']) } }`);
  3. "shows the next count in the same task as the click (fails on purpose)", only with
     `VITE_COUNTER_TIMING_DEMO=1`. It reads `textContent` synchronously after `button.click()` and fails with
     `expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` **[measured]**;
  4. "keeps the counter mounted for an outside inspection, then counts its own click", only with
     `VITE_COUNTER_HOLD_MS=<ms>`: overridden `CartService`, holds the component, clicks Increment halfway and
     expects the count to rise by one from its value just before the click. The spike runs below used an
     earlier version that expected exactly "Clicks: 4"; a click from outside during the hold made that version
     fail ("Received: Clicks: 5"), so it now counts from the value before its own click **[measured]**.
     `VITE_`-prefixed variables reach the browser as `import.meta.env.<name>` (Vitest browser defines them from
     `test.env`, `@vitest/browser/dist/index.js:3454-3458`) **[documented; measured by test 3 running only when
     set]**.
- Runs: `ng test` (default `headless`) 2 passed, 2 skipped, exit 0; with `VITE_COUNTER_TIMING_DEMO=1` 1 failed,
  2 passed, exit 1; `ng test -c attach` against Chrome Beta 2 passed, exit 0 **[measured]**. `ngc -p
tsconfig.spec.json --noEmit` and `ngc -p tsconfig.app.json --noEmit` exit 0; a planted type error in a spec
  made the first exit 1, so the check does run **[measured]**.

## Route 2: attaching to a real branded browser

### Does Vitest's Playwright provider support attaching?

- **No built-in CDP attach.** The provider has three ways to get a browser:
  `connectOptions` -> `playwright[browserName].connect(wsEndpoint, ...)`; `persistentContext` ->
  `launchPersistentContext(userDataDir, ...)`; otherwise `launch(...)`
  (`@vitest/browser-playwright/dist/index.js:1009-1053`) **[documented]**. There is no `connectOverCDP` call.
- **`connectOptions` cannot reach a CDP browser.** `BrowserType.connect` speaks Playwright's own protocol and
  needs a `launchServer` endpoint: Playwright throws "Malformed endpoint. Did you use
  BrowserType.launchServer method?" when the server has no pre-launched browser
  (`playwright-core/lib/coreBundle.js`, the `connect` path) **[documented]**. A Playwright server started with
  `x-playwright-launch-options` would launch a new browser, not attach to the running instance **[inferred]**.
- **Context: always a new one unless persistent.** `createContext` uses
  `this.persistentContext ?? await browser.newContext(options)` (`index.js:1198`) **[documented]**. Measured with the
  attach provider changed to skip the default context (so Vitest called `browser.newContext()`), on
  `chrome-beta-gemma4` at 10:38 UTC: the tester frame had only the default world and Playwright's utility
  world, with no extension isolated world, and the extension recorded nothing from the test page. The panel was not
  registered in the time allowed **[measured, `research/raw/vitest-attach-gemma4-newcontext.json`]**. So a new
  context hides the test page from the extension, and the default context is the only place it sees it. In that
  run, CDP calls began to time out after the tester mounted (`Runtime.evaluate` of the prompt probe, then
  `Target.getTargets`), and by 10:44 the instance's process was gone **[measured]**. The cause was not isolated.
  A relaunch was healthy: doctor exit 0, model `Ready`/`Available`, and `Extensions.getExtensions` empty
  **[measured]**. The variant was a temporary edit and is not in the fixture.
- **The provider class is exported** (`export { PlaywrightBrowserProvider, playwright }`, `index.js` last line)
  **[documented]**, so a small subclass can attach. `spikes/ng222-app/vitest-attach.config.mts`:
  `openBrowser()` calls `chromium.connectOverCDP(VITEST_CDP_URL)` and sets
  `persistentContext = browser.contexts()[0]` (the default context). `close()` closes only the tabs Vitest
  opened and then calls `browser.close()`. For a CDP connection that disconnects and leaves the browser
  running. The factory also turns off `prewarm`: the stock one would launch a bundled Chromium in parallel
  (`prewarmBrowser`, `index.js:867-905`) **[documented]**.
- **Angular's `browsers` option cannot carry it.** When `browsers` is set, the builder builds its own
  `playwright(baseOptions)` provider and merges it over the user's `test.browser`
  (`plugins.js`, `projectOverrides`). `providerFactory` closes over its own `options`, so user
  `launchOptions` or a user provider are lost **[documented]**. The `attach` and `extension` configurations
  therefore leave `browsers` unset and define the whole `test.browser` in their runner config.
- **Measured on `chrome-beta-gemma4`** (Chrome Beta 156.0.8078.17, port 9334, launched by
  `control-ai-browsers`): `ng test -c attach --watch=false` passed 2 of 2. The Vitest tab opened as a normal tab in
  the instance's window and closed at the end. `/json/list` afterwards showed only `about:blank`, and the
  instance kept running **[measured]**.

### Extension and model on the attached instance

Run: `node spikes/probes/vitest-attach.mjs --route attach --cdp-port 9334 --label gemma4 --hold 40000`
(10:27 UTC). The runner copies `spikes/s1-extension` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`) to `tmp/vitest-ext/<label>`. In the copy, the content scripts
match `http://127.0.0.1/*` and `http://localhost/*` with `all_frames: true`, and each result is keyed by frame.
The runner loads the copy with `Extensions.loadUnpacked`, runs
`ng test -c attach --watch=false --filter "keeps the counter mounted"`, inspects, then removes the copy with
`Extensions.uninstall`.

- Extension loaded (`dmggnnpklabgnjkfefpenhbggndojfkm`) and its service worker and offscreen document ran
  **[measured]**.
- **Content scripts in the tester iframe:** the CDP execution contexts of the tester frame include the
  extension's isolated world ("S1 probe (Vitest tester iframe variant)") next to the default world and
  Playwright's utility world. `content_isolated|frame|/` and `content_main|frame|/` were both recorded. The MAIN-world
  script saw `typeof window.ng === 'object'`, the Counter host and `ng.getComponent(...).count() === 3`.
  The isolated world saw `typeof window.ng === 'undefined'`, as expected for an isolated world **[measured]**.
  The orchestrator top frame got the isolated script too **[measured]**.
- **DevTools panel:** `Target.openDevTools` on the orchestrator tab, then `onShowPanel`; `panel.html` appeared
  as an `iframe` target **[measured]**. From the panel, `chrome.devtools.inspectedWindow.eval` without options
  ran in the orchestrator (`typeof ng` `undefined`). With `{ frameURL: <tester URL> }` it ran in the tester
  iframe: `typeof ng` `object`, `getComponent` -> `_Counter`, text "Clicks: 3 (double 6, cart 2)Increment"
  **[measured]**.
- **`LanguageModel`:** `available` in every context: tester iframe main world, both content-script worlds in the
  tester iframe, the panel, the service worker and the offscreen document. `devtools_page` was
  `unavailable` with the Permissions Policy false, as in S1 **[measured]**. A one-prompt session created in the
  tester iframe's main world returned "OK", `contextWindow` 9216, in 10,771 ms **[measured]**.
- **Doctor before and after:** both exit 0. Every check passed, with the same single `[WARN]` (a v3Nano model also
  in the profile). After the run, `tabs` showed one `about:blank`, `model.broker` `Ready`/`Available`, and
  `canary.tools` passed **[measured, the two doctor files]**.

### Branded-browser restrictions

- Chrome 136 and later ignore `--remote-debugging-port` and `--remote-debugging-pipe` on the default
  user-data directory **[documented: Chrome's March 2025 announcement on remote debugging switches, from Claude's prior reading; not re-read or measured here]**. The
  per-model instances use their own `--user-data-dir` under `.browsers\`, and CDP works there
  **[measured]**.
- Chrome 137 and later branded builds ignore `--load-extension` **[documented: Chrome's announcement removing the switch from branded builds, from Claude's prior reading; not
  re-read or measured here]**, so route 2 loads the extension with `Extensions.loadUnpacked`, which works over the port
  without `--enable-unsafe-extension-debugging` (research 11) **[measured there and here]**.
- Edge Dev and Edge stable instances were not run in this spike. The same provider applies to any Chromium
  browser with a CDP port **[inferred]**.

## Route 1: Playwright's bundled Chromium with a persistent context

`vitest-extension.config.mts`: `playwright({ persistentContext: VITEST_USER_DATA_DIR, launchOptions: { channel:
'chromium', args: ['--disable-extensions-except=…', '--load-extension=…', '--remote-debugging-port=…'] } })`.
The provider calls `launchPersistentContext` and uses that context for every page (`index.js:1030-1038`,
`1198`) **[documented]**. `persistentContext` is ignored when tests run in parallel (`index.js:1026-1029`)
**[documented]**; the fixture has one spec file.

Run: `node spikes/probes/vitest-attach.mjs --route chromium --cdp-port 9350 --label bundled --hold 30000`:
Chrome for Testing 153.0.8010.12, extension loaded by `--load-extension`, content scripts in both worlds of the
tester iframe, panel `inspectedWindow.eval` with `frameURL` reached `_Counter`, profiler events recorded, test
passed **[measured, `research/raw/vitest-chromium-bundled.json`]**. `LanguageModel` is a function but
`availability()` is `unavailable` in every context: no model, and none of the per-model `--enable-features`
**[measured]**. This route serves every candidate except the AI answer.

## Route 3: the `preview` provider

Not measured. `@vitest/browser-preview` 5.0.3 (`dist/index.js`, read from the registry tarball):
`openPage()` sets Vite's `server.open` to the test URL and calls `vite.openBrowser()`. It refuses headless mode
and has no CDP session (`getCommandsContext()` returns `{}`) **[documented]**. Vite opens the system default
browser unless the `BROWSER` environment variable names another **[documented: Vite's `server.open` docs, from Claude's prior reading; not re-read]**. On this machine
that is Lars's everyday browser, which the spike must not touch, so it was not run. With `BROWSER` pointed at
an instance's executable and profile, the tab would open in that instance and the extension and model would
behave as in route 2 **[inferred]**. Interactions then go through the preview provider's simulated events, not
Playwright **[inferred from `locators.js` delegating to `userEvent`]**. Route 2 gives the same browser with
real input, so route 3 adds nothing.

## What the tester iframe exposes

All from `research/raw/vitest-attach-gemma4.json` (route 2); route 1 gave the same Angular values **[measured]**.

- **URLs.** Orchestrator: `http://127.0.0.1:<port>/__vitest_test__/?sessionId=<uuid>`. Tester iframe:
  `http://127.0.0.1:<port>/?sessionId=<uuid>&iframeId=__vitest_all__`, frame name `vitest-iframe`, attribute
  `data-vitest="true"` **[measured]**. `__vitest_all__` is the single iframe used because Angular's builder
  sets `isolate: false` (`plugins.js`, `projectDefaults`) **[documented]**; with isolation on, the id would
  name the file **[inferred]**. Research 04 recorded `<base><sessionId>/<file>` for an isolated setup.
- **Same origin.** Orchestrator and tester share the origin `http://127.0.0.1:<port>`. A script in the
  orchestrator read `iframe.contentWindow.ng`, the DOM text and `ng.getComponent(...)` -> `_Counter`
  **[measured]**. The orchestrator itself has no `window.ng` **[measured]**.
- **`window.__vitest_browser_runner__`** in both frames. Tester keys include `config`, `provider`,
  `sessionId`, `iframeId`, `testerId`, `runner`, `commands`, `cdp`. Orchestrator keys include `orchestrator`.
  `window.__vitest_worker__` exists in the tester **[measured]**.
- **`window.ng`** exists in the tester iframe with 23 functions: all public `ng.*` plus `ɵgetSignalGraph`,
  `ɵsetProfiler`, `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`,
  `ɵgetDependenciesFromInjectable`, `ɵgetControlFlowBlocks`, `ɵgetTransferState`, `toggleWatchSignal`
  **[measured]**. TestBed's test platform publishes them: `createPlatform` and
  `createOrReusePlatformInjector` call `publishDefaultGlobalUtils()` (`@angular/core/fesm2022/core.mjs:2323,
2385`) **[documented]**. No router globals: the counter test has no router **[measured]**.
- **The component host is not `<app-counter>`.** TestBed renders into `<div id="rootN" ng-version="22.2.2">`;
  `document.querySelector('app-counter')` is null and `ng.getComponent(div)` is the Counter **[measured]**.
  Any tool that finds components by selector must walk `[ng-version]` hosts instead.
- **`ng.getComponent`:** `_Counter` (the build's class name), `count` 3, `double` 6, `title` "Clicks",
  `isSignal(count)` true **[measured]**.
- **`ng.ɵgetSignalGraph(injector)`:** template `div` -> `title`, `count`, `double` and the cart's unnamed
  `items` signal; `double` -> `count`; the constructor `effect` -> `count` **[measured]**.
- **`ng.ɵsetProfiler`** installed from outside during the hold: the test's click produced 12 events. First
  `OutputStart`/`OutputEnd` on `_Counter` at 21,277 ms. Then, 10 ms later, `ChangeDetectionStart`,
  `ChangeDetectionSyncStart`, two template update pairs, `ComponentStart`/`ComponentEnd`,
  `ChangeDetectionSyncEnd` and `ChangeDetectionEnd` at 21,287 ms **[measured]**. The gap between the output
  handler and change detection is the zoneless scheduler's separate task. Test 3 fails inside that gap
  **[measured failure; the link between them is inferred]**.
- **Injector and the `CartService` override:** `ng.ɵgetInjectorResolutionPath` gives element
  (`HTMLDivElement`) -> environment `DynamicTestModule` -> environment `Platform: core` -> null.
  `ɵgetDependenciesFromInjectable` shows `CartService` resolved from the `R3Injector` with
  `items()` = `["pear", "plum"]`. `ɵgetInjectorProviders` on `DynamicTestModule` lists the `CartService`
  record with provider keys `provide`, `useValue` **[measured]**. On the null injector it throws
  "getInjectorProviders only supports NodeInjector and EnvironmentInjector" **[measured]**.
- **Lifetime.** The component exists only during its test: `vitest-browser-angular` cleans up before each test,
  and Angular's TestBed tears down after each. In a `--watch=false` run, the attach provider closes the tab at the
  end **[measured: the hold test was needed to inspect; the tab was gone afterwards]**. A tool that inspects a
  test needs watch mode or a held test **[inferred]**.

## Verdicts on the four section 6.3 candidates

The extension generates no code, and each finding names the modern Angular pattern and why (Lars's rulings).

1. **Zoneless test-timing explainer: supported.** The extension can install `ng.ɵsetProfiler` in the tester
   iframe and see the output handler and the change detection that follows it as separate, timed events
   **[measured]**. It can also read the DOM and the signals at either point **[measured]**. The explanation it
   would give: in a zoneless app, change detection runs in a later task, so await the interaction and use
   `expect.element` (which retries) or `fixture.whenStable()` before reading the DOM **[inferred]**. Reading the
   failed assertion text itself was not measured. It lives in Vitest's runner state and reporter, not in
   `ng.*` **[inferred]**.
2. **Query mismatch explainer: supported for the DOM side.** The extension's MAIN-world script and the panel
   read the tester DOM and `ng.*` **[measured]**. One mismatch is already measured: a selector query for
   `app-counter` finds nothing under TestBed, because the host is `<div id="rootN">`; role and text queries
   work **[measured]**. The failing locator would come from Vitest's error, as in candidate 1
   **[inferred, not measured]**.
3. **Test-against-app diff: supported with a held or watched test.** The same `ng.*` reads work in the tester
   iframe and in the served app (research 02 and the control-angular-dev-app doctor) **[measured in both
   places separately]**. The extension runs in both tabs of one browser under route 2 **[inferred; one tab
   measured here]**. The diff needs the test's component alive, so it needs watch mode or a held test **[inferred
   from the lifetime finding]**.
4. **Test DI explainer: supported.** The resolution path, the `DynamicTestModule` provider record with
   `useValue`, and the resolved override value are all readable from the tester iframe **[measured]**.

## What this changes

- The control skill's main launch mode is route 2: attach the Vitest run to a per-model instance started by
  `control-ai-browsers`, with the extension loaded by `Extensions.loadUnpacked`. Route 1 (bundled Chromium,
  persistent context) is the fallback when no instance is wanted, without the model.
- Not measured, and open: Edge Dev or Edge stable under route 2; isolated runs (`isolate: true`, one iframe per
  file); reading Vitest's failure text from the page; the preview provider.
