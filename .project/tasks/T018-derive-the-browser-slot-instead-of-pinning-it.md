---
id: T018
title: Derive the browser slot instead of pinning it
wave: 6
deps: [T013]
status: in-progress
agent: build_T018
base: 51cb53655050cdf03c7574910f5b1c5b23fcb34c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/control.test.mjs
---

# T018 — Derive the browser slot instead of pinning it

## Context

`prepare-final` at head `f1115f6` failed on `control.test.mjs`: six assertions expecting `slot: 1` received
`slot: 0`, and a `busyPorts` case received `undefined` instead of `[12912]`. They reproduce standalone.

`slotOf` gives slot 0 to a main checkout and hashes a worktree path into 1-99. The suite pins one computed
instance of that value rather than asserting the property, so when the project Verify runs from the sidecar
worktree — a different absolute path — the derived slot changes and the pinned expectations fail. The first
`busyPorts` failure was a genuine transient (port 50657 briefly held); the six `slot` failures are not.

This is the inverse of the defect this milestone spent five waves repairing: not a test that cannot fail, but
a test that fails for its own environment.

## Approach

1. Replace every pinned slot literal with an assertion about the property: a main checkout is slot 0, a worktree
   lands in 1-99, and the same path yields the same slot across calls.
2. Replace the pinned holder PID with an assertion that `busyPorts` names the holder it actually observes, and
   that it reports nothing when the port is free. A test may not depend on a specific PID or on a port being
   held by something outside it.
3. Keep the `.claude` byte copy in step — `scripts/skills-mirror.test.mjs` fails otherwise.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. No assertion in the file pins a slot number that depends on the checkout's absolute path; each asserts the property instead.
2. The suite passes from the primary checkout and from a sidecar worktree, demonstrated by running it in both.
3. `busyPorts` is asserted against a listener the test owns, and the assertion does not name a PID.
4. The `.claude` copy is byte-identical to the `.commandcode` one and `scripts/skills-mirror.test.mjs` passes.

## Verify

```bash
npm ci --include=dev; node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs scripts/skills-mirror.test.mjs
```

## Log

- opened by orchestrator (the ship gate at f1115f6 failed on path-dependent slot expectations)
- the six failures are not path-derived: netstat -ano here sees only the host table, and a listener this process binds (probed 127.0.0.1, 0.0.0.0, ::1 and ::, TCP and TCPv6) never appears in it, so busyPorts() returned an empty map and planPorts never fell back - slot 0 with no reason
- slot assertions now state the property: a main checkout is slot 0 at any path, a worktree path gives an integer in 1-99, the same path repeats its slot from call to call, letter case does not matter, and eight sibling worktree paths do not all land on one slot; slotOrder for first 1-99 tries 10 distinct slots, every one in 1-99
- planPorts now reads heldBy([...]) - the busy map it is handed, built from listeners the test holds, whose only possible holder is process.pid - instead of busyPorts(); busyPorts is asserted for a port the test bound and then released (absent), for integer port numbers and non-empty integer holder lists, and for [process.pid] on an own listener where netstat reports it, with a t.diagnostic where it does not
- bite proof on mutant copies of control.mjs in the scratch temp dir: a worktree slot forced to 0 fails the slotOf test on a worktree path giving a slot in 1-99 rather than 0; a slot forced to 50 fails on different paths landing apart, 50 alone; planPorts blind to its busy map fails the same five planPorts tests with slot 0 and no reason; busyPorts returning an empty holder list fails on the holders of 1
- Verify: npm ci --include=dev exit 0, then node --test control.test.mjs scripts/skills-mirror.test.mjs gives tests 33, pass 33, fail 0, exit 0; the .claude copy is byte-identical (26373 bytes, readFileSync equals) and runs 31/31 alone; the same suite copied to a worktree-shaped checkout (slot 79 there, not 0) runs 31/31; tsc for .commandcode and .claude skills tsconfig and tsconfig.run-code all clean
- no assertion in the file now pins a slot from the checkout path, a literal PID, or a port held outside the test: ready
- correction to the Verify line: the copies are 26421 bytes (the tsc fix grew the file after the first copy), and byte-identity per criterion 4 means the .claude copy Run header names the .commandcode path instead of its own
- both copies readFileSync-equal at 26421 bytes, Verify 33/33 in 0 fail at exit 0, tsc clean: ready
