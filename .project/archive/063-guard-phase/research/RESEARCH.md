# RESEARCH — M063 guard-phase

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`
Milestone: M063 — guard-phase

Measured at `gsd-path/M063` before planning. Every claim below is a command's output or a quoted line of source.

## Dispatch

No subagent was dispatched: the roadmap entry lists **no open questions**, and the one question this phase would have asked — does the tree record a guard verdict — is answered by reading two files.

- `domain` — skipped → none — R1: the narrator's `guards` section is a fixed absence, not a reading.
- `stack` — skipped → none — R2: the router payload carries `{ route, type }` and nothing else.
- `pitfalls` — skipped → none — R3: `canMatch` runs before the route is known, so a phase can exist without an owner.
- `similar` — skipped → none — M062 wrote a record before joining it; the plan follows that shape.

## Question assignments

## R1 — the guard section exists and cannot tell

`extension/navigation-narrator.js:107` states the section as
`guards { state: "cannot-tell", absence: "guard-verdict-not-recorded", shouldActivate }`, and its comment block at lines
26-32 records why: the navigation payloads carry `{ route, type }`, and no key of either names a guard, a resolver, a
chunk or a task.

**Consequence:** the answer the milestone owes cannot be produced from this section. The first task records the ordered
guard verdicts with their phases; the narrator's absence stays as the state a record with no verdicts produces.

## R2 — the payload carries no guard

`grep -c "canActivate\|canMatch" extension/agent-main.js` returns **0**. The events the agent observes are the router's own,
and their shape is `{ route, type }`.

**Consequence:** a phase is a new field on a new record, not a wider read of an existing one. SC3 says so, and C3 records
that any criterion phrased "from the observables the agent already holds" would be false.

## R3 — a phase can exist without an owner

`canMatch` runs before the router knows which route it is matching. A verdict from that phase therefore has no route to be
attributed to, and a join that names one would be inventing the attribution.

**Consequence:** E2 and N1 pin it. A phase-only finding is reported as phase-only, and the answer never falls back to the
route that matched afterwards.

## What the portal must provide

The Insurance Portal first, on a route whose guard cancels a navigation after a side effect. The fixture
(`spikes/ng222-app`) is the fallback only where the portal carries no such route, and a verdict taken there must name the
route tried and the artefact the portal lacks.

## Open questions

- None carried from the roadmap.
