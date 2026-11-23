# Inspect delta — M063 guard-phase

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` · this head: `6d253f6cd6185cde47f64215cbb54962d8dbf013` (`gsd-path/M063`)

The docs audit in force is `.project/research/DOCS-AUDIT.md`, taken at the commit above. This record states what
changed since it. It does **not** claim that code was audited.

## What changed

- Audited documents changed since the audit base: 9
  - `.commandcode/skills/prove-console-cannot-tell/SKILL.md`
  - `.commandcode/skills/prove-graph-serialize-closure/SKILL.md`
  - `.commandcode/skills/prove-join-absence-folding/SKILL.md`
  - `.commandcode/skills/prove-overlay-observer-purity/SKILL.md`
  - `.commandcode/taste/tooling/taste.md`
  - `.commandcode/taste/workflow/taste.md`
  - `AGENTS.md`
  - `plans/angular-ai-devtools-program-backlog.md`
  - `research/SYNTHESIS.md`

- Non-audit paths changed: 484
  - `.commandcode/` — 4 path(s)
  - `.githooks/` — 1 path(s)
  - `.project/` — 376 path(s)
  - `apps/` — 17 path(s)
  - `extension/` — 14 path(s)
  - `nx.json/` — 1 path(s)
  - `research/` — 38 path(s)
  - `scripts/` — 33 path(s)

## What the milestone needs measured, and what the tree already carries

The roadmap calls "the ordered guard verdicts the navigation record carries, across canMatch, canActivate,
canDeactivate and resolve" the observable. Measured at this head:

- `extension/navigation-narrator.js` already has a `guards` section, and it is a fixed absence rather than a reading:
  `{ state: "cannot-tell", absence: "guard-verdict-not-recorded", shouldActivate }` (its own comment block, lines 26-32
  and 107, states why).
- The reason is recorded there and confirmed here: the router event payloads the agent receives carry `{ route, type }`
  and no key of either names a guard, a resolver, a chunk or a task. `grep -c "canActivate\|canMatch"
  extension/agent-main.js` returns **0**.
- So no guard *phase* is recorded anywhere today, and a guard that ran before a cancel cannot be attributed to anything.

The milestone therefore adds the observable. The first task records the ordered guard verdicts with their phases from
the navigation the agent already observes; the join and the pane read that record and nothing else. The roadmap's own
risk — `canMatch` runs before the route is known, so a side effect there cannot be attributed to a route — is a
constraint on the record's shape: the phase must be recorded before an owner is named, and a verdict with no owner is
a phase-only finding rather than an attribution.

## What this does not claim

- It does not claim the changed non-audit paths were reviewed.
- It does not claim the portal cannot produce the artefact; it claims this tree records no guard phase. A verdict taken
  against the portal must still name the route it tried.
