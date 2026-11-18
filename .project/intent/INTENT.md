# INTENT — M051 what-changed

Lane: brownfield
Review panel: off
Finding skeptics: on
Surfaces: panel

## Problem

A page changes between two moments and the panel cannot say what changed. The roadmap asks for a
comparison of two recorded snapshots of the same page, naming the fields that changed.

## Users

A developer who recorded a page twice and wants the difference named, rather than a paragraph describing
that something looks different.

## Success criteria

1. Two recorded page snapshots are compared field by field, and the surface names each field that changed with its before and after.
2. A pair that the record cannot establish as the same page is refused with `cannot-tell` naming what is missing, never compared as if it were the same page.
3. A comparison reads only the two snapshots it was given: no file, no clock, no third record.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | scripts/what-changed.test.mjs | A field present in one snapshot and absent from the other is reported as added or removed, never as a change of value. |
| E2 | SC2 | boundary | criterion SC2 | scripts/what-changed.test.mjs | Two snapshots with no field establishing the same page report `cannot-tell` with the absent identity named. |
| E3 | SC3 | empty | criterion SC3 | scripts/what-changed.test.mjs | One snapshot, or two identical ones, renders its own state rather than an empty finding list. |
| E4 | SC1 | boundary | held-out | scripts/what-changed.test.mjs | A snapshot pair identical except in one field renders exactly one finding, and the same suite asserts the identical-pair case, so "one change" cannot collapse into "no comparison". |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | an invented change | criterion SC1 | report a difference the two snapshots do not state, or diff a field against itself |
| N2 | SC2 | an absence | criterion SC2 | compare two snapshots as the same page without a field that establishes it |
| N3 | SC3 | a source | criterion SC3 | read a third record, a file or a clock to decide what changed |

## Scope

- The pure comparison and its four states.
- The panel surface that renders them, and its route and loader key.
- The recorded claim for the surface.

Not in scope: capturing the snapshots themselves beyond what the record already publishes, and any
judgement about why a field changed.

## Corrections

**The roadmap's sentence does not survive measurement.** "Two recorded snapshots of the same page" assumes
the record publishes page snapshots. It does not: `extension/agent-main.js:1437-1541` uses "snapshot" for a
**router state snapshot** carried by an activation event (`:1539-1541`), with `ROUTER_CHAIN_LIMIT = 32`
route-config paths read from one (`:1472`). There is no recorder that publishes a page snapshot at two
moments, so the comparison cannot be built on a record type that does not exist.

Consequences, taken here rather than at build time:

- SC2 is not an edge case, it is the normal case for a pair the record does not bind. The surface's honest
  default is `cannot-tell` until a field establishes the same page.
- SC1 survives only as a comparison over a snapshot shape this milestone's T001 must measure and name; if
  T001 finds no such shape, SC1 is corrected to the comparison the record does support and this section
  records the second correction rather than the build inventing one.
- The intent does not ask for a new recorder. Adding one is a different milestone, and a surface that
  compares nothing because its input does not exist would be the vacuity this programme keeps removing.

## Risks

- A snapshot shape that exists only in one field would make SC2 always refuse, and the surface would ship
  green while answering nothing. E2 and E4 exist to make that visible.
- The comparison must not become a general diff utility; it reads the named fields the record states.

## Open questions

- Which fields a recorded snapshot carries at all, and whether any field is stable across two records of one
  page. T001 measures this before any comparison is written.
