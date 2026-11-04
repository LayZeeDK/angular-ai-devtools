---
id: T022
title: The port probe answers for both legs
wave: 8
deps: [T019]
status: done
agent: build_T022
base: a4830769e276c594015ae82d8b7fe85d7fd45581
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/control.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.test.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
  - .claude/skills/control-ai-browsers/scripts/control.mjs
  - .claude/skills/control-ai-browsers/scripts/control.test.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.test.mjs
  - .claude/skills/control-angular-devtools/scripts/control.mjs
  - .claude/skills/control-angular-devtools/scripts/control.test.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.test.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/control.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/control.test.mjs
---

# T022 — The port probe answers for both legs

## Context

A wave-7 reviewer measured two holes in `heldOnLoopback`. First, only the `127.0.0.1` leg is asserted, so
a listener bound only on `::1` reads free while `LOOPBACKS` stays `['127.0.0.1']` and every suite stays green.
Second, every non-`EADDRINUSE` bind error is read as "free", so a reserved or inaccessible port is selected as
available and the eventual spawn fails with `EACCES` that nothing expects.

## Approach

1. Name the change that leaves the check green today — the gap review already named it.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. A listener bound only on `::1` is reported busy, and reverting the probe to the `127.0.0.1` leg alone reddens the suite.
2. "Busy", "free" and "cannot tell" are three distinct outcomes: a port whose bind fails for a reason other than `EADDRINUSE` is reported as unknown, not free, and the suite reddens if it is silently treated as free.
3. Each of the five control skills carries the same probe and the same assertions, with the `.claude` mirrors byte-identical.
4. Each new assertion was seen failing under its mutant and passing when reverted.

## Verify

```bash
npm ci --include=dev; node --test .commandcode/skills/control-ai-browsers/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-devtools/scripts/control.test.mjs .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
```

## Why the mirrors are declared

The repository rule keeps every `.claude` copy of a `control-*` skill byte-identical to its `.commandcode`
counterpart (`scripts/skills-mirror.test.mjs` fails otherwise), so a change to the probe is a change to both
trees. The contract names all twenty paths for that reason.

## Log

- opened by orchestrator (final review blocked on two high-severity proof holes)
- probe: the IPv4-only boolean bind became three-valued — one leg answers EADDRINUSE busy, a bind closed at once free, every other error unknown; exported probePort(port, hosts) returns busy, free or unknown, busy outranks unknown and one unknown leg poisons free; busyPorts(ports, hosts) puts an undecided port in the not-free map so planPorts refuses it. Same probe, candidatePorts, presence-read planPorts and portsCheck in all five skills, including control-vitest-browser-angular, whose netstat busyPorts is gone.
- baseline BEFORE the change, hole 1: LOOPBACKS reduced to the 127.0.0.1 leg in the four skills that had the probe — five suites, 181 tests, 181 pass, 0 fail, so the dropped ::1 leg reddened nothing. Hole 2, measured live here: busyPorts([5357]).has(5357) was false while an explicit bind of 5357 on 127.0.0.1 answers EACCES, so planPorts offered a port no server can bind.
- mutant A, the ::1 leg dropped — LOOPBACKS = 127.0.0.1 in all five control.mjs: 196 tests, 191 pass, 5 fail, one per skill, every one the same assertion — AssertionError [ERR_ASSERTION]: 56403 is busy: the probe binds both loopback legs, and a listener on ::1 alone is still a listener, actual 'free', expected 'busy'. Reverted: 196 tests, 196 pass, 0 fail.
- mutant B, unknown folded back into free — the error arm made any non-EADDRINUSE code read free, in all five: 196 tests, 186 pass, 10 fail, two per skill — AssertionError [ERR_ASSERTION]: no host has 192.0.2.1, so nothing was learned about 56620: not free, and AssertionError [ERR_ASSERTION]: an undecided port is in the map: what is not known to be free is not offered. Reverted: 196 tests, 196 pass, 0 fail.
- mutant C, the probe stays three-valued but busyPorts keeps only busy — 'is not free' made 'is busy': 196 tests, 191 pass, 5 fail, only the undecided-port case — AssertionError [ERR_ASSERTION]: an undecided port is in the map: what is not known to be free is not offered. Reverted: 196 tests, 196 pass, 0 fail.
- mutant D, the planner stops refusing an entry with no named holder — holder returns undefined for an empty holder list, in all five: 196 tests, 180 pass, 16 fail, and the undecided port comes back selected — actual { ok: true, slot: 0, ports: [ { kind: 'derived', name: 'probe', port: 45000 } ] }, expected { ok: false, reason: 'no free slot in 1 tries (slots 0): probe 45000 held by a process the OS did not name' }. Reverted: 196 tests, 196 pass, 0 fail.
- a port the probe cannot bind is not free, measured after the change on this host: probePort(5357) is unknown, probePort(5357, ['127.0.0.1']) is unknown, busyPorts([5357]).has(5357) is true where it was false before, and probePort(45001) is still free.
- verify — npm ci --include=dev then the task's node --test over the five suites: 196 tests, 196 pass, 0 fail. scripts/skills-mirror.test.mjs: 2 pass, 0 fail. npm run check:skills clean in both trees. npm run test:skills: 628 tests, 628 pass, 0 fail. The ten .claude copies (five skills x control.mjs and control.test.mjs) were rewritten by copy and each is byte-identical to its .commandcode counterpart — the only files touched outside the contract's ten, and the repo's mirror rule requires them.
