# Held Counter

With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden to
`['pear', 'plum']`. It keeps it mounted, clicks Increment once halfway, and checks that the count rose by one.
During the hold, the page shows "Clicks: 3 (double 6, cart 2)" and an Increment button, and every `ng.*` read
works on the host `<div id="rootN" ng-version="22.2.2">`.

## Sub-features

- `held-render` the Counter in the tester iframe, visible in the snapshot as `paragraph "Clicks: 3 (double 6,
cart 2)"` and `button "Increment"`.
- `held-increment` a click from the agent raises the count by one.
- `held-signals` `ng.ɵgetSignalGraph(ng.getInjector(host))`: template `div` -> `title`, `count`, `double`,
  unnamed `items`; `double` -> `count`; effect -> `count`.
- `held-di` `ng.ɵgetDependenciesFromInjectable(injector, Counter)` shows `CartService` with `items()` =
  `["pear", "plum"]`; the resolution path is element -> `DynamicTestModule` -> `Platform: core` -> null.
- `held-profiler` `ng.ɵsetProfiler(cb)` records output, change detection and template events for a click.

## How to get to it (user POV)

- The Vitest tab in the attached browser, frame `vitest-iframe`, while the hold test runs.

## Driving it with control-vitest-browser-angular

Preconditions:

- `node $S up --extension s1-vitest --hold 90000` (or a `touch` of the spec for a new hold), `doctor` exits 0
  with `mounted-component` passing; session attached and the Vitest tab selected (README).

- **Render.** `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/held-before.yml`. It contains
  `paragraph [ref=f1e3]: "Clicks: 3 (double 6, cart 2)"` and `button "Increment" [ref=f1e4]` (refs can differ;
  take them from the snapshot).
- **Increment.** `playwright-cli -s=<session> click f1e4`, then
  `playwright-cli -s=<session> --raw run-code "async page => { const f = page.frame('vitest-iframe'); await f.waitForFunction(() => document.querySelector('[ng-version]')?.textContent.includes('Clicks: 4')); return f.evaluate(() => { const h = document.querySelector('[ng-version]'); const c = window.ng.getComponent(h); return { text: h.textContent.trim(), count: c.count(), cart: window.ng.ɵgetDependenciesFromInjectable(window.ng.getInjector(h), c.constructor).dependencies.find((d) => /CartService/.test(d.token.name)).value.items() }; }); }" > <evidenceDir>/held-after.json`.
  Expected `{"text":"Clicks: 4 (double 8, cart 2)Increment","count":4,"cart":["pear","plum"]}`.
- **Screenshot.** `playwright-cli -s=<session> screenshot --filename=<evidenceDir>/held-after.png`.
- **Signals, injector, profiler.** Run `spikes/probes/vitest-iframe-probe.js` in the frame: `run-code` with
  `async page => page.frame('vitest-iframe').evaluate(<the probe's function source>, 'mount')`, then `'after'`
  after a click. Or use the spike runner, which does all of it: `node spikes/probes/vitest-attach.mjs --route
attach --cdp-port <instance port> --label <label>`. The runner starts its own `ng test` and needs no run from
  this skill: run `down` first.

## Gotchas

- Outside the hold, no component is mounted: `vitest-browser-angular` cleans up before each test, and TestBed
  tears down after each. A drive that finds no mounted Counter is inconclusive, not a failure of the claim.
- `<app-counter>` does not exist under TestBed; select `[ng-version]`.
- Clicks by the agent after the test's halfway click do not affect its expectation; clicks before it are counted
  in the value it reads first.
- `ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path ("only supports
  NodeInjector and EnvironmentInjector").
- In attach mode the `run-code` route recorded only the click's output events (event ids 6 and 7) in two runs on
  2026-10-16, with the DOM already updated; the spike runner recorded output, change detection and template events
  (12 events) on the same instance, as did the `run-code` route in bundled mode. Take profiler claims in attach mode
  from the runner.
- The spike runner does not clear the instance's HTTP cache the way `up` does; after a run with another hold on
  the runner's port (51316), clear it first or the runner can get the earlier test chunk.
