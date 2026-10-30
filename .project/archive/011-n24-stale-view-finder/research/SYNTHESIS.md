# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Hedged finding wording "the template may show a stale value" (INTENT.md Prohibition N1 / Scope out).
- No new page-side instrumentation; scan reuses the existing MAIN-world agent (INTENT.md Prohibition N5).
- No generalization beyond direct `this.field =`/`.set(`/`.update(` in subscribe (INTENT.md Scope out).
- No code generation of app code; findings may name a pattern and official schematic only (CHARTER.md; INTENT.md Scope out).
- No page/user data in prompts beyond the shaped fact list (INTENT.md Prohibition N4; CHARTER.md).
- Worker terminates on panel close and tab teardown; no live worker after close (INTENT.md Prohibition N6).
- A node with no resolvable owner reports "no owning component" (INTENT.md Prohibition N2).
- Findings ordered by template-node traversal order; rescan is deterministic (INTENT.md Edge E4).
- One finding per node + field (INTENT.md Edge E5).
- Empty scan renders explicit "no stale-view findings" state (INTENT.md Edge E2).
- Write form matches `this.field` then `=`, `.set(`, `.update(` with arbitrary whitespace/newlines; whole-identifier only (INTENT.md Edge E3).
- Angular < 22.1.3 renders an explicit unsupported note naming the detected version and no finding (INTENT.md Edge E1).
- Missing fact → panel names it and does not call the Prompt API (INTENT.md Edge E7).
- Fact list is plain text (field name, owning component, pattern label) with escaping-safe shape (INTENT.md Edge E8).
- M010 ledger repair (T002, T005, T011, T012) runs before N24 feature work (INTENT.md Scope in; correction "3: Repair first.").
- Read-only phases never drive browsers (CHARTER.md).
- Codebase gates `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` must pass (INTENT.md Constraints; CHARTER.md).
- Panel uses its own `LanguageModel.availability()`, never the page's (INTENT.md Constraints).

## Decisions

### Scan placement and surface

- **Decision**: Run the source scan inside the existing MAIN-world agent (`extension/agent-main.js`), extending `captureGraph`/`serializeGraph` to read each scannable template/computed node's `debuggableFn` body text and match there; findings travel back over the existing relay/background message contract. No new page global or hook.
- **Runner-up**: Scan in the panel from `debuggableFn.name` only — impossible because function source never crosses the MAIN-world/panel boundary (the agent serializes only the name).
- **Evidence**: evidence-domain.md § Finding: The shipped agent serializes only `debuggableFn.name`, not the body; INTENT.md Prohibition N5 (judgment).
- **Confidence**: high

### Reading `debuggableFn` source given name-only serialization

- **Decision**: Extend `serializeGraph` to include `debuggableFn.toString()` text for template and computed nodes (bounded to class source); classify from text only and never invoke `debuggableFn`.
- **Runner-up**: Invoke `debuggableFn` to extract writes — rejected: it holds the whole class source as an arbitrary function with side effects (e.g. ViewContainerRef/`angular:di_graph` destroys the graph).
- **Evidence**: evidence-domain.md § Finding: `ng.ɵgetSignalGraph` exposes `debuggableFn` only for computed and template nodes; evidence-pitfalls.md § Finding: The scan is availability-gated on dev builds 22.1.3+ and on an intact signal graph (dead-end "Invoking debuggableFn").
- **Confidence**: high

### Scan worker and supersession (E6)

- **Decision**: Run the per-page scan in a dedicated worker owned by the panel/extension (not the page); each scan carries a cancellation token so a newer rescan supersedes the in-flight one and discards its result; only the newest result renders.
- **Runner-up**: Synchronous scan on the panel main thread — blocks the UI and risks interleaving two scans.
- **Evidence**: INTENT.md Edge E6 (concurrency); CHARTER.md Constraints (worker-friendly delivery); evidence-pitfalls.md § Finding: Source-text boundary detection is an inherent false-positive/false-negative trap of the heuristic.
- **Confidence**: low

### Angular 22.1.3 gate (E1)

- **Decision**: In the agent, detect the page's Angular version (from `ng.VERSION`/version marker); on 22.1.2 or older announce an explicit unsupported result naming the detected version and produce no finding; scan only on 22.1.3+.
- **Runner-up**: Best-effort scan on any 22.x — yields false negatives or phantom findings on older builds lacking template-node `debuggableFn`.
- **Evidence**: evidence-pitfalls.md § Finding: The scan is availability-gated on dev builds 22.1.3+ and on an intact signal graph; INTENT.md Edge E1 (boundary).
- **Confidence**: high

### Confirming a plain non-signal field

- **Decision**: At scan time in the agent, resolve the component instance from the template node's `lView[CONTEXT]` and accept the write only when `ng.isSignal(instance[field]) === false`; if the instance is unavailable, report no owning component and skip.
- **Runner-up**: Infer signal-vs-plain from the graph alone — the graph carries no such metadata.
- **Evidence**: evidence-domain.md § Finding: Determining whether a field is a non-signal plain field needs instance inspection; evidence-pitfalls.md § Finding: The only measured detection is a direct `this.field`/`.set`/`.update` inside a `subscribe(...)` callback on a non-signal plain field.
- **Confidence**: low

### Fact-list shape for the panel-local Prompt API (E7, E8)

- **Decision**: The fact list carries exactly three plain-text fields — field name, owning component name, and pattern label ("direct write in subscribe callback") — with no page markup, URL, template source, or identity data; a field name needing escaping is treated as literal text. If any fact cannot be shaped, the panel names the missing fact and does not call the Prompt API. Every call follows an explicit user click.
- **Runner-up**: Include a template-source snippet for richer explanations — violates Prohibition N4 and cannot be derived from available surfaces.
- **Evidence**: INTENT.md Edges E7/E8 (empty/encoding); INTENT.md Prohibitions N3, N4; evidence-domain.md § Finding: `ReactiveNodeKind` has no entry for plain (non-signal) fields or template reads.
- **Confidence**: high

### Verification shape for SC5 and SC6

- **Decision**: SC5 runs the `lars-verify` claim across all four supported model instances (chrome-stable-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini); instances that cannot answer are recorded as could-not-run with their instance name and the claim is not `verified` until all four answered. SC6 runs against the insurance-portal route when a route can produce a subscribe write; otherwise the claim records that the external dependency was not exercised and why.
- **Runner-up**: Single-model smoke test — fails SC5's four-model end-to-end requirement.
- **Evidence**: INTENT.md Success criteria 5/6 and Edges E9/E10; CHARTER.md Constraints (verification policy).
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (1) M010 ledger repair for T002/T005/T011/T012 at current head before any N24 code; (2) low-confidence instance-inspection path for signal-vs-plain confirmation; (3) low-confidence worker supersession mechanism; (4) Angular version detection on the page; (5) held-out tests for E1-E10 and the E3 regex.
- **Walking skeleton**: counter fixture with a plain field written inside a `subscribe` callback → agent captures graph, scans `debuggableFn` source, confirms non-signal field, reports one finding "the template may show a stale value" → panel renders it → user click → panel-local Prompt API explains the three-fact list. End-to-end on all four model instances.
- **Pitfalls → tasks**: source-text false positives (comments/strings, nested functions) → held-out E3 tests plus hedged wording; helper/other-object writes → out of scope, documented not covered; template-read unchecked → keep "may" hedging (N1); destroyed graph (ViewContainerRef/`angular:di_graph`) → report unavailable, not "no findings"; minified/production page → unsupported note, no finding; worker leak on close → terminate on panel close/tab teardown (N6).

## User rulings

- "1: Approve" — milestone intent approved as drafted (2026-10-30).
- "2: Accept." — seven doc-vs-code rulings accepted as drafted (2026-10-30).
- "3: Repair first." — M010 ledger repair for T002, T005, T011, T012 runs before N24 feature work (2026-10-30).

## Still unknown

- Whether an insurance-portal route can produce a subscribe write (E10) — plan: wave-1 spike; if none, record external dependency not exercised.
- Whether `ng.isSignal` is reachable from the MAIN-world agent at scan time — plan: wave-1 spike.
- Exact worker API and supersession token design — plan: wave-1 spike.
- Whether `setTimeout`/`Promise`/`queueMicrotask` variants ship in this milestone — plan: scope decision at planning (no new instrumentation needed).