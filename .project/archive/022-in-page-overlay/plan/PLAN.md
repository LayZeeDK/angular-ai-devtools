# Plan — M022 in-page-overlay

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs`
<!-- Run once at ship, in a fresh sidecar checked out at the reviewed commit: no
     node_modules, no fixture install and no build output exist there. The last
     two steps exist because `extension/panel/` is git-ignored, so the bundle pin
     skips its only real assertion until `build-extension` has run. -->

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no per-wave resource cap -->
- review_panel: off      <!-- copied from INTENT.md: "Review panel: off" -->
- finding_skeptics: off  <!-- copied from INTENT.md: "Finding skeptics: off" -->

## Wave 1 — risk burn-down

Goal: Settle what can invalidate the plan, before anything draws. T001 measures whether `__ngContext__` exists on an element inside a component's template in a development build and whether it survives a production build, because E4's whole vocabulary and T006's descriptor rest on it: the milestone's `no-dev-context` outcome is only honest if the property is measurably absent from a production build rather than merely assumed to be. T002 measures what `document.elementFromPoint` returns over the tool's own closed shadow host with `pointer-events: none` and records the ruling that makes the picker's hover correct whatever the engine does, because evidence-exclusion rates the CSSWG retargeting resolution `medium` and the Blink statement unreadable. T003 rules which SC1 and SC2 claims need a portal-backed `lars-verify` verdict and leaves the driver that produces them, because the charter requires a portal-backed verdict wherever verification there is possible and meaningful and the milestone ships the only page-observable code in the programme. T004 lands the exclusion predicate itself, one implementation published once into the isolated world, filtering both shipped observers, with the relay's harness taught to capture the target, the options and the callback, the marker node retired, and the jsdom delivery assumption measured rather than assumed — if jsdom does not deliver a light-tree record to a document-level observer after a macrotask, the SC3 pin T005 writes has no bite and the plan changes here.
Review depth: full

## Wave 2 — walking skeleton

Goal: The thinnest end-to-end path from "the panel arms a pick" to "the panel holds a resolved component descriptor, and one host element sits in an inspected page". T005 attaches the single closed-shadow host once at `document_start` through a third manifest declaration that gains the manifest's first pin, retires the marker's replacement claim by carrying exactly one tool element, registers the overlay's own filtered observer, and proves the corrected SC3 shape. T006 registers the page-realm listener that turns a click on a page element into a plain descriptor with three named outcomes, because `__ngContext__` cannot cross the message boundary and `getOwningComponent` — not `getComponent` — is what resolves an element inside a component's view. T007 carries three message types over four in-page events through the background and the relay and into one panel signal each, so a pick is driven from the panel and its outcome comes back. T008 draws the tracked rect and label for a picked element, with the five inputs and one frame loop decision 6 fixes, hover through `elementFromPoint`, lock on click, cancel, and the bounded 1500 ms `unavailable` outcome — the overlay is now the product surface INTENT declares.

**SC3 restated by SYNTHESIS decision 2, carried verbatim and binding on T005:** In `extension/overlay.test.mjs` on jsdom: (1) boot the overlay so the host attaches and its observer registers; (2) collect every record the tool callback passes, and — if the module exports its predicate — the raw pre-filter list; (3) `document.body.appendChild(pageSpan)`, flush a macrotask, expect at least one passed record whose target is `pageSpan`; (4) `host.appendChild(new page.createElement("span"))`, flush, expect **zero** passed records mentioning the host while the raw list holds at least one; (5) expect the host's own insertion record absent from the passed list. Deleting the filter reddens (4) and (5); deleting `observe()` reddens (3). A mutation inside the shadow root is never the probe: a `MutationObserver` receives nothing from inside any shadow root, open or closed, so INTENT E6 as worded passes with the filter deleted. At the relay's two sites the same proof rides the existing `vm` harness: `relay.test.mjs`'s stub must keep the callback and the `observe()` arguments, the test must supply the host node, and a counting `document.querySelector` stub turns "filtered" into an assertion.
Review depth: full

## Wave 3 — the surface's other half and the proof

Goal: Close the product: T009 gives the panel the one control surface the page may not host — arm, cancel, and the named outcome the page cannot show through a closed root — on a lazy route with its own test ids, because `component-picker` is already three selects' testid and an eager route turns the bundle pin red for the wrong reason. T010 measures what the milestone's compatibility claim actually rests on: the same page booted with and without the overlay, comparing the `ɵsetProfiler` subscriber list and the published feature record, recording both arms, and then running the head's `npm run check` and `npm test` — because SC5 is a differential measurement of existing outputs, not a new shape, and SC6 is the aggregate gate that has to be true at the landed head rather than inferred from the parts.
Review depth: full

## Surface contract

### inspected page — T008

Criteria: SC1
Entry: An inspected Angular application served from `spikes/ng222-app` on its development configuration, loaded in one of the supported browser profiles with the extension built and loaded; the DevTools "Angular AI" panel is open on the same tab and the panel's `picker` route is armed. Nothing in this block is a panel rendering, and the page gains no element beyond the one host.
States:
- empty (nothing armed and nothing locked, which is the state of every page from `document_start` until the panel arms the picker): exactly one tool-created element exists — the `angular-ai-devtools-host` element with a closed shadow root holding nothing visible — the page's own layout, styles and nodes are untouched, and picking up the page's DOM shows no tool text, style or badge.
- loading (armed, pointer moving, or locked and waiting for the page realm's answer): a rect follows the hovered element and the label names it; after a click the rect holds still, the label keeps its text, and no state is displayed as final until the descriptor or the 1500 ms `unavailable` outcome arrives.
- error (`no-dev-context`, `no-component`, or `unavailable`): the label states the named outcome in words on the page — that this element carries no Angular dev context (naming the possibility of a production build rather than asserting one), that the dev context has no owning component, or that the page realm did not answer in time — while the rect stays where the element is, and the panel is left to say what it could not learn.
- success: a picked element draws a box over its own rect through scroll, CSS `zoom`, an ancestor transform and a `devicePixelRatio` change, and the label names the element and its owning component (the host tag name lowercased and the component class name), for an element at a component's host and for an element inside a component's template.
Walkthrough:
1. From the primary checkout: `npm ci --include=dev`, `npm --prefix spikes/ng222-app ci --include=dev`, `npx nx run angular-ai-devtools:build-extension`; serve the counter fixture (`node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`) and bring one instance up with `control-ai-browsers up`.
2. Open DevTools on the fixture and arm the picker from the panel's `picker` route: moving the pointer draws a rect on the hovered element and the label names the element, with no second tool element anywhere in the page's DOM.
3. Scroll the page and change the page's zoom: the rect stays on the element it was tracking, and the label stays inside the viewport at both extreme scroll positions.
4. Pick an element inside a component's template (a row or a button the counter renders): the label names that component, not the component whose host contains it.
5. Click the same element and open the page in a production build of the fixture: the label reports the named no-dev-context outcome rather than an empty box, and the panel says which state it received.
6. Cancel from the panel and reload the page: the host is present exactly once after the reload, and the page shows no tool element before the panel arms the picker again.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T008 | AC1 |
| SC1 | T008 | AC2 |
| SC1 | T008 | AC3 |
| SC1 | T008 | AC6 |
| SC2 | T006 | AC1 |
| SC2 | T006 | AC2 |
| SC2 | T006 | AC3 |
| SC2 | T006 | AC4 |
| SC2 | T006 | AC5 |
| SC2 | T007 | AC1 |
| SC2 | T007 | AC3 |
| SC2 | T007 | AC5 |
| SC2 | T008 | AC6 |
| SC2 | T009 | AC2 |
| SC2 | T009 | AC4 |
| SC2 | T009 | AC5 |
| SC3 | T004 | AC2 |
| SC3 | T004 | AC3 |
| SC3 | T005 | AC4 |
| SC3 | T005 | AC5 |
| SC4 | T005 | AC1 |
| SC4 | T005 | AC2 |
| SC4 | T005 | AC3 |
| SC4 | T010 | AC4 |
| SC5 | T010 | AC1 |
| SC5 | T010 | AC2 |
| SC5 | T010 | AC3 |
| SC6 | T010 | AC5 |
| SC6 | T010 | AC6 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T008 | extension/overlay-geometry.test.mjs |
| E2 | T008 | extension/overlay-geometry.test.mjs |
| E3 | T008 | extension/overlay-geometry.test.mjs |
| E4 | T006 | extension/agent-main.test.mjs |
| E5 | T006 | extension/agent-main.test.mjs |
| E6 | T005 | extension/overlay.test.mjs |
| E7 | T005 | extension/overlay.test.mjs |

## Dependency notes

- **T001 → T006 (a measured fact).** T001's recording decides whether `no-dev-context` is reachable at all and whether the production build can be named as its cause; T006 codes the three-outcome union the contract fixes, and T001's artifact is the only evidence a reviewer reads for the reason string's wording. A recording that contradicts the union is a plan repair, not a coder's choice: the union already covers both measured outcomes, so no outcome may be added or removed inside T006.
- **T004 → T005 (data and a landed effect).** The host id and the predicate are written in T004's Interface contract and implemented in the file T004 lands; T005 creates the host that id names and calls that predicate from the overlay's own observer. The marker retirement is the other half of the same landed effect: E7's one-element count is only true because the marker is gone before the host arrives, so T005 must land after T004 and not beside it. A reviewer sees the same id string in `extension/relay.js`, in `extension/observer-filter.js` and in `extension/overlay.js`, and sees `extension/relay.js` create no element at all.
- **T002 → T008 (a ruling).** T002's recording decides how a hit on the tool's own host is read; T008 implements exactly that mapping in the hover path and never leans on the engine retargeting the hit. A reviewer reads the recording's ruling side by side with the hover branch that maps the host to "the tool, not a candidate".
- **T005 → T008 (the same file).** T008 extends the module T005 creates: the host, the closed root and the filtered observer are T005's, and every style write T008 makes goes into that root. `extension/overlay.js` and `extension/overlay.test.mjs` are declared by both, which is why the two tasks are ordered inside one wave instead of run beside each other.
- **T006 → T008 (the listener and the descriptor).** T008 dispatches `angular-ai:pick` on the picked element and expects `angular-ai:picked` back; without T006's capture listener there is no answer and the 1500 ms outcome is the only one reachable, which the recording in `research/raw/m022-pick-hop.json` would show as a failure rather than as evidence.
- **T007 → T008 (the two directions of one channel).** The overlay consumes `angular-ai:picker-command` and emits `angular-ai:picker-state`/`angular-ai:picked`; T007 is what makes those events arrive from the panel and reach it, and the same five contract bullets are written in both task files.
- **T007 → T009 (one signal each).** The panel surface reads the two signals T007 writes and nothing else; it never re-derives a descriptor from page inspection, and it never names a third signal.
- **T005, T008, T009 → T010 (the differential).** T010's two arms need the overlay module, its observer and the lazy panel route to exist; its whole claim is that booting them changes neither the profiler subscription nor the published feature record. It lists no file those tasks own, so it adds no Verify to them, but it may not land before them.
- **The wave gate owns the two readings no task can re-take.** SYNTHESIS asks for a page-DOM count across a re-injection in a real browser and for a `lars-verify` verdict on the claims T003 rules on; both are taken at the wave gate from T003's driver, whose reading already carries the tool-element count, the drawn rect, the descriptor and the no-dev-context outcome. A task Verify that re-drove a browser would fail on a machine without an instance, so the gate is where the live reading belongs and `verdict.json` is where its result is cited.
- **Why three waves and not more.** Wave 1 is the four things that can invalidate the plan; wave 2 is the one end-to-end slice, ordered internally because the overlay's file, the relay and the panel's message service each carry two of its tasks; wave 3 is the panel half of the surface and the aggregate proof. A fourth wave would add a review cycle over one task carrying no risk of its own.
- **What the plan deliberately does not add.** No new Markdown document anywhere: the docs-audit gate derives its frozen inventory from the tracked Markdown tree and fails when the audit's covered set is not exactly that inventory, so every recorded artifact here is JSON under `research/raw/` or an executable test. No change to `extension/agent-main.test.mjs`'s forbidden-token scan (N7): the overlay gets its own blast-radius pin instead. No `PAGE_HOST`, `queryDi` or `angular-ai:di-query` work: the picker's three message types are not a general page-request transport. No page-side confirmation, toast, input or navigation (AR-6, N6), no `all_frames` (AR-5), and no new observer kind.
