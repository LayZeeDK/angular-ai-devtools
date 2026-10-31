# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source.; Which N25 detections beyond the measured direct cases need new instrumentation.

## Finding: The MAIN-world agent serialises both the node label and the function source, but collapses `debuggableFn` to its name

- **Claim**: `serializeGraph` in `extension/agent-main.js` copies `n.label` verbatim into `label` and writes `debuggableFnSource: String(n.debuggableFn)` (the full function body), while reducing `debuggableFn` itself to `n.debuggableFn.name` only.
- **Source**: extension/agent-main.js:321-336
- **Confidence**: high
- **Why it matters here**: A keep-list can therefore key on either the label (`toSignal.source`, `toSignal.state`) or the source text, because both survive the extension boundary; the function object itself does not.

## Finding: `debuggableFn` (the function object) does not survive serialisation; only its stringified body does

- **Claim**: The shipped graph node carries `debuggableFn: <name or null>` and `debuggableFnSource: <String(fn) or null>`; the original function reference, closure, and any non-string properties are dropped at the boundary.
- **Source**: extension/agent-main.js:334-335
- **Confidence**: high
- **Why it matters here**: Any classifier that needs runtime behaviour of the function (calling it, inspecting locals) is impossible on the panel side; only textual matching on `debuggableFnSource` is available, inheriting all source-text blind spots.

## Finding: The measured portal nodes expose `toSignal.source`/`toSignal.state` by label and a `fn` body containing the source

- **Claim**: The captured portal graph (`research/raw/tosignal-node-portal.json`) records a `computed` node with label `toSignal.source` whose `fn` is the full function body, plus a `signal` node labelled `toSignal.state`; these labels are stable across the Angular 22.2.2 dev build.
- **Source**: research/raw/tosignal-node-portal.json:1
- **Confidence**: medium
- **Why it matters here**: Confirms the label rule works for the measured direct cases; it is the precedent for "recognised by label".

## Finding: The unlabelled effect has no `toSignal.*` label, so a label-only rule misses it

- **Claim**: The N25 keep-list must keep an effect whose `debuggableFn` source contains `subject.error`; such a node carries no `toSignal.*` label, so matching on label alone yields a false negative for the unlabelled effect (E5 held-out test).
- **Source**: INTENT.md (Scope: in, E5 edge row); extension/agent-main.js:334-335
- **Confidence**: high
- **Why it matters here**: The classifier needs both rules; the label rule alone cannot satisfy SC1's "unlabelled effect" requirement.

## Finding: N24's stale-view scan is the measured precedent for a source-text rule, with documented blind spots

- **Claim**: `nodeText` prefers `debuggableFnSource`, then a string `debuggableFn`, then `fn.toString()`; matching uses a whole-identifier regex (`this.<id>` followed by `=`/`.set(`/`.update(`) with arbitrary whitespace tolerance. Source-text matching is therefore already shipped and tested, and its known failure modes (helper indirection, minified/transformed identifiers, unrelated nodes whose source mentions the token) apply identically to an interop `subject.error` rule.
- **Source**: src/main-world/stale-view-scan.ts:82-143; extension/stale-view-worker.js:54-63
- **Confidence**: high
- **Why it matters here**: Reusing the N24 matcher shape keeps the two scans consistent, but the same false-positive/false-negative profile must be accepted and tested (E5 pins both directions).

## Finding: A source-text-only rule produces false positives on unrelated nodes whose source mentions the token

- **Claim**: Any node whose `debuggableFnSource` happens to contain the substring `subject.error` (e.g. a commented reference, a helper, or a different Subject) would be kept by a pure source-text rule; the N24 scan has the same class of false positive and mitigates only by scoping to `template`/`computed` kinds and whole-identifier matching.
- **Source**: src/main-world/stale-view-scan.ts:145-148; INTENT.md Prohibition N3
- **Confidence**: medium
- **Why it matters here**: The classifier's two rules must not be widened into a third, fixture-shaped exception (N3); the source-text rule should be anchored to a whole `subject.error` token match, not a loose substring.

## Finding: Field-to-node attribution by value requires serialising node values, which the shipped agent does not do

- **Claim**: `GraphNode` (apps/.../update-cause-chain.ts) carries only `id, kind, label, epoch, debuggableFn` — no `value`/`debuggableFnSource` — and `serializeGraph` (extension/agent-main.js) emits no `value` field, yet the measured portal capture (research/raw/tosignal-node-portal.json) records a `value` per node. Panel-side value comparison therefore needs new page-side instrumentation to serialise a value summary.
- **Source**: apps/angular-ai-devtools/src/app/update-cause-chain.ts:19-25; extension/agent-main.js:329-336; research/raw/tosignal-node-portal.json:1
- **Confidence**: high
- **Why it matters here**: Q2's "new instrumentation" item: without serialising values (at least a type/length/primitive summary), the "inferred, untested" attribution cannot be computed at all; this is the one N25 detection that `ng.ɵgetSignalGraph` alone does not cover on the panel side.

## Finding: Slicing direct producers/consumers needs no new instrumentation

- **Claim**: `ng.ɵgetSignalGraph` already returns `edges` with `consumer`/`producer` indices, and `serializeGraph` already resolves those to global node ids; the interop slice can reuse the existing provenance tracer's edge walk.
- **Source**: extension/agent-main.js:347-356; src/main-world/provenance-tracer.ts:52-75
- **Confidence**: high
- **Why it matters here**: Only the keep-list classifier and value serialisation are new work; producer/consumer slicing reuses shipped machinery.

## Assigned questions — answers

- Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source. → Both: labels `toSignal.source`/`toSignal.state` survive as `label` (extension/agent-main.js:332), and the function body survives as `debuggableFnSource` (extension/agent-main.js:335) while `debuggableFn` is reduced to its name (line 334). The label rule keeps the measured toSignal nodes; the source-text rule is required for the unlabelled effect whose source contains `subject.error`. Neither alone suffices — label-only misses the unlabelled effect (false negative), source-only risks false positives on unrelated nodes mentioning the token and false negatives under helper indirection/minification. Confidence: high.
- Which N25 detections beyond the measured direct cases need new instrumentation. → Only value serialisation for field-to-node attribution needs new page-side instrumentation (the shipped `serializeGraph` emits no `value`, while `GraphNode` has none; the measured portal capture shows `value` per node). Identifying `toSignal.*` nodes, the `subject.error` effect, slicing direct producers/consumers, and the limitation wording all reuse `ng.ɵgetSignalGraph` output plus existing serialisation and the provenance tracer. Confidence: high.

## Dead ends

- Searching `src/` and `extension/` for an existing library-internal filter / keep-list — none exists in code today; only intent/proposal docs reference it. The classifier is greenfield. (grep `keepList|keep-list|isInternal|library` returned no source matches.)
- Looking for a `value` field in the shipped `GraphNode` / `serializeGraph` — absent; value-based attribution is not implementable from current serialised output, confirming it needs new instrumentation rather than reuse.