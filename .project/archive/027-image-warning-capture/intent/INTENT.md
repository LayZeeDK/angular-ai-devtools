# Intent — M027 `image-warning-capture`

Lane: milestone
Review panel: off
Finding skeptics: off
Surfaces: none

## Summary

Replace M026's transcribed warning sample with a captured one: run the fixture's `/image-budget` page in a real
browser, capture what the console actually says, and record whether that message carries an Angular code at all.

## Problem

M026 shipped a COM-1 explainer whose evidence is a **transcribed** `NG2952` message.
`spikes/ng222-app/src/app/image-budget-warning.json` says so in its own `source` field: the text was read from
`packages/common/fesm2022/common.mjs`, not observed. Its final review records that as the milestone's one carried
gap, because the roadmap asked whether the console warning decides COM-1's evidence path at all.

Measurement already suggests the answer. The image directive's own `RuntimeErrorCode` block declares eighteen codes
(`packages/common/src/errors.ts` at tag `v22.1.8`, plus `NG0913` from core), and none of them reports a plain
unbudgeted `<img>`; that is a browser message and carries no `NG` code. But "suggests" is not "observed", and the
difference is exactly what this milestone exists to settle.

## Users

The maintainer reading M026's final review and needing to know whether a claim is measured; the next agent adding a
warning sample, who needs to know whether a captured one is available; the reviewer who must not be told a
transcription is a capture.

## Success criteria

1. A browser instance loads `/image-budget` on the fixture in development mode, and the console output is committed as evidence naming the profile, the instance and the time of capture.
2. The captured message is recorded with its text and, if it carries one, its code; a message carrying no `NG` code is recorded as carrying none rather than mapped onto one.
3. The warning sample records `source` as captured, replacing the transcribed provenance, and the COM-1 suite still passes.
4. If the browser emits no warning, that negative result is recorded and M026's final review is corrected; the sample is never fabricated to look captured.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC1 | boundary | held-out | `scripts/image-warning-capture.test.mjs` — an evidence file missing its profile, instance or time is named |
| E2 | SC2 | encoding | held-out | `scripts/image-warning-capture.test.mjs` — a sample whose code differs from the captured text is named |
| E3 | SC3 | adjacency | held-out | `scripts/image-finding.test.mjs` — the sample's `source` no longer claims a transcription, and COM-1 still produces its finding |
| E4 | SC4 | empty | held-out | `scripts/image-warning-capture.test.mjs` — a negative capture recorded as a warning is named |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs the two suites above |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC2 | Map a browser message onto an `NG` code it does not carry | criterion SC2 | The whole finding is that the two are different capabilities |
| N2 | SC4 | Record an invented capture when the browser emitted nothing | criterion SC4 | A fabricated capture is worse than the transcribed sample it replaces |
| N3 | SC1 | Add DOM to an inspected page (AR-3) | judgment | The overlay remains the only tool element |
| N4 | SC3 | Edit the sample's `source` to claim a capture without one | criterion SC3 | Provenance is the whole point of the milestone; a false claim is worse than the transcription it replaces |
| N5 | SC5 | Exclude either suite from the project gate to reach green | criterion SC5 | A proof nobody runs is a comment |

## Scope

In:

- one browser run against `/image-budget`, with the console captured as evidence;
- reading that message for text, code and the image it names;
- replacing the sample's provenance with the captured one;
- recording a negative result plainly if nothing is emitted.

Out:

- mapping a browser message onto an `NG` code;
- a second sample or a second capture path;
- changing the digest, COM-1's processing, or the panel surface M026 shipped;
- DOM added to an inspected page (AR-3).

## Risks

- The warning may fire once per page load, so a second run can look like a regression until the page reloads.
- A shared browser profile may hold a stale extension build, so the capture must name the build it used.
- The message may name the element rather than the binding, in which case SC2 records that and no attribution is
  claimed beyond it.
- The browser may be unavailable in this environment; that is a blocked capture, not a licence to transcribe again.

## Open questions

- None. The capture is a measurement; the milestone either produces one or records why it could not.
