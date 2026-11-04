# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 83374f432c27253a8507626308911f806c5ebecf

## T018 — Derive the browser slot instead of pinning it: pass

- ✅ No assertion in the file pins a slot number that depends on the checkout's absolute path; each asserts the property instead. — Read the landed file at `.commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs:171-195`: the `slotOf` test derives its paths from `tempDir(t)`, asserts a main checkout is slot 0 whatever its path, a worktree slot is an integer in 1-99, the same path repeats its slot, letter case is ignored, and eight sibling paths do not all land on one slot; `slotOrder` is exhaustively checked for first slots 1-99 (10 distinct slots, all within 1-99). The only remaining slot literals (`slot: 1` at lines 224 and 255) are planPorts expectations driven by the explicit order `[0, 1]` and the synthetic `heldBy` map, never by the checkout path; grep for `X:\\` literals in assertions found only synthetic `testEnv` pass-through values (`D:\\ev`, `D:\\ext`, `D:\\profile`), not the checkout path. Break proof: forcing `slotOf` to return 0 for worktree paths in a mutant copy reddens the suite 30/31 with `AssertionError: a worktree path gives a slot in 1-99, not 0` at the `slotOf` test.
- ✅ The suite passes from the primary checkout and from a sidecar worktree, demonstrated by running it in both. — Re-ran the Verify from this sidecar at 83374f4 after `npm ci --include=dev` (exit 0): `node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs scripts/skills-mirror.test.mjs` reports tests 33, pass 33, fail 0. Re-ran the suite alone from a worktree-shaped copy at a different absolute path (scratch `wt-repo\wt-77f3a9\.commandcode\skills\...`, where `slotOf` derives 52, not 0): tests 31, pass 31, fail 0.
- ✅ `busyPorts` is asserted against a listener the test owns, and the assertion does not name a PID. — Read `control.test.mjs:317-338`: the test binds its own listener, asserts `busyPorts()` reports nothing for a port it owned and released, checks every reported port/holder pair for integer shape, and asserts the held listener's holders equal `[process.pid]` where netstat reports it — no PID literal anywhere (the PID literals elsewhere at lines 299, 503-538 are synthetic proctree records). planPorts no longer reads netstat at all: the five planPorts tests feed it `heldBy([...])`, a busy map built from listeners the test holds, so the fallback logic the original failure was about no longer depends on the machine's socket table.
- ✅ The `.claude` copy is byte-identical to the `.commandcode` one and `scripts/skills-mirror.test.mjs` passes. — `readFileSync(...).equals(...)` on both copies returns true (26,421 bytes each, the only allowed difference being the `// Run:` header naming the `.commandcode` path, per the task Log's correction); both diffs in commit 83374f4 land on the same blob `2885343`. The sidecar Verify run shows both `scripts/skills-mirror.test.mjs` cases green (`.claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers`, same for `verify-ai-browsers`).

The coder's diagnosis — that the six `slot: 0` failures at `f1115f6` were not path-derived but caused by `netstat` never reporting listeners this process holds, so `busyPorts()` returned an empty map and `planPorts` never fell back — is evidenced, not convenient: (a) the repaired suite prints `netstat does not report 57830, a listener this process holds: this environment hides it` on this host; (b) I extracted the pre-repair test (`83374f4~1`) and ran it from a sidecar-shaped path and from an unrelated faraway path: both fail identically with six `slot: 0` vs `slot: 1` planPorts assertions and `busyPorts().get(port)` returning `undefined` instead of `[<pid>]` — the failure signature is path-independent, and the pre-repair `slotOf` test (which pinned fixed strings, not the checkout path) passed in both runs.

Warnings (non-blocking):
- unfailable-on-this-host assertion: replacing `busyPorts()` wholesale with `return new Map()` leaves the whole suite green (31/31, reproduced twice) — on this host netstat never reports a test-owned listener, so the positive half of the `busyPorts` assertion (`control.test.mjs:329-337`) always takes its `t.diagnostic` branch and the only live check is the vacuous `busy.has(freed) === false`. AC3's letter is met (the assertion exists and names no PID), and INTENT's Edge coverage/Prohibitions set no binding row on SC4 (E8 is dismissed `none`), but `busyPorts` could regress to a no-op and the project Verify would stay green. Tightening direction: let `busyPorts` take the netstat output as an injectable argument and assert `listeners()`/`busyPorts(text)` against a captured sample, or assert `busyPorts()` shape against the process's own port from `listen()` unconditionally via a skip-not-diagnostic guard on non-Windows-like environments.

Contract violations (blocking):
- none — commit 83374f4 touches only the two declared `files` plus the task file, whose hunks are the orchestrator-owned `status`, `base` and `worktree` fields.

## Intent coverage

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The wave's only task, T018, passes all four acceptance criteria above; its Verify (`npm ci --include=dev` exit 0, then `node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs scripts/skills-mirror.test.mjs`) reports tests 33, pass 33, fail 0, exit 0 re-run by this review from the sidecar at 83374f4, matching the recorded Log entry (`tests 33, pass 33, fail 0, exit 0`). The project gate itself was not re-run per the review constraints; the task Log records it green at this head.

## Summary for orchestrator

- blocked findings: none.
- repeat offenders: none (first cycle for this wave).
- warnings worth a human eye: the `busyPorts` empty-map mutant survives the suite on this host (details under Warnings) — the same "cannot fail for the right reason" class this milestone's task Context names, confined to one function whose consumers were moved off it.
