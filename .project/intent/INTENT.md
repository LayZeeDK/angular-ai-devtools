# Intent — M042 error-boundary

Lane: standard
Milestone: error-boundary
Branch: gsd-path/M042
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer sees a component's view replaced by fallback content and asks which boundary
caught the error, which component threw it, and what the thrown error itself said. Gate S10
answered what a page-side reader can actually see (`.project/research/s10-answer.md`,
2026-11-09). Its conclusions are settled here and are not re-derived; they are what this
milestone is written against.

- **The premise the roadmap states is not the subjects' state.** The roadmap says an error
  boundary retains an error. Neither target declares one: 0 `provideBrowserGlobalErrorListeners()`,
  0 `ErrorHandler` subclasses, 0 boundary directives in the portal checkout, whose whole provider
  list is `apps/insurance-portal/src/app/app.config.ts:23-39`; and the `ErrorHandler` the portal
  resolves is the stock class (`ownKeys: ["_console"]`, no `onViewError`), which retains nothing.
- **What is reachable once a boundary does exist.** On the fixture with a real `@boundary`, a
  caught error is exposed through exactly two generic surfaces: an `onViewError(error,
  {declarationType, declarationInstance, caughtBy, boundary: {type, reset}})` hook defined on the
  resolved `ErrorHandler`, and `ng.getContext()` on a node inside the rendered `@error` view,
  which returns `{$error, $reset}`. `window.ng` publishes 25 keys, 0 error-shaped, and the panel's
  own block reader (`ɵgetControlFlowBlocks`) enumerates `@defer` and `@for` only.
- **What is not obtainable.** The subtree the boundary replaced. `LBoundary` holds `error` and
  its host view only; the primary view is removed and no record of its nodes survives, so the
  roadmap's "the subtree it replaced" can only be a named absence.
- **A defect in our own instrument, measured during the same probes.** The shipped extension
  throws `TypeError: Invalid value used as weak map key` at `extension/agent-main.js:1034`
  (`prevEpochs.set(instance, next)`) twice per page, landing in the host app's `ErrorHandler` and
  in `window.onerror` on both subjects. An instrument that throws into the app's error handler is
  blamed on the app, and it pollutes the very surface this milestone builds.

So the subject is not "a boundary that retains an error" in the abstract. It is the two surfaces
that do carry one, the absences that are the honest answer on every subject in this project
today, and the repair of the instrument that currently injects errors into the channel it reads.

## Users

A developer whose component's view was replaced by fallback content and who needs to know which
component threw, which component declared the boundary, and what the thrown error itself said —
and a reviewer checking that the panel never answers "which boundary" with a boundary it did not
observe, never answers "what it replaced" with a subtree no reader holds, and never lets the
extension's own error pass as the app's.

## Success criteria

1. When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset.
2. The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`.
3. An error that reaches the handler without `ErrorDetails` is cannot-tell with the named absence `no-boundary-details` and names no boundary, no declaring component and no caught-by mechanism; the absence is never rendered as "the app kept no error".
4. The substituted subtree is reported as cannot-tell with the named absence `no-replaced-subtree`: no node, tag, text or count from the replaced primary view appears in the finding or in the panel, because the boundary holds `error` and its host view only and the primary view is removed.
5. A raw browser error is reported from the route the subject actually has: on a subject that declares `provideBrowserGlobalErrorListeners()` the error reaches the finding through the handler, and on a subject that declares none — the portal, whose provider list is `apps/insurance-portal/src/app/app.config.ts:23-39` — the answer is cannot-tell with the named absence `no-global-error-listeners`, never "no errors occurred" and never an error attributed to a component that did not throw it.
6. On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|------|-----------|----------|-------------|------|
| E1 | SC1 | precision | held-out | extension/error-boundary.test.mjs — a record whose `declarationType` differs from `boundary.type` renders both, and a record whose declaring component is also the throwing component renders that one type once, with no invented parent |
| E2 | SC1 | empty | held-out | extension/error-boundary.test.mjs — a subject record with no boundary renders `no-error-boundary-declared` with no boundary name, no declaring component and no reset, and never an empty string standing in for a boundary |
| E3 | SC1 | boundary | criterion SC1 | the record is read by the fields it actually carries: the hook path and the view path name each fact from its own field, and neither requires a field the other's shape omits |
| E4 | SC2 | precision | held-out | extension/error-boundary.test.mjs — a record whose thrown error says one thing and whose `@error` view renders another yields the thrown `name` and `message`, and the rendered text appears in no field of the finding |
| E5 | SC2 | empty | held-out | extension/error-boundary.test.mjs — an installed hook with no caught error renders `no-error-caught` and a view reader with an error but no `@error` node renders `no-error-view-rendered`; the two absences stay distinct and neither renders as zero errors |
| E6 | SC2 | encoding | held-out | extension/error-boundary.test.mjs — a thrown value that is not `Error`-like is reported as the boundary's own wrapped error with its `cause`, and a thrown `Error` is reported as itself, never coerced to a string and never re-wrapped |
| E7 | SC3 | empty | held-out | extension/error-boundary.test.mjs — an error delivered with no details renders `no-boundary-details` with no boundary and no caught-by, and a record that also carries a boundary is not overwritten by that absence |
| E8 | SC4 | precision | held-out | extension/error-boundary.test.mjs — no primary-view node, tag, text or count appears anywhere in a finding whose boundary rendered a fallback, and no panel surface reconstructs one |
| E9 | SC4 | boundary | dismissed | the boundary's own host element survives the replacement, so it is not part of the substituted subtree and nothing about its content is claimed |
| E10 | SC5 | boundary | held-out | scripts/error-boundary-capture.test.mjs — the same raw window error is reported through the handler on a subject that declares the global listeners, and as `no-global-error-listeners` on the same throw on a subject that declares none |
| E11 | SC5 | precision | criterion SC5 | an error delivered by the global listener names no declaring component, because that route carries no view to name and the listener is not a boundary |
| E12 | SC6 | idempotency | held-out | extension/agent-main.test.mjs — a page load and a reload each record zero agent-thrown TypeErrors, and the epoch record still names every changed epoch id it named before the repair |
| E13 | SC6 | concurrency | held-out | extension/agent-main.test.mjs — two loads captured in one browser session each record zero agent-thrown errors, and no epoch change is attributed to the other page's instance |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|-------------|-----------|----------|-------------|-----|
| N1 | SC1 | name a boundary the hook record does not carry, or present the throwing component as the boundary | criterion SC1 | the finding's boundary is traceable to `details.boundary.type` in the record; a component that threw is not the component that declared the boundary |
| N2 | SC2 | quote the rendered `@error` view as the error's message, or report fallback content as the error the boundary received | criterion SC2 | the error is the thrown instance; the fallback is content the boundary rendered instead, and they are recorded apart |
| N3 | SC3 | render an error that arrived with no details as an app that kept no error, or as a boundary that swallowed it | judgment | the reviewer looks for `no-boundary-details` on that record, with no boundary name and no caught-by mechanism beside it |
| N4 | SC4 | reconstruct or infer the substituted subtree from the panel's own knowledge of the app | criterion SC4 | the finding carries `no-replaced-subtree` and no primary-view content; a plausible reconstruction is the defect this criterion exists to prevent |
| N5 | SC5 | present the absence of raw browser errors as evidence that none occurred on a subject without the global listeners | judgment | the reviewer looks for `no-global-error-listeners` whenever the provider is absent, and for no claim that the subject had no raw errors |
| N6 | SC6 | reach the absence of the extension's own error by removing, disabling or emptying the epoch-change record it protects | criterion SC6 | a silent record is not a repair; the same test names the epochs the record reported before |

## Scope

In:

- the `onViewError` hook installed on the resolved `ErrorHandler`, and the `ng.getContext()` read
  of a rendered `@error` view as the after-the-fact reader — both inside the existing page agent
  and its reader modules, beside the subscriptions already there;
- the record naming the throwing component and the declaring component apart, the caught error's
  own identity, `caughtBy`, and the reset;
- the named absences `no-error-boundary-declared`, `no-error-caught`, `no-boundary-details`,
  `no-error-view-rendered`, `no-replaced-subtree` and `no-global-error-listeners`;
- the repair of the extension's own `TypeError` at `extension/agent-main.js:1034`, which
  currently lands in the app's `ErrorHandler` and in `window.onerror` (SC6, N6);
- a fixture path that declares a real `@boundary` and provokes a throw, because neither target
  declares one — a fixture change, not product code — so the positive criteria have a subject;
- the panel surface rendering the error, the two component types, the reset and each named
  absence;
- **the version the surface can work against, stated by the surface itself.** `@boundary`,
  `onViewError` and `ErrorDetails` exist in `@angular/core` 22.2.2, which the portal and the
  fixture run; this repository's own install is 22.1.8 (`package.json:52` declares
  `~22.1.0`), whose `fesm2022` has no `boundaryCreate`, no `onViewError` and no `LBoundary`. A
  page on a core without that machinery, or a page that reports no version, is cannot-tell
  rather than an empty boundary list.

Out:

- the subtree the boundary replaced (see Corrections): the finding names `no-replaced-subtree`
  and nothing more;
- naming a boundary from the `@error` view's content, from `ɵgetControlFlowBlocks`, from the
  profiler, or from any app cooperation beyond the app declaring the boundary;
- a page-side control, input or widget (AR-6); DOM added to an inspected page (AR-3);
- code generation of app code; `@angular/animations`, Angular SSR and `angular/components` (A5);
- a second page-side instrumentation path, a boundary patch, or a type imported from
  `@angular/core` — the record types are declared structurally, because the repository's own
  install cannot provide them.

## Corrections

**2026-11-09 — the roadmap's "subtree it replaced" has no observable, so it becomes a named
absence.** The roadmap's first scope item names two things: which boundary caught the error, and
the subtree it replaced (`.project/ROADMAP.md:1542`). S10 measured the boundary's retained state:
`LBoundary` holds `error` and its host LView only, the primary view is removed (`dom.primary:
false`), and no node record of it survives; the `@error` view's `getContext()` returns
`{$error, $reset}` and nothing about what it replaced. The boundary's identity *is* reachable —
`declarationType: "S10Child"` with `boundaryType: "S10Parent"` in one `onViewError` call — so SC1
keeps that half and SC4 makes the other half cannot-tell with `no-replaced-subtree`.

**2026-11-09 — no boundary exists on either target, so the milestone needs a subject or a
documented end state.** Measured in the portal checkout: 0 `provideBrowserGlobalErrorListeners()`,
0 `ErrorHandler` subclasses, 0 boundary directives, and a provider list
(`apps/insurance-portal/src/app/app.config.ts:23-39`) with no error provider at all; the resolved
handler is the stock `_console`-only class with no `onViewError`; the only `ErrorHandler` in the
checkout merely injects the stock one, and `main.ts`'s bootstrap `.catch` runs once before any
component exists. On today's portal SC1's `no-error-boundary-declared` is the whole answer, and a
`@boundary` in `spikes/ng222-app` is the only way the positive half has a subject.

**2026-11-09 — the second defect: our instrument throws into the app's error handler.**
Measured during S10 on both subjects, twice per page: `TypeError: Invalid value used as weak map
key` at `extension/agent-main.js:1034`, the line `prevEpochs.set(instance, next)`, whose `WeakMap`
key is `instance`. It landed in the fixture's `ErrorHandler` and in `window.onerror` on both
subjects. Verified at this head: line 1034 is still `prevEpochs.set(instance, next)`. It is not
fixed by this intent: SC6 requires the error's absence together with the epoch record still doing
its work, N6 forbids reaching that absence by silencing the record, and E12/E13 pin both halves.

**2026-11-09 — the version caveat: this repository's own install cannot run the surface it
builds.** `package.json:52` declares `"@angular/core": "~22.1.0"` and the install is 22.1.8; a
content search of its `fesm2022` finds no `boundaryCreate`, no `onViewError` and no `LBoundary`,
and `ErrorDetails` is absent from its `types/`. The portal and the fixture run 22.2.2, where the
whole surface exists. The extension reads the page's runtime, so the page-side hook is unaffected;
a TypeScript type imported from `@angular/core` would be. That is why the scope carries an
explicit obligation: the boundary surface states which version it can work against, and a page on
a core without the machinery is cannot-tell rather than an empty boundary list.

**2026-11-09 — the two details shapes bound what the record may assume.** The
`@boundary`-construction catch and the `detectChangesInView` catch pass different `details`; only
the second was measured (`keys: ["boundary", "caughtBy", "declarationInstance",
"declarationType"]`). SC1 and SC2 therefore read whichever fields a record carries and never
require the union, and E3 pins that.

## Risks

- The hook is blind until an error occurs: nothing enumerates boundaries, so a page with a
  `@boundary` that has not thrown is indistinguishable through `window.ng` from one with no
  boundary at all, and `no-error-caught` is easy to misrender as "no boundary".
- The portal declares no boundary and no global listeners, so on today's primary subject every
  criterion is an absence; the positive half rests on a fixture boundary and a fixture throw.
- The handler measured is the stock, mutable class instance on both subjects. A third-party,
  frozen or sealed handler would refuse the hook, which is a named absence rather than a finding.
- `reset()` clears the boundary's `error` and removes the `@error` view, so both readers lose the
  error; the record must be taken when the hook fires, not read later.
- The `WeakMap` the agent writes on every pass is shared with the change-detection chain. A repair
  that guards the key must keep the record it exists for, and `ɵsetProfiler(null)` stays
  forbidden because it clears every callback, the agent's included.
- The surface is version-sensitive: `onViewError` is an optional method on 22.2.2's
  `ErrorHandler`, and nothing guarantees a later minor keeps the field names this record reads.

## Open questions

- [RESEARCH] What does the `@boundary`-construction `details` shape carry when a view throws
  during creation, and does it omit `caughtBy` — the one shape S10 read but did not measure?
- [RESEARCH] Which fixture path can declare a `@boundary` and provoke a throw without editing the
  fixture's own page components, and do the fixture's existing recordings still pass afterwards?
- [RESEARCH] Is `instance` at `extension/agent-main.js:1034` always an object key, or can the
  signal graph report a primitive node identity, which is the `WeakMap` key that throws — and
  which of the two produced the two-per-page error S10 measured?
