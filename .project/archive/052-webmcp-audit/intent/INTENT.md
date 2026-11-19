# INTENT — M052 webmcp-audit

Milestone: M052 · webmcp-audit · Generation 3, batch 3, group cross-package
Branch: gsd-path/M052 · Baseline: b10bffb6
Surfaces: panel

## Goal

The panel reports which WebMCP tools the inspected app declares, and refuses to describe a tool the page
does not expose. Today nothing reads a tool list: the only WebMCP knowledge in the tree is a canary that
answers whether `document.modelContext` is an object.

## Success criteria

1. Each tool the page declares is named with its own fields, and the fields are read from the API
   rather than from the DOM. A surface lists every declared tool with the name the API reports and the
   description it reports, and nothing it does not report. A mutant that renders a tool name from a DOM
   label instead of the API reddens.

2. A tool whose shape cannot be read is reported as cannot-tell, naming the absence. When the API
   exposes a registration surface but no readable tool list, the surface states that the list is absent
   rather than rendering an empty list, an inferred signature, or the word "none". A mutant that renders
   an empty list as "no tools declared" reddens.

3. The reading is pure over what the page exposes. No network call, no DOM traversal to recover a
   tool, no re-registration to make a tool observable. Asserted by a poisoned-source test.

## Corrections

- C1 2026-11-19: Premise falsified before planning (measured 2026-11-19, baseline `b10bffb6`). The roadmap says the panel reports "which WebMCP tools the inspected app declares and whether each can be called". Measurement narrows it twice. Presence is already answered: `control.mjs:1886` and `:1953` compute `documentModelContext`/`navigatorModelContext` and `pass: typeof document.modelContext === 'object'`; `control.mjs:3606` gates a verdict on it and `SKILL.md:175` documents the canary. A milestone that re-proved presence would ship nothing, so SC1–SC3 are about the **tool list**, not the API.
- C2 2026-11-19: "Whether each can be called" is not yet measurable. Calling a tool needs a model turn and mutates the page. That claim is removed from this milestone rather than promised; T001 establishes whether a tool list is even readable before any surface is designed. This is the fourth consecutive milestone whose roadmap sentence needed narrowing by measurement (M031, M032, M033 each did). Recorded here rather than silently rewritten.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A tool declared under a name the API reports is not looked up by any DOM label; the name is the API's string. |
| E2 | SC2 | empty | criterion SC2 | An app that declares no tools and an API that exposes no readable list are different states and must not render alike. |
| E3 | SC3 | boundary | criterion SC3 | Reading a tool must not register one; a re-registration to observe behaviour is a refusal. |
| E4 | SC1 | boundary | held-out | A page whose tool list is readable but whose tool descriptions are absent renders each tool with its name and no invented description. |

## Out of scope

- Invoking a tool, and any claim about whether a call would succeed.
- The `webmcp` canary's own semantics, which M0?? already proves and this milestone must not weaken.
- Any change to `control.mjs`.

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | report a tool the API did not return | criterion SC1 | |
| N2 | SC1 | assert against a hand-written fixture list that the API never produced | criterion SC1 | |
| N3 | SC2 | render `cannot-tell` as an empty list | criterion SC2 | |
| N4 | SC3 | recover or observe a tool through a network call, DOM traversal or re-registration | criterion SC3 | |
