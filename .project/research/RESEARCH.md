# RESEARCH — M060 error-routing

Phase: research
Milestone: M060 — error-routing

The roadmap entry lists no open questions, so this record carries the three facts define measured and the
consequence each has for the plan. Nothing here is a new capture; every line cites a file that exists at the base.

## R1 — The handler side is already recorded (M042)

`extension/agent-main.js:1904-1944` resolves the page's `ErrorHandler`, installs an `onViewError` hook on it from
the install path, records first and calls the app's own hook through with the same arguments and the same `this`.
The record keeps `boundaryEntries` (one per arrival, in arrival order), its limit and its named absences, and it
states that `GlobalErrorListeners` is the token `provideBrowserGlobalErrorListeners()` leaves behind.

**Consequence:** criterion 1 asks about the *uncaught* half only. The plan must not re-resolve or re-hook the
handler; it reads what M042 recorded.

## R2 — The global listener side is already recorded

`extension/agent-main.js:2550-2561` adds `globalThis.addEventListener('error', …)` and
`…('unhandledrejection', …)`, each calling `captureErrorPayload`, which reduces an arrival to a text, a code
matched by `/NG0\d{3,}/` and a component read through `ng.getOwningComponent` (`:2495-2517`).

**Consequence:** criterion 5's "no new page-side instrumentation" is satisfiable without change; the plan's Verify
must count the listeners so a second one cannot be added quietly.

## R3 — No record states a phase for an uncaught error

`uncaught` appears in five records (`m032`, `m033`, `m034`, `m035`, `m038`) only as prose, and no record carries a
field naming the phase an error was thrown in.

**Consequence:** criterion 4 is a named absence (`phase-not-recorded`) rather than a derivation, and the surface
must render that line rather than a blank.

## What the plan inherits from M059

Six censuses read `research/raw/` and derive a shape. The plan declares all of them, and their suites, at plan
time: the record-shapes censuses, the claims census, the byte-consistency scan, and the gate records.
