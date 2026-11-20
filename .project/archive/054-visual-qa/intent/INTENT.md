# INTENT — M054 visual-qa

Milestone: M054 · visual-qa · Generation 3
Branch: gsd-path/M054
Surfaces: panel

## Goal

The panel reports the style readings it measured for a rendered element against the baseline
stylesheet, naming the property and both readings rather than judging the design. Nothing in this
tree has ever read a computed style from the panel's runtime, and the proposal's claim about which
element the measurement targets does not hold as written, so both premises are measured before any
surface is built.

## Verification target

Every claim of this milestone is verified on the Insurance Portal first
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served via
`control-angular-devapp up --target portal`). This is the first milestone whose whole claim is a
rendering claim, so the portal rule binds hardest here and is a constraint, not an afterthought.
The element the panel measures lives in the panel's own document (C3), which the portal itself does
not render: a portal run supplies the inspected Angular tab the panel runs against, and the verdict
must name the portal route tried (for example `/home`) and name the panel's own rendered document as
the artefact the portal lacks. A fixture is a fallback only for that named gap, never a first
resort, and a verdict that reaches a fixture without naming both the route tried and the missing
artefact does not count as a verdict.

## Success criteria

1. The panel reports, for a named element it renders in its own document, the computed value and the
   baseline value of each property it measured, naming the property, and labelling which reading is
   the element's computed measurement and which is the baseline stylesheet's declared value; neither
   value is inferred where its side could not be read. A mutant that hides a measured property,
   prints one value for both sides, or labels a stylesheet declaration as the computed reading
   reddens.

2. An element that cannot be measured is reported as such, naming which absence holds — no such
   element in the document the reading reached, no document the panel can read, no baseline to
   compare against — and that state is rendered as its own, distinct from a measured-unchanged
   answer; a mutant that renders an absence as a row of matching readings, or names a wrong absence,
   reddens.

3. No reading is invented: every computed value the surface renders is one the measurement produced
   in the document it ran in and every baseline value is one the stylesheet itself declares, and a
   run that measured nothing renders no property rows. A mutant that renders rows, or placeholder
   values, for a measurement that did not run reddens.

## Corrections

- C1 2026-11-20: The premise "the panel measures a rendered element" has never been measured in the realm the panel runs in, and its two possible readings come out differently. Measured: the panel is a `chrome-extension://` document that `extension/devtools.js:2-5` registers (`panel/index.html`) — a regular extension page with its own DOM — but no shipped panel code performs a computed-style read: `getComputedStyle` has zero call sites across `apps/angular-ai-devtools/src` and the extension's scripts, where the only occurrences are the comments stating their absence (`extension/after-render.js:6`). The computed-style reads this tree holds are node-side, over a document jsdom builds (`scripts/panel-styles.test.mjs:11-13,21-26`), and page-realm spike probes (`spikes/probes/hit-test.js:140`, `spikes/probes/overlay-pick.js:131`) — never the panel runtime. The one computed-style observation made inside the real `chrome-extension://` document class is M039's browser pass, recorded at `scripts/panel-styles.test.mjs:15-19` (Chrome injects `font-family` into a `chrome-extension://` document — an observation that required reading computed style there). For an inspected-page element the panel has no direct path: its routes out are the runtime-message relay (`apps/angular-ai-devtools/src/app/extension-message.service.ts:198-215` → `extension/background.js:107-109` → the isolated-world `extension/relay.js:1-2`, declared `extension/manifest.json:18-28`, re-dispatched to the MAIN-world `agent-main.js`, `extension/manifest.json:34-38`) and `chrome.devtools.inspectedWindow`, of which shipped code reads only `tabId` (`apps/angular-ai-devtools/src/app/extension-message.service.ts:156`, `apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts:119-124`); no shipped code calls `inspectedWindow.eval` or `chrome.scripting.executeScript` (zero call sites in `extension/` and `apps/`; the `scripting` permission sits unused at `extension/manifest.json:7`), though a panel eval reaching a page frame was measured once (`research/17-vitest-browser-runtime.md:140,174`, `spikes/probes/vitest-attach.mjs:212-218`). Verdict, plainly: a style read of the panel's own document is reachable today but unmeasured from the shipped panel runtime; a style read of an inspected-page element is reachable only through a relay, or through an eval route no shipped code has taken. M054 must measure the reading it claims before building any surface, and the criteria above are written to survive either measurement failing.
- C2 2026-11-20: The roadmap's open question names "the visual-qa proposal (S5), including which element the measurement targets" (`.project/ROADMAP.md:1916`). Measured: the proposal is N8 "Visual question answering" (`docs/feature-proposals.md:645`); "(S5)" is the related not-run spike "Image input on Aion and Gemma 4" (`docs/feature-proposals.md:1008`), which names no element. N8 names the element only as "an element picked" (`docs/feature-proposals.md:647`) whose "component box" (`docs/feature-proposals.md:648`) / "host box" (`docs/feature-proposals.md:650`) the deterministic part crops, and as "a fixed list of computed style properties" (`docs/feature-proposals.md:650`) the document never enumerates. That element — a picked component's host in the inspected page — is not verifiable in anything here: the Insurance Portal's route set names routes, not elements (`apps/insurance-portal/src/app/app.routes.ts:10-28`: home, contract, claim, complaint, customer), the demo app's routes name surfaces (`apps/angular-ai-devtools/src/app/app.routes.ts:24-112`), and the pick flow yields a page-realm descriptor (`extension/background.js:89-117`), not a panel-readable element. What is verifiable here is the baseline stylesheet's own hooks — `h2`, `section.panel-demo[data-surface][data-state]`, `p.state`, `p.line` (`apps/angular-ai-devtools/src/styles.css:49,54,62,87`), already measured by `scripts/panel-styles.test.mjs:12-13`. The element this milestone measures is therefore an element named in the panel's own document, rendered under those hooks; the property list is the measurement's to declare, not the document's, and no criterion above is read to promise a picked inspected-page host.
- C3 2026-11-20: "a named element in its own document" (`.project/ROADMAP.md:1899`) does not say whose. Decided here: the panel's own document — the only reading under which "against the baseline stylesheet" (`.project/ROADMAP.md:1890`) names a stylesheet this tree actually has, `apps/angular-ai-devtools/src/styles.css`, self-described as "The DevTools panel's one global baseline (M039 T005)" (`apps/angular-ai-devtools/src/styles.css:1-2`); measuring an inspected-page element against the panel's stylesheet would compare readings from documents that share no stylesheet. The surface therefore reads the baseline's declared values from the stylesheet's own rules and the element's computed values from its measurement, and labels which side each value came from — SC1 states that labelling and N2 prohibits crossing it. Still unmeasured, and left to this milestone's own measurement: whether the panel runtime can read its own document's computed style at all (C1), and which properties the measurement declares.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A property is named by the name the measurement read it under, and its two readings carry their side labels; a name folded, trimmed or matched as a prefix renders as the measurement wrote it, not as the surface matched it. |
| E2 | SC1 | encoding | criterion SC1 | A computed value the browser serialises differently from the stylesheet's declaration is rendered as each side reported it — the reading is not normalised into the declaration's spelling to make a row match. |
| E3 | SC2 | empty | criterion SC2 | An element name nothing in the document answers, a document the panel cannot read, and a stylesheet with no declaration for a measured property are three absences stated distinctly, never one blank state. |
| E4 | SC2 | precision | held-out | A document the reading reached that renders no element under the requested name reports no-such-element — never no-reachable-document — and names the reading that located the document beside the absence. |
| E5 | SC3 | idempotency | criterion SC3 | A run that measured nothing renders no property rows on a second run either: absence is stable, not a placeholder for a later success. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | obtain or report any reading by arming, driving or reading through a page-side control, input or widget, including the inspected page's picker — AR-6 keeps every interaction in the panel | criterion SC1 | Scope: out says so itself (`.project/ROADMAP.md:1904`). |
| N2 | SC1 | report a baseline value as the measured reading when it came from the stylesheet, or a computed reading as the baseline when it came from the element | criterion SC1 | |
| N3 | SC2 | render an element that could not be measured as unchanged or matching — an unreadable element is an absence, never a comparison result | criterion SC2 | |
| N4 | SC3 | fill any rendered value from a source the measurement did not produce — a default, a stylesheet value copied into the measured column, or a placeholder counted as a reading | criterion SC3 | |
