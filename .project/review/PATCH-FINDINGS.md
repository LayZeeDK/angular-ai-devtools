# Patch findings — M043 `stability-explainer`

Authored at `46abef82` from the final review's blocked verdict. One criterion is
not met, and the patch exists to meet it rather than to reinterpret it.

## F1 — SC2's transition half has no page

- **Severity**: blocking (one criterion of six)
- **Where**: `.project/review/FINAL.md` `### SC2 — …`, verdict `unverifiable`
- **Evidence**: `research/raw/m043-stability.json`
  - `transition.answer` is `no-transition-observed` (`:208`)
  - `transition.producedOnAnInspectedPage` is `false` (`:209`)
  - the mechanism is measured: one subscription read `true`, then `false`
    across two adds, then `true` after the last remove (`:104-156`), against
    `_pending_tasks-chunk.mjs:2288` and the flips at `:2316-2322`
  - the only carried page-shaped subject, `/resource-states`, cannot end its
    task: its loader returns `new Promise<never>(() => {})`
    (`spikes/ng222-app/src/app/resource-states.ts:61`, resource `:67-71`),
    and the removal runs only in the load effect's `finally` or on abort
    (`_resource-chunk.mjs:463`, `:470`)
- **Why it blocks**: the criterion is written of a page — "the page's own
  `performance.now()` reading at attach and its reading when `true` arrived".
  A `node:vm` realm drive (`subjects['unstable-then-stable']`, settle `1008`,
  `sinceAttachMs: 7`) proves the arithmetic and the join, not the page.

## The one drive that closes it

`research/raw/m043-stability.json:230` names it and needs no fixture change:
**a router navigation on a stable route adds a pending task and releases it
around the navigation, while the read is attached.** The agent already records
`routerEvents`, and the fixture serves routes.

The other two candidates are refused or expensive: a page whose last task is
removed while attached (no such subject is carried) and a fixture loader that
settles (forbidden by this milestone's acceptance criteria, `:232`).

## What the patch must not do

- Re-word SC2, or split it, or widen its verdict. The criterion stays as
  quoted; only evidence is added.
- Take the transition from a realm drive and call it a page.
- Mark `met` if the drive emits nothing. A second `no-transition-observed`, now
  measured on a page, is a real answer and keeps the verdict `unverifiable`
  with a stronger reason.

## Done when

`research/raw/m043-settle-page.json` records a page drive in which
`settle.at > attachAt` and `answer: "transition-observed"`, the shipped join
reports that interval from the two published readings, and the wave-5 review
re-rules SC2 `met` against it — or the drive runs and emits nothing, and
`FINAL.md` keeps `unverifiable` with the page-level reading recorded.
