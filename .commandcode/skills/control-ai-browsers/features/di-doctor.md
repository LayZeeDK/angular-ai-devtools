# DI doctor (N3)

The DevTools panel's "DI Doctor" tab queries an injector and renders the resolution path (`DiResolutionPath`) from
an `angular-ai:di-graph` message, with a path view and a diff view, and explains the result through the
panel-local Prompt API. The panel sends `angular-ai:di-query` (`componentName`, `elementTag`) and receives
`angular-ai:di-graph` with a `DiResolutionPath`.

## Sub-features

- `di-doctor`: query an injector, receive `angular-ai:di-graph` with a `DiResolutionPath`, render the resolution
  path / diff, and explain it through the panel-local Prompt API.

## How to get to it (user POV)

Open an Angular page, open DevTools, choose the "Angular AI" panel, select the "DI Doctor" tab, pick a component
in the component picker, then read the resolution path or switch to the Diff tab; press "Explain" for an
AI summary.

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served (the counter fixture below).

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL (`http://localhost:4222/` in the main checkout).
- **Drive N3.** Open the panel on the instance with `C panel <name> --url=http://localhost:4222/`, then select the
  "DI Doctor" tab, pick a component, and read the path/diff; "Explain" answers through the instance's model. The
  proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`.
- Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`,
  `di-diff-display.ts`; message types `angular-ai:di-query` / `angular-ai:di-graph`.

## Gotchas

- The path list is empty until a component is selected and a graph arrives.
- The Diff tab needs at least two resolution paths to compare.
- The panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission.