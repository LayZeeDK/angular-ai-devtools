---
id: T007
title: Measure the panel's initial total with the chat route and hold it to the byte-exact baseline
wave: 2
deps: [T006]
status: done
agent: build_T007
base: 0ff715b2955834ecba7037d8fe340522baeb62e6
worktree: null
task_branch: null
files:
  - scripts/panel-bundle-budget.test.mjs
  - scripts/registry-reach.test.mjs
  - apps/angular-ai-devtools/src/app/app.routes.ts
---

# T007 — Measure the panel's initial total with the chat route and hold it to the byte-exact baseline

## Context

SC4 is half a type-and-test claim and half a measurement, and the measurement is the half no other task takes: `scripts/panel-bundle-budget.test.mjs:362-378` skips its only real assertion — the comparison of the built initial total against `PRE_MILESTONE_INITIAL_KB = 535.44` — whenever `extension/panel/index.html` is absent, which is the state of every fresh checkout because that directory is git-ignored. T003 measured the headroom and T006 added the first eager bytes since the pin was cut (one route literal in `main.js`), so the total with the chat route present is still unmeasured, and `assertWithinBaseline` fails on a single added byte. The same head is the first one whose component consumes `TOOL_REGISTRY` from the panel, so `scripts/registry-reach.test.mjs` — which allowlists exactly `read-tools.ts` and its spec as importers of `page-reads.ts` — is the guard that proves the new surface reached page data the sanctioned way.

## Approach

- **Build, then measure, in that order.** `npx nx run angular-ai-devtools:build-extension` emits into `extension/panel/`; the pin then reads that `index.html`, sums the eager `script`/`stylesheet`/`modulepreload` references and prints both the byte total and the file list. A run without a build is a skip, not a pass — the Log must quote the printed `measured initial total … B` line so the claim is traceable.
- **Prove the lazy boundary held.** The chat component and the three pure modules must appear in no eager reference of the built `index.html`; the printed eager file list is the evidence. If a chat chunk shows up there, the route was not lazy (or something eager imported it) and that is a defect to fix in `app.routes.ts`/the component, not to route around.
- **Over the baseline means offset, never re-pin.** If the printed total exceeds 535,440 B, convert one further explainer route to `loadComponent` in `apps/angular-ai-devtools/src/app/app.routes.ts` and re-measure. `PRE_MILESTONE_INITIAL_KB`, `assertWithinBaseline`, the synthetic fixture in that pin, and `apps/angular-ai-devtools/project.json`'s `520kb`/`1mb` budget are read-only (prohibition N5: raising a threshold is how a regression hides).
- **The reach guard prints what it accepted.** `scripts/registry-reach.test.mjs` prints its allowlist and the number of files it scanned, so a green run names the scanned tree instead of passing vacuously; `tool-registry.ts` must also still export `TOOL_REGISTRY` and not a page reader.
- Both pin files are in `files` only because this task's Verify names them; neither may be edited.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. After `npx nx run angular-ai-devtools:build-extension`, `node --test scripts/panel-bundle-budget.test.mjs` passes and prints a measured initial total at or below 535,440 B, together with the byte figure and the eager file list it summed.
2. The printed eager file list contains no chat chunk, so the chip and the group list live behind the lazy boundary and only the `chat` route literal is eager.
3. `scripts/panel-bundle-budget.test.mjs` keeps `PRE_MILESTONE_INITIAL_KB` declared once as 535.44 and `apps/angular-ai-devtools/project.json` keeps the `520kb` warning and `1mb` error; the only file this task may change is `app.routes.ts`, and only by converting a further explainer route to `loadComponent` when the measurement needs it.
4. `node --test scripts/registry-reach.test.mjs` passes, prints the allowlist it accepted and the number of files it scanned, and reports no file outside `read-tools.ts` and its spec importing `page-reads.ts`.
5. The Log records the printed byte total, its delta against 535,440 B, and whether a further route conversion was needed to get under the baseline.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs scripts/registry-reach.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The build is part of the command because the budget pin's only
     real measurement is skipped without one. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
- build_T007: implementation — no product edit. apps/angular-ai-devtools/src/app/app.routes.ts already lazy-loads the chat route at base (loadComponent importing ./chat-entry.component), so the head is measured as landed; no further explainer route needed converting because the total is under the baseline. Build output went to git-ignored extension/panel; the one tracked side effect (extension/panel/index.html, a stale pre-milestone artifact) was restored to HEAD, so this task changes no product path.
- build_T007: Verify run verbatim — npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs scripts/registry-reach.test.mjs — exit code 0 (npm ci added 994 packages; build succeeded with the 520kb warning at 529.72 kB; node --test reports tests 7, pass 7, fail 0). Re-measured after a second, uncached build (--skip-nx-cache) with the identical total and file sizes.
- build_T007: measured initial total 529.72 kB (529723 B over 7 eager files) against the 535.44 kB / 535440 B baseline — delta -5717 B (-5.72 kB), i.e. the head is 5.72 kB under the pin. Reproduces the T006 regression figure at this head exactly. Eager files summed: chunk-C9Uts9mc.js 2600 B, chunk-ClDaaW9w.js 2045 B, chunk-Cv_aVi0m.js 8998 B, chunk-DkSKihzw.js 645 B, chunk-DweK769i.js 326974 B, main.js 188461 B, styles.css 0 B. No further route conversion was needed.
- build_T007: lazy boundary proved — the built index.html references only the 7 eager files above and no lazy chunk; the chat chunk is chunk-D7eV8cYd.js (name chat-entry-component, 10.29 kB, lazy). Markers app-chat-entry, group-title, cannot-tell and no-angular-root occur in chunk-D7eV8cYd.js alone and in no eager file, so the chat component and the three pure modules (feature-fingerprint.ts, panel-context.ts, tool-groups.ts) ride in no eager reference.
- build_T007: pins held — git diff --exit-code over scripts/panel-bundle-budget.test.mjs, scripts/registry-reach.test.mjs and apps/angular-ai-devtools/project.json exits 0, so PRE_MILESTONE_INITIAL_KB stays 535.44 (declared once), the 520kb warning and 1mb error are unchanged, and neither pin file was edited; registry-reach printed its allowlist (read-tools.ts and read-tools.spec.ts) and 73 scanned files, with no violation outside the allowlist.
- ready
- 2026-11-02 — orchestrator Verify (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  ℹ tests 7
  ℹ suites 0
  ℹ pass 7
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 729.9004
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
- 2026-11-02 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 456.743
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
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
