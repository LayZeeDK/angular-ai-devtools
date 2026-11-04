# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3

## T020 — E1 asserts what is projected: pass

- ✅ A projection point that projects nothing reddens the suite: replacing `<ng-content>` with `<ng-content select=".none">` fails, and the failure names what was not projected. — applied the mutant myself in `harness-probe.ts` at HEAD aeb167b: `node --test tests/held-out/fixture-harness-root-boundary.test.mjs` → 6 tests, 2 fail, both naming it — `mutant (projection point does not render the caller's content) — <app-harness-probe id="probe-a"> rendered 0 "projected content" marker(s) inside its root ... the projection point dropped the caller's content, so "projected content" was not projected` and `mutant (the probes do not project exactly their own caller content) — the rendered page shows 0 ... expected 2`. Restored byte-for-byte (`git status` clean), re-run green: 6 pass, 0 fail.
- ✅ The suite asserts a marker that is inside the probe root appears in the result, and a marker outside it does not, so inclusion and exclusion are each demonstrated rather than assumed. — `fixture-harness-root-boundary.test.mjs:152-183` asserts each rendered root carries exactly 1 `span.projected` marker with the caller's text at the projection point's position; `:185-210` asserts exactly 2 markers inside the two roots and the page's third outside every root (`roots.every((root) => !root.contains(outside[0]))`); `:212-229` mounts a root with no caller content and asserts 0 markers, so the marker is causal, not hard-coded. These read the rendered DOM, not marker source text.
- ✅ Moving the projection point still reddens it (the E1 ruling's structural case is preserved). — the three source-level cases stand (`:129-150`), and the rendered case re-asserts the position via `compareDocumentPosition` against the probe's own `<ul>` (`:173-181`); the task Log records the move-mutant failing (mutant 2) and the hard-coded-marker mutant failing (mutant 3), each then green on revert.
- ✅ Each new assertion was seen failing under its mutant and passing when reverted. — I re-proved the primary mutant myself (above); the task Log (T020, mutants 2-4) records the remaining three mutants failing with named messages and reverting to 6 pass / 0 fail, and the fixture was never modified (`git diff --stat -- spikes/` empty).

Warnings (non-blocking):
- The mount that renders the fixture is the suite's own projection semantics (`instantiate`, `:71-96`): a hand-rolled jsdom implementation of `<ng-content>` slotting. It honours `select`, wildcard fallback, document order and drop-uncclaimed, and fails loudly on a selector it cannot evaluate, but it can diverge from real Angular projection (for example caller content wrapped in `@if`, or multiple wildcards). The rendered half of E1 therefore rests on the 2026-11-03 ruling's accepted structural substitute, not on a rendered Angular run — inherent to the ruling, not a defect this task introduced, but a later milestone with a real mount should re-derive it.

Contract violations (blocking):
- none

## T021 — E2 reads bindings, not only literals: pass

- ✅ Adding `[attr.data-slot]` to one host — a binding that distinguishes them — reddens the suite, and the failure names the binding it found. — applied the mutant myself in `components-page.ts` at HEAD (`[attr.data-slot]="'one'"` on probe-a, `"'two'"` on probe-b): `node --test tests/held-out/fixture-harness-ambiguity.test.mjs` → 4 tests, 1 fail: `mutant (distinguishing attribute value on the two hosts) — matched attribute data-slot differs: <app-harness-probe id="probe-a"> writes [attr.data-slot]="'one'" and <app-harness-probe id="probe-b"> writes [attr.data-slot]="'two'", so a HAR-3 predicate on data-slot tells the hosts apart (prohibition N1)`. Restored byte-for-byte (`git status` clean), re-run green: 4 pass, 0 fail.
- ✅ Adding a literal attribute the harness does not match on leaves the suite green, so the check covers the attributes the harness reads rather than every attribute present. — the reader classifies literal, `[attr.x]`, `[x]`, `[class.x]`, `(event)`, `bind-*`, `#ref`/`let-*`/`on-*` forms and fails loudly on any form it cannot classify (`fixture-harness-ambiguity.test.mjs:91-129`, the unclassifiable-form guard at `:121-125`); the comparison keeps only `class` and `data-*` (`isMatchedName`, `:62-64`); the reader self-check (`:189-227`) asserts a host carrying `id`, `disabled` and `aria-label` compares on exactly `['class', 'data-probe', 'data-role', 'data-slot']` and that every written attribute was read (the drop-guard at `:216-220`); the task Log records `aria-label="probe a"` on one host green (4 pass / 0 fail) on the new suite where the old suite reddened.
- ✅ The `id` exclusion is asserted from the harness's declared match set rather than assumed, or the assumption is recorded as a ruling with its reason. — both arms are done, and the exclusion is a real assertion, not a restatement of a comment: the suite reads the fixture's authoring contract `.project/tasks/T002-harness-target-page.md:48-54` ("rendered twice with the same class list and the same data attributes ... an `id` is not an attribute a harness matches on") and fails if that declaration moves or is deleted (`:165-174`); pins `!isMatchedName('id')` and `!isMatchedName('aria-label')` (`:179-186`); and asserts the reader sees `id` on both hosts with differing values (`:273-287`), so the exclusion is the declaration's doing, not the reader's blindness. The suite header (`:28-46`) records what a declaration cannot pin — HAR-3 does not exist, the A8 ruling defers it — with its reason and its re-derivation condition (replace `isMatchedName` when the harness ships).
- ✅ Each new assertion was seen failing under its mutant and passing when reverted. — I re-proved the primary mutant myself (above); the task Log (T021) records nine further mutants, including both contract-declaration removals, reader-blindness and match-set-widening, each failing with a named message and reverting to 4 pass / 0 fail.

Warnings (non-blocking):
- The declared match set's authority is prose in a planning document (`.project/tasks/T002-harness-target-page.md`), not a product artifact; the suite correctly reddens if that prose moves, but until HAR-3 ships there is no shipped match set to reconcile against, and a later milestone that archives or rewrites the task file must re-home the declaration the suite reads.
- Residual source-level blind spot of the same class the header ruling already carries: a binding whose expression text is identical on both hosts but resolves differently per host (e.g. `[attr.data-slot]="slotId"` fed by different inputs) compares equal, because `describe` (`:137-141`) compares written source, not resolved values. Not reachable in the current static page template; re-derive when the fixture gains inputs.

Contract violations (blocking):
- none

## T022 — The port probe answers for both legs: pass

- ✅ A listener bound only on `::1` is reported busy, and reverting the probe to the `127.0.0.1` leg alone reddens the suite. — applied `LOOPBACKS = ['127.0.0.1']` in all five `.commandcode` `control.mjs` myself at HEAD and ran the five suites: 196 tests, 5 fail — one per skill, each the same case (`probePort reads a listener bound on ::1 alone as busy ... actual 'free', expected 'busy'`, the suite binding a real listener on `::1` only, `control.test.mjs:277-282` in each skill). Restored byte-for-byte (`git checkout -- .commandcode`, `git status` clean), re-run green: 196 pass, 0 fail. The probe itself binds both legs with one-unknown-leg poisoning (`control.mjs:700,735-752`).
- ✅ "Busy", "free" and "cannot tell" are three distinct outcomes: a port whose bind fails for a reason other than `EADDRINUSE` is reported as unknown, not free, and the suite reddens if it is silently treated as free. — applied the fold-unknown-into-free mutant myself in all five `control.mjs` (error arm resolving `'free'` for non-`EADDRINUSE`): 196 tests, 10 fail — two per skill: `no host has 192.0.2.1, so nothing was learned about ...: not free` and `an undecided port is in the map: what is not known to be free is not offered`. Restored, re-run green: 196 pass, 0 fail. `bindAnswer` maps `EACCES`/`EADDRNOTAVAIL` to `unknown` (`control.mjs:718-725`), `probePort` lets one unknown leg poison free (`:746-748`), and `busyPorts` puts an undecided port in the map so `planPorts` refuses it (`:774-793`, asserted at `control.test.mjs:291-298`).
- ✅ Each of the five control skills carries the same probe and the same assertions, with the `.claude` mirrors byte-identical. — all five `.commandcode` `control.mjs` declare `LOOPBACKS = ['127.0.0.1', '::1']`, the three-valued `bindAnswer`/`probePort`/`busyPorts` and the same three probe tests (grep-verified; `control-vitest-browser-angular`'s netstat-only `busyPorts` is gone); I compared all ten `.claude` copies against their `.commandcode` counterparts with `git diff --no-index` — byte-identical — and `node scripts/skills-mirror.test.mjs` passes 2 / 2.
- ✅ Each new assertion was seen failing under its mutant and passing when reverted. — I re-proved both primary mutants myself (above); the task Log (T022, mutants C and D) records the `busyPorts` keeps-only-busy and holder-less-planner mutants failing and reverting to 196 pass / 0 fail.

Warnings (non-blocking):
- The probe decides by binding, so a port it finds free can still be taken between the probe and the spawn (inherent TOCTOU, unchanged by this task and acknowledged by the presence-read planner).
- The `::1`-alone and unbindable-address tests rely on the host's IPv6 stack and RFC 5737 routing behaviour; on a host without IPv6 loopback the busy-leg case could not run. Both passed on this host.

Contract violations (blocking):
- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass

- ✅ At HEAD aeb167b (clean tree) I ran the whole fixture held-out family: `node --test "tests/held-out/fixture-*.test.mjs"` → 35 tests, 35 pass, 0 fail — covering E1's root-boundary suite (now asserting what is projected, per T020), E2's ambiguity suite (now reading bindings, per T021), and the unchanged E3 predicate, E4 mutation, E5 order, E6 explainers and E7 rebuild suites the same criterion names. One caveat discovered and resolved in my own checkout, not the tree: the E7 rebuild suite failed in my fresh sidecar until I built the gitignored `packages/ai-devtools-companion/dist` with the project's own nx/tsc command (the suite's cold-clone guard `MISSING_FIXTURE_INSTALL` names the target that builds it); after that build the suite passes — a sidecar-environment gap, not a wave-8 defect.

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Scoped legs re-run at HEAD aeb167b, clean tree: the five skill suites the wave changed (196 tests, 196 pass), `npm run check:skills` exit 0 (tsc over all four skill tsconfigs, covering the rewritten `control.mjs` files), `node scripts/skills-mirror.test.mjs` 2 pass, and the fixture held-out family 35 / 35. The full `npm run check` and `npm test` were not re-run per the wave brief; the legs this wave's changed files belong to are green first-hand.

## Fixed since last cycle

- (cycle 1 — no previous cycle)

## Summary for orchestrator

- blocked findings: none. All three tasks pass; the two high proof holes the final gap review named are closed by assertions I re-proved by mutant myself, and the wave-7 port-probe holes likewise.
- repeat offenders: none in this wave. The E1 rendered-leg caveat (the suite's own projection semantics rather than a real Angular mount) is carried by the 2026-11-03 ruling and should be re-derived when a real harness mount exists; the T021 match set still has no home outside a task markdown until HAR-3 ships.
- warnings worth a human eye: (1) `fixture-rebuild-idempotent` fails on a cold sidecar clone until `packages/ai-devtools-companion/dist` is built by its named target — the suite knows this and names it, but a fresh Verify checkout must run that build before the fixture family, or E7 reads as a false red; (2) the T021 declared match set lives in `.project/tasks/T002-harness-target-page.md:48-54`, prose a later milestone could archive; re-home it when HAR-3's real match set lands.
