# Synthesis — M034 lint-legacy

## What the milestone established

The legacy diagnostic the roadmap assumed does not reach the page. `NG6100` — the one legacy code
`extension/error-digest.json` carries — is printed by the dev server's compiler plugin and stops there:
the capture records three console messages, `withAnNgCode: 0`, and the observation extracted verbatim
from the recorded build output (`reachedThePageConsole: false`). No compile-time legacy lint runs in
this repository either, since no tsconfig enables `extendedDiagnostics`.

So the milestone was re-scoped, by a delegated ruling, to the legacy axis the page does show: a
component declared in an NgModule rather than standalone, read from `ɵcmp.standalone` through the `ng`
hooks the panel already calls. The modern form is not composed — it is quoted from one captured entry
(`https://angular.dev/reference/migrations/standalone`, a 165-character quote whose page text is pinned
by sha256), and a default run verifies the quote against the stored text without fetching.

## The four tasks

1. **T001** measured what the compiler says and where it says it — the recording that closed the
   console route, plus both route-table recordings re-measured because the fixture gained a route.
2. **T002** built the join: a non-standalone component yields a finding carrying the table's own form
   and source; standalone, unreadable metadata and an unsourced structure are three distinct
   `cannot-tell` reasons, each proven with a mutant that reddens by name.
3. **T003** rendered it — `component`, `structure`, `modernForm`, `source` — and registered the surface
   in the panel demo. It corrected two of the plan's premises by measurement: the router-diagnostic pin
   reads the m033 recording rather than the route table, and the page-picker spec asserts no count.
4. **T004** re-recorded both manifests, both build recordings and the verdict claims; three declared
   pins were left byte-identical because every value in them still measured the same.

## What the gate found

Three things, and only one was a product defect:

- The first gap review returned **fail** with SC1 and SC2 **not met**, correctly — the criteria
  described a console diagnostic that the measurement had already shown does not exist. The fix was an
  amendment of the criteria with both originals preserved verbatim in `INTENT.md ## Corrections`, not a
  weaker check.
- The amendment commit's own A12 backlog row broke `prettier --check`, so SC5 failed at the very head
  the review had certified. The reviewer refused the ledger's earlier pass row on the correct grounds
  that it named a different head.
- `prepare-final` died four times, each leaving a verify worktree registered and on disk.

## What carries forward

- **The premise is the first thing to measure.** Three milestones in a row (M032, M033, M034) found the
  roadmap's sentence narrower than it read. Measuring costs one task; assuming costs a re-plan.
- **A criterion that describes a non-existent oracle cannot be met, and amending it is not the same as
  moving the gate** — provided the originals stay in the file and the review records the earlier fail.
- **A certification is only about the head it names.** A docs commit after review invalidates it, and a
  ledger row at another SHA is not evidence for this one.
