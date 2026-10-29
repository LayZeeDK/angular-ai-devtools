# Round 3 — lars-review re-run after patch wave (M001-M007)

Reviewed HEAD: dfcf09b2132d84a393271eea53fa163d217bdce9

Reviewed ranges (each frozen from its specification; unchanged from rounds 1 and 2):

| Milestone | Range | Blocking | Advisory |
|---|---|---|---|
| M001 | ecfdbd0bad2a722daea1f6f24dcf129b4902d237..5953b1285b4f9ccc025ecee77909624ce709d0bf | 0 | 1 |
| M002 | 5953b1285b4f9ccc025ecee77909624ce709d0bf..dc6e6937590292f3f2ac0f57f09cf9c4162c1350 | 0 | 0 |
| M003 | dc6e6937590292f3f2ac0f57f09cf9c4162c1350..761d6a33d96f194090a87a906db1ee3fecbc2a2b | 0 | 1 |
| M004 | 761d6a33d96f194090a87a906db1ee3fecbc2a2b..2f7500040b0765d06f18e502be86b419b8783239 | 0 | 0 |
| M005 | 2f7500040b0765d06f18e502be86b419b8783239..c4a766ce26e62901c29c8f1165a3d0d4f10d4567 | 0 | 1 |
| M006 | 2f7500040b0765d06f18e502be86b419b8783239..57387f904558705718412d325a2e24c64cada7bd | 0 | 1 |
| M007 | 57387f904558705718412d325a2e24c64cada7bd..6c86ff2023999a8f976ad6ddc32a672a2ba29e5f | 0 | 5 |

Totals: Blocking 0, Advisory 9, Noise 0. All 13 blocking findings from rounds 1-2 are fixed in named commits (see dispositions). No new verified blocking finding appears on re-run (E11); the verdict set is identical to round 2 for every unchanged range.

Review runs only on a clean product worktree (E12); fixes and reviews are sequenced, and no fix task is open while this review round runs.

## M001

### F1 — S16 verdict "works" contradicts its own evidence (Meta absent)
Severity: blocking
File: research/raw/s16-meta-lookup.json:15-17
Verdict: false
Disposition: fixed in 6cd1f28692261a465a8930acbc2b0a1d10f8f2e9

### F2 — Filing ledger cites the non-maintained skill copy
Severity: advisory
File: docs/filing-ledger.md:66
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

## M002

No defects found — reviewed 5953b1285b4f9ccc025ecee77909624ce709d0bf..dc6e6937590292f3f2ac0f57f09cf9c4162c1350 at HEAD dfcf09b2132d84a393271eea53fa163d217bdce9.

## M003

### F1 — Bridge treats Windows junctions as non-links (helper defined but unused)
Severity: blocking
File: scripts/sidecar-deps-bridge.mjs:37
Verdict: verified
Disposition: fixed in f8ee069422814d4b1e181e3f349d2a8ccb758532

### F2 — Stale relative artifact paths in relocated control skill docs
Severity: advisory
File: .commandcode/skills/control-ai-browsers/SKILL.md:119
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

## M004

### F1 — MAIN-world state event is not bridged to the extension
Severity: blocking
File: extension/relay.js:6
Verdict: verified
Disposition: fixed in 93bd1f7fde0a2bde928ecd1ce920e954fbd0151e

### F2 — State message contract mismatch between producer and consumer
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Disposition: fixed in fb1b224287e3b34bad8637526e0e8f7e83d3a4e4

### F3 — E2E chain spec contains only placeholder assertions
Severity: blocking
File: spikes/ng222-app/e2e/chain.spec.ts:12
Verdict: verified
Disposition: fixed in a41ec77e4e8c80aa16d480b886da3522a73ac001

## M005

### F1 — Panel never marks the page unsupported
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Disposition: fixed in fb1b224287e3b34bad8637526e0e8f7e83d3a4e4

### F2 — serializeGraph assumes graph.edges exists
Severity: advisory
File: extension/agent-main.js:273
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

## M006

### F1 — Regression gate is vacuous
Severity: blocking
File: src/regression.spec.ts:5
Verdict: verified
Disposition: fixed in fffc16b1d59925524048a6b0e90a456cfe807a53

### F2 — Missing src/panel extension-prompt.service re-export
Severity: blocking
File: src/panel (extension-prompt.service.ts absent)
Verdict: verified
Disposition: fixed in 116a4cd32a74ad5711030133cb7d6d8323fca105

### F3 — Main-world tracer ignores the serialized graph edge shape
Severity: blocking
File: src/main-world/provenance-tracer.ts:32
Verdict: verified
Disposition: fixed in 26a34d6980c901ec263577e33bc85c2131636a36

### F4 — src/panel and src/main-world modules are not consumed
Severity: advisory
File: src/panel/provenance.component.ts:1
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

## M007

### F1 — agent-main.js records isViewProvider from a non-existent field
Severity: blocking
File: extension/agent-main.js:394
Verdict: verified
Disposition: fixed in b58d1b837b1466da44aeb9aa4dc552751a761231

### F2 — token names stringified from Type/InjectionToken objects
Severity: blocking
File: extension/agent-main.js:389
Verdict: verified
Disposition: fixed in b58d1b837b1466da44aeb9aa4dc552751a761231

### F3 — provider kind always "none" because providerType field does not exist
Severity: blocking
File: extension/agent-main.js:390
Verdict: verified
Disposition: fixed in b58d1b837b1466da44aeb9aa4dc552751a761231

### F4 — element injector identity lost (source read from non-existent meta.name/displayName)
Severity: blocking
File: extension/agent-main.js:380-383
Verdict: verified
Disposition: fixed in b58d1b837b1466da44aeb9aa4dc552751a761231

### F5 — importPath stringified from array of types
Severity: advisory
File: extension/agent-main.js:396
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

### F6 — diff compares all provider tokens, not the queried token
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-diff-display.ts:46
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

### F7 — explain button never disabled when Prompt API unavailable
Severity: advisory
File: apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:51
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

### F8 — DiDoctorService accumulates duplicate paths on repeated messages
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-doctor.service.ts:17-19
Verdict: verified
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

### F9 — stated non-support (injection flags, providedIn 'any') is honoured, but viewProviders handling is not
Severity: advisory
File: extension/agent-main.js:394
Verdict: partial
Disposition: open — deferred (advisory, non-blocking; no fix in this wave)

## Remaining blocking findings

None.

## Provenance (round 1 -> round 2 -> round 3)

| Finding | Round 1 | Round 2 | Round 3 | Changed? |
|---|---|---|---|---|
| M001 F1 | open | open | fixed in 6cd1f28692261a465a8930acbc2b0a1d10f8f2e9 | yes |
| M001 F2 | open | open | open — deferred (advisory) | no |
| M002 | no defects found | no defects found | no defects found | no |
| M003 F1 | open | open | fixed in f8ee069422814d4b1e181e3f349d2a8ccb758532 | yes |
| M003 F2 | open | open | open — deferred (advisory) | no |
| M004 F1 | open | open | fixed in 93bd1f7fde0a2bde928ecd1ce920e954fbd0151e | yes |
| M004 F2 | open | open | fixed in fb1b224287e3b34bad8637526e0e8f7e83d3a4e4 | yes |
| M004 F3 | open | open | fixed in a41ec77e4e8c80aa16d480b886da3522a73ac001 | yes |
| M005 F1 | open | open | fixed in fb1b224287e3b34bad8637526e0e8f7e83d3a4e4 | yes |
| M005 F2 | open | open | open — deferred (advisory) | no |
| M006 F1 | open | fixed in fffc16b1d59925524048a6b0e90a456cfe807a53 | fixed in fffc16b1d59925524048a6b0e90a456cfe807a53 | no |
| M006 F2 | open | open | fixed in 116a4cd32a74ad5711030133cb7d6d8323fca105 | yes |
| M006 F3 | open | open | fixed in 26a34d6980c901ec263577e33bc85c2131636a36 | yes |
| M006 F4 | open | open | open — deferred (advisory) | no |
| M007 F1 | open | open | fixed in b58d1b837b1466da44aeb9aa4dc552751a761231 | yes |
| M007 F2 | open | open | fixed in b58d1b837b1466da44aeb9aa4dc552751a761231 | yes |
| M007 F3 | open | open | fixed in b58d1b837b1466da44aeb9aa4dc552751a761231 | yes |
| M007 F4 | open | open | fixed in b58d1b837b1466da44aeb9aa4dc552751a761231 | yes |
| M007 F5 | open | open | open — deferred (advisory) | no |
| M007 F6 | open | open | open — deferred (advisory) | no |
| M007 F7 | open | open | open — deferred (advisory) | no |
| M007 F8 | open | open | open — deferred (advisory) | no |
| M007 F9 | open | open | open — deferred (advisory) | no |
