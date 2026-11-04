# Gap Review — 2: proof strength

Reviewed HEAD: 9aef03ef188f1696f338c94a4a323d45680309f3
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2

## Checked evidence

- **Check**: Read `apps/angular-ai-devtools/src/app/after-render.ts` and `extension/after-render.js`; made a mutant in `extension/after-render.js` reversing `after` events (restored after test), ran `node --test scripts/panel-after-render.test.mjs`.
- **Observed**: Surface reads only the handed chain (normalises read/events, renders in supplied order, maps states loading/ordered/cannot-tell/unknown; ordered requires non-empty `after` else becomes absence; never attributes cause/layout). Mutant: reversing `after` in `extension/after-render.js` caused the panel suite to fail (M1 — reversing the rendered order reddens the emission-order pin) with diff showing `after` events reordered; after restoring the original, `git status --porcelain` showed only the two artifacts.
- **Reference**: `apps/angular-ai-devtools/src/app/after-render.ts`, `extension/after-render.js`, `scripts/panel-after-render.test.mjs`

## Finding

- **Found**: The surface (`apps/angular-ai-devtools/src/app/after-render.ts`) consumes the chain produced by `extension/after-render.js` without re-deriving order from the raw profiler list — it normalises and renders `before`/`after` arrays as supplied, preserves emission order, and enforces state constraints (e.g. `ordered` with empty `after` becomes `cannot-tell`). The ordering logic lives in the extension module (joins `read.at` to recorded events in list order). Reversing `after` in `extension/after-render.js` reddened the panel suite's emission-order pin, proving the surface does not re-sort/re-derive order independently; restoration returned the suite to passing state.
- **Fix direction**: none

## Notes

- Surface explicitly avoids naming layout/causes/reflow and treats missing after-render events as absence only.
- Mutant was applied and fully restored; working tree cleanliness verified with `git status --porcelain` showing only `.project/review/final-gap-1.md` and `.project/review/final-gap-2.md`.
