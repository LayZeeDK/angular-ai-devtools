# Intent — M019 context-and-jobs

Lane: milestone
Surfaces: none
Review panel: off

## Summary

Ship the prompt-context budget, the worker boundary and ring buffer, and
background jobs with progress and cancellation, on top of M018's registry.

## Problem

M018 gave the extension one declaration record and a single page-read port, and
nothing more. The panel today holds its answer as one unbounded string, has no
worker read path, and has no way to run a job that outlives a single tool call.
Three things follow and all three are invisible until they break: a prompt that
silently exceeds the model's window, a read that blocks the panel while it
resolves, and a job that cannot be cancelled or whose progress cannot be
reported. Each is plumbing with no user-facing answer, which is why it has to be
verified by construction rather than by looking at a screen.

## Users

The next twenty explainers. None of them can answer a question that needs more
facts than one prompt carries, a read that takes seconds, or a job the user
wants to abandon, unless this milestone lands first.

## Success criteria

1. A 200-message ring buffer survives a navigation, and its oldest entry is still
   readable after it.
2. A chunked job reports progress and cancels, and a cancelled job leaves no
   partial fact list behind.
3. One fresh clone per prompt is measured, with the measurement committed.
4. A fact list that exceeds the cap is chunked rather than silently truncated,
   and the chunk count the panel sees is truthful.
5. `npm run check` and `npm test` pass at the head, and the panel stays inside
   the 520 KB initial-bundle budget.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | ordering | held-out | The 200-message buffer is filled, the panel navigates, and the oldest surviving entry is read back and compared to the entry written first. |
| E2 | SC1 | empty | held-out | A buffer that has never filled and a buffer with exactly one entry both answer without inventing a missing neighbour. |
| E3 | SC2 | idempotency | held-out | Cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel's store. |
| E4 | SC2 | concurrency | held-out | Cancellation lands between two chunks, and the last completed chunk is not presented as a complete list. |
| E5 | SC3 | encoding | held-out | The clone measurement is a committed artifact with the observed count, not a number restated in prose. |
| E6 | SC4 | encoding | held-out | A fact list over the cap is chunked, and the chunk count the panel receives equals the number of chunks the job emitted. |
| E7 | SC5 | none | dismissed | SC5 aggregates the type check, the test suite and the bundle budget; it has no data shape of its own. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC2 | Stop a job by discarding its promise while the work continues | judgment | A cancelled job's work must actually stop; a promise that resolves into a discarded buffer is not cancellation. |
| N2 | SC4 | Raise a cap so an oversized fact list fits | judgment | The cap is a measurement, not a parameter to tune to the fixture. |
| N3 | SC1 | Let a stale page identity answer for a live panel after navigation | judgment | The buffer must be keyed to the page it was filled from. |
| N4 | SC3 | Assert the clone count from prose instead of a committed measurement | judgment | The count is evidence only when it is reproducible. |
| N5 | SC5 | Exceed the 520 KB initial budget, or weaken a check to reach green | judgment | AR-1 and the budget are constraints, not targets to negotiate. |

## Scope in

- The 3.6 context caps and the chunking rule that keeps a fact list inside them.
- One fresh clone per prompt, measured rather than assumed.
- The worker boundary: what crosses it, what shape it carries, and the `host` the
  registry declares for a worker-side tool.
- The ring buffer and its cap, surviving a navigation.
- Job progress and cancellation, reported through the registry's async-handle
  outcome.
- The Summarizer path, and the named "cannot tell" state when it is unavailable.

## Scope out

- Any panel surface or explainer; this milestone ships plumbing with no new
  user-facing answer.
- Raising the caps to make a fact list fit: an oversized fact list is chunked,
  never silently truncated.
- Moving work into the page or into the panel to avoid the worker boundary.
- Code generation of app code; a summarised fact list is prompt text, never
  source.
- `@angular/animations`, Angular SSR and `angular/components`.
- DOM added to an inspected page; the overlay is M022's.
- Job types beyond the chunked fact list and the summariser; a second job kind
  arrives with the explainer that needs it.
- `.project/archive/**` and any committed archive.

## Constraints

- Angular 22.2, TypeScript 6.0, zoneless and OnPush by default, standalone
  components, signal-based APIs, modern APIs only (A6).
- The panel is an Angular application; the extension build budget is 520 KB
  initial with a 1 MB error ceiling (AR-1), and it already sits at 535.44 kB, so
  this milestone must not make it worse.
- The inspected page receives no DOM from this milestone (AR-3).
- Every MutationObserver excludes the tool's host subtree (AR-4).
- The registry envelope is pinned by SHA-256; adding a tool must not touch it.
- Owner's standing grant, recorded verbatim: "A fresh session should be able to
  run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete the next milestone end-to-end without a human-in-the-loop, with
  full milestone decision authority."
- Checks: `npm run check` and `npm test`; installs carry `--include=dev`
  because `NODE_ENV=production` is exported in the agent shell.

## Current state

Brownfield. M018 landed `apps/angular-ai-devtools/src/app/tool-registry/` with the
envelope, the hostile-tool proof, `read-tools.ts` and the SHA-256 pin, plus
`apps/angular-ai-devtools/src/app/page-reads.ts` as the single page-read port and
`scripts/registry-reach.test.mjs` guarding reach. `tsconfig.check.json` now
covers the panel.

Ground truth for this milestone, from `.project/research/evidence-codebase.md`:

- The panel keeps its answer as one unbounded `string | null` in
  `ExtensionPromptService`; there is no context budget anywhere. (measured)
- The only worker precedent is `extension/stale-view-worker.js`, hand-written and
  untested; a reusable worker read path does not exist. (measured)
- Chunked reads can stay inside the envelope by carrying chunks in
  `ToolOutcome.result.value`, which is `unknown`; progress and cancellation need
  new machinery because the async-handle outcome carries no progress. (measured)

## Risks

- Spikes S7, S14, S15 and S19 are unrun, and they set the chunk size and the
  prompt cap; until measured both numbers are provisional, and a wrong chunk size
  shows up as a model answer that ignores the second half of the facts.
- The worker boundary sits on the panel's initial-bundle path, so crossing it
  wrongly breaks the 520 KB budget silently instead of failing a test.
- A 200-message ring buffer over a navigation is the first place a stale page
  identity can leak into a live panel.
- A Summarizer path that summarises the tool declaration rather than the tool
  result is a plausible and quiet failure.
- Cancellation is the one job outcome no fixture produces on its own, so it needs
  a deliberate test rather than a browser run.

## Open questions

- [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps?

## Corrections

- Standing grant (owner, this session): the definition, plan, rulings and ship
  gates are pre-authorised for M019; `preapprove --grant intent,plan,rulings,ship`
  was recorded at `inspect/active` with the milestone bound.
- No doc-vs-code ruling is taken here; the `NEEDS-USER` rows of
  `.project/research/DOCS-AUDIT.md` are ruled in that file's `## User rulings`
  table, which is the durable queue.
