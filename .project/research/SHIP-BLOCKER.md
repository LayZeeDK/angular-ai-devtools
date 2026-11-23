# Ship blocker — the verify sidecar lacks the companion package build

Phase: ship · Milestone: M062 outlet-explainer · Recorded at `93d45784`

## The measurement

`prepare-final` ran `lean_verification.py`, which ran the project verify inside a read-only sidecar, and it exited 1:

```
test at scripts\facade-dev-build.test.mjs:759:1
  the development build keeps the entry name and the Router class, and it is one Angular copy (AC6)
AssertionError [ERR_ASSERTION]: the build target must emit packages/ai-devtools-companion/dist/index.js
```

The same suite passed in the primary checkout: the recorded ledger entry for T010
(`.project/build/verify-ledger.jsonl`, commit `8341e371`) is `result: "pass"`, `exit_code: 0`, with
`npm test` reporting 2,037 of 2,037.

## The cause, as far as it is measured

`packages/ai-devtools-companion/dist/` exists in the primary checkout and is gitignored, so a sidecar created by
`isolation.py isolate-verify` does not carry it. `scripts/ensure-sidecar-deps.mjs` bridges `node_modules` (and copies the
fixture's install), but it does not carry or build `packages/*/dist`. The suite therefore runs in a tree where the package
has never been built, and the assertion is about an artefact no script puts there.

That is an environment gap, not a product defect: the file the test names is present and current in the primary, and the
project verify is green there.

## What is not yet known

- Whether the honest repair is to bridge `packages/*/dist` from the primary (as `node_modules` is bridged), or to build it
  inside the sidecar from `ensure-sidecar-deps.mjs`. A junction is cheaper; a build is truer to what a fresh clone would do.
- Whether any other suite reads a `packages/*/dist` artefact and has the same latent failure. The verify's first failing
  test is the one above; the run stops there, so the rest is unmeasured rather than passing.

## What this record does not claim

It does not claim the milestone is unshippable — the product verify is green in the primary. It claims that the ship gate
cannot be passed until the sidecar produces the artefact the suite names, and that the repair belongs in
`scripts/ensure-sidecar-deps.mjs` as a declared task rather than as a hand-copy into a throwaway directory.
