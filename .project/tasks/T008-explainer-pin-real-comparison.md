---
id: T008
title: Make the explainer-unchanged pin a real comparison
wave: 2
deps: [T005]
status: done
agent: build_T008
base: 09b789201bb60bab7d37963a47efd610f966781a
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T008 — Make the explainer-unchanged pin a real comparison

## Context

T005's held-out suite is 50 lines. It imports `createHash`, defines a `PINS` table, computes
`sha256(readFileSync(p))` into a variable called `actual`, then asserts that a mutated copy differs from the
original (a tautology), that a copy equals the original (also a tautology), and finishes with
`assert.ok(true)`. **It never compares `actual` to `PINS`.** Its own receipt claimed a SHA-256 pin with a
one-byte falsifiability check; the file does not implement it. Deleting an explainer, or rewriting one, leaves
the suite green — which is precisely what INTENT N2 forbids and what SC3 exists to prevent.

## Approach

1. Enumerate **all four** shipped explainer components explicitly in `PINS`, each entry a repository-relative
   path and its expected digest.
2. For each entry: read the file, compute the digest, and assert equality **naming the file and both digests**
   in the failure message. A missing file is a failure, not a skip.
3. Prove the pin is live, in the same suite:
   - delete (or rename) one explainer inside a `try/finally` that restores it, and assert the suite's own
     comparison function throws naming that file;
   - flip one byte in one explainer inside the same guard and assert the comparison throws naming that file.
4. Remove the closing `assert.ok(true)` and any comparison that only relates a value to itself.

## Interface contract

None


## Intent coverage

- SC3

## Acceptance criteria

1. `PINS` holds one entry for each of the four shipped explainer components, and each entry's digest is compared against that file's current bytes, with the file path in the failure message.
2. With one explainer temporarily removed, the suite **fails** and names that file; the file is restored before the test ends whatever happens.
3. With one explainer's source altered by a single byte, the suite **fails** and names that file.
4. On the unmodified tree the suite passes, and no assertion in it compares a value only to itself.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- created by orchestrator (wave-2 review: T005's pin never compares its digests to its table)
- T008 implemented real SHA-256 pins for 4 explainers; node --test pass 3/0/0; ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  ✔ pin is live: removing an explainer fails naming that file (1.5641ms)
  ✔ pin is live: altering one byte fails naming that file (1.5836ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 123.4953
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
