# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

## T006 — Repair the shape suite the milestone's own artefacts moved: pass

Task landed as `03e86d55` ("T006: Repair the shape suite the milestone's own artefacts moved"): the
`OWN_ARTEFACTS` exclusion list in `scripts/teardown-leak-shapes.test.mjs` grew from two files to four,
the `commands` block's `git rev-parse HEAD` entry became derived from the capture's own head, and
`research/raw/m059-record-shapes.json` was re-armed by `M059_CAPTURE=1`. This review re-ran the suite
inside the extracted tree of `03e86d55` itself (a scratch checkout via `git archive`, so the two
failures there are the missing `.git` and the gitignored framework file, not the milestone) and
re-derived every counterfactual the exclusions claim to earn.

- ✅ The shape suite's scans exclude every artefact this milestone adds, named explicitly, and its `filesSearched` counts match the tree at this head: `OWN_ARTEFACTS` names four files (`scripts/teardown-leak-shapes.test.mjs:138-143`) and every scan filters on that list (`:439` in the extension/scripts pass, `:467` in the `research/raw` pass, `:1523-1526` in the `filesSearched` counts), and the run inside the extracted `03e86d55` tree prints `0 handleRecord and 0 postDestroy occurrences over 38 extension modules, 136 suites and 146 records` — the 38/136 denominators of the tree the milestone found, restored exactly as recorded. The milestone's fifth artefact, `research/raw/m059-surface.json`, is the one name the list does not carry; GAP 1 records what that gap cost and when it was neutralized.
- ✅ The record is re-derived by its own armed command, its occurrence counts stay 0 for all three needles, and its `producible` verdict stays `not-produced` with zero page hits: `M059_CAPTURE=1` re-armed it, and the run in the extracted `03e86d55` tree passes `the recording is what this head derives, field by field` (17.0822ms) with the record byte-identical before and after the run (46016 bytes, sha256 `bfe1af00…`, both printed by that run); the extension/scripts scan reports `0 handleRecord and 0 postDestroy occurrences`, the `research/raw` scan reports `2 occurrences in 1 record(s), 2 of them the digest enumeration, 0 on a page`, and the derived verdict reads `producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines, 0 NG0205`.
- ✅ No assertion is loosened and no count lowered: the repair changes what is counted, never what is claimed: `git show 03e86d55 -- scripts/teardown-leak-shapes.test.mjs` edits one comment, the exclusion list, the glob map and the `commands` mapping and removes no test (13 tests default / 14 armed on both sides of the landing), and both newly excluded files carry zero occurrences of every needle the extension/scripts scan counts (`handleRecord 0 | postDestroy 0 | leakedHandle 0 | .unsubscribe( 0`, measured above), so only the denominators moved and no occurrence count was suppressed to green a red.

### The record T006 re-armed, re-derived at its own tree

`node --test scripts/teardown-leak-shapes.test.mjs` inside the `03e86d55` tree — **13 tests, 11 pass,
2 fail, both failures environmental** (no `.git` in an archive checkout, and
`spikes/ng222-app/node_modules/…` is gitignored so absent from the archive):

```
✔ the recording is what this head derives, field by field (17.0822ms)
ℹ handle record: 0 handleRecord and 0 postDestroy occurrences over 38 extension modules, 136 suites and 146 records
ℹ research/raw: 2 occurrences in 1 record(s), 2 of them the digest enumeration, 0 on a page
ℹ producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines, 0 NG0205
ℹ research/raw/m059-record-shapes.json at load: 46016 bytes, sha256 bfe1af009330601483d5dfdd9169b8fc6a50cc0ae5b91b432396c842fb004f97
ℹ after the run: 46016 bytes, sha256 bfe1af009330601483d5dfdd9169b8fc6a50cc0ae5b91b432396c842fb004f97
ℹ tests 13
ℹ pass 11
ℹ fail 2
✖ the recording names the commit it was measured at … git rev-parse --verify 54398884…^{commit} … fatal: not a git repository
✖ every citation is the line its own number names … spikes/ng222-app/node_modules/@angular/core/… is not in this checkout
```

The decisive line is the first pass: the record T006 re-armed re-derives **field by field** at T006's
own tree, with the denominators the task claims (38/136/146), 0 page hits, and a byte-identical file
after the run. The eight mutants in the same run all redden naming their defects.

## Intent coverage

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.: pass

- ✅ T006 serves SC1 by keeping the measurement honest, and the re-armed record still states the SC1
  answer at this head: `producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines,
  0 NG0205` with `0 on a page` (default run at this head), which is the measured absence the answer
  must report rather than a manufactured observable (prohibition N4).
- ✅ The two mutants SC1 demands redden in the join's own suite and T006's repair touched neither
  assertion: the suite's 8 record mutants all redden naming their defects in the `03e86d55`-tree run
  (e.g. `mutant a-digest-code-the-file-does-not-carry -> digest.entry.code: "NG9999" -> "NG0205"`), and
  the SC1 mutants proper (suppress-the-code, attribute-to-last-component) live in
  `scripts/teardown-leak.test.mjs` M1/M2, outside T006's landed diff — verified: T006's diff edits only
  the comment, the exclusion list, the glob map and the `commands` mapping.
- ✅ The exclusions themselves cannot weaken SC1's evidence: both newly excluded files carry zero
  occurrences of every counted needle (measured above), so the `0 NG0205` and the absence counts the
  answer cites are unchanged by the repair — only the denominators were restored to the found tree.

## The substantive question: is excluding the milestone's own join and its suite legitimate, or does it hide the claim?

**Legitimate — and provably so beyond what the suite's own comment argues.** The list
(`scripts/teardown-leak-shapes.test.mjs:138-143`) excludes its own source, the record,
`extension/teardown-leak.js` and `scripts/teardown-leak.test.mjs` from all three scans
(`:439` skips them in the extension/scripts pass, `:467` in the `research/raw` NG0205 pass,
`:1523-1526` in the `filesSearched` counts). The legitimacy test is whether an excluded file could
carry what the scan counts. Measured at T006's own tree:

```
$ node <count scan needles inside the two newly excluded files at 03e86d55>
extension/teardown-leak.js:   handleRecord -> 0, postDestroy -> 0, leakedHandle -> 0, .unsubscribe( -> 0
scripts/teardown-leak.test.mjs: handleRecord -> 0, postDestroy -> 0, leakedHandle -> 0, .unsubscribe( -> 0, NG0205 -> 9
```

**Every needle the extension/scripts scan counts appears zero times in both excluded files.** The
exclusion therefore cannot hide a single occurrence — its entire effect is the denominators, and that
effect is exactly what was earned: T002's landing moved the raw counts 38→39 `extension/*.js` and
137→138 `scripts/*.mjs` (`git ls-tree` at `99afb9ea` vs `9b45eed5`), so the measured
`filesSearched` moved 38→39 and 136→137; the exclusions restore 38 and 136 — the tree the milestone
measured its central claim against (C1: "0/38 modules"). These files are the measuring instrument —
the join that reads the records and the suite that builds the in-memory test records — not the measured
tree, and the exclusion is stated, not silent: the suite's comment names all four with the reason
(`:130-136`), and the record itself carries the exclusions per glob
(`research/raw/m059-record-shapes.json:487-489`, `:620-622`, `:632-635`, `:645-647`).

The residual honesty question — could exclusion hide a real capability? No: the join is pinned pure by
its own suite ("the join reads only its records argument, and no page, no clock and no DOM",
`scripts/teardown-leak.test.mjs` test 5) and T004's review re-ran it in a bare `node:vm` context; a
scan hit in the join would be evidence of a defect the purity pin already hunts by stronger means.
The one real blind spot is GAP 2.

## T006's fix and T007's rule: compatible and composing, not superseded

T007 later rewrote the NG0205 classification inside `ng0205InResearchRaw` — from the line-shape rule
T006 shipped (`enumeration` = `/^"output": "/` or `/^"NG0205",$/`, everything else a page hit;
`03e86d55:scripts/teardown-leak-shapes.test.mjs:478-481, :490`) to the record-shape rule at HEAD
(`scripts/teardown-leak-shapes.test.mjs:487-503`: a record with a top-level `producible` object can
state an observation; every other record naming the code is quoting it). **T006 was not superseded:**

- T007 kept `OWN_ARTEFACTS` and `excludedIn` verbatim (`:138-143`, `:159-161` at HEAD), and its new
  rule still leans on the exclusion — the own record's 22 NG0205 quotations stay out of the scan only
  because `:467` filters them; the wave-7 review reached the same conclusion from the other side.
- What T006's exclusions govern is untouched by T007: the needle counts and the `filesSearched`
  denominators. At this review head the record still derives "38 extension modules, 136 suites and 148
  records … (the 4 files this milestone adds are excluded from the count)" — the extension/scripts
  denominators T006 pinned to the found tree are exactly 38/136 four landings later.
- What T007 replaced is the classification T006's exclusion list could not fix — and T006's own Context
  predicted that failure mode ("a record that merely quotes the code must not turn the measurement into
  `produced`", T006 Log) while its repair covered only four of the five artefacts. See GAP 1.

The two repairs are complementary layers over the same scan: T006's list answers "what is the
measured tree", T007's rule answers "what does a matching line mean". Neither makes the other wrong.

## Findings

#### GAP 1 — T006 excluded four of the milestone's five artefacts; the fifth (the surface record) landed quoting the code, and under T006's own rule it flipped the verdict T006 had just re-armed

T006's Context names the danger precisely: "T003's surface record repeats it under `knownDrift` … the
record for the surface names the code, so the shapes suite's `research/raw` scan would read 147 records
instead of 146 and 20 occurrences instead of 2, flipping its derived `producible` verdict from
`not-produced` to `produced`" (`.project/tasks/T006-…md:29-33`). The landed list answers that with two
of the four exclusions aimed at it — but `research/raw/m059-surface.json` is **not** in `OWN_ARTEFACTS`,
and when T004 landed it two commits later it carried **14 `NG0205` lines, none enumeration-shaped**
(surveyed at `4f67e837`). Under the T006-era rule (`onAPage = matches − enumeration`,
`03e86d55:scripts/teardown-leak-shapes.test.mjs:490`), the derivation at `fce943d5` read 17 occurrences
in 3 records with `onAPage: 15`, and the verdict is a direct function of that number —
`deriveProducible` at the same tree computes `const produced = researchRaw.onAPage + portalConsole.ng0205
+ fixtureConsole.ng0205; … verdict: produced === 0 ? 'not-produced' : 'produced'` (`03e86d55:…:1413-1418`)
— so the record T006 had re-armed to say "2 occurrences … 0 on a page" would derive `produced` with
fifteen page hits nobody observed. The field-by-field test must have been red from `4f67e837` until T007
re-derived it; nothing in T004's or T005's verify lines runs this suite (`npm run check` is tsc + gates
+ format only, `package.json`), so the staleness had no gate to trip.
Risk: was active between `4f67e837` and `a7a1e28a`; neutralized at this head by T007's rule, which
classifies all 17 current occurrences as quotations (`onAPage: 0`, 13/13 green). Not blocking. The
lesson for the list's next growth: an exclusion list of the milestone's *current* files cannot anticipate
records the milestone has not landed yet — the rule, not the list, is the general fix, and T007 wrote it.

#### GAP 2 — The exclusion is by path, not by content, so the scan is blind to the excluded files forever

`OWN_ARTEFACTS.includes(path)` (`:439`, `:467`, `:1524`) means the join and its suite will never be
counted, even if a future edit to them introduced a real `.unsubscribe(` site or a needle string —
the one edit that would make "the measurement" part of "the measured tree" is exactly the edit the
scan would not see. Today this costs nothing (all needle counts in both files are 0, measured above),
and the join's purity is independently pinned by its own SC2 test and the vm-context proof.
Risk: low — latent, and bounded by the fact that these two files are the milestone's own subject
matter; a one-line assertion that the excluded files carry zero occurrences of the needles (re-checked
each run) would convert the trust into a check.

#### GAP 3 — The re-armed record's "tree this milestone found" framing has since drifted for the records denominator

T006 re-armed the record to "38 extension modules, 136 suites and 146 records"; at this head it
derives "… and 148 records" (two records T004 added, `git ls-tree` 147→149 top-level `research/raw/*.json`).
The extension/scripts denominators held at 38/136 exactly as pinned; the records count is now a
current-tree measurement, not the found-tree one, while the suite's comment still says "The counts are
of the tree this milestone found" (`:132-133`).
Risk: informational — the C1 claim is about the tree, not the found tree, and the numbers are derived
and honest; reword the comment at the next re-capture.

## Commands and their output (verbatim)

### `node --test scripts/teardown-leak-shapes.test.mjs` at HEAD (default, read-only)

```
ℹ head d735ec00 is a commit this checkout carries, captured at 2026-11-22T00:27:11.118Z
✔ the producible verdict states what was driven and, producing nothing, the observable it lacks (25.7392ms)
ℹ producible: not-produced — 4 portal routes/38 lines, 2 fixture routes/4 lines, 0 NG0205
ℹ research/raw: 17 occurrences in 3 record(s), 0 of them the digest enumeration, 0 on a page
ℹ handle record: 0 handleRecord and 0 postDestroy occurrences over 38 extension modules, 136 suites and 148 records
✔ the recording is what this head derives, field by field (25.5992ms)
ℹ 10 section(s) re-derived, 37 citation(s), 0 NG0205 produced
ℹ research/raw/m059-record-shapes.json at load: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
ℹ after the run: 53116 bytes, sha256 a5817d8e295d37283a70bb658321e21834e1e30cfc6622231f3dcfe7249e3f76
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

### `node --test scripts/teardown-leak-shapes.test.mjs` inside the extracted `03e86d55` tree

See the block at the top of this review: 13 tests, 11 pass, 2 fail (both environmental to the archive
checkout), record re-derives field by field at 38/136/146 with 0 page hits, sha unchanged across the
run.

### Needle counts inside the excluded files (my own command at the `03e86d55` tree)

```
extension/teardown-leak.js:     handleRecord 0 | postDestroy 0 | leakedHandle 0 | .unsubscribe( 0
scripts/teardown-leak.test.mjs: handleRecord 0 | postDestroy 0 | leakedHandle 0 | .unsubscribe( 0 | NG0205 9 (not scanned: not under research/raw)
```

### Scan-glob counts across the milestone (`git ls-tree -r --name-only`, top level per directory)

```
99afb9ea (T001) {"extension.js":38,"scripts.mjs":137,"researchRaw.json":147}
9b45eed5 (T002) {"extension.js":39,"scripts.mjs":138,"researchRaw.json":147}   ← the landing T006's repair answers
03e86d55 (T006) {"extension.js":39,"scripts.mjs":138,"researchRaw.json":147}
a7a1e28a (HEAD) {"extension.js":39,"scripts.mjs":138,"researchRaw.json":149}
```

### NG0205 survey of the surface record T004 landed (evidence for GAP 1)

```
$ git show 4f67e837:research/raw/m059-surface.json | node <survey, T006-era enumeration shapes>
m059-surface.json | NG0205 lines: 14 | enumeration-shaped: 0 | page-hit-shaped: 14
  14  "{\"state\":\"finding\",\"code\":\"NG0205\",\"message\":\"NG0205: Injector has already been destroye…
 168  "lineText": "code: 'NG0205',",
 216  "code": "NG0205",
 624  "No page read produced this answer and none could: T001 measured 0 NG0205 across 38 portal console l…
```

## Files read

| File | Status |
|---|---|
| `.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md` | read, 100% (80/80 lines) |
| `.project/tasks/T005-re-derive-the-two-gate-records-and-the-census.md` | read, 100% (68/68 lines; interface contract) |
| `.project/intent/INTENT.md` | read, 100% (119/119 lines; SC1 criterion verbatim from `:58-63`) |
| `.project/review/wave-7.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md` (stub), `wave-6.cycle1.md` (stub) | read, 100% (203, 108, 17, 17 lines; T007's rule facts and grammar) |
| `scripts/teardown-leak-shapes.test.mjs` (HEAD, 2,718 lines) | not read whole; `OWN_ARTEFACTS` block `:128-161`, scan `:422-455`, T006-era and T007-era NG0205 rules `:458-522`, absence derivation `:1489-1531` read directly (~8%) |
| `scripts/teardown-leak-shapes.test.mjs` (extracted `03e86d55` copy, 2,690 lines) | not read whole; same windows plus the full default-run output (~5%) |
| `git show 03e86d55 -- scripts/teardown-leak-shapes.test.mjs` (T006's diff) | read, 100% of the diff |
| `extension/teardown-leak.js`, `scripts/teardown-leak.test.mjs` | not read (883 and 1,431 lines); needle occurrences counted programmatically, test titles and mutant blocks quoted via count (~3%) |
| `research/raw/m059-record-shapes.json` | not read whole (1,029 lines); `excluded` fields at `:487-489`, `:620-622`, `:632-635`, `:645-647` read via grep, NG0205 lines surveyed (~5%) |
| `research/raw/m059-surface.json` (T004 blob) | not read whole (647 lines); the 14 NG0205 lines surveyed (~3%) |
| `package.json` | not read whole; `scripts` block read (check/test composition for GAP 1) |
| `research/raw/m059-verdict-claims.json`, `extension/agent-main.js` | not read; quoted only as printed by the suite's own run output |
