---
id: T005
title: Attach the one closed-shadow host once at document_start through a new manifest declaration
wave: 2
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/overlay.js
  - extension/overlay.test.mjs
  - extension/manifest.json
  - extension/manifest.test.mjs
---

# T005 — Attach the one closed-shadow host once at document_start through a new manifest declaration

## Context

The overlay is the only DOM the tool may add to an inspected page, and it must be there before the page's own scripts run, so it needs a content script at `document_start` — a declaration the manifest does not have and that no test reads today. The marker node `extension/relay.js` used to append is retired in the previous wave, so "exactly one tool-created element" becomes a count the page can be asked for rather than a claim about a shape. Two properties make the host safe rather than merely small: it is attached inside a guard that makes a second injection a no-op (re-injection happens on SPA route changes and extension reloads, and a throwing overlay breaks the page it inspects), and its own `MutationObserver` passes every record through the shared predicate before doing anything with it, because a `MutationObserver` on `document` sees the host's light tree even though the closed root hides the drawing. The SC3 test has to mutate that light tree and pair it with a page mutation that must still arrive, or it passes with the filter deleted.

## Approach

- **The guard is the module's first statement.** If the host id is present, return before creating anything: no shadow root, no listener, no observer, no throw. The second instance cannot reach the first instance's root and does not need to — the first instance's closures still own it, and a closed root is never readable back.
- **Attach to the document element, not the body.** At `document_start` the body can still be null, so the host is appended to `document.documentElement`. The host carries the fixed id, `position: fixed` and `pointer-events: none`, and calls `attachShadow({ mode: "closed" })` exactly once in the whole file. Every style the overlay will ever write goes on a node inside that root — never on a page node, and never as an inline `width`/`top` on the host.
- **The overlay's own observer is filtered, always.** Register one `MutationObserver` on `document.documentElement` with `{ childList: true, subtree: true }`, call the shared predicate first in the callback, and use what survives to notice only that a locked element may have left the document. It adds no observer kind, so AR-4's surface stays the relay's two sites plus this one.
- **The manifest edit, its pin and this file land together.** The new declaration is `{"matches": ["<all_urls>"], "js": ["observer-filter.js", "overlay.js"], "run_at": "document_start"}` with no `world` key, no `all_frames` and no `match_about_blank`; both existing declarations keep `document_idle`. Extend `extension/manifest.test.mjs` to the three declarations rather than writing a second manifest pin, and keep its every-named-file-exists assertion.
- **The SC3 proof is the corrected one, not INTENT E6 as worded.** Boot the overlay so the host attaches and its observer registers; collect every record the callback passes and the raw pre-filter list; mutate `document.body` and expect the page record to be passed; append a child to the host and expect zero passed records mentioning the host while the raw list holds one; and expect the host's own insertion record to be absent from the passed list. A mutation inside the shadow root is never the probe — a `MutationObserver` receives nothing from inside any shadow root, open or closed, so that assertion would pass with the filter deleted.
- **Prove both bites.** Deleting the predicate call must redden the host half and deleting the `observe()` call must redden the page half; the repository's rule for every pin is that it proves its own failing half, so state both mutations in the test rather than only exercising the happy path.
- **A blast-radius pin for the new file.** The MAIN-world script's forbidden-token scan stays untouched and unextended (N7). `extension/overlay.test.mjs` reads this module's source instead: one `attachShadow(` call site and it is `mode: "closed"`; no `innerHTML`; no `document.body` mutation; no `@angular`, `LanguageModel` or `setPrompt` token; no `localStorage|sessionStorage|alert|confirm|prompt|eval|new Function`; and the host id string spelled identically in the overlay, the filter and the relay.

## Interface contract

- The tool's single host element carries `id="angular-ai-devtools-host"`, and every script locates it only through `document.getElementById("angular-ai-devtools-host")` at call time; a null answer means no host exists yet and no record can concern it.
- `extension/observer-filter.js` publishes the one exclusion predicate in the isolated world as `globalThis.angularAiObserverFilter = { hostId, findHost, isToolNode, isToolRecord }`, where `isToolRecord(record)` is true iff the record's `target` is the host, the host's shadow root, or a shadow-including descendant of the host, or any node in `record.addedNodes`/`record.removedNodes` satisfies the same test; every tool-owned observer callback calls it first and returns early when it is true.
- Each content-script declaration that uses the predicate lists `extension/observer-filter.js` before the script that calls it, and every file a declaration names exists under `extension/`.

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. The module's first statement is the guard: with the host already present, a second boot returns before attaching a shadow root, registering a listener or observer, creating a node, or throwing (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
2. The host is created with the fixed id, `attachShadow({ mode: "closed" })`, `position: fixed` and `pointer-events: none`, is appended to `document.documentElement`, and after both content scripts boot the document holds exactly one tool-created element while the retired marker id resolves to null (E7: a second injection attempt leaves exactly one host, changes nothing and does not throw).
3. The manifest carries the third declaration for the overlay at `document_start` with no `world` key, the two existing declarations keep `document_idle` (the MAIN-world one with `world: "MAIN"`), and `extension/manifest.test.mjs` pins all three declarations, every named file's existence, the shared filter listed first, and the absence of `all_frames` and `match_about_blank` (SC4).
4. The overlay's own observer passes every record through the shared predicate before acting, and `extension/overlay.test.mjs` proves the corrected SC3 shape: a page-node mutation is passed, a child appended to the host yields zero passed records mentioning the host while the raw list holds one, and the host's own insertion record is absent from the passed list (E6: a mutation inside the host subtree reaches no tool observer while a mutation on a page node does, so deleting the exclusion makes the test fail).
5. Both bites are proven: deleting the predicate call reddens the host half and deleting the `observe()` call reddens the page half, and the shadow root is never the probe (SC3).
6. A source-level pin inside `extension/overlay.test.mjs` asserts one `attachShadow(` call site with `mode: "closed"`, no `innerHTML`, no `document.body` mutation, no `@angular`/`LanguageModel`/`setPrompt` token, no `localStorage|sessionStorage|alert|confirm|prompt|eval|new Function`, and the host id spelled identically in the overlay, the filter and the relay.
7. Every style write in the module targets a node inside the closed root, and the MAIN-world script's forbidden-token scan is neither extended nor weakened; the existing suite stays green.

## Verify

```bash
npm ci --include=dev && node --test extension/observer-filter.test.mjs extension/relay.test.mjs extension/manifest.test.mjs extension/overlay.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The three earlier files are here because this task edits two
     files the previous task also declares (manifest.json and manifest.test.mjs),
     so the previous task's Verify must pass to land. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
