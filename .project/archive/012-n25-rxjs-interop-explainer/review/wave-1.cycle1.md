# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: 4beb3ea52e597a0e109749a048bc989138756036

## T001 — Add optional `value` field to serialised graph nodes and TS interfaces: pass

- ✅ `serializeGraph` emits a `value` field on every node when a value can be read, and omits/best-efforts it otherwise; serialisation never throws. — `git show a598ef1e5a512315144d873969dbd0acec934eec` hunk in `extension/agent-main.js` (lines 326-346) wraps the value read/summary in try/catch and only sets `pushedNode.value` when `valueSummary !== undefined`; orchestrator Verify ledger row 1 exit 0 at a598ef1e5a512315144d873969dbd0acec934eec.
- ✅ `GraphNode` and `SignalGraphNode` compile with the new optional `value` field. — `apps/angular-ai-devtools/src/app/update-cause-chain.ts` adds `value?: unknown;` and `src/main-world/provenance-tracer.ts` adds `readonly value?: unknown;`; ledger row 1 `npm run check` exit 0 at a598ef1e5a512315144d873969dbd0acec934eec.
- ✅ N1/N2/N3/N4/N24 consumers still type-check and their tests still pass. — the commit diff touches only the three declared product files plus the task file, with no consumer edits; the new field is optional, so existing consumers ignore it; ledger row 1 `npm run check` exit 0 at a598ef1e5a512315144d873969dbd0acec934eec.
- ✅ `npm run check` passes. — ledger row 1 recorded command `node --check extension/agent-main.js && npm run check`, result pass, exit 0, at a598ef1e5a512315144d873969dbd0acec934eec.

## T002 — Implement interop keep-list classifier (label + subject.error source rules): pass

- ✅ A node whose label is `toSignal.source` or `toSignal.state` is kept. — `src/main-world/interop-keep-list.ts` Rule 1 returns true for both labels; ledger row 2 stdout shows `✔ label toSignal.source kept` and `✔ label toSignal.state kept`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ A node with no label but whose `debuggableFnSource` contains a whole-token `subject.error` is kept (E5 held-out). — ledger row 2 stdout shows `✔ no label but debuggableFnSource contains subject.error kept (E5)`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ A library-internal node matching neither rule is filtered (E5 held-out). — ledger row 2 stdout shows `✔ library-internal node matching neither rule filtered (E5)`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ `subject.error` matching is whole-token; `subject.errorHandler`/`xsubject.error` do not match. — `SUBJECT_ERROR_RE = /(?<![A-Za-z0-9_$])subject\.error(?![A-Za-z0-9_$])/`; ledger row 2 stdout shows `✔ whole-token: subject.errorHandler does not match` and `✔ whole-token: xsubject.error does not match`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ No third, fixture-shaped exception exists in the classifier (Prohibition N3). — `isInteropNode` contains only the label equality (Rule 1) and the whole-token regex (Rule 2); no additional branch observed in `src/main-world/interop-keep-list.ts`.
- ✅ `src/main-world/interop-keep-list.spec.ts` passes under node:test. — ledger row 2 stdout reports `tests 8`, `pass 8`, `fail 0`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ `npm run check` passes. — ledger row 2 recorded command includes `npm run check`, result pass, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.

## T003 — Extend stale-view-fixture.ts with toSignal and subject.error effect: pass

- ✅ The fixture imports `toSignal` and declares a `toSignal(this.updates)` field. — `git show fe222784...` hunk adds `import { toSignal } from '@angular/core/rxjs-interop';` and `readonly signal = toSignal(this.updates);` in `spikes/ng222-app/src/app/stale-view-fixture.ts`.
- ✅ The fixture's constructor contains an effect calling `this.updates.error(...)`. — same commit hunk adds `effect(() => { this.updates.error(new Error('interop')); });` inside the constructor.
- ✅ The existing `this.updates.subscribe(...)` block and `value` field remain, so the N24 stale-view finding still fires on the same route. — the commit retains the subscribe block (`this.value = next;`) and the file still declares `value = 0;`.
- ✅ No other fixture or route file is changed; the insurance portal is untouched. — commit stat lists only `spikes/ng222-app/src/app/stale-view-fixture.ts` (plus the task file) under product files.
- ✅ `npm run check && node -e "require('fs').readFileSync(process.argv[1])" spikes/ng222-app/src/app/stale-view-fixture.ts` recorded pass. — ledger row 3 result pass at fe222784d97431a3eb0d9afdef31ab6be9c8da1f (command recorded with shell-stripped quotes).

## Intent coverage

### SC4 — The interop keep-list keeps `toSignal.*` nodes on top of the existing library-internal filter.: pass

- ✅ Held-out E5: a node with no label but `debuggableFnSource` containing `subject.error` is kept, and a library-internal node matching neither rule is filtered. — ledger row 2 stdout records both `✔ no label but debuggableFnSource contains subject.error kept (E5)` and `✔ library-internal node matching neither rule filtered (E5)`, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.
- ✅ Prohibition N3: no third, fixture-shaped exception was added; the classifier's two rules are label equality and the whole-token `subject.error` regex only. — observed in `src/main-world/interop-keep-list.ts` (`isInteropNode`).
- ✅ `npm run check` passes for the classifier module. — ledger row 2 recorded command includes `npm run check`, result pass, exit 0 at a444e6771a7e79cf9ce45972d94e9fe0ef201a9b.