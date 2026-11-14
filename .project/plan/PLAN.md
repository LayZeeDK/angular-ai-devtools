# Plan — M044 gate-integrity

Milestone: gate-integrity
Branch: gsd-path/M044
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

The six criteria this plan answers, quoted from `.project/intent/INTENT.md` character for character — the same text the wave-four verdict claims rule, parsed from the intent rather than retyped.

### SC1 — A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check.

### SC2 — A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file.

### SC3 — The archive-path and fix-record checks run inside the gate rather than as advisory output, so neither defect can reach `ship/done` while the check is red.

### SC4 — A navigation terminal for an already-ended navigation id produces a finding naming the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json` rather than from a hand-built event list.

### SC5 — Each check reddens a synthetic regression that reproduces its measured instance, and the failure names the file and the claim — proven by removing the synthetic regression and observing the check green again.

### SC6 — No existing assertion is weakened to make a check pass: the change to the shipped suites is limited to replacing the one probe-shaped navigation pin with one fed from the recording.

## Intent coverage

| Criterion | Task | Acceptance |
| --------- | ---- | ---------- |
| SC1       | T001 | AC1        |
| SC1       | T001 | AC3        |
| SC2       | T001 | AC2        |
| SC2       | T001 | AC4        |
| SC4       | T001 | AC3        |
| SC1       | T002 | AC1        |
| SC1       | T002 | AC3        |
| SC2       | T002 | AC2        |
| SC5       | T002 | AC4        |
| SC3       | T003 | AC1        |
| SC3       | T003 | AC2        |
| SC3       | T003 | AC5        |
| SC4       | T003 | AC3        |
| SC4       | T003 | AC4        |
| SC5       | T004 | AC1        |
| SC1       | T004 | AC2        |
| SC2       | T004 | AC2        |
| SC3       | T004 | AC2        |
| SC4       | T004 | AC2        |
| SC6       | T004 | AC3        |
| SC6       | T004 | AC4        |

## Prohibitions

| Prohibition | Criterion | Task |
| ----------- | --------- | ---- |
| N1          | SC1       | T002 |
| N2          | SC1       | T002 |
| N3          | SC2       | T002 |
| N4          | SC4       | T003 |
| N5          | SC3       | T003 |
| N6          | SC5       | T002 |
| N7          | SC6       | T004 |
| N8          | SC1       | T004 |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E1 | T002 | scripts/gate-integrity.test.mjs |
| E2 | T002 | scripts/gate-integrity.test.mjs |
| E3 | T002 | scripts/gate-integrity.test.mjs |
| E4 | T002 | scripts/gate-integrity.test.mjs |
| E5 | T002 | scripts/gate-integrity.test.mjs |
| E6 | T003 | scripts/panel-typecheck-scope.test.mjs |
| E7 | T003 | scripts/navigation-blocking.test.mjs |
| E8 | T003 | scripts/navigation-blocking.test.mjs |
| E9 | T002 | scripts/gate-integrity.test.mjs |
| E10 | T004 | scripts/navigation-blocking.test.mjs |

E10's whole-tree half runs as the project verify (`npm run check && npm test`) inside T004; the row names the suite that proves the edited assertion.

## Surface contract

The command-line gate is the only surface; this milestone adds no panel surface and no page-side
observable.

### command-line gate — T003

Criteria: SC3, SC4

Entry: the two checks built in T002 receive the working tree and, for the fix-record check, the
milestone's range and its task files; from this task they are invoked by the ship gate as stages of
the project's verify chain, and the navigation narrator reads its event stream from the recording
rather than from a list built in a test. Neither check spawns a browser and neither reads
`.project/` state it did not name.

States: `clean` carrying `examined: n`, where `n` is the number of references or claims examined;
`refused` carrying one finding per defect, each naming the file, the line where known, the claim and
the class, with a non-zero exit at the gate; `nothing-examined` carrying `examined: 0` as a refusal
rather than a pass; and, for the narrator, `recorded` for a terminal the stream supports against
`skipped-named` for a terminal arriving after its navigation ended.

Walkthrough:

1. `checkArchivePaths({ root, milestone })` reads `.project/STATE.md` and the milestone's archive directory, derives the live paths the archive move deletes, and scans every authored suite for a reference to one of them, returning `{ examined, findings }`.
2. A suite resolving a live and deleted path yields a finding carrying its file, its line, the resolved path and the class; a suite reading an archived path yields none, and the examined count says how many suites were read.
3. `checkFixRecord({ root, range, tasks })` reads each task's `## Log` for claimed paths and the range's own `--name-status`, treating a rename as both of its names, so a claim naming the new name is not reported absent.
4. The gate runs both checks as stages; a finding exits non-zero naming the file or the task and the claim, and `examined: 0` exits non-zero naming itself as the reason.

### research notes — T004

Criteria: SC6

Entry: the recordings and the verdict claims, written from what the checks printed rather than from
what the plan expected them to print.

States: `cited` for a criterion whose artefact exists and carries its reading; `uncited` for a
criterion without one, which fails the task rather than being claimed.

Walkthrough:

1. Each check is driven against the instance that exposed it — the archived-path reference, the `nx.json` claim — and against a clean control, and the recording keeps what each printed and its exit status.
2. `research/raw/m044-verdict-claims.json` cites one artefact per criterion, and a criterion with no artefact fails the task instead of being claimed.
3. The project verify runs on the milestone's own tree and the suite count is recorded, then every suite is diffed against `d94502d1` so the one edited assertion is named.

## Wave 1 — measure the three gate shapes against the repository's own history, and publish the record the later waves read

Goal: replace this plan's inherited premises — that an archived path can be resolved from a committed test without the check firing on a deliberate archive reference, that a task log's claim can be compared to a range's diff without a rename reading as an absence, and that the M041 recording carries the skipped navigation the narrator drops — with measurements taken at this head, and publish them as one record so every later task quotes a reading rather than the intent's sentence.

Review depth: full

Three things the later waves depend on are unmeasured. The first is the shape of the reference: M040's and M042's defects were both a literal `.project/` path, but the repair must distinguish a test that resolves the *live* intent — which the archive move deletes — from a test that deliberately reads an *archived* path, which M043's resolver does on purpose in `scripts/error-boundary-capture.test.mjs:46` and `scripts/error-boundary-measure.test.mjs:53`. A check that flagged both would fail every milestone after its own archive, and a check that matched only a literal string would miss the `join(ROOT, '.project', …)` construction that caught M042. What the tree actually contains is a measurement: every authored suite under `scripts/`, `extension/` and `apps/` is scanned and each `.project/` reference is classified by whether the archive move removes it.

The second is the comparison the fix-record check makes. A range's diff names paths, and a rename appears as a deletion and an addition, so a log claim that names the new path after a rename is real while a naive set-membership test reports it absent. `M035`'s own instance is the one that must be reproduced: `nx.json` still carries `"cache": true` for `@angular/build:unit-test` at this head, so the claim is false in the tree as well as absent from the range, and the check must report the range fact without asserting the tree fact.

The third is the skipped navigation. `extension/navigation-narrator.js:459` records a terminal only when `navigation.state === OPEN`; a same-URL `NavigationSkipped` reuses the previous id, so the entry arrives for a navigation that has already ended and is discarded. The recording `research/raw/m041-navigation.json` is the only evidence that the shape occurs live, and this wave records which entries it carries, which id each addresses, and whether that id has a start — so wave three's repair and its pin rest on the stream rather than on a hand-built list.

### T001 — Measure the three gate shapes and publish one record

- Deps: none
- Files: `research/raw/m044-gate-shapes.json`, `scripts/gate-integrity.test.mjs`
- Intent coverage: SC1, SC2, SC4
- Edges: E1, E2, E3, E4, E5
- Acceptance: AC1 every `.project/` reference in every authored suite under `scripts/`, `extension/` and `apps/` is enumerated with its file, its line and the path it resolves, and each is classified as `archived-by-the-move` or `deliberate-archive-read` with the reason stated — the classification is the check's rule, so a reference whose class the measurement cannot decide is recorded as `undecided` and named rather than guessed; AC2 the fix-record comparison is measured against a real range: the M035 claim about `nx.json` is reproduced against `d94502d1` and the recording states what the range's diff carries for that path, and a rename in the same range is recorded as the pair it produces so the check's rule is written against evidence; AC3 `research/raw/m041-navigation.json` is read and every `NavigationSkipped` entry is recorded with its id, its url and whether that id has a start entry, so the shape wave three repairs is the shape the stream carries and not one the plan assumed; AC4 the record states, per measurement, the command that produced it and what it examined — a measurement that examined zero inputs is recorded as `examined: 0` and is a failure of the measurement, never a clean result
- Verify: `node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs research/raw/m044-gate-shapes.json && npm run check`
- Held-out: none; E1 to E11 are T002's, T003's and T004's and this task must not redden them

## Wave 2 — build the two deterministic checks, each with a mutant that reddens it

Goal: turn the wave-one record into two checks that decide from the tree and the range — the archive-path check and the fix-record check — each proven by a synthetic regression that reproduces its measured instance and by the same regression's removal leaving the check green.

Review depth: full

The check must decide two facts it cannot see directly: which paths a milestone's own archive move deletes, and which file changes a task log claims. Both are read from `.project/` state rather than from the check's own assumptions, which is what makes the check usable at ship time rather than only in a test. The archive-path check reads the milestone's archive directory and derives the live paths it replaces; the fix-record check reads each task's `## Log` for claimed paths and the range's `--name-status` for what changed, treating a rename as both names.

A reference that **names** a live path is not a reference that **reads** it, and T001 measured both in the shipped suites: `scripts/performance-capture.test.mjs:1978` computes `join(ROOT, '.project', 'intent', 'INTENT.md')` only to assert `intentPathForMilestone(ROOT, 'M040') !== live`, while `scripts/navigation-capture.test.mjs:1763` calls `copyFileSync(LIVE_INTENT, live)`. The first survives the archive move; the second throws the moment the path is gone. A check that flagged both would redden every milestone after its own archive and be switched off, so the rule decides on the *use* of the path, not on its presence in the file.

Both checks report through the same seam so a caller cannot pass one and ignore the other: one function returns findings carrying the file, the line where known, the claim and the class, and the gate renders them as refusals. An empty scan is a finding with `examined: 0`, because the failure mode this milestone exists to remove is precisely a check that passed over nothing.

### T002 — Build the archive-path and fix-record checks

- Deps: T001
- Files: `scripts/gate-integrity.mjs`, `scripts/gate-integrity.test.mjs`, `research/raw/m044-gate-shapes.json`
- Intent coverage: SC1, SC2, SC5
- Edges: E1, E2, E3, E4, E5, E9, E11
- Acceptance: AC1 the archive-path check reports a suite that *reads* a live `.project/` path the milestone's archive move deletes, naming the file, the line, the path and the use it saw; reports a suite that only *names* that path as clean; and reports a suite reading an archived path as clean — driven by the wave-one record's own rows; AC2 the fix-record check reports a task log claiming a path absent from the range, naming the task id and the file, and does not report a claim that matches the new name of a rename — the M035 `nx.json` instance is the fixture and it reddens the check when the claim is injected; AC3 both checks return findings through one seam and report `examined: 0` as a finding rather than as a pass, proven by pointing each at an empty input and observing the refusal; AC4 each check carries a mutant block: the archive-path mutant drops the archive classification so a live reference reads clean and the suite fails naming the file, and the fix-record mutant treats a rename as absent so the rename case fails naming the task — each mutant is run and its failure string quoted in the task Log
- Verify: `node --check scripts/gate-integrity.mjs && node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.mjs scripts/gate-integrity.test.mjs && npm run check`
- Held-out: E1, E2, E3, E4, E5, E9, E11

## Wave 3 — put both checks inside the ship gate, and repair the navigation terminal with a pin fed from the recording

Goal: make a red check reach `ship/done` as a refusal rather than as output beside a passing gate, and answer M041's defect by recording a terminal for an already-ended navigation id, with the pin that proves it read from `research/raw/m041-navigation.json`.

Review depth: full

The wiring decides SC3: the gate's own command list must invoke both checks, and the pin that proves the list contains them must fail when one is dropped. The repository already pins its check chain in `scripts/panel-typecheck-scope.test.mjs`, which asserts every stage of `npm run check`; that pin is the natural place to prove the two checks are stages, and editing it deliberately means re-cutting the pin in the same task that adds the stage.

The repair is narrow: a terminal for a navigation whose entry arrives after it ended, recorded once. The risk is double-reporting, so the pin carries both shapes — a skip for an ended id and a skip for an unknown id — and the narrator's existing terminal for a live navigation is asserted unchanged.

### T003 — Wire the checks into the gate and repair the ended-navigation terminal

- Deps: T002
- Files: `package.json`, `scripts/panel-typecheck-scope.test.mjs`, `scripts/gate-integrity.mjs`, `extension/navigation-narrator.js`, `scripts/navigation-blocking.test.mjs`, `research/raw/m041-navigation.json`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `extension/agent-main.test.mjs`, `packages/ai-devtools-companion/test/facade.test.mjs`, `scripts/error-boundary-measure.test.mjs`, `scripts/facade-dev-build.test.mjs`, `scripts/error-boundary-capture.test.mjs`, `scripts/field-state-capture.test.mjs`, `scripts/held-out-nested-run.test.mjs`, `scripts/legacy-diagnostic-capture.test.mjs`, `scripts/linked-state-capture.test.mjs`
- Intent coverage: SC3, SC4
- Edges: E6, E7, E8, E10
- Acceptance: AC1 both checks run as stages of the project's own verify chain, and `scripts/panel-typecheck-scope.test.mjs` is re-cut in the same change so the stage count and the stage names both carry them — the pin is proven by deleting one stage from `package.json` and observing the pin redden naming that stage; AC2 a red check reaches the gate as a refusal: the ship gate is run with a fixture that resolves an archived-then-deleted path and exits non-zero naming the file, and the same gate on this milestone's own tree exits zero; AC3 `extension/navigation-narrator.js` records a terminal for an entry addressing an id whose navigation has already ended, producing a finding naming the skipped navigation, while a navigation that ends normally still produces exactly one terminal — both asserted in one suite; AC4 the pin is fed the event list read from `research/raw/m041-navigation.json`, so a mutant that rebuilds the list in the test cannot satisfy it and a mutation reordering the recording reddens it, with both failure strings quoted in the task Log
- Verify: `node --check scripts/gate-integrity.mjs && node --check extension/navigation-narrator.js && node --check scripts/navigation-blocking.test.mjs && node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs" "scripts/gate-integrity.test.mjs" "scripts/panel-typecheck-scope.test.mjs" && npx prettier --check scripts/gate-integrity.mjs extension/navigation-narrator.js scripts/navigation-blocking.test.mjs scripts/panel-typecheck-scope.test.mjs package.json research/raw/m041-navigation.json && npm run check && npm test`
- Held-out: E6, E7, E8, E10

## Wave 4 — record the gate's own behaviour, rule the claims, and prove the whole tree

Goal: capture the four checks' outputs as recordings, rule every success criterion against the artefacts that prove it, and run the project's full verify so that a milestone about gate integrity cannot itself ship on an unproven gate.

Review depth: full

The recordings are the milestone's evidence rather than its output: each check is driven against the instance that exposed it, and the recording carries what the check printed, so the verdict claims can cite a reading instead of a test name. The ruling pass then compares the claims to the criteria parsed from the intent, and the task fails if a criterion has no artefact.

The whole-tree proof is the last step and also SC6's evidence: the shipped suites still pass with only the navigation pin replaced, so nothing was weakened to reach a green gate.

### T004 — Record the checks' behaviour, rule the claims, and run the project verify

- Deps: T003
- Files: `research/raw/m044-gate-shapes.json`, `research/raw/m044-verdict-claims.json`, `scripts/gate-integrity.test.mjs`, `scripts/navigation-blocking.test.mjs`
- Intent coverage: SC1, SC2, SC3, SC4, SC5, SC6
- Edges: E10
- Acceptance: AC1 each of the two checks is driven against the instance that exposed it and against a clean control, and the recording carries what each printed and the exit status each produced; AC2 `research/raw/m044-verdict-claims.json` cites, per criterion, the artefact that proves it — a criterion without an artefact fails the task rather than being claimed; AC3 the project verify `npm run check && npm test` runs green on the milestone's own tree, and the suite count is recorded so a removed test would show as a count drop rather than as a green run; AC4 the only assertion edited in a shipped suite is the navigation pin named in SC6, proven by diffing every suite against `d94502d1` and recording the one file that differs
- Verify: `node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" "scripts/navigation-blocking.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs research/raw/m044-gate-shapes.json research/raw/m044-verdict-claims.json && npm run check && npm test`
- Held-out: E10
