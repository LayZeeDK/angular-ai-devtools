# M054 visual-qa — synthesis

Four waves, four tasks, reviewed and landed at `1d912b07e1b13db2d5a169810b2ffb574357f230`; project
verify and ship gate pass at the reviewed head. This records what the milestone measured, what it
changed, and the facts the ship carries.

## What the milestone set out to show

The panel reports the style readings it measured for a rendered element against the baseline
stylesheet, naming the property and both readings rather than judging the design. Nothing in this
tree had ever read a computed style from the panel's runtime, and the proposal's claim about which
element the measurement targets does not hold as written, so both premises were measured before any
surface was built (INTENT Goal).

## What the measurement changed

Two premises came out differently from the plan's wording, and both rulings were measured first:

- **The element lives in the panel's own document (C3).** The proposal (N8,
  `docs/feature-proposals.md:645-650`) names only "an element picked" in the inspected page, which
  is not verifiable in anything this tree holds (C2); what is verifiable is the baseline
  stylesheet's own hooks — `h2`, `section.panel-demo[data-surface][data-state]`, `p.state`,
  `p.line` (`apps/angular-ai-devtools/src/styles.css:49,54,62,87`). T001 measured the computed-style
  read live in the panel's own `chrome-extension://` document, in Chrome/159.0.8154.13, against the
  Insurance Portal at route `/home` — the portal supplies the inspected tab and lacks the panel's
  own rendered document, which is the artefact the verdict names; no fixture was needed and none
  was used (`research/raw/m054-style-read.json:2872-2878`).
- **The relay carries no style read and needs none added (C1, PLAN Correction 1).** The six relayed
  types are page events, the only two panel→page routes are the replay request and the picker
  command, the isolated-world listener answers only those two, and `getComputedStyle` has zero call
  sites in the panel source and the extension scripts. The own-document read needs no message, no
  relay and no `inspectedWindow` leg, and none was built
  (`research/raw/m054-style-read.json:57-78`, the relay ruling).
- **The property list is the measurement's to declare (C2).** Six properties — `padding`,
  `borderTopWidth`, `backgroundColor`, `color`, `fontSize`, `fontFamily` — declared from the hooks
  the baseline names, each with the hook and line that declares it and the browser default the
  document class injects, held to the property list the recorded expression itself carries
  (`research/raw/m054-style-read.json` Q2; `scripts/visual-qa-style-read.test.mjs:152-179`).
- **A by-product defect measured and fixed (PLAN C5).** The committed artefact styled every hook
  correctly, but a fresh build left the baseline sheet behind `media="print"` that the extension
  CSP's `script-src 'self'` refuses to ungate, so every hook read UA defaults. Cause: Angular's
  critical-CSS inlining (`optimization.styles.inlineCritical`). T003 fixed it in the panel build
  target (`apps/angular-ai-devtools/project.json:79-86`), and the committed artefact and a fresh
  build now share one hash (both sha256 `520f85902e3d1a84eb8f4702b63b1986d501fdbaf69caa4befe6054dbc84b7d9`).

## What was built

- **Wave 1 (T001, `7d140f3a`)** — the measurement, cited line by line and pinned by
  `scripts/visual-qa-style-read.test.mjs`, which re-reads every citation and reddens a slid
  citation, a dropped property or an unwitnessed record claimed observed, each by name. Nothing
  built.
- **Wave 2 (T002, `75834ddc`)** — `extension/visual-qa.js`: the pure join `styleReport(measurement)`
  answering `measured`, `no-such-element`, `no-document` or `no-baseline` and no fifth state, rows
  carrying the property as written and both readings verbatim under their own side labels. Held-out
  E4 and thirteen redden-by-name mutants, proven pure with `document`, `getComputedStyle`, `fetch`
  and `Date` armed as traps and the input frozen.
- **Wave 3 (T003, `f5d6a41c` + `21e5d554`)** — the C5 fix, the surface
  `apps/angular-ai-devtools/src/app/panel-visual-qa.ts` rendering the four states from an
  enumerated sentence registry with the two side labels as constants, the `visual-qa` route
  (`app.routes.ts:83`, between `console-read` and `webmcp-rehearsal` so no cited route line moves)
  and loader key (`panel-demo.ts:63`), the route-table suites declared in the same landing, and the
  re-cite of `research/raw/m054-style-read.json` to the rebuilt artefact's line.
- **Wave 4 (T004, `5ba03002` + `1d912b07`)** — the records: `research/raw/m054-surface.json` (the
  twenty-sixth surface, 67 citations re-resolved by search) and `research/raw/m054-verdict-claims.json`
  captured with their own commands, the copy record re-measured over the surface (150 → 155
  declared sentences, 446 → 470 citations) with the digest rows its sentences need authored from
  the record (`extension/copy-digest.json`, version `m054+t004`, five new rows under `visual-qa`),
  the seven earlier surface records re-cited with no line moved, the `m044`/`m056` gate records
  re-derived by their own capture commands, and the project verify run as the last action.

## Review findings and their resolution

All four waves passed full review at cycle 1 (`.project/review/wave-1.cycle1.md` …
`wave-4.cycle1.md`), each at the four tasks' landing head. Two wording deviations are recorded
rather than repaired: the `visual-qa` route entry sits between `console-read` and `webmcp-rehearsal`
rather than appended after `what-changed`, because the plan's own goal (no cited route line moves)
is achieved at the recorded point (`app.routes.ts:19`; `research/raw/m054-surface.json:57`); and
the pane does not measure at render time — see the declared limit below.

## The facts the ship carries

1. **C5's fix: the panel now builds styled.** `inlineCritical` is false in the panel target, the
   plain stylesheet link is what a rebuild emits, and the committed artefact and a fresh build are
   byte-identical — the surface is verified on the artefact somebody actually rebuilds.
2. **The pane renders the join's answer for T001's recorded measurement — no shipped surface calls
   `getComputedStyle` at render time.** The demo's `visual-qa` sample fact is that answer, held
   field-for-field to the shipped `styleReport` by `panel-demo.spec.ts`, and the pane reads no
   document, calls no `getComputedStyle`, reads no stylesheet, dispatches no message and reaches no
   inspected window. That is T003's stated deviation from the plan's wave-3 wording, carried in
   `research/raw/m054-surface.json`'s `notCaptured` (`:586`) and the task Log — stated, not hidden;
   the milestone's one computed-style read is T001's, in `research/raw/m054-style-read.json`.

## What this milestone leaves behind

- a measured answer to "can the panel runtime read its own document's computed style" — yes, with
  the six properties and both sides' readings recorded instrument-first;
- a pure join whose four-state vocabulary the surface renders without adding a state of its own;
- a styled panel build, so every future surface reads its baseline declarations as declared; and
- recordings whose every citation is re-read by their own suites, so the next milestone re-measures
  rather than copies.
