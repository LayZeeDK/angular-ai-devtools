# Error explainer (N4)

The DevTools panel's "Error Explainer" tab captures `NG0xxx` and uncaught console errors from a supported dev-mode
Angular app, maps each to its owning component through `ng.getOwningComponent`, and explains the error from a digest
of the official `angular.dev/errors` documentation bundled at extension build time, using the panel-local on-device
Prompt API. The panel sends the error code, the owning component name and the matching digest entry; the answer
renders in the panel.

## Sub-features

- `error-explainer`: capture an `NG0xxx` error, resolve its owning component and the matching digest entry, and
  explain it through the panel-local Prompt API, returning a non-empty answer.

## How to get to it (user POV)

Open an Angular page that throws (or trigger one), open DevTools, choose the "Angular AI" panel, select the "Error
Explainer" tab, then read the captured error, its owning component and the digest entry; press "Explain" for an
AI summary.

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served (the counter fixture below).

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL (`http://localhost:4222/` in the main checkout).
- **Drive N4.** Open the panel on the instance with `C panel <name> --url=http://localhost:4222/ --feature=error-explainer`;
  the driver injects a captured `NG0100` error, reads its code, owning component and digest entry, then clicks
  "Explain". The proof across every pair is `verify-ai-browsers/checks/error-explainer.mjs`.
- Implementation: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`;
  message type `angular-ai:error-capture` only. The explain step runs in the panel
  (`src/panel/error-explainer-view.ts` calls `shouldCallModel`) and sends no message, so
  `angular-ai:error-explain` does not exist.

## Gotchas

- The panel loads only when shown, and the page announces Angular once, at load; reload after opening the panel.
- An error with no owning component reports "no owning component" and is never attributed to an unrelated component.
- With zero captured errors the panel renders an explicit empty state, not a blank or stale list.
- An error code with no digest entry yields an explicit "no digest entry" answer; the model is not asked to invent one.
- The panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission.
