# Review — wave 2, cycle 1

Wave: 2
Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1

Reviewed at head `8235badec4ea1ab93247dfab9745273ccd09b9b8` (a clean checkout; T003's declared base `505964f` precedes it, and `git diff --name-status 505964f..HEAD` shows exactly the five files the task declares — no `*.component.ts` changed). Both specs were re-run uncached in this checkout with `node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:test --skip-nx-cache --include=…` after `npm ci --include=dev`: `app-facts.spec.ts` → 20/20 passed, `extension-message.service.spec.ts` → 7/7 passed, exit 0 both times.

## T003 — Ship app_facts with its support checks through the registry: pass

- ✅ AC1: `app-facts.ts` declares `app_facts` via `defineTool` as `kind: 'read'`, `host: ['panel', 'extension-API']`, `outcome: 'result'`, `publish: 'model'`, and `provideAppFactsTool()` is the single line added to `app.config.ts` (diff shows only that provider line plus its import); the spec asserts `registry.tools()` lists it.
- ✅ AC2: the result value carries `supported`, the eight per-feature booleans (`APP_FACT_FEATURES`), `zoneMode`, `provenance: 'page-published'` on both the outcome and the value, and `devModeCaveats` with exactly two entries naming `getComponent`/`getDirectiveMetadata` as Tier-0 debug APIs that answer nothing outside dev mode — all asserted by the spec.
- ✅ AC3: `supportCheck(toolId, snapshot?)` is a pure exported function that defaults to `snapshot: null` and answers `supported: false` for a null snapshot, a `supported: false` page record, a `false` or unpublished feature bit, an unknown id, and the two dev-mode-gated APIs. I read the branch structure adversarially: the only paths to `supported: true` are `app_facts` itself once the page has spoken, and a feature bit the page published as `true` — there is no default-true path, and every `false` answer carries a non-empty reason naming the missing fact or the restriction plus the page channel (`angular-ai:state`) as source.
- ✅ AC4: `ExtensionMessage` now declares `features` and `zoneMode`; the service keeps both as readonly signals (`null` while unpublished), keeps the existing `supported`/`notSupported` behaviour untouched, and the spec's `keeps the features map and zone mode the page publishes with angular-ai:state` proves both survive the wire; no `*.component.ts` file is in the diff.
- ✅ AC5: with no page record (or a facts record without a boolean `supported`), `execute('app_facts')` answers `{ kind: 'error', code: 'host-unavailable', toolId: 'app_facts' }` whose message states it is not a claim that the app is unsupported — never an empty result and never `supported: false`; a published `supported: false` with a reason returns a `result` carrying that reason. Both sides asserted by the spec.
- ✅ AC6: the backing labels the outcome and the value `page-published` regardless of what the caller claims — the spec executes with a `provenance: 'panel'` context and asserts both labels stay `page-published`, so the provenance never echoes the caller and never reads `panel`.
- ✅ Re-run: `…/app-facts.spec.ts` → 20 tests passed uncached; `…/extension-message.service.spec.ts` → 7 tests passed uncached (Nx `Successfully ran target test`, cache skipped).

## Intent coverage

Wave 2 owns SC3 only, and within SC3 only T003's half: `app_facts` declared through the envelope and reachable through the registry, with the support checks and the dev-mode caveat it reports. The rest of SC3 — the five read wrappers (`find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata`, `getComponent`) and the E4 reach guard that makes "no caller reaches around it" an observation — is T004's work in wave 3 and is not judged here.

### SC3 — `app_facts`, `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are reachable through the registry, and no caller reaches around it.: pass

(T003's half only — the registry reach of `app_facts`; the remaining wrappers and the reach guard are wave 3, T004.)

- ✅ `app_facts` is reachable only through the envelope: it is registered via `provideTools(appFactsTool)` in `app.config.ts`, the spec asserts `registry.tools()` lists it and `registry.execute('app_facts', …)` answers through `TOOL_REGISTRY`; the backing `readAppFacts` is module-private, so no caller can invoke the read directly, and the module imports nothing beyond `@angular/core` and `./tool-registry`.

## Findings

Non-blocking advisories (verdict unchanged):

1. **Provenance is asserted, not derived (advisory).** The backing hardcodes `provenance: 'page-published'` for any facts record that parses (a boolean `supported` is the only gate), independent of the caller's `ToolContext.provenance`. Today that is honest — the only producer of this shape is the page's `angular-ai:state` record and nothing in the shipped panel builds such facts — but nothing structural prevents a future panel-side caller from fabricating the shape and receiving a `page-published` label. When T004's page-read port or M019's transport lands, provenance should be derived from the declared channel rather than asserted unconditionally. No test or shipped code path exercises that hole today.
2. **No production caller wires the facts channel yet (advisory).** `ExtensionMessageService.features()/zoneMode()` now keep the page record, but nothing in the shipped panel yet builds a `ToolContext.facts` from those signals and calls `execute('app_facts')`; a real call in the shipped panel today answers `host-unavailable`. This matches the plan (the page-request transport is explicitly out of M018's scope and wave 2 calls this the thinnest slice), but the wire from service signals to tool context is still open work to land in wave 3/4.
3. **Cosmetic duplication.** `readFeatureBits` exists twice with slightly different semantics: the module-private copy in `extension-message.service.ts` (booleans only, `null` for absent) and the one in `app-facts.ts` (eight fixed keys, `boolean | null`). Both are correct for their call sites; a later wave could share one helper. No action required for this milestone.
