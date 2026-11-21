# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 0
Reviewed HEAD: 5b71032601c15f0a830f365c350c46262b63326b

## Wave 5 — held open by the repair wave

This wave has no task, and the review reviews exactly that: zero tasks, zero `## T…` headings,
nothing landed, nothing to verify. The plan holds the number open for contiguity after the repair
split — the measured statement is the plan's own Goal paragraph, read at the reviewed head with its
line numbers:

```
349: ## Wave 5 — held open by the repair wave
350:
351: Goal: this wave has no task. The recovery measured the project verify red at its base — 1858 pass,
352: 6 fail across four suites, each failure caused by state no M058 task owns — and that repair is a
353: wave of its own that must land before the recordings are re-derived and the verify runs, so the
354: wave that carried this work moves behind the repair as wave 7 and takes this wave's goal, review
355: depth and task paragraph with it. The number stays so the plan's waves stay contiguous.
356:
357: Review depth: full
```

(`.project/plan/PLAN.md:349-357` — the whole `## Wave 5` section; there is nothing between `Review
depth: full` at `:357` and `## Wave 6` at `:359`.)

Where the work actually went, measured against the guard: `lars-gsd.bat build-guard --repo
D:\projects\sandbox\angular-ai-devtools` printed `missing wave reviews: wave-5, wave-7` before this
file was written — the repair split's two moves are visible right there. T005 (the stale-citation
repair) is wave 4's one task, reviewed and passed at `.project/review/wave-4.cycle1.md` (heading
`## T005 — Repair the stale citation in the surface record: pass`, verdict pass at the same
reviewed head `5b71032601c15f0a830f365c350c46262b63326b`); T004 (the three recordings) moved behind
the repair into wave 7 (`## Wave 7 — the records, the gate and the project verify`,
`.project/plan/PLAN.md:429`), whose review does not exist yet and is not this review's to write.
The task files carry the split as fields, not prose: `wave: 4` on
`.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:4`, and `wave: 8` on
`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:4` for the wave that kept
its number.

The wave list the linter measures at this head, so the contiguity claim is the tool's and not the
review's:

```
gsd plan-lint — D:\projects\sandbox\angular-ai-devtools
plan: D:\projects\sandbox\angular-ai-devtools\.project\plan\PLAN.md
tasks: 9  waves: 1, 2, 3, 4, 5, 6, 7, 8

warns (6)
  [path-not-declared] T004: `scripts/panel-routes.test.mjs` is named in Approach/Acceptance but is not in files
  [path-not-declared] T004: `scripts/copy-check.test.mjs` is named in Approach/Acceptance but is not in files
  [path-not-declared] T004: `scripts/component-search.test.mjs` is named in Approach/Acceptance but is not in files
  [path-not-declared] T005: `apps/angular-ai-devtools/src/app/panel-demo.ts` is named in Approach/Acceptance but is not in files
  [path-not-declared] T005: `apps/angular-ai-devtools/src/app/panel-demo.ts` is named in Approach/Acceptance but is not in files
  [path-not-declared] T005: `extension/panel/index.html` is named in Approach/Acceptance but is not in files

infos (1)
  [plan-shape] PLAN.md: 8 waves: consider merging waves that add neither parallelism nor risk isolation

result: OK (0 blockers, 6 warnings, 1 info)
```

(`C:\Users\LarsGyrupBrinkNielse\.commandcode\lars-gsd.bat plan-lint --repo
D:\projects\sandbox\angular-ai-devtools`, exit 0.) The lint counts nine tasks over waves 1–8 with
wave 5 empty — the numbering is contiguous and the empty wave is countable, which is what the guard
wants an artifact for. The six `path-not-declared` warnings and the `[plan-shape]` info belong to
other sections of the plan and are recorded below (FINDING 1 covers the shape info; the
path-not-declared warnings are pre-existing at every prior review's head and none names wave 5).

Verdict: pass — an empty wave reviewed empty. Nothing was invented to fill it: no `## T…` heading
is written here because the wave's task count is zero and `review-check` requires the headings to
match that count.

## Intent coverage

Wave 5 owns no criterion and advances no SCn section, and the omission is the statement: the wave
carries no task, so there is no task to own one. The plan's `## Intent coverage` table names no row
for wave 5 — every row names a task, and wave 5 has none — and the plan says the coverage moved
with the work: the wave that carried it "moves behind the repair as wave 7 and takes this wave's
goal, review depth and task paragraph with it" (`.project/plan/PLAN.md:354-355`). The precedent is
T005, whose equivalent situation the wave-4 review states plainly: "T005 owns no criterion and
advances no SCn section here" (`.project/review/wave-4.cycle1.md:97-101`). No `### SCn` headings
appear under this section because no criterion exists for an empty wave to cover; the criteria the
moved tasks own stay with those tasks in their own waves' reviews (T005's coverage is recorded in
`.project/review/wave-4.cycle1.md`, T004's will be in wave 7's).

## FINDING 1 — an empty wave kept only for contiguous numbering reads oddly, and the linter says so

`lars-gsd.bat plan-lint` emits `[plan-shape] PLAN.md: 8 waves: consider merging waves that add
neither parallelism nor risk isolation` (info class) at this head, and the oddity is real: wave 5
exists only because renumbering waves 7–8 was refused when the repair split moved T005 into wave 4
and T004 into wave 7 (`.project/plan/PLAN.md:351-355`). A reader of the plan meets an eight-wave
list whose fifth member is a paragraph explaining its own emptiness — eight waves for nine tasks,
one of them a placeholder.

Severity: low. It is an info-class lint, not a blocker and not a warning; the plan parses, the
guard accepts the empty wave once this review exists, and no behavior anywhere depends on the
numbering being dense.

Recommendation: merge after the milestone, not now. The change itself is small — delete the
`## Wave 5` section, renumber waves 7→5 and 8→6, and the plan reads seven waves for nine tasks —
but doing it mid-milestone invalidates a trail of already-written records for zero behavior change:

- `.project/review/wave-6.cycle1.md` and `.project/review/wave-8.cycle1.md` change names (to
  wave-5/wave-6, colliding with this file) and every wave number inside them;
- nine task files carry a `wave:` field (e.g. `.project/tasks/T005-…md:4` reads `wave: 4`,
  `.project/tasks/T009-…md:4` reads `wave: 8`) and every one would need editing together with the
  plan or the fields and the plan would disagree;
- the plan's own cross-references — wave 4's "T004 returns to its three recordings in wave 5"
  (`.project/plan/PLAN.md:328`, itself already one edit behind the split) and wave 5's "moves
  behind the repair as wave 7" (`:354`) — would need rewriting in the same stroke;
- the four existing wave reviews (1, 2, 3, 4) quote wave numbers throughout, and this file and
  wave-7's pending review would too.

None of that is pinned by a suite — a grep of `scripts/*.mjs` for the plan's wave structure finds
only historical prose from earlier milestones naming their own waves, and no test reads
`.project/plan/PLAN.md`'s wave headings — so the cost is purely editorial churn over live review
records. At milestone close, when the plan archives, the merge is one commit over a frozen record
and the lint info disappears from every later milestone's plan-lint run. Until then: leave it, and
let this review be the artifact that makes the empty wave countable.
