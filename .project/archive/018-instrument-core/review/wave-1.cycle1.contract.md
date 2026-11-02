# Review — wave 1, cycle 1

Wave: 1
Cycle: 1
Depth: deep
Lens: contract
Wave verdict: pass
Tasks reviewed: 2

## T001 — Build the tool-registry envelope and its declaration and backing records: pass
- ✅ `set "NODE_ENV=development"` + `nx run angular-ai-devtools:test --skip-nx-cache --include=.../tool-registry.spec.ts --include=.../hostile-tools.spec.ts` → 2 files, 32/32 tests passed (tool-registry.spec.ts 23/23); `tool-registry.ts` imports only `@angular/core` (lines 30-38) and exports every contract name.

## T002 — Prove the envelope with six hostile tools and pin each shape's kind, host and outcome: pass
- ✅ hostile-tools.spec.ts: 9/9 tests passed; E1 pins declared `kind`/`host`/`outcome` for all six shapes and mutates one required field at a time (hostile-tools.spec.ts:174-196); triples are pairwise distinct (hostile-tools.spec.ts:154-172).

## Intent coverage

### SC1 — Six hostile tools pass through the envelope: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.: pass
- ✅ All six hostile shapes registered through `provideTools()` in the spec's own TestBed (hostile-tools.spec.ts:86-90); confirm write performs nothing before token and once after (hostile-tools.spec.ts:198-227); async handle settles to result (hostile-tools.spec.ts:229+); image returns mime type + data URL; page-state returns `host-unavailable` when fact absent.

## Criteria walkthrough

T001
1. pass — `tool-registry.ts` exports `ToolKind`, `ToolHost`, `ToolOutcomeKind`, `ToolPublish`, `ToolProvenance`, `ToolErrorCode`, `ToolDeclaration`, `ToolOutcome`, `ToolContext`, `ToolBacking`, `ToolRegistry`, `ToolDeclarationError`, `defineTool`, `provideTools`, `provideToolRegistry`, `TOOL_REGISTRY` (tool-registry.ts:41-181); missing `id`/`kind`/`host`/`outcome`/`publish` rejected with `ToolDeclarationError` carrying `toolId`+`field` (tool-registry.ts:424-498).
2. pass — empty `host` (tool-registry.ts:449-454), unknown host (456-464), unknown kind (434-440), unknown outcome (470-476), unknown publish (482-488), duplicate id (492-498) each throw `ToolDeclarationError` naming id+field.
3. pass — E2 test passes: declared tool with no backing returns `{ kind: 'error', code: 'not-implemented', toolId }` (tool-registry.spec.ts:202-...; code tool-registry.ts:266-273).
4. pass — unknown id returns `{ kind: 'error', code: 'invalid-input' }` (tool-registry.ts:261-264); unknown handle (314-321); pending handle answers `{ kind: 'async-handle', handle }` (326); settled handle answers backing outcome (322-324).
5. pass — `provideToolRegistry()` in app.config.ts:14; `TestBed.inject(TOOL_REGISTRY)` in specs; full combined run 32/32 passed.
6. pass — imports only `@angular/core` (tool-registry.ts:30-38); grep for `document|window|page-reads` found no matches.

T002
1. pass — exactly six tools exported individually and as `HOSTILE_TOOLS` (hostile-tools.ts:342-349); shapes match required kind/host/outcome and `publish: 'internal'` (hostile-tools.spec.ts:134-152).
2. pass — six triples pairwise distinct (hostile-tools.spec.ts:154-172); N1 separation recorded in source comments (hostile-tools.ts:45-336).
3. pass — E1 test (hostile-tools.spec.ts:174-196) asserts declared fields and mutation deletion throws `ToolDeclarationError` with tool id + deleted field.
4. pass — confirm write performs nothing before token, writes once, refuses second use (hostile-tools.spec.ts:198-227; code hostile-tools.ts:61-96).
5. pass — async shape returns async-handle and `awaitHandle` settles to result (hostile-tools.spec.ts:229+; code hostile-tools.ts:123-144).
6. pass — image returns mime type + data URL; page-state returns result with fact present and `host-unavailable` when absent (hostile-tools.ts:154-172, 275-336).
7. pass — wrapped third-party returns `provenance: 'third-party'` on success and `third-party-failed` on throw/reject without throwing (hostile-tools.ts:220-253); all six registered via `provideTools()` in spec TestBed only; `app.config.ts`/`tool-registry.ts` unchanged.

## Findings

No blocking findings. Advisory: `awaitHandle` reports unknown handles under `toolId: handle` (tool-registry.ts:316-319), which is consistent with the contract's `invalid-input` requirement but uses the handle string as the tool id; non-blocking.