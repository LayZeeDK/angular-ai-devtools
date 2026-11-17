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
| SC4 | T001 | AC1 |
| SC4 | T002 | AC1 |
| SC1 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC2 | T004 | AC1 |
| SC3 | T005 | AC1 |
| SC4 | T006 | AC1 |
| SC1 | T007 | AC1 |

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

The intent marks no edge held-out, and SC4 owns three edges held by different suites, so no single edge can be marked held-out without making SC4 illegal. `scripts/navigation-blocking.test.mjs:3521` requires a live row to exercise. This milestone therefore runs no held-out check, that one test is red for a reason recorded here, and the fix belongs in the test: it should exercise a fixture plan rather than the live one.

E5 is held-out: T006's purpose is that a corrected citation is asserted by the pin that reads it, so the row names the suite and the task's criteria name the edge.
## Surface contract

### panel — T004

Entry: the panel route `console-read`, rendered through the `console-read` key in `panel-demo.ts` `LOADERS`.

States: `handed-over` — the pane's own text is what is sent; `absence-carried` — a finding with a named absence
is handed over with it; `cannot-tell` — the finding cannot be expressed as a question and the reason is stated.

The surface writes its own sentences: it never names a cause, element, remedy or rule identity that the finding
does not state.

Walkthrough:
1. Open the panel at route `console-read` with a finding selected; the surface states the text it will send, and that text is the pane's own rendering.
2. Send the hand-off; the surface states what was sent and names no cause, element or remedy beyond it.
3. Select a finding that carries an absence; the surface hands it over with the absence stated rather than filling it in.
4. Select a finding that carries a named absence; the surface carries it over rather than filling it in.

Criteria: SC1, SC2


## Wave 1 — measure what the pane renders and what a copy path composes today

Goal: the pane's rendered text and a copy path's composed text are measured and published as one record, so the hand-off is written against what the panel actually draws rather than against the roadmap's sentence.

Review depth: full

T001 reads the rendered finding for two subjects and records, at `path:line`, what each existing copy path
composes. It does not build anything. The measurement decides whether SC1 is new behaviour or a repair, and the
record it writes is what T003 and T004 are held to.

## Wave 2 — remove the second skill tree

Goal: the `.claude` mirror is gone and the rule that maintained it retired, so `.commandcode` is the single source for every skill and no citation can name a stale copy.

Review depth: full

T002 deletes `.claude/` and retires every rule that existed to keep it in step: the mirror suite, the mirror clause
in the skill linter, and the `AGENTS.md` instruction to copy a changed skill across. Proof is a tree with no
`.claude` path and a linter that resolves only `.commandcode`.

## Wave 3 — hand the rendered finding over and state what was sent

Goal: a finding is handed to the agent as the text the pane drew, through a control that names what it will send before it sends it.

Review depth: full

T003 builds the join: the pane's rendered text becomes the hand-off, and the control names what it will send before
it sends. T004 renders the three states and pins the routes and demo loader they add. T005 gives `cannot-tell` its
closed reason set and proves an invented cause reddens.

## Wave 4 — the corrections the inspection ruled `fix-doc`

Goal: `cannot-tell` has a closed reason set, and the citations this milestone's inspection measured are corrected at the files they name.

Review depth: full

T006 corrects the citations this milestone's inspection measured — `AGENTS.md:64`, `monitor-ci/SKILL.md:313`,
`references/ai-browsers-verification.md:253`, `capability-dependency-matrix.md:214` — and retires the moved-path
claims in the four `research/` and `spikes/` documents, plus the backlog's dead `M018` gate and `M040 build/active`
lines. Each correction is proven by the pin that reads the corrected artefact.

## Wave 5 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships, so a red build cannot reach ship.

Review depth: full

T007 records the surface and runs the project verify (`npm run check && npm test`) at the head it ships, so a red
build cannot reach ship.
