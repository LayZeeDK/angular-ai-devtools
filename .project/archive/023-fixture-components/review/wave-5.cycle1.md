# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: 98cceaee9d5f1b75ef387e61d4f73b83f2ccfb1d

## T015 — Controls resolves to its element: pass

- ✅ `menu-trigger-controls` fails when `aria-controls` names an element other than the menu it controls, and the failure names the id it resolved and the id it should have resolved — mutant run by this review, not taken from the Log: with `aria-controls="components-listbox"` on the `ngMenuTrigger` in `spikes/ng222-app/src/app/components/aria-surfaces.ts`, the suite reddens with `menu-trigger-controls ... aria-controls="components-listbox" is not the menu this trigger controls: expected "components-menu" (the id of its #menu panel), got "components-listbox"` — both ids named (tests/held-out/aria-rules.mjs:356).
- ✅ The rule reads the controlled element from the surface rather than accepting any id the file contains — `controlledMenu` (tests/held-out/aria-rules.mjs:274-287) reads the trigger's `[menu]="..."` binding, follows it to the element declaring `#menu`, and requires `aria-controls` to equal that panel's own id; the old flat `surface.elements.map((e) => e.attrs.id)` list is gone from the rule.
- ✅ The mutation suite gains that case and it reddens: point the trigger at the listbox, watch this rule fail and its siblings stay green — tests/held-out/fixture-aria-rule-mutation.test.mjs:178-255 asserts the unmutated control is green, the mutant reddens only `menu-trigger-controls`, the detail names both `components-listbox` and the panel id read from the surface itself, and every sibling rule stays green.
- ✅ Restoring the trigger returns the suite to green — after restoring the file, `node --test tests/held-out/fixture-aria-rule-mutation.test.mjs` exits 0 with tests 5, pass 5, fail 0, and `git status --porcelain` is empty for the touched file.

## T016 — The second cycle serves: pass

- ✅ The suite serves the built entry and fetches it, asserting the same document is served after the second cycle as after the first — observed in this review's re-run: two real `node:http` servers on ephemeral 127.0.0.1 ports (`server.listen(0, '127.0.0.1')` at fixture-rebuild-idempotent.test.mjs:219-229, closed in `finally` at :282-287); the run logged `served http://127.0.0.1:56049/ (422 bytes) and http://127.0.0.1:56052/ (422 bytes) — same entry 5b715c2fe82a67245fbd4f8926ad19fdb252df5c565e6be38bb1f0e1dd607225, same bundle main-WEHNWX7A.js`, and after the run `Get-NetTCPConnection -State Listen` on both ports returns nothing — the servers are really bound and really closed.
- ✅ The component-package install set is measured **between** the cycles, so a duplicate introduced by the first build is observed by the second measurement rather than compared with itself — the measurement order in the single test is: before (:315) → first build and serve (:318-325) → `measureComponentInstallSet('between the first and second build and serve cycles, after the first build and before the second')` (:329-338) → second build and serve (:341-348) → after (:382-395); the back-to-back self-repeat of the old suite is gone.
- ✅ A mutant that adds a duplicate component-package entry during the first cycle reddens the suite, with the failure naming the duplicate — mutant run by this review: a second on-disk `@angular/cdk` left behind during the first cycle (shimmed into the fixture's own `ng` bin, node_modules only) reddens the suite at the between-cycles measurement (`measureComponentInstallSet` called at :329 → `assertSingleInstall` at :122): `@angular/cdk must be installed exactly once between the first and second build and serve cycles, after the first build and before the second, found 2` with package, version and both paths.
- ✅ The suite fails rather than skips when the install it needs is absent — `requirePrerequisite` (:295-297) asserts against `MISSING_FIXTURE_INSTALL` (:290-293), which names the missing fixture install and the provisioning command instead of returning early.

## T017 — An explainer answers on the fixture: pass

- ✅ The suite asks each of the four shipped explainers a question and asserts the answer it gives, through the surface a user reaches them by rather than by reading their source — four behaviour tests (`fixture-explainers-unchanged.test.mjs:574-675`) reach each explainer through `appRoutes` compiled in-process from `apps/angular-ai-devtools/src/app/app.routes.ts` (:318-329), instantiate the route's real class in an injection context on the workspace's own `@angular/core` (:337-394), deliver the fixture's state through the panel's own `ExtensionMessageService` listener (registered via `chrome.runtime.onMessage.addListener` at extension-message.service.ts:148-152) and the `DiDoctorService` listener, and pin each question and answer as literals (:519-547, 572-675); re-run: exit 0, tests 10, pass 10, fail 0, skipped 0.
- ✅ Removing one explainer from the panel's tool registry or route reddens the suite, and the failure names the explainer that no longer answers — mutant run by this review: deleting `{ path: 'di-doctor', component: N3DiDoctorComponent }` from `app.routes.ts` reddens the suite with `no route "di-doctor" in apps/angular-ai-devtools/src/app/app.routes.ts, so N3 "DI Doctor" can no longer be reached and answers nothing` (tests 10, pass 8, fail 2); the suite also replays this mutant itself (:682-704), failing if the route line it removes is already gone.
- ✅ The existing hash pins remain and still fail on a source change; this task adds behaviour rather than replacing the guard — the four `PINS` and `checkPins` (:56-70) stay, with the two live-pin tests (:76-100) asserting a missing file and a one-byte change both fail naming the file.
- ✅ The suite fails rather than skips when the panel build it needs is absent — the sources-and-toolchain test (:710-725) asserts the routes file, the digest file, all four explainer sources, the `typescript` install and `runInInjectionContext` exist, each with a message naming what cannot answer, and the compile step asserts the panel graph compiles (:276-280) rather than skipping.

Drives-the-real-code check (brief): what runs is the panel's own answer-producing code — the facts are built by the components' shipped paths (`walkChain` for N1, `service.buildFacts` for N2, `buildDiExplainFacts` for N3, `buildErrorExplainFacts`/`resolveDigest`/`shouldCallModel` for the Error Explainer), the prompt is assembled by the panel's own `ExtensionPromptService.buildFactsPrompt` (extension-prompt.service.ts:79-83), and the reply is surfaced through `explain()` setting each component's answer signal. The suite supplies only the two host objects the extension page would supply — `chrome` and `LanguageModel` (`installChrome` :475-494, `installLanguageModel` :496-512) — it does not reimplement prompt building, message handling or answer handling.

Warnings (non-blocking):

- T016's mutant has no in-suite replay: unlike T015 and T017, whose suites replay their own mutants, the duplicate-install demonstration exists only in task Logs and in reviewer re-runs, so the suite alone cannot show its own between-cycles guard working.
- The explainer suite stubs `LanguageModel`, so an answer's text is the model's reply echoed back through the real prompt service; the question, the facts, the route and the answer-handling path are pinned or real, but nothing downstream of `ExtensionPromptService` is asserted — the suite states this scope itself at :10-14 and :21-25, so the evidence is not over-claimed.
- `menu-trigger-controls` still judges the surface's source tags rather than the rendered DOM, and so do its three attribute-reading siblings; the E1-style ruling final-gap-1 asked to be recorded for this scope substitution is still recorded only in the suite comments (aria-rules.mjs:7-14), not in INTENT.md `## Corrections`.
- On a cold checkout the Verify commands are not sufficient for T016: `npm ci` does not emit `packages/ai-devtools-companion/dist`, and without it the fixture's `ng build` fails with TS2307 on `ai-devtools-companion` inside `buildCycle` rather than at the prerequisite assertion. It still fails rather than skips, but the failure mode is a missing build artifact, not the asserted missing install; this review had to run the companion `build` target once to provision the sidecar.

Contract violations (blocking):

- none — 49360bc touched only `tests/held-out/aria-rules.mjs` and `tests/held-out/fixture-aria-rule-mutation.test.mjs` (plus its task Log), 71c84ed only `tests/held-out/fixture-rebuild-idempotent.test.mjs` (plus its task Log), 98cceae only `tests/held-out/fixture-explainers-unchanged.test.mjs` (plus its task Log), each within its `files` list.

## Intent coverage

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass

- ✅ The attribute-removal edge is covered by `fixture-aria-rule-mutation.test.mjs:53-96` (removing each rule's attribute reddens only that rule) and re-verified green in this review's re-run (tests 5, pass 5); the wave-5 addition closes the neighbouring defect where the same rule passed for the wrong ARIA pairing: the controls rule now resolves `aria-controls` against the panel its `[menu]` binding names, and this review's own mutant (trigger pointing at the listbox) reddens it naming both ids, so the rule can no longer pass for a wrong pairing.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ Re-run in this review: `node --test tests/held-out/fixture-rebuild-idempotent.test.mjs` builds the fixture twice, serves each cycle's output over a real 127.0.0.1 socket, fetches the entry and its bundle through it, finds the same entry (sha256 `5b715c2f…`) and the same bundle after both cycles, measures the component-package install set before, between and after the cycles, and this review's duplicate-`@angular/cdk` mutant reddens it at the between-cycles measurement naming the duplicate; `node --test tests/held-out/fixture-explainers-unchanged.test.mjs` drives all four shipped explainers through the panel's route table to a pinned question and answer (tests 10, pass 10), and this review's route-removal mutant reddens it naming `N3 "DI Doctor"`.

## Summary for orchestrator

- blocked findings: none — all three wave-5 criteria are met with mutant re-run evidence taken by this review, not from the Logs.
- repeat offenders: none — this is wave 5, cycle 1.
- warnings worth a human eye: (1) the T016 mutant has no in-suite replay, so its between-cycles guard is demonstrated only by Logs and reviewer re-runs; (2) the explainer answers are proven down to `ExtensionPromptService` with the model host stubbed, a scope the suite documents but that a later reader could over-read; (3) the source-tags-vs-rendered-DOM scope substitution for the attribute-reading Aria rules still has no E1-style ruling in INTENT.md `## Corrections` (final-gap-1's ask, still open); (4) on a cold checkout T016's Verify needs `packages/ai-devtools-companion/dist` built first, which `npm ci` does not emit.
