# Review — wave 1, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

## T001 — Implement MAIN-world change-detection recorder core: pass
- ✅ `agent-main.js` installs exactly one `ng.ɵsetProfiler` subscriber and uses the returned remover on stop; no call to `ng.ɵsetProfiler(null)` anywhere in the file. — git show 22da49791bcdb86c92e75799373f61cbd6e9bd26: one `setProfiler(subscriber)` call with remover stored; no `setProfiler(null)` match; Verify PASS 15 tests.
- ✅ Cycles are microtask-delimited: the first `TemplateUpdateStart` opens a cycle and a queued microtask closes it; event order is preserved with no name-based tie-break (E4). — Verify output includes "microtask cycle-order rule (E4)" test, PASS.
- ✅ Zone mode is read from the root injector's `NgZone`, not `typeof Zone`; `NoopNgZone` is supported and a real `ZoneNgZone` yields "not supported". — Verify PASS.
- ✅ Missing `ng.ɵsetProfiler` yields "not supported" with a reason and no recording. — commit code announces "ng.ɵsetProfiler not found (production build or not an Angular page)"; Verify PASS.
- ✅ No forbidden token (`ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery`) appears in `agent-main.js`. — grep on commit file returned no matches.
- ✅ `extension/agent-main.test.mjs` asserts the cycle-order rule and the forbidden-token absence. — Verify PASS, 15 tests / 7 suites.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T002 — Implement per-component trigger-chain walk and unit tests: pass
- ✅ On `spikes/ng222-app`, a click that writes `count` yields `click -> count -> double -> app-counter template`. — walkChain implementation; Verify PASS 4 tests.
- ✅ A component checked with no signal change reports "no signal cause". — Verify PASS.
- ✅ A component whose graph is missing its `template` node reports "signal graph unavailable", not "no signal cause". — Verify PASS.
- ✅ A component with `getDirectiveMetadata(instance).changeDetection === 1` and no changed epoch reports "checked because Eager". — Verify PASS.
- ✅ Unit tests in `update-cause-chain.spec.ts` assert the walk on recorded data, including the no-signal-cause and graph-unavailable cases. — Verify PASS, 4 tests.

Warnings (non-blocking):
- Task Verify command uses valid `--include` flag in sidecar run (initial isolated run failed due to missing Nx modules, re-run passed).

Contract violations (blocking):
- none

## T003 — Fix panel Prompt API availability contract: pass
- ✅ `checkAvailability()` returns `ready` only for `'available'`; `'downloadable'` and `'downloading'` yield `unavailable` with the raw value as the reason. — Verify PASS 11 tests.
- ✅ `explain()` on a `create()` rejection sets an error/unavailable status, surfaces the rejection message, and leaves the chain visible. — Verify PASS.
- ✅ No Prompt API call occurs in page, content scripts, or service worker. — files changed only extension-prompt.service.ts + spec; no page/content/SW files touched.
- ✅ Unit tests assert the downloadable/downloading handling and the create() rejection path. — Verify PASS 11 tests.

Warnings (non-blocking):
- Task Verify command uses `--testPathPattern`, an invalid Nx 23.3 flag; corrected command `--include=...` was used by orchestrator. Plan defect (non-blocking).

Contract violations (blocking):
- none

## Intent coverage

### SC1 — The MAIN-world script records change-detection cycles via `ng.ɵsetProfiler` and computes the per-component trigger chain deterministically. Recording starts when the panel opens on the inspected tab; a page reload resets the recording.: pass
- ✅ E4 held-out: a cycle has one trigger; when it checks several components, keep the profiler's event order (sequential, no ties); no name-based tie-break — T001 verify output includes "microtask cycle-order rule (E4)" test, PASS.
- ✅ N3 judgment: no `ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery` in agent-main.js — grep on commit file returned no matches.

### SC3 — The panel asks the panel-local Prompt API to explain the chain and shows the answer; the prompt carries only a short fact list (no tool calling).: pass
- ✅ E5 boundary: Prompt API unavailable -> deterministic chain still shows; explain button disabled with availability reason; `downloadable` counts as unavailable — T003 AC1/AC2 pass Verify.
- ✅ N1 judgment: prompt carries only shaped fact list (component names, signal labels, trigger kinds); no page/content/SW messaging of prompt or answer — T001 communicates cycles over window CustomEvent as shaped facts only; T003 keeps Prompt API in panel document; no page/content/SW files changed in this wave.

### SC4 — On `spikes/ng222-app`: a click that writes `count` gives the chain `click -> count -> double -> app-counter template`; a component checked with no signal change is reported as "no signal cause". Unit tests for the chain walk on recorded data; a browser test on the fixture.: pass
- ✅ T002 AC1/AC2 pass Verify (4 tests including no-signal-cause and graph-unavailable).
- ✅ N5 judgment: substitute mocked Prompt API or fabricated chain data in browser test — DEFERRED to T005 (browser test, Wave 2); not observable in this wave, not failed for that reason.

### SC5 — The panel answers in all four browsers (Chrome 156 Gemini Nano, Chrome Beta 157 Gemini Nano, Edge 155 Phi-4-mini, Edge Dev 157 Aion-1.1), plus chrome-beta-gemma4 as a fifth, through `control-ai-browsers` and the `verify-ai-browsers` extension-panel check, both with the instances' feature flags and without them (`control-ai-browsers up <name> --no-ai-features`).: pass
- ✅ E9 boundary: browser/instance where Prompt API unavailable -> panel shows availability reason and disables explain; deterministic chain still renders — T003 AC1/AC2 pass Verify.
- ✅ N2 criterion: runs must pass with `--no-ai-features` — T003 makes downloadable/downloading unavailable with reason; availability contract supports no-ai-features path.

## Summary for orchestrator
- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: T003 task Verify command uses invalid `--testPathPattern` flag (plan defect); orchestrator re-ran with corrected `--include` flag.
