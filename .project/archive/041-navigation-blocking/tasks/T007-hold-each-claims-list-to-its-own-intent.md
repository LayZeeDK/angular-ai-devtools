---
id: T007
title: Hold every verdict claim list to the intent of the milestone it rules
wave: 6
deps:
  - T004
status: done
agent: commandcode-coder
base: 36ae15069eac8a84479c9f19bbefc3306a265d5e
worktree: null
task_branch: null
files:
  - scripts/verdict-claims-intent.mjs
  - scripts/performance-capture.test.mjs
  - scripts/navigation-capture.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
---

# T007 — Hold every verdict claim list to the intent of the milestone it rules

## Context

A milestone's verdict claim list rules that milestone's own success criteria, and the suites that
check it read the criteria from an intent file. M040's suite reads the *live* one —
`const INTENT_PATH = join(ROOT, '.project', 'intent', 'INTENT.md')` at
`scripts/performance-capture.test.mjs:56` — and the live intent is now M041's. The project gate
therefore fails for every milestone after the one that wrote the claims, with a message that names
the drift rather than a missing file:

    AssertionError [ERR_ASSERTION]: Got unwanted exception.
    Actual message: "SC1 must quote the INTENT criterion character for character"

raised by `assertQuotesIntent` at `scripts/performance-capture.test.mjs:1909` inside the test at
`:1937`. Measured: `research/raw/m040-verdict-claims.json` matches
`.project/archive/040-performance-narrator/intent/INTENT.md` on 6 of 6 rows and the live
`.project/intent/INTENT.md` on 1 of 6, so the claims are correct and the binding is wrong.

`scripts/overlay-verdict-claims.test.mjs` already carries the rule this repair generalises: its
`intentPath` reads the archive when the milestone has been archived and `.project/intent` when it has
not, and its own doc comment states the property — "a finished milestone keeps resolving against its
own criteria and a new one is never checked against a finished milestone's list" (`:17-22`). Two
suites implement the rule by hand and one of them is wrong. `scripts/navigation-capture.test.mjs`
carries the correct constant today and would go wrong the same way the moment M041 is archived and a
later milestone takes the live intent, because a constant cannot know which milestone it belongs to.

The repair is one resolver, imported by all three suites, that answers the intent *belonging to a
milestone*: the archive's copy when that milestone is archived, the live intent when the project's
own bound branch names that milestone, and a refusal naming both absolute paths otherwise. Nothing
here re-cuts a claim list, an assertion or a criterion — the claims were already right, and the file
that holds them is not edited.

What the resolver must not become is a fallback. A resolver that quietly read the live intent for an
archived milestone would pass M040's suite while holding its claims to M041's words, which is the
same defect with the symptom removed; and a resolver that quietly read the newest archive would hold
M041's claims to M040's criteria. Both directions are failures that name the paths they tried.

## Approach

One resolver, three importers, and a proof in each direction.

- `scripts/verdict-claims-intent.mjs` exports the rule and nothing else. It takes the repository root
  and a milestone token (`M040`, `040` or `41` all mean the same milestone) and answers the absolute
  path of the intent that milestone's claims must be held to. The archive wins when
  `.project/archive/<number>-<slug>/intent/INTENT.md` exists — the highest-numbered match, the way
  the overlay suite already selects it. The live intent answers only when `STATE.md`'s bound branch
  names that same milestone, which is what makes "the live intent" mean "this milestone's intent"
  rather than "whoever is current". Everything else raises, and the message names every path it
  looked for and the milestone it was asked about, so a wrong binding is a failure with an address.
- Point the three suites at it. `scripts/performance-capture.test.mjs` holds `M040`'s claims, so its
  constant becomes a call for `040`; `scripts/navigation-capture.test.mjs` holds `M041`'s, so its
  constant becomes a call for `041`; `scripts/overlay-verdict-claims.test.mjs` deletes its private
  `intentPath` and imports the shared one. No suite keeps a `.project/intent/INTENT.md` literal.
- Keep every existing assertion standing. The quote pin, the one-character drift mutant, the invented
  `SC99` row, the required-row rules and the overlay suite's synthetic recording all run unchanged;
  the repair changes where the criteria come from, never what is required of a row.
- Prove the binding non-vacuously in both directions. M040's quotes must fail against the live intent
  and pass against `040`'s own; M041's must pass against the live one now and must be answered by the
  archive once it exists, which is asserted by asking the resolver for `040` (archived, archive
  answer) and `041` (live, live answer) and by asking for a milestone that is neither (a refusal with
  the paths in it). A resolver that always answered the live file, or always the newest archive,
  fails one of those three.

## Interface contract

- Intent resolver: `intentPathForMilestone(root, milestone)` answers the absolute path of the intent that milestone's verdict claims are held to — the milestone's own intent under `.project/archive/` when it is archived, `.project/intent/INTENT.md` when the bound branch in `.project/STATE.md` names that milestone, and otherwise a raised error whose message names the milestone and every candidate path it tried; the milestone token may be written `M040`, `040` or `40`, and a token naming no milestone is the same refusal.

## Intent coverage

- SC6

## Acceptance criteria

1. M040's claims are held to M040's criteria: the test at `scripts/performance-capture.test.mjs:1937` passes with all six rows quoting `.project/archive/040-performance-narrator/intent/INTENT.md` character for character, and the Log quotes the assertion that failed before the repair (`SC1 must quote the INTENT criterion character for character`).
2. M041's claims are held to M041's criteria: `scripts/navigation-capture.test.mjs` resolves the intent by the milestone its claims file names — the live `.project/intent/INTENT.md` while M041 is unarchived, and `.project/archive/041-*/intent/INTENT.md` once that archive exists — and its claim-quote test passes in whichever state the head is in.
3. One rule with one implementation: `scripts/verdict-claims-intent.mjs` is the only place the archive-or-live decision is written, all three claims suites import it, and no suite carries a `.project/intent/INTENT.md` constant of its own.
4. The resolver refuses rather than falls back: an archived milestone with no archive intent raises, a live intent answers only for the milestone `STATE.md`'s branch binds, and a milestone that is neither archived nor bound raises — each message naming the milestone and every absolute path it tried.
5. `scripts/overlay-verdict-claims.test.mjs` keeps its force through the shared resolver: it still resolves the current milestone from `STATE.md`, still reads the archive for an archived milestone, and its missing-list refusal, required-row rules and synthetic-recording cases all still run.
6. Both directions are proven non-vacuously with the failing assertions quoted in the Log: M040's quotes redden when the resolver is pointed at the live intent, naming SC1, and a request for a milestone that is neither archived nor bound raises the resolver's own refusal rather than returning a path.
7. The rule is applied to every claims suite in the tree: a search of the suites finds no remaining live-intent constant outside the resolver, and the Log names, per claims file, the intent that file is now held to.
8. `npm run check` passes and the three claims suites are green together at this head.

## Verify

```bash
node --check scripts/verdict-claims-intent.mjs && node --check scripts/performance-capture.test.mjs && node --check scripts/navigation-capture.test.mjs && node --check scripts/overlay-verdict-claims.test.mjs && node --experimental-strip-types --test "scripts/performance-capture.test.mjs" "scripts/navigation-capture.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/verdict-claims-intent.mjs scripts/performance-capture.test.mjs scripts/navigation-capture.test.mjs scripts/overlay-verdict-claims.test.mjs && npm run check
```

## Log

- pending
- T007 adds `scripts/verdict-claims-intent.mjs`, the one place the archive-or-live decision is written, and it exports `intentPathForMilestone(root, milestone)` and nothing else. The contract is three rules with no fallback between them: (1) an archived milestone resolves to `.project/archive/<number>-<slug>/intent/INTENT.md`, the highest-numbered match the way `overlay-verdict-claims.test.mjs` already selected it, and an archive that carries no `intent/INTENT.md` raises instead of reading the live file; (2) the live `.project/intent/INTENT.md` answers only for the milestone `.project/STATE.md`'s `branch:` line binds (`branch: gsd-path/M041` today), so "the live intent" means "this milestone's intent" rather than "whoever is current"; (3) everything else raises, naming the milestone and every path it tried - the archive path with the slug it matched (or the `<number>-<slug>` pattern when nothing matched) and the live path, annotated with the milestone it belongs to or with the fact that it is absent. The token may be written `M040`, `040` or `40` (any `M?<digits>`, zero-padded to three), and a token that names no milestone is the same refusal, opening with `a milestone token is M040, 040 or 40`.
- The defect, measured before the repair at base 36ae150: `node --experimental-strip-types --test "scripts/performance-capture.test.mjs"` printed `ℹ tests 14 / i pass 13 / i fail 1`, the failure at `test at scripts\performance-capture.test.mjs:1937:1` reading `AssertionError [ERR_ASSERTION]: Got unwanted exception. Actual message: "SC1 must quote the INTENT criterion character for character"` and raised by `assertQuotesIntent (file:///D:/projects/sandbox/angular-ai-devtools/scripts/performance-capture.test.mjs:1909:7)` from `:1945:29`. The cause was the constant at `:56`, `const INTENT_PATH = join(ROOT, '.project', 'intent', 'INTENT.md')`: `research/raw/m040-verdict-claims.json` quotes `.project/archive/040-performance-narrator/intent/INTENT.md` on 6 of 6 rows and the live intent on 1 of 6, so the claims were right and the binding was wrong. After the repair the same suite prints `ℹ tests 14 / i pass 14 / i fail 0`, and in the three suites together `ℹ tests 40 / i pass 40 / i fail 0`.
- Per claims file, the intent it is now held to (AC7): `scripts/performance-capture.test.mjs` (M040, `research/raw/m040-verdict-claims.json`) reads `.project/archive/040-performance-narrator/intent/INTENT.md`, because `intentPathForMilestone(ROOT, 'M040')` answers the archive's copy 6/6; `scripts/navigation-capture.test.mjs` (M041, `research/raw/m041-verdict-claims.json`) reads `.project/intent/INTENT.md`, because M041 is the milestone `.project/STATE.md` binds, and the same call follows to `.project/archive/041-*/intent/INTENT.md` with no edit once that archive exists; `scripts/overlay-verdict-claims.test.mjs` (whichever `research/raw/mNNN-verdict-claims.json` is highest-numbered - `m041` today) reads the same live intent, now decided by the shared resolver rather than by its private `intentPath`. M041's binding is proven, not assumed: `intentPathForMilestone(ROOT, token)` answers the live path for `M041`, `041` and `41`, that path is the file its six rows quote, and `assertClaims` passes against it.
- One rule, one implementation: `INTENT_PATH` and `INTENT_REL` are gone from `scripts/performance-capture.test.mjs` and `scripts/navigation-capture.test.mjs`, `intentPath` is gone from `scripts/overlay-verdict-claims.test.mjs`, and all three import `./verdict-claims-intent.mjs`. A new check, `no claims suite decides the archive-or-live question for itself` in `scripts/navigation-capture.test.mjs`, reads all three suite files and requires four things of each: the resolver import, an `intentCriteria(...)` call fed by `intentPathForMilestone(...)` (so the criteria a claim list is held to come from the resolver), no `INTENT_PATH`/`INTENT_REL`/`function intentPath(` shape, and no `intent/INTENT.md` literal. Measured against the pre-repair bytes at 36ae150 the same four rules redden all three files, each naming what it carried: `performance-capture.test.mjs` -> `must import the shared resolver rather than decide for itself | must read its criteria from the shared resolver | carries "INTENT_PATH" again`; `overlay-verdict-claims.test.mjs` -> `... | carries "function intentPath(" again`; `navigation-capture.test.mjs` -> `... | carries "INTENT_PATH" again | carries "INTENT_REL" again | spells the live intent as "intent/INTENT.md"`.
- Mutants, every one run against the real files and red with the defect named by string. M040 held to the live intent (new test `the claims are M040`s own: held to the live intent they redden naming SC1`, which first asserts the resolver's answer is not the live path): `SC1 must quote the INTENT criterion character for character`. A one-character drift in a quoted criterion (existing mutant, unmodified): `SC2 does not quote the INTENT criterion character for character: the quote and the intent agree for N character(s)`. A row citing an invented criterion (existing mutant, unmodified): `SC99 is not a criterion the intent declares`. A resolver that falls back to the live intent when an archive carries no intent (new, on a scratch root under `tmp/m041-intent-scratch` holding `.project/archive/040-missing-intent/` with no intent file, a copied `STATE.md` binding M041 and a copied live intent): `M040 must raise rather than answer: a resolver that fell back returned D:\projects\sandbox\angular-ai-devtools\tmp\m041-intent-scratch\.project\intent\INTENT.md, which holds M040's claims to M041's words` - and the fallback is shown to be reachable first, so the refusal is the only thing that stops it; the refusal it raises names both paths. A milestone that is neither archived nor bound (`M042` on the same root): `M042 must raise rather than answer: ...` with `belongs to M041` in the raised message. A token that names no milestone: `a milestone token is M040, 040 or 40`. A resolver that returns a path it never checked: `heldTo(unchecked(ROOT, '041'), CLAIMS_PATH)` reddens `is missing - the resolved intent`, and `heldTo` is the same function that proves the resolver's real answers are the files their claim lists quote.
- Red-then-green on the resolver file itself, not only in-process. Mutant A - `return live;` inserted as the archive-missing branch - made the suite print `ℹ pass 14 / i fail 1` with `AssertionError [ERR_ASSERTION]: M040 must raise rather than answer: a resolver that fell back returned D:\projects\sandbox\angular-ai-devtools\tmp\m041-intent-scratch\.project\intent\INTENT.md, which holds M040's claims to M041's words`. Mutant B - the archive branch answering `join(archives, slug, 'INTENT.md')`, a path it never checked - made it print `ℹ pass 13 / i fail 2` with `Error: .project/archive/040-performance-narrator/INTENT.md is missing - the resolved intent`. `scripts/verdict-claims-intent.mjs` was restored byte-identically after each run: sha256 `b852c8f0aa08ff7a56debbb9a176f11b9ad9814a2a78fa7d5cfd684a83e189d0`, 5,031 bytes, identical before, between and after the two mutants.
- No criterion text, claim list or assertion was re-cut: `research/raw/m040-verdict-claims.json` and `research/raw/m041-verdict-claims.json` are untouched and byte-identical to their landed state, both suites still run their quote pin, one-character-drift mutant, invented `SC99` row and required-row rules unchanged, and the overlay suite still resolves the current milestone from `STATE.md`, still reads the archive for an archived milestone, and still runs its missing-list refusal, required-row rules and synthetic-recording cases. The task's Verify passed verbatim at this head: `node --check` on all four files, `node --experimental-strip-types --test` over the three claims suites (`ℹ tests 40 / i pass 40 / i fail 0`), `npx prettier --check` on all four (`All matched files use Prettier code style!`) and `npm run check` through every stage, ending `verification gate (structure): pass` and a clean `prettier --check .`. ready
