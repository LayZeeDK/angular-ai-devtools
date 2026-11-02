---
id: T005
title: Project the registered declarations into version-gated tool groups beside the pinned envelope
wave: 2
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-groups.ts
  - apps/angular-ai-devtools/src/app/tool-groups.spec.ts
  - tests/held-out/tool-group-gates.test.mjs
---

# T005 — Project the registered declarations into version-gated tool groups beside the pinned envelope

## Context

There is no tool-group concept at this head: `ToolDeclaration` carries `id`, `title`, `kind`, `host`, `outcome`, `publish`, `input` and `grep -i group` over `apps/**/*.ts` returns nothing. The envelope that would gain a field is SHA-256 pinned (`scripts/registry-envelope-pin.test.mjs` → `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e`), and its immutability is itself an acceptance criterion, so grouping is a read-only projection beside it: a static table plus one function over `registry.tools()`. Two facts shape the projection. `publish` is the axis nobody applies today even though the type's doc comment says the model loop filters on `'model'`, and one shipped tool (`panel_environment`) declares `publish: 'panel'` — a group that lists every declaration would offer the model a tool it may not call, which is the "group offered and empty" failure SC2 forbids. And the version the gate reads arrives with T002's replay, with `app_facts` authoritative when the two disagree (N2) — so the gate is inclusive at `minVersion`, and an unknown version excludes rather than opens.

## Approach

- **Membership by id, never by field.** `TOOL_GROUPS` lists `memberIds` of ids the envelope already declares; the projection resolves them against the declarations it is handed and drops ids that are not declared. Never call `provideTools`, `declare` or `attach` — re-declaring throws `ToolDeclarationError` (`tool-registry.ts:239-243,492-497`) at injector construction, not at render.
- **One projection, returned whole.** `groups` holds what may be offered; `excluded` holds one `{groupId, reason}` per withheld group so the entry point can say why the list is empty without an empty group ever existing; `emptyReason` is non-null exactly when `groups` is empty. Every reason is a long English sentence naming its source, the repository's convention for "not supported" and "cannot tell".
- **Gate order matters and must be observable.** Version first (unparseable or absent excludes everything with the cannot-tell reason), then facts when they are present: `supported === false` excludes with the page's reason quoted, and a `requiredFeature` that is not `true` excludes naming the bit. Facts always win over a passing version — N2 exists because a production page can carry a version whose debug surface is gone.
- **Do not reuse `angularVersionGate`.** `src/main-world/stale-view-scan.ts:60-72` answers `supported: true` for an unknown version, which is the opposite of the ruling here; the two gates keep their own meaning (INTENT § Corrections, 2026-11-02).
- **`requiredFeature` is redundant on the fixtures and kept deliberately.** All eight bits flip together on every fixture, so `supported` already covers them; the field exists so an injected or later partial payload can gate a group, which is what gives N2 a concrete meaning.
- **Purity.** Compare versions by parsing three numeric parts; never mutate `tools` or `context`; return fresh arrays. The held-out suite injects contexts directly and drives E4's boundary pair (at the gate, one patch below) and E5's all-failed case.

## Interface contract

- `panel-context.ts` exports `PanelSignals` (the four signals above plus `notSupported: boolean` and `notSupportedReason: string | null`), `PanelContext = { readonly facts: Readonly<Record<string, unknown>>; readonly version: string | null; readonly stateReceived: boolean }`, and `buildPanelContext(signals: PanelSignals): PanelContext`; with `stateReceived === false` it returns `facts = {}` with no `supported` key, and with `stateReceived === true` it returns `{ supported: !notSupported, reason: notSupportedReason, zoneMode: zoneMode === 'zone' || zoneMode === 'noop' ? zoneMode : 'unknown', features }` where `features` appears only when the signal is not null, and `version` is the trimmed `appVersion` or null.
- `tool-groups.ts` exports `ToolGroupDeclaration = { readonly id: string; readonly title: string; readonly memberIds: readonly string[]; readonly minVersion: string; readonly requiredFeature?: string }`, `ToolGroupView = { readonly id: string; readonly title: string; readonly toolIds: readonly string[] }`, `ToolGroupExclusion = { readonly groupId: string; readonly reason: string }`, `ToolGroupProjection = { readonly groups: readonly ToolGroupView[]; readonly excluded: readonly ToolGroupExclusion[]; readonly emptyReason: string | null }`, `TOOL_GROUPS: readonly ToolGroupDeclaration[]`, and `projectToolGroups(tools: readonly ToolDeclaration[], context: PanelContext): ToolGroupProjection`.

## Intent coverage

- SC2

## Acceptance criteria

1. `TOOL_GROUPS` and `projectToolGroups` live in `tool-groups.ts` beside the envelope; `tool-registry.ts` keeps its base bytes and its pinned SHA-256 `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e`, and the projection only reads the declarations it is handed (no `provideTools`, no `declare`, no new registry field).
2. Only members whose declaration reads `publish === 'model'` are counted, so `panel_environment` never reaches a group; a group left with no model-visible member is absent from `groups` and appears in `excluded` with a reason naming `publish`.
3. E4 — a version exactly at a group's `minVersion` includes that group; the same version one patch below excludes it, and the excluded group is absent from `groups` (present in `excluded` with a reason naming the version) rather than present with no tools.
4. E5 — when every group's gate fails, `groups` is empty, `excluded` carries one entry per declared group with its reason, and `emptyReason` is a non-null sentence stating why the list is empty.
5. A missing or unparseable version excludes every group with the cannot-tell reason and opens none, and the projection does not reuse `angularVersionGate`'s permissive unknown answer.
6. Facts win over the version (N2): a passing version combined with `supported: false`, or with a `requiredFeature` that is not `true`, excludes the group with the offending fact named in the reason.
7. The projection is pure: two identical calls return deep-equal results and neither the declarations nor the context is mutated.

## Verify

```bash
npm ci --include=dev && npm run check && node --test tests/held-out/tool-group-gates.test.mjs && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-groups.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
