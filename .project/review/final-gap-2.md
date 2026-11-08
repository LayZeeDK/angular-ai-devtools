# Gap Review — 2: the four skill tests the chain pin's failure masked

Reviewed HEAD: 65c7f03ac04b953427b0ed1462395b8a89e3d59a
Gap verdict: pass
Risk: the four skill tests the chain pin's failure masked
Waves checked: 1, 2, 3, 4, 5

## Checked evidence

- **Check**: `node --experimental-strip-types --test ".commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs" ".commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs" ".commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs" ".commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs"`, and `npm run test:skills`
- **Observed**: Exit 0 at this head — the four tests are 4 of 4 green (each 1 of 1 alone) and `npm run test:skills` is 628 tests, 628 pass, 0 fail. At T006's base 414a199 the same command exited 1 and all four failed with `ERR_MODULE_NOT_FOUND` naming `…fingerprint-copy-XXXX/.claude/skills/control-demo/scripts/text.mjs` (`gsd verify-probe`), so the repair is not vacuous.
- **Reference**: `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs:47-51`, `.commandcode/skills/control-ai-browsers/scripts/fingerprint.test.mjs:48-51`, `.project/tasks/T006-copy-the-escaper-beside-every-fingerprint-copy.md`

## Finding

- **Found**: Four skill tests failed with `ERR_MODULE_NOT_FOUND` naming `scripts/text.mjs` in the throwaway skill folder they build, because `24fe740` made each `control-*/scripts/fingerprint.mjs` a byte copy of a file that imports its sibling module and those four tests copied only `fingerprint.mjs`. That finding is P003 and its repair is T006.
- **Fix direction**: none
