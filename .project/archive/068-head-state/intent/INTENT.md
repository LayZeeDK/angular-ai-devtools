# INTENT — M068 head-state

Lane: standard · Milestone: head-state (M068) · Branch: gsd-path/M068
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a document head entry is stale or duplicated: it names the entry the record observed, the entry still
present in the head, and the navigation that wrote it — or states the absence it measured. It never infers a writer from
the entry's text, and never names a route the record did not carry.

## Verification target

The Insurance Portal first, on a route whose head changes as the app navigates. The fixture (`spikes/ng222-app`) is the
fallback only where the portal carries no head write, and a verdict that uses it must name the route tried and the
artefact the portal lacks.

## Corrections

- C1 2026-11-25: measured before writing any criterion — `grep -rln 'document.head|document.title' extension/*.js` returns no match, so nothing in this repository reads a head entry today. The record this milestone joins is one it writes.
- C2 2026-11-25: measured in M065's own record (`research/raw/m065-title-record.json`): the capture installed a MutationObserver on `<title>` and `document.head` in an isolated world, recorded its reads, and states `writesSeen: 0` with *"the portal carries no title instrumentation of its own and the observer names no writer."* A criterion requiring the writer to be read directly would be unprovable, so the writer is the navigation index the record correlates a write with, and a write with no navigation beside it is `cannot-tell` rather than an inferred route.
- C3 2026-11-25: `extension/field-state.js` owns the identity of a field and `extension/field-binder.js` reads a hosted control through it; this milestone adds a third reading of document state, and all three must agree about which entry is which — a second identity for a head entry is the defect M033, M064, M066 and M067 each paid for.

## Success criteria

1. A head entry present twice produces a finding naming both the entry the record observed being written and the entry still present; a mutant that reports only the first occurrence reddens it.
2. An entry written by one navigation and left behind by another is reported as stale, naming the navigation that wrote it and the one whose page carries it; a mutant that reports staleness without the writing navigation reddens it.
3. The observed entries and their writing navigations are read from a record this milestone writes, and the entry identity is asserted against the producer rather than derived a second time.
4. The panel renders exactly what the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no route the record did not carry.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| --- | --- | --- | --- | --- |
| E1 | SC1 | empty | criterion SC1 | A head with one entry of each name reports no finding, never a finding with an empty comparison. |
| E2 | SC1 | ordering | criterion SC1 | When two entries share a name, the one written later is named as the one still present, and the earlier one as the observed write. |
| E3 | SC2 | precision | criterion SC2 | An entry written by the current navigation is not reported as stale, and a stale one is not reported as current. |
| E4 | SC2 | boundary | criterion SC2 | A write with no navigation beside it is `cannot-tell`, and no route is inferred from the entry's text. |
| E5 | SC3 | boundary | criterion SC3 | The record is the only source of a writing navigation; a second reader reddens the task's own suite. |
| E6 | SC3 | precision | criterion SC3 | An entry identity this repository does not produce is `cannot-tell`, never a second identity derived here. |
| E7 | SC4 | boundary | criterion SC4 | The route table, the loader map, the ordered path pins and the surface record move together; a mutant that omits one reddens naming it. |
| E8 | SC4 | precision | criterion SC4 | No answer names a remedy, a schematic, a cause or a route the record did not carry. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| --- | --- | --- | --- | --- |
| N1 | SC1 | name a duplicate without the entry still present | criterion SC1 | Both are named together, or the absence is stated. |
| N2 | SC2 | infer a writing navigation from an entry's text or its order in the head | criterion SC2 | Grounded in C2: the observer names no writer. |
| N3 | SC3 | read the inspected page's DOM directly as its own evidence | criterion SC3 | Panel-only; the page is read through the agent's record. |
| N4 | SC3 | add page-side instrumentation or a second entry identity | criterion SC3 | One identity, asserted by the task's own suite. |
| N5 | SC4 | name a remedy, a schematic, a modern-Angular pattern or a route the record did not carry | criterion SC4 | The answer states what it was given. |
| N6 | SC4 | adopt an `angular/components` surface in the panel | criterion SC4 | A10/A11: those families are the subject, not the surface it renders on. |

## Constraints

- The panel surface is one route, one loader key and one join module; every suite that enumerates the route table is
  declared in the task that changes it, and a `pinned-file` warning is read as a blocker.
- A recording is written only by an explicit capture (`M068_CAPTURE=1`) and read by every default run.
- A suite this milestone adds owes the census its `SUITE_DIFF_REASONS` row in the same task, and every recording it
  writes is named in `scripts/recordings.json` in the same task.
- Every declared path must exist at the task's base or appear in its landing.
