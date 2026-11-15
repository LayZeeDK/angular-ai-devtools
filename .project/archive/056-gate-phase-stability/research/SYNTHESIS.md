# M056 gate-phase-stability — synthesis

Seven waves, nine tasks, reviewed and landed. This records what the milestone measured, what it changed, and
what the ship gate itself turned out to need.

## What the milestone set out to show

The roadmap's premise was that a gate can be trusted only when its phases cannot be reached out of order, and
that a milestone's own recording should name the phase it was taken in. Each of the seven waves produced an
artifact in `review/`, and each passing wave was committed before the next was written, so a red wave stops the
line rather than being absorbed by the next one.

## What measurement changed

The premise survived, but not in the shape the roadmap sentence assumed. The first wave's measurement found the
gate reporting a phase transition as accepted while the recorded state stayed at the previous phase; the finding
was that the recording, not the transition, was the thing to pin. Every later wave inherits that correction, and
`T001` exists in this milestone because the sentence could not be taken at face value.

## Review findings and their resolution

One HIGH and three MEDIUM findings came out of the review of the waves. All four were fixed in `T007`, and each
fix carries a mutation that reddens when the fix is removed — the standard this repository holds verification to,
applied to the milestone's own work.

## The ship gate, which was the real discovery

Four defects in the harness that ships a milestone were found and fixed while trying to ship this one. Each was
fixed only after a measurement made the cause explicit, and two of the five attempts were wrong:

1. **A leftover verify worktree blocked every retry.** `prepare-final` refused with "worktree path already
   exists" and no helper could clear it. The leftover held a stale `.nx` cache and no `.git`; retiring it and
   pruning the registration cleared the path.
2. **The verify sidecar had no artefacts.** The project Verify ran twelve stages in a fresh checkout that had
   `node_modules` bridged but no `dist/` and no extension output, so five artefact-dependent suites failed for
   reasons that said nothing about the branch. `lean_verification.py` now builds the app and the extension in
   the sidecar before the Verify runs. Fixes for this: the extension build regenerates
   `extension/panel/index.html`, and `format:check` then objects to a file the build itself wrote, so the stage
   formats that one generated file afterwards.
3. **A cached failure masqueraded as a fresh one.** `build_state.verify_lookup` reuses a recorded verification
   for the same commit and command, so three consecutive `prepare-final` runs returned the earlier failure with
   byte-identical output. The tell is a test duration repeated to the millisecond. The entry must be dropped from
   `.project/build/verify-ledger.jsonl` — keyed `commit`, not `head` — before a rerun measures anything.
4. **Two of my own hypotheses were wrong**, and the mutation check caught both: bridging an evidence root was
   pointless because the test builds its own temporary root, and adding an explicit `startedAt` to the denied
   verdict changed nothing because the primary passes with and without it. Neither reached the ship.

With the harness fixed, the fresh run returned `status: complete`, the gap review returned `pass`, and
`gate:verification:ship` returned `pass` with `VERIFICATION.json` written.

## What this milestone leaves behind

- a ship path that can verify a healthy branch in a checkout that has the artefacts it reads;
- the rule that a cached verification is not a measurement;
- and the discipline that a fix is accepted only when its removal fails the check that named it, which applied to
  the harness as much as to the product.

## Open, recorded, not hidden

The remaining prevention backlog from the session stands: the `pinned-file` warning on route tables deserves to
be a blocker, `gsd review-headings` should fail on an empty criteria set, and `gsd transition` should refuse the
intent-approval event without a milestone. None of them block this milestone; all of them cost time in it.
