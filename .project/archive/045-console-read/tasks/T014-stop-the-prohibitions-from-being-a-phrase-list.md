---
id: T014
title: Stop the prohibitions from being a phrase list
wave: 9
deps:
  - T009
  - T012
status: done
agent: build_T014
base: 4a4aed364342d3a6cc67358b5afc1a4aaf759d27
worktree: null
task_branch: null
files:
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
  - apps/angular-ai-devtools/src/app/panel-console.ts
---

# T014 — Stop the prohibitions from being a phrase list

## Context

Wave 3's cycle-3 review found the silence rule is a five-pattern lexicon rather than a rule about the
shape of the sentence. Rewording the `no-diagnostics` state to "the page emitted no diagnostic at all"
leaves every silence pin green, and an armed re-capture blesses it. "the page reported nothing at all"
reddens, so the boundary is the word list and not a dead check — which is how a prohibition quietly stops
prohibiting.

The record suite carries no silence rule at all, so a recording can bless the same sentence even if the
render suite were repaired.

## Approach

- - Replace the phrase list with a property of the sentence: an absence statement may say what was read and
  what it means for the panel, and may never assert what the page did instead — no claim about the page
  emitting, reporting, logging or being silent, in whatever words.
- Apply the same property in the record suite, so a recording cannot bless what the render pins refuse.
- Keep the existing positives working: all three shipped state sentences and the named absences must pass,
  including the one that legitimately says a capture whose own attempt failed also emits nothing.
- Prove it with sentences the lexicon would have missed, in more than one wording, for more than one state.

## Acceptance criteria

1. A claim about the page's own behaviour — emitting, reporting, logging or being silent — reddens in every state and in the record suite, in at least three different wordings, none of which the old lexicon matched.
2. The shipped sentences all pass, including the negation that legitimately mentions emission, so the rule distinguishes a claim from its denial.
3. A pane-written sentence that merely describes what was read passes.
4. The rule is stated once and read by both suites rather than duplicated, or its duplication is pinned by a test that fails when the two drift.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check scripts
```

## Log

- Task written at the third repair cycle; not started.

### T014 — the five-pattern lexicon replaced by a property of the sentence

Head `4a4aed36`, branch `gsd-path/M057`, in place, no branch and no commit. Four files touched, all
declared; `git status --short` shows only them plus this task file's own orchestrator preamble
(`status`/`agent`/`base`/`worktree`), which was already modified when the task started.

**The property, as stated in code.** `research/raw/m045-console-panel.json` now carries
`contract.absenceStatement` — the rule in prose plus its closed vocabulary — written from
`ABSENCE_STATEMENT` in `scripts/console-panel-record.test.mjs` and read by *both* suites
(`absenceRule()` in the render suite reads the record; the record suite reads `recorded().contract`).
The rule: an absence statement says what was read and what that means for the panel, and never what
the page did. Concretely, in `absenceBreaches` (the matcher, copied verbatim into both suites between
`// >>> absence-statement-matcher` / `// <<< absence-statement-matcher` and pinned byte-identical by a
drift test in each):

- a sentence is split into clauses at punctuation and at `so`/`and`/`but`/`then`/`because`/`yet`/`while`,
  with a leading conjunction dropped;
- a clause a denial introduces (`never`, `not`, `nor`, `cannot`, `without`, the contractions) is the
  pane saying what it did *not* find, and may name the page — `never that the page was silent` passes;
- the page (`page`, `app`, `application`, `browser`, `tab`, `window`, `site`, `document`, `dom`,
  `framework`, `angular`) may otherwise appear only where a denial earlier in the same clause governs
  it; `the page emitted no diagnostic at all` is a claim whichever verb follows;
- each clause must take as its subject a thing the pane read (`capture`, `answer`, `join`, `digest`,
  `message`, `finding`, `list`, `entry`, `state`, `diagnostic`, `code`, `title`, `reason`, `sentence`,
  `line`, `statement`, `pane`, `panel`, `surface`), or elide it and inherit the clause before;
- an indeterminate (`nothing`, `none`, `it`, `this`, `that`) stands only where the clause states one of
  the pane's own acts of rendering; `there …` never stands, because an existential states how the
  world is, not what was read;
- the clause's verb (the participle where an auxiliary governs one) must be an action the read or the
  pane performs, so `no diagnostic was emitted` is refused where `no capture was read` passes.

No list of the page's verbs is consulted, because that list cannot be closed; the whitelist is closed
because the read and this pane are finite. The failure text names the surface (or the sentence) it was
written in *and* the offending phrase, e.g.

```
absence-statement: the no-diagnostics surface says what was read and what it means for the panel, and
never what the page did — it names the page ("page") outside a denial; it rendered "the page emitted no
diagnostic at all, so no capture was handed to the join" (claimed "the page emitted no diagnostic at
all")
```

**Wordings the old lexicon missed, each reddening and naming the state and the phrase** (the suites
also assert that none of the five old patterns matches the probe, so these are not the old check under
a new name):

1. `no-diagnostics: the page emitted no diagnostic at all, so no capture was handed to the join` →
   `absence-statement: the no-diagnostics surface … (claimed "the page emitted no diagnostic at all")`
   — render suite exit 1, 21 pass / 15 fail; armed re-capture exit 1, 30 pass / 3 fail.
2. `captured-nothing: the page ran clean, so a capture was read and carried no diagnostic` →
   `… the captured-nothing surface … (claimed "the page ran clean")` — exit 1, 19 pass / 17 fail.
3. `joined: the capture held at least one diagnostic, and the page had nothing else to say` →
   `… the joined surface … (claimed "the page had nothing else to say")` — exit 1, 22 pass / 14 fail.
   (A fourth, `the browser had nothing to say` in the `no-console-answer` sentence, is proven in the
   render suite's rule test as well.)
   The old lexicon's own control, `the page reported nothing at all`, and the three claims it did
   match (`the page was silent`, `the page logged nothing`) still redden.

**Positives still passing.** Every shipped sentence is read by name on every run: `joined`,
`captured-nothing` (including "a capture whose own attempt failed also emits nothing" — the capture is
the subject, so it is a statement about the read, and `never that the page was silent` is the denial
that lets the page be named), `no-diagnostics`, `no-console-answer`, `no-finding`, `no-code`,
`no-title`, `unreadable-finding` (whose `nothing is filled in for it` passes because `nothing` is an
indeterminate and `filled` is the pane's own act) and `no-digest-entry`; plus two pane-written
sentences that merely describe what was read, and the denial "this is never a claim that the page
emitted nothing". The record's `captured-nothing` and `no-diagnostics` lines are held to the same rule
on the recording's own bytes.

**The record suite now carries the rule.** `pinRecordedAbsenceStatement` reads
`cases[i].surface.lines`, skips the `state:` line and the four carried labels, and applies the rule to
every other line, so a re-capture cannot bless what the render pins refuse — armed proof below. Three
in-memory probes on the `no-diagnostics`, `captured-nothing` and `joined` recorded cases redden, each
naming the state and the phrase, and each asserted to be outside the old five patterns. `state` lines
are skipped because they are the answer's word, pinned elsewhere.

**Duplicate or single?** Stated once: the rule's prose and vocabulary live in the record's contract
and both suites read them there. The matcher is necessarily duplicated (no fifth file may be created),
so it is pinned: `absenceMatcherSource` extracts the marked block at line starts and each suite asserts
it equals the other's, plus that the block really contains `absenceBreaches`. Armed proof: changing
`/(?:ed|en|ing)$/` to `/(?:ed|ing)$/` in the record suite's copy reddens the render suite at exit 1
with `the absence-statement matcher must be the same code in both suites, or the two can drift`.

**Mutants armed, restored, sha256 before/after identical.**

| armed defect | suite | exit | failing line (abridged) | sha256 before = after |
| --- | --- | --- | --- | --- |
| `no-diagnostics` → "the page emitted no diagnostic at all" | render | 1 | `absence-statement: the no-diagnostics surface … (claimed "the page emitted no diagnostic at all")` | pane `22785632…` |
| `captured-nothing` → "the page ran clean" | render | 1 | `absence-statement: the captured-nothing surface … (claimed "the page ran clean")` | pane `22785632…` |
| `joined` → "the page had nothing else to say" | render | 1 | `absence-statement: the joined surface … (claimed "the page had nothing else to say")` | pane `22785632…` |
| the recording's `no-diagnostics` line reworded to the claim | record | 1 | `absence-statement: the no-diagnostics surface line 1 (no-diagnostics) … (claimed "the page emitted no diagnostic at all")` | record `6db94179…` |
| drift in the record suite's matcher | render | 1 | `the absence-statement matcher must be the same code in both suites, or the two can drift` | record suite `391ace70…` |

Each file was written back from its own bytes and re-hashed: `restored : true` in all five cycles.

**The recording is idempotent and can no longer be blessed.** Record sha256 sequence:
`6db94179…` (canonical) — unarmed run → `6db94179…`, exit 0 (byte-identical); pane reworded to the
claim, armed run → `6db94179…` → `e060dcf2c12107b28030c221f0b4c11cf15b5d920b8d528efab4cc47dd5a9ed9`,
exit 1, 30 pass / 3 fail naming the claim (the write happened *and* was refused); second armed run at
the same head → `e060dcf2…` unchanged, exit 1; pane restored, armed run → back to `6db94179…`, exit 0.
The first armed run at this head wrote the new contract once (`f311a458…` → `6db94179…`).

**Sibling wording list untouched.** `contract.prohibitedWording` still carries all sixteen entries —
`cause, because, due to, since, element, component, dom, node, remedy, fix, solution, repair, angular,
framework, count, number` — and the record suite now asserts they are still there. The property does
not replace that rule and nothing was deleted from it. It does *subsume* two of its words where they
are the subject of a clause: `the framework reported nothing` and `angular reported nothing` are
refused as page words outside a denial as well as by the wording list. `since`, `dom`, `node`,
`solution`, `repair`, `number` and `count` are never consulted by the property, and `fix` is still
enforced where it was.

**Verify (`## Verify`, run exactly):** `node --test scripts/console-panel-render.test.mjs
scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check scripts` →
`VERIFY-EXIT=0`; `ℹ tests 70 / ℹ pass 70 / ℹ fail 0 / ℹ skipped 0`; `check:panel` printed no diagnostic;
`All matched files use Prettier code style!`. The render suite's test and group counts are unchanged
(17 / 3) because `research/raw/m057-verdict-claims.json` — not in this task's files — cites them, so
the new rule proofs run inside the existing `E7/SC4` test rather than as new declarations.

**Hashes of the four declared files.**

| file | before | after |
| --- | --- | --- |
| `scripts/console-panel-render.test.mjs` | `8f83d362…` | `e071edae…` |
| `scripts/console-panel-record.test.mjs` | `86c894d0…` | `391ace70…` |
| `research/raw/m045-console-panel.json` | `f311a458…` | `6db94179…` |
| `apps/angular-ai-devtools/src/app/panel-console.ts` | `36235d2a…` | `22785632…` |

The pane's sentences are unchanged; only its docblock states the property now.

ready
