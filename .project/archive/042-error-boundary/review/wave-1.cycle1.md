# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T001 (landed `e7b67d2`)

Wave 1 is measurement, not proof. It takes the plan's three inherited premises — the shipped
instrument's throw, the hook record this commit's core actually emits, and what a page can say about
its own core — and replaces each with a reading taken at the base. It closes no success criterion,
and this review does not credit it with one.

## T001 — Measure the instrument's throw, the hook record and the version discriminator: pass

- ✅ Three readings and one suite, no product code: `git show --stat e7b67d2d` reports
  `research/raw/m042-error-boundary.json` +1,030, `scripts/error-boundary-measure.test.mjs` +3,014
  and the task file +7/−3 — no `extension/` and no `apps/` path in the diff.
- ✅ The throw has one trigger and it is `TemplateUpdateStart` (id 2):
  `research/raw/m042-error-boundary.json:176-285` holds one row per probed emission, and only
  `TemplateUpdateStart` (`value: 2`) reports `records: 1` (`:177-185`); the other eleven ids each
  report `records: 0` (`:186-284`). The error itself is
  `constructor: "TypeError"`, `message: "Invalid value used as weak map key"` at
  `extension/agent-main.js:1034` (`research/raw/m042-error-boundary.json:33-38`), and
  `extension/agent-main.js:1034` is still `prevEpochs.set(instance, next);` at this head.
- ✅ The escape route is why the defect costs a whole frame, and both anchors hold at this head:
  `extension/agent-main.js:601` is `getOrCreateCheck(instance).events.push(event);`, inside the
  `TemplateUpdateStart` branch opened at `:599`, and `extension/agent-main.js:747` is
  `globalThis.queueMicrotask(closeCycle);` — so the write at `:1034` runs outside the `try` that
  opens `onEvent` at `extension/agent-main.js:573` (`research/raw/m042-error-boundary.json:60-66`,
  `throwInsideOnEventTryCatch: false`), and the frame's record is lost (`:41`,
  `frameRecordLostAtTheBase: true`).
- ✅ The epoch map's purpose is recorded as a property, not a description: it "turns a stateless
  full-graph read into a per-pass delta" (`research/raw/m042-error-boundary.json:545`), is declared
  at `extension/agent-main.js:42` (`var prevEpochs = new WeakMap(); // instance -> Map(nodeId,
  epoch)`), is cleared only at `extension/agent-main.js:1889`, and is keyed by the profiler's own
  instance (`research/raw/m042-error-boundary.json:402-411`). Its measured passes are `:412-527`,
  with `movedOne` `["n0"]` (`:529-531`), `movedBoth` `["n0","n1"]` (`:534-537`), `held` `[]`
  (`:532`) and `afterReset` `[]` (`:543`), and the empty list's ambiguity stated rather than hidden
  (`:544`).
- ✅ The hook's two shapes are recorded with the fields each carries:
  `research/raw/m042-error-boundary.json:592-614` — `detectChangesInView` at
  `_debug_node-chunk.mjs:6293-6297` with `declarationInstance, declarationType, caughtBy`
  (`:594-603`), and `boundaryConstruction` at `:15236-15243` with `declarationInstance,
  declarationType, boundary` and no `caughtBy` (`:605-614`). The measured payload is
  `declarationInstance, declarationType, caughtBy, boundary` (`:623-632`), the `@error` view's
  context is `["$error","$reset"]` (`:636-646`), and the retained state is `class LBoundary`'s two
  fields only (`:573-590`).
- ✅ The version discriminator was enumerated, not assumed: no page reports its own version
  (`reportedBy: 0`, `research/raw/m042-error-boundary.json:1044-1047`), the two installs publish
  **24** and **25** keys (`:783-796`), the one key the newer install adds is `toggleWatchSignal`
  (`:930-966`), and the single check a surface may make is
  `typeof ng.toggleWatchSignal === 'function'` (`:1049-1063`), declared as a proxy for the build and
  never a version claim, with the worked-against version stated as the constant `22.2.2` and
  `onAPage: null` (`:1065-1071`).
- ✅ This repository's own install is the absence the obligation rests on: all seven machinery names
  count 0 and `ErrorDetails` is absent from `types/` in the 22.1.8 install
  (`research/raw/m042-error-boundary.json:743-778`, `errorDetailsInTypes: 0` at `:776`).
- ✅ The measurement is re-derivable at this head: `node --experimental-strip-types --test
  "scripts/error-boundary-measure.test.mjs"` → `ℹ tests 32`, `ℹ pass 32`, `ℹ fail 0`, including
  `scripts/error-boundary-measure.test.mjs:2994` (the throw's line, constructor and message, and the
  measured delta), `:3042` (the epoch record) and `:3099` (24 against 25 keys). The wave's own
  Verify is recorded passing four times at `e7b67d2` in `.project/build/verify-ledger.jsonl:1-4`.

## Intent coverage

### SC1 — When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset.: pass

- ✅ Measured: the record carries the two types in two different fields, on two different LViews —
  `research/raw/m042-error-boundary.json:634` states that `declarationType` is the throwing view on
  the change-detection path while `boundary.type` is always the declaring view, and the S10
  measurement it rests on (`declarationType: "S10Child"` with `boundaryType: "S10Parent"`) is
  quoted at `.project/research/s10-answer.md:169-175` and held to that anchor by
  `research/raw/m042-error-boundary.json:715-723` and the pin at
  `scripts/error-boundary-measure.test.mjs:3287` (`held-out: a quotation whose anchor no longer
  carries it reddens`).
- ✅ Measured: the construction shape answers the same name twice and omits `caughtBy`
  (`research/raw/m042-error-boundary.json:634`), which is why SC1 reads whichever field a record
  carries instead of a union.
- ✅ Measured: on this repository's own install, `no-error-boundary-declared` is the only honest
  answer, because 22.1.8 carries none of the machinery (`research/raw/m042-error-boundary.json:743-778`).
- ⚠ **Not proved by this wave.** Nothing here reads a record into a finding, so no clause of SC1 is
  closed: this wave supplies the field names and the two shapes. SC1 is closed at **wave 4** (T004,
  landed `7ceb997`) — `extension/error-boundary.js:148` reads `declaringType` from
  `details.boundaryType` and `:151` reads `throwingType` from `details.declarationType` — with its
  pins at `extension/error-boundary.test.mjs:1098` and `:1109`. Wave 5 renders the same two facts
  (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:302-305`) and adds no clause to the
  criterion, which is stated of the finding.

### SC6 — On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair.: pass

- ✅ Measured: the error's identity, its line and its expression —
  `research/raw/m042-error-boundary.json:33-40` records `constructor`, `message`, `line: 1034`,
  `expression: "prevEpochs.set(instance, next);"` and its call path (`closeCycle` `:1038` →
  `forEach` `:1055` → `diffEpochs` `:1064` → the write `:1034`, `:42-59`).
- ✅ Measured: the record the repair must preserve — the map's key, its contents and the delta it
  yields (`research/raw/m042-error-boundary.json:401-547`), with the open question answered by
  measurement rather than by assumption: "The key is the profiler instance and nothing else, so a
  primitive node identity cannot throw here" (`:546`), i.e. S10's two-per-page error was two frames,
  not two node identities.
- ⚠ **Not proved by this wave.** At the base the error still threw, and the recording's
  `reproducedAtThisHead: false` (`research/raw/m042-error-boundary.json:40`) is a reading of the
  suite *after* wave 2's guard, not this wave's proof. The absence of the extension's own error is
  wave 2's (T002, `92f92fd`); the "on every inspected page" half and the gate are **wave 6**'s
  (T006, `e117c1d`), ruled at `research/raw/m042-verdict-claims.json:69-77` and recorded at
  `.project/build/verify-ledger.jsonl:9`.
