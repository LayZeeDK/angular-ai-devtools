# Review — M018 instrument-core, Wave 1, Cycle 1 — adversarial

Wave: 1
Cycle: 1
Depth: deep
Lens: adversarial
Wave verdict: pass
Tasks reviewed: 2

- Head reviewed: `677b6da15866a6efc533f59241e48f23220983de` (T002 landed on top of T001 `9f4cb74`, base `ed6e45d`)
- Reviewed in: `.gsd-path` sidecar checkout `verify/wave-1-cycle-1` (clean at the reviewed head)
- Reviewer: wave reviewer (adversarial pass)
- Review lens: adversarial contract check — every acceptance criterion judged against the landed code and against tests re-run in this checkout, never against the task Log's claims.
- Note on the stub: no `.project/review/wave-1.cycle1.md` stub was emitted in this sidecar (the directory did not exist). This file is the review, written fresh; heading order follows the standard review shape.

## Wave verdict: pass

Every criterion this wave owns (SC1, via T001 AC1–AC6 and T002 AC1–AC7) is proven by the landed code plus tests I executed myself. Findings below are advisories; none blocks the wave.

## How this was verified

- `npm ci --include=dev` in the sidecar (the shell exports `NODE_ENV=production`; installed with `NODE_ENV=development` set). 994 packages, exit 0.
- `node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts --include=apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts --skip-nx-cache` → exit 0, **2 files / 32 tests passed**, vitest root `C:/Users/.../verify/wave-1-cycle-1` (i.e. run against this checkout, cache skipped).
- Full suite in the sidecar: `nx run angular-ai-devtools:test --skip-nx-cache` → exit 0, **12 files / 78 tests passed** (10 pre-existing files / 46 pre-existing tests all green).
- Git evidence read from the sidecar: `git diff --name-only ed6e45d..9f4cb743` and `9f4cb743..677b6da`.
- Environment trap worth recording for the next reviewer: this shell **silently refuses `cd` to a path outside the workspace** (the C: sidecar path), so my first test runs unknowingly executed in the main repo checkout. The main repo is at the identical commit with byte-identical registry sources (`fc /b` clean on all four tool-registry files), so nothing above is invalidated — but all quoted test runs are the re-runs executed with the tool's `cwd` pointed at the sidecar, confirmed by the vitest `RUN ... C:/Users/.../wave-1-cycle-1` header.

## T001 — Build the tool-registry envelope and its declaration and backing records: pass

- ✅ `nx run angular-ai-devtools:test --include=tool-registry.spec.ts --skip-nx-cache` exits 0 with 23/23 passing at 677b6da; the diff ed6e45d..9f4cb743 touches only the three declared files; tool-registry.ts imports only @angular/core and exports no reader.
**AC1 — exports + missing-field rejection: PASS.**
Every contract name is exported from `tool-registry.ts`: the six unions `ToolKind`/`ToolHost`/`ToolOutcomeKind`/`ToolPublish`/`ToolProvenance`/`ToolErrorCode` (lines 41, 44, 47, 50, 53, 56), `ToolFacts`/`ToolInputSchema`/`ToolDeclaration`/`ToolOutcome`/`ToolContext`/`ToolBacking`/`ToolRegistry`/`ToolEntry` (64–129), `ToolDeclarationError` (138), `TOOL_REGISTRY` (181), `defineTool` (189), `provideTools` (194), `provideToolRegistry` (202). Runtime exports are proven by the spec importing and calling them (`tool-registry.spec.ts:102-111`); the type unions are proven by source reading — note that the spec's `import type` lines are erased by esbuild and the vitest pipeline does not type-check, so the *tests* alone do not prove the type exports. `declare()` rejects a declaration missing any of `id`/`kind`/`host`/`outcome`/`publish` with a `ToolDeclarationError` carrying both values (`assertDeclaration`, `tool-registry.ts:421-488`; message format at 147 embeds both) — asserted with exact field/toolId/message containment in `tool-registry.spec.ts:139-157`, including the `<missing-id>` sentinel for a missing id (155) so the error stays assertable.

**AC2 — vocabulary and duplicate rejection: PASS.**
Empty host list (`tool-registry.ts:449-455`), host outside the six (456-464), kind outside the three (434-440), outcome outside the five (470-476), publish outside the three (482-488), duplicate id (492-498) — each a `ToolDeclarationError` naming id and field. Tests: `tool-registry.spec.ts:159-176` (five parametrised rejections) and `:178-187` (duplicate). The accept-side is also pinned: every member of all four vocabularies is declared successfully and the tools signal keeps registration order (`tool-registry.spec.ts:113-136`), so the validator is not merely rejecting everything.

**AC3 — E2, declared without backing: PASS.**
Code path: no backing → `errorOutcome('not-implemented', toolId, ...)` (`tool-registry.ts:266-273`); there is no path from `execute` that returns an empty `result` or throws — the backing call is wrapped twice (sync throw 283-287, rejection 307-311 → `third-party-failed`). Test `tool-registry.spec.ts:202-219`, titled exactly as the plan's held-out table requires (`E2 a declared tool with no backing returns a not-implemented outcome, never an empty result and never a throw`), asserts both `kind !== 'result'` and the full error shape, twice.

**AC4 — execute/awaitHandle failure and handle semantics: PASS.**
Unregistered id → `{ kind:'error', code:'invalid-input', toolId }` and never a throw (`tool-registry.ts:261-264`; test `tool-registry.spec.ts:221-229`). Unknown handle → same (code 314-321; test 356-364). Unsettled handle answers `{ kind:'async-handle', handle }` (code 326; test 344); settled handle answers the backing's outcome (code 322-325; test 349-353, with a manually released deferred so the settled value is the backing's own). Quirk, not a defect: the unknown-handle error reuses the `toolId` field to carry the handle string (`tool-registry.ts:318`), which the test then pins — semantically muddy but consistent with "naming that id" and with the contract's error record shape.

**AC5 — provider wiring + suite green + no component touched: PASS.**
`provideToolRegistry()` is in `app.config.ts:10`; the diff `ed6e45d..9f4cb743` shows exactly one added import and one added provider line, nothing else in the file. `TestBed.inject(TOOL_REGISTRY)` resolution is how every test obtains the registry (`tool-registry.spec.ts:77-81`). Full suite green in the sidecar (12 files / 78 tests, cache skipped). On the AC's literal "46 tests in 10 files": that is the *pre-existing baseline*, and it is exactly preserved — at the wave head, 12 − 2 registry specs = 10 files and 78 − 32 = 46 tests, all passing. `git diff --name-only ed6e45d..9f4cb743` names no `*.component.ts` file.

**AC6 — import/export hygiene (N2, AR-3 precondition): PASS.**
The only import in `tool-registry.ts` is `@angular/core` (lines 30-38). Grep for `document|window|page-reads|reader` over the file matches only the header comment (line 27). The export list (grep above) contains types, `ToolDeclarationError`, `TOOL_REGISTRY`, and the three authoring functions — no reader function; the `TOOL_ENTRIES` token (184) is deliberately module-private, so `provideTools` cannot be reached around by importing it.

## T002 — Prove the envelope with six hostile tools and pin each shape's kind, host and outcome: pass

- ✅ `nx run angular-ai-devtools:test --include=hostile-tools.spec.ts --skip-nx-cache` exits 0 with 9/9 passing; the diff 9f4cb743..677b6da touches only hostile-tools.ts and hostile-tools.spec.ts; each of the six shapes carries a distinct kind/host/outcome triple.
**AC1 — exactly six declared shapes: PASS.**
`hostile-tools.ts` declares exactly six entries, each authored through `defineTool`, exported individually (`confirmWrite` 98, `asyncScan` 123, `snapshotImage` 154, `dualHostRead` 181, `wrappedThirdParty` 256, `pageStateSchema` 301) and as `HOSTILE_TOOLS` (342), with the pinned triples from the contract. The spec pins ids, `publish: 'internal'` for all six (`hostile-tools.spec.ts:134-152`) and each `kind`/`host`/`outcome` against the `SHAPES` table (40-71, asserted at 175-180). The `wrapped_third_party` entry is produced by a factory over a third-party object in its closure — the entry count in `HOSTILE_TOOLS` is still exactly six, asserted (135-137).

**AC2 — N1, pairwise-distinct triples: PASS.**
`hostile-tools.spec.ts:154-172` asserts both pairwise uniqueness and the exact six triples as pinned literals, so relabelling any shape to another's triple fails. `page_state_schema` shares the Tier-0 triple `read|page|result` and separates on `input` being a function of `ToolFacts` — asserted (`typeof input === 'function'`, 146) — and the T002 Log records the separating field for every shape as AC2 requires. I judge N1 satisfied: the sixth shape is the page-state-dependent schema the INTENT itself names as one of the six, and its difference is carried by a declaration-record field, not by a relabelled Tier-0 read; the other five are separated on `kind`, `host` or `outcome` alone.

**AC3 — E1, field assertions + mutation: PASS.**
`hostile-tools.spec.ts:174-196` (exact held-out title): for all six shapes the declared `kind`, `host` and `outcome` are asserted against the table — never a title, never a message — and then each of `kind`, `host`, `outcome`, `publish`, `input` is deleted from a copy and `declare()` must throw a `ToolDeclarationError` with that shape's id and that field, with the registry left empty. The mutation set excludes `id`: deleting `id` necessarily yields the `<missing-id>` sentinel (`tool-registry.ts:426`), so the AC's "carrying that tool's id" is unsatisfiable for that one field — the five-field reading is the only coherent one and the missing-`id` case is separately covered with the sentinel in `tool-registry.spec.ts:139-157`. Not vacuous: the assertion is keyed on both structured fields and would fail on a wrong `field` value.

**AC4 — confirm shape: PASS.**
`hostile-tools.spec.ts:198-227` against the ledger-backed backing (`hostile-tools.ts:61-96`): nothing written before the token (ledger length unchanged), the write performed exactly once on presentation (ledger +1, entry equals the token), a second use of the same token answered `invalid-input` with no further write, and an invented token refused likewise.

**AC5 — async-handle shape: PASS.**
`hostile-tools.spec.ts:229-245`: `execute` answers `{ kind:'async-handle', handle }` immediately; the drained handle settles to the shape's `result` outcome and a second `awaitHandle` returns the same. Envelope side: the handle promise is stored on the instance (`tool-registry.ts:289-305`), a rejection inside the tracked promise is normalised rather than propagated (297-301) — the combination survives the hostile shape.

**AC6 — image + page-state schema: PASS.**
Image: `hostile-tools.spec.ts:247-266` is not a string-comparison test — it decodes the base64, asserts the PNG magic bytes and a 1×1 IHDR, alongside `mimeType: 'image/png'` and the `data:` prefix. Page-state schema: `pageStateSchemaInput` builds different schemas per page (asserted 271-279, including that two pages' schemas differ and the fact-less schema is permissive); `execute` answers `result` with the fact present (281-291) and `{ kind:'error', code:'host-unavailable', toolId:'page_state_schema' }` when absent (293-304), explicitly never an empty `result`.

**AC7 — third-party wrap + registration isolation: PASS.**
`hostile-tools.spec.ts:307-348`: success keeps `provenance: 'third-party'`; both a throwing and a rejecting wrapped `invoke` normalise to `{ kind:'error', code:'third-party-failed', toolId }` via `resolves.toMatchObject` — i.e. `execute` resolves, never rejects. All six register through `provideTools()` in the spec's own TestBed (`newRegistry`, 86-90). `git diff --name-only 9f4cb743..677b6da` = the two hostile-tools files plus the T002 task log: `app.config.ts` and `tool-registry.ts` untouched by T002, as AC7 requires.

## Intent coverage

### SC1 — Six hostile tools pass through the envelope: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.: pass

- ✅ T002 lands all six shapes (`confirm_write`, `async_scan`, `snapshot_image`, `dual_host_read`, `wrapped_third_party`, `page_state_schema`) and its 9 tests assert the declared `kind`/`host`/`outcome` per shape rather than the shape's name; E1's mutation case deletes each field in turn and fails naming the tool id and field, and E2's exact-titled case proves a declared tool with no backing answers `not-implemented` rather than an empty result or a throw. Both verified by re-running the specs in this checkout (32/32 green at 677b6da).

## Findings

No blocking findings. Two advisories, neither owned by a wave-1 criterion:

- **ADV-1 (vacuous assertions in `tool-registry.spec.ts:128-135`).** `expect(PROVENANCES).toEqual([...])` and `expect(ERROR_CODES).toEqual([...])` compare spec-local constants to the same inline literals — these two assertions cannot fail and prove nothing about the product. They sit inside a test whose real content (declaring every vocabulary member and checking registration order) is sound, so the suite's verdict is unaffected. Fix direction: delete the two literal-vs-literal assertions; vocabulary membership is already pinned on the accept side by `declare()` succeeding (113-127) and on the reject side by AC2's tests. If a product-owned source of truth for the unions is wanted, it must be a runtime export from the envelope, not a second list in the spec.
- **ADV-2 (handle maps are never evicted, `tool-registry.ts:232-233, 294-303`).** `pendingHandles`/`settledHandles` keep every handle for the registry's lifetime; on the panel's long-lived registry, repeated async-handle tools accumulate unboundedly. No wave-1 criterion owns handle lifecycle (M019 owns jobs/cancellation), so this is recorded, not blocking. Fix direction: delete the `pendingHandles` entry when the tracked promise settles (keep `settledHandles` only if post-settlement re-reads are required, else return the recorded outcome from a single map and drop it after first read per the contract's discretion).

## Held-out check status (this wave's rows)

| Edge | Status | Evidence |
|------|--------|----------|
| E1 | green | `hostile-tools.spec.ts::E1 every hostile shape declares its kind, host and outcome, and a declaration missing one field fails naming the tool id` — passed in the sidecar run |
| E2 | green | `tool-registry.spec.ts::E2 a declared tool with no backing returns a not-implemented outcome, never an empty result and never a throw` — passed in the sidecar run |
| E3 | not yet due | T006 (wave 4) |
| E4 | not yet due | T004 (wave 3) |
| E5/E6 | not yet due | T005 (wave 3) |
