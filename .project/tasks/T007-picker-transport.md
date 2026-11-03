---
id: T007
title: Carry the picker command and its outcomes between the panel and the page
wave: 2
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/background.js
  - extension/background.test.mjs
  - extension/relay.js
  - extension/relay.test.mjs
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
---

# T007 — Carry the picker command and its outcomes between the panel and the page

## Context

Nothing carries a request from the panel into the page today: the background handles five message types plus the replay route, none of which asks the page anything, and the relay's only runtime listener answers the replay request and returns false for every other type. The pieces a transport would ride on already exist in two places — a `chrome.tabs.sendMessage` call site with a named refusal when no relay answers, and an isolated-world runtime listener — so the missing part is three message types through the background, one forwarder pair in the relay, and one typed reader in the panel. `component-picker` is already the test id of three panel selects, so nothing here may reuse that vocabulary, and `host:capability`/`host:pick` belong to the Prompt API host and are not to be extended.

## Approach

- **Follow the shipped refusal, not a new one.** The down branch validates the tab id and answers `{ ok: false, reason }` naming what was missing, exactly as the state request does, then forwards through `chrome.tabs.sendMessage` and reports a named refusal when no relay answers. A panel that gets silence cannot tell "no tab" from "no relay"; a panel that gets a reason can.
- **Reuse the relay's forwarding shape.** The relay's runtime listener gains one branch: it re-dispatches the command as a window event the overlay listens for, keeping the replay answer byte-for-byte. The relay's four shipped window listeners gain two siblings that send the picker state and the picked payload to `chrome.runtime.sendMessage` the way the record and state events are sent, and the background re-broadcasts both with the sender's `tabId` so each panel keeps its own inspected tab.
- **The panel's reader rebuilds the shape.** The message boundary is untyped, so the service reads the picker state into one of the three named statuses and the picked payload into a descriptor only when it is one of the three descriptor shapes; anything else leaves the signal null rather than inventing a state. `null` means "the panel has not been told", never "the page said nothing to pick".
- **No second element, no second event name.** This task adds a branch, not a node: the marker retirement from the previous wave stands, the relay creates nothing, and no `host:*` type is reused, extended or renamed. The overlay's own attach guard is what makes the new content-script declaration safe, and this task must not weaken it.
- **Test both ends in their own harnesses.** `extension/background.test.mjs` boots the service worker script in a sandbox with a recording `chrome` stub: the command's validation, its forward, the no-relay refusal, and the two re-broadcasts are assertions. `extension/relay.test.mjs` drives the runtime listener and the two new window listeners through the shipped sandbox. The panel half is a spec beside the service, so the three-way absent/refused/answered vocabulary is asserted where it lives.

## Interface contract

- Down: `{ type: "angular-ai:picker-command", tabId, action: "arm" | "cancel" }` is sent by the panel, validated and forwarded by the background with `chrome.tabs.sendMessage`, re-dispatched inside the page as `new CustomEvent("angular-ai:picker-command", { detail: { action } })` on `window`, and consumed by the overlay.
- Up: `{ type: "angular-ai:picker-state", tabId, status: "armed" | "cancelled" | "unavailable", reason? }` and `{ type: "angular-ai:picked", tabId, descriptor }` leave the overlay as `CustomEvent("angular-ai:picker-state")` and `CustomEvent("angular-ai:picked")` on `window`, ride the relay's shipped forwarding shape, are re-broadcast by the background with `tabId`, and are read in the panel through one signal each.
- Lock: on a click the overlay dispatches `new CustomEvent("angular-ai:pick", { bubbles: true, composed: false })` on the picked element itself, and the MAIN-world capture listener registered on `globalThis` reads `event.target` and answers `CustomEvent("angular-ai:picked", { detail: descriptor })` on `window`.
- `descriptor` is plain data only: `{ status: "resolved", elementTag, componentName, className, componentPath }` where `componentName` is the owning instance's host tag name lowercased, `className` its constructor name and `componentPath` the distinct constructor names walked up from the picked element; or `{ status: "no-dev-context", reason }` when the element's `__ngContext__` is undefined; or `{ status: "no-component" }` when a dev context has no owning instance. No page object, function or `__ngContext__` value crosses.
- No `angular-ai:picked` within 1500 ms of the lock makes the overlay emit `{ status: "unavailable", reason }` and keep the rect; `no-dev-context`, `no-component` and `unavailable` are three named outcomes and are never collapsed into one.

## Intent coverage

- SC2

## Acceptance criteria

1. The background's down branch validates a numeric `tabId`, answers a named refusal when it is missing, forwards the command to that tab with `chrome.tabs.sendMessage`, and answers another named refusal when no relay answers — never silence (SC2).
2. The background re-broadcasts the picker state and the picked payload with the sender's `tabId`, beside the shipped record, state, graph and error-capture types, and no `host:*` type is reused or extended.
3. The relay re-dispatches the command as a window event the overlay consumes, and its replay answer is unchanged for every other message type (SC2).
4. The relay forwards the picker state and the picked payload to `chrome.runtime.sendMessage` in the shipped forwarding shape, and a payload it cannot read is forwarded as received rather than reinterpreted.
5. `ExtensionMessageService` exposes one signal for the picker state and one for the picked descriptor, both null until a message arrives, and a payload that is not one of the three named statuses or not one of the three descriptor shapes never becomes a value (SC2).
6. The panel keeps "no answer yet", "refused" and "answered" apart: an outstanding picker is distinguishable from a cancelled one and from an unavailable one, and no state is inferred from an absence of messages.
7. `extension/background.test.mjs` and `extension/relay.test.mjs` assert the four branches and the no-relay refusal in their own sandboxes, and the panel spec asserts the reader's refusal to invent a state.
8. The relay and the background create no DOM element and add no page-visible global; the marker retirement stands and the existing extension suite stays green.

## Verify

```bash
npm ci --include=dev && node --test extension/observer-filter.test.mjs extension/relay.test.mjs extension/manifest.test.mjs extension/background.test.mjs && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The first three files are here because this task also declares
     extension/relay.js, which the exclusion task owns, so that task's Verify
     must pass to land. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
