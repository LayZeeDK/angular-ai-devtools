# Gap Review — 2: proof strength

Reviewed HEAD: f653517516b891b32cf2b152bea9e47b2ec8c935
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2, 3

## Checked evidence

- **Check**: mutated `extension/sanitizer-triage.js` so `strippedFinding` builds `{ state: STRIPPED, at: at, components: [], cycleIds: [], strippedTag: "div" }`, ran `node --test scripts/sanitizer-triage.test.mjs`, then restored the line and ran it again
- **Observed**: with the mutant `tests 23 / pass 19 / fail 4 / skipped 0`, three of them the same pin: `AssertionError [ERR_ASSERTION]: the stripped finding must not say "tag": the warning names nothing, so the finding names nothing it did not observe — {"state":"stripped","at":2426.2999999970198,"components":["app-root","app-trust-bypass-page"],"cycleids":[2],"strippedtag":"div"}` (at `scripts/sanitizer-triage.test.mjs:365`, `:377`, `:424`), plus the suite's own M1 case at `:580`, whose in-memory anchor no longer matched (`the mutation must change the module`). Restored: `tests 23 / pass 23 / fail 0 / skipped 0`, and `git diff` is empty.
- **Reference**: `extension/sanitizer-triage.js:220-240` (`strippedFinding`, `bindingOf`) and `scripts/sanitizer-triage.test.mjs:195-218` (`assertStrippedFinding`).

## Finding

- **Found**: Neither module names anything the warning cannot support. The triage builds every finding fresh — a `stripped` finding carries the warning's own page-clock time, the components and cycle ids the covering record's template-update checks name, and a binding only when that record carries exactly one unambiguous one, which the measured record does not; `cannot-tell` carries the time and the one absence constant and nothing that reads as a component, binding or cause; `none` carries no finding at all. The panel reads only `state`, `at`, `components`, `cycleIds` and `binding`: a `tag`, `attribute`, `removedSubstring`, `text` or `cause` attached beside a finding never reaches a pane, an error `reason` rides as data and is not rendered, and a component a `cannot-tell` finding arrives carrying is dropped. The mutant proves the no-naming pin is load-bearing rather than decorative: one extra field reddens three pin cases plus the suite's own mutation case, and the untouched file restores green.
- **Fix direction**: none

## Notes

- Copy-through remains the one soft edge: `componentNames` and `bindingOf` pass a record's `componentName` and `binding` strings into the finding verbatim, so a synthetic record whose fields carry markup puts markup in the output (probed: `binding: "<img src=x onerror=alert(1)>"` and `componentName: "<script>x</script>"` both reach the finding). The suite's scan drops every `binding` key before matching (`scripts/sanitizer-triage.test.mjs:179`) and never validates `componentName`, so no case pins this; the shipped agent sets no `binding` and Angular supplies `componentName`, so no shipped path reaches it, but the file header's absolute "No output string names a tag" is stronger than the code enforces.
- The panel's `deliberate` guard is a prefix test (`startsWith('bypassSecurityTrust')` plus a length check) where the triage uses the anchored `/^bypassSecurityTrust[A-Za-z]+$/`; a fact list naming `bypassSecurityTrust<script>` renders that string, which the triage could never emit.
- `bindingOf` reads `check.binding`, a field `extension/agent-main.js` never writes — the recorded checks carry `componentName, className, changeDetection, events, changedNodeIds, graphNodeCount`. It is a forward-compatible reader pinned only by synthetic records, so the binding-naming branch has no measurement behind it.
- A fact list labelling a finding `stripped` with `at: null` renders `stripped: 1 warning placed on a covering record` beside `at not recorded`; the triage cannot produce that pair, so this is reachable only by a caller-built list.
