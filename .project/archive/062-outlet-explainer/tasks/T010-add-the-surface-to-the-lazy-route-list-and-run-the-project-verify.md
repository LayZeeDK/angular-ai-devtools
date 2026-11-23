---
id: T010
title: Add the surface to the lazy-route list and run the project verify
wave: 10
status: done
deps: [T009]
agent: build_T010
base: 9e0e53a5784c34205c08e60751709ea0b2e11a2d
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m062-verdict-claims.json
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T010 — Add the surface to the lazy-route list and run the project verify

## Goal

Repair the one lazy-route list that never gained the new surface, then run the project verify at this head and record it, so
the milestone can reach the final review with a green ledger.

## Context

T009's verify reached `test:app` for the first time in this milestone — every earlier run stopped at `npm test` leg 1 — and
found one failure that has been latent since T003:

```
apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:740
expected [ 'interop', 'chat', 'picker', …(34) ] to deeply equal [ 'interop', 'chat', 'picker', …(33) ]
+ "outlet" after "console-read"
```

The same spec's full path list and its loader-map list both gained `outlet` at T003; the lazy-route list
(`loadComponent !== undefined`) did not. That is the only failing test in the whole verify.

## Approach

Add the surface to that list in the position the route table declares it. Then re-capture the stability record — a task Log
that names paths moves its mention count — and run the project verify. If the capture moves a value another record pins,
name it and stop rather than widening anything.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC4

## Acceptance criteria

1. SC4: the lazy-route list names every surface the route table declares, in the same order — a mutant that drops one reddens naming it — and the project verify builds before it measures, exits 0 and is recorded with its command verbatim.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M062_CAPTURE=1 node --test scripts/outlet-verdict-claims.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/outlet-verdict-claims.test.mjs
```

## Log

- pending.
- Contract amended after the first dispatch, with the measurement it produced: the one-line fix moves `research/raw/m044-gate-shapes.json` (`suiteDiff.differing[1].addedLines` 50 to 51) and the wave-10 plan commit had already staled `research/raw/m062-verdict-claims.json` (its SC4 assignment list lacks T010). Both records and the two censuses that derive them are declared now.
- Landed paths: `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `research/raw/m056-gate-stability.json`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m062-verdict-claims.json`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs` — each is read from this tree, ready.
- Landed the one line the lazy-route list was missing: `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts` names `outlet` between `console-read` and `visual-qa` inside the `loadComponent !== undefined` list, which is the position `app.routes.ts` gives it. The same spec's full path list and its loader map already carried the surface; this list was the only one T003 missed, and it was the only failing test the T009 verify reached.
- Measured the pin rather than trusting it: deleting that one line from the list reddens the spec at `chat-entry.component.spec.ts:740` naming the surface it lost, and putting it back is green again, while the same run's path list and loader map stay green - so the red is the list and not the route table.
- Re-captured the two records the fix and the wave-10 plan commit moved, and nothing else in either record moved: `research/raw/m044-gate-shapes.json` (`suiteDiff.differing[1].addedLines` 50 -> 51, the one added spec line; every other section byte-identical) and `research/raw/m062-verdict-claims.json` (its SC4 assignment list gains `SC4 T010 AC1`, its E8 `assignedByCoverage` gains T010, and `quotes.edges` states the moved list).
- Re-captured `research/raw/m056-gate-stability.json` after this Log was written, because a Log that names paths moves the gate's mention count: the gate prints 19 mentions (T009's re-capture read 18, and the one this Log adds is the route table it names) and the record's `archive.detail.plainRun.summary` now states that count. The two sections held to the commits they name move not at all.
- The project verify ran exactly as `npm run check && npm test` and exited 0 on this tree: `npm run check` green in 26 s (format check, both typechecks, the three gate stages), `npm test` green in 18 m 54 s - leg 1 2,037 of 2,037, user-scope 60 of 60, skills 320 of 320, the app target 383 of 383 in 32 files (it builds before it measures), and the held-out corpus 22 of 22 suites, 85 of 85 tests. One repair was needed before it could measure: the panel-bundle freshness rule refused the present build as stale, because my own mutant measurement had rewritten the spec and moved its mtime past the build, so the extension-panel target was run as the refusal asks and regenerated the bundle byte-identically - no tracked file changed.
