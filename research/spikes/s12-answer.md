# S12 — Does a sourcemap plus worker-side AST index create a NEW INSIGHT CLASS - code-level facts no runtime surface can produce - rather than removing opt-in instrumentation?

Settled premise, not re-derived here: for the sixteen shipped features a map changes nothing
(`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3).
This spike measures **new capability only**.

Recorded: 2026-11-08
Target: `HaasStefan__ng-journal-insurance-portal-ai-devtools` @ `claude/ai-devtools-spike` = `92d46ec051e2d026cd408826f2e1b25192147550`
Host: Windows, node v24.22.0, portal on Angular 22.2.2 / Nx 23.1.1

Verdict: **the insight class is real but its prerequisite is an application-side build flag this
application does not set.** On the portal as configured, a production build ships **no map at all**
(0 files, 0 bytes) — the capability is a named absence, not a measured cost. With `sourceMap` forced
on, AOT preserves **template** mapping at construct precision (element / attribute / `@if` / text
node / interpolation delimiters) and **not** at expression-token precision, so "which binding on
which template line" is obtainable and "which sub-expression inside the binding" is not. The worker
parse is cheap on the current WASM runtime (232 kB → 42–72 ms, +22 MB) and the whole panel index
costs 303 ms / 93.5 MB. The ceiling is elsewhere: values, timing, instantiation and events stay
impossible.

## Question

Four things had to be measured, in this order:

1. Does the zoneless portal's **production** build ship a resolvable `main-*.js.map`, how big is it,
   and is `sourcesContent` embedded?
2. Does AOT preserve **template** mapping at expression precision, or only component granularity —
   the fact that decides whether a rendered node can be traced to a template line?
3. Can `web-tree-sitter` with TypeScript and HTML grammars run here, at what wall clock and peak
   memory per bundle?
4. What does the same parse cost against this repository's production panel build?

## Answers

### 1. Does the zoneless portal ship a map? — **No. 0 `.map` files, 0 bytes, no `sourceMappingURL`.**

The production configuration of `apps/insurance-portal/project.json` sets `sourceMap` **only** in
`development`:

```json
"development": {
  "optimization": false,
  "extractLicenses": false,
  "sourceMap": true,
  "namedChunks": true
}
```

and `apps/insurance-portal/project.json` is the only `project.json` in the workspace that mentions
`sourceMap` at all. Measured on a cache-skipped production build (`--skip-nx-cache`, bundle
generation 2.773 s, Nx run duration 3.9 s, wall 6.9 s):

- `chunk_count_js=32`, `total_js_bytes=1189228`
- `map_count=0`, `total_map_bytes=` (no files)
- `main_file=main-5ATUGBNQ.js`, `main_len=232151`
- `files_with_sourceMappingURL=0`; last 120 characters of `main-5ATUGBNQ.js`:
  `[ as g,si as h,Qr as i,Bi as l,li as m,Q as n,Xr as o,ki as p,ce as r,Yr as s,E as t,Dn as u,xn as v,I$1 as x,xt$1 as y};]`

So the answer to the shipped question is a named absence: **`no-sourcemap` for every chunk of the
zoneless portal's production build.** A map exists only as an app-side build decision.

**The same build with `--sourceMap=true`** (a CLI flag, no file edited) shows what a map would cost
and contain — this is the artefact measurement 2 is performed on:

- `js_files=32`, `total_js_bytes=1192298`, `map_files=35`, `total_map_bytes=**5598880**` (4.70 × the JS)
- `main_map=main-RQ7DDMZR.js.map bytes=**825829**` for `main_js=232378` bytes (3.55 ×)
- the bundle ends `//# sourceMappingURL=main-RQ7DDMZR.js.map` and `map_exists_beside=True` —
  the URL resolves as a sibling.
- `sources`: 353 entries across the 35 maps; `sourcesContent` non-null for **353 / 353**;
  `maps_with_zero_sources=0`, `maps_with_partial_content=0`.
- `sources_resolving_on_disk=0` of 353 (`app_sources_total=76`, `app_sources_resolving=0`): the map's
  paths are relative to the build output, not the source tree. **`sourcesContent` is the only way to
  read the original text** — a consumer that gets a map without it gets no text at all.

### 2. Does AOT preserve TEMPLATE mapping at expression precision? — **Template yes, expression no.**

Template presence first, because the portal uses **inline** templates everywhere:

- `.html` sources: `html_entries=0` of 353; `ng_scheme=0`; `template_named=0` — **no `.html` and no
  synthetic `ng://` names**;
- `templateUrl_hits=0` across `apps/` and `libs/` — the portal has no external template, so the only
  place a template can appear in a map is the template literal inside its component `.ts`.

Concrete component: `libs/contract/ui/src/lib/contract-form.component.ts`, nine bindings, inline
template spanning lines **30–95** of the `.ts`. From the map of its lazy chunk
(`chunk-DVYlxUtw.js.map`):

```
source_index=4
source_name=../libs/contract/ui/src/lib/contract-form.component.ts
sourcesContent_length=3683
sourcesContent_equals_disk=true
mappings_in_component=687
distinct_original_lines=54
min_original_line=18 max_original_line=107
distinct_original_lines_inside_template_30_95=37
mapped_original_lines_inside_template=[30,32,33,34,37,38,40,42,43,46,47,49,52,54,55,56,59,60,62,64,65,67,69,70,71,75,77,78,80,82,83,84,86,87,89,92,94]
```

`distinct_template_segments=164` for that template. The mappings resolved, quoted (generated →
original, with the original text under the mapped column):

```
 30:14   ɵɵelementStart  gen 55:1924  "<form [formRoot]=\"form()\" clas"
 30:20   ɵɵproperty      gen 55:2326  "[formRoot]=\"form()\" class=\"gri"
 30:20   ctx             gen 55:2340  "[formRoot]=\"form()\" class=\"gri"
 32:6    ɵɵconditionalCreate gen 55:1950  "@if (isEditMode()) {"
 33:32   ɵɵtext          gen 55:324   "Status</label>"
 37:10   ɵɵproperty      gen 55:431   "[options]=\"statusOptions\""
 38:10   ɵɵcontrolCreate gen 55:364   "[formField]=\"$any(form().statu"
 42:8    ɵɵconditionalCreate gen 55:374  "@if (form().status().invalid()"
 43:38   ɵɵtext          gen 55:247   "Input is required. </span>"
 59:8    ɵɵproperty      gen 55:2398  "[options]=\"customers()\""
 60:8    ɵɵcontrolCreate gen 55:2046  "[formField]=\"$any(form().custo"
 84:6    ɵɵelementStart  gen 55:2255  "<p-datepicker"
```

Round trip in both directions:

```
allGeneratedPositionsFor(<form tag @30:10)=[{"line":55,"column":1924},...]
roundtrip gen 55:1924 -> {"source":"../libs/contract/ui/src/lib/contract-form.component.ts","line":30,"column":14,"name":"ɵɵelementStart"}
roundtrip-expr gen 55:1939 -> {"source":"...contract-form.component.ts","line":30,"column":72,"name":null}
```

Generated text at that instruction (`main`-style minified AOT, quoted from
`chunk-DVYlxUtw.js` line 55, cols 1900–2010):

```
"ate:function(n,r){n&1&&(mi(0,`form`,0)(1,`div`,1),NI(2,Ke,4,6)(3,Le,3,2),Sc(),mi(4,`div`,1)(5,`label`,2),wD(6,"
```

**Where precision stops.** For every binding in that template, the column where the *expression text*
begins has no segment:

```
line 30 expr="form()"                exprCol=32 segments_at_exact_col=0 columns_on_line=[14,20,72]
line 37 expr="statusOptions"         exprCol=21 segments_at_exact_col=0 columns_on_line=[10,35]
line 38 expr="$any(form().status)"   exprCol=23 segments_at_exact_col=0 columns_on_line=[10]
line 42 expr="form().status().invalid()" exprCol=13 segments_at_exact_col=0 columns_on_line=[8]
line 49 expr="pendingStatus"         exprCol=19 segments_at_exact_col=0 columns_on_line=[10]
line 59 expr="customers()"           exprCol=19 segments_at_exact_col=0 columns_on_line=[8,31]
line 60 expr="$any(form().customer)" exprCol=21 segments_at_exact_col=0 columns_on_line=[8]
line 75 expr="form().policyNumber"   exprCol=21 segments_at_exact_col=0 columns_on_line=[8]
line 86 expr="$any(form().insuranceStartOn)" exprCol=21 segments_at_exact_col=0 columns_on_line=[8]
```

The columns that *are* present are the construct boundaries: `[formRoot]` at col 20 (attribute name)
and col 72 (the tag's closing `>`, the binding value's span end); `[options]` at 10 and 35. Inside an
`@if`, only the `@if` token maps (col 8), never the condition — line 90, the condition's second line,
carries no segment at all (`distinct_original_lines_inside_template` skips 90).

Interpolations behave the same way (`libs/contract/feature-list/src/lib/list.component.ts`, 459
segments for the file):

```
line 42 cols=[16,43] exprCol=19 segments_at_exprCol=0 names=["ɵɵtext","-","ɵɵelementEnd","ɵɵadvance","ɵɵtextInterpolate","contract_r1"]
    text="<td>{{ contract.policyNumber }}</td>"
line 49 cols=[12,16,54] exprCol=19 segments_at_exprCol=0 names=["ɵɵelementStart","-","ɵɵtext","ɵɵelementEnd","ɵɵadvance","ɵɵtextInterpolate","ɵɵpipeBind1","contract_r1"]
    text="<td>{{ contract.insuranceStartOn | date }}</td>"
```

col 16 is `{{`, col 43/45/54 is past `}}`, and the expression's *identifier* survives only as a
mapping **name** (`contract_r1`, `contract`) attached to the closing boundary — its text has to be cut
out of `sourcesContent` at the mapped span.

**Answer, stated as the brief asks:** a rendered node's expression can be traced to a **template
line/column** — `[formRoot]` on line 30 of `contract-form.component.ts`, `ɵɵtextInterpolate` on line 42
of `list.component.ts` — and **not** to a position inside the expression. The claim "this component
was checked because of the `[formField]="form().status"` binding on line 38" is supportable; the claim
"…because `form().status` returned invalid" is not, because sub-expression positions do not exist in
the map.

### 3. Can `web-tree-sitter` run here? — **Yes, with a version-pinned grammar pair.**

`web-tree-sitter` **0.27.2** (latest) initialises its WASM runtime here in 6.4–9.2 ms, but
`Language.load()` on `tree-sitter-wasms@0.1.13` throws from `getDylinkMetadata`:

```
Error
    at failIf (.../web-tree-sitter.js:1949:28)
    at getDylinkMetadata (.../web-tree-sitter.js:1966:7)
    at Object.loadWebAssemblyModule (.../web-tree-sitter.js:2290:20)
    at Language.load (.../web-tree-sitter.js:1517:25)
```

Direct header inspection explains it — the two packages emit different wasm dyldlink sections:

```
tree-sitter-wasms/out/tree-sitter-typescript.wasm  hdr= asm ... dylink ???     (old `dylink`)
@vscode/tree-sitter-wasm/wasm/tree-sitter-typescript.wasm hdr= dylink.0 ...    (`dylink.0`)
```

Grammar availability, measured from the packages' file listings:

- `tree-sitter-wasms@0.1.13`: 37 grammars including **`tree-sitter-typescript.wasm` 2342690 B and
  `tree-sitter-html.wasm` 18468 B** — but old-format `dylink`, so only loadable by web-tree-sitter
  **0.24.x**.
- `@vscode/tree-sitter-wasm`: 17 wasms (`dylink.0`, loadable by 0.27.2) including TypeScript and TSX —
  and **no HTML grammar**.
- **No Angular-template grammar for any `web-tree-sitter`.** `tree-sitter-angular@0.9.2` exists on npm
  but is a native addon: `dependencies = { node-addon-api, node-gyp-build, tree-sitter-html }`,
  `scripts = { install: 'node-gyp-build', build: 'tree-sitter generate && node-gyp-build' }`, and
  `npm pack --dry-run` lists `binding.gyp` with **no `.wasm`**.

So the working pair for the full TypeScript + HTML set is **web-tree-sitter 0.24.7 + tree-sitter-wasms
0.1.13**, which loads both:

```
web_tree_sitter=0.24.7  tree_sitter_wasms=0.1.13  node=v24.22.0
wasm_runtime_init_ms=7.4
typescript_grammar_loaded=true load_ms=4.4
html_grammar_loaded=true load_ms=1.0
```

**Cost to parse the largest portal chunk** (`main-RQ7DDMZR.js`, **232378 bytes**), three fresh
processes so peak memory is not carried across runs:

```
{"webTreeSitter":"0.24.7","bytes":232378,"initMs":7.6,"grammarLoadMs":4,"rssBaselineMB":69.1,
 "results":[{"parseMs":74.9,"walkMs":28.5,"nodes":95921,"hasError":false,"rssBefore":69.1,"rssAfter":357.5,"maxRssMB":357.6}]}
{"webTreeSitter":"0.24.7","bytes":232378,"initMs":10.7,"grammarLoadMs":4.5,"rssBaselineMB":69,
 "results":[{"parseMs":84.7,"walkMs":23.3,"nodes":95921,"hasError":false,"rssBefore":69,"rssAfter":369.3,"maxRssMB":369.4}]}
{"webTreeSitter":"0.24.7","bytes":232378,"initMs":8.1,"grammarLoadMs":4.9,"rssBaselineMB":68.9,
 "results":[{"parseMs":87.5,"walkMs":24.2,"nodes":95921,"hasError":false,"rssBefore":69,"rssAfter":353.8,"maxRssMB":354.1}]}
```

Node count for that file: **95,921** (grammar 0.24 pair). Peak RSS **353.8–369.4 MB** from a 69 MB
baseline — **≈ 285 MB per parse of a 232 kB file**, and it is *not* returned between parses:

```
ws24 x3: run1 maxRssMB 351.9 / run2 701.3 / run3 1029.5
```

The same file on the **0.27.2 + `@vscode/tree-sitter-wasm`** pair (TypeScript only, no HTML) is a
different cost class, and flat across repeats:

```
{"impl":"ws27","webTreeSitter":"0.27.2","bytes":232378,"initMs":7.5,"grammarLoadMs":4.7,"rssBaselineMB":66.4,
 "results":[{"parseMs":71.7,"nodes":95900,"maxRssMB":89.7},
            {"parseMs":43.6,"nodes":95900,"maxRssMB":89.7},
            {"parseMs":44.6,"nodes":95900,"maxRssMB":89.7},
            {"parseMs":41.7,"nodes":95900,"maxRssMB":89.7},
            {"parseMs":42.2,"nodes":95900,"maxRssMB":89.7}]}
```

= **41.7–71.7 ms, +22 MB peak**, 95,900 nodes (21 fewer than the 0.24 grammar — different grammar
version, not a parser defect).

A **module worker** (`worker_threads`, `type: 'module'`) runs the whole path off the main thread:

```
{"worker":"module (worker_threads, type=module)","roundTripMs":423.2,"file":"chunk-B8BF8DsE.js",
 "bytes":326561,"runtimeLoadMs":30.5,"parseMs":220.9,"nodes":221750,"hasError":false,
 "workerRssMB":100.5,"peakMB":103.2}
```

The HTML grammar loads, but **it is not the right grammar for an Angular template.** On the real
inline template of `contract-form.component.ts` (2,092 bytes):

```
html_on_angular_template bytes=2092 parse_ms=1.9 nodes=416 hasError=true
```

`hasError=true` — the HTML grammar rejects `@if`, `[formField]` and the rest of the Angular syntax.
Using it would produce error nodes exactly where the interesting constructs are, i.e. the feature that
needs an AST (`@if` branches, structural directives) is the one that grammar cannot parse. There is no
alternative here: the only Angular-template grammar on npm is a native addon.

### 4. Production panel build cost — **624,247 bytes, 303.4 ms, 93.5 MB peak.**

`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`: bundle generation 3.318 s, Nx run
duration 5.1 s, wall **10.1 s**, with a pre-existing budget warning (`initial exceeded maximum budget.
Budget 520.00 kB was not met by 15.50 kB with a total of 535.50 kB`). Output:

```
panel_js_files=30  panel_js_bytes=624247  maps=0  has_sourceMappingURL=False
largest=chunk-B8BF8DsE.js 326561
```

Largest panel chunk (`chunk-B8BF8DsE.js`, **326561 bytes**), three fresh processes:

```
{"bytes":326561,"initMs":8.3,"grammarLoadMs":5.2,"rssBaselineMB":67.1,"results":[{"parseMs":139.6,"walkMs":47.9,"nodes":221750,"hasError":false,"rssAfter":92.8,"maxRssMB":92.9}]}
{"bytes":326561,"initMs":7.9,"grammarLoadMs":5.3,"rssBaselineMB":66.8,"results":[{"parseMs":137.4,"walkMs":46.4,"nodes":221750,"hasError":false,"rssAfter":91.3,"maxRssMB":92.8}]}
{"bytes":326561,"initMs":8.8,"grammarLoadMs":5.4,"rssBaselineMB":66.9,"results":[{"parseMs":142.5,"walkMs":45.1,"nodes":221750,"hasError":false,"rssAfter":92.2,"maxRssMB":92.2}]}
```

Whole panel output directory, one process:

```
{"impl":"ws27","webTreeSitter":"0.27.2","files":30,"bytesParsed":624247,"totalParseMs":303.4,
 "nodes":352542,"filesWithErrorNodes":0,"rssBaselineMB":65.5,"rssAfterMB":91.3,"peakMB":93.5}
```

For scale, the same harness over the portal's whole production bundle:

```
{"impl":"ws27","files":32,"bytesParsed":1189228,"totalParseMs":426.5,"nodes":590124,
 "filesWithErrorNodes":0,"rssBaselineMB":65.6,"rssAfterMB":83.2,"peakMB":86.9}
```

So an index over either application's entire production JS is **under half a second and under 100 MB**
on the 0.27 runtime: 426.5 ms for 1.19 MB (portal), 303.4 ms for 0.62 MB (panel), 0 files with error
nodes in either. On the 0.24 runtime — the only one with an HTML grammar — the same work costs
~285 MB per 232 kB, which for the portal's 1.19 MB is ~1.4 GB by extrapolation and was measured growing
to 1,029.5 MB after three parses of a single chunk.

## Commands and output

Portal checkout verified first:

```
> git rev-parse HEAD
92d46ec051e2d026cd408826f2e1b25192147550
> git branch --show-current
claude/ai-devtools-spike
```

**(1) production build, as configured**

```
> node node_modules/nx/dist/bin/nx.js build insurance-portal --configuration=production --skip-nx-cache
...
Application bundle generation complete. [2.773 seconds] - 2026-11-08T20:12:16.402Z
Output location: D:\...\dist\apps\insurance-portal
  Run duration:      3.9s
WALL_SECONDS=6.9
```

```
chunk_count_js=32
total_js_bytes=1189228
map_count=0
total_map_bytes=
main_file=main-5ATUGBNQ.js  main_len=232151
files_with_sourceMappingURL=0
main_tail_120=[ as g,si as h,Qr as i,Bi as l,li as m,Q as n,Xr as o,ki as p,ce as r,Yr as s,E as t,Dn as u,xn as v,I$1 as x,xt$1 as y};]
```

`sourceMap` appears in exactly one project file, in `development`:

```
> findstr /s /i /c:"sourceMap" apps\*\project.json
apps\insurance-portal\project.json    (development configuration only, quoted in §1)
```

**(1b) production build with `--sourceMap=true`** (same source, flag only; output to
`dist/apps/insurance-portal-mapcheck`, removed after measurement)

```
Application bundle generation complete. [4.177 seconds]
WALL_SECONDS=7.2
```

```
js_files=32
total_js_bytes=1192298
map_files=35
total_map_bytes=5598880
main_map=main-RQ7DDMZR.js.map bytes=825829
main_js=main-RQ7DDMZR.js bytes=232378
comment_tail_80=[...//# sourceMappingURL=main-RQ7DDMZR.js.map]
```

```
version=3  file=main-RQ7DDMZR.js
sources_count=125  sourcesContent_count=125  nonnull_sourcesContent=125
mappings_len=187299  html_sources=0  names_count=2084
```

```
maps=35  total_map_bytes=5598880  total_sources=353  total_sourcesContent_nonnull=353
maps_with_zero_sources=0  maps_with_partial_content=0  js_count=32
```

```
unique_sources=353  sources_resolving_on_disk=0
app_sources_total=76  app_sources_resolving=0
map_exists_beside=True
```

```
total_source_entries=353  html_entries=0  template_named=0  ng_scheme=0  mjs_or_node=277
> Select-String -Pattern 'templateUrl'  (apps, libs, *.ts)
templateUrl_hits=0
```

**(2) template mapping**

```
map_containing_component=.../chunk-DVYlxUtw.js.map
that_map_file=chunk-DVYlxUtw.js sources=6
source_index=4
source_name=../libs/contract/ui/src/lib/contract-form.component.ts
sourcesContent_length=3683
sourcesContent_equals_disk=true
disk_lines=109
mappings_in_component=687
distinct_original_lines=54
min_original_line=18 max_original_line=107
distinct_original_lines_inside_template_30_95=37
distinct_template_segments=164
```

(segment table, expression-column probes, interpolation probes and the generated AOT quote: §2 above —
raw output of `s12-template-map.mjs`, `s12-granularity.mjs`, `s12-interpolation.mjs`.)

Production bundle carries no source path of its own:

```
files_containing_debugInfo=1
files_containing_component_source_path=0
files_containing_ngDevMode=0
```

**(3) web-tree-sitter**

```
> npm install web-tree-sitter            -> web-tree-sitter=0.27.2 (web-tree-sitter.wasm 210688 B)
> npm install tree-sitter-wasms          -> tree-sitter-wasms=0.1.13 (37 grammars, incl. html 18468 B)
> npm install @vscode/tree-sitter-wasm   -> 17 grammars, dylink.0, no html
> npm view tree-sitter-angular version   -> 0.9.2  (node-gyp-build native addon, no wasm in tarball)
```

0.27.2 against `tree-sitter-wasms` → `Error at getDylinkMetadata` (stack in §3).
0.24.7 against `tree-sitter-wasms` → TS 4.4 ms, HTML 1.0 ms (raw output in §3).
Bench outputs (`bench.mjs`, `bench-dir.mjs`, `worker-main.mjs`) are quoted verbatim in §3 and §4.

**(4) panel build**

```
> npx nx run angular-ai-devtools:build-extension --skip-nx-cache
Application bundle generation complete. [3.318 seconds]
▲ WARNING bundle initial exceeded maximum budget. Budget 520.00 kB was not met by 15.50 kB with a total of 535.50 kB.
Output location: D:\...\extension\panel
  Run duration:      5.1s
WALL_SECONDS=10.1
```

```
panel_js_files=30  panel_js_bytes=624247  maps=0  has_sourceMappingURL=False
largest=chunk-B8BF8DsE.js 326561
```

Note on artefacts: `extension/panel/*` is gitignored except `index.html`, and the build rewrites that
tracked file. The emitted script names are content-hash identical to the committed ones
(`chunk-B8BF8DsE.js`, `main.js`, …), so the diff was formatting plus critical-CSS inlining only; it was
reverted with `git checkout -- extension/panel/index.html` and the repository's tracked files are as
found. The portal's `dist/apps/insurance-portal-mapcheck` was deleted after measurement; the portal
checkout is back to `?? .commandcode/taste/` only.

Scratch scripts live in `$env:COMMANDCODE_SCRATCHPAD` (`s12-template-map.mjs`, `s12-granularity.mjs`,
`s12-interpolation.mjs`, `s12-ts24/bench.mjs`, `s12-ts24/bench-dir.mjs`, `s12-ts24/worker-main.mjs`,
`s12-ts24/ts.worker.mjs`); no repository file was created except this answer. No server or port was
started, so none was left to clean up.

## Which insight-class facts stay impossible

Even with a resolving map, full `sourcesContent`, and a working AST index, these remain unavailable —
and they are not a list of edge cases, they are most of what the sixteen shipped features report:

- **Any value that exists only at runtime.** `linked-state`'s two compared values, `field-state`'s
  validity and error kinds, the current `form().status()` — the map gives the *text*
  `[formField]="form().status"` on line 38 and nothing about what it evaluated to.
- **Whether a provider was instantiated, and which injector answered.** `di-doctor` asks which live
  injector resolved a token; a map names the class file, never the injector instance.
- **Any event that only exists because something happened.** `sanitizer`'s dev-mode warning,
  `lint-core`'s `NG0950`, `lint-router`'s `NG04002`, and every `ɵsetProfiler` work event. A static
  index can prove the call site exists; it can never prove the call occurred.
- **Timing of any kind.** `performance-narrator`'s `durationMs`, `after-render`'s event ordinals, the
  gap between a warning's clock time and a profiler window.
- **Signal graph topology and node identity.** Producers/consumers edges, node labels and node text —
  `interop`, `signal-provenance`, `render-phase`, `stale-view`. The map says where a `computed()` is
  written; the graph says what it read.
- **Whether a template construct rendered at all, or how often.** The map contains both `@if` branches
  of line 42 identically; it cannot say the branch was false on this page, or that the component was
  checked 41 times. "Which binding caused this check" is obtainable, "that it checked, and when" is not.
- **The effective change-detection arrangement.** An AST can read
  `provideZonelessChangeDetection()` in `app.config.ts` — a genuine new static fact — but not whether
  the running page is zoneless. Every static claim about bootstrap is a claim about *intent*, not
  about the instance.
- **Whether the code was ever loaded.** A map describes the build; it cannot say a lazy chunk was
  fetched, a route visited, or a tree-shaken branch gone.
- **Any datum the application did not compile in.** Customer lists, contract rows, API responses.
- **Anything about a second build on the same host.** `map-mismatched-script` exists precisely because
  a static artefact cannot know it is the artefact the running page used.

The honest summary: a map plus AST index moves the *code* half of the system from invisible to
inspectable, at 0.3–0.4 s and under 100 MB per application, and it leaves the *execution* half exactly
where it was. It adds a row whose prerequisites are "a resolvable map", and in this application that
row does not exist in production at all.

## Verdict

**Positive on the capability, negative on availability, and narrower than "expression precision".**

- Measurement 1 is a **named absence**: `no-sourcemap` — 32 chunks, 1,189,228 bytes, 0 maps, 0
  `sourceMappingURL`, and `sourceMap` is set only in the `development` configuration. With the flag
  forced on, the artefact is large but complete: 35 maps, 5,598,880 bytes, `sourcesContent` 353/353,
  `main` map 825,829 B for a 232,378 B bundle.
- Measurement 2 is the deciding one and it **partly succeeds**: template mappings exist at construct
  precision (164 segments over a 66-line template; `ɵɵproperty` → `[formRoot]` at 30:20,
  `ɵɵtextInterpolate` → `{{` at 42:16, `ɵɵconditionalCreate` → `@if` at 42:8), and they stop at the
  expression boundary (0 segments at the expression's own column for all 9 bindings and all 5
  interpolations probed). "Which binding on which template line" is a new fact; "which sub-expression"
  is not.
- Measurement 3 **succeeds with a caveat that matters**: the AST path runs (0.27.2 + `@vscode`
  grammars: 41.7–71.7 ms and +22 MB for 232 kB; 426.5 ms and 86.9 MB peak for the whole portal), and
  the only HTML grammar requires the 0.24 runtime, which costs ~285 MB per 232 kB and never returns
  it. No Angular-template WASM exists at all, so `@if`/structural-directive analysis has no grammar.
- Measurement 4 is cheap on both artefacts: panel 303.4 ms / 93.5 MB for 624,247 bytes; portal
  426.5 ms / 86.9 MB for 1,189,228 bytes; 0 error-node files.

## What this settles

The backlog's Q4 items (1) and (2) are answered, so the milestone decision can be made on data:

- **(1) Does the zoneless portal's production `main-*.js` ship a resolvable map with
  `sourcesContent`?** No map is emitted at all, by the application's own configuration. Even with
  `sourceMap` forced, 0 of 353 `sources` resolve on disk, so `sourcesContent` is load-bearing, and any
  surface that reads only map positions would be silent in production.
- **(2) Does AOT preserve template mapping at expression precision or only component granularity?**
  Between the two options as posed: **neither** — it preserves **template construct** granularity.
  `template-map-coarse` in the matrix's §4 vocabulary should therefore be defined as "resolved to the
  element/attribute but not to the sub-expression", not "resolved to the component".
- The honest programme consequence: a sourcemap-backed surface is a **dev-and-staging** surface for
  this portal, exactly as `plans/angular-ai-devtools-program-backlog.md:421-422` anticipated, because
  the prerequisite is an application build flag, not a property of the inspection. Cost is not the
  blocker (sub-second, under 100 MB); availability and grammar coverage are.

## What this does not settle

- Whether a map is *served* at runtime for a dev build of this portal (the `development` configuration
  sets `sourceMap: true`, so the artefact is produced; this spike read the emitted files, it did not
  fetch one over HTTP from a dev server, and no server was started).
- Whether a sourcemap-with-`sourcesContent` surface would keep the "no app cooperation" claim that
  §3 of `capability-dependency-matrix.md` makes for maps. A build flag is not runtime instrumentation,
  but it is still an application-side decision, and this spike measured that the decision currently
  goes the other way.
- Expression-level precision under a different compilation mode. Everything measured here is
  `@angular/build:application` (esbuild) with inline templates at Angular 22.2.2; an external-template
  or webpack/esbuild-vs-Vite difference was not tested, and the portal has no `templateUrl` component
  to test it with.
- Whether a purpose-built Angular-template grammar (WASM, `dylink.0`) would change the AST verdict.
  None exists in the packages tested; building one was out of scope.
- Peak memory in a browser Worker rather than `worker_threads`; the WASM heap behaviour measured here
  is Node's, and the 0.24 runtime's growth may differ in a browser.
- Whether any of this lifts or narrows a shipped gate — already settled as `lift 0 / narrow 0 /
  changes nothing 16`, and nothing measured here contradicts it.

Total wall clock spent: **≈ 73 minutes** (first portal command ~20:08 to final verification
2026-11-08 21:21:19), of which the measured machine work is small: portal production build 6.9 s, map
build 7.2 s, panel build 10.1 s, and ~1.2 s of total parse time across every parse measured.
