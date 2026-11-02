---
id: T003
title: Add the companion package's type check to the check chain as an authorised re-pin
wave: 1
deps: [T002]
status: done
agent: build_T003
base: 92a2619f54d046c7e12d3bf97cb8fd26e693cd82
worktree: null
task_branch: null
files:
  - package.json
  - scripts/panel-typecheck-scope.test.mjs
---

# T003 — Add the companion package's type check to the check chain as an authorised re-pin

## Context

`npm run check` is four stages in a fixed order and the root `tsconfig.json` lists exactly three include entries, two of them absolute paths outside this checkout, and both facts are asserted by deep equality in `scripts/panel-typecheck-scope.test.mjs` together with the panel config's `include`/`exclude`. A package that lives outside `apps/` and outside the root include list is therefore type-checked by nothing: `@angular/build:application` compiles the panel with its own transform pipeline and never reports a type error, and no other stage reads a file under the new package root. Adding the package's check cannot be done quietly — the stage list is a pin, so the change is a deliberate re-pin carried by its own acceptance criterion, in the same shape M018's panel stage took, rather than an edit in passing (INTENT.md § Constraints, SYNTHESIS.md decision 1). This is the last of wave 1's three structural questions: without it the package ships unchecked, which is the weaker form of the defect the pin exists to catch.

## Approach

- **The stage chain has one owner.** `package.json`'s `check` script is the chain; `check:skills` and `check:panel` are its named stages. Add a fifth named stage the same way the fourth was added — a `check:companion` script that runs `tsc` against `packages/ai-devtools-companion/tsconfig.json` and nothing else, appended last so the three pre-existing stages and the panel stage keep their positions and `npm run check` still fails on the first red stage.
- **Re-pin the pin, do not widen it.** The failing assertion is the `assert.deepEqual` over the chain's stages in `scripts/panel-typecheck-scope.test.mjs`; its expected list gains exactly one entry. The panel config's `include`/`exclude`, the `check:panel` script assertion and the root `tsconfig.json`'s three-entry assertion stay byte-identical: the panel's breadth and the root's scope are not this milestone's to change.
- **The pin must still bite.** That suite proves each rule twice: a green half and a red half that restores a violation and asserts the refusal. A re-cut expectation list that no longer refuses a dropped or reordered stage is a weakened pin (N6), so the red half is re-cut to the new list and still fails when a stage is removed.
- **Prove the new stage compiles something.** A check over a path that does not resolve is a check over nothing, which is the defect the pin's own comment forbids. Introduce a deliberate type error in the package's sources, watch `npm run check:companion` fail, revert it: the failure message must name the file and the line. Keep that demonstration in the pin's fixture style rather than in prose, so a later milestone cannot drive the stage to a no-op.
- **Two Angular versions, one compile.** The package's own type check resolves `@angular/*` from this checkout's root install, 22.1.8, while the identity promise is measured against the fixture's 22.2.2; the two vetted symbols exist in both, and this task adds no path mapping, no `types` narrowing and no `skipLibCheck` relaxation to bridge them. If a version-specific type is needed to compile, the package's public surface is naming a symbol the peer range does not carry, and that is a design defect to report rather than to suppress.
- **Offline and sidecar-safe.** The stage runs in the verify sidecar, where dependencies are bridged before `tsc` runs; it adds no dev server, no network fetch and no build output, so the sidecar behaviour of `npm run check` does not change.

## Interface contract

- None

## Intent coverage

- SC5

## Acceptance criteria

1. `npm run check` runs five stages in this order — `node scripts/ensure-sidecar-deps.mjs`, `tsc -p tsconfig.json`, `npm run check:skills`, `npm run check:panel`, `npm run check:companion` — and `check:companion` runs `tsc` against `packages/ai-devtools-companion/tsconfig.json` and nothing else.
2. `scripts/panel-typecheck-scope.test.mjs` asserts the five-stage list as the deliberate re-pin, while its assertions about the panel config's `include`/`exclude`, the `check:panel` script and the root `tsconfig.json`'s three include entries keep their base bytes.
3. The pin still fails when a stage is dropped or reordered: its red half is re-cut to the new list and restores a violation, so no expectation list was widened into an unconditional pass.
4. A deliberate type error in the package's sources fails `npm run check:companion` with a message naming the file, and reverting it makes the stage green again, proven through the pin's own fixture rather than by prose.
5. `npm run check` and `npm test` pass at the head with the fifth stage in place, and no other declaration changes: the root `package.json` gains only the one script and its chain entry, and no `@angular/*`, `dependencies` or `workspaces` field is added to it.

## Verify

```bash
npm ci --include=dev && npm run check && node --test scripts/panel-typecheck-scope.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: no

## Log

- 2026-11-02 — created by planner
- build_T003: package.json gained exactly the chain entry and one script — check is now node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel && npm run check:companion, and check:companion is tsc -p packages/ai-devtools-companion/tsconfig.json; no dependency, workspace, publish or @angular field touched. scripts/panel-typecheck-scope.test.mjs re-pinned deliberately: CHECK_STAGES names the five stages exactly (no wildcard, no some()), the red half replays the same assert.deepEqual over four mutated lists (companion dropped, panel dropped with companion present, panel and companion swapped, an extra stage appended) and asserts each is refused; the panel config include/exclude assertion, the check:panel script assertion and the root tsconfig three-entry assertion keep their base bytes. Two new companion properties: the config the stage names exists, is noEmit (the stage writes no build output) and carries no @ts-ignore, and tsc -p packages/ai-devtools-companion/tsconfig.json --listFiles shows all 3 package sources inside a 272-file program; then a fixture under the git-ignored tmp/ extends the real config with one probe file (rootDir restated to the checkout — the only edit, because a probe outside the package rootDir cannot share one rootDir with it across drives and the Approach forbids a paths bridge) and fails with exactly one TS2322 naming deliberate-type-error.ts(1,14), exit 0 once the probe is fixed, nothing tracked written. Verify (npm ci --include=dev && npm run check && node --test scripts/panel-typecheck-scope.test.mjs) exit 0 at this head: npm ci 994 packages, npm run check green through all five stages including the new tsc -p packages/ai-devtools-companion/tsconfig.json, pin 7/7 tests pass. npm test also run at this head, exit 0: 176/176 scripts+extension tests, 60/60 user-scope, 590/590 skills, test:app 28 files / 277 tests. No scratch left in the checkout (only package.json and the pin modified).
- ready
- 2026-11-02 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 4785.8148
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
  ```
