# Round 1 — lars-review over M001-M007

Reviewed HEAD: 5213c9512e68eddace66379358bec0020929b083

Reviewed ranges (each frozen from its specification):

| Milestone | Range | Blocking | Advisory |
|---|---|---|---|
| M001 | ecfdbd0bad2a722daea1f6f24dcf129b4902d237..5953b1285b4f9ccc025ecee77909624ce709d0bf | 1 | 1 |
| M002 | 5953b1285b4f9ccc025ecee77909624ce709d0bf..dc6e6937590292f3f2ac0f57f09cf9c4162c1350 | 0 | 0 |
| M003 | dc6e6937590292f3f2ac0f57f09cf9c4162c1350..761d6a33d96f194090a87a906db1ee3fecbc2a2b | 1 | 1 |
| M004 | 761d6a33d96f194090a87a906db1ee3fecbc2a2b..2f7500040b0765d06f18e502be86b419b8783239 | 3 | 0 |
| M005 | 2f7500040b0765d06f18e502be86b419b8783239..c4a766ce26e62901c29c8f1165a3d0d4f10d4567 | 1 | 1 |
| M006 | 2f7500040b0765d06f18e502be86b419b8783239..57387f904558705718412d325a2e24c64cada7bd | 3 | 1 |
| M007 | 57387f904558705718412d325a2e24c64cada7bd..6c86ff2023999a8f976ad6ddc32a672a2ba29e5f | 4 | 5 |

Totals: Blocking 13, Advisory 9, Noise 0.

Range: see reviewed ranges table above.

## M001

### F1 — S16 verdict "works" contradicts its own evidence (Meta absent)
Severity: blocking
File: research/raw/s16-meta-lookup.json:15-17
Verdict: false
Claim: The evidence records `"meta": "absent (expected 'provided, not created yet')"` yet sets `"verdict": "works"` for the companion-package Meta-class lookup; the research note repeats "Verdict: works". A lookup whose target token is absent cannot be recorded as working without degradation.
Evidence: `research/raw/s16-meta-lookup.json:15` `"meta": "absent (expected 'provided, not created yet')"` and `:17` `"verdict": "works"`; `research/05-spikes.md:15-17` "Verdict: **works**."
Remedy: Change the recorded verdict to `works-with-degradation` (or `fails`) with the reason that `Meta` is absent from all five injectors and identity-only token-name matching cannot resolve a Meta instance; update `research/05-spikes.md` to match.

### F2 — Filing ledger cites the non-maintained skill copy
Severity: advisory
File: docs/filing-ledger.md:66
Verdict: verified
Claim: Evidence paths in the ledger point at `.claude/skills/...` (e.g. `control-pangular-inspector`), while the maintained copies live under `.commandcode/skills/...`; on a Command Code install the cited paths do not exist.
Evidence: `docs/filing-ledger.md:66` "`.claude/skills/control-pangular-inspector/features/source-scan.md`" and `:86` "`.claude/skills/control-pangular-inspector/SKILL.md:172`"; AGENTS.md states `.commandcode/skills/` is the maintained copy.
Remedy: Rewrite these references to `.commandcode/skills/...` (or state both trees) so they resolve on the maintained install.

## M002

No defects found — reviewed 5953b12..dc6e693 at HEAD 5213c95.

## M003

### F1 — Bridge treats Windows junctions as non-links (helper defined but unused)
Severity: blocking
File: scripts/sidecar-deps-bridge.mjs:37
Verdict: verified
Claim: `isSymlinkLike` (line 37) accounts for both `isSymbolicLink()` and `isJunction()`, but every link check in the module calls `st.isSymbolicLink()` directly, so a junction (the type actually created on Windows via `symlinkSync(..., 'junction')` at line 111) is misclassified: an existing correct junction is rejected as "already exists and is not a bridge" (line 108), a wrong-target junction is not detected (line 95/101), and `doUnlink` does not remove it, leaving a dangling junction after retire (line 122/129). `isBridgeCorrect` likewise returns false for a correct junction (line 156).
Evidence: `grep isSymlinkLike scripts/sidecar-deps-bridge.mjs` returns only the definition at line 37; lines 44, 95, 122, 156 call `.isSymbolicLink()` directly.
Remedy: replace each `.isSymbolicLink()` gate with `isSymlinkLike(st)` (and in `sameTarget`/`isBridgeCorrect` accept junctions), so create/reuse/unlink/verify handle the junction type the bridge itself creates.

### F2 — Stale relative artifact paths in relocated control skill docs
Severity: advisory
File: .commandcode/skills/control-ai-browsers/SKILL.md:119
Verdict: verified
Claim: Runtime artifacts moved under `.commandcode/worktrees/tmp/control-ai-browsers` (control.mjs `ARTIFACT_ROOT`/`TMP`), but SKILL.md still documents relative `tmp/control-ai-browsers/...` for extension results, state files, and evidence dirs (lines 119, 137, 224), and the comment at control.mjs:901 repeats the old relative path. Users following the docs look in the wrong (now git-ignored root `tmp/`) location.
Evidence: `grep -n "tmp/control-ai-browsers" .commandcode/skills/control-ai-browsers/SKILL.md` returns lines 119, 137, 224; control.mjs:901 comment.
Remedy: update those doc references to the `.commandcode/worktrees/tmp/control-ai-browsers/...` form (and the line 901 comment) to match the relocated runtime paths.

## M004

### F1 — MAIN-world state event is not bridged to the extension
Severity: blocking
File: extension/relay.js:6
Verdict: verified
Claim: relay.js registers listeners only for 'angular-ai:record' and 'angular-ai:di-graph'; the 'angular-ai:state' event emitted by agent-main.js (announceState) is never forwarded via chrome.runtime.sendMessage, so the panel never receives supported/not-supported state.
Evidence: extension/relay.js:6-12 (two addEventListener calls); extension/agent-main.js:116-123 dispatches STATE_EVENT with supported/reason/zoneMode/features.
Remedy: add a window.addEventListener('angular-ai:state', ...) that forwards e.detail to chrome.runtime.sendMessage with type 'angular-ai:state'.

### F2 — State message contract mismatch between producer and consumer
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Claim: agent-main.announceState sends { supported, reason, ... }, but ExtensionMessageService.handleMessage checks msg.notSupported and reads msg.notSupportedReason; even if bridged, a not-supported page never sets notSupported/notSupportedReason, so the panel's "not supported" branch never renders from a real state message.
Evidence: extension/agent-main.js:117-121 (supported/reason); apps/.../extension-message.service.ts:51-56 (notSupported/notSupportedReason).
Remedy: align the contract in one place — either have the service treat msg.supported === false and use msg.reason, or have the producer emit notSupported/notSupportedReason.

### F3 — E2E chain spec contains only placeholder assertions
Severity: blocking
File: spikes/ng222-app/e2e/chain.spec.ts:12
Verdict: verified
Claim: both tests assert only expect(true).toBe(true) and never exercise the panel DOM or the expected "click -> count -> double -> app-counter template" chain, so the spec provides no verification.
Evidence: spikes/ng222-app/e2e/chain.spec.ts:7-18 (button?.click(); expect(true).toBe(true)).
Remedy: replace placeholders with real assertions driving the panel against the ng222-app fixture and asserting the rendered chain text.

## M005

### F1 — Panel never marks the page unsupported
Severity: blocking
File: apps/angular-ai-devtools/src/app/extension-message.service.ts:51
Verdict: verified
Claim: The service keys off `msg.notSupported`, but agent-main announces state with `supported`/`reason`, so the not-supported branch can never fire and `ext.notSupported()` stays false in the real extension.
Evidence: agent-main.js:116-123 dispatches `{ supported, reason, zoneMode, features }`; extension-message.service.ts:51-56 checks `if (msg.notSupported)`.
Remedy: Treat `msg.supported === false` (and read `msg.reason`) when handling `angular-ai:state`.

### F2 — serializeGraph assumes graph.edges exists
Severity: advisory
File: extension/agent-main.js:273
Verdict: verified
Claim: The edge-resolution loop reads `graph.edges.length` without guarding for an undefined/missing edges array, so a graph snapshot without edges throws inside the profiler close cycle.
Evidence: agent-main.js:273 `for (var j = 0; j < graph.edges.length; j++)` with no preceding `graph.edges` check (only `graph.nodes` is checked at line 259).
Remedy: Guard with `var edges = graph.edges || []` and iterate that.

## M006

### F1 — Regression gate is vacuous
Severity: blocking
File: src/regression.spec.ts:5
Verdict: verified
Claim: The only assertion is `expect(true).toBe(true)`, so the gate cannot detect any regression in the M006 provenance work.
Evidence: `src/regression.spec.ts` lines 1-7 contain `it('passes', () => { expect(true).toBe(true); });`.
Remedy: Replace with assertions that exercise the tracer/panel/anti-pattern logic, or remove the attested gate.

### F2 — Missing src/panel extension-prompt.service re-export
Severity: blocking
File: src/panel (extension-prompt.service.ts absent)
Verdict: verified
Claim: The MANIFEST/spec cite `src/panel/extension-prompt.service.ts`, but no such file exists; only `anti-patterns.ts`, `chain.ts`, and `provenance.component.ts` are present, so the panel Prompt API wiring is not represented in the src/ layout.
Evidence: `ls src/panel` shows only `anti-patterns.ts`, `chain.ts`, `di-*.ts`, `provenance.component.ts`; `git diff ... -- src/panel` added only three re-export files.
Remedy: Add `src/panel/extension-prompt.service.ts` re-exporting `apps/angular-ai-devtools/src/app/extension-prompt.service`, or drop the citation.

### F3 — Main-world tracer ignores the serialized graph edge shape
Severity: blocking
File: src/main-world/provenance-tracer.ts:32
Verdict: verified
Claim: `outgoing()` only follows `node.dependents/consumers/producers` or edges with `from`/`to`, but the extension serializes nodes without adjacency fields and edges as `{ consumer, producer }`; a real graph therefore yields only the selected node.
Evidence: `src/main-world/provenance-tracer.ts` lines 28-40 check `e.from === id`/`e.to`; `extension/agent-main.js` lines 273-278 emits `edges.push({ consumer: consumerId, producer: producerId })` with nodes carrying no adjacency fields.
Remedy: Build adjacency from `consumer`/`producer` edges (producer -> consumer and reverse) and traverse both directions.

### F4 — src/panel and src/main-world modules are not consumed
Severity: advisory
File: src/panel/provenance.component.ts:1
Verdict: verified
Claim: No runtime or test importer references `src/panel/*` or `src/main-world/provenance-tracer.ts`, so the "moved to src/ layout" panel/tracer modules are effectively orphaned.
Evidence: repository-wide search for `provenance-tracer` and `src/panel/(provenance|chain|anti-patterns)` returns only spec/archive references, not runtime imports.
Remedy: Wire these modules into the extension build/tests or remove the dead re-export layer.

## M007

### F1 — agent-main.js records isViewProvider from a non-existent field
Severity: blocking
File: extension/agent-main.js:394
Verdict: verified
Claim: `pr.viewProviders` never exists on Angular's `ProviderRecord` (real field is `isViewProvider`), so `isViewProvider` is always recorded as `false`; view providers are silently mislabelled.
Evidence: extension/agent-main.js:394 `isViewProvider: typeof pr?.viewProviders === "boolean" ? pr.viewProviders : false`; node_modules/@angular/core/types/core.d.ts:7322 `isViewProvider: boolean;`
Remedy: read `pr.isViewProvider` instead of `pr.viewProviders`.

### F2 — token names stringified from Type/InjectionToken objects
Severity: blocking
File: extension/agent-main.js:389
Verdict: verified
Claim: `String(pr.token)` produces function source / "[object Object]" for real Angular tokens (Type or InjectionToken); provider tokens are not human-readable.
Evidence: extension/agent-main.js:389 `var token = ... String(pr.token != null ? pr.token : pr.name) ...`; core.d.ts:7318 `token: Type$1<unknown> | InjectionToken<unknown>;`; ng-inspect.js uses tokenName(p.token) handling functions.
Remedy: derive name via `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`.

### F3 — provider kind always "none" because providerType field does not exist
Severity: blocking
File: extension/agent-main.js:390
Verdict: verified
Claim: Angular's record exposes `provider` (SingleProvider), not `providerType`, so `(pr && pr.providerType) || "none"` is always "none".
Evidence: extension/agent-main.js:390 `var providerType = (pr && pr.providerType) || "none";`; core.d.ts:7326 `provider: SingleProvider;`
Remedy: inspect `pr.provider` (useClass/useFactory/useValue) to classify kind.

### F4 — element injector identity lost (source read from non-existent meta.name/displayName)
Severity: blocking
File: extension/agent-main.js:380-383
Verdict: verified
Claim: For element injectors, `ɵgetInjectorMetadata` returns `{type:'element', source: RElement}` with no `name`/`displayName`, so `injectorName` stays "Injector" and every element injector is recorded as "Injector".
Evidence: extension/agent-main.js:380-383 `if (meta.name) ... else if (meta.displayName) ...`; core.d.ts:8774-8775 `type: 'element'; source: RElement;`; ng-inspect.js maps source Element to `<tag>`.
Remedy: when meta.type === 'element' and meta.source is an Element, use its tagName; when environment, use the string source.

### F5 — importPath stringified from array of types
Severity: advisory
File: extension/agent-main.js:396
Verdict: verified
Claim: Real `importPath` is `(Type | AbstractType)[]`; `pr.importPath || pr.moduleName` is used directly and stringified to comma-joined function sources.
Evidence: extension/agent-main.js:396 `importPath: (pr && (pr.importPath || pr.moduleName)) || source || undefined`; core.d.ts:7330 `importPath?: (Type$1<unknown> | AbstractType<unknown>)[];`
Remedy: map importPath array to type names.

### F6 — diff compares all provider tokens, not the queried token
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-diff-display.ts:46
Verdict: verified
Claim: Divergence is declared whenever any provider token differs, whereas spec describes divergence at the first injector holding a different provider for the queried token.
Evidence: di-diff-display.ts:46 `if (tokenKey(a[i]?.providers) !== tokenKey(b[i]?.providers))` where tokenKey sorts all tokens.
Remedy: diff on the queried token (or accept broader divergence but document).

### F7 — explain button never disabled when Prompt API unavailable
Severity: advisory
File: apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:51
Verdict: verified
Claim: Button has no disabled binding; E5 requires it disabled with availability reason when Prompt API is unavailable; explain() silently returns.
Evidence: n3-di-doctor.component.ts:51 `<button (click)="explain()" data-testid="explain">Explain</button>`; intent INTENT.md E5.
Remedy: bind disabled to `!prompt.ready()` and show availability reason.

### F8 — DiDoctorService accumulates duplicate paths on repeated messages
Severity: advisory
File: apps/angular-ai-devtools/src/app/di-doctor.service.ts:17-19
Verdict: verified
Claim: Each 'angular-ai:di-graph' message appends without dedup by component, so repeated queries duplicate entries in availablePaths.
Evidence: di-doctor.service.ts:17-19 `this.availablePaths.update((list) => [...list, m.resolutionPath!]);`
Remedy: upsert by component name.

### F9 — stated non-support (injection flags, providedIn 'any') is honoured, but viewProviders handling is not
Severity: advisory
File: extension/agent-main.js:394
Verdict: partial
Claim: No code path claims to handle @Self/@SkipSelf/@Host/@Optional or providedIn:'any'; however viewProviders is silently recorded wrong (see F1), so the "viewProviders visibility" non-support is not honoured as a clean omission.
Evidence: grep of src/ and extension/ shows no injection-flag or providedIn handling; F1 shows viewProviders misrecorded.
Remedy: document non-support in UI and fix F1 so view providers are at least labelled.
