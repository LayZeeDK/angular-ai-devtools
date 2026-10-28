# Evidence — capability-map

Dimension: capability-map
Questions assigned: Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation?

## Finding: N4 error explainer is unbuilt; only primitives and digest inputs exist

- **Claim**: No Angular error explainer (N4) component or error-hook code exists in `src/`, `apps/`, or `extension/`; the feature is described only in `docs/feature-proposals.md` (lines 586-610) and `docs/design/tutor.md`, and the proposed inputs (bundled offline error digest, `console.error` hook, owning-component mapping) must be built.
- **Source**: docs/feature-proposals.md:586-591; grep across src/apps/extension returned no error-explainer implementation.
- **Confidence**: high
- **Why it matters here**: N4 is the first feature in the program priority order after the tooling item, and nothing in the shipped app currently captures `NG0xxx` errors.

## Finding: N24 stale-view detection is provable from `ng.ɵgetSignalGraph` plus a source regex; no new instrumentation

- **Claim**: On the counter fixture, the component's template node's `debuggableFn` exposes the whole class source, a regex finds `subscribe(() => (this.plain = ...)`, and `ng.isSignal(cmp.plain)` is false; the DOM stayed stale while the instance held the new value until an unrelated click (measured `research/raw/stale-view-counter.json`, `13652e0`).
- **Source**: docs/feature-proposals.md:790-793; docs/feature-proposals.md:788 (22.1.3 gate)
- **Confidence**: high
- **Why it matters here**: N24 needs no new Angular API or instrumentation beyond the Tier 1 `ɵgetSignalGraph` already used by N2; only the regex and `ng.isSignal` check must be coded.

## Finding: N25 interop nodes are readable from the graph but Observable-side causality is unprovable

- **Claim**: `toSignal`/`toObservable` nodes are identifiable by their `toSignal.*` labels and an effect whose `debuggableFn` contains `subject.error`, and their producers/consumers can be sliced from the graph; no edge crosses the Observable, so N25 cannot name the feeding Observable, operator chain, or emission timing.
- **Source**: docs/feature-proposals.md:801-810; research/raw/tosignal-node-portal.json (cited in feature-proposals line 804)
- **Confidence**: high
- **Why it matters here**: N25's deterministic slice is buildable from existing `ɵgetSignalGraph` data; the "cannot explain" limits are intrinsic to Angular's graph and need no instrumentation, but mapping a node to its component field by value comparison is inferred and untested.

## Finding: Tooling item touches install scripts, tsconfig, AGENTS, and the guarded installer

- **Claim**: Nine `install-*-command-code.mjs` scripts live in `scripts/`; `tsconfig.json` includes only `scripts/install-pstack-opencode.mjs`, its test, and `scripts/opencode-pstack-plugin.ts`; `package.json` test glob is `scripts/**/*.test.mjs`; the guarded review-panel family patch (beam, glyph, laguna, glm) is not present anywhere in the installer; AGENTS.md references `scripts/` paths for the sidecar bridge and skill mirror.
- **Source**: package.json:9; tsconfig.json:5-9; AGENTS.md:16,37-40; glob scripts/install-*.mjs (9 files); grep for beam/glyph/laguna/glm in scripts/install-gsd-path-command-code.mjs returned no matches
- **Confidence**: high
- **Why it matters here**: The move requires updating the test glob, tsconfig include, AGENTS references, and cross-imports (`scripts/opencode-pstack-plugin.ts`), and adding the guarded family patch to the installer before `detected`/named panels can express this host's routes.

## Assigned questions — answers

- Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation? → N24's stale plain-field write in a `subscribe` callback is provable from the template node's `debuggableFn` plus `ng.isSignal` on the counter fixture with no new instrumentation. N25's interop node identification and graph slice are provable from existing `ɵgetSignalGraph` node labels and `debuggableFn`; Observable-side causality is intrinsically unavailable and needs no instrumentation, while field-to-node mapping by value comparison remains untested and unproven.

## Dead ends

- scripts/install-gsd-path-command-code.mjs — searched for review-panel family constants; none present, so the guarded patch must be added rather than reconfigured.