# INTENT — M060 error-routing

Lane: standard · Milestone: error-routing (M060) · Branch: gsd-path/M060
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers whether an error the page reported was ever offered to the ErrorHandler that was in force, and
names what the record states about it — the message, the code the message carries, and the handler state at the
time — or states the absence it cannot fill. It answers from the two observables the agent already holds and
never infers a handler, a phase or a cause the record does not state.

## Verification target

The Insurance Portal first, on routes that throw: an error thrown from a timer or a promise rejection reaches the
page's global listeners without passing the change-detection boundary, which is the case this entry exists for.
The fixture (`spikes/ng222-app`) is the fallback only where the portal carries no throw that stays outside
change detection, and a verdict that uses it must name the route tried and the artefact the portal lacks.

## Corrections

- C1 2026-11-22: the roadmap says the answer names "the handler chain in effect"; measured, the resolved `ErrorHandler` is already hooked and its arrivals already recorded by M042 (`extension/agent-main.js:1904-1944`), so the criteria are narrowed to the uncaught half — an error the global listener heard with no boundary entry — and no criterion asks for a chain that has one link.
- C2 2026-11-22: the agent already installs global `error` and `unhandledrejection` listeners that reduce each arrival to `{ text, code, component }` (`extension/agent-main.js:2550-2561`), so no new page-side listening is required and none may be added; the milestone joins records that exist rather than capturing new ones.
- C3 2026-11-22: no record in this tree states the phase an uncaught error was thrown in — `uncaught` appears only in prose in five records and as a string in none — so the phase is reported only where a record states it and `phase-not-recorded` otherwise, rather than inferred from a stack the record does not keep.

## Success criteria

1. An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.
2. An error a boundary entry carries produces `reached-handler` and no finding; a mutant that treats every global error as uncaught reddens it.
3. An error recorded while no `ErrorHandler` resolves reports `no-handler-provided` as a named absence, never a finding and never a handler name; a mutant that names any handler reddens it.
4. The answer states a phase only where the record states one and reports `phase-not-recorded` otherwise; a mutant that derives a phase from the message reddens it.
5. The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.
6. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | No global error recorded and a handler in force is `cannot-tell`, naming the empty record rather than "no error occurred". |
| E2 | SC1 | ordering | criterion SC1 | Two arrivals with identical text and one boundary entry leave the second unmatched, and the record says which arrival it matched. |
| E3 | SC2 | boundary | criterion SC2 | A boundary entry with no global arrival is `reached-handler` on the entry's own record, never an invented uncaught. |
| E4 | SC3 | empty | criterion SC3 | A page whose handler cannot be resolved answers `no-handler-provided` and never names the token it looked for. |
| E5 | SC4 | encoding | criterion SC4 | The record states no phase, so the answer says `phase-not-recorded` and the surface renders that line rather than a blank. |
| E6 | SC5 | boundary | criterion SC5 | The task's Verify asserts one global `error` listener and one `unhandledrejection` listener remain installed; an added listener reddens. |
| E7 | SC6 | boundary | criterion SC6 | The route table, the loader map, the digest row count and the copy record move together; a surface without a loader key reddens. |
| E8 | SC1 | precision | criterion SC1 | A message above the record's limit is truncated as the record truncated it and the answer says so, rather than re-deriving the full text. |
| E9 | SC6 | precision | criterion SC6 | No answer names a fix, a schematic, a cause or a handler identity; a mutant that renders one reddens. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | infer a handler, a phase or a cause the record does not state | criterion SC1 | Every unnamed field is a named absence the answer carries. |
| N2 | SC2 | treat an error a boundary entry carries as uncaught | criterion SC2 | The boundary comparison decides; the reviewer reads the matched entry back. |
| N3 | SC3 | name a handler when none resolved, or name the token it looked for | criterion SC3 | Grounded in C1; the answer states the absence and never a guessed identity. |
| N4 | SC4 | derive a phase from a message, a stack or an arrival order | criterion SC4 | Grounded in C3; every phase statement is read from the field that carries it. |
| N5 | SC5 | install a second global listener, a second boundary hook or any page-side instrumentation | criterion SC5 | One listener each, asserted by count in the task own suite; the reviewer greps the diff. |
| N6 | SC6 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC6 | The answer reports what happened, never what to do. |
| N7 | SC6 | add DOM to, or read a control from, the inspected page | criterion SC6 | Panel-only; the page is read, never written (AR-3, AR-6). |


## Constraints

- Everything happens in the existing panel application and the extension's content script; no new page-side
  instrumentation, no new dependency and no second tap (AR-3, AR-6).
- The join is a pure function of the records it is given; the surface renders its object and nothing else.
- Every suite that reads `research/raw/` and derives a shape — record-shapes censuses, the claims census, the
  byte-consistency scan, the gate records — must be declared at plan time. M059 discovered six of them at the
  ship gate; that is the mistake this constraint exists to prevent.
