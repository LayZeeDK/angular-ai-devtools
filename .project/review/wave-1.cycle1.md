# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: 697bd41fadd07baf772482428842450ef1d6ea90

## T001 — Measure what the router says on the fixture: pass

- ✅ `node --experimental-strip-types --test "scripts/router-diagnostic-capture.test.mjs" "scripts/router-config-capture.test.mjs"` → 17 tests, 17 pass, 0 fail (duration 129.55ms). Output: all recordings validate against fixture/digest; 15 config entries with five fields; injector resolved; NG-coded console message present.

## T002 — Join a routing failure to the configured routes it failed to match: pass

- ✅ `node --experimental-strip-types --test "scripts/router-diagnostic.test.mjs"` → 9 tests, 9 pass, 0 fail (duration 121.03ms). Output: measurement (15 config + 1 NG diagnostic), purity (bare load), E1 finding (unmatched segment produces finding, consideredCount 15, no owner route), E3 (segment-matches-configuration cannot-tell), no-url-segment, no-captured-messages, facts variants, plus both AC7 mutants reddening by name.

## Intent coverage

### SC1 — On the fixture, a navigation failure the page console reports produces a finding naming the unmatched URL segment and stating that none of the configured routes matches it, recording the code the message stated even when the digest does not carry that code.: pass

- ✅ T001 evidence: `research/raw/m033-router-diagnostic.json:95` `"code": "NG04002"` (the code the console stated); `:110` ngCodedMessages entry code `NG04002`; `:119` `"digestCarriesCode": false` (digest's 64 entries do not include NG04002); `:120` `"namesConfiguredRoutePath": false` (message names only the unmatched segment, none of the 15 configured paths); `:48-51` console total 4, withAnNgCode 1. T002 evidence: `scripts/router-diagnostic.test.mjs` E1 finding suite passes — `r.state === 'finding'`, `r.segment === 'this-route-does-not-exist'`, `r.code === 'NG04002'`, `r.consideredCount === 15`, and `!('route' in r)` (no configured route named as owner). Invented mutant (empty-capture swallow) pinned untouched → cannot-tell/no-captured-messages, mutant returned undefined → reddened by name "defect: cannot-tell swallowed an empty capture".

### SC2 — The finding is produced from observables the agent already collects — the `Router` configuration through `ng.getInjector` and dev-mode console messages — with no new page-side instrumentation and no build-log scraping.: pass

- ✅ T001 evidence: capture reads console via Playwright `page.on('console')` (`scripts/router-diagnostic-capture.test.mjs:163`) and Router.config via `ng.getInjector(routedEl)` (`:197`), with `injectorResolvedOnRoutedElement: true` (`research/raw/m033-router-diagnostic.json:133`); `compilerOptionsChanged: []` (`:29`); no extendedDiagnostics enabled (`:497-499` check). T002 evidence: module is pure — `scripts/router-diagnostic.test.mjs` purity suite passes (`context.document/window/performance/console === undefined`, `typeof api.routerDiagnostic === 'function'`); reads no clock/console/DOM. N1 (no second instrumentation path) held: module only consumes messages + facts passed in.

### SC3 — A finding that cannot be attributed to exactly one configured route reports "cannot tell" with the reason, rather than picking the nearest route or naming a guard verdict the configuration does not record.: pass

- ✅ T002 evidence: `scripts/router-diagnostic.test.mjs` passes — E3 segment-matches-configuration → `cannot-tell`/`segment-matches-configuration` (`:92-93`); no-url-segment → `cannot-tell`/`no-url-segment` (`:102-103`); no-captured-messages → `cannot-tell`/`no-captured-messages` (`:111-112`). AC7a mutant (names nearest route as owner) reddens the no-owner pin (`assert.ok(!('route' in mr))` throws /owner route|route as the owner/). AC7b mutant (drops code) reddens the code pin (throws /NG04002/). Module names no guard verdict/resolver/redirect decision (output fields only state/reason/segment/code/message/consideredCount). The invented empty-capture mutant (above) additionally pins the no-captured-messages branch, which is part of SC3's "cannot tell with the reason".

### Invented mutant (additional, not T002's two)

- Mutant: remove the `if (list.length === 0) return cannotTell(NO_CAPTURED_MESSAGES);` guard so an empty capture is swallowed (returns `undefined`). Pin on untouched module: `routerDiagnostic([], {config})` → `{state:"cannot-tell", reason:"no-captured-messages"}`. Mutant result: `undefined`. Pin reddens with message "defect: cannot-tell swallowed an empty capture". Verified by running the scratchpad script (9 tests in T002 suite unaffected; module unchanged).

Artifact size: 4706 bytes.