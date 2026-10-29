# Signal provenance (N2)

The DevTools panel's "Signal Provenance" tab renders the provenance chain for a recorded component and detects
anti-patterns, driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`,
`src/main-world/provenance-tracer.ts`). The chain lists producer/consumer/self steps with kind, label and
position; anti-pattern findings render when two snapshots differ. "Explain" asks the panel-local Prompt API about
the chain and findings, with a cached answer for an unchanged selection.

## Sub-features

- `signal-provenance`: the chain renders from `angular-ai:record` facts, with anti-pattern findings and an
  "Explain" answer through the panel-local Prompt API.

## How to get to it (user POV)

Open an Angular page, open DevTools, choose the "Angular AI" panel, select the "Signal Provenance" tab, reload
the page so the panel records the Angular version and the page tracer emits `angular-ai:record`, pick a
component in the component picker, then press "Explain".

## Driving it with control-ai-browsers

Preconditions: the README baseline; the panel built (`npx nx run angular-ai-devtools:build-extension`); an Angular
dev page served (the counter fixture below).

- **Build the panel.** `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`.
- **Start an Angular page.** `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter`
  prints the URL (`http://localhost:4222/` in the main checkout).
- **Drive N2.** Open the panel on the instance with `C panel <name> --url=http://localhost:4222/`, then select the
  "Signal Provenance" tab and a component in the picker; the chain and findings render, and "Explain" answers
  through the instance's model. The proof across every pair is
  `verify-ai-browsers/checks/signal-provenance.mjs`.
- The page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`; the fact list
  is the `angular-ai:record` message handled by `ExtensionMessageService`.

## Gotchas

- The panel loads only when shown, and the page announces Angular once, at load; reload after opening the panel.
- The component picker is empty until at least one `angular-ai:record` cycle arrives for the inspected tab.
- "Explain" is disabled while the Prompt API is unavailable; the availability reason is shown instead.
- The panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission.