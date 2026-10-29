---
id: T018
title: Verify N1/N2/N3 panel flows on chrome-beta-nano
wave: 6
deps: [T006, T008, T011, T012, T016]
status: done
agent: build_T018
base: 8cd64a1f153b2a76fa84a9239c900337dd885a91
worktree: null
task_branch: null
files:
  - .project/review/rounds/panel-chrome-beta-nano.md
  - tests/held-out/chrome-beta-nano-panel.test.mjs
---

# T018 — Verify N1/N2/N3 panel flows on chrome-beta-nano

## Context

SC3: the N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a `lars-verify` verdict of `verified`. This task owns the `chrome-beta-nano` pair (port 9333): it drives N1 (change-detection causality), N2 (signal provenance) and N3 (DI doctor) on that single instance and records one `lars-verify` verdict per flow. E5: when a model pair cannot run, its claim records `unverifiable` with the reason; it is never reported as `verified`, and SC3 is not met until all four pairs answer. N3 (SC3): do not send page data to a cloud model or change the panel security model to make a check pass; the panel stays panel-local Prompt API. Coverage for N2/N3 now exists (T008). Apply the documented budgets of 600 s per control call and 1800 s per check, plus the idle-blank-tab recovery, one instance at a time. When the pair still cannot answer, record the verdict as `unverifiable` with the route and budget used — never `verified`.

## Approach

- Build the extension (`npx nx run angular-ai-devtools:build-extension`), run `control-ai-browsers up chrome-beta-nano`, and drive the app with `control-angular-dev-app up --target counter`.
- Run the three checks (extension panel, signal provenance, DI doctor) through `verdict.mjs` into `.commandcode/worktrees/tmp/`, one verdict per flow.
- Lint each resulting `verdict.json` with `verdict.mjs lint`.
- Stop only what this task started.
- Budgets and recovery: 600 s per control call, 1800 s per check, plus the idle-blank-tab recovery; record `unverifiable` with the route and budget when the pair still cannot answer.
- Write the fragment `.project/review/rounds/panel-chrome-beta-nano.md` with one heading per flow (N1, N2, N3): the verdict path, the verdict, the claim, and for anything not `verified` the reason, the recovery applied, the budget used and the route tried.
- Write `tests/held-out/chrome-beta-nano-panel.test.mjs` proving each of the three verdict files exists, parses, records `verified`, and that the fragment cites it; no tautologies.

## Interface contract

- Fragment shape, identical in every producer and the consumer: one `## <Flow>` heading per flow (`N1`, `N2`, `N3`) carrying (a) the location of that flow's `verdict.json`, (b) the verdict word, (c) the claim as restated, and (d) for any verdict that is not `verified`: the reason, the recovery applied, the budget used and the route tried. The consumer merges the four fragments verbatim, without altering a verdict word or location, and adds the insurance-portal row.
## Intent coverage

- SC3

## Acceptance criteria

1. Three `lars-verify` verdicts are produced for `chrome-beta-nano`, one each for N1, N2 and N3, each backed by a real `verdict.json` under `.commandcode/worktrees/tmp/` (E5).
2. Each verdict is `verified` only when `verdict.mjs lint` exits 0 on that `verdict.json`; otherwise it is recorded `unverifiable` or `inconclusive` with its reason.
3. The fragment `.project/review/rounds/panel-chrome-beta-nano.md` cites each verdict path and verdict word.
4. The held-out test proves each of the three verdict files exists, parses, records `verified`, and is cited by the fragment, with no tautologies.
5. No page data is sent to a cloud model and no panel security model change is introduced (N3).

## Verify

```bash
npm ci && node --test tests/held-out/chrome-beta-nano-panel.test.mjs
```

Heavy: yes

## Log

- created by planner
- N2 verdict: verified (.commandcode/worktrees/tmp/verdict-signal-provenance-chrome-beta-nano/verdict.json); N3 verdict: verified (.commandcode/worktrees/tmp/verdict-di-doctor-chrome-beta-nano/verdict.json); N1 lint verified. All three verdict.json files lint exit 0. Fragment and held-out test written. Specs deleted.- RESULT: ready
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t018-verify): fail, exit 1; output tail:
  ```
        at Test.postRun (node:internal/test_runner/test:1542:19)
        at Test.run (node:internal/test_runner/test:1467:12)
        at async Test.processPendingSubtests (node:internal/test_runner/test:974:7) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: false,
      expected: true,
      operator: '==',
      diff: 'simple'
    }
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
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t018-verify): pass, exit 0; output tail:
  ```
  ✔ N2: cited verdict exists and is verified, or fragment records unverifiable with reason and route (208.9445ms)
  ✔ N3: cited verdict exists and is verified, or fragment records unverifiable with reason and route (41.168ms)
  ℹ tests 4
  ℹ suites 0
  ℹ pass 4
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 456.0503
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
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t018-verify): pass, exit 0; output tail:
  ```
  ✔ N2: cited verdict exists and is verified, or fragment records unverifiable with reason and route (35.64ms)
  ✔ N3: cited verdict exists and is verified, or fragment records unverifiable with reason and route (34.6808ms)
  ℹ tests 4
  ℹ suites 0
  ℹ pass 4
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 247.9326
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
