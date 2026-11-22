# Review — wave 1, cycle 2

Cycle: 2
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

Cycle 1 blocked this wave: at `fce943d5` the shape suite ran `tests 13, pass 9, fail 4` and the
classifier in `ng0205InResearchRaw` counted quotations of `NG0205` as page hits, so this milestone's
own surface and claims records flipped `producible` to `produced` with fifteen page hits nobody
observed (the finding is recorded in T007's Log, `.project/tasks/T007-count-a-quotation-as-a-quotation-not-as-a-page-hit.md:72-79`).
T007 was added to repair it; this cycle reviews T001 (landed `99afb9ea`) with that repair in place.

## T001 — Measure what the console record and the digest state: pass

- ✅ `node --test scripts/teardown-leak-shapes.test.mjs` — 13 pass / 0 fail at this HEAD (verbatim
  output below). The record `research/raw/m059-record-shapes.json` re-derives field by field
  (`the recording is what this head derives, field by field` — 10 sections, 37 citations, 0 NG0205
  produced).
- ✅ AC1: all four measurements are stated with commands and their outputs — `commands` carries seven
  verbatim entries (`research/raw/m059-record-shapes.json:368-431`), including
  `"NG0205 Injector has already been destroyed\n64 426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35 61577"`
  for the digest and `handleRecord extension=0 scripts=0 research=0` rows for the absences.
- ✅ AC2: the record names the code and the body the installed build prints, and the D6 check
  (`the record names no subscription, effect or timer as the owner`) passes — no string in the
  record's four measured sections matches `leaked (subscription|effect|timer|handle)`.
- ✅ AC3: the reading is stated as the agent's existing console subscription with no page-side
  instrumentation (`producible.targets.portal.drive.listeners`: `"page.on(\"console\") and
  page.on(\"pageerror\") in the playwright-cli driver: no listener, no hook, no patch and no global
  was installed in the page (D7)"`), and held-out E9 passes — the default run left the record at
  sha256 `a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76` unchanged.
- ✅ AC4: the producible measurement names the routes tried (`/contract/list`, `/home`,
  `/claim/list`, `/customer/list`; fixture `/stale-view` then `/`) and the observable that is missing
  (`producible.targets.portal.missing`: "the observable that is absent is the page action, not the
  read: NG0205 is thrown by Injector.get on a destroyed injector…").

## T007 — Count a quotation as a quotation, not as a page hit: pass

- ✅ The rule is now a record's capacity to state an observation, not a line's shape
  (`scripts/teardown-leak-shapes.test.mjs:487-497`):

  ```js
  const observationRecords = new Set(
    searched.filter((path) => {
      try {
        return isObject(
          JSON.parse(readFileSync(fullPath(path), 'utf8')).producible,
        );
      } catch {
        return false;
      }
    }),
  );
  ```

  A page hit counts only inside a record carrying a top-level `producible` object; everything else
  naming the code is reported as `quotationsOutsideARecordShape` with the rule stated in the record's
  `finding` (AC1).
- ✅ AC2: the record re-derives to `"producible": "not-produced"`, `"produced": 0`, `"onAPage": 0`,
  `"quotationsOutsideARecordShape": 17`, `"recordsSearched": 148`
  (`research/raw/m059-record-shapes.json:583-586`, `:486`). The cycle-1 defect is gone: the
  milestone's own surface record's fourteen `NG0205` lines and the gate record's one line are now
  counted as the quotations they are (all three carrying records are named in
  `researchRaw.recordsCarryingTheCode`, `research/raw/m059-record-shapes.json:490-494`).
- ✅ AC3: default run 13 pass / 0 fail, armed run 14 pass / 0 fail, and the second armed run wrote
  nothing — sha256 `6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac` before and
  after (`armed run: nothing moved, nothing written`). No assertion was loosened: the mutant check
  still reddens all eight mutants naming their defects.
- ⚠️ Side effect to note, not a defect: the committed record was captured at `d735ec00` (settle
  before T007), so the first armed run at this HEAD re-based its `head` and `git rev-parse` output to
  `a7a1e28a…` — 53,116 bytes before and after, sha `a5817d8e…` → `6449768c…`. The working tree now
  carries that re-based record uncommitted (GAP 1).

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ T001 measured the record the answer is read from — the code, the body
  (`NG0205: Injector has already been destroyed.`, derived from the installed build's throw site), the
  joins' field lists, and both absences as separate states
  (`absences["owner-not-in-the-message"]` and `absences["handle-record-not-held"]`). T007's rule
  change keeps that measurement honest: the record now states `not-produced` / `0` / `0` because
  quotations are no longer counted as page evidence. The suite's mutant mechanism reddens on a
  doctored record naming its defect (eight mutants, all red in the run below).

### SC6 — The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens.: pass

- ✅ T001 built nothing (`builtNothing.built: []`) and the suite asserts both drive listeners state
  `no listener` (`target.drive.listeners.includes('no listener')`); the only file an armed run writes
  is the record itself, behind `M059_CAPTURE=1`, and a default run writes no byte (E9, hash-verified).

### GAP 1 — The landed record names a head one commit behind its own landing, so the first armed run after landing always rewrites it

The committed `m059-record-shapes.json` was captured at `d735ec00` (`settle before T007`); T007's own
commit `a7a1e28a` moved nothing the record derives, but `head` and the recorded `git rev-parse HEAD`
output are compared field for field, so the first armed run at the landing commit rewrote the file
(sha `a5817d8e…` → `6449768c…`, both 53,116 bytes). The working tree now carries that re-based record
uncommitted; it is not staged here.
Risk: low. Every default run still passes either way (the recorded head must only be an ancestor of
HEAD), and the rewrite is the suite's designed behaviour — but a wave whose verify runs armed will
always dirty the tree once per landing. Not blocking.

### GAP 2 — The record's `finding` prose describes a classification the rule did not make

`research/raw/m059-record-shapes.json:587` states "the two occurrences in the record that could state
an observation are the digest enumeration M045 recorded", but the derived fields on the same section
say `"observationRecords": []` (`:495`) and `"inTheDigestEnumeration": 0` (`:584`) — `m045-console-shapes.json`
carries no `producible` section, so its two enumeration lines are inside
`quotationsOutsideARecordShape: 17`. The counts are right; the sentence explaining them is not.
Risk: low. It misdescribes, it does not miscount, and the suite's own diagnostic prints
`0 of them the digest enumeration`. Not blocking; the sentence in the typed constant at
`scripts/teardown-leak-shapes.test.mjs:519-520` should be brought back in line with the numbers at the
next re-capture.

### GAP 3 — One record under `research/raw/` is not valid JSON, and the rule silently demotes unparseable records

`research/raw/stale-view-counter.json` fails `JSON.parse` — its first key carries unescaped quotes:
`"temporary change: timer(300).subscribe(() => (this.plain = "after")) with {{ plain }} in the
template"` (byte 130). The rule's `catch { return false }`
(`scripts/teardown-leak-shapes.test.mjs:493-495`) classifies such a record as a quotation record
without a diagnostic. The file carries no `NG0205` and predates this milestone, so nothing is hidden
at this head, but a real observation recorded in an unparseable record would be discarded in silence.
Risk: low today, named in full under wave 7. Not blocking for T001 or T007.

## Commands and their output (verbatim)

### `node --test scripts/teardown-leak-shapes.test.mjs` (default, read-only)

```
ℹ tests 13
ℹ pass 13
ℹ fail 0
✔ the producible verdict states what was driven and, producing nothing, the observable it lacks (27.9749ms)
ℹ producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines, 0 NG0205
ℹ research/raw: 17 occurrences in 3 record(s), 0 of them the digest enumeration, 0 on a page
✔ held-out E9: the record is read-only and no capture runs on a default run (20.5875ms)
ℹ research/raw/m059-record-shapes.json at load: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
ℹ after the run: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
```

(full output retained in the session log; the counts and hashes above are the lines that decide this review)

### Armed run 1 — `set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs`

```
before armed run 1: a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
✔ armed: re-derive, write only what moved, and a second run changes no byte (184.2176ms)
ℹ armed run wrote research/raw/m059-record-shapes.json: 53116 bytes, sha256 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac
ℹ armed idempotence: 53116 bytes, sha256 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac before and after the second run
ℹ head a7a1e28a is a commit this checkout carries, captured at 2026-11-22T00:27:11.118Z
ℹ tests 14
ℹ pass 14
ℹ fail 0
after armed run 1: 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac
```

### Armed run 2 (byte-identity proof)

```
✔ armed: re-derive, write only what moved, and a second run changes no byte (168.4856ms)
ℹ armed run: nothing moved, nothing written (sha256 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac)
ℹ tests 14
ℹ pass 14
ℹ fail 0
after armed run 2: 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac
git status --short:
 M research/raw/m059-record-shapes.json
```

### Record-parse survey (evidence for GAP 3)

```
$ node -e "...classify producible field types and find unparseable records..."
m059-record-shapes.json producible:object
unparseable:
  stale-view-counter.json: Expected ',' or '}' after property value in JSON at position 130 (line 1 column
```

## Files read

- `.project/intent/INTENT.md` — read, 100% (119/119 lines).
- `.project/review/wave-3.cycle1.md` — read, 100% (25/25 lines; grammar template).
- `.project/tasks/T001-measure-what-the-console-record-and-the-digest-state.md` — read, 100% (82/82 lines).
- `.project/tasks/T007-count-a-quotation-as-a-quotation-not-as-a-page-hit.md` — read, 100% (86/86 lines, Log included).
- `scripts/teardown-leak-shapes.test.mjs` — read, 100% (2,717/2,717 lines, two windows).
- `research/raw/m059-record-shapes.json` — read, 11% (120 of 1,029 lines, the `producible.researchRaw` section and its neighbourhood); the rest was read only through the suite's own field-by-field comparison.
- `research/raw/stale-view-counter.json` — read, 79% (260 of 328 bytes, via node; the remainder is the tail of the same object).
- `research/raw/m059-surface.json`, `research/raw/m044-gate-shapes.json`, `research/raw/m045-console-shapes.json` — not read directly; their `NG0205` lines were read as quoted in `m059-record-shapes.json:496-582` and counted by the suite.
- `.project/review/wave-1.cycle1.md` — not read (not on disk; the cycle-1 finding was taken from T007's Log, as the brief directs).
