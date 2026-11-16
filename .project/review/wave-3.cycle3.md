# Review — wave 3, cycle 3

Cycle: 3
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e1ba31fcc0e5051bbdfe244c5e403d10371d0e9f

## T003 — Render the join and pin the routes it adds: pass

- ✅ Cycle 2's advisory is closed by measurement, not by reading the claim. A silence claim written into the
  `no-diagnostics` sentence (`no-diagnostics: the page was silent, so no capture was handed to the join at
  all`) reddens the render suite at exit 1, 19 pass / 13 fail, naming the state and the claim:
  `silence-claim: the no-diagnostics surface never claims the page was silent — … it rendered
  "no-diagnostics: the page was silent, …" (claimed "silent")`, and again at the source:
  `silence-claim: the no-diagnostics sentence never claims the page was silent …`.
- ✅ A cause in a *pane-written* absence sentence reddens: a `because …` clause appended to the `no-code`
  sentence gives exit 1, 20 pass / 12 fail, `no-cause-element-remedy: the joined surface must render no cause
  — none of its own lines names one; … (matched /\bbecause\b/i)`.
- ✅ An unattributed Angular phrase in a pane-written absence sentence reddens: `, and Angular reported it`
  appended to the `no-digest-entry` sentence gives exit 1, 22 pass / 10 fail, `no-unattributed-wording: the
  joined surface writes no wording of its own naming Angular; it rendered "no-digest-entry: … and Angular
  reported it"`.
- ✅ The exemption is load-bearing and has not opened a hole. At this head a recorded `title:` may carry
  "element" and a `text:` may carry "because" and both suites are green (59/59). Emptying the exemption
  (`CARRIED_FIELDS = []`) reddens the render suite at 31 pass / 1 fail, and the one failing test is the E7
  case that owns the positive control: `no-cause-element-remedy: the joined surface must render no cause —
  … it rendered [… "title: Unsafe bindings on an element","text: NG0910: … because …"] (matched
  /\bbecause\b/i)`. The record suite carries the same proof in-memory and prints it on every green run:
  `exemption removed reddens: recorded-vocabulary: … surface line 3 is policed as the pane's own "title" line
  and carries "element" … it records "title: Unsafe bindings on an element"`.
- ✅ The exemption is not a smuggling channel for the pane's own words. Wrapping a pane-written cause in a
  `text:` label (`text: ${text} because the hook failed`) reddens both suites: the render pin
  `renders-the-answer-and-nothing-else: the line "text: NG0100: … because the hook failed" is neither a field
  of the answer nor one of the pane's own named absences` (exit 1, 27 pass / 5 fail), and the record pin
  `text: joined finding 0 must render its captured text verbatim` (exit 1, 23 pass / 4 fail). A line may carry
  a prohibited word only when it is the value the answer handed over.
- ✅ The three cycle-2 probes still redden at this head. " and this page is not an Angular app" appended to the
  `no-diagnostics` sentence: exit 1, 21 pass / 11 fail, `no-unattributed-wording: the no-diagnostics surface
  writes no wording of its own naming Angular`. The `captured-nothing` sentence replaced by a silence claim:
  exit 1, 17 pass / 15 fail, `silence-claim: the captured-nothing surface never claims the page was silent …
  (claimed "silent")`. " because every console hook failed to install" appended to `no-diagnostics`: exit 1,
  21 pass / 11 fail, `no-cause-element-remedy: the no-diagnostics surface must render no cause … (matched
  /\bbecause\b/i)`. Each also reddens the record suite (exit 1, 25 pass / 2 fail): the byte pin names the
  moved line (`research/raw/m045-console-panel.json disagrees with this head at <record>.cases[4]
  .surface.lines[1]`) and the rendered-lines pin names the state.
- ✅ `NG0910`'s shipped title is what the new positive case asserts, and the case is not vacuous.
  `extension/error-digest.json` carries 64 entries; `NG0910` is titled **"Unsafe bindings on an element"**, which
  matches `/\belement\b/i` as a whole word and is exactly the line recorded at
  `research/raw/m045-console-panel.json` (`title: Unsafe bindings on an element`, byte-equal to the digest's
  own title). The assertions are therefore about a real prohibited word, and the two armed controls inside the
  same test (exemption off → reddens on the captured "because"; then on the digest's "element") prove the pass
  is the exemption's and not an accident of the wording. The cycle-2/earlier claim that this title is
  "Component ID generation collision" is wrong at this head — that is `NG0912`'s title; T009's Log states the
  correction and the digest agrees with it.
- ⚠️ Advisory, new and narrower than cycle 2's. The silence rule now reaches every state, but it is still a
  five-pattern lexicon, and a silence claim phrased outside it survives. Replacing the `no-diagnostics` sentence
  with `no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join` leaves
  every silence pin green (the render suite's four failures are its own mutants' `mutation anchor` preconditions,
  not the rule), the record suite agrees because it carries no silence rule at all, and an armed re-capture
  (`M045_CAPTURE=1`, 26 pass / 0 fail) rewrites the recording to bless it — 27 pass / 0 fail on the re-recorded
  bytes. The control shows the boundary is the word list and not a broken pin: `the page reported nothing at
  all` reddens with `(claimed "the page reported nothing")`. Not a defect in the shipped sentence and not a
  scoping hole — the rule's reach was cycle 2's defect and it is fixed — but a claim of silence phrased
  differently is still only caught by the byte snapshot, which an armed run resets.
- ✅ Both required commands pass at the frozen head: `node --test scripts/console-panel-render.test.mjs
  scripts/console-panel-record.test.mjs` → `ℹ tests 59 / ℹ pass 59 / ℹ fail 0 / ℹ skipped 0` (32 render + 27
  record), and `npm run check:panel` → exit 0 with no diagnostic (`tsc -p
  apps/angular-ai-devtools/tsconfig.check.json`).

Measurement note. My first pass ran against the shared worktree and was contaminated: mid-session
`scripts/console-panel-record.test.mjs` changed from `865891f4…` to `17e6a239…` (`if (carried.includes(label))
continue;` replaced by `if (false) continue;` — another session's in-place probe), and one dump caught a
doubly-edited state (`NG0912` titled "Component ID generation collision" inside the recorded case) that exists
nowhere at this head. I discarded that pass and re-ran every probe above against a pristine
`git archive e1ba31fc` extraction whose seven relevant blobs match the HEAD sha256 values (pane
`36235d2a…`, render suite `f5c849aa…`, record suite `865891f4…`, record `a1d98cec…`, digest `426a5be1…`,
join `63dcf6d3…`, shapes `50ef2351…`). Every mutation was applied in place, run, and restored, with the sha256
printed before and after and reported identical in all nine cases; the worktree is back at HEAD
(`git status --short` shows only untracked `.project/review/` files). The one exception is the advisory probe
above, whose armed re-capture rewrote the recording inside the disposable extraction only.

## Intent coverage

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ Both absences are still named by sentence, and T009 did not weaken either to make room for the wording
  change: the `no-digest-entry` sentence names `NG04002` and the `no-code` sentence still reddens on a count
  (`no-code: a count is not a name … "no-code: 1 captured message carried no code, …"`). The 16 render mutants
  and 2 record mutants all still redden on a green run, and the digest-miss and no-code rules each have their
  own mutant rather than sharing one.
- ✅ Neither pinned sentence gained a cause, an element or a remedy while being re-worded, and none had to be
  re-worded: T009's whole diff to the pane is nine added docblock lines and no deletion, so every rendered
  sentence at this head is the one cycle 2 measured. Both absences are policed as the pane's own lines, which
  the `no-code` probe above exercises directly.

### SC4 — A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for.: pass

- ✅ The two absences remain two statements (`two-absences` green, neither text names the other's state), and
  the `captured-nothing` sentence is still read whole rather than by its prefix — replacing it with a silence
  claim reddens `silence-claim: the captured-nothing surface …(claimed "silent")` at 17 pass / 15 fail.
- ✅ The rule is no longer scoped to one state: `pinNoAbsenceClaimsSilence` runs inside `pinE7OnEveryState` over
  `joined`, `captured-nothing`, `no-diagnostics` and a given word, and `pinNoModuleSentenceClaimsSilence` reads
  all nine sentences the module states, so a claim written into `no-diagnostics` or into a named absence
  reddens naming the sentence it was written in — probed above for `no-diagnostics` and for `no-console-answer`.
- ⚠️ The rule's reach is complete; its vocabulary is not (the advisory above: "the page emitted no diagnostic
  at all" stays green everywhere, including after an armed re-capture).

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: pass

- ✅ The prohibition is now correctly scoped to the pane's own attribution and still bites there: a `because`
  clause and an "Angular" phrase in pane-written absence sentences each redden naming the state and the phrase,
  while the digest's own "Unsafe bindings on an element" and a captured "because" render verbatim and pass.
- ✅ Removing the exemption reddens the correct pane (the exemption is doing work), and hiding a pane-written
  cause behind a carried label reddens the answer-shaped pin instead — so no rendering of a prohibited word
  passes by being labelled `text:` or `title:`.

## Held-out

### E7 — A suite must pin that the surface renders no cause, element, remedy or unattributed angular wording.: pass

- The pins run on every state the pane renders, the silence rule is among them, and each of the four E7
  prohibitions still has a mutant that reddens by name (`no-cause`, `no-element`, `no-remedy`,
  `no-unattributed-wording`, plus the per-state `captured-nothing`/`no-diagnostics`/`wedged` variants). The
  positive case is now pinned as tightly as the negative one — a real digest title carrying "element" and a
  captured "because" must pass, and the exemption that lets them is itself armed from both sides.
