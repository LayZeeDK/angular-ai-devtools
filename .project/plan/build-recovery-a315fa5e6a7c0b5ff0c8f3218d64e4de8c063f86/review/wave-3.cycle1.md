# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 72f5c7765f6b6b0a2e9b7f4c5d1a3e8f9b2c6d4a

## T003 — Render the join and pin the routes it adds: fail

- ❌ **E7 is pinned on the `joined` state only.** `pinNoCauseElementRemedy`
  (`scripts/console-panel-render.test.mjs:378-410`, patterns including `/\bbecause\b/i` at `:391`) is invoked
  only with a joined answer (`:549`, `:630`, `:801`, `:822`, `:841`), and `pinNoUnattributedAngularWording`
  (`:416-436`) never runs on the `no-diagnostics` surface (`:581-585` runs only the two-absences pin). Three
  mutants the suite did not anticipate stayed at 22/22: appending `" and this page is not an Angular app"` to
  `STATE_TEXTS['no-diagnostics']`; replacing the `captured-nothing` sentence with `"…so the page was
  silent"`; and the same sentence carrying `"because every console hook failed to install"`. `ownSentences`
  (`:202-214`) reads whichever sentences the module exports, so a mutated sentence counts as the pane's own.
  AC4's wording is therefore true for `joined` only, and `panel-console.ts:92`'s central prohibition — never
  that the page was silent — is pinned nowhere in this suite.
- ❌ **A state word colliding with an `Object.prototype` key renders that function's source.**
  `panel-console.ts:218-222` reads `STATE_TEXTS[state]` off an object literal (`:88-95`), so
  `consolePanel({ state: 'constructor' })` renders `["state: constructor", "function Object() { [native
  code] }"]`; `'toString'`, `'hasOwnProperty'` and `'__proto__'` likewise. That contradicts the branch's own
  documentation (`:52-54`, "rendered as the word it was given and nothing else") and puts text the join never
  stated onto the surface. `pinGivenState` tries only `'wedged'` and `'not-yet-named'` (`:709-727`).
- ❌ **Route-count coverage is uneven.** `app.routes.ts` holds 25 paths and `app.spec.ts:37-63` and
  `chat-entry.component.spec.ts:692-718` compare exact ordered 25-path arrays, so both redden at 24 and 26.
  But `page-picker.component.spec.ts:417-448` pins only the lazy list, so an appended eager 26th route stays
  green there, and `panel-demo.spec.ts` asserts no count at all — its console check is a lookup at
  `:1804-1814`. The count is pinned somewhere for every append, but not by every suite the task names.
- ❌ **The demo's prose describes a shape the sample does not carry.** `panel-demo.ts:371-374` says each entry
  is "written in the payload shape `captureErrorPayload` dispatches … `code`, `message`, `component` and
  `timestamp`", and the Log repeats it (`T003…md:71`), but `:382-397` carries the join's answer
  (`{ state, findings: [{ text, code, title }, …] }`) with no `message`, `component` or `timestamp` key. A
  payload-shaped sample cannot work: `consolePanel([{ code: 'NG0100', message: '…', component:
  'AppComponent', timestamp: 1 }])` renders `no-console-answer`. The wiring and rendering are right; the
  sentence describing them is not.
- ✅ All six declared mutants fire, each reddening the pin that names it, applied one at a time to a
  byte-identical copy and restored (`restored-identical: true`), leaving sha256 `d12b3a3a…`.

## Intent coverage

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: fail

- ❌ The digest-miss absence is pinned by name (`panel-console.ts:190-196`, `noDigestEntryText` at `:123-125`;
  the count mutant reddens `a count is not a name`). The no-code absence is not: changing `NO_CODE_TEXT` to
  `'no-code: 1 captured message carried no code, …'` left the suite at 22/22, because the count guard at
  `scripts/console-panel-render.test.mjs:299-303` is scoped to the digest-miss sentence only.

### SC4 — A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for.: fail

- ❌ The three shapes are distinguished in the shipped wording and the distinction is pinned
  (`scripts/console-panel-render.test.mjs:316-349`, `:355-372`, `:571-585`), but the *content* of the
  `captured-nothing` sentence is not: replacing it with a claim that the page was silent stayed green, and
  that claim is exactly what `panel-console.ts:92` forbids.

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: fail

- ❌ True for a joined answer (`findingLines` writes only `text`, `code`, `title`, `reason`; a finding
  fattened with `cause`/`element`/`remedy`/`component`/`count` renders none of them) and for the
  `captured-nothing` statement, but false for the prototype-key branch, which renders
  `function Object() { [native code] }`, and unpinned for cause and "Angular" wording on the two absence
  states.

## Held-out

### E7 — A suite must pin that the surface renders no cause, element, remedy or unattributed "angular" wording.: fail

- ❌ Pinned for `joined` (six mutants red with defect-naming messages) and not for `captured-nothing` or
  `no-diagnostics`, where a cause and an "Angular" sentence both survived at 22/22. A wave-5 snapshot
  (`scripts/console-panel-record.test.mjs:879-882`) would redden on those edits, but that is a recording of
  today's wording, not a rule; E7 asks for a rule.
