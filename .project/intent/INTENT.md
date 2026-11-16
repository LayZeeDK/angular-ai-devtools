# M046 — copy-to-agent

## Problem

The panel renders a finding, and a developer who wants to act on it has to retype it. A copy control exists on
other surfaces but none of them hands the agent the finding the panel actually drew: each re-derives its text from
the record, so what arrives at the agent is a second rendering that can disagree with the one on screen. The
milestone's premise — that a finding can be handed over as a question about itself — is falsified before anything
is built, because nothing in the tree sends a rendered finding today; the copy paths compose a string from the fact
list and never read the pane.

The same inspection found 78 documentation defects: claims that cite a line which no longer holds, claims that name
a path the archive moved, and two `.claude` skill trees 17 lines behind their `.commandcode` counterparts. Those
are this milestone's collateral, because they make the shipped skills lie to the next agent that reads them.

## Users

A developer reading a finding in the panel who wants to ask an agent about the thing the panel just named, and the
agent that receives the question and must not be given an invented identifier, cause or remedy.

## Success criteria

1. The hand-off quotes the rendered finding: the text the pane drew is the text sent, and a mutant that re-derives
   the text from the record reddens the pin.
2. A finding carrying a named absence is handed over with that absence, not with an empty or completed finding.
3. A subject whose finding cannot be expressed as a question reports `cannot-tell` with the reason, rather than
   naming a wrong cause, element or remedy.
4. Every documentation claim this milestone's inspection ruled `fix-doc` is corrected at the artefact it cites, and
   the correction is proven by the pin that reads that artefact, not by the edit alone.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | A finding whose pane text differs from its record text is sent as the pane drew it. |
| E2 | SC1 | precision | criterion SC1 | The hand-off carries no stack, no count and no identifier the record does not state. |
| E3 | SC2 | empty | criterion SC2 | A finding that reports `cannot-tell` is handed over with that state and its reason rather than a guess. |
| E4 | SC3 | boundary | criterion SC3 | A subject the premise does not match reports the mismatch and sends nothing. |
| E5 | SC4 | precision | criterion SC4 | A citation is corrected at the file it names, and the pin that reads that file proves the new line. |
| E6 | SC4 | idempotency | criterion SC4 | A `.claude` skill tree is byte-identical to its `.commandcode` counterpart once mirrored, proven by hash. |
| E7 | SC4 | precision | criterion SC4 | A claim whose settling evidence lives outside this tree is ruled `accept-drift`, not edited to match a guess. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | the hand-off | criterion SC1 | compose the text from the record; the pane's own output is the only source |
| N2 | SC2 | an absence | criterion SC2 | fill an absence, or render one as clean, safe or ok |
| N3 | SC3 | a cause | criterion SC3 | name an element, component, remedy or rule identity the observable does not state |
| N4 | SC4 | a documentation repair | criterion SC4 | widen a claim to match a guess, or delete a claim whose evidence is merely outside this checkout |
| N5 | SC1 | the inspected page | criterion SC1 | add DOM to a page, or move any interaction out of the panel (AR-3, AR-6) |

## Scope

In: the panel's own rendered finding handed to the agent; a control that names what will be sent before it sends;
the state reported when a finding cannot be expressed as a question; the 78 `fix-doc` documentation corrections
this milestone's inspection recorded in `.project/research/DOCS-AUDIT.md`.

Out: a page-side control or widget; code generation of app code; `@angular/animations`, Angular SSR and
`angular/components`; and the 142 `unverifiable` claims, which are ruled `accept-drift` rather than edited.

Surfaces: panel

## Corrections

- 2026-11-16 — the roadmap's premise for this milestone is falsified by measurement before planning: no copy path
  in the tree reads a rendered finding, so SC1's "quotes the rendered finding" is new behaviour rather than a fix.
  The intent states that instead of assuming the control exists.
- 2026-11-16 — the documentation repairs join this milestone rather than a new roadmap entry. `roadmap-entry`
  appends, and ten unshipped entries follow M046, so a `docs-repair` id would land after a generation's worth of
  work and the audit would drift again while it waited. The repair scope is bounded to the rows the inspection
  ruled `fix-doc`; the `unverifiable` rows are explicitly out.
- 2026-11-16 — the inspection measured 152 documents, 740 claims and 180 queue rows: 560 verified, 75 stale, 3
  aspirational, 142 unverifiable. The stale and aspirational rows are the defect set; the unverifiable rows are a
  limitation of the audited tree, and treating them as defects would be the invention this milestone prohibits.

## Risks

- A copy path that reads the pane couples the hand-off to the renderer, so a later pane refactor can silently
  change what the agent receives. Mitigation: the pin compares pane text to sent text, and the mutant re-derives.
- Mirroring `.claude` onto `.commandcode` copies whatever `.commandcode` currently holds; if the maintained copy is
  the drifted one the mirror propagates the error. Mitigation: the mirror is proven by hash and by the suite that
  reads both trees.
- 78 corrections across skills, references and research documents is a wide diff. Mitigation: tasks by file group,
  each declaring its files, each with a pin that reads the corrected artefact.

## Open questions

- docs/feature-proposals.md — whether the hand-off is a message or a prompt, which decides the control's label.
