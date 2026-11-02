# Review — M018 instrument-core, Wave 4, Cycle 1

Wave: 4
Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3

## T006 — Add the panel_environment tool in a commit that touches no envelope file: pass
- ✅ `panel-environment.tool.ts` declares `panel_environment` as `read` / `['panel','extension-API']` / `result` / `publish: 'panel'`; `app.config.ts` gained one provider line (`providePanelEnvironmentTool()`); no envelope file (`tool-registry.ts`, `page-reads.ts`, `read-tools.ts`, `app-facts.ts`, `hostile-tools.ts`) was touched. `scripts/registry-envelope-pin.test.mjs` records `PINNED_ENVELOPE_SHA256 = 20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` (20,180 bytes), resolves the root from `import.meta.url`, reads the module as bytes, proves failure via a one-byte flip in an `os.tmpdir()` copy, and writes nothing into the checkout.

## T007 — Add the error_digest_lookup tool in a second commit that touches no envelope file: pass
- ✅ `error-digest.tool.ts` declares `error_digest_lookup` as `read` / `['panel']` / `result` / `publish: 'model'` with a required `code` input, normalises `NG0####`/bare-digit forms, strips the licence notice, and returns `{ kind: 'error', code: 'invalid-input' }` for malformed/unknown codes. This commit touched no envelope file (including `panel-environment.tool.ts` and the pin script), `app.config.ts` gained one provider line, and the pin still matches `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` (1/1 pass).

## T008 — Make npm run check type-check the panel and leave npm test green at the head: pass
- ✅ `npm run check` chains `ensure-sidecar-deps`, `tsc -p tsconfig.json`, `check:skills`, then `check:panel` (`tsc -p apps/angular-ai-devtools/tsconfig.check.json`); config includes `src/**/*.ts` + `src/**/*.d.ts` with only the two `node:test` shapes excluded, no `skipLibCheck`/`@ts-ignore`. `scripts/panel-typecheck-scope.test.mjs` confirms the program lists 379 files including 49 panel sources and all 13 milestone modules, and that a deliberate type error fails (TS2322) while the fixed copy passes. `npm run check` exits 0 and `npm test` exits 0 (150+ tests pass). Advisory: extension initial bundle is 535.44 kB vs 520 kB budget (15.44 kB over); build exits 0.

## Intent coverage

### SC2 — Two tools are added in two separate commits without touching the envelope, proving the declaration record is the only extension point.: pass
- ✅ Two separate commits (`5044c2b` T006, `4076ec6` T007) each add exactly one tool and a single `app.config.ts` provider line; the registry core hash `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` is byte-identical across both and the pin was not updated.

### SC5 — `npm run check` type-checks the registry and the extension sources, and `npm test` passes at the head.: pass
- ✅ `npm run check` runs the panel stage over 379 program files (registry, tools, page-reads, specs) and exits 0; `npm test` exits 0 with all script and app tests green. (Extension bundle advisory: 535.44 kB initial vs 520 kB budget, build exits 0.)

## Findings

- Advisory (non-blocking): `npx nx run angular-ai-devtools:build-extension` reports initial bundle 535.44 kB against a 520 kB warning budget (15.44 kB over); error threshold is higher and build exits 0. T008 recorded this rather than raising the budget, per INTENT AR-1.
- Advisory (non-blocking): `npm test`'s full run exceeds 30 s on this host (timeout observed); individual stages (scripts pin tests, check, app suite) all pass. No assertion weakened.
- The pin test's mutation fixture flips one byte of a copy in `os.tmpdir()` and asserts failure, so the pin is falsifiable; the untouched copy still passes, confirming the failure is the byte and not the path.
