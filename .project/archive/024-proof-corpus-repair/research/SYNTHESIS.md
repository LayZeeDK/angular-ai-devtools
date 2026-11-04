# Synthesis — M024 `proof-corpus-repair`

## The question

Thirty-two held-out suites, none reached by an npm script, ten red in every fresh checkout. What should the
milestone do with them?

## Options considered

**A. Re-home all ten.** Carry each suite's data inside the suite, as an earlier milestone did for a declaration.
Rejected for the six `eN` suites: their subject is a fixed-layout review record that no longer exists, and the
claim they made — a record with zero defects, an unverifiable entry, a portal dependency — is now enforced by the
review grammar (`gsd review-check`, `gsd final-check`) on artifacts that actually exist. Re-homing would preserve
a claim whose checker has been superseded, at the cost of a suite that proves nothing new.

**B. Delete all ten without a record.** Rejected: the claim is the asset. Prohibition N3 forbids deleting to
reach green, and a reader six months from now deserves to know what those files asserted and where that assertion
went instead.

**C. Wire the corpus into the gate and leave `e7` alone.** Rejected on the wave-1 review: `e7` reads
`.project/archive/`, so the corpus would be red in exactly the state the ship flow creates — the milestone would
ship a gate that fails the moment it ships.

**D. Retire the ten with a checked record, wire the corpus, and re-home `e7`.** Chosen.

## Why D

- The ten cannot pass and their claims have live successors, which is the definition of a claim worth retiring
  rather than re-homing.
- The corpus only becomes a *gate* once a red suite fails the build; wiring it without retiring them would ship a
  permanently red gate, which teaches that red is normal.
- `e7` is different from the ten: its claim (the archive precedes the retirement, and the retired tree is gone) is
  still true and still worth asserting. It was reading a path, not making a stale claim, so it is re-homed.

## What the ruling changed

The first attempt at T004 set an acceptance criterion stronger than SC3: "the whole corpus exits 0 with
`.project/` absent". Two corpus suites drive `npm test` by design, and three root script suites legitimately read
`.project/`, so that is unreachable. The orchestrator ruled the criterion down to SC3's letter — no suite under
`tests/held-out/` reads `.project/` — which is provable and is what the intent actually says.

## Residual risk accepted

The corpus counts a suite's own printed summary, so a forged `# tests 5 / # pass 5` is believed. Closing that
needs a runner-owned reporter, which is a larger change than this milestone; it is recorded in the final review
with the hardening direction rather than left implicit.
