---
id: T005
title: Carry the companion answer into the panel and render the extra surface with its named refusal
wave: 2
deps: [T004]
status: done
agent: build_T005b
base: 8cbe96e32ddf389e9f476a82c8f1802ce11d58b3
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts
  - apps/angular-ai-devtools/src/app/tool-groups.spec.ts
  - apps/angular-ai-devtools/src/app/companion.ts
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  - apps/angular-ai-devtools/src/app/panel-context.ts
  - apps/angular-ai-devtools/src/app/panel-context.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - tests/held-out/companion-surface.test.mjs
  - tests/held-out/feature-fingerprint-chip.test.mjs
  - tests/held-out/tool-group-gates.test.mjs
---

# T005 — Carry the companion answer into the panel and render the extra surface with its named refusal

## Context

A new key on the page's state payload survives the wire and dies at the panel's typed reader: `extension/relay.js` latches the payload verbatim, `extension/background.js` re-emits it with a spread, `ExtensionMessage` declares no index signature and `handleMessage` reads only four members, and `buildPanelContext` writes exactly three facts keys plus an optional `features`. So the extra surface costs three untyped pass-throughs plus one typed one, and the typed one is closed: `PanelSignals` has seven required fields with no optional member and `PanelContext` four, the type is constructed in three type-checked places and in two plain-JavaScript held-out fixtures, one of which already omits `replayOutcome` because nothing type-checks it. The chip and the group projection read that context at three different fidelities — `tool-groups` reads any `features` name with no allowlist, `app-facts` truncates the same map to its closed eight-name tuple, and the chip renders only the names its caller passes — so publishing the package bit inside `features` would reach the group gate and neither of the other two readers, and would put page inspection and the package bit in one record with nothing distinguishing them. That is INTENT.md N2, the prohibition this milestone exists to make visible.

## Approach

- **One required member, no default.** Add `companion` to `PanelSignals` and `PanelContext` as a required member and write it in `buildPanelContext` **after** the `stateReceived` early return, so a silent page keeps its empty facts object and its empty context. A `?? 'absent'` default would make every production path report an absent package while the suites pass — the exact defect the closed shape exists to catch — so the two plain-JavaScript held-out fixtures are updated in this task rather than tolerated.
- **Read the field, believe nothing else.** `ExtensionMessageService` gains one signal written from the payload's `companion` member, `null` until a state arrives. The extra surface reads that signal and the context member and nothing else: never `facts.features`, never the eight `app_facts` rows, never a re-run probe. The fingerprint chip keeps rendering the eight page-published bits beside it on its own surface — two surfaces, two sources, which is the difference the milestone ships.
- **Five named renderings, four sentences.** One pure module decides between `awaiting-page` (the panel asked and the reply is outstanding, or it answered with nothing), `absent`, `foreign-entry`, `version-unsupported` and `declared`. Each non-detected case keeps its own sentence: `absent` names the missing entry — "This page carries no companion package: no `ngAiDevTools` entry was found on the page's global object." — and never reads as "no data yet"; `foreign-entry` says the key is there but is not the package's shape, so a stub or a stale copy is not a full opt-in; `version-unsupported` names both the version the entry declares and the version the panel accepts. `declared` with zero resolved symbols is **not** a refusal: it is the honest "declared, no symbols", reported with the declared and resolved counts, because a silently degraded wiring defect reads exactly like it.
- **A pure module, loadable under plain node.** The rendering module carries type-only imports only, the way `panel-context.ts` and `feature-fingerprint.ts` do, because `tests/held-out/*.test.mjs` import panel TypeScript directly with node's type stripping and a value import of `@angular/core` or of the pinned envelope breaks that suite.
- **The panel's closed copy of the promise.** The accepted vocabulary is a literal in the new module — package version and the two `pkg#name` symbols — pinned by its own spec. The page realm spells the same literal inside the content script; the identical interface bullet is what makes the two one promise, and this task never imports the package, so no package byte reaches the panel's build graph.
- **The surface lands where the chip already is.** The extra-surface section renders on the existing lazy `chat` route, so it adds no route and no eager byte; the byte-exact pin and `PRE_MILESTONE_INITIAL_KB` are untouched and are not re-measured (AR-1). One `data-testid` per state, per declared symbol, per count and per refusal sentence, so a reviewer can see each state in a diff and a driver can read them by name.
- **Blast radius.** The inspected page gains nothing from this task: no DOM, no prompt, toast or confirm (AR-3, AR-6, N7). The panel gains no navigation entry and no eager component.

## Interface contract

- The accepted vocabulary is package version `0.2202.0`, vetted against Angular `22.2.2`, with exactly two symbols this milestone and no others: `@angular/router#Router` and `@angular/platform-browser#Meta`.
- The page's state record carries a fifth top-level field `companion: { state: 'absent' | 'foreign-entry' | 'version-unsupported' | 'declared'; version: string | null; declared: number; resolved: number; symbols: readonly { pkg: string; name: string }[] }` beside `supported`, `reason`, `zoneMode` and `features` on `angular-ai:state`, where `declared` counts the symbols the entry declared, `resolved` counts those an injector record matched by identity, and `symbols` lists only the declared ones.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. `ExtensionMessageService` exposes one signal written from the `companion` member of an `angular-ai:state` payload and `null` until a state arrives, so a page that never spoke is never read as a page with no package (SC1).
2. `PanelSignals` and `PanelContext` each gain one required `companion` member with no optional marker and no default, `buildPanelContext` writes it only after the `stateReceived` early return, and a silent page still yields the empty facts object, so nothing turns silence into a claim.
3. E2 — `apps/angular-ai-devtools/src/app/companion.ts` renders exactly one of five named states — `awaiting-page`, `absent`, `foreign-entry`, `version-unsupported`, `declared` — and its four refusal sentences name what is missing: `absent` names the missing entry and never reads as "no data yet", `foreign-entry` says the key is present but is not the package's shape, and `version-unsupported` names both the declared and the accepted version (SC2).
4. E1 — a `declared` answer with an empty symbol list renders "declared, no symbols" as its own state with the declared and resolved counts, and `tests/held-out/companion-surface.test.mjs` fails when the model reports a symbol the record did not carry, drops that state, or renders an empty list in its place (SC1).
5. E3 — on a page without the package the extra surface refuses while the eight-entry fingerprint chip and the version-gated group list render exactly as they do at M020, and `tests/held-out/feature-fingerprint-chip.test.mjs` fails if the extra surface reads `facts.features` or the eight `APP_FACT_FEATURES` names instead of the record's `companion` field (SC2, N2).
6. The chat route renders the extra surface from the record's `companion` member only, with a `data-testid` for each state, each declared symbol, each count and each refusal sentence, and adds no route and no eager byte: the bundle-budget pin and the `PRE_MILESTONE_INITIAL_KB` constant keep their base bytes (AR-1).
7. The panel's closed copy of the accepted vocabulary is a literal in `apps/angular-ai-devtools/src/app/companion.ts`, pinned by `apps/angular-ai-devtools/src/app/companion.spec.ts` to the one version string and the two `pkg#name` symbols the contract fixes, and no symbol or version outside it is ever named.
8. `tests/held-out/tool-group-gates.test.mjs` and `tests/held-out/feature-fingerprint-chip.test.mjs` build their context literals with the new required member and pass, so the closed shape is enforced where the suite is plain JavaScript.

## Verify

```bash
npm ci --include=dev && npm run check && node --test tests/held-out/companion-surface.test.mjs tests/held-out/feature-fingerprint-chip.test.mjs tests/held-out/tool-group-gates.test.mjs && npx nx run angular-ai-devtools:test
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
- build_T005: blocked at preflight, no product path changed. AC2 requires a required companion member on PanelContext, but two type-checked PanelContext construction sites sit OUTSIDE the task files list: apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts (helper at :25-35 returns PanelContext; inline literals at :128, :141, :160, :177, :211) and apps/angular-ai-devtools/src/app/tool-groups.spec.ts (:66 helper return, :307 literal). Both are compiled by apps/angular-ai-devtools/tsconfig.check.json (include src/**/*.ts), confirmed with npx tsc -p apps/angular-ai-devtools/tsconfig.check.json --listFiles (exit 0, both files listed). Proven by a copy of apps/ and src/ under TEMP with only the required member added and both buildPanelContext returns updated: npx tsc -p copy/apps/angular-ai-devtools/tsconfig.check.json exits 2 with TS2741 at tool-groups.spec.ts:66 and TS2345 at tool-groups.spec.ts:307 plus TS2345/TS2322 in feature-fingerprint.spec.ts, and no other error beyond two TS2307 the copy itself causes (extension/*.json not copied). So npm run check cannot stay green within the declared paths. Repair: add those two paths to files and drop the Context claim that only the two plain-JavaScript held-out fixtures construct a context. Verify not run: no product code changed.
- blocked
- 2026-11-02 — orchestrator plan repair: the blocked preflight proved that a required `PanelContext` member breaks `tsc` in two undeclared, type-checked fixtures; both are now in `files`.
- build_T005b: added apps/angular-ai-devtools/src/app/companion.ts — five named renderings, four disjoint refusal sentences, declared-no-symbols reported with the declared and resolved counts apart, and the closed vocabulary literal pinned by the new companion.spec.ts — plus tests/held-out/companion-surface.test.mjs. ExtensionMessageService gains one companion signal read from the angular-ai:state companion member through a reader that rebuilds the shape (null until a state arrives, never defaulted to absent). PanelSignals and PanelContext gain one required companion member with no optional marker and no default; buildPanelContext writes it after the stateReceived early return, so a silent page keeps facts {} and companion null. chat-entry renders the extra surface beside the untouched chip with a testid per state, per declared symbol, per count and per refusal sentence; no route and no eager module added. feature-fingerprint.spec.ts, tool-groups.spec.ts, chat-entry.component.spec.ts, panel-context.spec.ts and the two plain-JS held-out fixtures build their contexts with the new required member. Verify exit 0: npm ci --include=dev, npm run check (root, skills, check:panel, check:companion), the three held-out suites (31/31 pass) and npx nx run angular-ai-devtools:test (29 files, 301 tests). Heavy measurement: build-extension initial total 530.72 kB (530,721 B over 7 eager files), 4.72 kB under the 535.44 kB baseline — the tree measured 529,936 B before this change, so the eagerly-typed reader costs +785 B while companion.ts rides in the lazy chat chunk; scripts/panel-bundle-budget.test.mjs keeps both pins and passes.
- ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t005-verify): pass, exit 0; output tail:
  ```
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
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel && npm run check:companion
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run check:companion
  npm notice run tsc -p packages/ai-devtools-companion/tsconfig.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test
  ```
