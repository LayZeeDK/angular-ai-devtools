# Patch Findings

Reviewed HEAD: 48b9d321365efac6377873c1babcea0d8b6badb8
State: ship/blocked

## Findings

### P001 — An Angular page can be shown the non-Angular refusal before the replay answers

- **Source**: `.project/review/final-gap-3.md`
- **Locator**: Risk: Three page classes are distinguishable at the surface without over-claiming
- **Evidence**: BLOCKED. SC1's absence logic, SC3's refusal wording and shape, and N4's `cannot-tell` state are correct in the pure module, but a real Angular page can be shown the non-Angular refusal — transiently on every panel open and permanently on a failed replay — because the classifier cannot distinguish "replay not answered yet" from "no Angular root": both are `stateReceived=false, version=null`. The Surface contract's loading state was never implemented, and the false claim is person-visible, so this is a blocked false claim, not an acceptable transient.
- **Fix direction**: Give the classifier a fourth input that separates an outstanding replay from a concluded "no root" — e.g. a `replayAnswered` (or replay-failed) signal on `ExtensionMessageService`, threaded through `PanelSignals`/`PanelContext` so `featureFingerprint` returns a distinct waiting state (the Surface contract's loading line) while the replay is outstanding, and a transport-named state (not "No Angular root found on this page") when the replay fails. Only after the replay has answered without a version should `no-angular-root` render.
