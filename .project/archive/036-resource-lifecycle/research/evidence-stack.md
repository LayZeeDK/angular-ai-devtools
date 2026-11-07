# Evidence — stack

Dimension: stack
Questions assigned: Which resource fields does the graph label on this fixture's build, and are they present for resource, rxResource and httpResource alike?

## Finding: the labels are signal debug names, built as `Resource#<name>.<field>`

- **Claim**: a resource's internal signals carry a `debugName` of the form `Resource#<name>.<field>`, or `Resource.<field>` when the resource was created without a `debugName`.
- **Source**: `node_modules/@angular/core/fesm2022/_resource-chunk.mjs:514-517` — `return { debugName: \`Resource${resourceDebugName ? '#' + resourceDebugName : ''}.${internalSignalDebugName}\` };`
- **Confidence**: high
- **Why it matters here**: the finding must name the resource the way the graph names it. A friendlier name would be invented, which SC5's prohibition forbids.

## Finding: eight fields are labelled, including `state`, `status`, `error`, `isLoading` and `extRequest`

- **Claim**: the labelled internal signals are `isLoading`, `value`, `extRequest`, `state`, `status`, `error`, `loadEffect` and `stream`; `state`'s value is `{extRequest, status, previousStatus, stream}` and `extRequest`'s is `{request, reload}` or `{status, reload}` or `{error, reload}`. Computed signals such as `hasValue` and `isError` get no `debugName`, so they are not separate nodes.
- **Source**: `_resource-chunk.mjs:168` (`isLoading`), `:238` (`value`), `:279` (`extRequest`), `:317-321` (`state` shape), `:324` (`state`), `:329` (`loadEffect`), `:333` (`status`), `:337` (`error`).
- **Confidence**: high
- **Why it matters here**: the explainer's whole answer — loading versus errored versus idle — is carried by `status` and `state`, and both are already labelled, so no new page-side instrumentation is required to read them.

## Finding: `rxResource` and `httpResource` produce the same resource nodes

- **Claim**: `rxResource` delegates to `resource(...)`, and `HttpResourceImpl extends _ResourceImpl` and forwards to `super(..., debugName, ...)`, so both inherit the identical `Resource#…` node set; `httpResource` adds http-only nodes labelled `_headers`, `_progress`, `_statusCode` and `headers`.
- **Source**: `node_modules/@angular/core/fesm2022/rxjs-interop.mjs:210-214` — `return resource({...})`; `node_modules/@angular/common/fesm2022/http.mjs:430,528` — `super(..., debugName, ...)`; the http-only labels at `http.mjs:433,440,447,454`.
- **Confidence**: high
- **Why it matters here**: one read covers all three constructors, so the milestone does not need a per-constructor branch.

## Finding: the labels surface through `ɵgetSignalGraph`, not `ɵsetProfiler`

- **Claim**: node labels come from `consumer.debugName` when the graph is built, and the graph hook is `ɵgetSignalGraph`; `ɵsetProfiler` registers a change-detection timing callback `(event, instance?, eventFn?)` and does not carry labels.
- **Source**: `_debug_node-chunk.mjs:12252,12261,12277` (labels read from `debugName`); `:12563-12564` (both hooks exported); `:144-159` (`ɵsetProfiler` registration and callback shape).
- **Confidence**: high
- **Why it matters here**: it contradicts `research/08-recent-angular-features.md:170`, which says the labels are "sampled by the page agent per CD cycle (`ɵsetProfiler`)". The milestone must read the graph, not the profiler, and the research document's sentence is wrong on this point.

## Finding: the minimum version for the labels is not establishable from the installed packages

- **Claim**: neither installed `@angular/core` ships a CHANGELOG and no source comment cites an introduction version, so the "Angular 20.1+" claim at `research/08-recent-angular-features.md:171` is unverified; only that these symbols exist in 22.1.8 and 22.2.2 is confirmed.
- **Source**: absence of a CHANGELOG in `node_modules/@angular/core`, and the absence of a version comment at `_resource-chunk.mjs:514-517`.
- **Confidence**: high
- **Why it matters here**: the milestone may claim support on 22.x with evidence, and must not repeat a version floor it cannot show. The confidence above refers to the floor being unverified; the true first version remains unknown.

## Assigned questions — answers

- Which resource fields does the graph label on this fixture's build, and are they present for resource, rxResource and httpResource alike? → Eight fields, including `state`, `status`, `error`, `isLoading` and `extRequest`; all three constructors produce the same `Resource#<name>.<field>` set, with `httpResource` adding four http-only nodes.

## Dead ends

- No CHANGELOG in either installed package, so the version floor cannot be established from the dependency.
- `ngDevMode` gates the debug-name creation (`ngDevMode ? createDebugNameObject(...)`), so labels may vanish in a production build; not tested here because the panel only supports development builds.
