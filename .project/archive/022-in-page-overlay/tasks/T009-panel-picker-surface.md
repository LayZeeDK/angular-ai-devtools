---
id: T009
title: Render the picker's named states and its two commands in a lazy panel route
wave: 3
deps: [T007]
status: done
agent: build_T009b
base: e8eb661805e616473d838676d49f81c007d0a835
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
---

# T009 — Render the picker's named states and its two commands in a lazy panel route

## Context

Every confirmation, choice and navigation lives in the panel, never in the page: the page gets geometry and a click, and everything a person decides happens here. The overlay can see its own closed root but the panel cannot, so the states the page cannot show — a picker that never answered, a page with no dev context, a cancelled pick — are states this surface has to name rather than leave blank. Two naming traps are already in the tree: `component-picker` is the test id of three existing selects, so a driver that used it would hit whichever route happened to be loaded; and the panel's initial bundle is measured from the eager references in the built index, so a route added eagerly turns the bundle pin red for a reason that is not this milestone's.

## Approach

- **A lazy route with its own name.** Add one `loadComponent` entry to `app.routes.ts` beside the two shipped lazy routes, with a path of its own, and give every state, every command and every descriptor field its own `data-testid` that is not `component-picker` and does not shadow a shipped test id. Nothing here is imported by an eager route, so no panel byte joins the initial set and the recorded baseline stays where it is.
- **One named state at a time, and no invented one.** The surface renders exactly one of: awaiting the page's answer, armed, locked with a resolved descriptor, cancelled, unavailable, no dev context, no component. `null` from the message service means "the panel has not been told", never "nothing was picked", so the awaiting state cannot double as the empty one and an unanswered picker never renders as a cancel.
- **The descriptor is displayed, never re-derived.** The resolved state names the element tag, the component name and the class path exactly as the payload carried them. The surface never reads the page, never re-runs a probe and never falls back to page inspection; `no-dev-api` renders its reason verbatim as a state, not as an error, which is the difference the milestone ships between "this page has no Angular dev context" and "this element belongs to no component".
- **The two commands go out through the service, and a refusal is visible.** Arming and cancelling send the picker command with the inspected tab id the way the shipped replay request does, and a failed send leaves the surface saying what failed rather than showing an armed state. There is no retry loop and there is no polling.
- **The spec owns the vocabulary.** `page-picker.component.spec.ts` renders the surface with each of the seven states from a stubbed message service, asserts one state per render, asserts the two commands' payloads and the failed-send path, and asserts that the descriptor's fields are rendered as carried. Keep the component's decisions in a small pure projection where one is worth testing, so the spec asserts a decision rather than a template's punctuation.

## Interface contract

- Down: `{ type: "angular-ai:picker-command", tabId, action: "arm" | "cancel" }` is sent by the panel, validated and forwarded by the background with `chrome.tabs.sendMessage`, re-dispatched inside the page as `new CustomEvent("angular-ai:picker-command", { detail: { action } })` on `window`, and consumed by the overlay.
- Up: `{ type: "angular-ai:picker-state", tabId, status: "armed" | "cancelled" | "unavailable", reason? }` and `{ type: "angular-ai:picked", tabId, descriptor }` leave the overlay as `CustomEvent("angular-ai:picker-state")` and `CustomEvent("angular-ai:picked")` on `window`, ride the relay's shipped forwarding shape, are re-broadcast by the background with `tabId`, and are read in the panel through one signal each.
- Lock: on a click the overlay dispatches `new CustomEvent("angular-ai:pick", { bubbles: true, composed: false })` on the picked element itself, and the MAIN-world capture listener registered on `globalThis` reads `event.target` and answers `CustomEvent("angular-ai:picked", { detail: descriptor })` on `window`.
- `descriptor` is plain data only: `{ status: "resolved", elementTag, componentName, className, componentPath }` where `componentName` is the owning instance's host tag name lowercased, `className` its constructor name and `componentPath` the distinct constructor names walked up from the picked element; or `{ status: "no-dev-api", reason }` when the element's `__ngContext__` is undefined; or `{ status: "no-component" }` when a dev context has no owning instance. No page object, function or `__ngContext__` value crosses.
- No `angular-ai:picked` within 1500 ms of the lock makes the overlay emit `{ status: "unavailable", reason }` and keep the rect; `no-dev-api`, `no-component` and `unavailable` are three named outcomes and are never collapsed into one.

## Intent coverage

- SC2

## Acceptance criteria

1. The route is lazy, adds no eager reference, and leaves the panel's initial bundle pin and its recorded baseline untouched; `npm run check:panel` and the panel unit target both stay green (SC2).
2. The surface renders exactly one of seven named states per render — awaiting the page's answer, armed, locked with a resolved descriptor, cancelled, unavailable, no dev context, no component — and `null` from the service never renders as an empty or cancelled state (SC2).
3. Every state, command and descriptor field has its own `data-testid` that is not `component-picker` and does not shadow a shipped test id.
4. The resolved state names the element tag, the component name and the class path exactly as the payload carried them, with no page read, no re-run probe and no fallback to page inspection (SC2).
5. The no-dev-api state renders its reason verbatim as a state rather than an error, and is distinguishable on screen from the no-component state (SC2).
6. Arming and cancelling send the picker command with the inspected tab id, and a failed send leaves the surface saying what failed instead of showing an armed state.
7. `page-picker.component.spec.ts` covers all seven states, both commands, the failed-send path and the descriptor's field projection, and the panel's existing specs still pass.

## Verify

```bash
npm ci --include=dev && npm run check:panel && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The panel's type check and one spec are enough here; the
     aggregate suite is the last task's gate. -->

Heavy: no

## Log

- 2026-11-03 — created by planner

- The panel's two senders live in `extension-message.service.ts` and are added by **this** task: `sendPickerCommand(action: 'arm' | 'cancel')` and the `tabId` it needs. T007 shipped the typed readers (`pickerState`, `picked`) and the message transport; the sender half was homeless, and this task now declares the file so the command path has an owner.

- 2026-11-03 — T009 — NEEDS-ORCHESTRATOR: may `files` gain `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`? Adding the one lazy picker route to `app.routes.ts` reddens that spec's exact route-list assertion at `:601-616` — proved by inserting one extra lazy route and running the file (`chat-entry.component.spec.ts:603` `expected [ '', 'signal-provenance', …(6) ] to deeply equal [ '', 'signal-provenance', …(5) ]`, 17 passed | 1 failed), then restoring the file byte-for-byte — so AC7's "the panel's existing specs still pass" is unreachable inside the declared paths, and the aggregate `npm test` T010 gates on runs that same spec; readings: (a) `files` gains that spec and Approach/AC7 name the one-line repair (its expected route list learns the lazy `picker` route), (b) AC7 covers only the specs this task does not touch and the red route-shape assertion belongs to a later task — blocked

- **This task owns one line of `chat-entry.component.spec.ts`**: its exact route list and its lazy-route list are the two assertions that redden the moment the picker route exists (proven at T009's first preflight: `Tests 1 failed | 17 passed`), so AC7's "the panel's existing specs still pass" holds only if the expected lists learn the lazy `picker` route in the same change.

- build_T009b: added `apps/angular-ai-devtools/src/app/page-picker.component.ts` — one exported pure projection, `pickerSurface(state, picked)`, answering exactly one of seven `PickerSurfaceKind`s (`awaiting-page`, `armed`, `locked`, `cancelled`, `unavailable`, `no-dev-api`, `no-component`) and one `@Component` that renders it through one `data-testid` branch (`picker-state-<kind>` on a `[attr.data-testid]`, plus `data-state` on `picker-surface`). `null` from the service is `awaiting-page` and never an empty or cancelled pick; the locked rendering prints `picker-element-tag` / `picker-component-name` / `picker-class-name` / `picker-component-path` (one `picker-path-entry` per name, `picker-component-path-empty` for an empty path) exactly as the payload carried them, with `null` members rendered as `not carried` — nothing is read from the page or re-derived. `no-dev-api` renders its reason verbatim in `picker-no-dev-api-reason` as a state (its own sentence names the missing dev context), `no-component` has no reason element and its own sentence, `unavailable` and `cancelled` each keep their own reason element (`picker-unavailable-reason`, `picker-cancelled-reason`); the projection's precedence is documented and tested — a descriptor is the more specific answer while the page says `armed`, and the two terminal states (`cancelled`, `unavailable`) retire a held descriptor. Commands are `picker-arm` / `picker-cancel`; a failed send writes `picker-command-failure` (`Arming the picker failed: <reason>` / `Cancelling the pick failed: …`) and a later successful send clears it. Every id is `picker-` prefixed, so none is `component-picker` and none shadows a shipped id (asserted by scanning every rendered `data-testid`).

- build_T009b: `extension-message.service.ts` gains the sender half T007 left homeless — `PickerAction` (`'arm' | 'cancel'`), `PickerCommandOutcome` (`{status:'sent'}` | `{status:'failed', reason}`) and `sendPickerCommand(action)` sending `{ type: 'angular-ai:picker-command', tabId: <inspectedTabId>, action }` through the `chrome.runtime.sendMessage` shape the replay already uses (runtime kept from construction). The outcome is a value, never a throw: a missing runtime, a throwing transport and a `{ ok: false, reason }` background refusal all resolve `failed` with words (the background's own reason verbatim when it gave one), and there is no retry. No armed state is ever synthesised in the panel — `armed` stays the page's `angular-ai:picker-state`. `app.routes.ts` gains one `loadComponent` entry, `path: 'picker'`, beside the two shipped lazy routes, and `chat-entry.component.spec.ts` learns that one path in its two expected lists (route order and lazy-route list) and nothing else changed there. `page-picker.component.spec.ts` (18 tests) covers all seven states one per render, `null` never as empty/cancelled, the descriptor field-by-field, `no-dev-api` vs `no-component`, the `picker-` test-id rule, both commands one send per click, the failed send and its clearing, the route's laziness, and the projection's precedence; `extension-message.service.spec.ts` grows four cases (+33 total in that file) for the command payload with `tabId: 5`, the refusal, the throwing transport and the absent runtime.

- build_T009b: Verify (`npm ci --include=dev && npm run check:panel && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`) exit 0; tail:
  ```
   ✓  angular-ai-devtools  apps/angular-ai-devtools/src/app/page-picker.component.spec.ts (18 tests) 145ms

   Test Files  1 passed (1)
        Tests  18 passed (18)
     Start at  07:07:29
     Duration  1.08s (transform 110ms, setup 224ms, import 93ms, tests 145ms, environment 403ms)

   NX   Successfully ran target test for project angular-ai-devtools

  Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
  ```
  The same spec re-run with `--skip-nx-cache` also reported `Test Files 1 passed (1)` / `Tests 18 passed (18)` (145 ms of tests, not a cached replay). The aggregate `npm test` was green at this head too: root `node:test` 590 tests / 590 pass / 0 fail, then the skills and user-scope suites, then `npx nx run angular-ai-devtools:test` 30 files / 331 tests passed (including `chat-entry.component.spec.ts` 18/18). Bundle, measured after `npx nx run angular-ai-devtools:build-extension`: initial total 532.47 kB (532,468 B over 7 eager files) against the 535.44 kB / 535,440 B pin — 2,972 B of headroom — and `chunk-F-HMWHb0.js | page-picker-component | 7.14 kB` appears under `Lazy chunk files`, not in the initial table, so the surface adds no initial byte beyond the route literal; `scripts/panel-bundle-budget.test.mjs` prints `measured initial total 532.47 kB (532468 B over 7 eager files)` and passes with its two pins untouched. That build rewrote the tracked `extension/panel/index.html` (stale base state referenced a chunk no longer on disk, which is why the pin skipped as `incomplete` at base); the file was restored byte-for-byte afterwards, so the diff holds only the declared paths.

- ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t009-verify): pass, exit 0; output tail:
  ```
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      43ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  ```
- 2026-11-03 — orchestrator regression Verify of T007 (sidecar gsd-path-verify/task-t009-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      6.5s
    Cache:             0/1 hit (0%)
    Critical path:     6.5s (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  ```
