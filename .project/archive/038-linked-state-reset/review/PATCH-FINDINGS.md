# Patch Findings

Reviewed HEAD: 9f8deeddd7c7bb1e8ca09b07d00b013cee3903c9
State: ship/blocked

## Findings

### P001 — The project Verify is red at the reviewed head

- **Source**: `.project/review/final-gap-1.md`
- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.

### P002 — The check chain and its pin disagree at the reviewed head

- **Source**: `.project/review/FINAL.md`
- **Locator**: SC6
- **Evidence**: The project gate is red at this head. `npm run check` passes but `npm test` fails one assertion, because the check chain gained `npm run gate:verification` in 08a8418 while the chain pin still names the older list, so `npm run check && npm test` does not pass at the reviewed commit.
- **Fix direction**: Re-cut the chain pin in `scripts/panel-typecheck-scope.test.mjs` (`CHECK_STAGES`, and the assertion message that counts the stages) to the chain `npm run check` runs at this head — `node scripts/ensure-sidecar-deps.mjs`, `tsc -p tsconfig.json`, `npm run lint:skills`, `npm run verify:skills`, `npm run check:skills`, `npm run check:panel`, `npm run check:extension`, `npm run check:companion`, `npm run gate:verification`, `npm run format:check` — or, if the owner rules that the gate stage does not belong in `check`, remove it from `package.json` and keep the pin. Either way the pin and the chain must agree at the reviewed head; the choice is the owner's because both sides are approved contracts.

### P003 — Four skill tests cannot resolve the module their own copy imports

- **Source**: `.project/review/final-gap-2.md`
- **Locator**: Risk: the four skill tests the chain pin's failure masked
- **Evidence**: Four skill tests fail with `ERR_MODULE_NOT_FOUND` naming `scripts/text.mjs` in their throwaway skill folder — `control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector` and `control-vitest-browser-angular` at `.commandcode/skills/<skill>/scripts/fingerprint.test.mjs:34`. `24fe740` made each `control-*/scripts/fingerprint.mjs` a byte copy of the canonical file, which statically imports `./text.mjs` at line 32, and these four tests copy only `fingerprint.mjs` into the folder they spawn. The canonical test copies both files (line 113-114), and this repository's `control-ai-browsers` test copies both too (line 48-51).
- **Fix direction**: Apply the canonical test's two-line copy of `text.mjs` beside the `fingerprint.mjs` copy in those four tests — `copyFileSync(join(dirname(fileURLToPath(import.meta.url)), 'text.mjs'), join(skill, 'scripts', 'text.mjs'))` — and change nothing else. The `.claude` copies of these four tests carry a `fingerprint.mjs` that imports no `text.mjs`, so they need no change.
