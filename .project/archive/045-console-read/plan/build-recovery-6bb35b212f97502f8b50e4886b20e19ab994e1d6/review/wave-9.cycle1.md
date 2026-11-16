# Review — wave 9, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T014 — Stop the prohibitions from being a phrase list: pass

- ✅ Landing commit `b7e3a739` (`git show --numstat b7e3a739`: five files, +1608/−69 —
  `scripts/console-panel-record.test.mjs` +683/−0, `scripts/console-panel-render.test.mjs` +593/−61,
  `research/raw/m045-console-panel.json` +183/−1, `apps/angular-ai-devtools/src/app/panel-console.ts` +16/−4,
  the task file +133/−3). The pane's own change is a docblock and nothing else: `git show b7e3a739 --
  apps/angular-ai-devtools/src/app/panel-console.ts` replaces the old "Nor may any sentence it writes claim
  the page was silent" paragraph with the property and states where it lives — "The rule is stated once, in
  the record's own contract (`research/raw/m045-console-panel.json`, `contract.absenceStatement`), and both
  suites read it from there" — with no rendered sentence touched.
- ✅ AC1 — a claim about the page's own behaviour reddens in every state, in wordings the five-pattern lexicon
  never matched, and each reddening names the state and the phrase. Rendered surfaces (one per state):
  `absence-statement: the no-diagnostics sentence says what was read and what it means for the panel, and
  never what the page did — it names the page ("page") outside a denial; it rendered "the page emitted no
  diagnostic at all, so no capture was handed to the join" (claimed "the page emitted no diagnostic at all")`;
  `… the captured-nothing sentence … it rendered "the page ran clean, so a capture was read and carried no
  diagnostic" (claimed "the page ran clean")`; `… the joined sentence … it rendered "the capture held at least
  one diagnostic, and the page had nothing else to say" (claimed "the page had nothing else to say")`; and a
  fourth in the `no-console-answer` sentence, `… it names the page ("browser") outside a denial; it rendered
  "the browser had nothing to say, so no console join answer was handed over"`. The record suite reddens on
  the recording's own bytes in the same three states — `absence-statement: the no-diagnostics surface line 1
  (no-diagnostics) … (claimed "the page emitted no diagnostic at all")`, `… the captured-nothing surface line
  1 (captured-nothing) … (claimed "the page ran clean")`, `… the joined surface line 1 (joined) … (claimed
  "the page had nothing else to say")` — which is the half the task says was missing, and each probe is
  asserted to be outside the old lexicon.
- ✅ AC2 — the shipped sentences all pass, including the negation that legitimately mentions emission:
  `✔ the shipped sentences pass, including the one that says a failed capture emits nothing (0.6313ms)` on the
  record side, and on the render side `pinShippedAbsenceSentencesPass` (`scripts/console-panel-render.test.mjs:2427-2470`)
  reads ten shipped sentences by name — the three states, `no-console-answer`, `no-finding`, `no-code`,
  `no-title`, `unreadable-finding`, `no-digest-entry` and `case-difference` — and then asserts that the
  `captured-nothing` sentence "must still say what a failed capture did" and "must still carry its denial", so
  the positive case cannot become vacuous. The old lexicon's own control is still refused at this head: `the
  control is still refused: absence-statement: … its clause "no diagnostic was emitted" asserts "emitted",
  which the read and the pane do not do`.
- ✅ AC3 — a pane-written sentence that merely describes what was read passes whatever its words: two
  constructed sentences the rule must accept are asserted in `scripts/console-panel-render.test.mjs:2446-2453`
  — `'no-diagnostics: no capture was handed to the join at all, so no capture was read and no finding is
  rendered'` and `'captured-nothing: a capture was read and carried no diagnostic, so the pane states that and
  no finding is rendered'` — through `assertAbsenceStatement` at `:2455`, inside the case that runs green at
  this head.
- ✅ AC4 — the rule is stated once and read by both suites, and the one thing that had to be duplicated is
  pinned against drift: the prose and the closed vocabulary live in the record
  (`research/raw/m045-console-panel.json` `contract.absenceStatement`, keys `rule`, `readSubjects`,
  `readActions`, `paneActions`, `placeholders`, `pageWords`, `denials`), the render suite reads it from there
  in `absenceRule()` (`scripts/console-panel-render.test.mjs:966`), the record suite reads it from
  `contract.absenceStatement` in `pinRecordedAbsenceStatement` (`scripts/console-panel-record.test.mjs:1309`,
  which also refuses a rule missing any of the seven keys), and the matcher block between
  `// >>> absence-statement-matcher` and `// <<< absence-statement-matcher` is extracted on both sides
  (`absenceMatcherSource`, render `:949-958`, record `:1125-1134`) and asserted equal — the passing test is
  `✔ the matcher here is the render suite's matcher, so the two suites cannot drift (0.9477ms)`, which also
  asserts the block really contains `function absenceBreaches(`.
- ✅ The rule is a property of the sentence and not a word list, and the record suite cannot bless what the
  render pins refuse: `absenceBreaches` (`scripts/console-panel-render.test.mjs:882`) splits a sentence into
  clauses, lets a denial introduce one, requires each remaining clause to take a thing the pane read as its
  subject and to state an action the read or the pane performs, and refuses the page outside a denial. The
  record side applies it to `cases[i].surface.lines`, skipping the `state:` line and the four carried labels,
  so an armed re-capture cannot write a page claim into the recording and pass.
- ✅ The declared `Verify` passes at the reviewed HEAD: `node --test scripts/console-panel-render.test.mjs
  scripts/console-panel-record.test.mjs` → `ℹ tests 78`, `ℹ suites 10`, `ℹ pass 78`, `ℹ fail 0` (the render
  suite's declaration counts are unchanged at 17 `it(` / 3 `describe(`, as the task states, because
  `research/raw/m057-verdict-claims.json` cites them); `npm run check:panel` → exit 0 with no diagnostic;
  `npx prettier --check scripts` → `Checking formatting...` / `All matched files use Prettier code style!`.
  The recording was not written by any run here — both suites ran unarmed and the record suite's byte pin
  reports `✔ a default run reads the recording and writes no byte (0.2862ms)`.

## Intent coverage

Wave 9 owns no success criterion, and this record states no `### SCn` heading for that reason: T014 declares
`Intent coverage: None` in its brief, so the wave's owned-criteria set is empty and a heading here would claim
a criterion the task's own contract does not carry. What the task holds is inside one criterion another wave
owns:

- ✅ yes — **SC5** ("The surface renders only what the capture states: no cause, no element, no fix, and no
  "angular" attribution that the message text does not carry.") is the criterion the property enforces at its
  hardest point: "renders only what the capture states" is exactly the clause subject rule the task shipped —
  each clause of a pane-written sentence must take a thing the pane read (`capture`, `answer`, `join`,
  `digest`, `message`, `finding`, `list`, `entry`, `state`, `code`, `title`, `reason`, `sentence`, …) as its
  subject and state an action the read or the pane performs, and the page is nameable only inside a denial
  (`research/raw/m045-console-panel.json` `contract.absenceStatement.rule`: "a sentence that takes the page,
  or an indeterminate standing where the page would be, as the subject of what happened is a claim about the
  page in whatever words it chooses"). The four reddenings quoted above are that rule biting in three states
  and in the `no-console-answer` sentence, against wordings no list carried. Wave 3's T003 and wave 12's T019
  own the criterion.
- no — **SC4** ("A page that captured nothing reports that it captured nothing, distinguished from a
  capture that produced diagnostics the digest has no entries for.") is *not* claimed by this wave, and the
  distinction matters: the property says what an absence sentence may state, not that the two absences are
  two different statements — that separation is T003's structure (two registry sentences, no finding listed
  beside either) and is measured by T003's and T004's pins, not here.
- no — **SC1, SC2 and SC3** are not touched by this wave. T014 changes no capture, no join and no finding
  field; its four declared files are two suites, the record's contract and the pane's docblock, and
  `git show b7e3a739 -- apps/angular-ai-devtools/src/app/panel-console.ts` shows no rendered line moved.
