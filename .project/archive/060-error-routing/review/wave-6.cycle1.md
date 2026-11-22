# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 0bc29d52f2ffb77b42756924159c449d5a7a3662

## T006 — Pin the recorded head honestly: pass

- ✅ The landing is the suite and nothing else: `git show --stat 0bc29d52` carries
  `scripts/error-routing-shapes.test.mjs` plus the task file, and `research/raw/m060-record-shapes.json` is
  byte-identical, so the record still pins the commit its armed capture ran at (`32b384b0`) rather than a head typed
  later.
- ✅ The defect it repairs was real and was reproduced before the fix: at the ship head the two head assertions
  reddened with `the record was captured at a head that is not the current HEAD`, while every measured section was
  already byte-identical — an armed capture cannot pin a future commit, so an equality rule was wrong by
  construction.
- ✅ The replacement is reachability, not a deleted check: `headIsAncestor(sha)` resolves with
  `git rev-parse --verify <sha>^{commit}` and then requires `git merge-base --is-ancestor <sha> HEAD`, both through
  `execFileSync` with `stdio: 'pipe'` so a refusal is a catch rather than a crash (the first attempt used an
  unimported `spawnSync` and failed with `ReferenceError`, recorded rather than hidden).
- ✅ The rule is proved to bite: the suite asserts a fabricated 40-hex sha is refused
  (`headIsAncestor('0'.repeat(40)) === false`), so an ancestry check that always answered true cannot pass, and the
  live record exercises the positive path because `32b384b0` is genuinely behind the reviewed head.
- ✅ The intra-record pin survives: `commands[0].output === head` is untouched, so the record still cannot contradict
  itself.
- ✅ The suite is 9/9 at this head, and `npx prettier --check` ran on the touched file before the landing.
- Files the wave touched, read or not read: `scripts/error-routing-shapes.test.mjs` — read at every changed site
  (`gitHead`, `headIsAncestor`, the byte-identity test, the head test); `research/raw/m060-record-shapes.json` — read
  to confirm its bytes were unchanged; `.project/tasks/T006-pin-the-recorded-head-honestly.md` — read.

## Intent coverage

### SC1 — An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.: pass

- ✅ T006 changed no observable and added none: the file it edits is a suite, and `git show --stat 0bc29d52` touches no
  `extension/` module, so the finding's inputs — the global listener record, M042's boundary entries and the injector
  walk — are the same ones wave 1 reviewed. The suite it repairs asserts those same observables
  (`readListeners(source)` derives the two global listeners from `extension/agent-main.js` at run time, never from a
  remembered list), and its 9/9 run at this head is that assertion passing.

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.: pass

- ✅ The repair exists because the record is produced from observables and the record is what drifted: the suite now
  serialises with the record's own head (`serializeRecord(recorded.head)`) and requires that head to be reachable from
  `HEAD`, so a record produced at an earlier commit still re-derives byte-for-byte at the ship head — which is the
  condition for the record to be evidence rather than a snapshot of one checkout. No new page-side instrumentation, no
  second tap, no second global listener: the diff adds two helper calls and a reachability rule, and nothing else.
