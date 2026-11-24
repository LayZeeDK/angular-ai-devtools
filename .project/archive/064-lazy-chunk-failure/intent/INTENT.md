# INTENT — M064 lazy-chunk-failure

Lane: standard · Milestone: lazy-chunk-failure (M064) · Branch: gsd-path/M064
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a lazily loaded route failed to render, naming the import specifier it could not load, the route
path that owns it, the response status and the content hash — or states the absence when the request never completed. It
never names a version drift it did not measure, and never reads the network back as its own evidence.

## Verification target

The Insurance Portal first, on a route whose lazy chunk fails to load. The fixture (`spikes/ng222-app`) is the fallback
only where the portal carries no such route, and a verdict that uses it must name the route tried and the artefact the
portal lacks.

## Corrections

- C1 2026-11-23: the roadmap calls "the dynamic-import failure the record carries, together with the route path whose lazy load produced it" the observable. Measured at this head, `grep -c "chunk" extension/agent-main.js` returns **0**, and `extension/navigation-narrator.js:26` states that the navigation payloads carry `{ route, type }` and that no key of either names a guard, a resolver, a chunk or a task. No import failure is recorded anywhere, so the first task records it; the join and the pane read only that record.
- C2 2026-11-23: the roadmap's risk — a chunk replaced after deploy and a network failure look the same from the router — constrains the record's shape: the response status and the content hash are both recorded, and a request that never completed is `cannot-tell` with the reason, never a version drift inferred from a status alone.
- C3 2026-11-23: a criterion phrased "from the observables the agent already holds" would be false here, because the observable does not exist yet. Every criterion below names the record this milestone writes.

## Success criteria

1. A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status;
   a mutant that resolves the import turns it off, and the red names the field that moved.
2. A request that never completed reports `cannot-tell` with its reason, and the answer never names a version drift, a
   cause or a remedy it did not measure; a mutant that infers a drift from a status reddens it.
3. The failure is read from a record this milestone writes, with no new page-side instrumentation and no second read of the
   network; the record's fields and the join's inputs are the same list, asserted in one place.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy
   record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A lazy route whose import resolved reports no finding, rather than an empty failure that reads as a success. |
| E2 | SC1 | ordering | criterion SC1 | Two failed imports on one navigation name both, in the order the router attempted them, and never collapse to the last. |
| E3 | SC2 | boundary | criterion SC2 | A request with no response status is reported as never completed, never as a 404. |
| E4 | SC2 | encoding | criterion SC2 | A hash the record truncates is reported truncated, never completed from the chunk's filename. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the failure record is the only source of an import specifier; a second read reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map, `app.spec.ts`, all three chat-entry lists and the copy records move together; a mutant that adds the surface without a loader reddens naming the key. |
| E7 | SC1 | precision | criterion SC1 | A failure attributed to a route the router never attempted is not reported as that route's failure; a mutant that names it reddens. |
| E8 | SC4 | precision | criterion SC4 | No answer names a fix, a schematic, a cause or an identity it was not given; a mutant that adds a remedy reddens. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | infer a version drift from a status, a filename or a missing hash | criterion SC1 | Grounded in C2; the answer states what the record carries. |
| N2 | SC2 | read the inspected page's DOM, its network panel or a rendered error | criterion SC2 | Panel-only; the page is read through the agent's records. |
| N3 | SC3 | add page-side instrumentation, a second tap or a second network read | criterion SC3 | One read, asserted by the task's own suite. |
| N4 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given. |
| N5 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry explains, not a dependency of the panel. |

## Constraints

- Everything happens in the existing panel application and the extension's content script; no new page-side
  instrumentation, no new dependency and no second tap (AR-3, AR-6).
- The join is a pure function of the records it is given; the surface renders its object and nothing else.
- Every suite that reads `research/raw/` and derives a shape — record-shapes censuses, the claims census, the
  byte-consistency scan, the gate records — must be declared at plan time, and both gate records are re-derived in the
  order gate then stability, after every suite this milestone edits.
- The project verify builds before it measures, and the build is uncacheable: `node scripts/ensure-sidecar-deps.mjs &&
  npx nx run angular-ai-devtools:build-extension && npm run check && npm test`, with no `--skip-nx-cache` and no
  `NX_DAEMON` workaround; the build rewrites `extension/panel/index.html`, which is restored before the ship gate.
