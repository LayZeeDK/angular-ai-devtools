# Intent — M021 optin-companion

Lane: milestone
Milestone: optin-companion
Program: angular-ai-devtools
Review panel: off
Finding skeptics: off
Surfaces: panel

## Summary

Ship the Tier-2 opt-in companion package and its vetted symbol table, so an app can be asked to expose more than page inspection can see. The package is app-visible code in someone else's build: one table entry on `globalThis`, a facade behind it, and nothing else. The panel detects the entry, asks the package for its extra surface through the facade, and names a reason when the app cannot answer.

## Problem

Page inspection reaches only what the running page exposes through `window.ng`: `agent-main.js` publishes one `angular-ai:state` record built from `featuresOf(ng)` — `supported`, `reason`, `zoneMode`, `features` — and nothing else. Everything an app knows about itself beyond that debug surface (its own injected services, its configured providers, its state slices) is invisible, and no opt-in mechanism exists: `ngAiDevTools`, `provideAiDevTools`, opt-in, companion and symbol-table appear in no source file, only in design docs. An app that *wants* to be inspectable in more depth has no way to say so, and the panel has no way to ask.

## Users

- The developer inspecting their own dev build, who installs the package deliberately and expects the panel to name what it unlocked.
- The developer inspecting an app that does not carry the package, who must be told why the extra surface is unavailable rather than shown an empty list.
- Every app that installs the package: a vetted symbol table is a compatibility promise fixed here, before any consumer exists.

## Success criteria

1. An app that installs the package is detected, and the panel names the extra surface it exposes.
2. An app without the package is refused with a named reason rather than an empty result.
3. The package adds nothing to `globalThis` beyond its table entry.
4. The facade survives a development build's tree-shaking, proven on the fixture rather than on `buildOptimizer`.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|----|-----------|----------|-------------|------|
| E1 | SC1 | precision | held-out | A fixture app that installs the package but publishes an empty table renders "declared, no symbols" as its own state; a panel that reports symbols it was not given fails. |
| E2 | SC2 | empty | held-out | A page with no table entry is refused by naming the missing entry, not by naming missing data, and the refusal text never reads as "no data yet". |
| E3 | SC2 | adjacency | held-out | On the same page, the existing fingerprint chip still renders while the extra surface is refused: absence of the package degrades nothing that already worked. |
| E4 | SC3 | boundary | held-out | A snapshot of own `globalThis` keys taken before and after the package installs differs by exactly the one table-entry name. |
| E5 | SC3 | idempotency | held-out | Loading the package twice leaves exactly one entry and throws nothing; the second load is a no-op on the table. |
| E6 | SC4 | none | dismissed | The tree-shaking proof is a build-configuration observation, not a value the panel formats; it has no data shape of its own. |
| E7 | SC5 | none | dismissed | SC5 aggregates the type check and the test suite across both trees; it has no data shape. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|----|-----------|----------|-------------|-----|
| N1 | SC1 | Treat the mere presence of a global key as detection | judgment | Any page code can write a key; detection must validate the entry against the package's own facade shape, or a hostile or stale stub reads as a full opt-in. |
| N2 | SC2 | Fall back to page inspection and present its answer as the package's extra surface | judgment | The roadmap risk is explicit: a fallback hides the difference the milestone ships, and the user cannot tell which surface they are looking at. |
| N3 | SC3 | Write or mutate any other global name | judgment | Scope-out: anything that mutates `globalThis` beyond the package's table entry. One additive key is the whole contract with the app. |
| N4 | SC1 | Render a vetted symbol's value as app content or write it back | judgment | Scope-out: a vetted symbol may be read, never written back; code generation of app code is out. |
| N5 | SC4 | Prove tree-shaking on a production build or `buildOptimizer` | judgment | The roadmap risk: proving it on the wrong configuration proves nothing. The proof is a development build of the fixture. |
| N6 | SC5 | Weaken a check, a test or the bundle pin to reach green | judgment | A green gate that was bought is worse than a red one reported. |
| N7 | SC1 | Ask the page for a prompt, confirm or toast | judgment | AR-6 keeps every confirmation in the panel; the package may not render UI in someone else's app. |

## Scope

In:
- The companion package and the vetted symbol table it publishes.
- The detection path that tells an app with the package from one without.
- The panel's request for the extra surface, with a named reason when the app cannot answer.
- The facade, shown to survive a development build's tree-shaking.

Out:
- `cdpAttach`, which moves to M030, and every attach path built on it.
- Anything that mutates `globalThis` beyond the package's table entry.
- A page-side prompt, confirm or toast; AR-6 keeps every confirmation in the panel.
- Code generation of app code; a vetted symbol may be read, never written back.
- `@angular/animations`, Angular SSR and `angular/components`.
- Any insurance-portal change beyond the dev-only provider file and the dev build configuration the charter allows.

## Constraints

- AR-6: no page-side prompt, confirm or toast; every confirmation stays in the panel.
- AR-1: the panel's initial bundle must not exceed the recorded 535,440 B baseline; the byte-exact pin in `scripts/panel-bundle-budget.test.mjs` and its pre-milestone constant stay untouched.
- AR-3: the tool adds no DOM to the inspected page; a companion package that rendered into the host app would break the milestone's blast-radius promise.
- The workspace is one private package with no `workspaces`, no publish configuration and no release pipeline: the milestone chooses the package layout, and the choice is recorded rather than left implicit.
- `tool-registry.ts` is byte-pinned (`scripts/registry-envelope-pin.test.mjs`) and `scripts/registry-reach.test.mjs` guards the page-reads boundary: a declaration-field change is a deliberate re-pin with its own acceptance criterion, never a side effect.
- `npm run check`'s stage list and the root `tsconfig.json` include list are asserted by deep equality in `scripts/panel-typecheck-scope.test.mjs`: adding a package's type check is an authorised re-pin, not an edit in passing.
- The docs audit regenerated at this head makes the repository's own disposition pins fail (`scripts/docs-audit-disposition.test.mjs`), and `scripts/autonomy-gaps.test.mjs` requires `docs/autonomy-gaps.md` to be listed as descriptive: this milestone owns that repair, as M020 did.

## Current state

Brownfield, mapped at `334ff8e` (`.project/research/evidence-codebase.md`, 17 findings):

- The root is a single `private` package (`package.json`) with no `workspaces`, `.npmrc`, `publishConfig` or release configuration; `package-lock.json` still names `angular-ai-devtools` while `package.json` says `angular-ai-devtools-workspace`. Adding a publishable package is a structural decision plus a lock regeneration, not an existing pattern copied.
- The page side has no opt-in support and exactly one, one-shot record to extend: `announceState` publishes `supported|reason|zoneMode|features` once from `featuresOf(ng)` (`extension/agent-main.js:117-124`), `tryInstall` short-circuits after install, and `PAGE_HOST` has no transport (`page-reads.ts:87-111`). Detection therefore needs a new probe and a re-announce path, not a wire-up.
- The panel's adapter (`panel-context.ts`), the classifier (`feature-fingerprint.ts`), the group projection (`tool-groups.ts`) and the chat entry point (`chat-entry.component.ts`) are the shipped M020 surface; the replay outcome is now a required field and the chip distinguishes outstanding, failed, answered and cannot-tell.
- 143 documents re-audited at this head: 782 claims, 146 remediation rows, 17 of them `NEEDS-USER` and ruled below.

## Risks

- The roadmap's S16 verdict was taken against an exported provider, not against a package that exports a facade at the table entry: the lookup may need measuring again, which is this milestone's research question.
- The facade must survive a development build's tree-shaking; proving it on `buildOptimizer` proves nothing.
- A vetted symbol table is a compatibility promise to every app that installs it, fixed here before any app exists.
- Detection that falls back to page inspection when the package is absent hides the difference the milestone ships.
- A Tier-2 package is app-visible code in someone else's build: a larger blast radius than any panel change in this generation.
- The regenerated docs audit is red at the base; a plan that ignores it spends a build wave discovering it.

## Open questions

- [RESEARCH] Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again?
- Should the package be published under the programme's own name or stay unpublished until a consumer asks for it?

## Corrections

- 2026-11-02 — the owner's standing instruction for this program, quoted verbatim: "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." Recorded as the pre-approval grant `intent,plan,rulings,ship` in the STATE Log at the first legal boundary (`milestone: null`).
- 2026-11-02 — delegated ruling (grant above, `rulings`): the package stays **unpublished** — `private: true`, built and consumed in-repo, no registry publish and no release pipeline — until a consumer asks for it. Evidence: the root has no publish configuration at all, and publishing is a one-way compatibility promise taken before any app exists; the roadmap's own risk list treats the table as the promise, not the registry.
- 2026-11-02 — carried from M020 (accepted deviation, no criterion binds it): on a `cannot-tell` page the group list still offers the two groups that need no page-published bit (`app-support`, `error-reference`) while the chip names cannot-tell. It is pinned by `tool-groups.spec.ts` and was reviewed twice; recorded here so the next milestone can decide whether the Surface contract's "shows no feature and no group" or the shipped reading is the rule.
- 2026-11-02 — delegated doc-vs-code rulings recorded in `.project/research/DOCS-AUDIT.md` `## User rulings` (queue rows 475, 477, 479, 480, 502, 503, 505, 542, 544, 545, 568, 569, 579, 587, 589, 593, 598): sixteen `fix-doc` where the code is authoritative (message types that do not exist, an ESLint pin the peer range contradicts, a stale npm prefix, a wrong route line, a wrong grader line, a miscounted portal import, a registry-policy claim the skill contradicts), and one `accept-drift` for the dated handoff note (`plans/angular-ai-devtools-proposals.handoff.md`), whose 1,110-line measurement describes an earlier file state and which already carries a superseded banner.
