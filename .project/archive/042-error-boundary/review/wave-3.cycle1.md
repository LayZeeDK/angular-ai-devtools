# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T003 (landed `022cdd5`)

Wave 3 carries the boundary hook's record beside the two subscriptions the agent already held: one
`record.boundary` section, one entry shape for every arrival, one hook installed on the handler the
page resolved, and the named answers a page that cannot be confirmed. It carries SC2 and SC5 as the
record those criteria are read from; it closes neither, because both criteria are stated of the
finding and wave 3 produces no finding.

## T003 — Carry the boundary hook's record beside the profiler and router subscriptions: pass

- ✅ Additive, and only additive: `git show --stat 022cdd55` reports `extension/agent-main.js` +375,
  `extension/agent-main.test.mjs` +872 and the task file +9/−2 — no suite outside the agent's own
  was re-cut, and `research/raw/m042-error-boundary.json` is untouched (T006 owns its re-capture).
- ✅ The section is one field in both records, between the router stream and the checks:
  `extension/agent-main.js:1052` (`boundary: boundaryField(),`) in the frame record and `:1442` in
  the initial snapshot, with the section's seven fields built in one place at `:2247-2257` —
  `state`, `absence`, `chained`, `globalListeners`, `version`, `coreVersion`, `entries`.
- ✅ One entry shape for every arrival: `extension/agent-main.js:2045-2079` — `route` read off the
  payload rather than inferred (`:2051`, `carried ? 'hook' : 'handler'`), `error` as the error's own
  plain summary (`:2052` → `:2020-2039`), the five details fields (`:2053-2071`), and `at` the
  page's receipt time (`:2072`). A field the payload did not carry is `null` and never borrowed:
  `caughtBy` keeps one plain fact and is `null` on the construction shape (`:2060-2064`), and
  `boundaryType` is read from `details.boundary.type` only (`:2065-2067`).
- ✅ The error crosses the boundary as data, never as an instance, and the cause only where the
  boundary wrapped a value that is not `Error`-like: `extension/agent-main.js:2018-2039` — the
  summary is `name`/`message`, and `cause` is read only when the name is
  `BOUNDARY_WRAPPED_ERROR_NAME` (`:1936`, `:2035-2037`), with nothing read from the rendered
  `@error` view (`:2018-2019`).
- ✅ Five named absences are readable from the record alone: `machinery-unconfirmed` where the
  published key list lacks the discriminator (`extension/agent-main.js:2172-2174`),
  `handler-unresolved` where the walk finds no record or no instance (`:2177-2179`, `:2187-2192`),
  `hook-refused` where the assignment does not take (`:2196-2205`), `no-global-error-listeners` from
  the same walk's listener answer (`:2120`, `:2154-2155`, memoised at `:2237-2242`), and the version
  absence the record implies by carrying `coreVersion: null` where the page reports none (`:2254`;
  the join names it `no-core-version` at `extension/error-boundary.js:74`). Each is a named answer,
  never an empty caught list.
- ✅ The hook chains and is never installed inside the profiler callback: one definition at
  `extension/agent-main.js:2084-2092` records first inside its own `try` and then calls
  `boundaryPriorHook.call(this, error, details)` (`:2090-2091`); the prior hook is read and saved
  at `:2194-2195` before the assignment at `:2197`; `chained` reports it at `:2251`; and the reset
  path puts the app's hook back (`:2215-2230`).
- ✅ The version discriminator is the one T001 measured, not a version read:
  `extension/agent-main.js:2164-2175` refuses to install on
  `typeof ng.toggleWatchSignal !== 'function'` and answers `machinery-unconfirmed`, while
  `BOUNDARY_VERSION = '22.2.2'` (`:1937`) is the declared constant and `coreVersion` is only what
  the page reported (`:2254`).
- ✅ Anchors unmoved, verified at this head: `extension/agent-main.js:42`, `:1034`, `:1038`,
  `:1750` and `:1889` all still carry what they carried before this landing
  (`.project/tasks/T003-carry-the-boundary-hook-record.md:88`), and the two frame-shape pins were
  re-cut rather than relaxed to include the new field in its one position:
  `extension/agent-main.test.mjs:2236-2243` (the frame's field list, `'boundary'` after
  `'routerEvents'`) and `:2570-2575` (the initial record's).
- ✅ The pins are non-vacuous and observed green: `extension/agent-main.test.mjs:4389` is the T003
  describe, with M1's assertion at `:4781` (a synthetic `caughtBy`), M3's at `:4828` (an empty list
  for an absent discriminator) and M4's at `:4833` (an installation that replaces an app-declared
  hook), M5 (a hook installed inside the profiler callback) in the same block — all five named in
  `.project/tasks/T003-carry-the-boundary-hook-record.md:89`. Observed at this head:
  `node --experimental-strip-types --test "extension/agent-main.test.mjs"` → `ℹ tests 107`,
  `ℹ suites 23`, `ℹ pass 107`, `ℹ fail 0`, E12 and E13 among them.
- ✅ The wave's Verify is recorded passing at its own landing:
  `.project/build/verify-ledger.jsonl:6` — the eight suites at 241 tests, `nx run
  angular-ai-devtools:test` at 345, prettier and `npm run check` — `"result": "pass"` at
  `022cdd552becb3579ef7b55f3fb6bcf6545a6301`.

## Intent coverage

### SC2 — The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`.: pass

- ✅ The record this criterion is read from now exists and carries the right half of it: the error's
  own `name` and `message` (`extension/agent-main.js:2020-2039`), the `cause` on the wrapper only
  (`:2035-2037`), and nothing read from the rendered view (`:2018-2019`).
- ✅ The record distinguishes the route, so the two SC2 absences stay possible answers rather than
  one: `route` is `hook` where the payload carried details and `handler` where it did not
  (`extension/agent-main.js:2051`), and `caughtBy` carries the construction shape's omission as
  `null` instead of a value (`:2060-2064`).
- ⚠ **Not proved by this wave.** No finding exists here and no fallback field is produced, so no
  clause of SC2 is closed. The finding — `errorName`, `errorMessage`, `cause`, and the fallback as
  `fallback` never as the error — is **wave 4**'s (`extension/error-boundary.js:145-166`, `:184-188`),
  pinned by E4/E5/E6 at `extension/error-boundary.test.mjs:1117`, `:1127` and `:1134`; the pane's
  own label for the same content is wave 5's
  (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143`, `:308-310`).

### SC5 — A raw browser error is reported from the route the subject actually has: on a subject that declares `provideBrowserGlobalErrorListeners()` the error reaches the finding through the handler, and on a subject that declares none — the portal, whose provider list is `apps/insurance-portal/src/app/app.config.ts:23-39` — the answer is cannot-tell with the named absence `no-global-error-listeners`, never "no errors occurred" and never an error attributed to a component that did not throw it.: pass

- ✅ The record carries the listener answer as a named word rather than a boolean:
  `extension/agent-main.js:2101-2121` returns `listeners: 'no-global-error-listeners'` from the
  walk and upgrades it to `'declared'` only when a provider record's token name matches
  (`:2154-2155`), and `null` where the page publishes no reader at all (`:2102-2104`, `:2119`); the
  record publishes it at `:2252`.
- ✅ A raw browser error that arrives with no `ErrorDetails` is recorded as the handler route and
  named no boundary, so the finding cannot attribute it to a component:
  `extension/agent-main.js:2045-2071` (`route: 'handler'`, `boundaryType: null`, `caughtBy: null`).
- ⚠ **Not proved by this wave.** The two-subject difference — the same raw error taking the handler
  route on a subject that declares the listeners and answering `no-global-error-listeners` on one
  that does not — needs two subjects and is **wave 6**'s held-out E10
  (`scripts/error-boundary-capture.test.mjs:713`, with the subjects differing by one provider record
  at `:717-750`). The join that turns the record into that answer lands at wave 4
  (`extension/error-boundary.js:218-228`).
