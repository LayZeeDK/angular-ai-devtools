---
id: T009
title: Render the picker's named states and its two commands in a lazy panel route
wave: 3
deps: [T007]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
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
- **The descriptor is displayed, never re-derived.** The resolved state names the element tag, the component name and the class path exactly as the payload carried them. The surface never reads the page, never re-runs a probe and never falls back to page inspection; `no-dev-context` renders its reason verbatim as a state, not as an error, which is the difference the milestone ships between "this page has no Angular dev context" and "this element belongs to no component".
- **The two commands go out through the service, and a refusal is visible.** Arming and cancelling send the picker command with the inspected tab id the way the shipped replay request does, and a failed send leaves the surface saying what failed rather than showing an armed state. There is no retry loop and there is no polling.
- **The spec owns the vocabulary.** `page-picker.component.spec.ts` renders the surface with each of the seven states from a stubbed message service, asserts one state per render, asserts the two commands' payloads and the failed-send path, and asserts that the descriptor's fields are rendered as carried. Keep the component's decisions in a small pure projection where one is worth testing, so the spec asserts a decision rather than a template's punctuation.

## Interface contract

- Down: `{ type: "angular-ai:picker-command", tabId, action: "arm" | "cancel" }` is sent by the panel, validated and forwarded by the background with `chrome.tabs.sendMessage`, re-dispatched inside the page as `new CustomEvent("angular-ai:picker-command", { detail: { action } })` on `window`, and consumed by the overlay.
- Up: `{ type: "angular-ai:picker-state", tabId, status: "armed" | "cancelled" | "unavailable", reason? }` and `{ type: "angular-ai:picked", tabId, descriptor }` leave the overlay as `CustomEvent("angular-ai:picker-state")` and `CustomEvent("angular-ai:picked")` on `window`, ride the relay's shipped forwarding shape, are re-broadcast by the background with `tabId`, and are read in the panel through one signal each.
- Lock: on a click the overlay dispatches `new CustomEvent("angular-ai:pick", { bubbles: true, composed: false })` on the picked element itself, and the MAIN-world capture listener registered on `globalThis` reads `event.target` and answers `CustomEvent("angular-ai:picked", { detail: descriptor })` on `window`.
- `descriptor` is plain data only: `{ status: "resolved", elementTag, componentName, className, componentPath }` where `componentName` is the owning instance's host tag name lowercased, `className` its constructor name and `componentPath` the distinct constructor names walked up from the picked element; or `{ status: "no-dev-context", reason }` when the element's `__ngContext__` is undefined; or `{ status: "no-component" }` when a dev context has no owning instance. No page object, function or `__ngContext__` value crosses.
- No `angular-ai:picked` within 1500 ms of the lock makes the overlay emit `{ status: "unavailable", reason }` and keep the rect; `no-dev-context`, `no-component` and `unavailable` are three named outcomes and are never collapsed into one.

## Intent coverage

- SC2

## Acceptance criteria

1. The route is lazy, adds no eager reference, and leaves the panel's initial bundle pin and its recorded baseline untouched; `npm run check:panel` and the panel unit target both stay green (SC2).
2. The surface renders exactly one of seven named states per render — awaiting the page's answer, armed, locked with a resolved descriptor, cancelled, unavailable, no dev context, no component — and `null` from the service never renders as an empty or cancelled state (SC2).
3. Every state, command and descriptor field has its own `data-testid` that is not `component-picker` and does not shadow a shipped test id.
4. The resolved state names the element tag, the component name and the class path exactly as the payload carried them, with no page read, no re-run probe and no fallback to page inspection (SC2).
5. The no-dev-context state renders its reason verbatim as a state rather than an error, and is distinguishable on screen from the no-component state (SC2).
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
