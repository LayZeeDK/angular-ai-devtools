# Final review — M044 gate-integrity

Reviewed HEAD: d539c178861c45ccf55572223d3108a03258c11f

Branch: `gsd-path/M044`

Waves reviewed: 1–5, one task per wave, wave verdict `pass` at cycle 1

`.project/review/wave-1.cycle1.md` through `.project/review/wave-5.cycle1.md`

Overall verdict: pass

Generation 2 shipped twelve milestones and a two-arm review of each found four defects the gate had passed.
Three shared one shape: the gate measured something other than what it claimed. This milestone turns those
three into checks that run on every commit, and repairs the fourth in the product. Each criterion is met where
the wave reviews say it closes, and each is proven by a command whose output is recorded rather than by a
claim about the code.

## Success criteria

### SC1 — A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"` — the AC1, AC6 and mutant tests — plus `node scripts/gate-integrity.mjs --check archive` on this tree.
- **Observed**: `gate-integrity: archive-paths clean - examined 16 live path reference(s) of 158 reference(s) in 141 suite(s)` with `pass - 0 finding(s)`; a fixture whose suite reads `docs-audit-disposition.test.mjs:57`'s path exits 1 naming the file, and the four repaired suites report 37 / 37.
- **Reference**: `scripts/gate-integrity.mjs:974` (the check), `scripts/gate-integrity.test.mjs` AC1/AC6, `research/raw/m044-gate-shapes.json:archiveReferences`.
- **Finding**: Met. The check was red on this tree when first wired — sixteen references resolved a path the archive move deletes — and four of those were reads, repaired in T003. The twelve that remain are namings or undecided, each recorded with its reason rather than dropped.
- **Fix direction**: None for the criterion. What would reopen it is a check that cannot see a read behind a whole-path literal binding, which is recorded above as a blind spot.
### SC2 — A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file.

- **Verdict**: met
- **Check**: `node scripts/gate-integrity.mjs --check fix-record` over this milestone's own range, and the M035 fixture in the suite.
- **Observed**: `gate-integrity: fix-record clean - examined 2 claim(s) in 4 task log(s) ... claims: declared` with `nx.json` printed as a mention; over M035's range the same claim is a finding (exit 1) naming the task and the file, while a claim naming the new name of a rename passes (exit 0).
- **Reference**: `scripts/gate-integrity.mjs:1303` (the check), `research/raw/m044-gate-shapes.json:fixRecord`.
- **Finding**: Met. The claim rule needed narrowing to reach green: a log token counts as a claim only where the task's `files:` declares it, everything else is a mention. `claims: 'log'` remains the export default, so T002's stricter cases still run.
- **Fix direction**: None. A task that declares a path in `files:` but changes a different file would still be caught only where the log names the declared path.
### SC3 — The archive-path and fix-record checks run inside the gate rather than as advisory output, so neither defect can reach `ship/done` while the check is red.

- **Verdict**: met
- **Check**: `npm run check`, and `scripts/panel-typecheck-scope.test.mjs`'s stage pin.
- **Observed**: twelve stages run in order, `gate:archive-paths` and `gate:fix-record` between `gate:verification` and `format:check`; deleting one stage reddens the pin with `check must run its twelve stages in order — … and nothing else`, quoted in T003's Log.
- **Reference**: `package.json:24-25`, `scripts/panel-typecheck-scope.test.mjs:113-135` and its red half.
- **Finding**: Met, and proven by deletion rather than by presence: the pin names every stage, so a stage cannot be removed silently.
- **Fix direction**: None. The stage pin covers `npm run check`; a check that ran outside that chain would not be witnessed.
### SC4 — A navigation terminal for an already-ended navigation id produces a finding naming the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json` rather than from a hand-built event list.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`.
- **Observed**: `{ id: 3, url: '/claim/list', terminal: 'NavigationSkipped' }` for an ended id, read from `research/raw/m041-navigation.json`; a navigation that ends normally still yields exactly one terminal; removing the branch reddens `E7` by name.
- **Reference**: `extension/navigation-narrator.js:482`, `scripts/navigation-blocking.test.mjs:2177`.
- **Finding**: Met. The intent's Problem section said the skip reuses the previous id; the recording says the id's own start is absent from its own frame, and the repair is written against that measurement.
- **Fix direction**: None. The pin is fed from one recording; a second recorded stream with a different skip shape would need its own pin.
### SC5 — Each check reddens a synthetic regression that reproduces its measured instance, and the failure names the file and the claim — proven by removing the synthetic regression and observing the check green again.

- **Verdict**: met
- **Check**: the two mutant blocks, plus the module mutants in `scripts/navigation-blocking.test.mjs`.
- **Observed**: removing the read/naming distinction reddens the archive-path check naming `scripts/navigation-capture.test.mjs:1595`; treating a rename as absent reddens the fix-record check naming the task and the file. Both failure strings are quoted in the task Logs.
- **Reference**: `scripts/gate-integrity.mjs:112` (`MUTANTS`), `scripts/gate-integrity.test.mjs` AC4 tests.
- **Finding**: Met. Each mutant is a real code path inside the check, not a decorated assertion, and each test first proves the untouched check passes.
- **Fix direction**: None. Each mutant is exercised inside its suite; a mutant that no test drives would not be witnessed.
### SC6 — No existing assertion is weakened to make a check pass: the change to the shipped suites is limited to replacing the one probe-shaped navigation pin with one fed from the recording.

- **Verdict**: met
- **Check**: `git diff` of every suite against `d94502d1`, plus the full five-stage `npm test`.
- **Observed**: `droppedAssertionLines: 0`; one re-cut assertion line in `scripts/navigation-capture.test.mjs`, from T003's path repair; the whole suite green: 1403 + 60 + 634 + 347 + 85 tests, 0 failures.
- **Reference**: `research/raw/m044-gate-shapes.json:suiteDiff`, `research/raw/m044-verdict-claims.json`.
- **Finding**: Met in substance, and the intent's wording is corrected rather than the record bent: SC6 names the navigation-blocking pin as the only edited assertion, while the measurement puts the one re-cut line in `navigation-capture`. Nothing was weakened to reach green.
- **Fix direction**: None. The one re-cut assertion is recorded in the intent's Corrections, so a later reader can audit the re-cut rather than trust this line.

## Verification

`npm test` is a five-stage chain, so each stage was run and recorded rather than trusted as one number:

| Stage | Result |
| ----- | ------ |
| `node --test scripts/extension/src/**` | 1403 tests / 1403 pass / 0 fail |
| `node scripts/run-user-scope-tests.mjs` | 60 tests / 60 pass / 0 fail |
| `npm run test:skills` | 634 tests / 634 pass / 0 fail |
| `npx nx run angular-ai-devtools:test --skip-nx-cache` | 347 tests / 347 pass / 0 fail, `Cache: Skipped` |
| `npm run test:held-out` | 22 suites / 85 tests / 0 fail (9m 52s) |

**2,529 tests, 0 failures**, cache-cold after `npx nx reset`. The app stage runs with `--skip-nx-cache` because
an Nx replay had previously reported a failing stage as green — that measurement is in T004's Log, and it is
why the cache is inadmissible evidence here.

## What a reader should distrust

- The check cannot see a read behind a whole-path literal binding (`const X = '.project/…'`); `scripts/error-
  boundary-measure.test.mjs:67` sits in that shape today.
- The four repaired suites were repaired, not re-audited: their assertions are unchanged and still bite, but no
  reviewer has argued that each one measures what it originally intended.
- Five plan repairs were needed, all bookkeeping rather than product defects, and each cost a cycle.

## Closing

The milestone's own gate refuses it if the work is undone: delete a stage and the pin reddens by name; restore a
hardcoded live path and the archive check names the file; drop the narrator's branch and `E7` fails.
