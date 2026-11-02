---
id: T004
title: Detect, validate and re-announce the companion entry in the page realm
wave: 2
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
---

# T004 — Detect, validate and re-announce the companion entry in the page realm

## Context

The page side has exactly one record to extend and no opt-in support at all: `extension/agent-main.js` publishes `angular-ai:state` once from `featuresOf(ng)` carrying `supported`, `reason`, `zoneMode` and `features`, `tryInstall` returns early once installed, and the record is never rebuilt. Detection must therefore happen in the page realm — the panel is a devtools document, so a `globalThis` read in panel code reads the panel's own absent property, and every existing panel-realm `globalThis` read is a capability (`chrome`, `LanguageModel`) rather than a page fact. Presence alone is not detection: `featuresOf` is eight `typeof` checks and the chip renders any published bit as present, so a bit set from `typeof globalThis.ngAiDevTools === 'object'` would read to the user as a full opt-in — which is INTENT.md N1, and N2's fallback to page inspection is one line away because `tool-groups` reads any `features` name with no allowlist and `app-facts` truncates the same map to its eight declared names. The identity half is not at risk (the injector walk ships and is pinned), but the facade's own read was never measured, which is why declared and resolved are counted apart.

## Approach

- **One probe, four answers, in the page realm.** Read the entry from `globalThis` inside the content script that already runs in the MAIN world, and answer exactly one of `absent` (no entry), `foreign-entry` (a key that fails the package's shape: a stub or a stale copy), `version-unsupported` (right shape, unfamiliar version) and `declared` with the accepted symbols. No `typeof` boolean survives anywhere, and nothing is added to the `features` map: an extra name there would reach the group gate but neither `app_facts`' closed tuple nor the chip.
- **Validate before believing anything.** The value must be a non-null object; `version` must be a non-empty string equal to a version the accepted vocabulary names; every package group must be an object; every symbol name must be on the vetted table, and its value must be a function, because the whole contribution to the lookup is a class object compared by identity. A name that is on the table but whose value is not a function is still `foreign-entry`: a stale copy that kept the key and lost the class is not a partial opt-in.
- **Identity against the shipped walk.** Compare each provider record's token with the class the entry carries, read from the entry rather than from the panel: walk the resolution path with the two `ɵ` functions the file already feature-detects, never call `injector.get` on a node-injector token, and count `declared` and `resolved` separately. A package whose `@angular/router` is not the app's copy produces a well-formed entry and a walk that matches no record, so the honest "N declared, 0 resolved" is the only defence against a wiring defect wearing the honest-empty state's clothes.
- **The refusal is the page's, the sentence is the panel's.** The page publishes the named state and the counts; it writes no user-facing prose. `extension/agent-main.js` carries one closed table of accepted versions and names, spelled once, and the panel keeps its own closed copy of the same vocabulary — the identical interface bullet below is what makes those two literals one promise.
- **The re-announce is bounded and reuses the existing payload.** The record is one-shot and there is no panel-to-page transport (`page-reads.ts` answers `host-unavailable` for every read), so an entry written after bootstrap would be invisible. Add a finite re-check — a handful of attempts on a timer — that re-emits the *same* `angular-ai:state` payload when the answer changes from `absent`, cleared on the first non-absent answer and on the last attempt. No new event type, no new message type, no page event the package would have to raise: a package that knew the extension's vocabulary would be a second contract inside someone else's build.
- **The relay and the background are not touched.** They already latch the last payload verbatim and the background re-emits it with a spread, so the fifth field survives the wire; the panel's typed reader is where a new field dies, and that is T005's file. A relay-side change would be a second mechanism for a fact the latch already carries.
- **Nothing new reaches the page.** The only page global the extension owns stays `globalThis.__ngRecorder`, unchanged; no DOM node, no prompt, toast or confirm, no write to any other name (AR-3, AR-6, N3, N7). `featuresOf`'s eight names and the four existing record field names keep their values, because `app-facts.ts` truncates the map to exactly those eight and the chip renders exactly those eight.
- **Tests stub the page realm.** `extension/agent-main.test.mjs` boots the real script in a sandbox and injects a page `globalThis`; every new case injects the entry into that sandbox, never into the test process's own global, so a stub that would make detection false in production cannot pass. Time is driven through the sandbox's own timer so the bounded re-check is asserted rather than waited on.

## Interface contract

- `globalThis.ngAiDevTools` is exactly one own string key written first-write-wins by the package's `provideAiDevTools()` under `isDevMode()`, whose value is `{ version: string, '@angular/platform-browser': { Meta }, '@angular/router': { Router } }`: `version` is the package's own version string, and each symbol value is the class the package imported from that `@angular/*` peer, so the page realm can compare provider records by identity.
- The accepted vocabulary is package version `0.2202.0`, vetted against Angular `22.2.2`, with exactly two symbols this milestone and no others: `@angular/router#Router` and `@angular/platform-browser#Meta`.
- The page's state record carries a fifth top-level field `companion: { state: 'absent' | 'foreign-entry' | 'version-unsupported' | 'declared'; version: string | null; declared: number; resolved: number; symbols: readonly { pkg: string; name: string }[] }` beside `supported`, `reason`, `zoneMode` and `features` on `angular-ai:state`, where `declared` counts the symbols the entry declared, `resolved` counts those an injector record matched by identity, and `symbols` lists only the declared ones.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. `extension/agent-main.js` reads the entry from the page's `globalThis` and answers exactly one of the four named states — `absent`, `foreign-entry`, `version-unsupported`, `declared` — with no `typeof` boolean and no ninth name inside the `features` map (N1, N2).
2. Validation refuses a value that is not a non-null object, a `version` that is not a non-empty string, a version outside the accepted vocabulary (`version-unsupported`), a group that is not an object, a symbol name that is not on the vetted table, and a symbol whose value is not a function (`foreign-entry`), and accepts an entry that passes all of them.
3. Identity is compared page-side against the class read from the entry, through the shipped `ɵgetInjectorResolutionPath` and `ɵgetInjectorProviders` walk with every `ɵ` function feature-detected and no `injector.get` on a node-injector token, and `declared` and `resolved` are reported separately so a second Angular copy reads as declared symbols with no resolved record rather than as an empty list (SC1).
4. `announceState` publishes `companion` as the fifth top-level field in the shape the interface contract fixes, an `absent` answer is a named state that never renders as an empty symbol list, and the four existing field names keep their names and values (SC2).
5. A bounded re-check re-emits the same `angular-ai:state` payload when the answer changes from `absent` and then stops — a finite number of attempts on a timer, cleared on the first non-absent answer and on the last attempt — with no new event type, no new message type and no panel-to-page request.
6. The re-emitted payload is the same record `tryInstall` publishes for the same page state, so the relay's existing latch holds the newest answer and the shipped one-shot replay answers a panel opened after the page's first record.
7. The probe adds no page global beyond the existing `globalThis.__ngRecorder`, writes no DOM node, raises no prompt, toast or confirm, and mutates no name other than that one (N3, N7, AR-3, AR-6).
8. `extension/agent-main.test.mjs` injects the entry into a stubbed page realm — never into the test process's own global — and covers the four states, the two counts, the bounded re-check re-emitting once per change and stopping on the last attempt, and the four existing field names.

## Verify

```bash
npm ci --include=dev && node --test extension/agent-main.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: no

## Log

- 2026-11-02 — created by planner
