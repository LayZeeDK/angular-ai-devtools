# Intent — M044 gate-integrity

Lane: standard
Milestone: gate-integrity
Branch: gsd-path/M044
Review panel: full
Finding skeptics: 2
Surfaces: command-line gate, research notes

## Problem

Generation 2 shipped twelve milestones, and a two-arm review of each one found four
defects that the project's own gate had passed. Three of the four share a shape: the
gate measured something other than what it claimed to measure.

- **A test resolved a `.project/` path the same commit archived away.** M040's
  `scripts/performance-capture.test.mjs:56` held M040's claims against the live
  `.project/intent/INTENT.md`, which its own milestone archived; the shipped head
  `c03ed6fa` ran 38 pass / 1 fail. M042 repeated it twice —
  `scripts/error-boundary-capture.test.mjs:46` and
  `scripts/error-boundary-measure.test.mjs:53` read `.project/intent/INTENT.md` and
  `.project/research/s10-answer.md`, both absent at `fb84ff3b`, 31 failing tests. In
  both cases the ledger's last green row was recorded one commit *before* the archive
  move, so no gate ever ran on the tree that shipped.
- **A task log claimed a file change the range never made.** M035's T006 records an
  `nx.json` cache fix. The range contains no `nx.json` diff, and `nx.json` still
  carries `"cache": true` for `@angular/build:unit-test` at `d94502d1` — measured at
  this head while writing this intent. The claim was accepted because nothing compares
  a log to a diff.
- **A pin was fed an event composition the live app never produces.** M041's
  `extension/navigation-narrator.js:459` records a navigation terminal only when
  `navigation.state === OPEN`, so an ended navigation that Angular reports again — a
  same-URL `NavigationSkipped`, which reuses the previous id — is discarded and no
  finding is produced. The suite that should have caught it built its own event list
  instead of reading the recorded stream, so the composition it proved cannot occur.

The gate's job is to be hard to fool. These four are evidence it was not, and each is
reproducible from the repository's own history rather than from a hypothetical.

## Users

The owner and every later milestone: a gate that passes a broken tree costs a repair
milestone later and, in M042's case, left `main` unable to run its own suite until M043
repaired the paths by hand.

## Success criteria

1. A committed test that resolves a `.project/` path the milestone's own archive move
   deletes fails the ship gate, naming the file and the path; a milestone whose tests
   reference no such path passes the same check.
2. A task log claiming a file change absent from the milestone's range fails the ship
   gate, naming the task and the file.
3. The archive-path and fix-record checks run inside the gate rather than as advisory
   output, so neither defect can reach `ship/done` while the check is red.
4. A navigation terminal for an already-ended navigation id produces a finding naming
   the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json`
   rather than from a hand-built event list.
5. Each check reddens a synthetic regression that reproduces its measured instance, and
   the failure names the file and the claim — proven by removing the synthetic
   regression and observing the check green again.
6. No existing assertion is weakened to make a check pass: the change to the shipped
   suites is limited to replacing the one probe-shaped navigation pin with one fed from
   the recording.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test | Detail |
|------|-----------|----------|-------------|------|--------|
| E1 | SC1 | precision | held-out | scripts/gate-integrity.test.mjs | a suite that hardcodes `.project/intent/INTENT.md` while the milestone archives that path is reported with the file and the path named, and a suite referencing no archived path is reported clean with its examined file count |
| E2 | SC1 | boundary | held-out | scripts/gate-integrity.test.mjs | a path built through `join(ROOT, '.project', 'research', 'x.md')` is caught, while a suite that deliberately reads `.project/archive/<NNN>-<slug>/research/x.md` is not |
| E3 | SC1 | empty | held-out | scripts/gate-integrity.test.mjs | a milestone whose archive move deletes nothing reports that it examined zero archived paths and fails rather than passing silently |
| E4 | SC2 | precision | held-out | scripts/gate-integrity.test.mjs | a task log claiming `nx.json` while the range has no `nx.json` diff is reported with the task id and the file, and a claim matching a rename is not reported as absent |
| E5 | SC2 | empty | held-out | scripts/gate-integrity.test.mjs | a task log with no claimed file changes passes, and a range with no diff is reported as examined-zero rather than clean |
| E6 | SC3 | boundary | held-out | scripts/gate-integrity.test.mjs | both checks are invoked by the ship gate's own command list, so a red check reaches `ship/done` as a refusal rather than as output beside a passing gate |
| E7 | SC4 | precision | held-out | scripts/navigation-blocking.test.mjs | a `NavigationSkipped` whose id has no start produces a finding naming the skip, and a navigation that ends normally produces exactly one terminal |
| E8 | SC4 | ordering | held-out | scripts/navigation-blocking.test.mjs | the pin is fed the event list read from `research/raw/m041-navigation.json`, so a mutation reordering the recording reddens it and a hand-built list cannot satisfy it |
| E9 | SC5 | precision | held-out | scripts/gate-integrity.test.mjs | each check carries a mutant block whose synthetic regression reddens it and whose removal makes it green, and the failure message names the file and the claim |
| E10 | SC6 | idempotency | held-out | scripts/gate-integrity.test.mjs | the whole suite still passes with only the navigation pin replaced, so no assertion was weakened and no test removed |
| E11 | SC1 | concurrency | dismissed | scripts/gate-integrity.test.mjs | the two checks read the working tree and the range at one head; neither runs concurrently with a milestone's own build, so no interleaving can produce a partial reading |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|-------------|-----------|----------|-------------|-----|
| N1 | SC1 | widen, skip or re-scope an existing test to make a check pass | judgment | the reviewer diffs every shipped suite and expects the navigation pin to be the only edited assertion |
| N2 | SC1 | report a check as passing when it examined nothing | judgment | the reviewer looks for an examined-count in the output and for the empty-input self-failure |
| N3 | SC2 | accept a task log's claimed file change without diffing the milestone's range | judgment | the reviewer reads the check's input as the range's own changed paths, never the log |
| N4 | SC4 | name a cause, an owner or an intent the recorded events do not carry | judgment | the reviewer reads the finding's fields against the recording it was derived from |
| N5 | SC3 | let a red check be downgraded to advisory output during this milestone | judgment | the reviewer runs the ship gate with a red check and requires a refusal |
| N6 | SC5 | accept a check whose mutant is decorative, naming a defect it does not actually redden | judgment | the reviewer runs each mutant and requires the named failure string |
| N7 | SC6 | delete a shipped test, or replace an assertion with a weaker one, to reach a green tree | judgment | the reviewer diffs the suite count and each edited assertion against `d94502d1` |
| N8 | SC1 | add a page-side control, input or widget, generate application code, add `@angular/animations`, SSR or `angular/components`, or add DOM to an inspected page | judgment | the reviewer reads the diff for AR-1, AR-3, AR-6 and A5 |

## Scope

In: the two deterministic gate checks, their mutants and controls; the recorded-stream
re-pin; the navigation terminal repair for an ended id.

Out: re-auditing Generation 2's review documents; any new explainer surface; changing
what a shipped test asserts beyond the one navigation pin named in SC6.

## Corrections

The roadmap's premise is that the gate can be fooled in these shapes. Measured at
`d94502d1` before writing this intent, so the premise was not assumed:

- `nx.json` still sets `"cache": true` for `@angular/build:unit-test` — M035's recorded
  fix is absent from the tree, confirming the second defect is still live.
- `extension/navigation-narrator.js:459` still reads
  `if (navigation.state === OPEN)`, confirming the fourth defect is still live.
- The archive-path defect is not live in the shipped suites — M043 replaced M042's two
  hardcoded paths with the archive-aware resolver — but no check exists that would stop
  a third instance, which is why SC1 asks for the check and not the repair.

The premise held. Unlike M031-M033, no criterion is rewritten on measurement; the four
defects were already measured at their own heads by the review campaign, and these two
re-measurements confirm two of them survived.

## Risks

- A check that scans the wrong tree passes vacuously; SC5's mutant is the mitigation,
  and the check must name the number of files it examined.
- Detecting a `.project/` path inside a test requires resolving the archive move, not
  pattern-matching a string; a naive grep would miss `join(ROOT, '.project', ...)` and
  would also flag a test that deliberately reads an archived path.
- The navigation repair touches a shipped narrator and can double-report; SC4's
  recording pin and the edge list cover it.

## Open questions

None. Each defect is measured and each check has a concrete instance to reproduce.
