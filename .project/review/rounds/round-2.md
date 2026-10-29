# Round 2 — lars-review re-run over M001-M007

Reviewed HEAD: 8b2780a30d991201b423b2632aac82fcc02bca38

Reviewed ranges (each frozen from its specification; unchanged from round 1):

| Milestone | Range | Blocking | Advisory |
|---|---|---|---|
| M001 | ecfdbd0bad2a722daea1f6f24dcf129b4902d237..5953b1285b4f9ccc025ecee77909624ce709d0bf | 1 | 1 |
| M002 | 5953b1285b4f9ccc025ecee77909624ce709d0bf..dc6e6937590292f3f2ac0f57f09cf9c4162c1350 | 0 | 0 |
| M003 | dc6e6937590292f3f2ac0f57f09cf9c4162c1350..761d6a33d96f194090a87a906db1ee3fecbc2a2b | 1 | 1 |
| M004 | 761d6a33d96f194090a87a906db1ee3fecbc2a2b..2f7500040b0765d06f18e502be86b419b8783239 | 3 | 0 |
| M005 | 2f7500040b0765d06f18e502be86b419b8783239..c4a766ce26e62901c29c8f1165a3d0d4f10d4567 | 1 | 1 |
| M006 | 2f7500040b0765d06f18e502be86b419b8783239..57387f904558705718412d325a2e24c64cada7bd | 3 | 1 |
| M007 | 57387f904558705718412d325a2e24c64cada7bd..6c86ff2023999a8f976ad6ddc32a672a2ba29e5f | 4 | 5 |

Totals: Blocking 13 (1 fixed, 12 open), Advisory 9, Noise 0. No new verified blocker appears on re-run (E11); the verdict set is identical to round 1 for every unchanged range.

Review runs only on a clean product worktree (E12); fixes and reviews are sequenced, and no fix task is open while this review round runs.

## M001

### F1 — S16 verdict "works" contradicts its own evidence (Meta absent)
Severity: blocking
File: research/raw/s16-meta-lookup.json:15-17
Verdict: false
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F2 — Filing ledger cites the non-maintained skill copy
Severity: advisory
File: docs/filing-ledger.md:66
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## M002

No defects found — reviewed 5953b1285b4f9ccc025ecee77909624ce709d0bf..dc6e6937590292f3f2ac0f57f09cf9c4162c1350 at HEAD 8b2780a30d991201b423b2632aac82fcc02bca38.

## M003

### F1 — Bridge treats Windows junctions as non-links (helper defined but unused)
Severity: blocking
File: scripts/sidecar-deps-bridge.mjs:37
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F2 — Stale relative artifact paths in relocated control skill docs
Severity: advisory
File: .commandcode/skills/control-ai-browsers/SKILL.md:119
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## M004

### F1 — MAIN-world state event is not bridged to the extension
Severity: blocking
File: extension/relay.js:6
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F2 — State message contract mismatch between producer and consumer
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F3 — E2E chain spec contains only placeholder assertions
Severity: blocking
File: spikes/ng222-app/e2e/chain.spec.ts:12
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## M005

### F1 — Panel never marks the page unsupported
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F2 — serializeGraph assumes graph.edges exists
Severity: advisory
File: extension/agent-main.js:273
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## M006

### F1 — Regression gate is vacuous
Severity: blocking
File: src/regression.spec.ts:5
Verdict: verified
Disposition: fixed in T003 (fffc16b) — removed src/regression.spec.ts and landed non-vacuous regression gate

### F2 — Missing src/panel extension-prompt.service re-export
Severity: blocking
File: src/panel (extension-prompt.service.ts absent)
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F3 — Main-world tracer ignores the serialized graph edge shape
Severity: blocking
File: src/main-world/provenance-tracer.ts:32
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F4 — src/panel and src/main-world modules are not consumed
Severity: advisory
File: src/panel/provenance.component.ts:1
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## M007

### F1 — agent-main.js records isViewProvider from a non-existent field
Severity: blocking
File: extension/agent-main.js:394
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F2 — token names stringified from Type/InjectionToken objects
Severity: blocking
File: extension/agent-main.js:389
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F3 — provider kind always "none" because providerType field does not exist
Severity: blocking
File: extension/agent-main.js:390
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F4 — element injector identity lost (source read from non-existent meta.name/displayName)
Severity: blocking
File: extension/agent-main.js:380-383
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F5 — importPath stringified from array of types
Severity: advisory
File: extension/agent-main.js:396
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F6 — diff compares all provider tokens, not the queried token
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-diff-display.ts:46
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F7 — explain button never disabled when Prompt API unavailable
Severity: advisory
File: apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:51
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F8 — DiDoctorService accumulates duplicate paths on repeated messages
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-doctor.service.ts:17-19
Verdict: verified
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

### F9 — stated non-support (injection flags, providedIn 'any') is honoured, but viewProviders handling is not
Severity: advisory
File: extension/agent-main.js:394
Verdict: partial
Disposition: open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73)

## Open blocking findings (consumed by the plan patch wave)

| ID | Milestone | File | Remedy (from round 1) |
|---|---|---|---|
| M001 F1 | M001 | research/raw/s16-meta-lookup.json:15-17 | Change the recorded verdict to `works-with-degradation` (or `fails`) and update research/05-spikes.md to match. |
| M003 F1 | M003 | scripts/sidecar-deps-bridge.mjs:37 | Replace each `.isSymbolicLink()` gate with `isSymlinkLike(st)`. |
| M004 F1 | M004 | extension/relay.js:6 | Add a `window.addEventListener('angular-ai:state', ...)` forwarding e.detail. |
| M004 F2 | M004 | apps/angular-ai-devtools/src/app/extension-message.service.ts:51 | Align the state contract (treat `msg.supported === false`, read `msg.reason`). |
| M004 F3 | M004 | spikes/ng222-app/e2e/chain.spec.ts:12 | Replace placeholders with real assertions driving the panel. |
| M005 F1 | M005 | apps/angular-ai-devtools/src/app/extension-message.service.ts:51 | Treat `msg.supported === false` and read `msg.reason`. |
| M006 F2 | M006 | src/panel (extension-prompt.service.ts absent) | Add `src/panel/extension-prompt.service.ts` re-export or drop citation. |
| M006 F3 | M006 | src/main-world/provenance-tracer.ts:32 | Build adjacency from `consumer`/`producer` edges. |
| M007 F1 | M007 | extension/agent-main.js:394 | Read `pr.isViewProvider` instead of `pr.viewProviders`. |
| M007 F2 | M007 | extension/agent-main.js:389 | Derive name via `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`. |
| M007 F3 | M007 | extension/agent-main.js:390 | Inspect `pr.provider` to classify kind. |
| M007 F4 | M007 | extension/agent-main.js:380-383 | Use tagName for element injectors. |

## Provenance (round 1 -> round 2)

| Finding | Round 1 disposition | Round 2 disposition | Changed? |
|---|---|---|---|
| M001 F1 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M001 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M002 | no defects found | no defects found | no |
| M003 F1 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M003 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M004 F1 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M004 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M004 F3 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M005 F1 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M005 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M006 F1 | open | fixed in T003 (fffc16b) | yes |
| M006 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M006 F3 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M006 F4 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F1 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F2 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F3 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F4 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F5 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F6 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F7 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F8 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
| M007 F9 | open | open — fix scheduled for a plan patch wave after wave 3 (PLAN.md:73) | no |
