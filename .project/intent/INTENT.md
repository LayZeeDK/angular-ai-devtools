# M047 — component-search

## Problem

An agent reading a page through the panel can see that a component rendered only by hunting the DOM
for it. The panel has no surface that lists the components the inspected page rendered, so the agent
either names one from memory or greps the DOM for a list it cannot otherwise obtain. The roadmap's
premise is that the page agent already captures a component tree and the panel only has to read it.

## Users

The agent driving the panel, and the developer watching it answer. Both need the list of components
the page rendered, filtered by a name they type, with an absence reported as an absence.

## Success criteria

1. Filtering matches the names the record carries; a mutant that matches a name the record lacks reddens it.
2. An unreadable tree reports cannot-tell naming the absence, never an empty list.
3. A subject that does not match this milestone's premise reports "cannot tell" rather than naming a wrong cause.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| E1 | SC1 | boundary | criterion SC1 | A component name the record carries is matched only when the typed text is a substring of that recorded name. |
| E2 | SC1 | precision | criterion SC1 | A name typed with different case matches the recorded name; the match is case-insensitive and says so. |
| E3 | SC2 | empty | criterion SC2 | A page whose component source could not be read reports `cannot-tell` with its reason, never a zero-length list. |
| E4 | SC2 | boundary | criterion SC2 | A page that rendered no components reports a stated empty list, which is distinct from `cannot-tell`. |
| E5 | SC3 | boundary | criterion SC3 | A subject outside this milestone's premise reports the mismatch it observed, not a component name. |
| E6 | SC1 | idempotency | criterion SC1 | Filtering the same text twice returns the same rows in the same order. |
| E7 | SC1 | precision | criterion SC1 | A duplicated name in one list appears once per rendered instance, and the count says which. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| N1 | SC1 | the list | criterion SC1 | invent a name the record lacks, or complete a name from framework knowledge |
| N2 | SC2 | an absence | criterion SC2 | render an unreadable tree as an empty list, or as clean, safe or ok |
| N3 | SC3 | a cause | criterion SC3 | name an element, component, remedy or rule identity the observable does not state |
| N4 | SC1 | the inspected page | criterion SC1 | add DOM to a page, or move any interaction out of the panel (AR-3, AR-6) |
| N5 | SC1 | the search | criterion SC1 | read the DOM to build the list when the record already holds it |

## Scope

In: the component source the page agent can already read — `__ngContext__` per element and
`ng.getComponent` — the profiler events that carry `componentName`, a panel surface that lists and
filters them, and the absence reported when neither source can be read.

Out: a page-side control or widget; app code generation; `@angular/animations`, Angular SSR and
`angular/components` (A5); DOM added to the inspected page (AR-3).

Surfaces: panel

## Corrections

**The roadmap's premise does not survive measurement, and the criteria are narrowed accordingly.**
Measured at `9aa6e960`:

- `extension/agent-main.js` holds no component-tree capture. The word `component` appears 69 times,
  and every occurrence is a per-element or per-event read: `ng.getComponent` at line 855,
  `el.__ngContext__` at lines 1283 and 1367, and profiler cycle events whose `componentName` is
  recorded as `null` when the profiler passed no instance — line 622 states that every measured
  `ComponentStart` passed `null`.
- `apps/angular-ai-devtools/src/app/app.routes.ts` carries 26 panel routes and none of them lists
  components.

So "the component tree the page agent already captures" is not an observable this repository
produces. SC1 is therefore narrowed from *the tree the agent holds* to *the names the record
carries*, which the first task must establish by measurement: the names come from whatever the
agent can read per element, and where it can read none, SC2's `cannot-tell` is the answer rather
than an empty list. T001 exists because the premise sentence could not be taken at face value, as
in M031, M032, M033 and M046.

## Risks

- The per-element read may name a component only for elements that carry `__ngContext__`, which a
  production build does not. The panel must report that as an absence, not as an empty page.
- A filter that matches more than the record carries would look helpful and be wrong; E1 and N1
  exist for that.

## Open questions

- Whether the profiler's `componentName` events are usable at all, given the measured `null`s. T001
  decides this by measurement rather than by assumption.
