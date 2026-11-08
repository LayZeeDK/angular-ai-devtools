# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 9f8deeddd7c7bb1e8ca09b07d00b013cee3903c9

Written at the reviewed head from the verify ledger entry for T002 (passed at fdcbc3f8) and a
re-run of the suite at this head; the join was also driven over the recorded graph by hand.

## T002 — Join a linked value to the source it follows: pass

- ✅ `node --experimental-strip-types --test "scripts/linked-state.test.mjs"` — 11 tests, 11 pass, 0 fail at this head; the same command passed at fdcbc3f8 in `.project/build/verify-ledger.jsonl`
- ✅ the join answers the recorded agreeing subject with `{"state":"finding","signal":"agreeing","source":"source","value":7,"sourceValue":7,"reason":"matching"}` and the recorded differing subject with `{"state":"finding","signal":"differing","source":"source","value":8,"sourceValue":7,"reason":"differing"}`, driven over `research/raw/m038-linked-state.json`'s own graph at this head
- ✅ the one comparison is `value === source.value` at `extension/linked-state.js:253`; a matching and a differing pair are two findings, and the mutants M5/M6/M7/M8 redden their pins when the agreement is flattened or re-derived
- ✅ an unreadable source answers `cannot-tell` with a named reason (`extension/linked-state.js:249`, `SOURCE_UNREADABLE`), and every measured way a source can be unreadable is pinned — M9 and M10 redden the reason and state pins
- ✅ a finding carries exactly the six contract fields and no seventh; M11, M12 and M13 redden the no-write/no-owner/no-cause pin when a note, a field or a cause is added
- ✅ the E7 pin holds: extra fields on the fact, on every node and on every edge change nothing the join reports — M14 and M15 redden it

## Intent coverage

### SC1 — On the fixture, a linked signal whose value agrees with its source produces a finding naming the signal and the source it follows, and saying the value currently matches.: pass

- ✅ the agreeing subject yields `signal: "agreeing"`, `source: "source"`, both values 7, `reason: "matching"` at this head; held-out E1 (a record with no linked signal yields no finding) and E2 (an unreadable source yields cannot-tell) are pinned in `scripts/linked-state.test.mjs` and redden under mutants M3/M4 and M9/M10

### SC2 — A linked signal whose value differs from its source is reported as differing, and the two values are shown.: pass

- ✅ the differing subject yields `value: 8` beside `sourceValue: 7` and `reason: "differing"` at this head; held-out E3 (equal and unequal values are never merged into one state) is pinned and reddens under M7/M8

### SC3 — Both are produced from what the page already exposes through the signal graph, with no new page-side instrumentation, no build-output and no dev-server dependency.: pass

- ✅ the join reads only `graph.nodes` (`index`, `kind`, `label`, `value`) and `graph.edges` from the fact it is handed — no import, no DOM, no build output, no dev-server read; the purity test loads it in a bare `node:vm` context and it publishes through `globalThis.angularAiLinkedState` only

### SC4 — Where the record cannot say whether a value came from a write or a recomputation, it reports cannot tell with that reason, and names no write, owner or cause.: pass

- ✅ the four absences (`no-linked-signal`, `signal-unreadable`, `value-unreadable`, `source-unreadable`) each answer `{state: "cannot-tell", reason}` with no signal, source or value; held-out E4 (no rendered string names a write, an owner or a cause) is pinned by M11/M12/M13
