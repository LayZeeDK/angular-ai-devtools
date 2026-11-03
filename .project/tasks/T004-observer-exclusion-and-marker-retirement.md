---
id: T004
title: Publish the one observer exclusion predicate, filter the relay's two observers and retire the marker node
wave: 1
deps: []
status: done
agent: build_T004
base: 2b986a2d690f5a561c10860bd409e44fa3a1bd50
worktree: null
task_branch: null
files:
  - extension/observer-filter.js
  - extension/observer-filter.test.mjs
  - extension/relay.js
  - extension/relay.test.mjs
  - extension/manifest.json
  - extension/manifest.test.mjs
---

# T004 — Publish the one observer exclusion predicate, filter the relay's two observers and retire the marker node

## Context

The tool owns exactly one logical `MutationObserver`: `extension/relay.js` constructs it at two mutually exclusive branches of one load path, both observing `document.documentElement` with `{ childList: true, subtree: true }` and both disconnecting on the first successful `[ng-version]` detection. `MutationObserverInit` has no exclusion member and the host is always a descendant of the observed target, so AR-4 can only be an early-return record filter — and a filter keyed on `record.target` alone lets through the one mutation the tool itself performs, because the host's own insertion record's target is the parent. The same file also creates the only other DOM the tool adds to a page: a light-DOM marker `div` with an inline style and page-readable text, appended to `document.body` and never removed, which makes "the overlay is the only DOM" false by exactly one node until it is retired. `relay.test.mjs`'s `MutationObserver` stub records neither the target, the options nor the callback, so today no assertion could see an exclusion at all.

## Approach

- **One predicate, one file, one implementation.** `extension/observer-filter.js` holds the rule as a pure function over a record and a host reference, publishes it into the isolated world through one namespace object, and is declared before the script that calls it in each content-script entry that uses it. Both content scripts of this extension share one isolated world, so a single published implementation is reachable from the relay and from the overlay that arrives next; a second hand-written copy is the defect this milestone exists to prevent. Two declarations name the file, so it must be safe to run twice in the same world — publish idempotently rather than guarding with a throw — and it publishes into the isolated world only, which the page cannot read, so this adds no page-visible global.
- **Look the host up at call time.** The predicate resolves the host through its id on every call and drops nothing when the host is absent: a null host means no record can concern it, and the filter is then correct whichever content script ran first. Do not capture the host at load, and do not infer it from a field name.
- **Filter before doing anything else.** Each of the relay's two callbacks calls the predicate first and returns before `checkAngular()` when it answers true; the `observe()` targets, the options and the `disconnect()` behaviour keep the shipped values, because narrowing the target cannot exclude the host and would silently change the relay's Angular detection.
- **Retire the marker, keep the boot path.** Delete the four lines that build and append the marker, keep the version latch and the `angular-detected` message exactly as they are, and assert in `relay.test.mjs` that no element is created at all. This lands before the overlay attaches anything: eight browser checks ride this boot path, so the suite that proves it must be green before a host exists.
- **Teach the harness to see the observer.** `relay.test.mjs`'s stub keeps the callback and the `observe()` arguments, the test supplies the host node, and a counting `document.querySelector` stub turns "the record was filtered" into an assertion: a host-targeted record leaves the `[ng-version]` probe count unchanged while a body-targeted record increments it.
- **Measure the delivery assumption before relying on it.** The corrected SC3 proof runs on jsdom and depends on a light-tree `childList` mutation on the host reaching a document-level observer after a macrotask. Measure that in `extension/observer-filter.test.mjs` first — page-node mutation arrives, host mutation arrives raw and is dropped by the filter, the host's own insertion record is dropped — and let a jsdom that does not deliver fail the task rather than a later one.
- **The manifest gains its first pin here.** `extension/manifest.test.mjs` reads the manifest and asserts every named file exists, that the relay declaration lists the shared filter first at `document_idle`, that the MAIN-world agent declaration keeps its `document_idle` and `world: "MAIN"`, and that neither declaration sets `all_frames` or `match_about_blank`. The declaration for the overlay is a later task's edit of the same pin; do not add it here and do not widen `agent-main.test.mjs`'s forbidden-token scan.

## Interface contract

- The tool's single host element carries `id="angular-ai-devtools-host"`, and every script locates it only through `document.getElementById("angular-ai-devtools-host")` at call time; a null answer means no host exists yet and no record can concern it.
- `extension/observer-filter.js` publishes the one exclusion predicate in the isolated world as `globalThis.angularAiObserverFilter = { hostId, findHost, isToolNode, isToolRecord }`, where `isToolRecord(record)` is true iff the record's `target` is the host, the host's shadow root, or a shadow-including descendant of the host, or any node in `record.addedNodes`/`record.removedNodes` satisfies the same test; every tool-owned observer callback calls it first and returns early when it is true.
- Each content-script declaration that uses the predicate lists `extension/observer-filter.js` before the script that calls it, and every file a declaration names exists under `extension/`.

## Intent coverage

- SC3

## Acceptance criteria

1. `extension/observer-filter.js` implements the rule once and publishes it through a single isolated-world namespace object with a call-time host lookup, and the rule tests `target`, `addedNodes` and `removedNodes`; a target-only filter is refused by the test.
2. Both relay callbacks call the predicate first and return before the `[ng-version]` probe when it answers true, while the `observe()` targets, the options and the `disconnect()` behaviour keep their shipped values.
3. The relay's exclusion is asserted, not described: with the harness supplying the host, a host-targeted record leaves the `[ng-version]` probe count unchanged while a body-targeted record increments it (SC3).
4. `extension/relay.test.mjs` boots the shipped filter and then the relay in one sandbox, and its `MutationObserver` stub records the target, the options and the callback, so a deleted filter call and a deleted `observe()` call each fail the suite (SC3).
5. The marker node is retired: the relay creates no element and appends nothing, `relay.test.mjs` asserts that no `angular-ai-devtools-marker` id is ever created, and the version latch plus the `angular-detected` message are unchanged.
6. `extension/observer-filter.test.mjs` measures jsdom's record delivery before anything relies on it: a light-tree childList mutation on the host and a page-node mutation both reach a document-level observer after a macrotask flush, the raw list holds the host record, and the predicate drops it while passing the page record.
7. `extension/manifest.test.mjs` reads the manifest and asserts every named file exists, the relay declaration lists the shared filter before the relay at `document_idle`, the MAIN-world declaration keeps `document_idle` and `world: "MAIN"`, and no declaration sets `all_frames` or `match_about_blank`.

## Verify

```bash
npm ci --include=dev && node --test extension/observer-filter.test.mjs extension/relay.test.mjs extension/manifest.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. jsdom 27 is a root devDependency, so the include=dev install is
     what puts it there. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
- coder: observer-filter.js publishes the one exclusion predicate in the isolated world, host looked up at call time and target plus added/removed nodes, and both relay branches call it before the [ng-version] probe while observe targets, options and disconnect keep their shipped values; the marker node is retired, no element created and no body append, version latch and angular-detected unchanged; relay.test.mjs boots the shipped filter first and its stub records target, options and callback so a deleted filter call reddens its branch and a deleted observe call reddens the registration pin; observer-filter.test.mjs measures jsdom delivery, page record passes while host insertion and host light-tree record arrive raw and are dropped and nothing crosses a shadow boundary, and a target-only rule is refused; manifest.json lists the filter first and manifest.test.mjs is its first pin; Verify npm ci --include=dev and node --test extension/observer-filter.test.mjs extension/relay.test.mjs extension/manifest.test.mjs exit 0, tests 30 pass 30 fail 0 - ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
    ✔ creates no element at all, so the retired marker id never reappears (1.33ms)
  ✔ relay.js observer (AR-4 / SC3) (7.5235ms)
  ℹ tests 30
  ℹ suites 7
  ℹ pass 30
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 1058.1776
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
