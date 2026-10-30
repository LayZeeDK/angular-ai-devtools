---
id: T006
title: Author the error-explainer verification check and feature map entry
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
  - .commandcode/skills/verify-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/features/error-explainer.md
  - .claude/skills/verify-ai-browsers/checks/error-explainer.mjs
  - .claude/skills/verify-ai-browsers/checks/error-explainer.test.mjs
  - .claude/skills/verify-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/features/error-explainer.md
---

# T006 — Author the error-explainer verification check and feature map entry

## Context

SC5 needs one `lars-verify` verdict per model pair, and a verdict comes only from a fixed check under the
project's verify skill. `verify-ai-browsers` ships five checks — state, model-init, extension-panel,
signal-provenance, di-doctor — and none covers the N4 error explainer, so today the claim cannot be turned into
a verdict without a hand-written pass condition on every run. The project's rules put check authorship in the
user-scope maintenance skill, which never commits and edits only its own control and verify folders; under GSD
Path that work lands as a declared build task, which this is. `control-ai-browsers` and `verify-ai-browsers`
are the two skills whose `.claude` copies are kept byte-identical, and the skills-mirror parity test fails until
both trees agree.

## Approach

- Run the user-scope maintenance skill to author the new check against the `verify-<app>` contract: one
  sentence claim in the header comment, `// @ts-check` and JSDoc, a thrown `CLAIM:` error on the wrong state,
  exit 2 when setup cannot run, evidence captured into the directory given on the command line, and no launch,
  stop or repeat behaviour of its own.
- The check drives the same entry point as its sibling panel checks: the DevTools panel's error explainer on a
  named instance, asserting a captured `NG0xxx` error, its owning component, the digest entry, and a non-empty
  model answer, then leaving its JSON artifact for the verdict.
- Add the feature map entry the check names, with its sub-feature and entry point, so `lars-verify` can resolve
  the claim's coverage set instead of reporting a map gap.
- Register the check in the verify skill's Checks table and its Run section, following the sibling rows.
- Mirror both skill folders byte-for-byte into the `.claude` tree so the parity test passes; this is a
  mechanical copy, not a docs decision, and the earlier accept-drift ruling on `.claude` docs does not cover it.
- Cover the check's own logic with a `node:test` file that exercises a passing path, a thrown `CLAIM:` path and
  an exit-2 path, as the contract requires.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. The new check follows the `verify-<app>` contract and, on each named instance, proves that the panel
   captured an `NG0xxx` error, showed its owning component and the matching digest entry, and returned a
   non-empty model answer — leaving a JSON artifact for the verdict (SC5).
2. Its `node:test` test covers the check's logic including a thrown `CLAIM:` case and an exit-2 case.
3. The verify skill's Checks table and Run section list the new check, and the control skill's features folder
   documents the feature and sub-feature the check names.
4. Both skill folders are byte-identical across the `.commandcode` and `.claude` trees, and the skills-mirror
   parity test passes.
5. `lars-verify check error-explainer` runs through the spec and produces a `verdict.json`.

## Verify

```bash
node --experimental-strip-types --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
```

Heavy: no

## Log

- created by planner (plan revision: verification-skill usage)
