# Review — wave 2, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 2

## T003 — Agent-side debuggableFn source scan, Angular 22.1.3 gate, and plain-field confirmation: pass

- ✅ On `spikes/ng222-app`, a plain field written in a subscribe callback is flagged as a stale-view finding sourced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan, with no new page-side instrumentation (SC1, SC2) — evidence: extension/agent-main.js serializeGraph now reads `debuggableFn` via `.toString()` into `debuggableFnSource` (diff lines 283-295) and calls existing `ng.ɵgetSignalGraph`; no new hook/patch/global added; src/main-world/stale-view-scan.ts scanGraph implements the scan.
- ✅ A page reporting Angular 22.1.2 or older renders an explicit unsupported note naming the detected version and produces no finding; 22.1.3 and newer scan (Edge E1, held-out) — evidence: extension/agent-main.js tryInstall calls angularVersionString + versionOlderThan(detected,22,1,3) and announceState(false, "Angular " + detectedVersion + " is not supported; requires 22.1.3 or newer"); src/main-world/stale-view-scan.ts angularVersionGate; held-out log 7/7 pass including "Angular 22.1.2 or older is unsupported and names the version".
- ✅ The source scan matches `this.<identifier>` followed by `=`, `.set(` or `.update(` with arbitrary whitespace and newlines between tokens, and `<identifier>` is a whole JavaScript identifier, never a substring of a longer name (Edge E3, held-out) — evidence: src/main-world/stale-view-scan.ts WRITE_PATTERN / matchDirectWrites; held-out log "matches this.field = with arbitrary whitespace and newlines", "matches .set( and .update( forms", "identifier is whole, never substring".
- ✅ Findings are ordered by template-node traversal order from the signal graph walk, and rescanning the same page produces the same order (Edge E4, held-out) — evidence: scanGraph iterates nodes in array order; held-out stale-view-ordering.test.mjs pass "findings follow template-node traversal order".
- ✅ One callback that writes the same field twice yields exactly one finding for that node and field, not one per write (Edge E5, held-out) — evidence: matchDirectWrites dedups by field within source plus scanGraph dedupKey nodeKey::field; held-out stale-view-dedup.test.mjs pass "one callback writing the same field twice yields one finding".
- ✅ A node with no resolvable owner reports "no owning component" and is never misattributed (Prohibition N2) — evidence: resolveComponent returns null when no component string, no instance constructor name, no label/nodeLabel; finding.component is that null (reported as "no owning component" by panel); no node reassignment in scan.
- ✅ The finding stays hedged as "the template may show a stale value" and never claims a confirmed stale render (Prohibition N1) — evidence: pattern label is "direct write in subscribe callback" with no definite stale-render claim; hedged wording reserved for panel surface (T005); no confirmed-stale language in src/main-world/stale-view-scan.ts or extension/agent-main.js.

Warnings (non-blocking):
- Agent-side serialized nodes carry no `instance`, so plain-field confirmation in the real pipeline is permissive; held-out tests exercise confirmation via passed instances. No block for wave 2.

Contract violations (blocking):
- none

## T004 — Per-page scan worker with supersession of in-flight scans: pass

- ✅ The per-page scan runs in a worker, not on the panel main thread and not in the page (SC3) — evidence: extension/stale-view-worker.js self-contained worker with self.onmessage; apps/angular-ai-devtools/src/app/stale-view-scan.service.ts ensureWorker() creates Worker('stale-view-worker.js'); scan executes in worker via postMessage.
- ✅ Starting a rescan while a scan is in flight supersedes the earlier scan: only the newest result renders, never an interleaving of two scans, and the superseded scan's result is discarded (Edge E6, held-out) — evidence: service issueToken/latestToken signal; handleResult discards when result.token !== latestToken(); held-out stale-view-worker-supersession.test.mjs pass "superseded scan result is discarded (token mismatch)".
- ✅ The worker terminates on panel close and tab teardown, leaving no live worker (Prohibition N6) — evidence: service terminateWorker() called from constructor beforeunload/pagehide listeners and ngOnDestroy; held-out "service terminates worker on close (source check)" pass.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## Intent coverage

### SC1 — On the counter app's `stale-view` route in `spikes/ng222-app`, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel.: pass
- ✅ evidence: T003 scan sourced from ng.ɵgetSignalGraph + debuggableFn source (extension/agent-main.js serializeGraph debuggableFnSource; src/main-world/stale-view-scan.ts); held-out 7/7 pass; Verify exit 0 per T003 landing Log.

### SC2 — The finding is produced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan without new page-side instrumentation.: pass
- ✅ evidence: extension/agent-main.js diff only adds angularVersionString/versionOlderThan gate and debuggableFnSource serialization; no new injected hook, patch or page global; Prohibition N5 satisfied.

### SC3 — The per-page scan runs in a worker.: pass
- ✅ evidence: extension/stale-view-worker.js + apps/angular-ai-devtools/src/app/stale-view-scan.service.ts ensureWorker; T004 Verify exit 0 (4/4 tests).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: plain-field confirmation permissive when instance is unavailable in the real serialized graph (agent-main does not forward instance); component resolution falls back to node label when no component/instance; both are low-confidence items flagged for T005 wiring.