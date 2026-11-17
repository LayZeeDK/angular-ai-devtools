# AGENTS.md

Rules for agents working in this repository. Each rule is one line; the reference it points to holds the detail.
Read a reference only when the task touches it.

## Toolchain

- TypeScript is pinned to 6.0.x (`package.json`). If `npm run check` fails with errors no change explains, check
  `node_modules/typescript/package.json`: a 7.x there means a stale install; run `npm ci`.
- Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills).
- Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23); invoke via `node` or `npx nx`.
- GSD Path helpers: call `%USERPROFILE%\.commandcode\gsd.bat <verb>` (it runs `scripts/gsd/gsd.ts`). The `gsd`
  shim on PATH is a different global install whose `dist/loader.js` is missing, so bare `gsd <verb>` fails.

### Verify sidecar dependencies

Verify sidecars created by `isolation.py isolate-verify` ship without `node_modules`, so `npm run check`
fails with TS2688 unless dependencies are bridged from the primary worktree. The automatic bridge
(`scripts/sidecar-deps-bridge.mjs`) now creates and removes the junction for you when running checks in
a sidecar, so no manual step is needed in the common case. For legacy sidecars the manual junction
procedure still works: create a directory junction from the sidecar to the primary `node_modules`, run
`npm run check`, then remove the junction. Windows command: `mklink /J <sidecar>\node_modules <primary>\node_modules`.
The junction must be removed before retiring the sidecar (`isolation.py retire --force` clears stale
sidecars, including worktree and branch).

## Browsers and on-device models

- Drive the browsers only through the `control-ai-browsers` skill; each instance runs in its own profile under the
  primary checkout's `.commandcode/worktrees/.browsers/` (git-ignored). Never start, stop or touch a browser profile
  outside it.
- Launch an instance profile only through `control-ai-browsers up`, never by hand: Edge then signs Lars's Windows
  work account in and syncs it. The Edge sign-in switches are browser-level in `instances.json`; `up` and doctor
  refuse a profile that holds an account.
- The instances and their models are shared by every checkout: a worktree or GSD Path sidecar runs `up`, gets
  `alreadyRunning`, and must not wait for or start a model download. A model missing from a shared profile is a
  bug to fix in the skill, not an environment blocker (`.commandcode/skills/control-ai-browsers/SKILL.md`, Gotchas).
- Every instance loads `extension/`. Run `npx nx run angular-ai-devtools:build-extension` before `up`, and prove the
  extension's Prompt API feature with `control-ai-browsers panel <name> --url=<app>` or `verify-ai-browsers`
  `checks/extension-panel.mjs`.
- `.commandcode/skills/` is the only maintained copy of the `control-*` and `verify-*` skills. `control-ai-browsers`
  and `verify-ai-browsers` drive instances shared by every checkout, so change a skill there and nowhere else: there
  is no second tree to keep in step. `npm test` and `npm run check` read that tree alone.
- `edge-dev-aion` runs with `--disable-component-update` and a pin of model 2026.10.15.1, runtime 2026.10.12.1 and
  manifest 2026.10.19.1 (measured 2026-10-30 on Edge Dev 158.0.4357.0: doctor exit 0, canaries 2-4 s). The earlier
  2026.10.2.1 pin could not generate on 158 and wedged a renderer, so do not restore it. Keep the switch, and prove a
  newer pair on a throwaway copy of the profile first: `references/edge-dev-aion-model.md`.
- Running the `state` and `extension-panel` verdicts (cost, timeouts, known hangs, coordinating with other sessions):
  `references/ai-browsers-verification.md`.

## Verification fixtures

- Panel verification runs against pages served by `control-angular-dev-app`. The counter app (`spikes/ng222-app`)
  carries a dev-only `stale-view` route (`src/app/stale-view-fixture.ts`, owner ruling 2026-10-30) so N24's claim is
  producible; adding another such route is a fixture change and needs a ruling of the same kind.
- The interop claim (N25) is producible from this repository. `spikes/ng222-app/src/app/stale-view-fixture.ts`
  (owner ruling 2026-10-30) holds both halves N25 needs: `toSignal(this.subject)` at line 14 and an unlabelled
  `effect` whose body calls `subject.error(...)` at line 22, served at `/stale-view` (and `/stale-view-deferred`
  for the capturable slice). The recorded source is `spikes/ng222-app`; the portal is not required.
- The interop verification is prepared, its logic proven, and its live run owed:
  `control-ai-browsers/features/interop.md`, `panel --feature=interop` (the driver pushes `/panel/interop`,
  `scripts/panel.mjs:246`), and `verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01:
  `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` reports `tests 10`, `pass 10`). The app serves
  the route (`apps/angular-ai-devtools/src/app/app.routes.ts:24`), so the check's route assertion passes as soon as an
  instance runs the built panel. Measured 2026-10-31: check exits 0 on `edge-dev-aion` with `nodes: 1`, verdict `verified`
  (2/2), evidence `.project/build/verify/interop/`.

- **Every milestone runs unattended.** The owner's standing instruction: "A fresh session should
  be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete the next milestone end-to-end without a human-in-the-loop, with full milestone
  decision authority." It applies to every milestone in this program, not to one of them. At each
  milestone's first legal boundary — `inspect/active` or `define/active` with `STATE.milestone:
null` — record the grant once with `gsd.bat preapprove --repo <root> --grant
intent,plan,rulings,ship`, quoting that instruction whenever a ruling is recorded as delegated.
  `STATE.milestone` must still be null at that moment: only `milestone intent approved` names it,
  so never set it in the next-milestone transition. Do not stop for the intent gate, the plan gate,
  a prohibition, an edge, a `NEEDS-USER` row, or ship approval; stop only at a helper failure, a
  contradiction the evidence cannot settle, or two identical failures.

- **Subagent dispatch uses the paid ladder, never the free one.** The owner's instruction: "Use
  paid-* subagents instead of free-*" and "Plan the most cost-effective paid model for each
  subagent task." `.project/model-policy.json` carries the per-role table; the cost arithmetic and
  the role mapping are in `~/.commandcode/references/paid-model-plan.md`. DeepSeek V4.1 Flash for
  every tool-loop role, because its cache read is ten times cheaper; GLM-5.3 Flash for `reviewer`,
  `skeptic` and `review_panel`, because an independent verdict may not share the parent's family.
  Re-read that plan before changing a role's model.

- **Skill timing is recorded, not discovered.** `~/.commandcode/references/gsd-path-skill-timing.md`
  is authoritative for when a `lars-*` or pstack skill runs in a milestone and what artifact it
  must leave: `lars-verify` before a wave review, `lars-review` after the canonical review,
  `lars-maintain-verification` only on drift and as a declared task, `lars-create-verification`
  only at define.

## Control skills

- Every `control-*` skill stops processes through its byte copy of `proctree.mjs`; never kill by process name.
- A process the run did not start (another program now holding a recorded PID, a port holder) is printed by PID,
  image name and start time only, never by command line, which can carry a secret.

## GSD Path

GSD Path workflow rules and lessons learned live in the user-scope
`~/AGENTS.md` (`## GSD Path` section). Detailed progressive-disclosure
docs are in `~/.commandcode/references/gsd-path-notes.md`.

### A milestone cannot ship without working verification skills

`npm run gate:verification` (structure) runs inside `npm run check`, so CI fails when a `verify-*` check does not
load, its unit test fails, a `control-*` skill breaks the `lars-create-verification` contract, or a byte-copied
script drifts. `npm run gate:verification:ship` adds the evidence half: every check needs a `verified` verdict under
the evidence root, and no check may carry a `not verified` verdict. Run it before the ship gate and before
`prepare-final`; it writes `.project/review/VERIFICATION.json`, which the ship decision quotes. A blocker there is a
ship blocker, and a `--evidence` path that hides a check is not an argument.

- Verification skills are exercised, not assumed: a check that has never produced a `verified` verdict is named by
  `gate:verification:ship` as a blocker, not treated as coverage.
- Fix a broken check in its own skill (`verify-ai-browsers`), never by widening its claim or skipping it in the gate.
- The three user-scope skills govern the work: `lars-create-verification` (the contract), `lars-maintain-verification`
  (keeping the map true), and `lars-verify` (the verdict). A check that none of them can run is a defect in the check.

## Programmes

### The intent's edge table is five columns — owner ruling 2026-11-15

`check_handoffs` validates `## Edge coverage` as `Edge | Criterion | Category | Disposition | Detail`
(five columns). M041's `scripts/navigation-blocking.test.mjs` reads a six-column table with a `Test`
column and expects suite titles to carry edge ids; an intent cannot satisfy both, and four of M045's
thirteen verify failures came from that alone.

The five-column grammar is authoritative. The test-to-edge mapping lives in one place: the plan's
`## Held-out checks` table (`Edge | Task | Test`). `navigation-blocking.test.mjs` must read the plan's
table for that mapping instead of demanding a sixth intent column. Do not add a `Test` column to
`INTENT.md`; duplicating the mapping across two files leaves nothing keeping them in step.

The product is a backlog of **seven programmes** (generations), defined in
`plans/angular-ai-devtools-program-backlog.md`. That document is the durable record of the
owner's rulings and the milestone backlog; `.project/ROADMAP.md` is the authoritative roadmap
and holds only the generation currently admitted. Read the backlog before planning any
programme; do not invent milestones it does not list.

- **One root, never one root per programme.** A programme is a `CHARTER.md` section plus a
  `Programme:` label on each roadmap entry. GSD Path has no programme layer.
- **A roadmap approval admits at most twelve entries.** A larger scope splits: the overflow
  becomes the head of the next generation. Generation 2 listed thirteen, so `console-read`
  is carried rather than packed in.
- **Ids never restart and are never renumbered.** Insertions during a generation shift every
  later id, so map backlog ids to shipped ids by slug, not by number. Generation 1 ran
  M018–M031 for twelve backlog milestones because `proof-corpus-repair` and
  `image-warning-capture` were inserted in flight.
- **The backlog's fields are copied, then expanded.** A `Goal:` line and a `Gate:` become
  `Goal`, `Scope: in`/`out`, `Success criteria`, `Risks` and `Open questions`. A spike gate
  belongs in its entry's `Open questions`, not only in the backlog.

### Closing a generation and opening the next

Each helper refuses an argument it is not given, one at a time, so run these in order rather
than batched. `<sha>` is a full 40-character SHA wherever one is taken.

1. **Bind the new branch first.** `git checkout -b gsd-path/M0NN`. Until the branch matches
   `STATE.branch`, every `pipeline_state.py route` call blocks with
   `current branch main != STATE.branch …`.
2. **Close the old programme:** `pipeline_state.py transition` from `shipped/done` to
   `inspect/active`, setting `--set-phase inspect --set-status active --set-branch <new> ---set-milestone null --set-archive null`. Pass **every** `--expect-*` field including
   `--expect-archive`; an omitted expectation is an error, not a default.
3. **Inspect is the chunked re-inspection.** `workflow_run.py prepare-inspect` refuses once
   `research/DOCS-AUDIT.md` exists, which is every programme after the first. Freeze the
   inventory, create the docs sidecar, chunk with `gsd inspect chunks`, dispatch one brief per
   chunk, then `gsd inspect lint`. Expect `chunk-NN.brief.md` for the briefs and `chunk-NN.md`
   for the fragments — telling a reviewer to read `chunk-NN.md` gets a correct refusal.
4. **`gsd inspect assemble` needs five arguments:** `--head`, `--inventory`, `--parts`,
   `--audited` and `--prior-audit`. It asks for them one at a time.
5. **Delete `<sidecar>/.project/research/parts/` before collecting.** The collector treats
   anything beyond the assigned artifact as an unexpected path.
6. **Collecting over an existing artifact needs proof:** `isolation.py collect-artifact …
--expected-destination base` asserts the file being replaced still matches the base commit.
   Without it the collector refuses, which is right — it stops a hand-edited artifact being
   discarded silently.
7. **Close the inspection**, then **open the roadmap:** from `define/active` the event must be
   exactly `roadmap re-slice started`. Any other wording is refused.
8. **Write the entries and the charter Correction together.** The roadmap gate checks a
   charter-to-milestone bijection, so a generation that is not admitted into `Full scope: in`
   as a dated Correction fails it.
9. **Approve the roadmap with the generation's first milestone:**
   `pipeline_state.py approve --kind roadmap --milestone <first-slug> --expected-head <sha>`.
   The approval itself records `roadmap/done` and names the milestone, so do not transition
   after it.
10. **Open define:** `roadmap/done → define/active` with `--expect-archive null` and
    `--expect-milestone <first-slug>`.

### Checking the state

`gsd loop-guard --repo <root>` reports `terminal`, `remaining` and whether the programme is
complete. A roadmap with `remaining: 0` returns `STOP: programme complete`; a fresh generation
puts a positive `remaining` back.

### What a programme open costs, measured

Generation 1 to Generation 2 took one docs audit of 145 documents in **11 chunks**
(~5.5 M tokens on free Glyph), five argument refusals from `assemble`, two from `collect`, and
four from `transition`. Budget a session, not an iteration.

## Verification target: the Insurance Portal first

Every feature is verified on the **Insurance Portal**
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served by
`control-angular-dev-app up --target portal`). It is the default target for a `verify-*` check and for a
screenshot, not an extra.

A fixture (`spikes/ng222-app`, `spikes/ng222-ssr`) is a fallback **only** when no portal feature carries the
runtime artefact the claim needs — with or without the opt-in providers and primitives the claim exercises. A
verdict that used a fixture must name the portal route it tried and the artefact the portal lacks; without that,
the verdict is not coverage.

Measured on 2026-11-07: 15 of 23 verdict specs drove the counter fixture on `:4222` and 3 drove the portal, so
most of the current evidence is fixture evidence and is not coverage under this rule. Re-target it as each
milestone's verification is re-run; do not restate an existing verdict as portal evidence.

### The portal is migrating to zoneless: verify against a pinned zoneful worktree

The Insurance Portal is **in the middle of a migration to zoneless Angular**. Until that migration is confirmed complete,
the verification target is an **isolated worktree of the zoneful version**, pinned to a recorded commit — not the portal
checkout's moving `main`.

Why it matters, measured 2026-11-07 against the live portal: `update-cause`, `signal-provenance`, `stale-view` and
`interop` each refused with _"Angular Zone.js change detection is not supported; use zoneless Angular 22"_, and
`di-doctor` rendered controls with zero rows. Those four joins need the zoneless signal graph; a zoneful target cannot
produce them, so they are a **legitimate fixture fallback** — provided the verdict names the portal route tried and the
artefact the zoneful portal lacks.

Recorded target:

| Field         | Value                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Path          | `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful` (isolated worktree) |
| Pinned commit | recorded in `skills/control-angular-dev-app/features/.proven.json` when the worktree is created               |
| Serve         | `control-angular-dev-app up --target portal --dir <path>` (or `CONTROL_NG_PORTAL_DIR=<path>`)                 |

When the migration completes, re-pin to the portal's zoneless `main` and re-target every verdict that was taken on the
zoneful worktree; do not restate a zoneful verdict as zoneless evidence.

### Correction, 2026-11-08 — the migration completed; verify against the zoneless portal

The subsection above ("The portal is migrating to zoneless: verify against a pinned zoneful worktree") is **superseded**. Measured
today: the portal checkout `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` is on branch
`claude/ai-devtools-spike` at `92d46ec`, `package.json` carries **no** `zone.js`, and the app is zoneless.

What that changes:

- **Target.** The portal at that branch is the verification target. The pinned zoneful worktree is retired: do not take a new
  verdict on it, and do not restate a zoneful verdict as zoneless evidence. Re-target as each milestone's verification is re-run.
- **The four refusals are gone.** `update-cause`, `signal-provenance`, `stale-view` and `interop` refused on a zoneful page with
  "Zone.js change detection is not supported; use zoneless Angular 22". On the zoneless portal they can be exercised, so the
  fixture fallback that was justified for them is no longer justified — the fallback list shrinks to whatever the portal genuinely
  cannot produce, and each remaining entry must name the route tried and the artefact it lacks.
- **The portal now carries its own skills** — `control-insurance-portal`, `verify-insurance-portal`, `control-api`, `verify-api`
  under `.commandcode/skills/` in that checkout. For a portal-targeted check, prefer the portal's own skill: it owns that app's
  routes, its API and its fixtures. Our `control-angular-dev-app` / `verify-*` skills remain authoritative for the extension and
  the panel itself, which are ours.
- **Nothing else about the portal-first rule changes.** It is still the default target; a fixture still needs a named reason.

This is the exit condition the superseded subsection wrote for itself, discharged by measurement rather than by waiting for someone
to declare the migration done.

### Why a landing is expensive, measured on M046

M046 took about eighteen hours of wall clock and thirty-two commits for seven tasks. The cost was
not the product work; it was four mechanical failures, each of which now has a check:

- **An undeclared path costs a full Verify.** `isolation.py land` refuses the allow-list after the
  Verify has run, so one path a task's `files:` omitted wasted an eighteen-minute verify — three
  times. `gsd land` now checks the allow-list first and names every undeclared path at once.
- **The Verify's output was invisible.** `gsd land` printed eight lines, and the harness wrote
  zero-byte logs, so six attempts were made blind. `gsd land` now writes the whole output to
  `.project/build/verify-<TASK>.log` and prints that path. **Read that file before re-running.**
- **Recordings drift on every commit.** `research/raw/m044-gate-shapes.json` and
  `m056-gate-stability.json` derive their range from HEAD, so any commit after a capture makes them
  stale, and the failure reads as a product defect. Re-derive both as the **last** commit before a
  landing: `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and
  `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`.
- **A nested suite can time out under load and look like a product failure.**
  `scripts/user-scope-autonomy.mjs` runs the whole helper suite (334 tests, ~105 s alone) with a
  child ceiling; under `npm test`'s parallelism it hit a 240 s ceiling and reported as a failing
  pin. The ceiling is now 600 s with the measurement in the comment.

The rule that follows: a landing is one attempt per iteration, and before every attempt the tree is
clean, both recordings are re-derived, and every path the Verify writes is declared.
