---
id: T008
title: Re-pin the panel route list the image-budget surface extends
wave: 6
status: done
deps: [T004]
agent: build_T008
base: f04184cfa2838d188d78a9ba23e9b0c5e0034643
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
---

# T008 — Re-pin the panel route list the image-budget surface extends

## Context

The ship Verify at `5711945` failed in the panel unit suite:

```
AssertionError: expected [ '', 'signal-provenance', …(7) ] to deeply equal [ '', 'signal-provenance', …(6) ]
```

`apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:603` deep-equals `appRoutes.map(route => route.path)`
against the six lazy routes the panel ships. T004 added `image-budget` as the seventh, so the pin is stale.

That pin is a guard against accidental route drift, and a deliberate addition is exactly what it must be told about.
It could not be declared by T004 because the plan did not know the app suite pinned the list — the omission is the
plan's, not the coder's.

## Approach

1. Read the assertion and the surrounding `describe`, then extend the expected list with `image-budget` **in the
   position `app.routes.ts` actually declares it**. Do not reorder the existing entries.
2. Keep the assertion exactly as strong: still a deep equal against the whole ordered list, so an extra, missing or
   reordered route still fails.
3. Add a comment beside the new entry naming why it exists (M026's COM-1 surface), so the next reader sees a
   deliberate re-pin rather than a tolerated addition.
4. Prove it bites in both directions and report each: removing `image-budget` from the expectation reddens
   ("fewer routes expected than declared"); adding a route to `app.routes.ts` and not to the list reddens
   ("more routes declared than expected"). Restore both.

## Interface contract

None

## Acceptance criteria

1. `npx nx run angular-ai-devtools:test` passes, and the route assertion still compares the whole ordered list.
2. Removing `image-budget` from the expected list reddens the suite naming the mismatch.
3. No other assertion in the spec is changed, and `app.routes.ts` is untouched.
4. Proven by the two mutants above, each run and reported.

## Verify

```bash
npm ci --include=dev; npx nx run angular-ai-devtools:test
```

## Held-out

No intent edge: this task re-pins a guard. The proof is the two ordering mutants in the spec itself.

## Intent coverage

- SC5

## Log

- created
- Re-pinned route list with image-budget (M026 COM-1); suite 331/331 pass; mutants reddened both ways
