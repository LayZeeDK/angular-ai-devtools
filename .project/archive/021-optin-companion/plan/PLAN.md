# Plan — M021 optin-companion

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test && node --test packages/ai-devtools-companion/test/facade.test.mjs scripts/facade-dev-build.test.mjs && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs`
<!-- Run once at ship, in a fresh sidecar checked out at the reviewed commit: no
     node_modules, no fixture install and no build output exist there. The package
     test is named explicitly because `npm test` globs only `scripts/**`,
     `extension/**` and the two skills trees: a package test outside those globs
     would otherwise be evidence nobody executes. The last two steps exist
     because `extension/panel/` is git-ignored, so the bundle pin skips its only
     real assertion until `build-extension` has run. -->

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no per-wave resource cap -->
- review_panel: off      <!-- copied from INTENT.md: "Review panel: off" -->
- finding_skeptics: off  <!-- copied from INTENT.md: "Finding skeptics: off" -->

## Wave 1 — risk burn-down

Goal: settle the three things that can invalidate the plan before any surface is designed. (1) The base is red: the regenerated `.project/research/DOCS-AUDIT.md` fails `scripts/docs-audit-disposition.test.mjs` (the queue's last two rows — 581 and 586 — sit below 598, so the strictly-increasing rule of E6 fails; 124 `unverifiable` rows carry the prose verb "Add the code-side evidence named in the row, or record the settling check" in both their `Suggested action` and their claim's `Evidence`, which E7 refuses; and the head audit gates against its own prior) and fails `scripts/autonomy-gaps.test.mjs` (S6 wants `docs/autonomy-gaps.md` in `## Descriptive docs` with an agreeing tally and a `Claim rows audited: …` sentence, and the audit instead carries it as a `## Doc:` claim section). SC5 cannot be observed at this head until both pins are green, so nobody may claim it earlier. (2) A facade written into a `globalThis` property must survive `@angular/build:application` with `--configuration development`, and the package's `@angular/router` must be the fixture's own 22.2.2 class object: if either fails, `declared` can never be reached and the milestone's central claim is unprovable — the plan stops at the wave gate. This is measured, not assumed: `optimization: false` clears only the minifiers and the `ngDevMode: 'false'` define, the builder passes `pure: ['forwardRef']` in both configurations, the fixture's `defaultConfiguration` is `production` (so a bare `ng build` proves the configuration N5 forbids), and `buildOptimizer` does not exist in this builder at all. (3) A package project outside `apps/` is net-new plumbing: Nx infers projects only from `project.json` files under `apps/`, and `npm run check`'s stage list plus the root `tsconfig.json`'s three entries are asserted by deep equality in `scripts/panel-typecheck-scope.test.mjs`, so the package's type check is an authorised re-pin with its own criterion rather than an edit in passing.
Review depth: full

## Wave 2 — walking skeleton

Goal: the thinnest end-to-end slice that is the product. The page realm reads `globalThis.ngAiDevTools`, validates it against the facade's own shape, and publishes one `companion` field on the existing `angular-ai:state` record — four named answers, declared and resolved counts kept apart, and a bounded re-check that re-emits that same payload when the answer changes from `absent` and then stops, because the page announces once and there is no panel-to-page transport. The panel carries that field through the typed reader into one required member on `PanelSignals` and `PanelContext`, writes it only after the state has arrived, and renders one extra-surface section beside the unchanged fingerprint chip on the existing lazy `chat` route: the declared symbols with their counts, the honest "declared, no symbols", and a different sentence for each way the page can refuse — never a fallback to page inspection and never an empty list. No new route, no new event, no new message type, no page-request transport, no package byte in the panel's eager graph: `PRE_MILESTONE_INITIAL_KB` and the byte-exact pin stay untouched.
Review depth: full

## Surface contract

### panel — T005

Criteria: SC1, SC2
Entry: the extension's DevTools panel inspecting one tab of the counter fixture served from `spikes/ng222-app` on its development configuration, at the panel's existing lazy route `chat`, served under the panel's `baseHref` `/panel/` as `/panel/chat`. The panel is the only product surface; nothing in this block renders in the inspected page and the page gains no DOM node.
States:
- loading (the panel asked once and the replay has not answered, or a reply answered with nothing and no state ever arrived): the extra-surface section shows the shipped awaiting-page line and names no symbol and no refusal; nothing is rendered as absent while the answer is outstanding.
- empty (the page answered `declared` and resolved no symbol): the section shows the page's declared and resolved counts and the sentence "declared, no symbols" as its own state — never the refusal sentence and never an empty list.
- error / refusal `absent`: "This page carries no companion package: no `ngAiDevTools` entry was found on the page's global object." — one sentence naming the missing entry, never "no data yet", never an empty symbol list, and never a list assembled from page inspection.
- error / refusal `foreign-entry`: its own sentence, saying the `ngAiDevTools` key is present but is not the package's shape (a stub or a stale copy), so a page that writes a key is not read as a full opt-in.
- error / refusal `version-unsupported`: its own sentence, naming both the version the entry declares and the version this panel accepts.
- success (`declared` with at least one resolved symbol): the declared symbols listed by package and name with the declared and resolved counts, and beside it the eight-entry fingerprint chip and the version-gated group list rendering exactly as they did before this milestone.
Walkthrough:
1. From the primary checkout: `npm ci --include=dev`, then `npm --prefix spikes/ng222-app ci`, then `npx nx run angular-ai-devtools:build-extension`; serve the fixture on its development configuration (`node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`) and start an instance with `control-ai-browsers up`.
2. Open DevTools on the fixture and navigate the panel to `/panel/chat`: the extra-surface section names `@angular/router Router` and `@angular/platform-browser Meta` with declared and resolved counts, directly above the unchanged chip and group list.
3. Reload the panel with the page already loaded: the section still names the same symbols — the relay's latch and the shipped replay, not a second page announcement.
4. Open the panel on a page that does not carry the package (a second tab on a non-fixture origin): the `absent` sentence appears naming the missing entry, and below it the fingerprint chip still renders the eight published bits exactly as at M020 — the E3 degradation rule, visible in one screenshot.
5. Build a stub page that writes `window.ngAiDevTools = {}` before load and re-open the panel: the `foreign-entry` sentence appears, not `declared`.
6. Edit the fixture's dev-only provider to write an entry whose `version` is not the accepted one and re-open the panel: `version-unsupported` names both versions. Restore the provider afterwards.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T004 | AC1 |
| SC1 | T004 | AC3 |
| SC1 | T005 | AC1 |
| SC1 | T005 | AC4 |
| SC2 | T004 | AC4 |
| SC2 | T005 | AC3 |
| SC2 | T005 | AC5 |
| SC3 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC3 | T002 | AC8 |
| SC4 | T002 | AC6 |
| SC4 | T002 | AC7 |
| SC5 | T001 | AC1 |
| SC5 | T001 | AC4 |
| SC5 | T003 | AC1 |
| SC5 | T003 | AC5 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T005 | tests/held-out/companion-surface.test.mjs |
| E2 | T005 | tests/held-out/companion-surface.test.mjs |
| E3 | T005 | tests/held-out/feature-fingerprint-chip.test.mjs |
| E4 | T002 | packages/ai-devtools-companion/test/facade.test.mjs |
| E5 | T002 | packages/ai-devtools-companion/test/facade.test.mjs |

## Dependency notes

- **T001 precedes every SC5 claim, and depends on nothing.** `npm test` is red at the base in exactly the two files T001's Verify runs, so a green recorded anywhere before T001 lands says nothing about the head. A reviewer sees the base red by running `node --test scripts/docs-audit-disposition.test.mjs scripts/autonomy-gaps.test.mjs` at `334ff8e`: E6 refuses the queue order and E7 refuses 124 prose-only action cells, and S6 refuses the missing descriptive entry.
- **T002 → T003.** T003 adds a fifth stage to `npm run check` that runs `tsc` over the package's own `tsconfig.json`, and both that config and the `src` it compiles are created by T002. Without T002 the stage compiles nothing, which is the defect the pin exists to catch.
- **T002 → T004.** The page realm validates the entry's `version` against the accepted vocabulary and accepts only the two vetted symbol names, and those are the values T002's package publishes: the package's own version string and the pairs `@angular/router#Router` and `@angular/platform-browser#Meta`. A reviewer sees the same literal in `packages/ai-devtools-companion/src/vetted.ts` and in the closed table inside `extension/agent-main.js`; T004's own Verify fails if the entry the fixture installs declares a version the page refuses.
- **T004 → T005.** The panel's `companion` member is read from the field T004 publishes on `angular-ai:state`, and T005's closed panel copy of the vocabulary must be the same two symbols and the same version string — the Interface contract bullet `C2` is written identically in both files. There is no data shape between T004 and T002 beyond that vocabulary.
- **Why the held-out edges are not one task.** INTENT gives E1, E2 and E3 to SC1/SC2, whose owning tasks are T004 and T005, and E4 and E5 to SC3, whose owning task is T002. E3's proof is the *absence* of a change: the fingerprint chip and the group projection must read exactly as they do at M020 on a page without the package, and the two plain-JavaScript held-out fixtures that build a context literal are the only place that regress visibly. SYNTHESIS decision 4 requires those two fixtures to be updated in the same task that adds the required member, so E3 belongs to T005 and cannot be moved into a later wave without editing the same files twice.
- **Why the milestone is two waves.** Everything after wave 1 depends on the facade existing and (for the panel half) on the record field existing; splitting the surface into a third wave would add a full review cycle over one task with no parallelism and no risk isolation. The one thing a third wave could isolate — the served-page observation — is measured inside T002, where the development build it depends on is produced.
- **Recording the layout choice.** The milestone's package layout is `packages/ai-devtools-companion/` as a standalone Nx project, unpublished (`"private": true`), with the fixture consuming it through a `file:` dependency so its `@angular/*` imports resolve inside the fixture's own install. It is recorded here and in T002 rather than in a new document: the docs-audit gate derives its frozen inventory from the tracked Markdown tree, so a new `.md` file would fail `scripts/docs-audit-disposition.test.mjs` E6, which asserts the derived inventory equals the audit's covered set.
