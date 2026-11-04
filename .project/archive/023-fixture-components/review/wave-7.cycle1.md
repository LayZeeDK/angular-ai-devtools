# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 5c21bf08c87a7e4a9d8beb56a992f8b3c17f9f0f

## T019 — busyPorts must not depend on netstat: pass

- ✅ No `control.mjs` in scope calls `netstat`, `lsof` or any external process to decide whether a port is busy — grep over all four in-scope `control.mjs`: `busyPorts` decides only through `heldOnLoopback`, which binds the port on `127.0.0.1` then `::1` and reads `EADDRINUSE` (`control-pangular-inspector/scripts/control.mjs:734-789`, `control-ai-browsers:483-534`, `control-angular-dev-app:708-759`, `control-angular-devtools:482-533`); `netstat` survives only inside `namedHolders`/`portOwner`, which fill the PID values of an already-busy entry and never add one (`control-pangular-inspector/scripts/control.mjs:757-761,781-786`); `lsof` appears nowhere in scope. The out-of-scope `control-vitest-browser-angular/scripts/control.mjs:643-646` still decides from `netstat` — warned below; the task declares it repaired by T018 and out of scope.
- ✅ `busyPorts` (or its replacement) reports busy for a listener the test itself holds and free for a port it just released, on this host, with the assertions derived rather than pinned to a PID — each suite carries `busyPorts decides by binding a port: the one this process holds is busy, the same port is free once released` on an OS-picked port (`control-pangular-inspector/scripts/control.test.mjs:128-136`, `control-ai-browsers:188-195`, `control-angular-dev-app:254-261`, `control-angular-devtools:208-215`), all green. Independent re-run beyond the suite: I spawned child processes (not the test) holding a port on `127.0.0.1` and on `::1`; all four skills' `busyPorts` reported both busy, and free after the children exited, with `planPorts` refusing the child-held fixed port as `held by a process the OS did not name` (`control-pangular-inspector/scripts/control.mjs:255`). Residual blind spot measured and warned below: a child holding the port on `0.0.0.0` is not seen.
- ✅ `node --test` passes for all four skills' suites from the primary checkout and from a worktree-shaped path — re-run from this sidecar: 150 tests, 150 pass, 0 fail; re-run from a worktree-shaped copy (`scratchpad/wt/.commandcode/skills/...`, since removed): 150 tests, 150 pass, 0 fail. `npm ci --include=dev` ran clean first (re-run to confirm, 538 packages). The sidecar checkout stands in for the primary (reviewers never touch the primary worktree); the same suites are what the project gate runs there.
- ✅ Each `.claude` copy is byte-identical to its `.commandcode` counterpart and `scripts/skills-mirror.test.mjs` passes — `fc /b` over all eight files (four skills × `control.mjs` + `control.test.mjs`, both trees): 8 × SAME; `node --test scripts/skills-mirror.test.mjs`: 2 pass, 0 fail.
- ✅ The project Verify's control-skill block passes: the `control-pangular-inspector:118` failure is gone — the failing assertion was the old `planPorts(rows, [0], busyPorts())` deep-equal expecting `held by PID ${process.pid}` (`aceec45` `control.test.mjs:118`); its replacement (`control-pangular-inspector/scripts/control.test.mjs:138-151`) asserts a derived refusal (`held by … ; pinned by …`) and passes, and my child-holder probe reproduced the production shape on this host: a fixed port held by a foreign, unnamed process is now refused instead of answered `ok slot 0`.

Claim check — "the old rule required a PID before calling a port busy": evidenced. At base `aceec45`, `planPorts` read the holder as `busy.get(port)?.[0]` (`scratchpad/old/control-old.mjs:237` in the extracted base file; repo `control.mjs:237` at that commit), so a busy map entry with no PID answered `ok`, and old `busyPorts()` was `netstat`-based (`:707-711`). The old test pinned `held by PID ${process.pid}` (`aceec45` `control.test.mjs:118`), which is exactly what could not fire when this host's `netstat` hid the listener. The log's "second half" claim is real, not decoration.

Warnings (non-blocking):
- Wildcard-bind blind spot (measured): a child holding a port on `0.0.0.0` is invisible to `heldOnLoopback` — Windows allows the specific `127.0.0.1` bind over a wildcard listener, so the probe reports free. This host's `netstat` is equally blind (it names nothing here), so the new probe is strictly stronger than what it replaced, and `takenBy`'s log check (`already in use|EADDRINUSE`, `control-angular-dev-app/scripts/control.mjs:937`) still catches the spawn-time collision; but a wildcard-bound server reintroduces the defect class for `--host 0.0.0.0` runs. Fix direction: probe the wildcard bind (`0.0.0.0`, then `::`) as further addresses in `LOOPBACKS`, or state the limitation in the doc comment and an INTENT edge.
- `portsCheck` passes an unnamed holder by design ("a listener the OS does not name is still listening", `control-pangular-inspector/scripts/control.test.mjs:161`): the doctor's `ports` line can therefore never fail on a foreign holder the OS will not name. Deliberate and documented (`control.mjs:320-322`); worth a human eye because it shifts all foreign-holder protection onto the bind probe.
- `control-vitest-browser-angular/scripts/control.mjs:643-646` still derives busyness from `netstat` (its suite was map-injected by T018, its probe unchanged). Out of scope here by the task's own declaration, but it is the next skill that fails the gate the same way on a host where `netstat` goes blind for loopback binds.
- Pre-existing, not touched by T019: `control-ai-browsers/scripts/control.test.mjs:176` pins the absolute path `D:\projects\sandbox\angular-ai-devtools\extension` and a machine-measured extension id. It passes wherever that path exists and is unrelated to the port assertions.
- Reviewer-method note for future sidecar reviews: the docs-audit E6 test derives its inventory from the checkout root, so Markdown copies placed under the sidecar's `scratchpad/` redden `npm test` (`scripts/docs-audit-disposition.test.mjs:536`). I reproduced this with my own worktree copy, removed it, and confirmed 340/340 green — the failure was mine, not the head's.

Contract violations (blocking):
- none — the commit touches exactly the 16 files in the task's `files` list plus the task file (`git diff aceec45..5c21bf0 --stat`); the tracked tree is byte-identical to the head after my checks.

## Intent coverage

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Re-run in the sidecar at `5c21bf0` after `npm ci --include=dev` (root) and `npm --prefix spikes/ng222-app ci --include=dev` (the fixture provisioning INTENT names): `npm run check` exit 0 (both skills trees and run-code configs, panel, companion); `npm test` 340 tests, 340 pass, 0 fail, including the four control suites, the mirror test and the docs-audit gate. The only red seen during review was the docs-audit E6 test while my own scratchpad held Markdown copies — removed, re-run green (warning above). No Markdown changed in this wave, so no audit row is owed.

## Summary for orchestrator

- blocked findings: none — wave 7 passes.
- repeat offenders: none (first review cycle for this wave).
- warnings worth a human eye: the wildcard (`0.0.0.0`) bind blind spot in `heldOnLoopback` — same defect class as the one repaired, now for wildcard-bound servers, though strictly narrower than the `netstat` blindness it replaces on this host; the doctor's `portsCheck` accepting unnamed foreign holders by design; `control-vitest-browser-angular`'s probe still `netstat`-based one skill over.
