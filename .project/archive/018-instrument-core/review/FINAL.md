# Final Review — Angular AI DevTools (M018 — instrument-core)

Reviewed HEAD: 9d202988379b9aab10e30dd164ab661702736c1e
Overall verdict: pass

## Success criteria

### SC1 — Six hostile tools pass through the envelope: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.

- **Verdict**: met
- **Check**: `set "NODE_ENV=development" && node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:test --skip-nx-cache --include=apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts --include=apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts` (32/32 tests passed); source read of `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` and `hostile-tools.ts`; E1/E2 held-out tests re-run.
- **Observed**: 2 files / 32 tests pass at this head (tool-registry.spec.ts 23/23, hostile-tools.spec.ts 9/9). Six hostile shapes (`confirm_write`, `async_scan`, `snapshot_image`, `dual_host_read`, `wrapped_third_party`, `page_state_schema`) registered via `provideTools()` in the spec TestBed only; each carries a distinct `kind`/`host`/`outcome` triple (N1 separation on kind/host/outcome or the page-state-dependent schema field). E1 pins declared `kind`/`host`/`outcome` for all six and mutates one required field at a time, failing naming the tool id + field. E2 proves a declared tool with no backing returns `{ kind: 'error', code: 'not-implemented' }`, never an empty result and never a throw. Confirm write performs nothing before the token, writes once, refuses reuse; async handle settles to result; image returns mime type + data URL with PNG magic bytes; page-state returns `host-unavailable` when the fact is absent. Wrapped third-party returns `provenance: 'third-party'` on success and `third-party-failed` on throw/reject without throwing. N5: no DOM added to an inspected page — `tool-registry.ts` imports only `@angular/core` (grep for `document|window|page-reads` matches only the header comment).
- **Reference**: apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:30-38, 261-326; apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts:342-349; apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts:134-348; .project/review/wave-1.cycle1.contract.md; .project/review/wave-1.cycle1.adversarial.md.
- **Finding**: none
- **Fix direction**: none

### SC2 — Two tools are added in two separate commits without touching the envelope, proving the declaration record is the only extension point.

- **Verdict**: met
- **Check**: `git show 5044c2b` and `git show 4076ec6` (commit diffs); `set "NODE_ENV=development" && node --test scripts/registry-envelope-pin.test.mjs` (1/1 pass); pinned SHA comparison across both commits.
- **Observed**: Two separate commits (`5044c2b` T006 adds `panel_environment`, `4076ec6` T007 adds `error_digest_lookup`) each add exactly one tool plus one `app.config.ts` provider line and touch no envelope file (`tool-registry.ts`, `page-reads.ts`, `read-tools.ts`, `app-facts.ts`, `hostile-tools.ts`). The registry core hash `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` is byte-identical across both commits and the pin was not updated (E3). The pin test is falsifiable: a one-byte mutation of a copy in `os.tmpdir()` fails the pin, while the untouched copy passes. Advisory (carried from gap 2): the pin is a self-asserted SHA-256 constant — it catches accidental edits but has no mechanical guard against deliberate re-pinning (N6). No envelope file was extended to admit either tool.
- **Reference**: scripts/registry-envelope-pin.test.mjs:55-56, 107-178; apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts; apps/angular-ai-devtools/src/app/tool-registry/error-digest.tool.ts; .project/review/final-gap-2.md; .project/review/wave-4.cycle1.md.
- **Finding**: none
- **Fix direction**: none

### SC3 — `app_facts`, `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are reachable through the registry, and no caller reaches around it.

- **Verdict**: met
- **Check**: `set "NODE_ENV=development" && node --experimental-strip-types --test scripts/registry-reach.test.mjs` (3/3 pass); source read of `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts`, `page-reads.ts`, `app-facts.ts`; `nx run angular-ai-devtools:test` (15 files / 131 tests) at this head.
- **Observed**: All six tools register through T001's `defineTool`/`provideTools` envelope (`provideToolRegistry()`, `provideAppFactsTool()`, `provideReadTools()` in `app.config.ts`). `app_facts` answers with `provenance: 'page-published'` and `host-unavailable` (never an empty result) when the page has not published. The five read wrappers (`find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata`, `getComponent`) are `read`/`page`/`result`/`publish: 'model'`, validate input against the declared schema before the backing runs (invalid input → `invalid-input` naming the tool, page never asked), and every result carries `provenance: 'page-request'`; a throwing host maps to `host-unavailable` naming the tool. E4: the reach guard scans 47 files, allowlists exactly `read-tools.ts` + `read-tools.spec.ts` (both verified to import the module), reports zero violations; the red side is proven live (static import, `export *` re-export and dynamic `import()` all named with file + specifier; the same module through `TOOL_REGISTRY.execute` passes). N2: `tool-registry.ts` neither imports nor re-exports `page-reads.ts` and exports none of the five reader names or `PAGE_HOST`. No reader is exported from the registry's own module.
- **Reference**: apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts; apps/angular-ai-devtools/src/app/page-reads.ts; apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts; scripts/registry-reach.test.mjs; .project/review/wave-2.cycle1.md; .project/review/wave-3.cycle1.md.
- **Finding**: none
- **Fix direction**: none

### SC4 — The DOM role/name computation returns a role and an accessible name for a labelled control and for a control named only by its content.

- **Verdict**: met
- **Check**: `set "NODE_ENV=development" && node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:test --skip-nx-cache --include=apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts` (E5 and E6 cases pass); source read of `apps/angular-ai-devtools/src/app/tool-registry/role-name.ts`.
- **Observed**: E5: a control with `aria-label` yields role `button` and name `Save changes` (source `aria-label`); a control named only by its content yields role `link` and name `Read the docs` (source `content`); an unlabelled control yields role `textbox` and the explicit reason `'no accessible name'`. E6: the name is read from the DOM at call time — mutating `aria-label`, content, the `label[for]` text, the `aria-labelledby` target and the `role` between two reads of one element changes the second result; no cache, memo or snapshot exists in `role-name.ts`. N3: an author-named role never falls back to `textContent` — a button whose `aria-label` differs from its text answers the label, and a textarea / `role=textbox` / `role=checkbox` wrapper with text but no label answers `{ name: null, reason: 'no accessible name' }`; `value`, `placeholder` and `title` are never consulted. The module imports nothing (no Angular, no helper) and performs no DOM mutation (MutationObserver over the fixture tree and `document.body` records zero mutations; `root.innerHTML` unchanged).
- **Reference**: apps/angular-ai-devtools/src/app/tool-registry/role-name.ts; apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts; .project/review/wave-3.cycle1.md.
- **Finding**: none
- **Fix direction**: none

### SC5 — `npm run check` type-checks the registry and the extension sources, and `npm test` passes at the head.

- **Verdict**: met
- **Check**: `set "NODE_ENV=development" && npm run check` (exit 0); `set "NODE_ENV=development" && npm test` (exit 0, 150+ tests); `set "NODE_ENV=development" && node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:build-extension --skip-nx-cache` (exit 0).
- **Observed**: `npm run check` chains `ensure-sidecar-deps`, `tsc -p tsconfig.json`, `check:skills`, then `check:panel` (`tsc -p apps/angular-ai-devtools/tsconfig.check.json`); the panel program lists 379 files including 49 panel sources and all 13 milestone modules, with only the two `node:test` shapes excluded, no `skipLibCheck`/`@ts-ignore`. `scripts/panel-typecheck-scope.test.mjs` confirms a deliberate type error fails (TS2322) while the fixed copy passes. `npm test` exits 0 with all script and app tests green. N4: the check was not narrowed — it type-checks the panel and registry without excluding files that already pass. Advisory (carried from gap 3): the extension initial bundle is 535.44 kB against a 520 kB `maximumWarning` (1 MB error ceiling); the build exits 0 and the overrun is an advisory, not a milestone defect.
- **Reference**: package.json (scripts); apps/angular-ai-devtools/project.json:79-90; scripts/panel-typecheck-scope.test.mjs; .project/review/final-gap-1.md; .project/review/final-gap-3.md; .project/review/wave-4.cycle1.md.
- **Finding**: none
- **Fix direction**: none

## Advisories carried forward

- The registry envelope pin is a self-asserted SHA-256 constant: it catches accidental edits but has no mechanical guard against deliberate re-pinning (gap 2). Not a milestone defect.
- The extension initial bundle is 535.44 kB against a 520 kB `maximumWarning` (1 MB error ceiling); the build exits 0 (gap 3). Not a milestone defect.
