# RxJS interop explainer

The DevTools panel's "Interop" tab identifies the RxJS interop call behind a `toSignal` source in a supported
dev-mode Angular app, slices the signal-graph nodes that feed and consume it, and explains the slice through the
panel-local on-device Prompt API. The panel states the intrinsic limit of `ng.ɵgetSignalGraph`: it cannot name the
feeding Observable, the operator chain or emission timing. Field-to-node attribution is worded "inferred, untested".

## Sub-features

- `interop`: identify a `toSignal.source` / `toSignal.state` node and the unlabelled effect whose `debuggableFn`
  source contains `subject.error`, slice their direct producers and consumers, state the naming limits, word the
  field-to-node attribution "inferred, untested", and explain the slice through the panel-local Prompt API,
  returning a non-empty answer.

## How to get to it (user POV)

Open a supported Angular page that uses `toSignal`, open DevTools, choose the "Angular AI" panel, select the
"Interop" tab, read the sliced nodes and the stated limits (or the explicit empty state), then press "Explain" for
an AI summary of the chain.

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served whose route exercises `toSignal` (the insurance-portal fixture, or a dev-only route).

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL; use a portal page for the interop routes.
- **Drive interop.** Open the panel on the instance with `C panel <name> --url=<app url> --feature=interop`; the
  driver routes the panel to `interop`, waits for the slice or its explicit empty state, reads the slice node count,
  the stated limits and the "inferred, untested" wording, then clicks "Explain".
- Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` (the
  cannot-name statement), `interop-inferred` (the attribution wording), plus the shared `explain`, `ai-answer`,
  `empty-state` and `owning-component`.
- Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`; message types `angular-ai:interop`.

## Gotchas

- The panel loads only when shown, and the page announces Angular once, at load; reload after opening the panel.
- An edge never crosses the Observable: the slice stops at the interop node, and the panel must say so rather than
  imply it traced the Observable.
- Zero interop nodes renders an explicit empty state ("no interop nodes"), not a blank list.
- Field-to-node attribution compares values and is inferred only: the wording stays "inferred, untested".
- The panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission.
