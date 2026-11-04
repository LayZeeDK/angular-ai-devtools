---
id: T001
title: Give the fixture an after-render read
wave: 1
status: in-progress
deps: []
agent: build_T001
base: 90d19604560f6d468c255c490de1ac0620b5e748
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - spikes/ng222-app/src/app/after-render-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/after-render-fixture.test.mjs
---

# T001 — Give the fixture an after-render read

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

Add a standalone component on a new fixture route whose `afterNextRender` reads `offsetWidth` from a child element before layout has produced a box. Register the route. Re-pin the panel's route-list assertion in chat-entry.component.spec.ts to include the new route, keeping the full ordered toEqual.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/after-render-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/after-render-fixture.test.mjs`

## Acceptance criteria

1. The component renders on its route and its `afterNextRender` reads `offsetWidth`, proven by the read returning a number (including 0) rather than throwing.
2. No page-side instrumentation is added: no `ɵsetProfiler` call and no profiler subscriber appears in the fixture (held-out E2 depends on this).
3. The panel route-list assertion is re-pinned to include the new route and reddens when the route is removed.
4. The fixture suite passes and the panel spec passes.

## Verify

```bash
npm ci --include=dev; node --test scripts/after-render-fixture.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
- Added after-render fixture page, route, and test with mutants verified

## Attempt 2

Attempt 1 delivered the page, the route and a three-test suite, but every test asserts **source text** —
`pageSrc.includes('offsetWidth')`. Acceptance criterion 1 requires the read to be *executed*: "proven by the read
returning a number (including 0) rather than throwing". A source match cannot show that, and this programme has
repeatedly shipped exactly this defect.

Do this instead:

1. Extract the read into a named method on the component, e.g. `readTargetWidth(): number`, which resolves the child
   element and returns its `offsetWidth`. The `afterNextRender` hook calls that method.
2. Test that method **behaviourally** with a stub element — an object whose `offsetWidth` is `0` — and assert it returns
   `0` and does not throw. Add a second case whose stub returns `640` and assert `640`, so the method is shown to return
   the element's value rather than a constant.
3. Keep the route-registration and no-instrumentation checks, but label them `PRECONDITION:` in the test names. They are
   structural facts about the fixture, not the behavioural proof.
4. Prove the behavioural test bites: make the method return `0` unconditionally and confirm the `640` case reddens;
   make it throw and confirm the zero case reddens. Restore both.
5. The suite must contain **no** assertion whose only content is a substring of another file, other than the two
   labelled preconditions.
