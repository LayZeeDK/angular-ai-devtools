# M047 component-search — synthesis

Four tasks in four waves, reviewed and landed. This records what the milestone measured, what it
changed, and what the build gate itself turned out to need.

## What the milestone set out to show

The roadmap said the panel answers which components the inspected page rendered, reading a component
tree the page agent already captures. The first task existed to falsify that sentence, and it did:
`extension/agent-main.js` holds no tree — `children` occurs zero times, the per-element reads are
`el.__ngContext__` and `ng.getComponent`, and the profiler records `componentName: null` whenever it
passed no instance.

## What measurement changed

T001 recorded 9 sources that yield a page name and 8 absence cases, each at `path:line` with the
line's own text, and it corrected two of this milestone's own premises in the process:
`__ngContext__` is present in production builds, so the production-page absence is `no-dev-api`
rather than `no-dev-context`; and the occurrence count quoted in the intent was not reproducible and
carries nothing in the record. SC1 was narrowed from "the tree the agent holds" to "the names the
record carries" before any join was written.

## Review findings and their resolution

Four wave reviews pass, and the gap review records the project verify at exit 0 on the reviewed head.
The findings that mattered are in the product: a filter that completes a name from framework
knowledge reddens by string, an invented cause cannot reach `reason` because the set is closed, and
an unreadable source cannot be reported as an empty list because held-out E4 asserts the pair from
one record.

## The build gate, which was the real discovery

Two defects in the harness were found while landing the last task, and both were found because the
failure named itself:

- **A timestamp tie could turn a red into a pass.** Two verdicts written in the same millisecond
  share an ISO string, so "newest evidence" came from the directory walk: the ship-mode refusal test
  passed at 13.8 s in the outer run and failed at 25.8 s in the nested run of the same head. On a
  tie the non-verified verdict now sorts last.
- **A suite that runs the project twice had one run's budget.** `e4-idempotent-checks` runs
  `npm run check` and `npm test` twice by design; the 30-minute ceiling refused it as
  `did not finish within 1800s` while the other 84 tests were green. The ceiling is now 90 minutes.

A third cost was not the harness's: `research/raw/m047-verdict-claims.json` did not exist, and eight
tests derive that path from `STATE.branch`. The worker refused to write it by hand and said so; it
was produced by `M044_CAPTURE=1 node --test scripts/navigation-blocking.test.mjs`.

## What ships

The `components` surface rendering `listed`, `filtered`, `empty` and `cannot-tell`; the pure filter
over the names the agent can actually read; the closed reason set; the route, loader key and five
route-table suites pinned with a proven mutant; and a surface record with 52 citations.
