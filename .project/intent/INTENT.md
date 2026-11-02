# Intent — M020 feature-fingerprint

Lane: milestone
Surfaces: panel
Review panel: off
Finding skeptics: off

## Summary

N18 opens a chat with only the tool groups the app's version gates allow, plus a
context chip naming the features it detected. M018 registered the tools and M019
gave them a context budget, a worker boundary and jobs; nothing yet reads the
registry, and nothing turns the page's announced feature bits into a decision.
This milestone adds the missing adapter from the page's `angular-ai:state`
payload to `app_facts`, projects the registered declarations into
version-gated groups without touching the pinned envelope, and renders both the
group list and a fingerprint chip in the panel.

## Problem

The panel's six explainers answer one question each. The registry holds eight
tools and six hostile declarations, and a store whose feature bits arrive from
the page and are never read: `ExtensionMessageService.features()` and
`zoneMode()` have no production consumer, `app_facts` answers
`host-unavailable` on every real call because nothing builds its `ToolContext`,
and a version gate exists twice — in `extension/agent-main.js` and in
`src/main-world/stale-view-scan.ts` — in two languages, with opposite bias about
an unknown version, and neither reaches the panel. A user opening the panel
therefore cannot see what the inspected app actually supports, and the next tool
surface has no way to ask. The failure mode is quiet: a group offered and empty,
or a chip that names a feature the app lacks, both look like working software.

## Users

Lars, and the eleven explainer families still to be built on this registry.
Every later milestone that offers tools in a list needs the group filter and the
fingerprint to exist first, so a wrong shape here is paid for many times.

## Success criteria

1. The context chip names the features detected for the inspected app, including the features it does not have.
2. A tool group whose `[ng-version]` gate fails is absent from the chat's group list, not present and empty.
3. A non-Angular page produces a named refusal rather than a chip claiming features.
4. `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | precision | held-out | A page whose `app_facts` carries exactly two of the eight feature bits renders those two as present and the other six as absent by name; dropping an absent bit from the chip fails the test. |
| E2 | SC1 | ordering | held-out | Features render in one stable order (the declaration order of `APP_FACT_FEATURES`), so the same payload twice produces byte-identical chip text. |
| E3 | SC1 | empty | held-out | An Angular page that announces state with every feature bit false renders a chip naming eight absent features — not an empty chip, and not an invented one. |
| E4 | SC2 | boundary | held-out | A version exactly at a group's gate includes that group; the same version one patch below excludes it, and the excluded group is absent from the list rather than present with no tools. |
| E5 | SC2 | empty | held-out | When every group's gate fails, the chat entry point renders no group headers at all and states why the list is empty. |
| E6 | SC3 | none | dismissed | SC3 is the page-identity state (a non-Angular page) rather than a value the chip formats, so it has no data shape to probe. |
| E7 | SC4 | none | dismissed | SC4 aggregates the type check, the test suite and the initial-bundle baseline; it has no data shape of its own. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | Claim a feature the inspected app does not have | judgment | Over-claiming is worse than saying nothing; the reviewer compares each chip entry against the announced bit that produced it. |
| N2 | SC2 | Guess a group's availability from a version when `app_facts` contradicts it | judgment | The facts win over the version; a silent version-only fallback is the failure this row exists for. |
| N3 | SC1 | Call a model to compute or render the chip | judgment | The chip is deterministic code over announced facts (CHARTER: deterministic code computes the facts). |
| N4 | SC3 | Let a page that never announces state fall through to a chip that claims features | judgment | "Cannot tell" must be its own named state, distinct from the non-Angular refusal. |
| N5 | SC4 | Exceed the recorded 535.44 kB initial-bundle baseline, or weaken the budget pin to reach green | judgment | AR-1 and `scripts/panel-bundle-budget.test.mjs` pin the policy and the measurement; raising a threshold is how a regression hides. |
| N6 | SC1 | Add DOM to the inspected page | judgment | AR-3: the overlay is the only DOM this tool adds to a page, and it is M022's. |

## Scope in

- The feature fingerprint from `app_facts` and the `[ng-version]` root
  enumeration: an adapter that turns the announced `angular-ai:state` payload
  into `ToolContext.facts`, and a version read the panel can use.
- Tool groups keyed to a version gate, so a group whose gate fails is absent
  rather than offered and empty, projected over the M018 declarations.
- The context chip in the panel naming the detected features, including the
  ones the app does not have, with the "cannot tell" state named.
- The chat entry point that opens with the permitted groups only, and the named
  refusal for a non-Angular page.

## Scope out

- Any tool implementation; this milestone selects and filters the groups M018
  registered and adds no registry shape.
- Guessing a feature from a version alone when `app_facts` disagrees; a silent
  fallback makes the chip lie.
- Opt-in instrumentation (M021) and therefore anything that requires the app to
  install a package.
- A page-side widget prompting the user what to inspect; confirmations, toasts,
  inputs and navigation live in the panel (AR-6).
- Code generation of app code; `@angular/animations`; Angular SSR;
  `angular/components`.
- DOM added to an inspected page (AR-3).
- Changing `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts`:
  its SHA-256 is pinned by `scripts/registry-envelope-pin.test.mjs` and the
  envelope is an acceptance criterion, so the grouping is a projection beside
  it, never a new field on it.
- Editing the `.claude/skills/` mirrors; this milestone's doc alignment lands in
  `.commandcode/skills/` and the mirror is copied by the declared script.

## Constraints

- Angular 22.2, TypeScript 6.0, zoneless and OnPush by default, standalone
  components, signal-based APIs, modern APIs only (A6).
- The panel is the only product surface (AR-1, AR-7); the extension build budget
  is a 520 KB initial warning with a 1 MB error ceiling, and the panel measures
  535.44 kB today, so the operative constraint is that this milestone must not
  make the initial bundle worse — pinned byte-exact, not prose.
- The inspected page receives no DOM from this milestone (AR-3); confirmations
  and navigation stay in the panel (AR-6).
- The registry envelope is pinned by SHA-256; adding a tool or a group field to
  it is out of scope.
- Deterministic code computes the facts; the panel's own
  `LanguageModel.availability()` is the only model surface in play, and it is
  not part of this milestone's decision.
- Checks: `npm run check` and `npm test`, plus
  `npx nx run angular-ai-devtools:build-extension` for the measurement; sidecar
  checks use the dependency bridge, and installs carry `--include=dev` because
  `NODE_ENV=production` is exported in the agent shell.
- Owner's standing grant, recorded verbatim: "A fresh session should be able to
  run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete the next milestone end-to-end without a human-in-the-loop, with
  full milestone decision authority."

## Current state

Brownfield. The panel is an Angular ~22.1 application inside an MV3 extension
(`extension/agent-main.js` in the MAIN world, `relay.js` in the ISOLATED world,
`background.js` relaying to the panel), with six explainer routes, a pure-module
layer beside each, and an Nx 23 / TS 6.0.3 workspace whose tests are 25 Angular
specs, 24 `node:test` script suites and 21 held-out suites.

- **What exists**: `tool-registry/app-facts.ts` declares `app_facts` with the
  eight `APP_FACT_FEATURES` bits and `appFactsSnapshot`; `tool-registry.ts`
  holds `TOOL_REGISTRY`, `ToolDeclaration` and `execute`, provided in
  `app.config.ts`; `extension/agent-main.js:61-82` computes the same eight bits
  page-side and publishes them as `angular-ai:state`;
  `extension-message.service.ts:37-39,68-72` stores `features`, `zoneMode` and
  `stateReceived` as signals; `agent-main.js:136-152` blocks below 22.1.3 and
  `src/main-world/stale-view-scan.ts:60-79` gates the stale-view scan.
- **Must not break**: the six explainer routes and their N1/N2/N3/N16/N8
  behaviour; the tool-registry envelope's SHA-256 pin (`20859b88…0407e`) and
  `scripts/registry-reach.test.mjs`; the 535.44 kB initial-bundle baseline; the
  page receiving no DOM; the extension's 22.1.3 hard block.
- **Doc-vs-code rulings**: fourteen `NEEDS-USER` rows of
  `.project/research/DOCS-AUDIT.md` are ruled in that file's `## User rulings`
  table — eleven `fix-doc`, three `accept-drift`; no `fix-code`. None of them
  changes this milestone's scope.
- **Ground truth**: `.project/research/evidence-codebase.md`,
  `.project/research/DOCS-AUDIT.md`.

## Risks

- The chip can over-claim: naming a feature the app lacks is worse than naming
  none, so a "cannot tell" state is part of the surface.
- The `[ng-version]` root enumeration is dev-mode behaviour and can be absent on
  a production build; a version-gated group is then excluded for the wrong
  reason unless the gate names that state.
- The chip and the group filter add to the initial bundle, which is already at
  the tightening point of the 520 KB budget (AR-1).
- A version gate tuned on one fixture can exclude a group that works on another.
- The registry has no production consumer, so the "chat" surface this milestone
  adds is the first caller; a shape that fits only this caller will not survive
  the eleven explainers that follow.

## Open questions

- [RESEARCH] Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead?

## Corrections

- Standing grant (owner, this session): the definition, plan, rulings and ship
  gates are pre-authorised for M020; `preapprove --grant intent,plan,rulings,ship`
  was recorded at `inspect/active` while `STATE.milestone` was null, quoting
  "complete the next milestone end-to-end without a human-in-the-loop, with full
  milestone decision authority".
- 2026-11-02 (delegated ruling, under the recorded grant): the "chat" whose group
  list SC2 filters is a new chat entry point in the panel, because the tool
  registry has no production consumer at this head — `tool-registry.ts:181` and
  `app.config.ts:14` are its only non-spec references. This milestone adds the
  entry point, not a tool implementation; the group list is what it opens with.
- 2026-11-02 (delegated ruling): grouping is a projection over the unchanged
  declarations. `tool-registry.ts` is SHA-256-pinned
  (`scripts/registry-envelope-pin.test.mjs:48-56`) and the envelope is an
  acceptance criterion, so no `group` field is added to it and the pin is not
  re-cut; `grep -i group` over `apps/**/*.ts` returns no matches today.
- 2026-11-02 (delegated ruling): the chip names the eight page-published
  `APP_FACT_FEATURES` bits (`tool-registry/app-facts.ts:45`) and nothing else.
  DI-graph, stale-view and error-digest capabilities are panel-local behaviour
  with no published bit, so naming them would be a claim `app_facts` cannot
  support (N1).
- 2026-11-02 (delegated ruling): the chip's "cannot tell" state is distinct from
  SC3's non-Angular refusal. A page that never announces state leaves
  `stateReceived()` false (`extension-message.service.ts:37-39`); the chip names
  that state rather than rendering features, and the non-Angular page gets the
  named refusal SC3 requires.
- 2026-11-02 (delegated ruling): for SC4 the operative budget constraint is "must
  not make the initial bundle worse" than the recorded 535.44 kB baseline, which
  `scripts/panel-bundle-budget.test.mjs` pins byte-exact; 520 kB is the
  `build-extension` warning threshold and the AR-1 policy value, and the panel
  measurably measured 535,440 B before this milestone, exactly as M019 recorded.
- 2026-11-02 (delegated ruling): the version a group gate reads comes from the
  `[ng-version]` root enumeration, with `app_facts` authoritative when the two
  disagree (N2). The page's `supported` boolean alone is not a version, and the
  existing 22.1.3 hard block in `agent-main.js:136-152` keeps its own meaning.
- 2026-11-02 (delegated ruling): the four acceptance criteria are taken verbatim
  from the approved roadmap entry; nothing in this milestone amends them.
