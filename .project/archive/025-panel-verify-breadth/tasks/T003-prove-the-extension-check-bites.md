---
id: T003
title: Prove the extension check bites
wave: 1
deps: [T002]
status: done
agent: build_T003
base: 00f105be61dc381382fa7d276aa817435dce01c3
worktree: null
task_branch: null
files:
  - scripts/extension-typecheck.test.mjs
---

# T003 — Prove the extension check bites

## Context

T001 and T002 make the check green. A check that cannot fail is the defect this
programme spent M023 repairing, so the check itself needs a proof.

## Approach

1. Add `scripts/extension-typecheck.test.mjs` driving `tsc -p extension/tsconfig.json` in a temporary
   copy of the tree.
2. Prove a wrong property in an authored source exits non-zero and names that file.
3. Prove an error placed inside `extension/panel/` leaves the check green — the exclusion is the generated
   directory and nothing wider.
4. Prove a directory with no JavaScript reports no errors rather than failing to start.
5. Assert the config's `strict` is `false` and its header states the gap.

## Interface contract

None

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. A wrong property in an extension source reddens the check and names the file (held-out E1).
2. An error inside `extension/panel/` leaves it green (held-out E2).
3. The config's `strict` is `false` and the header records why (held-out E4, SC4).
4. An empty directory reports no errors rather than failing (held-out E3).
5. Each behaviour has a mutant that reddens it, with the failure text in the Log.

## Verify

```bash
npm ci --include=dev; node --test scripts/extension-typecheck.test.mjs
```

## Log

- opened by orchestrator in wave 1
- T003: added scripts/extension-typecheck.test.mjs — 5 node:test cases driving node_modules/typescript/bin/tsc -p (the binary npx tsc resolves) against copies of extension/ under os.tmpdir(), each copy given a node_modules junction so types:[chrome] resolves; the junction is removed non-recursively in a finally before the fixture directory; the checkout extension/ tree is hashed before and after and asserted byte-identical (44 files)
- T003 E1: element.noSuchProperty appended to a copy of panel.js -> exit 2, extension/panel.js(14,11) TS2339; mutants: probe removed -> red [a wrong property in an authored source must exit non-zero; got exit 0]; a second authored source also broken -> red [the failure must name extension/panel.js and no other file: extension/overlay.js(3,11), extension/panel.js(14,11)]
- T003 E2: extension/panel/probe-wrong-property.js carrying the same wrong property -> exit 0, 0 diagnostics, --listFiles holds all 9 authored .js and no panel file; mutants: exclusion dropped -> exit 2 naming extension/panel/probe-wrong-property.js(4,11) TS2339, red [a tree whose only error is inside extension/panel/ (exclusion dropped) must exit 0]; exclusion widened to overlay.js -> still green, red [the program must be the authored tree, whole: every authored source in, the panel probe out]
- T003 E3: empty extension/ (0 .js verified by walk) -> exit 2, 0 file errors, sole diagnostic TS18003 naming the fixture config; mutants: one authored .js added -> red [a tree with no JavaScript must report no errors; it reported: extension/overlay.js(3,11) TS2339]; config absent (TS5058) -> red [the check must start and read its config, not fail before reading it]. Measured on this install: tsc refuses a zero-input program (TS18003) and files:[] answers TS18002, so no tsconfig can make tsc exit 0 on an empty tree; E3 pins the no-errors report plus the named no-inputs state rather than an exit 0 TypeScript cannot produce
- T003 E4: strict:false, exclude:[panel/**] and 8 header statements (strict:false is deliberate; implicit-any; hand-written JavaScript; strict:true over the same sources; gap recorded here rather than hidden; exclude:[panel/**]; only exclusion; build output) asserted from the config text, header proven to be comments before compilerOptions; mutants: strict flipped -> red [the config must run at strict: false]; header stripped -> red [the header must state that strict:false is deliberate]; only-exclusion sentence dropped -> red [the header must state that the panel exclusion is the only one]; exclusion widened -> red [panel/** must be the configs only exclusion]
- T003 verify: npm ci --include=dev exit 0; node --test scripts/extension-typecheck.test.mjs exit 0 (tests 5, pass 5, fail 0, skipped 0, todo 0); 9 fixture mutations each reddened exactly its target assertion; git status holds only the new scripts/extension-typecheck.test.mjs (the task file carries the orchestrator dispatch frontmatter only), extension/tsconfig.json and every extension source unmodified, no scratch left in the repo — ready
