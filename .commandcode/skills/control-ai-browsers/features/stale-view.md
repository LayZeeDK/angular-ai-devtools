# Stale view

The DevTools panel's "Stale View" tab scans a supported dev-mode Angular app for bindings whose template may show a
stale value, maps each to its field name and owning component, and explains the finding through the panel-local
on-device Prompt API. The panel sends the hedged wording "the template may show a stale value", the field name and
the owning component; the answer renders in the panel.

## Sub-features

- `stale-view`: scan for stale-view findings, report the field name and owning component, and explain a finding
  through the panel-local Prompt API, returning a non-empty answer.

## How to get to it (user POV)

Open a supported Angular page, open DevTools, choose the "Angular AI" panel, select the "Stale View" tab, then read
the findings (or the explicit empty state); press "Explain" for an AI summary.

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served.

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL (`http://localhost:4222/` in the main checkout).
- **Drive stale-view.** Open the panel on the instance with `C panel <name> --url=http://localhost:4222/ --feature=stale-view`;
  the driver routes the panel to `stale-view`, waits for the finding list or its explicit empty state, reads the
  hedged wording "the template may show a stale value", the field name and the owning component, then clicks
  "Explain".
- Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts`; no runtime message type.
  The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`) and the
  component sends no message, so `angular-ai:stale-view` does not exist.

## Gotchas

- The panel loads only when shown, and the page announces Angular once, at load; reload after opening the panel.
- With zero findings the panel renders an explicit empty state ("no stale-view findings"), not a blank or stale list.
- Unsupported Angular versions report an explicit unsupported state; a destroyed signal graph reports unavailable.
- The panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission.
