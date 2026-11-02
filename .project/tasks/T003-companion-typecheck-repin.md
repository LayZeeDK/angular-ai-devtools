---
id: T003
title: Add the companion package's type check to the check chain as an authorised re-pin
wave: 1
deps: [T002]
status: pending
agent: null
base: null
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
