---
id: T008
title: Draw the tracked rect and label in the overlay, and make hover, lock and cancel work
wave: 2
deps: [T002, T005, T006, T007]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/overlay-geometry.js
  - extension/overlay-geometry.test.mjs
  - extension/overlay.js
  - extension/overlay.test.mjs
  - research/raw/m022-pick-hop.json
---

# T008 — Draw the tracked rect and label in the overlay, and make hover, lock and cancel work

## Context

The overlay is the programme's only page-observable code, and the product claim about it is geometry: a box that stays on a picked element through scroll, CSS `zoom`, an ancestor transform and a `devicePixelRatio` change, with a label that names the element and its owning component. Nothing in shipped code measures layout at all — there is no scroll or resize listener anywhere and no `getBoundingClientRect` use — so every input has to be observed for the first time, and the usual failure is not a missing box but a box a few pixels off, which is indistinguishable from picking the wrong element. The host is `position: fixed` inside a closed root, so viewport coordinates need no scroll-offset arithmetic and every style write is invisible to page observers; the picker's hover answer comes from `document.elementFromPoint`, whose ruling the hit-test probe recorded.

## Approach

- **Geometry is a pure module, tested without a DOM.** `extension/overlay-geometry.js` takes a rect, a viewport box and the device pixel ratio and returns the box and the label anchor in CSS pixels. It reads `getBoundingClientRect()` verbatim, never multiplies by the ratio and never rebuilds a matrix: `getBoundingClientRect` is already CSS pixels and already the axis-aligned transformed box, so a rotated ancestor's box is the axis-aligned one the label documents. A zero-size element draws a 1 px outline at the point. Label clamping uses the visual viewport's width, height and offsets when they exist and the document element's client box otherwise, and keeps the label inside the viewport at both extreme scroll positions.
- **Five inputs, one dirty flag, one loop.** Attach a capture-phase scroll listener (an element's scroll does not bubble), a resize listener, the visual viewport's resize and scroll listeners when it exists, and a `matchMedia('(resolution: Xdppx)')` change listener re-registered on every fire, because CSS `zoom` and page zoom surface as a ratio change. Each sets one flag; a single `requestAnimationFrame` loop recomputes at most once per frame and clears it. The frame loop is the only input that catches a CSS transform on an ancestor, which emits no event. Detach every listener on cancel and on a completed pick, and never add an observer kind — a `ResizeObserver` would be the tool's first observer AR-4 does not name.
- **Hover, and what the host means.** Hover resolves through `document.elementFromPoint(x, y)`. A hit that returns the host is the tool, not a candidate, and is skipped in favour of nothing; a hit on a page element is the candidate. `visualViewport.scale` is read for nothing: pinch zoom moves no layout coordinate and is out of scope.
- **Lock on click, report every state the page cannot show.** The corrections rule is lock on click and navigate from the panel: a click locks, hovering stops, the rect holds, and the overlay dispatches the pick event on the picked element with `bubbles: true, composed: false`. It reports `armed`, `cancelled` and the bounded `unavailable` outcome as picker state, and it never adds a button, toast, input or navigation control to the page. After 1500 ms with no answer it emits the unavailable outcome with a reason and keeps the rect.
- **The label is the surface.** The label names the element's tag and, once the descriptor arrives, its component — the host tag name lowercased — plus the class name. The three outcomes are three different labels, never one empty box: a resolved pick, a pick whose element carries no dev context (with the reason naming the possibility of a production build), and a pick whose dev context has no owning component.
- **Cancel leaves the host, not the drawing.** Cancel removes the rect and the label from the closed root, detaches every listener, disconnects the overlay's observer and reports the cancelled state; the host stays attached, because a second host is the defect AR-3 forbids and re-attaching on navigation is how an overlay leaks.
- **Record the cross-world hop once.** The dispatch and the answer travel between two worlds over a DOM event, and the one assumption behind that is `event.target` surviving the hop. Record a reading in `research/raw/m022-pick-hop.json` — profile, fixture page, the element tag that was picked, the descriptor the page realm returned, and the fact that the listener read `event.target` rather than a payload object — and let the test fail when the recording is absent. The suite also asserts the dispatch shape itself (`bubbles: true`, `composed: false`, dispatched on the element, not on the window), so the half the code owns is pinned even when the recording is only quoted.

## Interface contract

- Down: `{ type: "angular-ai:picker-command", tabId, action: "arm" | "cancel" }` is sent by the panel, validated and forwarded by the background with `chrome.tabs.sendMessage`, re-dispatched inside the page as `new CustomEvent("angular-ai:picker-command", { detail: { action } })` on `window`, and consumed by the overlay.
- Up: `{ type: "angular-ai:picker-state", tabId, status: "armed" | "cancelled" | "unavailable", reason? }` and `{ type: "angular-ai:picked", tabId, descriptor }` leave the overlay as `CustomEvent("angular-ai:picker-state")` and `CustomEvent("angular-ai:picked")` on `window`, ride the relay's shipped forwarding shape, are re-broadcast by the background with `tabId`, and are read in the panel through one signal each.
- Lock: on a click the overlay dispatches `new CustomEvent("angular-ai:pick", { bubbles: true, composed: false })` on the picked element itself, and the MAIN-world capture listener registered on `globalThis` reads `event.target` and answers `CustomEvent("angular-ai:picked", { detail: descriptor })` on `window`.
- `descriptor` is plain data only: `{ status: "resolved", elementTag, componentName, className, componentPath }` where `componentName` is the owning instance's host tag name lowercased, `className` its constructor name and `componentPath` the distinct constructor names walked up from the picked element; or `{ status: "no-dev-api", reason }` when the element's `__ngContext__` is undefined; or `{ status: "no-component" }` when a dev context has no owning instance. No page object, function or `__ngContext__` value crosses.
- No `angular-ai:picked` within 1500 ms of the lock makes the overlay emit `{ status: "unavailable", reason }` and keep the rect; `no-dev-api`, `no-component` and `unavailable` are three named outcomes and are never collapsed into one.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. The box tracks a picked element through scroll, CSS `zoom` and an ancestor `transform: translate(...) scale(...)`: the drawn box equals `getBoundingClientRect()` within one CSS pixel, and a rotated ancestor draws the axis-aligned box the label documents (E1: a `transform: translate(...) scale(...)` on an ancestor yields the transformed box within one CSS pixel of `getBoundingClientRect`, and a rotated ancestor yields the axis-aligned box the label documents).
2. The label stays inside the viewport at both extreme scroll positions and for a zero-size element — which draws a 1 px outline at the point — using the visual viewport's box and offsets when present and the document element's client box otherwise (E2: at the document's extreme scroll positions, and for a zero-size element, the label stays inside the viewport and is never clipped outside it).
3. The drawn box is in CSS pixels at `devicePixelRatio` 1 and 2: the ratio is never multiplied into the geometry and never used to rebuild a matrix, so a box computed in device pixels is off by the ratio and fails (E3: at `devicePixelRatio` 1 and 2 the box is drawn in CSS pixels; a box computed in device pixels is off by the ratio and fails).
4. The five inputs and the single frame loop behave as decision 6 fixes: capture-phase scroll, resize, the visual viewport's resize and scroll, a re-registered resolution media-query change, and one animation-frame loop over one dirty flag that recomputes at most once per frame; every listener is detached on cancel and on a completed pick and no observer kind is added.
5. Hover resolves through `document.elementFromPoint`, a hit on the host is read as the tool and not as a candidate, `visualViewport.scale` is read for nothing, and a click locks the pick with hovering stopped and the rect held.
6. The label names the element and its owning component for a resolved pick (host tag name lowercased plus class name), renders a different label for the no-dev-api and no-component outcomes, and emits the unavailable outcome with a reason after 1500 ms without an answer while keeping the rect (SC1, SC2).
7. Every style write targets a node inside the closed root — never a page node and never an inline `width`/`top` on the host — cancel clears the drawing and detaches everything while the host stays attached, and the overlay adds no button, toast, input or navigation control to the page.
8. The cross-world hop is recorded in `research/raw/m022-pick-hop.json` with the profile, the fixture page, the picked element's tag and the descriptor the page realm returned, the suite asserts the dispatch shape the code owns (`bubbles: true`, `composed: false`, dispatched on the element), and a missing recording fails rather than skipping.

## Verify

```bash
npm ci --include=dev && node --test extension/overlay-geometry.test.mjs extension/overlay.test.mjs extension/observer-filter.test.mjs extension/relay.test.mjs extension/manifest.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The last four files are here because this task also declares
     extension/overlay.js and extension/overlay.test.mjs, which the host task
     owns, so that task's Verify must pass to land. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
