# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

## T007 — Count a quotation as a quotation, not as a page hit: pass

- ✅ `node --test scripts/teardown-leak-shapes.test.mjs` — 13 pass / 0 fail (verbatim output below).
- ✅ Armed run — 14 pass / 0 fail; a second armed run wrote nothing and the record is byte-identical
  (sha256 `6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac` before and after the
  second run; the first armed run at this HEAD re-based the record's `head` from `d735ec00` to
  `a7a1e28a`, which is why it wrote once). No assertion was loosened — all eight mutants still redden
  naming their defects.
- ✅ AC1: the rule is stated in the record's `finding` and the quotations are their own number:
  `"quotationsOutsideARecordShape": 17` beside `"onAPage": 0`
  (`research/raw/m059-record-shapes.json:585-586`).
- ✅ AC2: the record re-derives to `"producible": "not-produced"`, `"produced": 0`, `"onAPage": 0` at
  this head (`research/raw/m059-record-shapes.json:586`, and `verdictOf` renders
  `so not-produced and handle-record-not-held are the two answers the milestone can ship`).
- ✅ AC3: green on the default run, byte-identical on the second armed run, nothing loosened.

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ The rule change serves SC1 by keeping the record's `producible` section an honest measurement: at
  `fce943d5` the milestone's own surface and claims records — which quote `NG0205` fourteen and one
  times — turned `producible` into `produced` with page hits nobody observed, which is exactly the
  "quotation rendered as evidence" defect the intent's prohibitions exist to prevent (N1: name only
  what the record attributes; N4: do not manufacture an observable). The record now states the
  absence-only answer with every quotation counted as a quotation.

## The substantive question: is the new rule honest, or does it hide observations?

**Verdict: honest at this head — nothing observable is discarded — but it has two named corners where
a real page observation would be discarded in silence if one were ever recorded there.**

The rule (`scripts/teardown-leak-shapes.test.mjs:487-503`) splits every line under `research/raw/`
carrying `NG0205` by whether its file parses and carries a top-level `producible` **object**:

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
const couldObserve = matches.filter((match) =>
  observationRecords.has(match.path),
);
const quotations = matches.filter(
  (match) => !observationRecords.has(match.path),
);
```

`onAPage` is `couldObserve` minus the digest-enumeration lines inside observation records
(`:516-518`). At this head `observationRecords` is empty (`research/raw/m059-record-shapes.json:495`)
and all 17 matching lines are quotations — the correct classification, checked line by line: two are
the digest's own enumeration in `m045-console-shapes.json:192` and `:561`, one is a `reason` string in
`m044-gate-shapes.json:2714`, and fourteen are the surface record's pins of the join's answer and its
source lines (`research/raw/m059-surface.json:14`, `:168-222`, `:624`) — every one a citation, none a
captured console line.

**Could a real page observation be recorded somewhere this rule would now discard? Yes — two record
shapes would have to exist, and neither exists today:**

1. **The m032 console-capture shape.** The repository's established shape for "what a page emitted"
   is `research/raw/m032-console-diagnostics.json`: a top-level `messages` array, no `producible`
   section. The suite itself reads that file as the authority on a message's fields
   (`scripts/teardown-leak-shapes.test.mjs:82`, `fieldNamesOfTheCapture` at `:1137-1168`). A future
   page capture that recorded an `NG0205` console line in exactly that shape — the shape this
   milestone measured, and the shape the agent's console subscription actually produces — would be
   classified a quotation and discarded, silently and with `onAPage: 0` stating the opposite of what
   happened. **This milestone does not write one**: T001's drive consoles are recorded inside
   `m059-record-shapes.json`'s own `producible.targets.*.console.lines`, and their `NG0205` counts
   enter `produced` through the drive constants (`consoleView` at `:1408-1429`, `ng0205AsPrinted`),
   not through this scan — the record file is in `OWN_ARTEFACTS` and excluded from the search
   (`:138-143`). So the exclusion is what saves this head, not the rule: the rule is honest here only
   because no capture record without a `producible` section carries the code.

2. **An unparseable record.** The `catch { return false }` (`:493-495`) demotes any record
   `JSON.parse` rejects, with no diagnostic. One such record exists today:
   `research/raw/stale-view-counter.json` is invalid JSON — its first key carries unescaped quotes,
   `"temporary change: timer(300).subscribe(() => (this.plain = "after")) with {{ plain }} in the
   template"` (byte 130). It carries no `NG0205` and predates this milestone, so nothing is hidden —
   but an observation written into a record with one malformed string would be discarded in silence,
   and `recordsSearched: 148` would still count it as searched.

One asymmetry worth naming because it is the mirror of the cycle-1 defect: **inside** an observation
record the old line-shape rule survives. `onAPage` subtracts only the two enumeration shapes
(`/^"output": "/` and `/^"NG0205",$/`, `:478-481`), so a prose sentence quoting the code inside a
record that does carry `producible` would count as a page hit — a false positive, not a hidden
observation. Latent at this head: the only `producible`-bearing record is the excluded own artefact.

## Findings

### GAP 1 — A real `NG0205` captured in the m032 console-capture shape would be discarded as a quotation

The rule classifies by the presence of a top-level `producible` object, and the repository's own
console-capture shape (`research/raw/m032-console-diagnostics.json`, top-level `messages`) has none.
A future capture recording the code there would flip nothing: `onAPage` would stay 0 and the line
would be reported as a quotation.
Risk: medium — latent, not active. This milestone writes no such record, and the record's `finding`
correctly states the rule, so the discard would at least be explicable; but the next milestone that
captures a console stream in the established shape and sees the code would be told it saw nothing.
Not blocking this wave. The cheap repair is to add the m032 shape (a top-level `messages` array of
console lines) to the observation-record test, or to name that shape in the `finding` as a shape the
rule does not yet cover.

### GAP 2 — Unparseable records are demoted in silence, and one already exists

`research/raw/stale-view-counter.json` fails `JSON.parse` (unescaped quotes at byte 130); the
`catch { return false }` at `scripts/teardown-leak-shapes.test.mjs:493-495` counts it as a quotation
record without saying so. It carries no `NG0205`, so nothing is hidden at this head.
Risk: low today. An observation in a malformed record would be discarded without a diagnostic, and
`recordsSearched` would still claim the record was searched. Not blocking; a one-line count of
unparseable records, reported beside `quotationsOutsideARecordShape`, would close it.

### GAP 3 — The record's `finding` prose misdescribes its own derived numbers

`research/raw/m059-record-shapes.json:587` states "the two occurrences in the record that could state
an observation are the digest enumeration M045 recorded", while the same section derives
`"observationRecords": []` (`:495`) and `"inTheDigestEnumeration": 0` (`:584`) — `m045-console-shapes.json`
has no `producible` section, so those two lines sit inside `quotationsOutsideARecordShape: 17`.
The counts are correct; the typed constant at `scripts/teardown-leak-shapes.test.mjs:519-520`
describes a classification the rule did not make.
Risk: low. A reader trusting the prose over the numbers would believe the enumeration lines were
classified as observation records when they were classified as quotations. Not blocking; reword the
constant at the next re-capture so the sentence matches `observationRecords`.

## Commands and their output (verbatim)

### `node --test scripts/teardown-leak-shapes.test.mjs` (default, read-only)

```
ℹ tests 13
ℹ pass 13
ℹ fail 0
✔ the producible verdict states what was driven and, producing nothing, the observable it lacks (27.9749ms)
ℹ producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines, 0 NG0205
ℹ research/raw: 17 occurrences in 3 record(s), 0 of them the digest enumeration, 0 on a page
✔ the record names no subscription, effect or timer as the owner (D6) (0.9505ms)
✔ a mutated copy of the record reddens naming its defect, and the untouched record passes first (207.8533ms)
✔ held-out E9: the record is read-only and no capture runs on a default run (20.5875ms)
ℹ research/raw/m059-record-shapes.json at load: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
ℹ after the run: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
```

### Armed run 1 — `set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs`

```
before armed run 1: a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
✔ armed: re-derive, write only what moved, and a second run changes no byte (184.2176ms)
ℹ armed run wrote research/raw/m059-record-shapes.json: 53116 bytes, sha256 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac
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
ℹ armed idempotence: 53116 bytes, sha256 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac before and after the second run
ℹ tests 14
ℹ pass 14
ℹ fail 0
after armed run 2: 6449768c0fd3ef4add0686e00699ee81cbb51b5c99d7889c2ed4384eca1699ac
git status --short:
 M research/raw/m059-record-shapes.json
```

### Record-parse survey (evidence for GAP 2 and the classification counts)

```
$ node -e "...classify producible field types and find unparseable records..."
m059-record-shapes.json producible:object
unparseable:
  stale-view-counter.json: Expected ',' or '}' after property value in JSON at position 130 (line 1 column
```

## Files read

- `scripts/teardown-leak-shapes.test.mjs` — read, 100% (2,717/2,717 lines, two windows).
- `.project/tasks/T007-count-a-quotation-as-a-quotation-not-as-a-page-hit.md` — read, 100% (86/86 lines, Log included).
- `.project/tasks/T001-measure-what-the-console-record-and-the-digest-state.md` — read, 100% (82/82 lines).
- `.project/intent/INTENT.md` — read, 100% (119/119 lines; criterion text taken verbatim from `:58-63`).
- `.project/review/wave-3.cycle1.md` — read, 100% (25/25 lines; grammar template).
- `research/raw/m059-record-shapes.json` — read, 11% (120 of 1,029 lines, the `producible.researchRaw` section); the rest was read through the suite's field-by-field comparison.
- `research/raw/stale-view-counter.json` — read, 79% (260 of 328 bytes, via node).
- `research/raw/m059-surface.json`, `research/raw/m044-gate-shapes.json`, `research/raw/m045-console-shapes.json`, `research/raw/m032-console-diagnostics.json` — not read directly; their shapes and `NG0205` lines were read as quoted in `m059-record-shapes.json:496-582` and counted by the suite.
- `.project/review/wave-1.cycle1.md` — not read (not on disk).
