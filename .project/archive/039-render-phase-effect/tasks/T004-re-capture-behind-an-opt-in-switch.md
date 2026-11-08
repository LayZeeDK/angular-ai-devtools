---
id: T004
title: Re-capture behind an opt-in switch and record the milestone's verdict claims
wave: 4
status: done
deps:
  - T003
agent: build_t004
base: ce905a0e3e58194380fad6184c95236c09a92af0
worktree: null
task_branch: null
files:
  - scripts/render-phase-capture.test.mjs
  - research/raw/m039-render-phase.json
  - research/raw/m039-verdict-claims.json
---

# T004 — Re-capture behind an opt-in switch and record the milestone's verdict claims

## Context

T001 measured once. A measurement that can only be taken once goes stale the first time
the page or the Angular install moves, and a measurement that re-runs on every test run
writes into a tracked file as a side effect of `npm test`. This task makes the re-capture
a switch: armed by `M039_CAPTURE=1`, read-only otherwise, and it adds the one recording
the project gate itself reads.

That second recording is not optional. The claim-list suite resolves the milestone from
`STATE.md`'s branch and fails, rather than skipping, when
`research/raw/m039-verdict-claims.json` is absent — so `npm test` cannot be green at this
head without it, and SC6 is unreachable until it exists. Its rows rule each of SC1-SC6
against CHARTER's portal clause, quoting each criterion character for character, the way
the previous milestones' recordings do.

The capture re-records the same file T001 wrote, in a later wave and behind a dependency,
so the two tasks cannot race on it: T004 rewrites what T001 established and adds the
claim list beside it.

## Approach

An armed capture and an unarmed proof, in one suite.

Unarmed, the suite proves the discipline instead of driving anything: it names every file
it would write, asserts that none of them changed during the run, and asserts that the
recording on disk still re-derives the claims T001 recorded — so an unarmed run is a
freshness check rather than a no-op. Armed, it takes the measurement again through the
existing capture path for the effect graph and the change-detection message, and rewrites
the recording with a fresh provenance block (route, build, instance, time).

No derived value is pinned as a literal in either half: the suite reads the recording and
compares field by field, and where it must name a shape it names the join's own published
constant rather than a hand-written copy of the answer. A second armed run must change no
byte, which is how idempotence is proven rather than assumed.

The claim list is authored from the intent at this head: one row per criterion, each with
the ruling the portal clause supports, a reason that names the portal route tried or the
artefact the target lacks, and the reading that produces the criterion's facts. Ruling a
criterion `not-required` is a claim too, so each such reason says why the portal clause
does not reach it.

The gate itself is run once at the end of this task and its result recorded in the Log:
`npm run check` and `npm test` at the head.

## Interface contract

None.

## Files

- `scripts/render-phase-capture.test.mjs`
- `research/raw/m039-render-phase.json`
- `research/raw/m039-verdict-claims.json`

## Intent coverage

- SC6

## Acceptance criteria

1. The capture writes nothing by default, names every file it would write, and rewrites the recording only when `M039_CAPTURE=1`.
2. Every value the join and the pane report is derived from the recording, never pinned as a literal in the capture or in its suite, and the suite fails when the recording and the derivation disagree.
3. The claim list rules each of SC1-SC6 with a reason that answers the portal clause, quotes each criterion character for character, and names the source page, route, readings and verdict path for every row it rules required.
4. The project gate is green at the head: `npm run check` and `npm test`, with the claim-list suite no longer failing for a missing recording.
5. A second armed run changes no byte of the recording, so the re-capture is idempotent rather than merely repeatable.

## Verify

```bash
node --check scripts/render-phase-capture.test.mjs && node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/render-phase-capture.test.mjs
```

## Log

- dispatched
- 2026-11-08 - built the opt-in re-capture and the milestone's claim list. `scripts/render-phase-capture.test.mjs` is read-only by default and armed only by `M039_CAPTURE=1`. Unarmed it derives every measurable value of `research/raw/m039-render-phase.json` from the evidence this head carries (both installed @angular/core chunks and declaration files, the probe recording's graph, the fixture sources, the error digest and the page agent's own literal), asserts the recording equals that derivation field by field, names the one file it would write and proves that file hashes the same before and after the run. Armed it re-derives, writes only when a derived value moved, and stamps the `capture` provenance block (route, page, element, component, build, instance, write time, and the sections re-measured - the list computed from the derivation itself, never hand-written). No derived value is pinned as a literal anywhere: the SHA-256, the byte size and the build and browser strings are reported as diagnostics, never asserted. What the armed run re-measures is stated exactly in the file: every value a committed artefact can settle. The counter page's fresh read and the portal sweep are the provenance of the one page read this milestone took and are carried unchanged, since a re-drive would have to move a clock, a console count and a browser build string - the drift that broke M029 T007 and M030 T006 and the reason this switch exists.
- 2026-11-08 - proof, both ways. Unarmed: 11/11 tests pass, `research/raw/m039-render-phase.json` unchanged at 38792 bytes, sha256 dfa3d4e293b1d3c7dd99a0c4af4e6b00382c8ca358ed3b31bb8e4a3411adf5b0 before and after the run, and the same bytes on a second unarmed run. Armed: 12/12 tests pass, the armed run reported "nothing moved, nothing written", and the second armed run left the same 38792 bytes and the same sha256 - byte-identical, so the re-capture is idempotent rather than merely repeatable. The write path is proven live twice over: on a stale copy the correction named `effect.fromRecording.signalsTheEdgesName` and `profiler.sources` and then left the corrected copy byte-identical on a second pass, and through `M039_RECORD=tmp/m039-capture-proof/recording.json` a stale copy was corrected with the movement named (`effect.fromRecording.signalsTheEdgesName: ["elsewhere"] -> ["count"]`, `phase.verdict: "observed" -> "declared-not-observed"`). The recording's diff is 45 added lines and no edited line: every value T001 measured is byte-identical and the only addition is the `capture` block. The hashes above are this run's record, not a pin - the suite pins no hash.
- 2026-11-08 - mutants, each a clone of the recording with one anchored mutation, each reddening the derivation pin after the untouched recording passes it first, each failure naming its defect by string: M1 a profiler value the installed chunk declares dropped from the record; M2 an installed package version moved behind the record; M3 a profiler event claimed to name an effect; M4 the effect given a label the graph does not carry; M5 the signal the effect reads renamed; M6 a probe edge removed; M7 an epoch claimed for a probe recording that holds none; M8 the phase verdict moved to observed; M9 a page claimed to carry a phase field; M10 a fixture file claimed to call afterRenderEffect; M11 a source-scan count invented; M12 the digest entry relabelled as a capture; M13 a digest count no entry supports; M14 a failed attempt recorded as a capture; M15 a write smuggled into the record; M16 an edge said to carry a write; M17 a capture command that names no gate; M18 a write time that is not a timestamp; M19 the capture block dropped; M20 the record attributed to another task. Five further mutants move the evidence (a profiler value, the fixture install, a probe edge, a digest entry, a fixture source) and prove the derivation is live rather than copied.
- 2026-11-08 - the claim list `research/raw/m039-verdict-claims.json` rules SC1-SC6, quotes each criterion character for character (294, 245, 222, 180, 158 and 48 characters), and gives every row a `not-required` reason that answers CHARTER.md's portal clause by name, states what the criterion asserts, names the artefact that carries the fact and the command that proves it - including the one criterion whose portal route was tried and produced nothing, and this milestone's own gate row. The claim-list suite was failing with ENOENT on `research/raw/m039-verdict-claims.json` before this task and now passes.
- 2026-11-08 - Verify (verbatim): `node --check scripts/render-phase-capture.test.mjs` clean; `node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/overlay-verdict-claims.test.mjs"` -> 34 tests, 34 pass, 0 fail; `npx prettier --check scripts/render-phase-capture.test.mjs` -> "All matched files use Prettier code style!".
- 2026-11-08 - the project gate is NOT green at this head, and none of its three causes is in this task's declared files, so SC6 is unmet and the verdict is blocked. Measured: `npm run check` stops at `check:extension` with `extension/render-phase.js(314,45): error TS2345` (T002's file, unmodified by this task and already red at the base commit); `gate:verification` reports `[FAIL] contract:control-angular-dev-app` -> `[ERROR] proven-manifest: features/.proven.json names features with no feature file: portal-zoneful-worktree`; and `format:check` names `AGENTS.md` and `extension/panel/index.html` as not Prettier-formatted. `npm test` cannot exit 0 either: the root script glob is 782 pass / 6 fail, the six being extension-typecheck E1 and E2 (the same extension typecheck error), fixture-proof-fresh (the same missing portal-zoneful-worktree feature file), user-scope-autonomy's installed-helper health, and verification-gate's two ship-mode cases - none of those six suites names render-phase, m039 or any file this task touched. The repair belongs to a patch task over `extension/render-phase.js`, the control-angular-dev-app proof manifest and the two formatting sites, not to a hand edit outside this task's contract. blocked
