# Inspect delta — M034 lint-legacy

Audit in force: `DOCS-AUDIT.md` at `d621a3f`, 144 documents, 533 claims.
Measured 2026-11-06 before planning M034.

## Audited documents changed since the audit base

- plans/angular-ai-devtools-program-backlog.md

## Non-audit paths changed (code, fixtures, scripts)

- .commandcode/skills/control-angular-dev-app/features/.proven.json
- .commandcode/skills/control-angular-devtools/features/.proven.json
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/panel-lint.ts
- apps/angular-ai-devtools/src/app/panel-router.ts
- extension/lint-core.js
- extension/router-diagnostic.js
- research/raw/m022-ng-context.json
- research/raw/m030-router-config.json
- research/raw/m032-console-diagnostics.json
- research/raw/m032-verdict-claims.json
- research/raw/m033-router-diagnostic.json
- research/raw/m033-verdict-claims.json
- scripts/after-render-fixture.test.mjs
- scripts/autonomy-gaps.test.mjs
- scripts/docs-audit-disposition.test.mjs
- scripts/lint-core.test.mjs
- scripts/lint-observability.test.mjs
- scripts/panel-lint.test.mjs
- scripts/panel-router.test.mjs
- scripts/panel-routes.test.mjs
- scripts/router-config-capture.test.mjs
- ... and 6 more

## Verdict

No audited document changed, so every claim in the audit still holds and none is
contradicted by this delta. The non-audit paths are code and fixtures, which the
documentation audit does not cover: planning reads them directly.

This is not a claim that the code was audited.
