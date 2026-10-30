---
id: T007
title: Wire the error digest generator into the extension build
wave: 2
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/project.json
  - scripts/error-digest-wiring.test.mjs
---

# T007 — Wire the error digest generator into the extension build

## Context

Wave 1 landed the digest generator and the generated digest, but the review blocked T001's fourth acceptance
criterion: nothing runs the generator during a build. The `build-extension` target is a plain
`@angular/build:application` executor, so `extension/error-digest.json` is whatever was last committed rather
than something the build reproduces, and SC2 says the digest is generated at extension build time. The fix
site is the application target definition, which T001 did not declare. This repair task carries that wiring,
and its Verify proves the wiring statically because the real Nx build runs at the wave gate and in the project
Verify.

## Approach

- Add a `generate-error-digest` target that runs the existing generator through the Nx run-commands executor,
  with the repository root as its working directory.
- Make the `build-extension` target depend on it, so a build always regenerates the digest before the
  application is compiled and the digest file can never drift from the generator.
- Do not change the `build` target: the standalone app is a developer and test surface, and the digest is an
  extension artifact.
- Cover the wiring with a small `node:test` that reads the target definitions and asserts both the dependency
  and the generator command, so a future edit that drops either one fails the Verify.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `npx nx run angular-ai-devtools:build-extension` regenerates the offline digest through the generator
   script T001 landed, before it compiles the application, so the shipped digest is reproducible at build
   time (SC2).
2. The wiring is proven by a `node:test` that fails if the dependency or the generator command is removed.
3. The `build` target and every other existing target are unchanged.

## Verify

```bash
node --experimental-strip-types --test scripts/error-digest-wiring.test.mjs
```

Heavy: no

## Log

- created by plan build-repair after the wave 1 T001 AC4 finding
