# Gap Review — 3: The offline digest is generated at extension build time by a wired build target and is the exact artifact the panel renders, so a stale or unwired digest would still show an entry that does not match the documented error.

Reviewed HEAD: b0a40e7eeb2d0007684e2a83b28dac6e05b0cb3b
Gap verdict: pass
Risk: The offline digest is generated at extension build time by a wired build target and is the exact artifact the panel renders, so a stale or unwired digest would still show an entry that does not match the documented error.
Waves checked: 1, 2

## Checked evidence

- **Check**: read the build target, regenerate the digest into the scratchpad and byte-compare it to the committed file, count entries and unique codes, check the token cap and license text, run the digest tests, and read the panel's digest rendering
- **Observed**: `build-extension.dependsOn` contains `"generate-error-digest"`; that target is `nx:run-commands` running `node scripts/generate-error-digest.mjs`, and `build` remains `@angular/build:application`. The generator wrote 64 entries and the committed `extension/error-digest.json` is byte-identical to the fresh generation. The committed digest holds 64 entries and 64 unique codes, the largest body is 150 tokens, and no "MIT License", "Google LLC" or "licensed under" text appears. The digest tests and the wiring test pass, 8 tests, 0 failures. The panel renders `resolveDigest(errorDigest, code)` from that committed file imported at build time, and `explain()` sends only the already-clean digest body through `buildErrorExplainFacts`, because `stripLicense` removed the notice at generation.
- **Reference**: `apps/angular-ai-devtools/project.json:52-99`; `scripts/generate-error-digest.mjs`; `extension/error-digest.json`; `extension/error-digest.test.mjs`; `scripts/error-digest-wiring.test.mjs`; `src/main-world/error-digest.ts`; `src/panel/error-explainer-view.ts`; `apps/angular-ai-devtools/src/app/error-explainer.component.ts`; recorded ledger entries at 1989aa9e and f33030a7

## Finding

- **Found**: the build target declares the generator as a dependency and runs it; the committed digest is byte-identical to a fresh generation with 64 entries for 64 unique codes, each body at most 150 tokens and carrying no license or copyright text; the panel renders that exact artifact and sends only its cleaned body. Risk mitigated.
- **Fix direction**: none
