# PLAN — M046 copy-to-agent

## Config

Project verify: `npm run check && npm test`

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
|-----------|------|------|
| SC1 | 1, 2, 3 | T001, T003, T004 |
| SC2 | 3 | T004 |
| SC3 | 3 | T005 |
| SC4 | 1, 2 | T001, T002 |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC3 | T005 | AC1 |
| SC4 | T002 | AC1 |
| SC4 | T006 | AC1 |

## Prohibitions

| Prohibition | Task | Enforcement |
|-------------|------|-------------|
| N1 | T004 | the hand-off reads the pane's rendered text; a mutant that recomposes from the record reddens the pin |
| N2 | T004 | an absence is carried as the pane states it, proven by the state that renders `cannot-tell` |
| N3 | T005 | the `cannot-tell` reason vocabulary is a closed set, and an invented cause is a red test |
| N4 | T002, T006 | a correction quotes the kind of the claim it fixes and never widens one; an `unverifiable` row is left alone |
| N5 | T004 | the hand-off adds no DOM to an inspected page; every control lives in the panel |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |

The intent marks no edge held-out, so this milestone runs no held-out check. The read-only proof the milestone
owes is the measurement T001 records and the project verify T007 runs; a held-out row would claim a guarantee the
intent does not declare.

## Surface contract

### panel — T004

Entry: the panel route `console-read`, rendered through the `console-read` key in `panel-demo.ts` `LOADERS`.

States: `handed-over` — the pane's own text is what is sent; `absence-carried` — a finding with a named absence
is handed over with it; `cannot-tell` — the finding cannot be expressed as a question and the reason is stated.

The surface writes its own sentences: it never names a cause, element, remedy or rule identity that the finding
does not state.

## Wave 1 — measure what the pane renders and what a copy path composes today

Review depth: full

T001 reads the rendered finding for two subjects and records, at `path:line`, what each existing copy path
composes. It does not build anything. The measurement decides whether SC1 is new behaviour or a repair, and the
record it writes is what T003 and T004 are held to.

## Wave 2 — make the two skill trees agree again

Review depth: full

T002 mirrors `.claude/skills/control-angular-dev-app` and `.claude/skills/control-pangular-inspector` onto their
maintained `.commandcode` copies and restores `scripts/text.mjs` where it is missing. The mirror is proven by hash
and by the suite that already reads both trees.

## Wave 3 — hand the rendered finding over and state what was sent

Review depth: full

T003 builds the join: the pane's rendered text becomes the hand-off, and the control names what it will send before
it sends. T004 renders the three states and pins the routes and demo loader they add. T005 gives `cannot-tell` its
closed reason set and proves an invented cause reddens.

## Wave 4 — the corrections the inspection ruled `fix-doc`

Review depth: full

T006 corrects the citations this milestone's inspection measured — `AGENTS.md:64`, `monitor-ci/SKILL.md:313`,
`references/ai-browsers-verification.md:253`, `capability-dependency-matrix.md:214` — and retires the moved-path
claims in the four `research/` and `spikes/` documents, plus the backlog's dead `M018` gate and `M040 build/active`
lines. Each correction is proven by the pin that reads the corrected artefact.

## Wave 5 — record the surface and run the project verify

Review depth: full

T007 records the surface and runs the project verify (`npm run check && npm test`) at the head it ships, so a red
build cannot reach ship.
