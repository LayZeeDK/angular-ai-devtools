# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: blocked
Tasks reviewed: 1
Reviewed HEAD: fce943d564ece989d4801c8fcddbc430f25f33a7

## T001 — Measure what the console record and the digest state: fail

- ✅ The landing is the measurement the task declares and nothing else: `git show --stat 99afb9ea` reads
  `.project/tasks/T001-measure-what-the-console-record-and-the-digest-state.md | 12 +-`,
  `research/raw/m059-record-shapes.json | 946 +++`, `scripts/teardown-leak-shapes.test.mjs | 2680 +++`,
  `3 files changed, 3635 insertions(+), 3 deletions(-)` — the task Log, the record and the suite that
  holds it to the tree (`scripts/teardown-leak-shapes.test.mjs:8`: "M059 T001 measured four things, and
  `research/raw/m059-record-shapes.json` is the measurement").
- ✅ The digest entry measures what it claims, and re-measures identically at this head. I re-ran the
  record's own command (`research/raw/m059-record-shapes.json:72-73`) and got its output byte for byte:
  `NG0205 Injector has already been destroyed` and
  `64 426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35 61577`. The entry sits at
  `extension/error-digest.json:60-61` (`"code": "NG0205",` / `"title": "Injector has already been
  destroyed",`), its body ends in the ellipsis the record states (`extension/error-digest.json:62`),
  and the printed string is derived from the installed build's own throw site
  (`research/raw/m059-record-shapes.json:638-640`: "throw new RuntimeError(-205, ngDevMode && 'Injector
  has already been destroyed.');") — `NG0205: Injector has already been destroyed.`, with the digest's
  full-stop-less title stated beside it (`research/raw/m059-record-shapes.json:108-120`). All 40
  citations re-resolved in the run (per-file `… citation(s) re-resolved` lines, and the
  `assert.ok(resolved >= 25, …)` floor at `scripts/teardown-leak-shapes.test.mjs:2470-2473` green).
- ✅ The absence counts are real counts of the tree, and the own-artefact exclusion is doing visible
  work. My own PowerShell scan over the same three globs at this head printed: `extension raw:
  matches=0 files=39` / `extension excl-own: matches=0 files=38`; `scripts raw: matches=8 files=138` /
  `scripts excl-own: matches=0 files=136`; `research raw: matches=17 files=149` / `research excl-own:
  matches=0 files=148`. The raw `scripts` 8 are the shape suite's own needle and comment lines
  (`scripts/teardown-leak-shapes.test.mjs:28`, `:55`, `:127`, `:666`, `:850`, `:1569`), so excluding the
  milestone's own four files (`:138-143`) is what makes `0` the true count of the measured tree, as the
  record states (`research/raw/m059-record-shapes.json:540` filesSearched 38, `:553-556` the two
  excluded suites, `:581-582` occurrences 0). The three `.unsubscribe(` sites are exactly the record's
  — `extension/agent-main.js:1858`, `extension/agent-main.js:2435`,
  `scripts/stability-measure.test.mjs:315`, owned `uninstallRouterEvents` / `uninstallStability` /
  `CURRENCY` (`research/raw/m059-record-shapes.json:588-614`) — and the record states the
  brief-expects-two discrepancy itself rather than hiding it (`:614`: "The brief this task was handed
  expects two `.unsubscribe(` sites; this head carries three.").
- ✅ `not-produced` was honestly measured at the head the record names (`54398884…`,
  `research/raw/m059-record-shapes.json:8`): the only two `NG0205` occurrences under `research/raw/`
  there are the digest enumeration — `research/raw/m045-console-shapes.json:190-192` is a generator
  command (`"command": "node -e \"const d=require('./extension/error-digest.json');…\""`) and its
  output line, and `:561` is the digest section's own code list (`"NG0205",`) — not console captures.
  Both drives recorded driver-side listeners only (`:312`, `:427`: "no listener, no hook, no patch and
  no global was installed in the page (D7)"), no probe was run to manufacture the code (`:511`), and
  E9's read-only half held in my run: the record's sha256 is `bfe1af00…004f97` at load and after the
  run, unchanged (`ℹ E9 idempotence: sha256 … unchanged after the run`).
- ❌ The record exists and states, with a command and its output, each of: the digest entry, the message shape, producibility, and the absence counts. — the producibility half no longer holds at the reviewed head. At
  `fce943d5`, `node --test scripts/teardown-leak-shapes.test.mjs` prints `ℹ tests 13 / ℹ pass 9 / ℹ fail
  4`. The producible pin fails on the research/raw scan
  (`scripts/teardown-leak-shapes.test.mjs:2238-2242`, "the occurrences under research/raw/ are the
  occurrences this head counts"): derived `recordsSearched: 148, occurrences: 17, onAPage: 15` against
  recorded `146 / 2 / 0` (`research/raw/m059-record-shapes.json:486`, `:507`), and the field-by-field
  check reports `producible.verdict: "not-produced" -> "produced"`, `… produced 15 NG0205 …` and
  `absences.handle-record-not-held.scan.researchRaw.filesSearched: 146 -> 148` — held by
  `scripts/teardown-leak-shapes.test.mjs:2504-2511` and red in the run. The record's own hold is "a
  section holds where this head re-derives the same value on every run"
  (`research/raw/m059-record-shapes.json:26`); at this head its central section does not hold.
- ❌ The record exists and states, with a command and its output, each of: the digest entry, the message shape, producibility, and the absence counts. — root cause: the T006 repair is narrower than the drift T006 itself
  named. The exclusion list is four files (`scripts/teardown-leak-shapes.test.mjs:138-143`) and
  `excludedIn('researchRaw')` (`:159-161`) selects only `research/raw/m059-record-shapes.json`. T006's
  Context predicted exactly this failure for the surface record
  (`.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md:29-33`: "the
  record for the surface names the code, so the shapes suite's `research/raw` scan would read 147
  records … flipping its derived `producible` verdict from `not-produced` to `produced` with 18 page
  hits … so the repair is to exclude the milestone's own artefacts from the scan"), but the landed list
  adds no surface record. `research/raw/m059-surface.json` then landed in T004's `4f67e837` (first
  commit touching it, per `git log --oneline -- research/raw/m059-surface.json`) carrying 14 NG0205
  lines — quotations, not captures: `"lineText": "code: 'NG0205',"` (`:168`), `"value": "NG0205:
  Injector has already been destroyed.",` (`:207`), `"code": "NG0205",` (`:216`) — and T005's
  re-derivation added one more to `research/raw/m044-gate-shapes.json:2714` (a `"reason"` string
  describing this very repair). Fifteen quoted occurrences, counted as page hits by the suite's own
  enumeration rule (`scripts/teardown-leak-shapes.test.mjs:478-481`).
- ❌ The record states the reading is the agent's existing console subscription, with no new page-side instrumentation and no second tap, and satisfies held-out E9: a second default run writes no byte. — held-out E9 reddens at this head: the read-only half held in this review's run (the record's sha256
  `bfe1af00…004f97` unchanged at load and after the run), but the test's absences re-derivation
  (`scripts/teardown-leak-shapes.test.mjs:2669-2672`) fails on `filesSearched: 146 -> 148`, so the E9
  test AC3 names is one of the four failing at `fce943d5`.
- ⚠ No ledger noticed the red: the last green shapes run is T006's own verify
  (`.project/build/verify-T006.log:49-50`, `ℹ pass 13 / ℹ fail 0`). T004's verify ran at `03e86d55`
  (`.project/build/verify-T004.log:1`) — before T004's landing — and T005's verify ran at `4f67e837`
  with the m056 gate-stability suite as its test leg (`.project/build/verify-T005.log:1`, `:21-24`,
  `ℹ tests 8 / ℹ pass 8 / ℹ fail 0`), so no verify executed the M059 shapes suite after the records
  that break it landed. Process context for GAP 1, not a deliverable defect of its own.
- ⚠ Fact versus holding, kept apart: what `not-produced` claims — no page ever produced NG0205 — is
  still true at this head. Every one of the 15 derived "page hits" is a quotation inside a research
  record, checked occurrence by occurrence: my scan printed `m044-gate-shapes.json: 1 line(s) /
  m045-console-shapes.json: 2 line(s) / m059-record-shapes.json: 26 line(s) / m059-surface.json: 14
  line(s)`, the m045 pair is the digest enumeration (`research/raw/m045-console-shapes.json:192`,
  `:561`), and the rest are quoted source lines and sample answers. The defect is that the record and
  its gate can no longer demonstrate that at HEAD — the task that owns both files must extend
  `OWN_ARTEFACTS` and re-arm (GAP 1 below).
- ⚠ Low, non-blocking: the suite's `COMMANDS` constant still carries a typed `git rev-parse HEAD`
  output from an earlier capture — `scripts/teardown-leak-shapes.test.mjs:831`:
  `output: '5c83c82b2e85a047f6f8114685b5f7e58d30e3e6'` — a commit the record never measured. The
  derivation substitutes the capture's own head (`:1673-1675`) and T006's Log records exactly that
  (`.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md:76-78`), so no
  check is wrong; the literal is dead text disagreeing with the record's head `54398884…`
  (`research/raw/m059-record-shapes.json:8`).
- Files the wave touched, read or not read: `research/raw/m059-record-shapes.json` — read (whole file,
  949 lines), 100%; `scripts/teardown-leak-shapes.test.mjs` — read (whole file, 2689 lines), 100%;
  `.project/tasks/T001-measure-what-the-console-record-and-the-digest-state.md` — read (82 lines),
  100%; `.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md` — read
  (80 lines), 100%; `.project/review/wave-1.cycle1.md` (the skeleton this review replaces) and
  `.project/archive/058-tutor-routing/review/wave-1.cycle1.md` (the grammar template) — read, 100%;
  `research/raw/m045-console-shapes.json` — read in slices (`:190-193`, `:558-563`), <1% line-by-line,
  both cited lines covered; `extension/error-digest.json` — read (`:59-62`), the NG0205 entry covered;
  `.project/build/verify-T005.log` — read (`:1-60` of 111, ≈54%) plus grep at `:82`, `:92`;
  `.project/build/verify-T004.log` and `.project/build/verify-T006.log` — not read whole, targeted
  grep only (`:1`, `:40-43`; `:34-50`); `research/raw/m059-surface.json` — not read whole, its 14
  NG0205 lines seen via grep (`:14`, `:168-175`, `:202-222`, `:624`); `research/raw/m044-gate-shapes.json`
  — not read; its NG0205 line seen only in the suite's failure diff; `package.json` — not read as a
  file, its `scripts` block read via `node -e`.

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ Covered by T001's measurement: the digest half is the entry verbatim with the file's own hash,
  re-verified by re-running the record's command (output identical, above), and the message half is
  derived from the shipped joins' own declarations rather than read back — the console join reads
  `code` and `message` of a payload that also carries `component` and `timestamp`
  (`research/raw/m059-record-shapes.json:198-201`, derived from `extension/console-join.js:11` and
  `extension/lint-core.js:42`, held green by `scripts/teardown-leak-shapes.test.mjs:2180-2214` in the
  passing run).
- ✅ The owner absence rests on measured field lists, not prose: `ownerFieldsInTheCapture:
  ['component']` and `ownerFieldsTheJoinsRead: []` (`research/raw/m059-record-shapes.json:523-526`),
  held by the suite (`scripts/teardown-leak-shapes.test.mjs:2323-2332`, green), so the answer's
  `owner-not-in-the-message` is forced by "the one field that could name an owner … neither join reads
  it" (`research/raw/m059-record-shapes.json:528`).
- ⚠ The premise the eventual finding rests on — no capture in `research/raw/` has ever produced the
  code — is still true at this head but is no longer demonstrable by the record's own scan (the
  blocking ❌ bullet above). The answer built on it is unaffected: the join reads the digest entry and
  the recorded drive consoles, both unchanged here (digest re-run identical; wave 2's suite green).

### SC6 — The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens.: pass

- ✅ The measurement asks the page nothing: both drives read the console stream the extension already
  subscribes to, listeners attached in the driver and never in the page
  (`research/raw/m059-record-shapes.json:312`, `:427`), the capture is the one armed writer
  (`:883-885`), and the suite itself opens no page and starts no browser (`:27`), with the E9 read-only
  hash pin green in this review's run.
- ⚠ The test that would hold the `listeners` strings ("the drive states that nothing was installed in
  the page (D7)", `scripts/teardown-leak-shapes.test.mjs:2279-2282`) sits after the assertion that
  failed, so it did not execute in the red run; this review verified the recorded `listeners` strings
  directly instead (quoted above).

#### GAP 1 — the repair's exclusion list is narrower than the drift it was written for, so the record's central verdict is unprovable at HEAD: `OWN_ARTEFACTS` (`scripts/teardown-leak-shapes.test.mjs:138-143`) excludes four files and — for `research/raw/` — only `m059-record-shapes.json` itself, while `research/raw/m059-surface.json` (T004, 14 NG0205 quotations) and the T005-re-derived `research/raw/m044-gate-shapes.json` (1) sit unexcluded; a default run of the suite therefore re-derives `producible.verdict` as `"produced"` with 15 page hits against the recorded `"not-produced"` / 0, and 4 of 13 tests fail at `fce943d5`. T006's own Context named this exact mechanism for the surface record before the repair landed; the landed repair did not cover it, and no later verify ledger executed the suite.
Risk: high, blocking — a red gate suite and a central verdict that cannot be re-derived stand under every later wave that reads `producible` from this record; the owner task must extend the exclusion to the milestone's quoting records (or reclassify quotations in the enumeration rule at `scripts/teardown-leak-shapes.test.mjs:478-481`), re-arm with `M059_CAPTURE=1`, and let a verify ledger execute the suite after the landing.

#### GAP 2 — the suite's `COMMANDS` constant carries a typed `git rev-parse HEAD` output (`scripts/teardown-leak-shapes.test.mjs:831`, `'5c83c82b…'`) from an earlier capture, disagreeing with the record's own head `54398884…` (`research/raw/m059-record-shapes.json:8`); the derivation substitutes the capture's head (`:1673-1675`) so no check is wrong, but the shipped literal is dead text a reader can be misled by.
Risk: low, non-blocking — the derived value is checked against the record (`:2054-2058`, green in the run); deleting the stale literal or deriving it at module load removes the trap.
