# Plan — Angular AI DevTools (M018 instrument-core)

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no wall-clock, token or cost cap on a wave -->
- review_panel: off      <!-- copied from INTENT.md `Review panel:`; the installer family patch has not landed -->
- finding_skeptics: off  <!-- copied from INTENT.md; it names no skeptics -->

## Wave 1 — risk burn-down: the envelope and its six hostile shapes

Goal: Prove the envelope's shape before anything is built on it. T001 fixes the declaration and
backing records, the `kind`, `host`, `outcome` and `publish` enumerations, the outcome union and the
validation that fails naming the tool id and the field; T002 declares six tools whose only reason to
exist is that each carries a different `kind`, `host` or `outcome` — a write with confirm, an async
handle, an image result, a two-host read, a wrapped third-party tool and a page-state-dependent
schema — and proves the named `not-implemented` outcome for a declaration with no backing. If a
shape cannot pass through these records, the milestone changes here and nowhere else: every later
task in this plan compiles against T001's types, and the six shapes are the only defence the
envelope gets before fourteen generation-1 explainers inherit it.
Review depth: deep

## Wave 2 — the walking skeleton: app_facts over real page data

Goal: One tool that answers for real from page data the panel already receives. `app_facts` is
declared through the registry, reads the app-facts support record the inspected page already
publishes — which `extension-message.service.ts` drops at the wire boundary today — and returns it
with `provenance: 'page-published'`, together with a support check a later explainer calls before it
offers a capability and a dev-mode caveat for the two Tier-0 reads. Before the page has published
anything, `app_facts` returns the named `host-unavailable` outcome, never an empty result: this is
the thinnest slice that runs end to end in the panel without the page-request transport the product
does not have yet.
Review depth: full

## Wave 3 — the read surface, its reach guard, and the role/name computation

Goal: Ship the five read wrappers behind one page-read port together with the repository check that
makes "reachable only through the registry" an observation rather than a convention (T004), and the
DOM role and accessible-name computation (T005). T004's port answers `host-unavailable` by name while
the transport is absent, so no wrapper can turn "I could not ask the page" into an empty list, and its
guard must fail for a direct import of a page reader and pass for the same module going through the
registry. T005 is dependency-free and parallelises here on purpose: it touches no registry file, so it
neither waits for the envelope nor risks it.
Review depth: full

## Wave 4 — the extension point proven twice, then the project Verify

Goal: Add two tools in two separate commits that touch no envelope file, with a pinned hash proving
the registry core is byte-identical between them (T006, T007) — the milestone's own regression proof
that the declaration record is the only extension point. Then close the milestone's gate work in T008:
`npm run check` starts type-checking the panel and the registry without narrowing anything it checks
today, `npm test` is left green at the head (it is red at HEAD today on the docs audit), and the
panel's initial bundle is measured against the hard 520 KB budget the registry now sits on.
Review depth: full

## Intent coverage

<!-- One row per acceptance item. Every SCn is covered, and each row's task owns that SCn. -->

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T001 | AC2 |
| SC1 | T001 | AC3 |
| SC1 | T001 | AC4 |
| SC1 | T001 | AC5 |
| SC1 | T001 | AC6 |
| SC1 | T002 | AC1 |
| SC1 | T002 | AC2 |
| SC1 | T002 | AC3 |
| SC1 | T002 | AC4 |
| SC1 | T002 | AC5 |
| SC1 | T002 | AC6 |
| SC1 | T002 | AC7 |
| SC2 | T006 | AC1 |
| SC2 | T006 | AC2 |
| SC2 | T006 | AC3 |
| SC2 | T006 | AC4 |
| SC2 | T006 | AC5 |
| SC2 | T006 | AC6 |
| SC2 | T007 | AC1 |
| SC2 | T007 | AC2 |
| SC2 | T007 | AC3 |
| SC2 | T007 | AC4 |
| SC2 | T007 | AC5 |
| SC3 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC3 | T003 | AC3 |
| SC3 | T003 | AC4 |
| SC3 | T003 | AC5 |
| SC3 | T003 | AC6 |
| SC3 | T004 | AC1 |
| SC3 | T004 | AC2 |
| SC3 | T004 | AC3 |
| SC3 | T004 | AC4 |
| SC3 | T004 | AC5 |
| SC3 | T004 | AC6 |
| SC3 | T004 | AC7 |
| SC3 | T004 | AC8 |
| SC4 | T005 | AC1 |
| SC4 | T005 | AC2 |
| SC4 | T005 | AC3 |
| SC4 | T005 | AC4 |
| SC4 | T005 | AC5 |
| SC4 | T005 | AC6 |
| SC4 | T005 | AC7 |
| SC5 | T008 | AC1 |
| SC5 | T008 | AC2 |
| SC5 | T008 | AC3 |
| SC5 | T008 | AC4 |
| SC5 | T008 | AC5 |
| SC5 | T008 | AC6 |

## Held-out checks

<!-- E7 and E8 are dismissed in INTENT.md and are deliberately absent. Each Test cell is a file the
     owning task creates, followed by the exact `it(...)` title its Acceptance criteria quote. -->

| Edge | Task | Test |
|------|------|------|
| E1 | T002 | apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts::E1 every hostile shape declares its kind, host and outcome, and a declaration missing one field fails naming the tool id |
| E2 | T001 | apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts::E2 a declared tool with no backing returns a not-implemented outcome, never an empty result and never a throw |
| E3 | T006 | scripts/registry-envelope-pin.test.mjs::E3 the registry core hash is pinned and any edit to it fails the pin |
| E4 | T004 | scripts/registry-reach.test.mjs::E4 a module importing a page reader directly fails and the same module going through the registry passes |
| E5 | T005 | apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts::E5 a labelled control and a content-named control both yield a role and a name, and an unlabelled control yields no accessible name |
| E6 | T005 | apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts::E6 the name is read from the DOM at call time, so changing the label changes the next result |

## Dependency notes

**T001 → T002 (data, same wave, layered).** T002 imports `ToolDeclaration`, `defineTool` and the
outcome union from the module T001 creates; a reviewer sees both specs importing the same names from
`tool-registry.ts`. The wave split inside the wave exists because T002 proves the shape T001 settled
— it is the first layer, not a second deliverable. Neither task touches a file of the other's:
`app.config.ts` is edited by T001 only, because the six hostile tools are declared `internal` and
registered in their own TestBed (E1 is a conformance assertion, not a shipped capability), which also
keeps them off the panel's initial-bundle path.

**T001 → T003 (data and a shared file).** `app_facts` is declared with `defineTool`/`provideTools`
from T001's module and its provider line lands in the same `app.config.ts` T001 creates. T003 is a
wave later rather than a same-wave dependent because its deliverable is the first running slice and
because it changes `extension-message.service.ts`, the shipped message contract the panel's views
read — a change worth reviewing on its own.

**T001 → T004 (data).** The five wrappers are declarations plus backings built on T001's records; the
`host-unavailable` and `invalid-input` error codes T004 returns are T001's `ToolErrorCode` members.

**Why the reach guard is inside T004.** The check observes the module T004 creates, and its red side
and green side must be reviewed together: split into a second task, the guard's passing case could be
"sorted nothing because the reader module was not there", which is exactly the vacuous check E4
forbids. One deliverable — the read surface and the proof that nothing reaches around it — also keeps
one shared shape block per task, so a reader never has to reconcile two contract blocks in one file.

**T006 → T007 (files and a landed effect).** Both additions edit `app.config.ts`, and E3 requires
them in two separate commits in that order: T006 writes the pinned SHA-256 of `tool-registry.ts`,
T007 must land with that hash still matching. A reviewer reads the two diffs side by side and sees
that neither touches the registry core, its records or its validation.

**T001–T007 → T008 (landed effect).** T008 gates the head those seven tasks produce: its `npm test`
run covers every spec this plan adds, its `--listFiles` pin names the modules they created, and its
bundle measurement is only meaningful once the registry is on the initial-bundle path. It is also the
only task that repairs the docs-audit case that makes `npm test` red at HEAD, so no earlier task may
claim a green `npm test`.

**T005 is deliberately dependency-free.** It touches no registry file, no `app.config.ts` and no
message contract: the role/name computation is a DI-free DOM read. It sits in wave 3 because that is
where its sibling surface work lands, not because it waits for anything — an edge from T004 to T005
would be narrative order and is not declared.

**The page-request transport is not in this milestone's `Scope: in` and is not built here.**
`.project/research/evidence-codebase.md` records that `angular-ai:di-query` has no caller and no
transport and that `host:capability`/`host:pick` is an inverted dead stub with no producer. M018
therefore declares `host: page` honestly and makes the port answer `host-unavailable` by name (T004
AC5), rather than shipping a second stub that makes an unanswerable read look implemented. Copying
the `host:pick` shape would recreate exactly the finding the map raised.

**Contract sharing.** The envelope block appears in six tasks (T001 defines it; T002, T003, T004, T006
and T007 author tools against it) and is byte-identical in all six, because each of those tasks
declares or returns those exact records. No task that does not exchange a tool record carries it:
T005 and T008 carry `None`. There is no other shared block in this plan.

**Why the two added tools are not one task.** E3's ruling is that the envelope module must not change
between the two additions; one task with one commit cannot prove that ordering. Two tasks, two
commits, one pinned hash is the smallest shape that makes the proof real.
