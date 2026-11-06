# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: abfbcded8ad5d31ba151c7e5c464397470a44e3c

## T001 — Measure which NG-coded diagnostics reach the page console: pass

- ✅ `node --experimental-strip-types --test "scripts/lint-observability.test.mjs"` → tests 13, pass 13, fail 0, skipped 0.
- ✅ `research/raw/m032-console-diagnostics.json` holds exactly one page-console diagnostic, code NG0950; its text names input "requiredLabel", no element and no component (namesElementOrComponent.any=false, elementSelector=null, component=null); the component LintObservabilityPage is named only in a stack frame (stackCountsAsMessageNamingIt=false).
- ✅ `extension/error-digest.json` carries NG0950 and does not carry NG8008 (confirmed by grep: only NG0950 present).
- ✅ Recording states compilerOptionsChanged: [] — no compiler options were changed.
- ✅ Held-out mutants in the suite (page removed from route table, lost code, etc.) all redden.

## T002 — Join a captured diagnostic to the construct it names: pass

- ✅ `node --test scripts/lint-core.test.mjs` → tests 22, pass 22, fail 0, skipped 0.
- ✅ Mutant helper is a real mutant: M1 (matching the diagnostic to the nearest element) passes on the unmutated module, applies a mutation that changes the source (assert.notEqual on source), and fails by the pin's own name (/the finding must name the input the message names/). Read the mutant helper and M1, M2.
- ✅ My own mutant: changed `lintCore` to return a finding whose construct is an element selector taken from `facts` (`nearest.selector`); suite went to 20 pass / 2 fail (reddened); restored `extension/lint-core.js`; `git status --porcelain` clean (only `.project/review/` untracked).

## Intent coverage

### SC1 — On the fixture, a construct the tool can observe produces a finding naming that construct, the diagnostic code when the digest carries one, and the element or component it belongs to.: pass

- ✅ The recorded NG0950 diagnostic names input "requiredLabel"; the digest carries NG0950; `lintCore` returns a finding naming construct "requiredLabel", code "NG0950", and the message body. No element/component is named because the message names none (N3); the stack's component is not counted.

### SC2 — The finding is produced from observables the agent already collects — dev-mode console messages, `window.ng` reads and the app facts — with no new page-side instrumentation and no build-log scraping.: pass

- ✅ `lintCore` is pure: loads in a bare vm context with no document/window/console/clock; installs and reads nothing (probe counters stay 0); reads only `digestCodes` from facts; no compiler patch or build subscription (N1). The capture is T001's recorded console messages.

### SC3 — A diagnostic the tool cannot observe from the page reports "cannot tell", with the reason, rather than an invented cause or a construct guessed from proximity.: pass

- ✅ A code the digest does not carry (NG8008/NG0999) yields `cannot-tell` with reason `code-not-in-digest` and no construct, even when the body names an input; an empty capture yields `no-captured-messages`; M3/M4/M5 mutants redden the corresponding pins.

RECEIPT: lint-observability 13/13/0/0; lint-core 22/22/0/0. Own mutant: element-selector-from-facts → 20 pass / 2 fail (reddened), restored, git status clean. Files read: T001, T002, INTENT, wave-1.cycle1.md, m032-console-diagnostics.json, extension/error-digest.json, extension/lint-core.js, scripts/lint-core.test.mjs. REVIEW: wave 1 complete