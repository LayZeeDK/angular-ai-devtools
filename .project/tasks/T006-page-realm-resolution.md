---
id: T006
title: Resolve a picked page element to its owning component in the page realm
wave: 2
deps: [T001]
status: done
agent: build_T006
base: c91fb02a50e976b6a415e063b426be65ccbc8483
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
---

# T006 — Resolve a picked page element to its owning component in the page realm

## Context

Resolution has to run in the MAIN world, because that is the only place `ng` and its debug functions exist; the overlay lives in the isolated world and cannot read page JavaScript globals, so the hop between them carries a DOM node and never a JavaScript object. The shipped element-to-instance resolution already uses `ng.getOwningComponent` over a fixed element chain, and that is the resolver a picker needs: `getComponent` returns null for an element inside a component's view and would fail the case the milestone exists to get right. The panel names components by their host tag name lowercased, so the descriptor has to carry that same identifier or the pick lands nowhere in the panel's existing lists, and `__ngContext__` cannot cross the message boundary at all — its absence is a state, not an error. T001's recording is what justifies the reason string that state carries.

## Approach

- **One listener, registered beside the shipped ones.** Add a capture-phase listener on `globalThis` for the pick event, feature-detect the component getter the way the rest of the file does, and answer with the descriptor event on `globalThis`. No second global, no second event type, no DOM node: the file's forbidden-token scan (no `createElement`, no `appendChild`, no `innerHTML`) and its one-global pin must both stay green, which they do because the listener writes nothing.
- **Capture, and read `event.target`.** The overlay dispatches the pick event on the picked element itself with `bubbles: true, composed: false`; a capture listener on `globalThis` sees it whatever the page's own bubble-phase listeners do, and `event.target` is the DOM node the cross-world hop carries. Never read a `detail` object: its cross-world semantics are unverified in this tree while the shared DOM is not.
- **`getOwningComponent`, not `getComponent`.** Resolve the picked element, then walk `parentElement` upward collecting distinct constructor names for the path, bounded by ancestor depth and never by a document-wide query. An element inside a component's template must resolve to that component, not to the component whose host contains it — that is the case the resolver choice decides.
- **Three named outcomes, never collapsed.** `element.__ngContext__ === undefined` answers the no-dev-context outcome with a reason that names the possibility of a production build instead of asserting one, because T001 measures which builds carry the property and the page cannot tell its own configuration for certain. A dev context with no owning instance answers no-component. A resolved pick carries the host tag name lowercased as the component name, the constructor name as the class name, and the path of constructor names.
- **Plain data only, and never a throw.** Every branch sits inside `try/catch` and no page exception escapes into the page's own loop. The payload is strings and string arrays: no instance, no element, no function and no `__ngContext__` value may appear anywhere in it, and the test asserts that a JSON round-trip of the dispatched payload equals itself.
- **The sandbox is the page.** `extension/agent-main.test.mjs` boots the shipped script with a stubbed `ng` and a stubbed document, so the new cases drive the listener with a fabricated element and a fabricated owning instance. Cover the two edges the milestone holds out — an element inside a view, and an element without a dev context — plus the no-component case, the descriptor's identifier shape, and the absence of any new global or DOM write.

## Interface contract

- Down: `{ type: "angular-ai:picker-command", tabId, action: "arm" | "cancel" }` is sent by the panel, validated and forwarded by the background with `chrome.tabs.sendMessage`, re-dispatched inside the page as `new CustomEvent("angular-ai:picker-command", { detail: { action } })` on `window`, and consumed by the overlay.
- Up: `{ type: "angular-ai:picker-state", tabId, status: "armed" | "cancelled" | "unavailable", reason? }` and `{ type: "angular-ai:picked", tabId, descriptor }` leave the overlay as `CustomEvent("angular-ai:picker-state")` and `CustomEvent("angular-ai:picked")` on `window`, ride the relay's shipped forwarding shape, are re-broadcast by the background with `tabId`, and are read in the panel through one signal each.
- Lock: on a click the overlay dispatches `new CustomEvent("angular-ai:pick", { bubbles: true, composed: false })` on the picked element itself, and the MAIN-world capture listener registered on `globalThis` reads `event.target` and answers `CustomEvent("angular-ai:picked", { detail: descriptor })` on `window`.
- `descriptor` is plain data only: `{ status: "resolved", elementTag, componentName, className, componentPath }` where `componentName` is the owning instance's host tag name lowercased, `className` its constructor name and `componentPath` the distinct constructor names walked up from the picked element; or `{ status: "no-dev-context", reason }` when the element's `__ngContext__` is undefined; or `{ status: "no-component" }` when a dev context has no owning instance. No page object, function or `__ngContext__` value crosses.
- No `angular-ai:picked` within 1500 ms of the lock makes the overlay emit `{ status: "unavailable", reason }` and keep the rect; `no-dev-context`, `no-component` and `unavailable` are three named outcomes and are never collapsed into one.

## Intent coverage

- SC2

## Acceptance criteria

1. A capture-phase listener registered on `globalThis` for the pick event reads `event.target`, feature-detects the component getter the way the file already does, and dispatches the descriptor event with a plain payload (SC2).
2. The resolver is `getOwningComponent`: an element inside a component's template resolves to that component, not to the component whose host contains it (E5: an element inside a component's view resolves to that component, not to its host's parent).
3. An element whose `__ngContext__` is undefined answers the no-dev-context outcome with a reason that names the possibility of a production build rather than asserting one, and that outcome is never collapsed into no-component (E4: a picked element with no `__ngContext__` (a production build) yields a named `no-dev-context` outcome, distinct from "no component found").
4. A dev context with no owning instance answers the no-component outcome, and the three outcomes are distinguishable in the dispatched payload.
5. A resolved descriptor carries the host tag name lowercased as the component name, the constructor name as the class name, and the distinct constructor names walked up from the picked element as the path, bounded by ancestor depth with no document-wide query.
6. Every branch is inside a `try/catch` and throws nothing into the page; the payload contains no page object, function or `__ngContext__` value, proven by a JSON round-trip, and no new `globalThis` property and no DOM node is created.
7. `extension/agent-main.test.mjs` drives the listener with a fabricated element and owning instance for every outcome and for the two held-out edges, and the file's existing forbidden-token and one-global pins stay green and unextended.

## Verify

```bash
npm ci --include=dev && node --test extension/agent-main.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The suite boots the shipped script in a sandbox, so it needs no
     browser and no fixture. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
- 2026-11-03 — implementation: one capture-phase `angular-ai:pick` listener beside the shipped ones reads `event.target`, resolves through `ng.getOwningComponent` with a depth-bounded distinct-class path walk, and answers `angular-ai:picked` with a plain descriptor or the named `no-dev-api` / `no-component` outcome (INTENT § Corrections 2026-11-03 vocabulary — the task's `no-dev-context` text is stale); 11 new sandbox cases; Verify `npm ci --include=dev && node --test extension/agent-main.test.mjs` exit 0 (tests 50, pass 50, fail 0) — ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
    ✔ falls back to the class name lowercased when the host element cannot be read (AC5) (0.157ms)
  ✔ agent-main.js (page-realm pick resolution) (5.7968ms)
  ℹ tests 50
  ℹ suites 13
  ℹ pass 50
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 755.0559
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
  ```
- 2026-11-03 - the implemented outcome is no-dev-api per INTENT Corrections; the AC text still spelled no-dev-context, and T007-T009 were repaired to the corrected word in the same commit
