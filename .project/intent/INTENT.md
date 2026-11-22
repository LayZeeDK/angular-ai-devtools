# INTENT — M061 locale-correctness

Lane: standard · Milestone: locale-correctness (M061) · Branch: gsd-path/M061
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a formatted date, number or currency renders in the locale it does, naming the `LOCALE_ID` the
injector walk reports, the provider entry that set it, and the formatter the record names — or states the absence the
record cannot fill. It answers from the observables the agent already holds and never reads the rendered text back as
its own evidence.

## Verification target

The Insurance Portal first, on a route that renders a locale-formatted value under a `LOCALE_ID` it provides. The
fixture (`spikes/ng222-app`) is the fallback only where the portal carries no such route, and a verdict that uses it
must name the route tried and the artefact the portal lacks.

## Corrections

- C1 2026-11-21: the roadmap says the answer names "the provider that set it"; measured, the agent's injector walk already enumerates providers through `ɵgetInjectorProviders` (`extension/agent-main.js:2117-2118`, reached from `ng.getInjector` at `:93-95`), so a `LOCALE_ID` provider entry is the observable this milestone reads — and no new page-side read may be added to obtain it. T001 measures whether that entry actually names the token and its value on a fixture that provides a non-default locale, before any join is written.
- C2 2026-11-21: no module under `extension/` mentions `LOCALE_ID`, `locale` or `i18n` today except as the words "no locale-dependent formatting" in a determinism comment (`extension/render-phase.js:85`), so this milestone adds the first locale-shaped join and must not infer one from the panel's own rendering.
- C3 2026-11-21: the roadmap's risk — that the browser locale and the app's `LOCALE_ID` diverge — is why the rendered text is never evidence here; the browser's `navigator.language` and any DOM value are outside the record, so a criterion forbids reading them rather than merely discouraging it.

## Success criteria

1. A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the token value, the provider
   entry that carries it and the formatter the record names; a mutant that restores the default locale turns the
   finding off and reddens the suite by name.
2. A formatted value the record does not carry reports `cannot-tell` with the reason it is missing, and the answer
   never reads the rendered text, `navigator.language` or any DOM value as its own evidence; a mutant that renders the
   page's text to fill the gap reddens it.
3. The finding is produced from the observables the agent already holds — the injector walk's provider entries and the
   formatter the record names — with no new page-side instrumentation and no second read of the inspected page.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest
   pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A page with no `LOCALE_ID` provider entry reports the absence and never names the default token value it assumed. |
| E2 | SC1 | ordering | criterion SC1 | Two provider entries naming the token resolve to the entry nearest the component, and the answer says which entry it read. |
| E3 | SC2 | boundary | criterion SC2 | A value formatted outside Angular's i18n surface names that absence rather than the nearest locale it can find. |
| E4 | SC2 | encoding | criterion SC2 | A value the record truncates is reported as truncated, never re-derived from the page. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the agent's existing provider read is the only one; a second read added to the page reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map, the digest row count and the copy record move together; a surface without a loader key reddens. |
| E7 | SC1 | precision | criterion SC1 | A provider entry that names a different token is not reported as the locale provider; a mutant that matches by position reddens. |
| E8 | SC4 | precision | criterion SC4 | No answer names a fix, a schematic, a cause or an identity it was not given; a mutant that renders one reddens. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | infer a locale from the rendered text, the browser or the default token | criterion SC1 | Grounded in C3; every locale statement is read from a provider entry. |
| N2 | SC2 | read the inspected page's DOM, a control or a value it renders | criterion SC2 | Panel-only; the page is read through the agent's records, never through the panel (AR-3, AR-6). |
| N3 | SC3 | add page-side instrumentation, a second tap or a second provider read | criterion SC3 | One provider read, asserted by count in the task's own suite. |
| N4 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer reports what happened, never what to do. |
| N5 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject of a later generation, not this one. |

## Constraints

- Everything happens in the existing panel application and the extension's content script; no new page-side
  instrumentation, no new dependency and no second tap (AR-3, AR-6).
- The join is a pure function of the records it is given; the surface renders its object and nothing else.
- Every suite that reads `research/raw/` and derives a shape — record-shapes censuses, the claims census, the
  byte-consistency scan, the gate records — must be declared at plan time, and both gate records are re-derived as the
  last commit before the final review.
- The project verify builds before it measures, and the build is uncacheable: `node scripts/ensure-sidecar-deps.mjs &&
  npx nx run angular-ai-devtools:build-extension && npm run check && npm test`, with no `--skip-nx-cache` and no
  `NX_DAEMON` workaround (`nx.json` and `scripts/nx-config-policy.test.mjs` hold that policy).
