# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T005 (landed `d4bffc9`)

Wave 5 is the surface: one exported function handed the join's answer and rendering only what that
answer carried, one lazy route entry through the shared loader, and every pin the registration
moves. It renders SC1's and SC2's facts and closes SC4's panel half; it is not credited with SC3,
which wave 4 closed.

## T005 — Panel surface for the boundary, the error and the named absences: pass

- ✅ The landing is the pane, its suite and the registration: `git show --stat d4bffc9e` reports
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts` +467,
  `scripts/panel-error-boundary.test.mjs` +1,200, `app.routes.ts` +10, `panel-demo.ts` +34,
  `panel-demo.spec.ts` +301, `panel-routes.test.mjs` +43 and the three spec re-cuts — 10 files,
  2,081 insertions, and no agent file in the diff.
- ✅ Two labelled facts, never one line: `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:130-134`
  declares `DECLARING_LABEL` and `THROWING_LABEL`, and `:302-305` prints them on their own lines in
  that order from their own fields. The pin is `scripts/panel-error-boundary.test.mjs:1008`, and the
  run prints `pane facts apart: "declaring component: S10Parent" | "throwing component: S10Child"`;
  M2 collapses them into `declaring component: S10Parent / S10Child` and reddens
  `AC2 throwing-component-labelled` (`:1070`).
- ✅ Ten absence sentences, each its own cell: the ten names in the join's order at
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:76-87`, the ten sentences at `:97-118`,
  each filled into its own `cells` entry at `:369`, and every non-empty cell also a line of the flat
  rendering at `:437-441`. Pins `scripts/panel-error-boundary.test.mjs:1016` and `:1028`; M1 fills
  another state's cell and reddens `AC5 no-other-cell` (`:1040`), M4 drops a sentence's line and
  reddens `AC5 the-sentence-is-a-line` (`:1137`).
- ✅ The error is the thrown value and the fallback is content: the fallback's label is
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143` and it prints on the line built at
  `:306-310`, under that label and no other; the error prints its own name and message. Pin
  `scripts/panel-error-boundary.test.mjs:1012`; M3 prints the rendered text as `error message:` and
  reddens `AC2 fallback-is-not-the-error` (`:1112`).
- ✅ `no-replaced-subtree` is its own field and nothing else:
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:312-313` and the sentence at `:106-107`;
  no tag, node, content or count appears anywhere in the pane. Pin
  `scripts/panel-error-boundary.test.mjs:1024`; M5 describes `the replaced <div> and its 2 nodes` and
  reddens `AC4 the-subtree-renders-as-its-absence` (`:1173`).
- ✅ The registration is one lazy entry through the loader M041 introduced:
  `apps/angular-ai-devtools/src/app/app.routes.ts:156-160` is
  `{ path: 'error-boundary', loadComponent: loadPanelDemo, data: { surface: 'error-boundary' } }`,
  `apps/angular-ai-devtools/src/app/panel-demo.ts:52` is its one `LOADERS` key, and the route table's
  surfaces, direct-call list and both mutants are at `scripts/panel-routes.test.mjs:33`, `:339`,
  `:309-322` and `:588-606`, each naming the missing surface by string.
- ✅ The sample fact is the join's own answer for the recording, not a value invented for the demo:
  `apps/angular-ai-devtools/src/app/panel-demo.ts:319-339` carries `declaringType: 'S10Parent'`,
  `throwingType: 'S10Child'`, `errorName: 'Error'`, the recorded message minus the probe's `caught: `
  prefix, `coreVersion: null` and `replacedSubtree: 'no-replaced-subtree'`, and the comment at
  `:307-318` states that `panel-demo.spec.ts` runs the join over
  `research/raw/m042-error-boundary.json` and holds the fact to that answer field for field.
- ✅ The bundle stayed inside the unraised baseline, measured at this head:
  `node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs"
  "scripts/image-budget.test.mjs"` → `measured initial total 535.00 kB (535005 B over 9 eager files)
  against the 535.44 kB baseline`, `image-budget: … margin 0.44 kB`, eager `main.js 101022 B`,
  `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`. The baseline constant is untouched at
  `scripts/panel-bundle-budget.test.mjs:81` (`export const PRE_MILESTONE_INITIAL_KB = 535.44;`), and
  the 0.44 kB is what the one added entry leaves of the 0.51 kB headroom the pre-wave total had
  (`.project/tasks/T005-panel-surface-for-the-boundary.md:91`).
- ✅ The wave's Verify is recorded passing at its own landing:
  `.project/build/verify-ledger.jsonl:8` — the seven declared suites, `nx run
  angular-ai-devtools:test` at 31 files / 346 tests, prettier and `npm run check` — `"result":
  "pass"` at `d4bffc9eeb68b03f943277f9ca7767a3d0d8cdec`.

## Intent coverage

### SC1 — When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset.: pass

- ✅ This wave carries SC1's rendering at the pane, and adds no clause to the criterion: the pane
  prints the declaring type and the throwing type apart, then the caught-by mechanism and the reset
  only where the answer carried them (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:302-307`),
  and prints an arrival with no details with no boundary, no caught-by and no reset rather than a
  clearance (`:299-315`). The pin that the two facts never collapse is
  `scripts/panel-error-boundary.test.mjs:1008`.
- ✅ The finding that carries those facts was closed one wave earlier
  (`extension/error-boundary.js:148`, `:151`, wave 4), so no part of SC1's text is left to this wave:
  the criterion is stated of the finding, and what lands here is a second, independent pin that the
  answer is not re-joined or reinterpreted by the surface (`scripts/panel-error-boundary.test.mjs:1032`
  holds the pane to no import, no join, no DOM and no clock).

### SC2 — The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`.: pass

- ✅ The pane renders the error's own name and message and the fallback as fallback content under
  its own label (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143`, `:308-310`), and no
  rendered error-view text appears under the error's label in any recorded answer — the pin at
  `scripts/panel-error-boundary.test.mjs:1012` asserts it and M3 reddens it (`:1112`, quoting
  `error message: caught: S10 spike: thrown inside the @boundary primary view`).
- ✅ `no-error-caught` and `no-error-view-rendered` reach the pane as two different cells with two
  different sentences (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:100-105`), so
  neither is renderable as the other or as zero errors (`scripts/panel-error-boundary.test.mjs:1016`).
- ✅ As with SC1, the criterion is stated of the finding and was closed at wave 4
  (`extension/error-boundary.js:159-161`, `:184-188`); this wave is the surface that cannot widen it,
  and its own purity pin (`scripts/panel-error-boundary.test.mjs:1032`) is what keeps it a view.

### SC4 — The substituted subtree is reported as cannot-tell with the named absence `no-replaced-subtree`: no node, tag, text or count from the replaced primary view appears in the finding or in the panel, because the boundary holds `error` and its host view only and the primary view is removed.: pass

- ✅ Closed here for the panel clause, which wave 4 could not reach: the pane prints
  `replaced subtree: no-replaced-subtree` as its own field
  (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:312-313`) with the absence's own
  sentence (`:106-107`), and no node, tag, content or count is available to it anywhere — the
  surface receives the join's answer and reads no record (`:317-323`), so it has nothing to
  reconstruct from.
- ✅ The pin is non-vacuous: `scripts/panel-error-boundary.test.mjs:1024` requires the absence and
  scans every recorded answer for a tag, node, content and count, and M5's
  `the replaced <div> and its 2 nodes` reddens `AC4 the-subtree-renders-as-its-absence`
  (`scripts/panel-error-boundary.test.mjs:1173`).
- ✅ **SC4 is complete at this wave, not at wave 4.** The finding half landed at `7ceb997`
  (`extension/error-boundary.js:165`, `:312`); the panel half — the clause "or in the panel" — is
  this landing's, and neither wave alone satisfies the criterion as written.
