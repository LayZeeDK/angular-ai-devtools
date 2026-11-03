# Intent — M022 in-page-overlay

Lane: milestone
Review panel: off
Finding skeptics: off

## Summary

Ship the tool's in-page overlay: one host element with a closed Shadow DOM, attached once at
`document_start`, that draws a tracked rect and label for a picked element and hosts the
`elementFromPoint` picker. The picker locks on click in the page and hands the panel a resolved
component descriptor, because the panel cannot see or hold the page's `__ngContext__`. This is the
first code the programme puts where an inspected page can observe it, so its footprint is the
compatibility surface.

## Problem

The panel can read a page's Angular introspection only through `angular-ai:state`, which is a
snapshot with no way back: there is no panel-to-page channel, no way to point at an element, and no
way to show which element a claim is about. `DiDoctorService.queryDi` has no caller, and the page
already carries one tool-created node (`#angular-ai-devtools-marker`), so "the overlay is the only
DOM" is false today by exactly one node. Without the overlay the panel's answers cannot be tied to
a specific element, which is what every explainer surface needs next.

## Users

A developer inspecting an Angular app through the panel who needs to see which element a finding is
about, and needs the picked element's owning component named, including when the element sits inside
a component's view rather than at its host.

Surfaces: inspected page

## Success criteria

1. The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component.
2. Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host.
3. No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed.
4. The host is inserted exactly once per page load, asserted across a re-injection attempt.
5. The inspected page carries no Angular of the tool's own: the `ɵsetProfiler` list and the feature fingerprint read the same with and without the overlay installed.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC1 | precision | held-out | A `transform: translate(...) scale(...)` on an ancestor yields the transformed box within one CSS pixel of `getBoundingClientRect`, and a rotated ancestor yields the axis-aligned box the label documents. |
| E2 | SC1 | boundary | held-out | At the document's extreme scroll positions, and for a zero-size element, the label stays inside the viewport and is never clipped outside it. |
| E3 | SC1 | adjacency | held-out | At `devicePixelRatio` 1 and 2 the box is drawn in CSS pixels; a box computed in device pixels is off by the ratio and fails. |
| E4 | SC2 | empty | held-out | A picked element with no `__ngContext__` (a production build) yields a named `no-dev-context` outcome, distinct from "no component found". |
| E5 | SC2 | precision | held-out | An element inside a component's view resolves to that component, not to its host's parent. |
| E6 | SC3 | boundary | held-out | A mutation inside the host subtree reaches no tool observer while a mutation on a page node does, so deleting the exclusion makes the test fail. |
| E7 | SC4 | idempotency | held-out | A second injection attempt leaves exactly one host, changes nothing, and does not throw. |
| E8 | SC5 | none | dismissed | SC5 is a differential measurement of existing outputs, with no data shape of its own. |
| E9 | SC6 | none | dismissed | SC6 aggregates the type check and the test suite, with no data shape of its own. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC1 | Write to the page's own nodes or stylesheets; the host's shadow root is the only surface the tool may style or move | judgment | AR-3 and the compatibility risk: a page that inherits the tool's CSS is a page defect the tool caused. |
| N2 | SC2 | Serialize the live `__ngContext__` or any page object across the message boundary; only a plain descriptor may cross | judgment | The boundary is JSON; a live object round-trips as an empty shape and reads as "no component". |
| N3 | SC4 | Attach a second host, or throw when a second injection is attempted | judgment | Re-injection happens on SPA route changes and on extension reload; a throwing overlay breaks the page it inspects. |
| N4 | SC3 | Rely on the page's own observers excluding the host; only the observers the tool owns are in scope | judgment | AR-4 is the tool's own correctness dependency, and a page's observers are the page's business. |
| N5 | SC5 | Load Angular, Angular Elements or any framework runtime into the page realm | judgment | AR-2: the tool's own Angular corrupts the profiler list, the feature fingerprint and the dev-mode counters. |
| N6 | SC4 | Re-attach on every navigation or mutation event; attachment is once per document | judgment | A host per navigation is the second-host defect by another route, and it is how an overlay leaks. |
| N7 | SC6 | Weaken the `agent-main` forbidden-token check, the manifest pin or the bundle baseline to fit the new page module | judgment | The pins are what keep a page-realm module from quietly becoming a second framework. |

## Scope

In:
- One host element with a closed Shadow DOM, attached once at `document_start`.
- Rect tracking through scroll, zoom, CSS transforms and device pixel ratio.
- The `elementFromPoint` picker and its hover, lock and cancel states, driven from the panel.
- `__ngContext__` and `getOwningComponent` resolution from a picked element to its owning component.
- The AR-4 exclusion rule: every `MutationObserver` the tool owns excludes the host subtree.
- A plain-DOM implementation of roughly 400 lines with no Angular in the inspected page (AR-2).
- Leaving exactly one tool-created element in an inspected page: the marker node at
  `extension/relay.js:50-54` is either retired or becomes the host, and a page-DOM assertion pins
  whichever choice is made.
- A request/response channel for the picker, since none exists today: arm, lock, cancel, and the
  resolved descriptor as plain data.

Out:
- A second widget, a second host element, an injected panel, a toast, an input or a navigation
  control in the page; AR-3 makes the overlay the only DOM and AR-6 keeps the rest in the panel.
- Angular, Angular Elements or any framework runtime in the inspected page.
- Cross-frame outlining (AR-5) and therefore a host per frame.
- Rewriting the page's styles, moving its nodes or wrapping its elements.
- Code generation of app code; `@angular/animations`; Angular SSR; `angular/components`.
- Pinch zoom (`visualViewport.scale`); it changes no layout coordinate, so it is not a rect input.
- Component-level graph navigation in the page; the panel owns navigation (AR-6).

## Constraints

- AR-2: no framework runtime in the inspected page; the overlay is plain DOM.
- AR-3: the overlay is the only DOM the tool adds to a page.
- AR-4: every tool-owned `MutationObserver` excludes the host subtree.
- AR-5: single frame; no host per frame.
- AR-6: every confirmation and every navigation stays in the panel.
- The extension manifest declares both content scripts at `document_idle` and reads no
  `all_frames`; a `document_start` script is a new declaration and no test reads the manifest today,
  so the manifest gains a pin of its own.
- `extension/agent-main.test.mjs:1000-1012` rejects `createElement(`, `appendChild(` and
  `innerHTML` at source level for the MAIN-world script; the overlay lives in a new file with its
  own blast-radius pin rather than widening that test.
- The initial bundle baseline (530,721 B) is unchanged by a page-realm module only if the module is
  not imported by the panel; the budget pin must stay green.
- The audit's carried alignment queue is not this milestone's work; its rulings stay `planned: no`.

## Current state

Brownfield. `extension/relay.js:50-54` creates `#angular-ai-devtools-marker` in the light DOM on
every Angular page and never removes it, and `relay.test.mjs:37-39` stubs `createElement` and
`appendChild`, so the node is real in every session and invisible to the suite. Both content scripts
are declared `document_idle`, the manifest is read by no test, and there is no panel-to-page
transport: `relay.js:34-38` answers only the replay and returns `false` otherwise, and
`background.js:8-61` routes nothing else into a page. `page-reads.ts:14-20` defaults to
`host-unavailable`, and `di-doctor.service.ts:23-26` has no caller. There is no `attachShadow`,
no `elementFromPoint` and no `visualViewport` use anywhere in the tree, so every part of the
overlay is new code rather than a change to an existing one.

## Risks

- AR-4 is a correctness dependency for N7, FOR-1 and CF-1, so an observer that sees its own host
  makes three features silently wrong in a way that reads as a page defect.
- A closed Shadow DOM keeps the page's CSS out and the tool's own debugging in; the picker needs a
  panel-visible state for what it cannot see.
- `__ngContext__` is present on a dev build and absent on a production one, so resolution must
  report the difference rather than return nothing.
- Device pixel ratio and CSS transforms are where a rect overlay is usually off by a few pixels, and
  a few pixels is indistinguishable from picking the wrong element.
- The overlay is the only programme-1 code an inspected page can observe, so its footprint is a
  compatibility surface rather than an implementation detail.
- Retiring or absorbing the marker node touches the relay's boot path, which every existing browser
  check depends on; a regression there fails eight checks at once.

## Open questions

- [RESEARCH] Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope?

## Corrections

- 2026-11-03 (delegated): under the recorded grant — "Ship the program worth of milestones … you would have continued autonomously", recorded as `pre-approval: {"kinds": ["intent","plan","rulings","ship"]}` — the NEEDS-USER question "should the picker lock on click, or require a confirm in the panel" is ruled **lock on click, navigate from the panel**: a click locks the picker and the page reports the resolved descriptor; opening the component is a panel action, which satisfies AR-6 and leaves the page with no navigation control.
- 2026-11-03 (delegated): the marker node is not a second host. Whichever way it is resolved — retired, or promoted into the host — a page-DOM assertion pins "exactly one tool-created element per page", because AR-3 is a count, not a shape.
- 2026-11-03 (delegated): resolution runs in the page realm and returns a plain descriptor (`componentName`, `elementTag`, path of class names) plus a named outcome for the production build, since `__ngContext__` cannot cross the boundary and its absence is a state, not an error.
- 2026-11-03 (delegated): "zoom" in SC1 means CSS `zoom` and CSS transforms on ancestors, including the page-zoom case that surfaces as a `devicePixelRatio` change. Pinch zoom is out because it moves no layout coordinate.
