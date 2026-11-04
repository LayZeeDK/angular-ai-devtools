---
id: T019
title: busyPorts must not depend on netstat
wave: 7
deps: [T018]
status: done
agent: build_T019
base: aceec453a376ee48d56f72abd38b1d850d535445
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/control.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
  - .claude/skills/control-ai-browsers/scripts/control.mjs
  - .claude/skills/control-ai-browsers/scripts/control.test.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.test.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.test.mjs
  - .claude/skills/control-angular-devtools/scripts/control.mjs
  - .claude/skills/control-angular-devtools/scripts/control.test.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.test.mjs
---

# T019 — busyPorts must not depend on netstat

## Context

`prepare-final` at head `9a60cd69` failed on
`.commandcode/skills/control-pangular-inspector/scripts/control.test.mjs:118`: it expects
`{ ok: false, reason: 'fixed port pangular 56895 held by PID 25580; ...' }` and receives
`{ ok: true, slot: 0 }`. That is the same root cause T018 found in `control-vitest-browser-angular` — not a
path problem, a **`netstat` blindness**: on this host `netstat` reports only the host table, so `busyPorts()`
returns empty and nothing ever looks busy. T018 repaired the *suite* of one skill by injecting a busy map; the
**probe itself still lies in all five skills**, so the next control skill fails the gate the same way.

`control-vitest-browser-angular` is already repaired and is not in scope here.

## Approach

Replace the `netstat`-based busy check with a portable one: attempt to bind the port on the loopback address
and read the outcome. `EADDRINUSE` means busy; a successful bind that is immediately closed means free. That
answer does not depend on which table the OS exposes, and it needs no external command.

1. Implement the probe once, in the same shape in each `control.mjs` (these skills are separate
   installations by design; do not create a shared module the skills would have to import across boundaries).
2. Where a rule needs the *holder*, keep that separate and optional: a busy port is busy whether or not the OS
   will name the process. A rule that required a PID to decide busyness is the defect.
3. Bring each suite's expectations in line with the property: a port this process holds is busy; a port nothing
   holds is free; the answer is the same on any host.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. No `control.mjs` in scope calls `netstat`, `lsof` or any external process to decide whether a port is busy.
2. `busyPorts` (or its replacement) reports busy for a listener the test itself holds and free for a port it just released, on this host, with the assertions derived rather than pinned to a PID.
3. `node --test` passes for all four skills' suites from the primary checkout and from a worktree-shaped path.
4. Each `.claude` copy is byte-identical to its `.commandcode` counterpart and `scripts/skills-mirror.test.mjs` passes.
5. The project Verify's control-skill block passes: the `control-pangular-inspector:118` failure is gone.

## Verify

```bash
npm ci --include=dev; node --test .commandcode/skills/control-ai-browsers/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-devtools/scripts/control.test.mjs .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs; node --test scripts/skills-mirror.test.mjs
```

## Log

- opened by orchestrator (the ship Verify fails on the same netstat blindness T018 found, one skill over)
- replaced the netstat busy check in the four control.mjs with a bind probe: heldOnLoopback binds each port on 127.0.0.1 then ::1 (EADDRINUSE is busy, a bind that succeeds is closed at once and free), busyPorts(ports) probes them, and candidatePorts lists every port planPorts may look at
- planPorts and portsCheck now read the busy map by presence, so busyness needs no PID: an unnamed holder refuses with 'held by a process the OS did not name'; netstat survives only as namedHolders/portOwner, which name a holder and never decide whether a port is busy
- old probe on this host, test holding port 65193: busyPorts() returned keys [29678,135,2179,49665] (the host table only) and planPorts answered {ok:true,slot:0}, the control-pangular-inspector:118 failure; the new probe returned [65193] and planPorts refused, and after the release the probe returned [] and planPorts answered ok slot 0 again
- the old rule fed the new probe map (port 65193 held, no PID) still answered ok slot 0: requiring a holder PID to decide busyness was the second half of the defect, and each suite now pins both halves with injected maps that carry no host data
- suites: control-ai-browsers 52 pass, control-angular-dev-app 33, control-angular-devtools 33, control-pangular-inspector 32 (150 tests, 0 fail), and the same 150 pass from a temp worktree-shaped copy of the four skills
- each .claude copy recopied from its .commandcode counterpart and compared with fc /b (all 8 files identical), skills-mirror.test.mjs 2 pass, tsc -p for both skills trees and both run-code configs clean, and the task Verify ran with exit code 0
- ready
