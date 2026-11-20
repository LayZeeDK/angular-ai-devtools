# INTENT — M053 webmcp-rehearsal

Milestone: M053 · webmcp-rehearsal · Generation 2
Branch: gsd-path/M053
Surfaces: panel

## Goal

The panel rehearses a declared WebMCP tool call through the panel's own model, reporting what the
model chose and what the tool returned, with no write to the inspected app and no model turn invented
where none can be made. Nothing in this tree has ever read a tool list through an awaited caller, and
`executeTool` has never been measured at all.

## Success criteria

1. The panel reads the declared tool list through an awaited caller of `document.modelContext.getTools()`
   and names each tool the API reported with the name it reported; a mutant that names a tool from a DOM
   label, a fixture list, or an un-awaited synchronous return reddens.

2. A rehearsal reports the tool the model chose and the result the tool returned, and when no model is
   available or the tool refuses the invocation, the surface states that state and names why, with no
   result rendered that the tool did not return; a surface that always refuses is not a surface, and a
   mutant that claims a result for a rehearsal that could not run reddens.

3. The panel never invents a model turn or a tool call it did not make: every rendered choice, result
   and model turn is one the panel's own model or the invoked tool actually produced, and a run that
   makes no call renders no result; a mutant that renders output for a rehearsal that never ran reddens.

## Corrections

- C1 2026-11-19: The premise "rehearses a declared tool call" assumes two things this tree has never observed: that a page can declare a tool, and that invoking one is possible without a model turn. M052 measured zero `registerTool`/`executeTool` call sites across `.ts/.js/.mjs/.html` (`research/raw/m052-webmcp-api.json`, member `webmcp-member-call-sites`), so the surface exists on `document.modelContext`'s prototype but nothing has ever called it, and `executeTool` has never been measured — not its arity, not whether it needs a model, not its answer shape. M053 must measure both before building any surface, and the criteria above are written to survive either measurement failing.
- C2 2026-11-19: The awaited caller is inherited work, not a fresh feature. M052 measured `getTools()` in a live Chrome Beta 159 instance (`research/raw/m052-webmcp-observation.json`): the synchronous call returns a `Promise` that resolves to `[]` on a page declaring no tools, so M052's synchronous `readTools` answers `cannot-tell`/`unreadable-list` and the awaited caller was recorded as carried residual C3 in M052's PLAN. Wiring that await into a caller that hands the resolved list to the surface is part of this milestone's scope, stated here rather than re-derived.
- C3 2026-11-19: The milestone cannot widen a claim. The panel's own tool registry (M020, the `provideTool` files) makes "the panel's own model" a real dependency, but if `executeTool` cannot be invoked in a controlled way on the measured API, the surface reports that refusal and why rather than manufacturing a call, and no criterion above is read to promise a successful rehearsal.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A tool is named by the string the awaited API call resolved to, never by a DOM label, a fixture list or the prototype's member names. |
| E2 | SC1 | empty | criterion SC1 | A page whose awaited call resolves to a list with no tool, a page with no `document.modelContext`, and an awaited read that cannot resolve are different states and must not render alike. |
| E3 | SC2 | boundary | criterion SC2 | No model available, a tool that refuses the invocation, and a successful rehearsal are three states the surface names distinctly; the refusing states are pass states, not failures of the surface. |
| E4 | SC1 | precision | held-out | A page whose awaited list resolves with tool descriptors that carry a name but no description renders each tool with its API name and no invented description. |
| E5 | SC3 | idempotency | criterion SC3 | A rehearsal that makes no tool call because no model is available renders no result on a second run either: absence is stable, not a placeholder for a later success. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | infer a tool name from a DOM label, a fixture list or any source other than the awaited API answer | criterion SC1 | |
| N2 | SC2 | invent a model turn the panel's own model did not make, or render a choice for a rehearsal that never ran | criterion SC2 | |
| N3 | SC2 | render a result the tool did not return, including a paraphrase offered where the tool refused | criterion SC2 | |
| N4 | SC3 | register a tool to observe one, or re-register through `document.modelContext.registerTool` to make the rehearsal observable | criterion SC3 | Asserted by a poisoned-source test, as in M052's reading. |
