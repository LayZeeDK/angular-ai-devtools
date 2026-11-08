---
id: T006
title: Copy text.mjs beside every fingerprint copy the tests build
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs
  - .commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs
  - .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs
---

# T006 — Copy text.mjs beside every fingerprint copy the tests build

## Context

`24fe740` made each `control-*/scripts/fingerprint.mjs` a byte copy of the canonical file in
`lars-create-verification`, and the canonical file statically imports a sibling module, text.mjs
(`fingerprint.mjs:32`). Four of the control-skill tests still copy only `fingerprint.mjs` into their
throwaway skill folder, so the copy they spawn cannot resolve its own import:

```
ERR_MODULE_NOT_FOUND: …fingerprint-copy-XXXX/.claude/skills/control-demo/scripts/text.mjs
```

That is the failure at `fingerprint.test.mjs:34` in `control-angular-dev-app`,
`control-angular-devtools`, `control-pangular-inspector` and `control-vitest-browser-angular`: four
tests, one cause. The defect was masked until T005 re-cut the chain pin, because `npm test` stopped
at the primary suite's single failing assertion before it ever reached `npm run test:skills`.

The canonical test already copies both files (`lars-create-verification/scripts/fingerprint.test.mjs:113-114`),
and `.commandcode/skills/control-ai-browsers/scripts/fingerprint.test.mjs:48-51` mirrors it in this
repository. The `.claude` copies of the other four skills carry a `fingerprint.mjs` that does not
import `text.mjs`, so they need no change.

## Approach

Add the same two-line copy of `text.mjs` beside the existing `fingerprint.mjs` copy in those four
tests, in the shape the canonical test and the passing `control-ai-browsers` test already use:

```js
  copyFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'text.mjs'),
    join(skill, 'scripts', 'text.mjs'),
  );
```

Nothing else changes: no assertion is touched, no test is skipped, and the four `.claude` copies stay
as they are because their `fingerprint.mjs` copy imports nothing.

## Interface contract

None

## Files

- `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs`
- `.commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs`
- `.commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs`
- `.commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs`

## Acceptance criteria

1. Each of the four tests copies `text.mjs` beside `fingerprint.mjs` into its throwaway skill folder, in the canonical test's own shape.
2. Each of the four tests passes alone: `node --test .commandcode/skills/<skill>/scripts/fingerprint.test.mjs` is 1 of 1 green.
3. At the task's base the same four commands fail with `ERR_MODULE_NOT_FOUND` naming `scripts/text.mjs`, so the repair is not vacuous.
4. No assertion is changed, no test skipped, and the `.claude` copies of these four tests are left as they are, because their `fingerprint.mjs` imports no `text.mjs`.

## Verify

```bash
node --experimental-strip-types --test ".commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs" ".commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs" ".commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs" ".commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs"
```

## Intent coverage

- SC6 — AC4

## Log

- dispatched
