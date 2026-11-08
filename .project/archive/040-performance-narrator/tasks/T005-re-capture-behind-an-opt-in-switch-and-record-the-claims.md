---
id: T005
title: Re-capture behind an opt-in switch and record the milestone's claims
wave: 5
status: done
deps:
  - T004
agent: commandcode-coder
base: cff78961190a64534cced5e829fda6033f6efe3b
worktree: null
task_branch: null
files:
  - scripts/performance-capture.test.mjs
  - research/raw/m040-work-events.json
  - research/raw/m040-verdict-claims.json
  - scripts/performance-measure.test.mjs
  - scripts/performance-narrator.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T005 — Re-capture behind an opt-in switch and record the milestone's claims

## Context

The measurement, the widened record, the join and the pane are each proven by a suite
that reads the recording rather than a literal, but nothing yet makes the recording
repeatable, and the milestone owes the gate two artefacts it does not have. Without
`research/raw/m040-verdict-claims.json` the repository's own claim-list suite fails by
construction — it resolves the milestone from the state file's branch, reads that exact
file and refuses a missing one — so the project gate cannot be green until the file
exists and rules every criterion the intent declares.

The capture is the same shape M039 proved: read-only by default, armed by an environment
switch, deriving every value from the installed packages, the agent's own source and the
committed witness frame rather than re-driving a browser. Re-driving would move a
timestamp, a console count and a browser build string on every run, which is exactly the
drift the byte-stability requirement forbids. A second armed run with nothing moved must
change no byte.

## Approach

One capture suite, one recording, one claim list and the project gate.

The capture derives every section of the recording from what this head ships: the
enum and the pairs from the installed builds, the agent's literal and its `onEvent`
citation from the page agent's own source, the witness frame from the committed recording
itself (never from a fresh browser run), and the narrator's answer for that frame by
running the landed join over it. It names every file it would write and writes nothing
when the switch is unset; with `M040_CAPTURE=1` it writes the recording in its canonical
serialisation and nothing else. No reported value is pinned as a literal in the capture
or its suite: each is derived, so a source that moves reddens the derivation and names
the value that moved rather than passing on a stale number.

The claim list rules each of SC1 to SC6 with a reason that answers the charter's portal
clause by name, quotes the criterion character for character, and — where a fixture
carries the evidence — names the zoneful portal route it tried and the artefact that
target lacks, exactly as the repository's verification-target rule requires. A criterion
the portal clause does not reach is ruled not-required with a reason that says why, so a
milestone that owes no driver names none rather than inventing one.

The project gate is the last acceptance: the two commands the plan names are run at the
head, with the claim list present, so the claim-list suite checks the list instead of
failing on its absence.

The suite proves its own pins non-vacuously: a mutant that writes the recording on a
default run reddens, and a mutant that pins a derived value as a literal reddens, each
naming the defect by string.

## Interface contract

None

## Files

- `scripts/performance-capture.test.mjs`
- `research/raw/m040-work-events.json`
- `research/raw/m040-verdict-claims.json`
- `scripts/performance-measure.test.mjs`
- `scripts/performance-narrator.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. A default run writes nothing, names every file it would write, and leaves the recording byte-identical after the run.
2. With `M040_CAPTURE=1` the capture re-derives every section from the installed builds, the agent's source, the committed witness frame and the landed join, writes the recording in its canonical serialisation and nothing else, and a second armed run changes no byte.
3. No reported value is pinned as a literal in the capture or its suite: each is re-derived, and a source that moves reddens the derivation naming the value.
4. The claim list rules each of SC1 to SC6 with a reason that answers the charter's portal clause by name, quotes the criterion character for character, and names the zoneful portal route tried and the artefact the portal lacks wherever a fixture carries the evidence.
5. The project gate is green at the head — `npm run check` and `npm test` — with the claim list present, so the milestone's claim suite checks the list rather than failing on its absence.
6. A mutant that writes the recording on a default run, and a mutant that pins a derived value as a literal, each redden a named assertion and name the defect by string.

## Verify

```bash
node --check scripts/performance-capture.test.mjs && node --experimental-strip-types --test "scripts/performance-capture.test.mjs" "scripts/performance-measure.test.mjs" "scripts/performance-narrator.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/performance-capture.test.mjs && npm run check && npm test
```

## Log

- pending
- 2026-11-08 — `research/raw/m040-verdict-claims.json` written first, because the gate could not be green without it: `scripts/overlay-verdict-claims.test.mjs` resolves the milestone from `.project/STATE.md`'s branch (`gsd-path/M040`), reads `research/raw/m040-verdict-claims.json` and refuses a missing one by construction. Six rows, one per criterion the intent declares, each `criterionText` **parsed** out of `.project/intent/INTENT.md` by the same routine the check uses and never retyped (482/340/349/296/220/48 characters for SC1-SC6, and `criterionCharacters` is that length). Every row is ruled `not-required` with a reason that answers CHARTER.md's portal clause by name, names the artefact that carries the criterion and the exact command that proves it: SC1, SC3 and SC4 on `pairs`/`identity`/`frames` in `research/raw/m040-work-events.json` with `scripts/performance-narrator.test.mjs` and `scripts/performance-measure.test.mjs`; SC2 on `extension/agent-main.js` with `extension/agent-main.test.mjs` and the narrator suite; SC5 on `apps/angular-ai-devtools/src/app/panel-performance.ts` with `scripts/panel-performance.test.mjs` and `npx nx run angular-ai-devtools:test`; SC6 on the gate itself. Suite result: 10 tests, 10 pass, 0 fail — including the case this task exists to unblock, which had been failing with ENOENT.
- 2026-11-08 — `scripts/performance-capture.test.mjs`, the opt-in re-capture (AC1-AC3, AC6). Unarmed it derives every section a committed artefact can settle and **writes nothing**: the enum and the five pairs from both installed `@angular/core` chunks, every `profiler(...)` emission site of both chunks with its argument list, enclosing function and bracket shape, the agent's literal plus its `openCycle`/`closeCycle` anchors and tap count from `extension/agent-main.js`, the frame's start-order reading from the recorded witness, and the narrator's answer by running the landed join in a bare `vm` context over the frame the recording carries. The one browser run's readings are carried and re-checked for internal consistency rather than re-driven, because a re-drive moves a timestamp, a console count and a browser build string on every run. Armed (`set "M040_CAPTURE=1"&& node --experimental-strip-types --test "scripts/performance-capture.test.mjs"`) it re-derives, compares and writes only what moved, in the file's own canonical serialisation. Proved both ways: unarmed 14 tests, 14 pass, 0 fail, with the recording byte-identical before and after the run (`95068 bytes, sha256 7e526486…`); armed 15 tests, 15 pass, 0 fail, "nothing moved, nothing written", a second armed run byte-identical (`sha256 …ec56dc0` before and after), and the write path proved live on a `tmp/` proof copy — a copy with two values drifted was corrected, the correction named `pairs.sources`, and a second armed run left it byte-identical at the same sha.
- 2026-11-08 — the mutants, each proven non-vacuously by pinning the untouched record first and then one anchored mutation of it, every one reddening with a failure that names the defect by string: **M1** a profiler value the installed chunk declares dropped from the record → `pairs.sources`; **M2** an installed version moved → `pairs.sources`; **M3** the two installs claimed to disagree → `pairs.identical`; **M4** a pair's numbers moved off the derived enum → `pairs.sources`; **M5** an emission site removed → `identity.sites`; **M6** an emission site given an argument it does not pass → `identity.sites`; **M7** a pair ruled to carry an identity it does not → `identity.perPair`; **M8** the named absence moved onto another pair → `identity.namedAbsence`; **M9** the agent's frame said to open on another event → `frames.agentFrame`; **M10** a start claimed to arrive with no frame → `frames.startsWithNoFrame`; **M11** a bracket claimed to be held by the agent's frame → `frames.disagreements`; **M12** a witness page whose counts no longer add up → `add up`/`eventsRecorded`; **M13** a witness page claimed zoneful → `zoneGlobal`; **M14** a portal refusal relabelled as a capture → `portalAttempt`; **M15** the artefact the portal lacks left unnamed → `portalAttempt.lacks`; **M16** a `durationMs` the page never measured smuggled into the record → `durationMs`/"cost nobody measured"; **M17** a write time that is not a timestamp → `capturedAt`; **M18** the record attributed to another task → `recording task`; **M19** the zoneless portal measurement relabelled as a refusal → `portalZonelessAttempt`; **M20** a zoneless pair that lost its ends → `portalZonelessAttempt records`; **M21** a zoneless page read as zoneful → `zoneless`. Three further probes sit beside them: **the derivation moves when its evidence moves** (a profiler value the chunk began to declare, a pair the chunk stopped declaring, the fixture install moving, an emission site losing or gaining its instance argument, a second profiler tap, a drifted witness count — each moves the named path); **the read-only pin bites** (a `before` that is not the file's hash reddens it, and the file list is exactly the recording); and the claim list's quote rule mutated by **one character** — SC1's `criterionText` changed by a single character reddens `/SC1 must quote/`, and a row naming an undeclared criterion reddens `/SC99/`.
- 2026-11-08 — the zoneless portal, the fact this task owes. Two measurements, both recorded. **The pinned target refuses**: the zoneful worktree (commit `9767523…`, Angular 20.3.35) on route `/home`, recorded by T001 as `witness.portalAttempt` with `result: negative` — the artefact it lacks is a zoneless profiler stream. **The zoneless checkout answers**: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` at `claude/ai-devtools-spike@92d46ec`, `@angular/core` 22.2.2 installed with no `zone.js` dependency, served by `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal --dir <path>` on `http://localhost:4507/`, route `/home` driven through `control-ai-browsers run chrome-beta-gemma4`. Result: **supported**. All four gates `extension/agent-main.js:507-553` reads are open — `ng.ɵsetProfiler` present, `ng.ɵgetSignalGraph` present, `window.Zone` absent and the root injector with no `NgZone` provider (`NG0201: No provider found for NgZone`) — and one tap over a router navigation and a click recorded all five pairs with both ends: TemplateUpdate 60/60, LifecycleHook 64/64, ChangeDetection 3/3, Component 32/32, HostBindingsUpdate 26/26, with `ComponentStart` passing no instance on all 32 starts while its ends carry names and `ChangeDetection` carrying none at either end — the same shape the counter fixture measured. Recorded as `witness.portalZonelessAttempt` (`result: supported`) beside the refusal, with an `assertInternal` rule that keeps the two from drifting into one comfortable story, and the claim rows now say plainly that CHARTER.md's portal clause **does** reach this milestone's facts on the portal's zoneless main: a portal-backed verdict becomes possible the moment `AGENTS.md` re-pins verification to that checkout, and until then a verdict taken on the pinned zoneful target would restate a refusal rather than produce a frame. The measurement cost one serve check and two `run` calls, and no debugging.
- 2026-11-08 — Verify (verbatim, exit 0): `node --check scripts/performance-capture.test.mjs` clean; `node --experimental-strip-types --test "scripts/performance-capture.test.mjs" "scripts/performance-measure.test.mjs" "scripts/performance-narrator.test.mjs" "scripts/overlay-verdict-claims.test.mjs"` → **59 tests, 59 pass, 0 fail** (14 of them this task's); `npx prettier --check scripts/performance-capture.test.mjs` → "All matched files use Prettier code style!"; `npm run check` → exit 0 (both tsc stages, skill-lint, skills-registered, the verification gate's structure pass, and `format:check` clean); `npm test` → exit 0 — **1082 tests / 166 suites, 1082 pass, 0 fail**, `run-user-scope-tests` 60/60, `test:skills` 628/628, `npx nx run angular-ai-devtools:test` success, `test:held-out` 22/22 suites and 85/85 tests. Run as four stages of the same `&&` chain rather than one grouped invocation, because a single grouped background invocation produced no output at all on this shell; each stage exited 0 in order.
- 2026-11-08 — the four working-tree edits that are not this task's (`AGENTS.md`, `.project/STATE.md`, `plans/angular-ai-devtools-program-backlog.md`, `.commandcode/taste/workflow/taste.md`) were parked byte-for-byte before Verify — they break `format:check` and are not this task's to land — and restored afterwards with their sha256 re-checked against the record (`86ac2e93…`, `844fc25d…`, `afed03d4…`, `efd8801c…`).
- 2026-11-08 — declared paths: `scripts/performance-capture.test.mjs` (new), `research/raw/m040-verdict-claims.json` (new) and `research/raw/m040-work-events.json` (extended with `witness.portalZonelessAttempt`, a carried block in canonical serialisation; `scripts/performance-measure.test.mjs` stays green at 25/25 and `scripts/performance-narrator.test.mjs` unchanged). `scripts/performance-measure.test.mjs`, `scripts/performance-narrator.test.mjs` and `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` are byte-identical, because the recording they read did not move a value they pin. Verify is green at this head — ready
