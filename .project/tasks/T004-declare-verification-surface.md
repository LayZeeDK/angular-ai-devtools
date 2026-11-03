---
id: T004
title: Declare the components page as a verification surface and record its proofs
wave: 2
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/scripts/control.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
  - .commandcode/skills/control-angular-dev-app/SKILL.md
  - .commandcode/skills/control-angular-dev-app/features/README.md
  - .commandcode/skills/control-angular-dev-app/features/components.md
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - .project/research/DOCS-AUDIT.md
  - scripts/fixture-proof-fresh.test.mjs
---

# T004 — Declare the components page as a verification surface and record its proofs

## Context

A verification surface in this repository is a set of registrations, none of them automatic:
the target map and its port derivation, the skill's flow and port tables, the feature index
and the full sweep, a feature file in the four-H2 contract, a proof entry, and the doctor's
marker and readiness expectations (evidence finding 2). The page the first wave built is
reachable by none of them, so no later check can cite it; the port it must take has to
dodge 4200, which three entry points already claim (finding 23); and the four proof entries
that pin `spikes/ng222-app/src/app/app.routes.ts` are already stale at this head, with the
two stale-view fixture files in no manifest at all (findings 10 and 11), so re-recording is
part of declaring rather than a tidy-up.

## Approach

- **The target row is the ruling's own shape.** The components page is a top-level page with
  its own `TARGETS` entry and port, never a sub-frame, because the extension is pinned never
  to run in one (AR-5, evidence finding 9). The entry names `spikes/ng222-app` as its
  directory, `app-root` as its marker — the only element carrying `ng-version` on a routed
  single-page app, which is what `markerCheck` reads — `/components` as its readiness path,
  and one derived `app` port whose slot 0 is 4224 and whose slot n is `4600 + n`. Port 4200
  belongs to the portal and the panel's static server, 4222 to the counter, 4223 to the SSR
  fixture, 3000 to the portal API and 9999 to the Pangular server; 4224 is the first free
  default and its fallback range collides with nothing else in the skill.
- **A row without a test drifts.** `portRowsOf` is already exported for the test file, so
  assert the row itself and the collision set from the target map: every target's slot-0
  port distinct, and none of them equal to 4200, 4222, 4223, 3000 or 9999. The suite runs
  under `npm test`'s skills stage, which is what makes a later port change expensive enough
  to be deliberate.
- **Two servers over one fixture directory.** This target starts a second `ng serve` over
  `spikes/ng222-app`, so it shares that folder's `.angular` cache with the counter target:
  the feature file's preconditions say one target at a time in a checkout, and the recipe
  names the page's URL as the route on the target's own port.
- **Write the feature file the four-H2 contract asks for.** One H1, one paragraph of
  user-visible behaviour, then `Sub-features`, `How to get to it (user POV)`, `Driving it
  with control-angular-dev-app` starting with `Preconditions:`, and `Gotchas`. Its
  sub-features are the two harness probe hosts, the four surfaces and the rule ids the
  rules module states; its commands are the shipped ones and nothing invented. The Gotchas
  record what this milestone deliberately does not assert: the roles, the active descendant
  and the panel wiring the Aria directives render, which N23 will read from a live page.
- **The audit is derived, so the row is not optional.** A Markdown file added under a
  covered path needs a `## Doc:` section in `.project/research/DOCS-AUDIT.md` in the same
  task: the inventory is derived from the tree and compared exactly, the Summary tallies
  must equal the body, and each row names shipped evidence (a command or a file and line).
  A row that cannot name one is a claim the feature file should not make.
- **Re-record only the subjects this milestone changed.** `counter` pins
  `spikes/ng222-app/src/app/app.routes.ts`, which now imports the two page components, and
  the three features in the devtools manifest pin the same file, so those four are
  re-recorded with the recorded entries reused; the two stale-view fixture files enter
  `counter`'s closure because the routes import them, which is the point of the ruling. The
  new `components` feature has no recorded entries, so it is recorded with the fixture's own
  entries. Everything else that is stale — the vitest skill's `angular.json` entry, whose
  subject this milestone does not touch — stays stale and is named in the task Log rather
  than papered over.
- **Make freshness fail, not warn.** `scripts/fixture-proof-fresh.test.mjs` compares every
  recorded entry against the files at the head through the shipped manifest check and fails
  when one is stale or when a feature file has no record; it lives under `scripts/` because
  that is the only tree `npm test` globs, and a freshness check that nothing runs is the
  defect the flags rule exists for. It reddens on the next fixture change until that change
  re-records, which is the discipline the ruling asks for.
- **One maintained copy.** `.commandcode/skills/` is the maintained tree and only two skills
  are byte-mirrored to `.claude/skills/` (evidence finding 20); no `.claude` copy is edited
  to fake a registration, and the mirror's own suite proves it.

## Interface contract

- Page: the route path `/components` renders `ComponentsPage`, whose host tag is `app-components-page`, from `spikes/ng222-app/src/app/components/components-page.ts`; the routes `/`, `/stale-view` and `/stale-view-deferred` keep their entries.

## Intent coverage

- None

## Acceptance criteria

1. `control.mjs` declares a `components` target — directory `spikes/ng222-app`, marker `app-root`, readiness path `/components`, slot-0 port 4224 and `4600 + slot` above it — and `portRowsOf('components')` returns that row.
2. No slot-0 port in the target map collides with another target's or with 4200, 4222, 4223, 3000 or 9999, and `control.test.mjs` asserts both the row and the collision set, so a port or marker drift reddens a test that `npm test` runs.
3. The skill's flow and port tables and `features/README.md`'s feature index and full sweep name the `components` target, its derived port and the `/components` page.
4. `features/components.md` follows the four-H2 contract and drives the shipped commands — `node $S up --target components`, `node $S doctor --target components`, `playwright-cli` on the page — naming both probe hosts, the four surfaces and the rule ids, with its Gotchas naming the directive-rendered attributes N23 still needs.
5. `.project/research/DOCS-AUDIT.md` gains one `## Doc:` section for that file whose rows each name shipped evidence, its Summary tallies equal the body, and the inventory the gate derives covers every covered Markdown file exactly.
6. The two proof manifests record exactly the features whose subject this milestone changed — `counter`, `attach`, `profiler` and `signal-graph` — plus the new `components` feature; `counter`'s closure now hashes both stale-view fixture files, and every remaining stale feature is left stale and named in the Log.
7. `scripts/fixture-proof-fresh.test.mjs` fails when a recorded feature's files no longer hash to their record or when a covered feature file has no record.
8. `control.test.mjs`, `fingerprint.test.mjs`, `skills-mirror.test.mjs` and the docs-audit disposition suite pass at the head, so no `.claude` copy of a skill was edited to fake a registration.

## Verify

```bash
npm ci --include=dev && node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs scripts/fixture-proof-fresh.test.mjs scripts/docs-audit-disposition.test.mjs scripts/skills-mirror.test.mjs
```
<!-- The root install is the whole provision: every file here reads sources and
     manifests and hashes tracked files, so no fixture install is needed, and
     --include=dev is still named because this host exports NODE_ENV=production.
     The audit suite runs the derived-inventory gate over this checkout. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
