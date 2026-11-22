# SYNTHESIS — M059 teardown-leak

What this milestone established, in the order the evidence established it. Every number here is one a
suite or a record re-derives; nothing is asserted from memory.

## The roadmap's sentence did not survive measurement

The entry promised an answer naming "the subscription, effect or timer that outlived it". C1 measured, before
the surface was shaped, that no such handle record exists anywhere in this tree: `handleRecord`, `postDestroy`
and `leakedHandle` occur zero times across 38 extension modules, 136 suites and 148 records; the only
`.unsubscribe(` sites are the agent's own; and nothing intercepts `setTimeout`, `subscribe` or `effect`.
Building that record is the page-side instrumentation the entry's own second criterion forbids, so the
observable had to be one Angular already emits.

## What the agent can actually see

`NG0205` — "Injector has already been destroyed" — is real, is in the 64-code digest (`extension/error-digest.json`,
sha256 `426a5be1…`, 61,577 bytes), and is thrown by `Injector.get` on a lookup through a destroyed injector.
It has **never been produced on a page** in this repository: T001 drove the portal over five routes (38 console
lines) and `spikes/ng222-app` at `/stale-view` (4 lines, all before the destroy) and recorded `not-produced`.
The answer therefore names the diagnostic the record carries and states what it cannot attribute.

## What the join answers

`extension/teardown-leak.js` is a pure function of the console record and the digest. It returns one object in
every state — `{ state, code, message, owner, absences, claims, detail }` — with `handle-record-not-held`
present in all four, `owner` filled only from a field the message itself carries, and the two absences kept as
two states. Eighteen tests, seven mutants, each naming its defect by string.

## The surface

`panel-teardown-leak.ts` renders that object and nothing else. The panel grew from 28 to 29 surfaces, 37 to 38
ordered paths and 198 to 204 digest rows, and every enumerating suite moved in the same commit.

## What the milestone cost, and what it taught

Fourteen tasks and fourteen waves. The product was four of them; the other ten were **censuses** — suites that
read `research/raw/` and derive a shape the milestone had not been told to satisfy:

| defect class | discovered by | repaired by |
|---|---|---|
| a record that quotes a code counted as a page observation | wave-1 review | T007 |
| a scope count frozen as an equality (records, modules, build output) | ship gate, three times | T009, T012 |
| a milestone with records but no claims map | census suites | T010 |
| gate records staled by the last landing | ship gate, three times | T005, T008, T011, T014 |
| a claims record whose shape the census derives | project verify | T013 |
| a byte total recorded but never stated in prose | project verify | T014 |

The plan-time lesson is the whole of it: **enumerate every suite that reads `research/raw/` and the shape each
derives, at `plan/active`, before the plan is approved.** Six discoveries at the ship gate is not diligence.

## What the milestone does not claim

- No page ever emitted `NG0205`; the answer is proved against the record and the digest.
- `owner` is proved on a fixture message, not a captured one.
- No guard-style inference and no handle name appears in any answer, in any state.
