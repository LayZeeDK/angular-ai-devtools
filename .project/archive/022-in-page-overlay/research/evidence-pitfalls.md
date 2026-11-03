# Evidence — pitfalls

<!-- Written by the pitfalls researcher for M022 in-page-overlay. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope?

## Assigned questions — answers

- Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope? → Exactly one logical observer exists in the tool: `extension/relay.js:67` and `:75`, the two mutually exclusive branches of one load path, so one per page load, observing `document.documentElement` with `{childList: true, subtree: true}` and disconnecting on the first successful Angular detection. No `MutationObserver` exists in `extension/agent-main.js`, in any file under `apps/angular-ai-devtools/src` (only a comment at `tool-registry/role-name.ts:76` and a test-owned pair in `role-name.spec.ts:460,469`), or in `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (a recursive search of the skills tree returns no match). That single site is the whole of this generation's AR-4 scope, and dropping an exclusion there would let it see only a childList addition or removal under `documentElement` that happens after it registers — no attributes, no character data, nothing inside a shadow root — while on the served Angular fixture the observer is usually never constructed at all, because `checkAngular()` (`relay.js:41-62`) already finds `[ng-version]` when the `document_idle` relay runs.

## Finding: The tool owns exactly one `MutationObserver`, and it sits in `relay.js` — not in the page realm, the panel or the skills

- **Claim**: The only live `new MutationObserver` in the checkout is at `extension/relay.js:67` and `:75`, the two mutually exclusive branches of one load path (`document.readyState === 'loading'` versus not), so at most one observer is constructed per page load; `extension/agent-main.js` constructs none, no file under `apps/angular-ai-devtools/src` constructs one, and `.commandcode/skills/control-ai-browsers/scripts/control.mjs` contains no `MutationObserver` at all.
- **Source**: `extension/relay.js:64-80`; a recursive `rg "MutationObserver"` over `extension apps packages src e2e` returns only `extension/relay.js:67`, `extension/relay.js:75`, the stub at `extension/relay.test.mjs:41`, a comment at `apps/angular-ai-devtools/src/app/tool-registry/role-name.ts:76` and two test-owned observers at `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460,469`; `rg -n "MutationObserver|attachShadow|elementFromPoint" .commandcode/skills -g '*.mjs' -g '*.js' -g '*.md'` returns no match (exit 1).
- **Confidence**: high
- **Why it matters here**: AR-4 has exactly one logical call site to satisfy and it is ISOLATED-world code, so no page-realm, panel-side or skills-side site needs a matching exclusion — and "the overlay is the tool's first page-realm observer" is true.

## Finding: Dropping the exclusion would show the observer an insertion, never the host's interior — and often nothing at all

- **Claim**: Both sites call `observe(document.documentElement, { childList: true, subtree: true })` with no `attributes` and no `characterData`, and call `disconnect()` on the first successful `checkAngular()`, so the observer reports a childList addition or removal anywhere under `documentElement`, reports nothing about the host's inline style or other attributes, and reports nothing inside the host's shadow root, which is a separate node tree that an observer registered on the outer tree does not traverse. Two parts of that claim are platform semantics I cannot exercise in this checkout — the shadow-tree boundary and the rule that records are queued only after `observe()` — while the target, the options and the callback are read directly from the code.
- **Source**: `extension/relay.js:67-70` and `extension/relay.js:75-78` (constructor, `disconnect()`, `observe(...)`); `extension/manifest.json:22` (`relay.js` is declared `run_at: "document_idle"`); `extension/relay.js:41-62` (`checkAngular`, the disconnect condition).
- **Confidence**: medium
- **Why it matters here**: SC3/E6 want a failure that follows from deleting the exclusion, but a host attached at `document_start` is already in the DOM when this `document_idle` observer registers, so the insertion is never delivered as a record — the pin has to force a post-registration childList mutation of or under the host instead of assuming one exists.

## Finding: On an already-bootstrapped Angular page this observer is never constructed, so AR-4 cannot be proven against the fixture

- **Claim**: The observer exists only when `checkAngular()` fails at load, and `checkAngular()` returns true as soon as `document.querySelector('[ng-version]')` finds anything, so the `if (!checkAngular())` guard at `extension/relay.js:74` skips construction entirely once Angular has bootstrapped and stamped `ng-version`; the relay's own design assumes that has happened by the time it runs, since it latches the version from that attribute at load. Whether the attribute is always present at `document_idle` on the fixture follows from Angular's bootstrap timing, not from a run in this checkout.
- **Source**: `extension/relay.js:41-49` (probe at `:42`, latch at `:44-48`), `extension/relay.js:64-80` (both guards at `:66` and `:74`); `extension/manifest.json:22`.
- **Confidence**: medium
- **Why it matters here**: a browser check against the served fixture would find no observer to observe and would pass vacuously, so the SC3 proof has to be a `node:test` sandbox proof — the harness whose stub currently discards the target, the options and the callback.

## Finding: The sandbox stub makes the current suite unable to pin the observer's target, options or callback

- **Claim**: `relay.test.mjs` boots the real `relay.js` source in a `vm` context whose `MutationObserver` is a class with empty `observe()` and `disconnect()` bodies that never invokes its callback and records neither the observe target nor the options, so no existing assertion mentions `document.documentElement`, `{childList, subtree}` or where a callback would run; an exclusion filter written inside that callback would be invisible to every test in the file and could be deleted without a failure.
- **Source**: `extension/relay.test.mjs:41-44` (the stub, inside `boot()` at `:14`); `extension/relay.test.mjs:8` (`SRC` is the real `./relay.js`).
- **Confidence**: high
- **Why it matters here**: SC3 requires a test that fails when the exclusion is removed, and this is the only harness that can reach the observer at all — it needs its stub to capture target, options and callback and to drive the callback with synthetic records, or the criterion is asserted by nothing.

## Finding: The page realm already touches the host through a full-document element walk, and that channel is not an observer

- **Claim**: `enumerateComponentNodes()` runs `document.querySelectorAll("*")` and calls Angular's component getter on every element, driven from `serializeGraph` (once per check in a closed cycle) and from `dispatchInitialRecord`, so a host element appended to the page becomes one more element in that walk and is passed to the getter, while the host's shadow content is never returned by `document.querySelectorAll` and so is never visited.
- **Source**: `extension/agent-main.js:552-583` (walk at `:560`, per-element call at `:565`), called at `extension/agent-main.js:622` and at `extension/agent-main.js:827`, with `serializeCheck` driven per check by `closeCycle` at `extension/agent-main.js:680-683`.
- **Confidence**: high
- **Why it matters here**: AR-3 and AR-4 speak only of observers, but this walk is how page-realm code actually meets the host every cycle — an element with no `__ngContext__` costs a `try/catch` per cycle, and a picker that reuses the pattern inherits the same full-document scan cost.

## Finding: No other observer class exists in the tool, so rect tracking would add a second observer kind that AR-4 does not name

- **Claim**: `ResizeObserver`, `IntersectionObserver` and `visualViewport` have zero occurrences under `extension/`, `apps/` and `scripts/`, so the overlay's rect tracking will be the tool's first geometry observer; AR-4 constrains `MutationObserver` only, and the one existing AR-4-shaped assertion in the tree is a test-owned observer that proves the absence of writes rather than a product observer.
- **Source**: `rg -n "ResizeObserver|IntersectionObserver|visualViewport" extension apps scripts` returns no match (exit 1); `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:448-489` (test-owned observers at `:460` and `:469`, empty-records assertion at `:486-488`).
- **Confidence**: high
- **Why it matters here**: if the overlay polls geometry through scroll and resize listeners the AR-4 surface stays one site; if it adopts a `ResizeObserver` on the page or the host, that observer has neither a rule nor a precedent covering it, and the exclusion discipline would have to be extended by judgement.

## Dead ends

- A recursive `MutationObserver` search over `.commandcode` — every hit is vendored third-party browser-extension code under `.commandcode/worktrees/.browsers/**`; the skills' own tree returns no match, so there is no skills-owned observer to inventory.
- `apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts:460,469` as evidence about the product — those observers belong to the spec and run in the panel's jsdom, never in an inspected page, so they are a precedent for a test technique and not call sites needing an exclusion.
