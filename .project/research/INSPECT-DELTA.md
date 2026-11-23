# Inspect delta — M064 lazy-chunk-failure

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` · this head: `6534704ee66310674eda8130f287419be27484c4` (`gsd-path/M064`)

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

- Non-audit paths changed: 526
  - `.commandcode/` — 4 path(s)
  - `.githooks/` — 1 path(s)
  - `.project/` — 407 path(s)
  - `apps/` — 19 path(s)
  - `extension/` — 17 path(s)
  - `nx.json/` — 1 path(s)
  - `research/` — 40 path(s)
  - `scripts/` — 37 path(s)

## What the milestone needs measured

The roadmap calls "the dynamic-import failure the record carries, together with the route path whose lazy load
produced it" the observable. Measured at this head:

- `grep -c "chunk" extension/agent-main.js` returns **0**. The extension records no chunk, no import specifier and no
  import failure.
- `extension/navigation-narrator.js:26` states why in its own words: the navigation payloads carry `{ route, type }`,
  and "no key of either names a guard, a resolver, a chunk or a task". Lines 96 and 348 repeat the constraint for the
  surfaces they describe.
- So no import failure is recorded anywhere, and the milestone writes the record before anything joins against it.

The roadmap's own risk — that a chunk replaced after deploy and a network failure look the same from the router — is
a constraint on the record's shape: the response status and the content hash must both be recorded, and a request that
never completed stays `cannot-tell` rather than being named as a version drift nobody measured.

## What this does not claim

- It does not claim the changed non-audit paths were reviewed.
- It does not claim the portal cannot produce the artefact; it claims this tree records no import failure. A verdict
  taken against the portal must still name the route it tried.
