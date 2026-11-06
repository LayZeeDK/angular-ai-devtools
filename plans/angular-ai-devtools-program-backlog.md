# Angular AI DevTools — programme backlog and delivery structure

Status: **approved scope and order; pre-roadmap.** This document is the durable record of owner
rulings and the milestone backlog. It is **not** `.project/ROADMAP.md`: that file becomes the
authoritative roadmap when the next programme opens, and these milestones are copied into it
through the roadmap phase, not read from here by any helper.

Persisted 2026-11-01. Supersedes the scratchpad proposal after three review rounds (30 findings,
all `defects-found`, all applied).

---

## 1. Approval ledger — rulings that were approved and previously unwritten

| #   | Ruling                                                                                                      | Consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Tier 2 (app opt-in `provide*()`) features are permitted; the veto at `CHARTER.md:65` is lifted              | unblocks the opt-in instrumentation family and M021                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| A2  | Verification fixtures may be modified for the Vitest Browser work                                           | required by N34–N37 and the attach harness                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| A3  | Programme order: core → Storybook → angular/components → SSR (+Analog) → NgRx → RxAngular                   | ordering constraint, §2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| A4  | N34–N37 count as first-party (`@angular/build:unit-test`)                                                   | four features in scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| A5  | Angular SSR and `angular/components` are out of the core programme                                          | SSR is generation 4+, components is generation 3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| A6  | Tool calling in the core loop is permitted                                                                  | required by the registry envelope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| A7  | `debugger` permission granted                                                                               | N21's CDP trace, P3's accessibility tree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| A8  | `@angular/cdk/testing` excepted from the components exclusion                                               | the HAR family                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| A9  | All tiers permitted; modern APIs only; `@angular/animations` deprecated and out                             | applies to every milestone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| A10 | **Design system ordered immediately after `angular/components`** (2026-11-05)                               | Owner: "After/during the `angular/components` efforts at the latest, allowing dog-fooding of Storybook and Angular Material features in Angular AI DevTools." DS-2/DS-5/DS-6/DS-7/DS-8 and Storybook move from generation 7 to generation 4; defer/hydration, boundary and test suites shift to 5-7. "Storybook" here is the tool's feature set for browsing a Storybook application (§6.2), not the design system's own component stories and not a general review surface. Supersedes A3's placement of Storybook relative to components: both now follow components, so the DS and the Storybook features dogfood each other while the material features they rest on are still fresh                                                                                                                                                                                  |
| A11 | **Generation 4 delivers a design-system _subset_, and the DS precedes the Storybook features** (2026-11-05) | Owner: "It doesn't have to be a complete design system, just a subset used by the features in milestones shipped before the design system or immediately after." So: (a) **scope** — no general component library and no theming system; the subset is exactly what the shipped explainer shell repeats across its six surfaces plus what the immediately-following milestones consume, and a component is added when a shipped feature needs it, not in advance; (b) **order inside the generation** — DS-2/DS-5/DS-6/DS-7/DS-8 first, then the §6.2 Storybook features, because the story-gap finder is only meaningful against a Storybook with real gaps and the DS's is the owned one; (c) **the converse obligation** — every DS story exposes its args and at least one variant, so the story index has a corpus worth reading rather than one story per component |

### Architecture rulings

| #    | Ruling                                                                                                                                                                                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AR-1 | The panel **is already** an Angular application (`apps/angular-ai-devtools`, `projectType: application`, `build-extension` → `extension/panel`, `baseHref: /panel/`). No migration milestone exists; the panel adopts the design system in place. Initial-bundle budget is a hard 520 KB. |
| AR-2 | In-page UI is a named exception: plain DOM, closed Shadow DOM, isolated world, ~400 lines, **no Angular in the inspected page**. The in-page surface is one widget — a rect/label overlay plus a picker.                                                                                  |
| AR-3 | The overlay is the only DOM the tool adds to an inspected page.                                                                                                                                                                                                                           |
| AR-4 | Every `MutationObserver` the tool owns excludes the tool's host subtree; the host attaches once at `document_start`.                                                                                                                                                                      |
| AR-5 | Cross-frame outlining is a non-goal for v1.                                                                                                                                                                                                                                               |
| AR-6 | Confirmations, toasts, inputs and navigation live in the panel, never in the page.                                                                                                                                                                                                        |
| AR-7 | The panel doubles as a self-inspection fixture: it is served at `/panel/`, so every feature has a fully-owned Angular subject.                                                                                                                                                            |

Why AR-2 rather than Angular Elements in the inspected page: the tool's own Angular in that realm
would corrupt N18's `mark_feature_usage` fingerprint, the single append-only `ɵsetProfiler` list
(N20/N21/N30/N34), `[ng-version]` root enumeration (`app_facts`), `ɵgetControlFlowBlocks` on a
root, and the `ngDevMode` hydration counters — each a silent wrong answer, the worst failure mode
for a diagnostic tool.

---

## 2. Delivery structure — one root, programmes, generations

GSD Path has **no programme layer**. One `.project/` holds one `CHARTER.md` and one `ROADMAP.md`,
and the roadmap persists without archiving. So the six programmes are expressed as _labels and
charter sections_, not as separate project roots.

| Layer      | Carrier                                                 | Rule                                                                                                                                                                               |
| ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme  | `CHARTER.md` section + `Programme:` label on each entry | six, in the A3 order; never a separate root                                                                                                                                        |
| Generation | one roadmap approval                                    | **at most 12 entries**, fully specified; a larger scope splits into successive generations                                                                                         |
| Batch      | `## Wave`-level ordering in `PLAN.md`                   | the seven batches below; ordering only                                                                                                                                             |
| Milestone  | `ROADMAP.md` entry                                      | `M###`, never renumbered, ids never restart                                                                                                                                        |
| Feature    | `Scope: in` of one milestone                            | family prefix (`COR`, `COM`, `RTR`, `FRM`, `HYD`, `DEF`, `ANI`, `SWK`, `PBR`, `PSR`, `ELM`, `TST`, `RTH`, `HTT`, `HAR`, `PWT`, `CF`, `FOR`, `SUB`, `BND`, plus the legacy `N` set) |
| Spike      | `FAMILY-S<n>` in the milestone's `Risks`                | never a bare `S<n>`; the pre-existing `S1–S23` keep their numbers                                                                                                                  |

**The invariant that makes it work:** pending entries must never reach zero until the final
programme ends. Each generation is re-sliced in **while a pending tail remains**, which is the one
legal way to add roadmap entries — and the way M001–M017 was actually grown (17 entries, never one
dispatch). If every entry ships, `promote_lookahead select-next` returns `complete` and there is no
legal entry point, which is exactly the state the repository is in today.

**Charter scope stays honest:** each programme's admission into `Full scope: in` is recorded as a
Correction at its boundary, so the roadmap gate's charter↔milestone bijection is never checked
against a scope larger than the current generation.

**Opening the first generation** therefore needs the one gated step: bind `gsd-path/M018`, which
retires `gsd-path/M017` (work preserved by `62a10a7` and the pushed tag). Everything in §1 and §3
is queued behind it.

---

## 3. Generation 1 — twelve milestones, full ROADMAP entry format

The roadmap phase copies these verbatim and expands `Scope: out`, `Success criteria`,
`Risks` and `Open questions` from §4.

### M018 — instrument-core

Goal: one tool registry every explainer reads through, the app-facts support checks, and the DOM
role/name computation.
Depends on: [M017] · Programme: core · Batch: 1 · Group: cross-package
Surfaces: none
Scope: in — the registry envelope (declaration record plus backing record, with `kind`
read/write/confirm, `host` page/iframe/panel/worker/extension-API/tester, `outcome`
result/confirm-required/async-handle/image/error, and `publish`); `app_facts`; `find_components`,
`inspect_component`, `list_signals`, `getDirectiveMetadata`, `getComponent` wrapper.
Success criteria: six hostile tools pass — one write with confirm, one async handle, one image
result, one two-host read, one wrapped third-party tool, one page-state-dependent schema; two
tools added in two separate commits without touching the envelope.
Risks: the envelope is fixed here, so a wrong envelope is expensive everywhere.
Open questions: none — the first review's finding is resolved by designing against the hostile shapes.

### M019 — context-and-jobs

Goal: the context budget, the worker and ring buffer, background jobs with progress.
Depends on: [M018] · Programme: core · Batch: 1 · Group: cross-package · Surfaces: none
Scope: in — the 3.6 caps, chunking, the worker boundary, the ring buffer, job progress and
cancellation, the Summarizer path.
Success criteria: a 200-message ring buffer survives a navigation; a chunked job reports progress
and cancels; one fresh clone per prompt, measured.
Risks: spikes S7, S14, S15, S19 are unrun and set the chunk size and prompt cap.

### M020 — feature-fingerprint

Goal: N18 opens a chat with only the tool groups the app's version gates allow, plus a context chip.
Depends on: [M019] · Programme: core · Batch: 1 · Group: @angular/core · Surfaces: panel
Success criteria: the chip names the detected features; a tool group whose `[ng-version]` gate
fails is absent.

### M021 — optin-companion

Goal: the Tier-2 opt-in package and its vetted table, so an app can be asked to expose more.
Depends on: [M020] · Programme: core · Batch: 1 · Group: cross-package · Surfaces: panel
Scope: in — the package, the vetted symbol table, the detection path. `cdpAttach` moves to M030.
Success criteria: an app with the package is detected; one without is refused with a named reason;
the package adds nothing to `globalThis` beyond its table entry.
Risks: spike S16 (the companion package has never existed); the facade must survive a development
build's tree-shaking, not `buildOptimizer`.

### M022 — in-page-overlay

Goal: the only DOM the tool adds to an inspected page — a rect/label overlay plus an element picker.
Depends on: [M019] · Programme: core · Batch: 1 · Group: cross-package · Surfaces: inspected page
Scope: in — one host element with a closed Shadow DOM attached once at `document_start`; rect
tracking through scroll, transforms and device pixel ratio; `elementFromPoint` picker;
`__ngContext__` / `getOwningComponent` resolution; the AR-4 exclusion rule.
Success criteria: the box tracks an element through scroll, zoom and a CSS transform; picking
resolves to the owning component; **no** `MutationObserver` owned by the tool observes the host
subtree (asserted); the host is inserted exactly once per page load.
Risks: AR-4 is a correctness dependency for N7, FOR-1 and CF-1 — a leak here makes three features
silently wrong.

### M023 — fixture-components

Goal: Aria, CDK and Material surfaces in the verification fixtures, so the harness and Aria
features have subjects.
Depends on: [M019] · Programme: core · Batch: 1 · Group: verification fixtures · Surfaces: none
Scope: in — add `@angular/aria`, `@angular/cdk`, `@angular/material` to the fixture; one overlay
surface, one list, one tabs, one menu, and a harness target that is **deliberately ambiguous**
(two matching hosts) and action-observable.
Success criteria: the harness target gives HAR-1 a root-boundary case (content outside the
component root), HAR-2 a predicate case, HAR-3 an ambiguity case and HAR-4 an action case; the
menu surface supplies the listbox/menu rules N23 needs.
Risks: a new fixture must be a declared verification surface, not a promoted spike; the panel does
not adopt these packages from this milestone.

### M024 — panel-verify-breadth

Goal: close the gap that `npm run check` never type-checks the panel.
Depends on: [M019] · Programme: core · Batch: 1 · Group: panel UI · Surfaces: none
Scope: in — add `tsc -p apps/angular-ai-devtools/tsconfig.app.json` and the extension sources to
`npm run check`; fix the errors it reveals.
Success criteria: a deliberate type error in the panel fails `npm run check`; the extension sources
are covered; the check stays offline and needs no dev server.
Risks: the first run will surface a backlog of errors; that is the point.

### M025 — image-budget-audit

Goal: COM-1 — why an image is slow, and why the console warned about it. Fills N4's missing image
codes (`NG02200` → `NG02800` is a gap in the digest).
Depends on: [M020] · Programme: core · Batch: 2 · Group: @angular/common · Surfaces: panel
Gate: COM-S1.

### M026 — after-render-ordering

Goal: COR-1 — why `afterNextRender` read `offsetWidth` as 0, from ordered profiler after-render
events.
Depends on: [M020] · Programme: core · Batch: 2 · Group: @angular/core · Surfaces: panel
Gate: COR-S1.

### M027 — trust-bypass-triage

Goal: PBR-1 — what was stripped and which binding did it.
Depends on: [M020] · Programme: core · Batch: 2 · Group: @angular/platform-browser · Surfaces: panel
Gate: PBR-S1.

### M028 — redirect-chain

Goal: RTR-1 — why `/settings` lands on `/login`, walked from `Router.config` with a cycle guard.
Depends on: [M020] · Programme: core · Batch: 2 · Group: @angular/router · Surfaces: panel

### M029 — cross-field-validation

Goal: FRM-1 — why fixing one field does not enable submit, from the Signal Forms field states.
Depends on: [M020] · Programme: core · Batch: 2 · Group: @angular/forms · Surfaces: panel
Gate: FRM-S1 (spike S9).

---

## 4. Later generations — backlog, not roadmap entries

Ordered; the roadmap phase expands each into the §3 field set when its generation opens.

### Generation 2 — core explainers (batch 3)

M030 lint-core · M031 lint-router · M032 lint-legacy · M033 onpush-readiness · M034
resource-lifecycle · M035 signal-forms-doctor · M036 linked-state-reset · M037 render-phase-effect
· M038 performance-narrator · M039 navigation-blocking · M040 error-boundary · M041
stability-explainer · M042 console-read
Gates: S10 (M040), S9 (M035).

### Generation 3 — interaction, agent interop, blocks (batches 3-5)

M043 copy-to-agent · M044 component-search · M045 ui-copy-check · M046 interaction-story · M047
dead-click (S17) · M048 what-changed (S18) · M049 webmcp-audit · M050 webmcp-rehearsal · M051
visual-qa (S5) · M052-M054 tutor-foundations / tutor-signals / tutor-routing (TS1-TS12) · M055
teardown-leak · M056 error-routing · M057 locale-correctness · M058 outlet-explainer · M059
guard-phase · M060 lazy-chunk-failure · M061 title-input-binding · M062 schema-disabled-hidden ·
M063 formfield-binder · M064 head-state · M065 error-channel-map

### Generation 4 — design system and Storybook (owner ruling 2026-11-05)

**Reordered 2026-11-05 (A10).** This generation was Generation 7. The owner moved it to sit immediately after `angular/components` (generation 3), so the panel dogfoods the design system while the material features it is built on are still being worked on.

"Design system and Storybook" names two things in one generation. The **design system** is DS-2 tokens, DS-5 harvest, DS-6 services, DS-7 harnesses and DS-8 Playwright. **Storybook** is the tool's feature set for when the inspected application _is_ a Storybook (§6.2): detecting the preview through `window.__STORYBOOK_PREVIEW__`, reading the story index, the story-gap finder that lists components rendered without a story, asking about a story's component like any app, and "why does this story differ". Tier 1, third-party reads of globals.

The two belong together because they validate each other: shipping the DS gives the tool a Storybook application of its own to browse, and the Storybook feature set is what makes that browsing useful. Neither is a general test harness — the stories are a review surface with no gate, and per the note below a story interaction test excluded from `npm test` is a test nobody notices failing. DS-5's harvest gets easier here, not harder: by generation 4 the six explainer surfaces it harvests already exist.

**Scope is a subset, not a library (A11).** This generation ships the design system the shipped features actually use: the tokens the explainer shell repeats, the four services it needs, its harnesses and its Playwright proofs. It does not attempt a complete component library, a theming system, or stories for components the tool does not consume. A component joins the DS when a shipped feature needs it — growing by use, not in advance.

Owner's programme 2. **Corrected by review:**

- the "panel becomes an Angular application" milestone is **withdrawn** — it already is one (AR-1)
- **DS-2 tokens** in place: density/colour/type/motion custom properties, `prefers-reduced-motion`
  contract, CSS-only motion (no imperative animation API)
- **DS-5 harvest** limited to what three usages already repeat: the shipped explainer shell
  (picker, chain display, explain button, answer block, empty/loading/error states) across six
  surfaces; it cannot harvest DS-6 or DS-7 material that does not exist yet
- **DS-6 presentational services**: toast, tooltip, clipboard, and an awaitable
  `confirm(request): Promise<boolean>` gate rendered with the CDK dialog — never a page protocol
- **DS-7 panel-harnesses** claims HAR-1 and HAR-2 only; HAR-3 (ambiguity) and HAR-4 (action
  reached Angular) stay with M023, because a clean design-system harness has no ambiguous host and
  drives the panel's own environment
- **DS-8 Playwright** retitled: it can prove extension load, the panel bundle and `baseHref`, and
  the background/relay path via an ordinary tab — it **cannot** drive the DevTools panel, because
  `chrome.devtools` is undefined outside DevTools and the panel lives in a `devtools://` target
  Playwright does not surface as a page. It must use a throwaway git-ignored profile and never a
  `control-ai-browsers` instance
- **Storybook keeps its stories and loses its gate.** A story interaction test excluded from
  `npm test` is, by that property, a test nobody notices failing; and its `chrome.*` mock would be
  a second unowned copy of the wire contract. Storybook is a review surface, not a gate.

### Generation 5 — defer, hydration, animation, template blocks (batches 4-5)

M066-M070 defer payload-cost / trigger-payoff / nested-order / error-block / layout-shift
M071-M078 hydration timeline / skipped / text-mismatch / dehydrated-state / server-log /
ssr-payload-budget / render-vs-hydration / dom-drift
M079-M083 animation stuck / view-transitions / enter-leave / render-cost / legacy-flag
M084 **control-flow tap** · M085 template-block-review · M086 for-keystroke-rebuild · M087
for-input-churn · M088 for-empty-blind-spot · M089 for-nested-identity · M090 for-large-list-cost ·
M091 if-branch-timeline · M092 if-condition-values · M093 switch-case-order · M094
let-binding-values · M095 defer-placeholder-flash · M096 defer-loading-never
Gates: DEF-S1..S5, HYD-S2..S4, ANI-S1, FOR-S1..S4, CF-S1, CF-S2, SUB-S1, BND-S1, BND-S2.

### Generation 6 — boundary, service worker, elements, taps

M097 boundary-did-not-catch (S10 + M109-adjacent ErrorHandler join) · M098 boundary-reset-unreachable
(S10) · M099-M101 sw stale-asset-set / install-churn / safe-mode · M102-M103 elements
identity / bootstrap · M104-M112 opt-in taps: pending-task-labelling, signal-write-provenance,
http-interceptor-chain, binding-provenance, swupdate-events, form-schema-tap, sanitizer-decisions,
guard-verdicts, animation-completion.
Rule: every tap lands **with** the milestone it upgrades, never as its own wave.

### Generation 7 — test suites (batch 6)

M113 test-attach-harness (the Vitest tester-iframe attach; `cdpAttach` lives here) · M114-M117
test timing / query-mismatch / test-vs-app / test-DI · M118 test-override-ignored · M119
test-zone-era-helper · M120 test-defer-block · M121-M122 router-testing nav / inputs · M123-M124
http double-answered / injected-error · M125-M127 harness predicate / ambiguity / action · M128-M131
Playwright stability / page-ledger / retry / step-timing · M132 Playwright testability (only if
PWT-S5 shows disagreement)
Gates: S20, S21, S22, S23, TST-S1..S3, RTH-S1, HTT-S1, HTT-S2, HAR-S1, PWT-S2..S5.

## 5. Testing ladder (from the fourth review)

| Layer | Owns                                                                                     | Authoritative?                                      |
| ----- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 0     | `tsc` over the panel and extension (M024)                                                | yes                                                 |
| 1     | `node:test` over `extension/**` — protocol shapes, relay, error digest                   | yes, for the wire contract                          |
| 2     | Vitest Browser Mode component tests over the DS-7 harnesses, services faked at DI tokens | yes, for "state X renders Y"                        |
| 3     | `control-ai-browsers panel` / `verify-ai-browsers` in a real profile                     | yes, and the only proven route to the shipped panel |
| 4     | Playwright: built bundle plus a normal tab, throwaway profile                            | smoke only                                          |
| 5     | Storybook stories                                                                        | review surface, ungated                             |

---

## 6. Open gates

- The bind (`gsd-path/M018`) — blocks every write to `CHARTER.md` and `ROADMAP.md`.
- ~26 named spikes gate individual milestones; the largest are S9/S10 (forms, boundary), S5
  (image tokens), S16/S23 (companion package), S20/S21 (Vitest attach), TS1–TS12 (tutor).
- Generation 1's charter scope admission (A3 programme 1) is recorded as a Correction at the bind.
