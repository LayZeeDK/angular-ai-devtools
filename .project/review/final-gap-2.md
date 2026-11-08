# Gap Review — 2: the four skill tests the chain pin's failure masked

Reviewed HEAD: 9f8deeddd7c7bb1e8ca09b07d00b013cee3903c9
Gap verdict: blocked
Risk: the four skill tests the chain pin's failure masked
Waves checked: 1, 2, 3, 4

## Checked evidence

- **Check**: `npm test` at this head, after the check-chain pin repair — the stage that had been unreachable, `npm run test:skills`
- **Observed**: 628 tests, 624 pass, 4 fail, all the same cause: `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs:34`, `.commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs:34`, `.commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs:34` and `.commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs:34` each fail with `ERR_MODULE_NOT_FOUND` naming `…fingerprint-copy-XXXX/.claude/skills/control-demo/scripts/text.mjs`
- **Reference**: `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs:32`, `.commandcode/skills/control-ai-browsers/scripts/fingerprint.test.mjs:48-51`, `~/.commandcode/skills/lars-create-verification/scripts/fingerprint.test.mjs:113-114`

## Finding

- **Found**: Four skill tests fail with `ERR_MODULE_NOT_FOUND` naming `scripts/text.mjs` in their throwaway skill folder — `control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector` and `control-vitest-browser-angular` at `.commandcode/skills/<skill>/scripts/fingerprint.test.mjs:34`. `24fe740` made each `control-*/scripts/fingerprint.mjs` a byte copy of the canonical file, which statically imports `./text.mjs` at line 32, and these four tests copy only `fingerprint.mjs` into the folder they spawn. The canonical test copies both files (line 113-114), and this repository's `control-ai-browsers` test copies both too (line 48-51).
- **Fix direction**: Apply the canonical test's two-line copy of `text.mjs` beside the `fingerprint.mjs` copy in those four tests — `copyFileSync(join(dirname(fileURLToPath(import.meta.url)), 'text.mjs'), join(skill, 'scripts', 'text.mjs'))` — and change nothing else. The `.claude` copies of these four tests carry a `fingerprint.mjs` that imports no `text.mjs`, so they need no change.
