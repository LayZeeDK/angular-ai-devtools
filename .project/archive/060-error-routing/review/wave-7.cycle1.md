# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 2dad020b535f30b8d0e51ba698a9c444bd5e96be

## T007 — Re-derive the gate records at the ship head: pass

- ✅ The drift was measured before it was repaired: `node --test scripts/gate-stability-record.test.mjs` refused with
  `the recording disagrees with this run's derivation at 2 value(s) … fixRecord.exitCode: 0 -> 1`, and
  `node --test scripts/gate-integrity.test.mjs` refused with
  `suiteDiff.differing[15].addedLines: 394 -> 427` — 427 being 394 plus exactly the 33 lines T006 added to
  `scripts/error-routing-shapes.test.mjs`, which is that differing entry.
- ✅ Both captures are armed and both exited 0: `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and
  `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`. Only `research/raw/m044-gate-shapes.json` moved;
  the stability record stayed byte-identical because its `fixRecord` section derives by running the gate-integrity
  suite, which the shapes repair returned to green — one defect, two symptoms, one fix.
- ✅ The acceptance criterion's proof is the second, unarmed run: both suites then read the records they had just
  produced and found no differing value, so the records are not merely written but re-derivable.
- ✅ The landing touches only the recording: `git show --stat 2dad020b` reads
  `research/raw/m044-gate-shapes.json` and the task file. No suite source changed, so the re-derivation cannot have
  widened a check to make the drift pass.
- Files the wave touched, read or not read: `research/raw/m044-gate-shapes.json` — read at the changed
  `differing[15]` entry; `research/raw/m056-gate-stability.json` — read to confirm it did not change;
  `scripts/gate-integrity.test.mjs` and `scripts/gate-stability-record.test.mjs` — run four times each, not read whole
  (their assertions are consumed through the runs and the refusal text quoted above).

## Intent coverage

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.: pass

- ✅ The two recordings are the observable this milestone publishes, and they now state what this head derives: the
  gate-shapes record's `differing[15].addedLines` is 427 (the count the tree produces), and the gate-stability record's
  `fixRecord` section is green because the suite it derives from is green. Both were read back without a capture flag
  and produced no differing value, which is what makes them evidence at the ship head rather than a snapshot of the
  head they were captured at.
