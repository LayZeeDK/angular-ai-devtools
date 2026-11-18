# M049 interaction-story — inspection delta

Measured delta against the audit frozen at `337047455bae67f5e05ccf25ecd0909b0c9bf448`.

## Gate

`check_docs_audit.py --repo .` exits 0 at this head: coverage equals the derived inventory, 525
claims over 111 documents plus one descriptive, and the carried rulings are intact.

## Changed since the boundary

One path changed since `e620c156` (M048's integration) and it is not an audited document: the
roadmap's own status line, written by the shipment. Every earlier change — M046's seven audited
document corrections, M047's surface, M048's twenty-surface copy record — is already accounted for in
the previous milestones' deltas and in the audit itself.

## What this delta does not claim

It does not claim any changed code was audited as documentation. It records that the only difference
since the last measurement is bookkeeping, so the audit in force still describes this tree.

## Consequence for the plan

The roadmap's premise — that the panel narrates the interaction sequence a page recorded, naming what
the user did and what the app emitted — names two things, and only one exists. Measured at `4901d74b`:
`interaction` occurs **0** times in `extension/agent-main.js`, **0** times in any file under
`extension/`, and no file in the extension registers a `click`, `pointer*`, `mouse*` or `key*`
listener: the only document-level listeners are `error` (`agent-main.js:2550`) and
`unhandledrejection` (`:2557`). Nothing anywhere records what the user did.

What the agent does record, in arrival order, is three app-emitted streams: `routerEvents`
(`:1474`), `pendingWorkEvents` (`:639`) and `boundaryEntries` (`:1942`). M049's first task must
measure their exact shapes before any narration is written, and the intent must drop "what the user
did" rather than infer it.
