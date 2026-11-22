# Inspect delta — M062 outlet-explainer

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` · this head: `8efe2d5cd636111cd9934d1df78dcbeb9cb21108` (`gsd-path/M062`)

The docs audit in force is `.project/research/DOCS-AUDIT.md`, taken at the commit above. This record states what changed since it, so the next milestone starts from a measured delta rather than a second full audit. It does **not** claim that code was audited: a path listed here as non-audit is one the audit never covered.

## What changed

- Audited documents changed since the audit base: 9
  - `.commandcode/skills/prove-console-cannot-tell/SKILL.md`
  - `.commandcode/skills/prove-graph-serialize-closure/SKILL.md`
  - `.commandcode/skills/prove-join-absence-folding/SKILL.md`
  - `.commandcode/skills/prove-overlay-observer-purity/SKILL.md`
  - `.commandcode/taste/tooling/taste.md`
  - `.commandcode/taste/workflow/taste.md`
  - `AGENTS.md`
  - `plans/angular-ai-devtools-program-backlog.md`
  - `research/SYNTHESIS.md`

- Non-audit paths changed: 427
  - `.commandcode/` — 4 path(s)
  - `.githooks/` — 1 path(s)
  - `.project/` — 334 path(s)
  - `apps/` — 15 path(s)
  - `extension/` — 11 path(s)
  - `nx.json/` — 1 path(s)
  - `research/` — 33 path(s)
  - `scripts/` — 28 path(s)

## What the milestone needs measured

The roadmap entry calls "the outlet mapping in the router state and the outlet names declared in the component tree" the observable. That premise is falsified at this head:

- `grep -ri "\boutlet\b" extension/` over the extension source returns **0** matches. The only hits in the repository are the `RouterOutlet` class name inside fixtures and one minified line in the built panel bundle.
- No record carries an outlet **name**. The nearest thing is `componentName: 'RouterOutlet'` in the demo record, which names the component, not the outlet a route was asked for.
- The router record M033 reads carries the configured path set and the unmatched segment. It does not carry an outlet name, a matched name, or a route-to-outlet mapping.

So the milestone cannot answer the question from records that exist: the first task must add the observable, and the panel surface must render only the names the state carries. The roadmap's own risk — that an unnamed outlet and one explicitly named `primary` are the same outlet — is a risk this delta confirms, because no record distinguishes them either.

## What this does not claim

- It does not claim the changed non-audit paths were reviewed.
- It does not claim the portal lacks the artefact; it claims this tree has no record that carries an outlet name. A verification run against the portal still has to name the route it tried.
