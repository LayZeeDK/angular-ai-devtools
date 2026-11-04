# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-03
Checks run: **static inspection only — no build, test, lint or serve command was executed.**
The verify sidecar (`%USERPROFILE%\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\inspect-codebase`)
is at `9d3c711dd030d23b5647a2b2cb46df96f225abe3` with **no `node_modules`**, and the brief's verification
for this role is the output file's own proof, so no project command was run there either. Read-only evidence
commands that *were* run, in the primary checkout (whose working tree is clean apart from `.project/ROADMAP.md`
and `.project/STATE.md`):
`git rev-parse HEAD` → `9d3c711dd030d23b5647a2b2cb46df96f225abe3` (the sidecar reports the same);
`git status --porcelain` → `M .project/ROADMAP.md`, `M .project/STATE.md`;
`git hash-object` over 48 paths in 5 batches, to compare every `.proven.json` pin named in this file against the
bytes at the head; `git cat-file -p dc39edb5f23a35f788cba146dd7337127ba6c5ab`;
`git show HEAD:spikes/ng222-ssr/src/server.ts`; `git ls-files extension/panel`;
`git check-ignore -v packages/ai-devtools-companion/dist/index.js`.
Installed versions were read from disk, not inferred: root `@angular/core` **22.1.8**, `spikes/ng222-app`
**22.2.2**, `spikes/ng222-ssr` **22.2.2** (three separate installs).
Where a number in this file is a measurement rather than a read, it says so.

## Map

- **Stack**: one Nx 23 workspace of three projects (`apps/angular-ai-devtools`,
  `apps/angular-ai-devtools-e2e`, `packages/ai-devtools-companion` — the only three `project.json` files in the
  tree). Root `package.json:33` pins `typescript` **6.0.3**; `package.json:37-42` declares Angular `~22.1.0`
  (installed **22.1.8**); `package.json:22-26` carries `@nx/angular ^23.3.0` / `@nx/* 23.3.0`; `package.json:34`
  Vitest `^4.0.8`; `package.json:28` `@playwright/test ^1.37.0`; `package.json:32` `jsdom ^27.1.0`. The Nx CLI
  entry for this install is `node_modules/nx/dist/bin/nx.js` (`AGENTS.md:11`). **The two verification fixtures are
  not workspace projects**: `spikes/ng222-app` and `spikes/ng222-ssr` are standalone Angular CLI applications with
  their own `angular.json`, `package-lock.json` and `node_modules`, on Angular **22.2.2**
  (`spikes/ng222-app/package.json:14-19,25-27`; `spikes/ng222-ssr/package.json:14-25,28-30`). The counter fixture
  additionally runs Vitest **5.0.3** + `vitest-browser-angular 0.5.1` in a real browser
  (`spikes/ng222-app/package.json:28-34`). Test frameworks: `node:test` for `scripts/`, `extension/` and both
  skills trees (`package.json:11-12`); Vitest via `@angular/build:unit-test` for the panel (`project.json:113-124`);
  Playwright for `tests/browser` and the e2e app (`playwright.config.mts:6`,
  `apps/angular-ai-devtools-e2e/playwright.config.mts:25`).
- **Entry points**:
  - npm scripts (`package.json:7-13`): `check` = `ensure-sidecar-deps` → `tsc -p tsconfig.json` → `check:skills` →
    `check:panel` → `check:companion`; `test` = `node --test` over `scripts/**/*.test.mjs` and
    `extension/**/*.test.mjs` → `run-user-scope-tests.mjs` → `test:skills` → `test:app`
    (`npx nx run angular-ai-devtools:test`).
  - Nx targets, panel (`apps/angular-ai-devtools/project.json`): `build` (`:9-51`, `@angular/build:application`),
    `build-extension` (`:52-92`, emits to `extension/panel`, `baseHref: /panel/` `:76`, `dependsOn`
    `generate-error-digest` `:53-56`), `generate-error-digest` (`:93-99`, `node scripts/generate-error-digest.mjs`),
    `serve` (`:100-112`), `test` (`:113-124`), `serve-static` (`:125-134`, port 4200, `@nx/web:file-server` over
    the **production** build).
  - Nx target, companion: `build` = `tsc … --outDir packages/ai-devtools-companion/dist`
    (`packages/ai-devtools-companion/project.json:8-17`).
  - Nx e2e: no declared targets (`apps/angular-ai-devtools-e2e/project.json:10`); the `e2e` target is inferred by
    the `@nx/playwright/plugin` with `targetName: "e2e"` (`nx.json:25-32`).
  - Extension entry points (`extension/manifest.json`): MV3, `background.service_worker` `background.js`
    (`:14-17`); three content-script declarations — `observer-filter.js`+`relay.js` at `document_idle` (`:18-23`),
    `agent-main.js` in `world: "MAIN"` at `document_idle` (`:24-29`), `observer-filter.js`+`overlay-geometry.js`+
    `overlay.js` at `document_start` (`:30-35`); `devtools_page` `devtools.html` (`:36`); the panel itself is
    `extension/panel/index.html`, built with `baseHref /panel/`.
  - Panel routes (`apps/angular-ai-devtools/src/app/app.routes.ts:8-19`): `''` (N1 update-cause),
    `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` (lazy), `chat` (lazy),
    `picker` (lazy).
  - Fixture start commands (`control-angular-dev-app`): `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter|ssr|portal`
    — counter `ng serve --port <p>` in `spikes/ng222-app` with default port **4222** (`control.mjs:79-86`, `:82`);
    SSR `ng serve --port <p> --no-hmr` in `spikes/ng222-ssr`, default **4223** (`control.mjs:87-95`, `:93`);
    portal `nx run insurance-portal:serve --port=<p>` on **4200** plus its API pinned to **3000**
    (`control.mjs:96-109`, `:100`, `:106`). `doctor`, `info`, `down` are the other commands
    (`control-angular-dev-app/SKILL.md:223-228`).
  - Panel served for self-inspection: `nx run angular-ai-devtools:serve --host 127.0.0.1` (what both Playwright
    configs start, `playwright.config.mts:13-14`), and `serve-static` on the same port 4200 over the production
    build (`project.json:125-134`).
- **Architecture**: the product is a **DevTools panel plus a page realm**, not a server. The panel
  (`apps/angular-ai-devtools`, Angular 22.1.8) is built with `baseHref /panel/` into `extension/panel/` and framed
  by `extension/devtools.html`; it talks to the inspected page only through the extension: content scripts in the
  page push `CustomEvent`s (`angular-ai:state`, `angular-ai:record`, `angular-ai:error-capture`,
  `angular-ai:picked`, `angular-ai:di-graph`) that `extension/relay.js` forwards, `extension/background.js` stamps
  with a tab id, and `ExtensionMessageService` turns into signals
  (`apps/angular-ai-devtools/src/app/extension-message.service.ts:67-120`). The MAIN-world agent
  (`extension/agent-main.js`) is the only code that calls `ng.*`; it publishes capability facts
  (`featuresOf`, 8 `typeof` reads, `:61-82`), zone mode (`:87-115`), cycle records with a signal graph
  (`:488-583`), a companion probe for `globalThis.ngAiDevTools` (`:117-160`) and the picker descriptor
  (`:832-927`). The panel's AI answers are produced by the panel-local Prompt API
  (`extension-prompt.service.ts`), never in the page. A parallel, partly-built path exists for **panel→page reads**:
  five tool declarations (`find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata`,
  `getComponent`) whose transport does not exist (`page-reads.ts:14-20`). Fixtures sit beside all of this as
  standalone Angular CLI apps reached only through the `control-angular-dev-app` skill.
- **Conventions**: source is TypeScript with `strict` + `noUncheckedIndexedAccess` inherited from
  `tsconfig.json:10-22` and `apps/angular-ai-devtools/tsconfig.json:3-15`; the extension is hand-written ES5-style
  JS with `var` and `function` declarations (`extension/agent-main.js` passim) because it runs in the page's MAIN
  world. Every module carries a long "why" header comment naming the requirement id it satisfies; failures are
  **values, not exceptions** (`page-reads.ts:61-70`, `read-tools.ts:131-143`), and absence is always distinguished
  from a measured `false` (`app-facts.ts:66-76`, `:279-283`). Every pin lives in `scripts/*.test.mjs` and asserts
  its own non-vacuity by replaying the check on a mutated copy under `os.tmpdir()`
  (`registry-envelope-pin.test.mjs:125-174`, `panel-bundle-budget.test.mjs:295-356`). Tests are named `E<n>`/`AC<n>`
  after the criterion they defend. Commits are `T<nnn>: <imperative>`, `build: <record>`, `ship: M0nn — <title>`,
  `integrate: M0nn — merge …` (`git log` at the head).
- **Maturity**: what runs is broad and gated — `npm run check` type-checks the panel, both skills trees and the
  companion (`project.json`/`package.json:7-10`), and `npm test` runs 28 `scripts/*.test.mjs`, 9
  `extension/*.test.mjs`, the user-scope suite, both skills trees and the panel's Vitest suite. What is scaffolding:
  the five panel→page read tools answer `host-unavailable` by construction (`page-reads.ts:87-111`); 24 files in
  `tests/held-out/` are run by **no** npm script; `spikes/ng222-app/src/app/app.routes.test.mjs` is run by no npm
  script; `apps/angular-ai-devtools-e2e` has no declared target. What is deliberately broken on purpose:
  `stale-view-fixture.ts` (a plain field written in a subscribe callback, `:14-23`), `mismatch.ts` (a hydration
  mismatch, `:16-20`), and `Counter`'s effect writing a signal (`counter.ts:22-24`) — all three carry "do not fix"
  instructions (`AGENTS.md:53-59`, `control-angular-dev-app/SKILL.md:291-294`, `features/ssr.md:87`).
- **Recent activity**: the last 25 commits are all M022 `in-page-overlay` (`git log --oneline -n 25`): T005-T010
  built the closed-shadow overlay host, the picker transport, the page-realm component resolution and the page
  footprint gate, then `build:` records of the reviews and `ship: M022` / `integrate: M022`. Before that, M021
  (`optin-companion`) and M020 (`feature-fingerprint`). The work is therefore concentrated in `extension/overlay*`,
  `extension/agent-main.js`, `apps/angular-ai-devtools/src/app/page-picker.component.ts` and
  `src/main-world/*` — **not** in the fixtures, which were last touched 2026-10-30 (the `stale-view` route ruling,
  `AGENTS.md:53-59`).

## Finding 1: The milestone's own scope — three new packages in the fixture — is forbidden by a passing test in `npm test`

- **Claim**: `.project/ROADMAP.md:912` states M023's scope as adding `@angular/aria`, `@angular/cdk` and
  `@angular/material` to "the verification fixture", and `scripts/ng-context-dev-build.test.mjs:684-685` asserts the
  **exact sorted key lists** of `spikes/ng222-app`'s `dependencies` and `devDependencies`. Adding one package to that
  fixture turns a green `npm test` red with `deepEqual` on the fixture's dependency names, before any feature code is
  written.
- **Source**: `.project/ROADMAP.md:902-939` (scope in / success criteria); `plans/angular-ai-devtools-program-backlog.md:134-145`;
  `scripts/ng-context-dev-build.test.mjs:110-132` (the two frozen lists), `:682-696` (the assertion);
  `spikes/ng222-app/package.json:13-35`.
- **Confidence**: high (the assertion is an exact `deepEqual` on `Object.keys(...).sort()`, and no
  `@angular/aria|cdk|material` string exists in any manifest or lockfile — `findstr` over `package.json`,
  `package-lock.json`, `spikes/*/package.json`, `spikes/ng222-app/package-lock.json`, `nx.json` returned nothing).
- **Why it matters here**: the plan has a fork it must name: either the three package families land in a **new,
  separately-declared** fixture app (which is what `ROADMAP.md:918` "a new fixture must be a declared verification
  surface" and `:915` "the fixture's declaration as a verification surface" imply), or the frozen lists in
  `ng-context-dev-build.test.mjs` are re-pinned in the same commit **with a stated reason** — the file's own header
  says the fixture cannot be edited to produce a measurement (`:692-696`) and `:719-728` forbids weakening the gate.

## Finding 2: A "verification surface" is a set of registrations, not a directory — and none of them is automatic

- **Claim**: making a fixture reachable means editing **six** places, and a new app under `spikes/` is reachable by
  none of them until each is edited: (1) the `TARGETS` map and its port derivation in
  `control-angular-dev-app/scripts/control.mjs:78-110`; (2) the skill's "Pick a flow" and port tables,
  `control-angular-dev-app/SKILL.md:23-44` and `:61-95`; (3) `control-angular-dev-app/features/README.md:54-75`
  (feature index and full sweep); (4) a `features/<id>.md` file in the four-H2 contract (`:48-52`); (5) an entry in
  that skill's `features/.proven.json` (`record`/`check`, `fingerprint.mjs:711-741`, `:857-917`) or a recorded
  `external` reason; (6) the `doctor` `app-marker`/readiness expectations, which come from the target's `marker`
  (`control.mjs:81`, `:89`, `:98`).
- **Source**: `control-angular-dev-app/scripts/control.mjs:78-110`; `control-angular-dev-app/SKILL.md:23-44`;
  `control-angular-dev-app/features/README.md:48-75`; `control-angular-dev-app/features/.proven.json:1-71`;
  `control-angular-dev-app/scripts/fingerprint.mjs:695-699` (`assertFeature` refuses an id with no feature file).
- **Confidence**: high.
- **Why it matters here**: `ROADMAP.md:915`/`:918` require the new fixture to be *declared*; this is the complete list
  of what "declared" costs, and it is where a task's file list should come from. `README.md:4-5` states the rule
  explicitly: "For an app attached with `--url`, write its features here in the same shape before claiming coverage."
  Note also that `fingerprint.mjs record` **drops** manifest entries whose feature file is gone
  (`fingerprint.mjs:727-731`), so deleting a feature file silently deletes its pin.

## Finding 3: Five component reads are declared as registry tools that can never answer — there is no page-request transport

- **Claim**: `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are
  registered through the tool envelope, and every one of them resolves to `UNAVAILABLE_PAGE_HOST`, which answers
  `status: 'error'` / `code: 'host-unavailable'` for every input. The module's own header says so:
  "**This build has no page-request transport.**"
- **Source**: `apps/angular-ai-devtools/src/app/page-reads.ts:14-20` (the claim), `:87-88`
  (`PAGE_HOST_UNAVAILABLE_REASON`), `:95-101` (`UNAVAILABLE_PAGE_HOST`), `:108-111` (`PAGE_HOST` factory);
  `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts:124-129` (`pageHost()` falls back to the default),
  `:190-257` (the five declarations), `:272-279` (`provideReadTools`); registration at
  `apps/angular-ai-devtools/src/app/app.config.ts:15`.
- **Confidence**: high.
- **Why it matters here**: "component-level fixtures so component claims can be exercised" needs a page realm that
  answers these five ids as **data**. That is the single largest missing piece, and it is missing at the transport
  layer, not the fixture layer — a richer fixture alone changes nothing.

## Finding 4: The page realm has no responder for those five ids; its outbound vocabulary is fixed and different

- **Claim**: `extension/agent-main.js` sends exactly five event names — `angular-ai:state`, `angular-ai:record`,
  `angular-ai:error-capture`, `angular-ai:pick`-related `angular-ai:picked`, and `angular-ai:di-graph` — and never
  reads a request. No file in `extension/` mentions `find_components`, `inspect_component`, `list_signals`,
  `PAGE_HOST` or `page-request`; the only occurrences in the repository are in the panel module, its spec, the
  registry tests and design docs.
- **Source**: `extension/agent-main.js:61-82` (`featuresOf` payload), `:832-833` (`PICK_EVENT`/`PICKED_EVENT`),
  `:896-914` (`pickDescriptorFor`, the only component-identity answer), `:939-958` (`dispatchInitialRecord`);
  `extension/relay.js` forwarded set mirrored by `apps/angular-ai-devtools/src/app/extension-message.service.ts:67-97`
  (the `ExtensionMessage` shape); `page-reads.ts:14-20` for the panel's own confirmation.
- **Confidence**: high (grep over the tree excluding `.project/archive`).
- **Why it matters here**: the missing thing has a precise name and a precise home — a request/response channel
  between `read-tools.ts`'s `PageHost` and a new MAIN-world responder in `extension/agent-main.js` — and the
  milestone should not spend effort on the panel side, which is already written and pinned.

## Finding 5: Component identity has three different producers in the page realm, and one consumer that treats them as one string

- **Claim**: `componentName` is produced three ways in one file: the lowercased **host tag** (`componentNameFor`,
  `pickComponentName`), the **class name** as a graph node id `cmp:<Class>` with `component: <Class>`, and — for the
  initial record only — the **class name in both** `componentName` and `className`. The panel then keys cycles by
  `componentName` alone.
- **Source**: `extension/agent-main.js:507-517` (`componentNameFor` → `el.tagName.toLowerCase()`),
  `:519-525` (`classNameFor` → `constructor.name`), `:552-583` (`enumerateComponentNodes` → `id: "cmp:" + cls`,
  `label: tag`, `component: cls`), `:939-950` (`componentName: nodes[0].component, className: nodes[0].component`),
  `:853-863` (`pickComponentName` → host tag, class name lowercased as fallback); consumers:
  `apps/angular-ai-devtools/src/app/n1-update-cause.component.ts:106-123`,
  `apps/angular-ai-devtools/src/app/signal-provenance.service.ts:20-54`,
  `update-cause-chain.ts:124-178`.
- **Confidence**: high.
- **Why it matters here**: a component-level fixture assertion like "the panel names the component" has three
  possible answers (`app-counter`, `Counter`, `cmp:Counter`) depending on which path produced the record. Anything
  that adds a second component with the same class name or two hosts of one class (exactly `ROADMAP.md:926`'s
  "ambiguity case with two matching hosts") makes the collision observable for the first time.

## Finding 6: `componentName`/`className` in the panel's specs and docs disagree with the shipped page realm — the shipped producer is authoritative

- **Claim**: the shipped page realm emits `className: "Counter"` for the counter fixture (its class is `Counter`,
  not `CounterComponent`), while the panel's specs, the browser tests and the design document all use
  `className: 'CounterComponent'`; `docs/feature-proposals.md:417` defines `find_components`'s `name` as the
  **class name with a leading underscore stripped**, which is neither of the two shipped meanings.
- **Source**: `spikes/ng222-app/src/app/counter.ts:15` (`export class Counter {`); shipped producer
  `extension/agent-main.js:519-525`; recorded as measured in `extension/agent-main.test.mjs:191`
  (`assert.equal(record.detail.checks[0].className, "Counter")`); the contradicting copies:
  `apps/angular-ai-devtools/src/app/signal-provenance.service.spec.ts:23-24`,
  `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts:7-8`, `e2e/provenance.spec.ts:26-27`,
  `apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts:26-27`,
  `tests/browser/di-regression.spec.ts:76-77`; the design copy `docs/feature-proposals.md:417`.
- **Confidence**: high for the shipped value (a test asserts it and the class name is in front of me); medium for
  "which copy a reviewer should trust" — the answer is the shipped producer, because the specs inject fixtures by
  hand.
- **Why it matters here**: any new fixture whose class is named `*Component` (the Angular CLI default) will produce
  a `className` that matches the specs and *not* the two existing fixtures; that asymmetry will look like a
  regression in a panel test that was only ever exercised against fakes.

## Finding 7: The counter fixture declares two components and one root provider — enough for a name filter, not for ownership, inputs, encapsulation or a second host

- **Claim**: `spikes/ng222-app` renders `App` (`app-root`) hosting `Counter` (`app-counter`) plus `CartService`
  (`providedIn: 'root'`). The only inputs are `title` (a signal input) and the only graph kinds present are
  template/signal/computed/effect. There is no nested composition deeper than one level, no `@Input()` decorator
  input, no `ViewEncapsulation` variant, no second instance of one class, and no child component that owns content
  projected from outside its root.
- **Source**: `spikes/ng222-app/src/app/app.ts:5-9`; `spikes/ng222-app/src/app/counter.ts:3-6` (`CartService`),
  `:8-25` (`Counter`); `control-angular-dev-app/features/counter.md:9-13` (the five sub-features actually present),
  `:45-51` (relies also on the routes).
- **Confidence**: high.
- **Why it matters here**: the four HAR cases M023 must make producible (`ROADMAP.md:926`) each need a shape this app
  does not have — "content outside the component root" and "two matching hosts" in particular. A plan that assumes
  "add components to the counter" also has to answer that the counter's own feature file
  (`features/counter.md`) is a proven, four-H2 document whose `Sub-features` list would then be incomplete.

## Finding 8: The component-level context that already exists is the Vitest tester iframe — and it is a hand-built context by construction

- **Claim**: `render(Counter, { inputs: { title: 'Clicks' }, providers })` mounts the component under a TestBed
  host `<div id="rootN" ng-version>` with `document.querySelector('app-counter') === null`; the component exists
  only for the duration of its test unless a `--hold` test keeps it mounted. That is precisely the "hand-built
  context" a component-level fixture is meant to replace — and it is measured, not inferred.
- **Source**: `spikes/ng222-app/src/app/counter.spec.ts:7-18` (the `render` call), `:37-51` (a test that fails on
  purpose), `:53-74` (the `VITE_COUNTER_HOLD_MS` mount-holding test); `control-vitest-browser-angular/SKILL.md:132-135`
  ("The component host is `<div id="rootN" ng-version>`, not `<app-counter>`"), `:69-73`;
  `docs/feature-proposals.md:919-924` (measured: `ng.getComponent(div)` is the Counter, the injector path is
  element → `DynamicTestModule` → `Platform: core`, and the component is gone after the test).
- **Confidence**: high for the quotes (all are in this repository).
- **Why it matters here**: this is the concrete baseline the milestone improves on. It also names the cheap
  alternative a define session may prefer: reuse the held-mount test as the subject, instead of a new app — with the
  iframe limitation in Finding 9 as the price.

## Finding 9: The extension is chartered and pinned never to run in a sub-frame, so a fixture inside an iframe is invisible to it

- **Claim**: `extension/manifest.json` sets no `all_frames` on any declaration, and `extension/manifest.test.mjs`
  fails if any is added ("no declaration may set all_frames (AR-5: one frame)"). The charter makes it stronger:
  "AR-5: cross-frame outlining is a non-goal for v1". The design document nonetheless records that
  "the extension's manifest needs the same [`all_frames: true`] for the page agent to run in the tester iframe".
- **Source**: `extension/manifest.test.mjs:83-89`; `extension/manifest.json:18-35`; `.project/CHARTER.md:256`
  (AR-5); `docs/feature-proposals.md:916` (the `all_frames: true` requirement, marked inferred design);
  `control-vitest-browser-angular/SKILL.md:65-68` (the *generated* `s1-vitest` extension is the one that matches
  "every frame").
- **Confidence**: high for the pins; high for the tension (both statements are in the repository).
- **Why it matters here**: a component-level fixture served **in a sub-frame** (Vitest browser mode, or any
  story-canvas layout) cannot be inspected by this extension at all. A fixture that must be inspected has to be a
  top-level page served by `control-angular-dev-app`, which is what Finding 2's six registrations describe.

## Finding 10: Four `.proven.json` features are **already stale** at the head — the map-fresh warning is not hypothetical

- **Claim**: three skill manifests pin `spikes/ng222-app/src/app/app.routes.ts` at blob
  `dc39edb5f23a35f788cba146dd7337127ba6c5ab`, which is the *empty-routes* file
  (`export const routes: Routes = [];`), while the file at the head hashes `64105a8ad854412de9d2c0c0a31e81cbc50e3e5a`.
  `control-vitest-browser-angular` pins `spikes/ng222-app/angular.json` at `e4cad554…`; the file at the head hashes
  `e9d1e3ed227bb8a7a31f289c35a44b652d7b5743`.
- **Source**: `git cat-file -p dc39edb5f23a35f788cba146dd7337127ba6c5ab` → the empty-routes body;
  `git hash-object spikes/ng222-app/src/app/app.routes.ts` → `64105a8a…`;
  `.commandcode/skills/control-angular-dev-app/features/.proven.json:14` (`counter`);
  `.commandcode/skills/control-angular-devtools/features/.proven.json:14` (`attach`), `:37` (`profiler`),
  `:55` (`signal-graph`) — all four pin the same stale blob; `control-vitest-browser-angular/features/.proven.json:16`
  pins the stale `angular.json` hash. Every other file in those entries matches the head (7 hashes compared for
  `counter`, 7 for `ssr`, 8 for the vitest configs).
- **Confidence**: high (hash comparison, not inference).
- **Why it matters here**: `doctor`'s `map-fresh` line already reports `stale: counter (since a553213…, 1 files
  changed)` for every one of those skills, and `ROADMAP.md:929` ("`npm test` passes at the head") is unaffected
  because nothing in `npm test` runs `fingerprint.mjs check`. A milestone that edits the fixture must decide whether
  to re-record (`fingerprint.mjs record --feature counter`, which **reuses the recorded entries**) or leave the
  warning — and neither choice is currently forced by a test.

## Finding 11: The two stale-view fixture components are in **no** proof manifest, so the routes that the N24/N25 checks depend on are unpinned

- **Claim**: the `counter` proof entry's file list is exactly `app.config.ts`, `app.routes.ts`, `app.ts`,
  `counter.ts`, `index.html`, `main.ts`, `tsconfig.json` — the import closure recorded on 2026-10-16, before the
  stale-view routes existed. Re-recording today would add `stale-view-fixture.ts` and
  `stale-view-deferred-fixture.ts` (the closure follows `app.routes.ts`'s imports); today neither file is hashed by
  any manifest.
- **Source**: `.commandcode/skills/control-angular-dev-app/features/.proven.json:8-20`;
  `control-angular-dev-app/scripts/fingerprint.mjs:432-517` (`closure` follows static imports, `import()` and
  `require()`); `spikes/ng222-app/src/app/app.routes.ts:2-3` (the imports).
- **Confidence**: high (the two paths appear in no `.proven.json` anywhere in the tree — grep for
  `stale-view-fixture` over `**/.proven.json` returns nothing).
- **Why it matters here**: the components that produce the N24 and N25 claims are the least-pinned files in the
  fixture. A change that edits `stale-view-fixture.ts` in a way that keeps the regex tests green (Finding 15) would
  show up in no freshness report.

## Finding 12: The panel's initial-bundle budget is pinned twice, and the panel already sits 15 kB above the warning

- **Claim**: `build-extension` must carry exactly one `initial` budget of `520kb` warn / `1mb` error, into
  `extension/panel`, and the measured initial total of the eager files in the built `index.html` must stay at or
  below a recorded baseline of **535.44 kB**. The pin also re-reads its own source to prove the constant was not
  edited.
- **Source**: `scripts/panel-bundle-budget.test.mjs:55` (`EXPECTED_INITIAL_BUDGET`), `:65`
  (`PRE_MILESTONE_INITIAL_KB = 535.44`), `:226-260` (the exact `project.json` assertion), `:266-289` (the constant is
  read back from this file's own source), `:362-377` (the measurement, skipped only when nothing was built);
  `apps/angular-ai-devtools/project.json:79-90`.
- **Confidence**: high.
- **Why it matters here**: any panel code added to exercise component claims — a component picker backed by
  `find_components`, a fixture page in the panel, a new explainer — is charged against 535.44 kB, which is a
  **zero-headroom** ceiling (the file says "a single added byte fails here"). The fixture-side work should stay in
  the fixture and in the extension's page realm, not in `src/app/`.

## Finding 13: The counter fixture's dependency lists and both build configurations are frozen verbatim by a test

- **Claim**: `scripts/ng-context-dev-build.test.mjs` asserts (a) the sorted dependency and devDependency **key
  lists**, (b) `defaultConfiguration === 'production'`, (c) the development configuration `deepEqual`s
  `{optimization:false, extractLicenses:false, sourceMap:true, preserveSymlinks:true, fileReplacements:[{replace:
  'src/app/app.config.ts', with:'src/app/app.config.dev.ts'}]}`, (d) the production configuration's two budgets and
  `outputHashing:'all'`, and (e) that no file under the fixture's `src/` contains `__ngContext__` or `window.ng`.
- **Source**: `scripts/ng-context-dev-build.test.mjs:110-132`, `:140-153`, `:682-696`;
  `spikes/ng222-app/angular.json:31-60`.
- **Confidence**: high.
- **Why it matters here**: (e) is the sharpest edge for this milestone — a fixture component that *demonstrates*
  `__ngContext__` or `window.ng` (a plausible way to show a component boundary) makes this test red, with no
  obvious connection to the change. (a) forbids a new dependency in this app; (c) forbids adding a route-level
  provider replacement or a second file replacement.

## Finding 14: `preserveSymlinks` is load-bearing and measured — turning it off puts two Angular copies in one bundle

- **Claim**: because `spikes/ng222-app` depends on the companion by a directory `file:` specifier (which npm
  installs as a symlink), the builder's default realpath resolution anchors the package's `@angular/*` imports at the
  22.1.8 root install. `preserveSymlinks: true` is what makes the development build carry exactly one Angular copy,
  and the test proves it by building the same fixture a second time with the option off and reading the two-copy
  signature (`@license Angular v…` twice, a second `var Router = class`).
- **Source**: `scripts/facade-dev-build.test.mjs:16-26` (the header's statement), `:477` (peer pins to the fixture's
  own copy), `:537` (one Angular copy), `:557` ("with preserveSymlinks off the same build carries two Angular
  copies"); `spikes/ng222-app/angular.json:51`; `spikes/ng222-app/package.json:20`.
- **Confidence**: high.
- **Why it matters here**: a **second** Angular app in this repository that consumes a workspace package, or a new
  fixture that serves packages out of the root `node_modules`, inherits this duplicate-Angular hazard on the
  injector path — and a duplicate Angular is indistinguishable from a component-identity bug when the class identity
  comparisons in the companion facade are involved (`packages/ai-devtools-companion/src/facade.ts` is keyed on
  class identity).

## Finding 15: The stale-view fixture is pinned by **source-text regex**, not by behaviour — and the strongest regex test is not run

- **Claim**: `scripts/stale-view-fixture.test.mjs` asserts, by regex over the file's text, that a `subscribe(`
  precedes a `this.<field> =` write and that the field is not a signal; `spikes/ng222-app/src/app/app.routes.test.mjs`
  asserts by regex that `app.routes.ts` holds `stale-view`, `StaleViewFixture` and `export const routes`. The second
  file is **not** executed by any npm script.
- **Source**: `scripts/stale-view-fixture.test.mjs:12-32`; `spikes/ng222-app/src/app/app.routes.test.mjs:13-34`;
  `package.json:11-13` (the `test` script's globs: `scripts/**`, `extension/**`, `.claude/skills/**`,
  `.commandcode/skills/**`, then `nx run angular-ai-devtools:test` — no `spikes/**`, no `tests/**`).
- **Confidence**: high.
- **Why it matters here**: a fixture edit that reformats `stale-view-fixture.ts` (for example adding a second write,
  or extracting the subscribe callback into a method) breaks a **text** pin, while an edit that changes behaviour
  and keeps the text shape passes. `ROADMAP.md:576-590` records that the routes regex had to be tightened once
  already for exactly this reason.

## Finding 16: The registry core is SHA-256 pinned, and the reach guard forbids the registry from exporting the read names

- **Claim**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` is pinned by digest
  `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e`, and the pin's failure text says an edit is
  "allowed only in a plan that says so, and never in a commit that adds a tool". `registry-reach.test.mjs` fails if
  any file other than `read-tools.ts` and its spec imports `page-reads.ts`, and fails if the registry module exports
  `PAGE_HOST`, `PAGE_READERS` or any of the five reader names.
- **Source**: `scripts/registry-envelope-pin.test.mjs:55-56`, `:72-82`, `:96-105`, `:125-174`;
  `scripts/registry-reach.test.mjs:48-75`.
- **Confidence**: high.
- **Why it matters here**: the natural implementation of a component read — "have `inspect_component` ask the page" —
  must go through `PAGE_HOST`, i.e. through `read-tools.ts` only, and any new tool must be declared in its own module
  and registered with `provideTools`, never by editing the envelope or `tool-registry.ts`.

## Finding 17: The exact provisioning commands are already written down, and `--include=dev` is mandatory on this host

- **Claim**: the root install must be `npm ci --include=dev` because the shell exports `NODE_ENV=production`, which
  otherwise drops devDependencies — two `extension/*.test.mjs` files throw with that command in their own error text
  when `jsdom` is missing. The fixture's install must be `npm --prefix spikes/ng222-app ci --include=dev`, and any
  **development** build of the counter fixture must run `npx nx run ai-devtools-companion:build` first.
- **Source**: `extension/page-footprint.test.mjs:39-43` and `extension/overlay.test.mjs:31` (the `--include=dev`
  demand and the `NODE_ENV=production` reason); `scripts/ng-context-dev-build.test.mjs:73-79`
  (`PROVISION_ROOT`, `PROVISION_FIXTURE`, `PACKAGE_BUILD_COMMAND`, `PACKAGE_BUILD_INVOCATION`), `:289-292` (the gate
  that fails, never skips), `:24-27` ("the development build runs `npx nx run ai-devtools-companion:build` first");
  `scripts/facade-dev-build.test.mjs:290-297` (the same two commands as `MISSING_*_INSTALL` reasons), `:350`
  (the fixture must install the package).
- **Confidence**: high.
- **Why it matters here**: a task's Verify line for a new fixture must name all three commands in this order:
  root `npm ci --include=dev`; the fixture's own `npm … ci --include=dev`; and, if anything serves or builds the
  fixture in the development configuration, `npx nx run ai-devtools-companion:build`. Note the sidecar in this
  inspection has **no `node_modules`**, so `scripts/ensure-sidecar-deps.mjs` (`package.json:7`) is the first thing
  any check run in a sidecar exercises.

## Finding 18: The companion package's `dist/` is git-ignored while the counter fixture imports it by `file:` — a fresh clone cannot serve the fixture until the package is built

- **Claim**: `spikes/ng222-app` depends on `ai-devtools-companion` at `file:../../packages/ai-devtools-companion`,
  whose `exports` point at `./dist/index.js` and `./dist/index.d.ts`; `.gitignore:27` ignores `dist/`, and
  `git ls-files packages/ai-devtools-companion/dist` returns nothing. The fixture's **development** configuration
  replaces `app.config.ts` with `app.config.dev.ts`, which imports `provideAiDevTools` from that package — so
  `ng serve` fails to resolve until `nx run ai-devtools-companion:build` has run.
- **Source**: `.gitignore:27`; `packages/ai-devtools-companion/package.json:7-13`; `spikes/ng222-app/package.json:20`;
  `spikes/ng222-app/src/app/app.config.dev.ts:3,7-11`; `spikes/ng222-app/angular.json:52-57` (the replacement);
  `packages/ai-devtools-companion/project.json:8-17` (the build); `git check-ignore -v` confirms the ignore rule
  matches `packages/ai-devtools-companion/dist/index.js`.
- **Confidence**: high.
- **Why it matters here**: `control-angular-dev-app up --target counter` runs `ng serve` (development), so the
  fixture is *only* startable after the package build. That dependency is invisible in the skill's own Launch
  section (`control-angular-dev-app/SKILL.md:61-90`), and a new fixture in the same shape would inherit it.

## Finding 19: Adding a Markdown document to a covered path requires a `.project/research/DOCS-AUDIT.md` row — the audit's inventory is derived and compared exactly

- **Claim**: a gate derives an inventory of documents from the repository and `scripts/docs-audit-disposition.test.mjs`
  asserts that the head audit covers **exactly** that inventory ("the inventory the gate derives from … must be
  exactly the documents the head audit covers"), then runs the gate over it. The audit today documents
  `.claude/skills/…` Markdown, including the `control-ai-browsers` feature files, section by section.
- **Source**: `scripts/docs-audit-disposition.test.mjs:42` (`AUDIT_RELATIVE`), `:180-200` (`--emit-inventory`),
  `:536-553` (the exact-coverage assertion), `:780` (every remaining row must name a shipped command);
  `.project/research/DOCS-AUDIT.md:19`, `:30`, `:41`, `:52`, `:63` (the per-document sections).
- **Confidence**: medium-high. High that the comparison is exact; medium on whether `.commandcode/skills/**/*.md` is
  inside the derived inventory, because the gate itself lives outside this checkout
  (`~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py`) and the audit's sections name `.claude/skills/…`
  paths. Which of the two is true decides whether a *new feature file* needs an audit row.
- **Why it matters here**: the milestone will very likely add a `features/<id>.md` for the new fixture. If the covered
  path includes it, `npm test` fails until the audit gains a section whose rows each name a command that ships. The
  define session must settle which path is inventoried before a task writes the file.

## Finding 20: `.claude/skills/` holds a second copy of every skill, and only two of them are byte-enforced

- **Claim**: `.claude/skills/` and `.commandcode/skills/` both carry `control-angular-dev-app`,
  `control-angular-devtools`, `control-pangular-inspector`, `control-vitest-browser-angular`, `control-ai-browsers` and
  the three `verify-*` skills, each with its own `features/` and `.proven.json`. `scripts/skills-mirror.test.mjs`
  enforces byte equality for **exactly two** skills (`control-ai-browsers`, `verify-ai-browsers`), with two
  tolerances: `maintain/` exists only in the maintained copy, and `scripts/fingerprint.mjs` differs by one comment.
  `AGENTS.md` states the rule: `.commandcode/skills/` is the maintained copy; "the other `.claude/skills/` folders
  are older copies, not kept in step".
- **Source**: `scripts/skills-mirror.test.mjs:14-17`, `:45-52`; `AGENTS.md:40-43`; directory listings of both trees
  (`control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector`,
  `control-vitest-browser-angular` all exist under `.claude/skills/`).
- **Confidence**: high.
- **Why it matters here**: the authoritative copy of the fixture-driving skill is
  `.commandcode/skills/control-angular-dev-app/**`. A task list that names a `.claude/skills/…` path for a fixture
  feature file would edit a copy that no test protects and that `npm test`'s `test:skills` stage compiles but does
  not compare. It also means `check:skills` runs `tsc` four times over two trees for the same scripts.

## Finding 21: A quarter of the test corpus is executed by no npm script

- **Claim**: `npm test` runs `scripts/**/*.test.mjs`, `extension/**/*.test.mjs`, the user-scope suite, both skills
  trees and `nx run angular-ai-devtools:test`. It does **not** run `tests/**` (24 files in `tests/held-out/`,
  1 Playwright spec in `tests/browser/`), `spikes/**` (including `spikes/ng222-app/src/app/app.routes.test.mjs`), or
  the e2e app. `tests/held-out/e8-fixtures-retained.test.mjs` — the only test that asserts the fixtures still exist —
  is one of them.
- **Source**: `package.json:11-13`; `tests/held-out/e8-fixtures-retained.test.mjs:8-12`;
  `playwright.config.mts:6` (`testDir: 'tests/browser'`); `apps/angular-ai-devtools-e2e/project.json:10`
  (no declared targets); `spikes/ng222-app/src/app/app.routes.test.mjs` (present, referenced by
  `.project/ROADMAP.md:576-590`, run by nothing in `package.json`).
- **Confidence**: high.
- **Why it matters here**: a milestone can delete or hollow out a fixture and stay green; conversely a task that adds
  a `spikes/**/*.test.mjs` for a new fixture gets **no** execution from `npm test` unless the file lives under
  `scripts/`. The verification for a fixture change therefore has to name its command explicitly
  (`node --experimental-strip-types --test <path>`), as the archived tasks did
  (`tests/held-out/stale-view-fixture-graph.test.mjs` was proven that way).

## Finding 22: Nothing type-checks a fixture, and nothing but two M022/M021 tests ever builds one

- **Claim**: `npm run check` compiles: three root entries (`tsconfig.json:5-9`), four skills tsconfigs, the panel's
  `src/**/*.ts` (`apps/angular-ai-devtools/tsconfig.check.json:40-41`) and the companion package. It does not compile
  `extension/*.js`, `spikes/**`, or `scripts/*.mjs` — so the `// @ts-check` headers on every skill script and on the
  `scripts/*.test.mjs` files are not enforced by any stage. The only builds of a fixture in the test suite are the
  explicit `ng build --configuration development|production` runs inside `ng-context-dev-build.test.mjs` and
  `facade-dev-build.test.mjs`, both hard-coded to `spikes/ng222-app`.
- **Source**: `package.json:7-13`; `tsconfig.json:5-9`; `apps/angular-ai-devtools/tsconfig.check.json:27-41`;
  `scripts/panel-typecheck-scope.test.mjs:88-94` (the five stages, asserted by `deepEqual`);
  `scripts/ng-context-dev-build.test.mjs:59` (`FIXTURE_ROOT` is the counter only), `:216-221`, `:282-306`;
  `.project/ROADMAP.md:941-949` (M024's job is to add the extension sources to `check`).
- **Confidence**: high.
- **Why it matters here**: a **new** fixture app would be type-checked by nothing and built by nothing in
  `npm run check` / `npm test` — the milestone has to add its own type-check or build command to its Verify line, or
  the fixture will be able to rot green. `ROADMAP.md:929` ("`npm run check` and `npm test` pass at the head") is
  therefore satisfiable by a fixture that does not compile.

## Finding 23: Port 4200 is claimed by three entry points in this repository, one of them the external portal's default

- **Claim**: `serve` and `serve-static` for the panel both default to port 4200 (`serve-static` sets `port: 4200`
  explicitly), both Playwright configs start `angular-ai-devtools:serve` on `127.0.0.1:4200` with
  `reuseExistingServer: true`, and `control-angular-dev-app`'s portal target derives 4200 as its slot-0 port. A
  fourth fixture with a default port must pick a range that does not collide with 4200 (portal/panel), 4222 (counter),
  4223 (SSR), 3000 (portal API), 9999 (pangular), 9333-9338 (browser instances), 9420-9499 (DevTools harness),
  51315 (Vitest) or 51315/9350 (vitest-browser skill).
- **Source**: `apps/angular-ai-devtools/project.json:125-134` (`serve-static`, `port: 4200`);
  `playwright.config.mts:12-17`; `apps/angular-ai-devtools-e2e/playwright.config.mts:33-39`;
  `control-angular-dev-app/scripts/control.mjs:100` (portal 4200), `:82` (counter 4222), `:90` (SSR 4223), `:69`
  (portal API 3000), `:102` (pangular external 9999); `control-ai-browsers/instances.json:70,101,135,173,201`;
  `control-vitest-browser-angular/SKILL.md:34-38`.
- **Confidence**: high.
- **Why it matters here**: `reuseExistingServer: true` means a Playwright run silently adopts whatever holds 4200 —
  including a portal instance started by another session. A new fixture's derived port must also survive
  `control.mjs`'s slot arithmetic (slot 0 default, slots 1-99 from a hash of the folder,
  `control-angular-dev-app/SKILL.md:30-34`).

## Finding 24: The panel is chartered as its own inspection fixture (AR-7), but the entry point that serves it statically serves a **production** build, where `window.ng` does not exist

- **Claim**: `serve-static` runs `buildTarget: "angular-ai-devtools:build"`, whose `defaultConfiguration` is
  `production` (optimised, no `window.ng`), while `doctor`'s `dev-build` check requires `window.ng` and M022 measured
  that a production build keeps `__ngContext__` but drops the `ng` global surface. Only `serve` (defaultConfiguration
  `development`) gives a panel page that any `ng.*` recipe can read.
- **Source**: `.project/CHARTER.md:259-260` (AR-7); `apps/angular-ai-devtools/project.json:125-134` (`serve-static`),
  `:100-112` (`serve`), `:14` (`"defaultConfiguration": "production"`);
  `control-angular-dev-app/SKILL.md:124-126` (`dev-build` = `window.ng` exists);
  `scripts/ng-context-dev-build.test.mjs:2-17` (the measured differential: development carries the `ng` surface,
  production does not); `docs/feature-proposals.md:917` (the panel inspecting itself through `frameURL`).
- **Confidence**: high.
- **Why it matters here**: the cheapest component fixture in the repository is the panel itself — it already has a
  route per explainer and a router. But it is built on Angular **22.1.8** (the root install) while both spike
  fixtures are **22.2.2**, so "the panel is a fixture" and "the fixtures are 22.2.2" are two different subjects, and
  only the `serve` (development) entry point makes the panel inspectable.

## Finding 25: Two duplicated/dead fragments a fixture change would have to reconcile

- **Claim**: (a) `spikes/ng222-ssr/src/server.ts` registers `GET /api/items` **twice** — once at `:18-25` and again at
  `:71-78`, glued onto the `export const reqHandler = …` line at `:68` with no newline; the second registration can
  never answer, because the first handler ends the response. (b) The panel driver reads
  `[data-testid="owning-component"]` for the interop feature, but `InteropComponent` renders no such element, so that
  read is always `null` and no interop check asserts it.
- **Source**: (a) `git show HEAD:spikes/ng222-ssr/src/server.ts` (both blocks are in the committed file; the SSR proof
  entry's recorded blob `99138f0b…` is the current file, so the fixture is "fresh" while carrying the duplicate);
  (b) `.commandcode/skills/control-ai-browsers/scripts/panel.mjs:310-313` vs
  `apps/angular-ai-devtools/src/app/interop.component.ts:19-26` (the slice's test ids are `interop-slice`,
  `interop-limit`, `interop-node`, `source-node`, `producer`, `consumer`, `interop-inferred`, `explain`), and
  `.commandcode/skills/verify-ai-browsers/checks/interop.mjs:112-125` (which asserts `nodes`, `limits`, `inferred`
  and the answer — never `component`).
- **Confidence**: high.
- **Why it matters here**: (a) means the SSR fixture's transfer-cache and render-mode recipes can be reasoned about
  wrongly — the server log counts one hit per request, not two — and any new route added beside it should not copy the
  shape. (b) is a half-built selector left over from the error-explainer flow; if a component-level fixture is meant to
  prove that the panel names an owning component in the interop flow, the assertion would have to be added, and it
  would fail today.

## Finding 26: The Pangular checks cannot consume any in-repo fixture — they need the external portal, and Pangular 0.0.7 cannot enumerate this workspace's components

- **Claim**: `verify-pangular-inspector`'s `live-reads` runs against the Insurance Portal checkout outside this
  repository (`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`), started through
  `control-angular-dev-app --target portal`; the Pangular pin is 0.0.7, which has **no `list-components` tool** and
  whose stdio source scan returns `[]` at this workspace root and only 4 app-shell components with
  `--root apps/insurance-portal`. `stale-view.mjs` records the same conclusion for its own portal half
  (`portal.exercised: false`).
- **Source**: `.commandcode/skills/verify-pangular-inspector/SKILL.md:16-18`, `:29-30`, `:59-60`;
  `.commandcode/skills/control-pangular-inspector/SKILL.md:17-19`, `:221-226`;
  `.commandcode/skills/control-pangular-inspector/features/.proven.json` (every feature recorded `external`);
  `.commandcode/skills/verify-ai-browsers/checks/stale-view.mjs:104-106`.
- **Confidence**: high.
- **Why it matters here**: if M023's new fixture is expected to serve the Pangular checks, it cannot: Pangular is
  installed in the portal, not here, and its component tools are live-only. The fixture work is for the
  **`control-angular-dev-app` + `verify-ai-browsers` + `verify-angular-devtools`** chain, and for N23's Aria rules
  read through `ng.getDirectives` (`docs/feature-proposals.md:722`).

## Finding 27: `AGENTS.md` names a helper path that does not exist in this checkout

- **Claim**: `AGENTS.md:12-13` says the GSD Path helpers run `scripts/gsd/gsd.ts` via
  `%USERPROFILE%\.commandcode\gsd.bat`; there is no `scripts/gsd/` directory in this repository (the 35 entries in
  `scripts/` are all `*.test.mjs`, `*.mjs` or the one `.ts` plugin), so the file the rule names lives only in the
  user-scope tree.
- **Source**: `AGENTS.md:12-13`; directory listing of `scripts/`.
- **Confidence**: high that the path is absent here; low on which tree is meant to own it (the rule's other sentences
  are all user-scope).
- **Why it matters here**: only as a warning that `AGENTS.md` mixes repository and user-scope paths. A task that
  cites `AGENTS.md` for a path should verify it exists in the checkout, or it will plan a file it cannot read.

## Finding 28: The portrait — what each of the six panel surfaces needs from a page before it can produce a finding

- **Claim**: every explainer in `apps/angular-ai-devtools/src/app/` produces its finding from **page-published
  records already in `ExtensionMessageService`**, never from a panel-side probe, so a fixture only has to make the
  page *emit* the right record. Read as a table, the fixture requirements differ per surface and none of them is
  `find_components`:

  | Route (`app.routes.ts:9-18`) | Needs from the page | Emitted by | Test ids the driver asserts |
  |---|---|---|---|
  | `''` N1 "Why did this update?" | at least one change-detection cycle carrying `checks[].componentName` + `graph`, plus `angular-ai:state` | `agent-main.js:488-583` (`openCycle`/`captureGraph`), `:939-958` | `component-picker`, `chain`, `empty`, `empty-reason`, `explain`, `ai-answer` (`n1-update-cause.component.ts:18-58`) |
  | `signal-provenance` N2 | the same cycles, grouped by `componentName`, with graph nodes | as above (`signal-provenance.service.ts:20-54`) | `component-picker`, `ai-answer` |
  | `di-doctor` N3 | an `angular-ai:di-graph` message with a `resolutionPath` per component | `agent-main.js:703-810` (the `angular-ai:di-query` responder) | `component-picker`, `tab-path`, `tab-diff`, `path-display`, `diff-display`, `explain`, `ai-answer` (`n3-di-doctor.component.ts:15-53`) |
  | `error-explainer` N4 | a captured `NG0xxx` error with its owning component | `src/main-world/error-capture.ts:43-75` (`ng.getOwningComponent`), `extension/error-digest.json` | `captured-error`, `error-code`, `owning-component`, `digest-entry`, `explain`, `ai-answer` |
  | `stale-view` N24 | a cycle whose graph has a template node reading a plain field written in a subscribe callback | `spikes/ng222-app/src/app/stale-view-fixture.ts` at `/stale-view` | `stale-finding`, `hedged`, `field-name`, `owning-component`, `explain`, `ai-answer`, `empty-state` |
  | `interop` N25 | a cycle whose graph has a `toSignal` node and an unlabelled effect calling `subject.error` | `spikes/ng222-app/src/app/stale-view-deferred-fixture.ts` at `/stale-view-deferred` | `interop-slice`, `interop-node`, `interop-limit`, `interop-inferred`, `explain`, `ai-answer` |

- **Source**: the component and service files cited per row; the driver's selector table at
  `control-ai-browsers/scripts/panel.mjs:260-262` and its per-feature reads at `:290-316`; the checks at
  `verify-ai-browsers/checks/stale-view.mjs:95-101` and `interop.mjs:112-125`; the feature files
  `control-ai-browsers/features/{stale-view.md:26-32,interop.md:37-42,extension-panel.md:42-47}`.
- **Confidence**: high (each requirement is a literal `data-testid` read in `panel.mjs`, or a service that reads one
  signal).
- **Why it matters here**: this is the acceptance surface a new fixture must satisfy, and it is **narrower** than
  "component-level fixture": five of the six surfaces need a *cycle with a signal graph*, and only N3's needs a
  DI-graph answer. A fixture that renders nice components but produces no `angular-ai:record` yields
  `no components recorded yet — interact with the page to record a change-detection cycle`
  (`n1-update-cause.component.ts:52-58`), which reads like a panel bug. Practical consequence: a component added to a
  fixture is only a *subject* once something clicks it (the profiler opens a cycle on an event,
  `agent-main.js:488-505`), and that is what a "harness target … action-observable" must guarantee.

## Apparent intent

- **The repository is becoming a two-sided instrument**: a panel that explains, and a page realm that measures, with
  the fixtures as the third leg. M023's stated purpose — "so the harness and Aria features have subjects to be right
  about" (`ROADMAP.md:904`) — reads as the moment the fixture stops being a demo app and becomes a **specification
  surface**. — based on the wording of `ROADMAP.md:915`/`:918`, the four-H2 contract for feature files
  (`control-angular-dev-app/features/README.md:48-52`), and the `.proven.json` mechanism that hashes the fixture
  sources as proof.
- **The direction of travel is a fixture that can be inspected without a human**: the panel→page read port
  (`page-reads.ts`) was written before its transport on purpose ("That is the whole point of the port existing before
  the transport"), which is an intent to build the responder later. — inference from
  `page-reads.ts:14-31` and `read-tools.ts:17-23`.
- **The repository is deliberately accumulating narrow apps rather than one big fixture**: two standalone Angular CLI
  apps with separate lockfiles on a version the workspace does not use, plus the panel as a third page. — based on
  `spikes/*/package.json`, `control-angular-dev-app/scripts/control.mjs:78-110`, and `CHARTER.md:259-260` (AR-7).
- **Verification is the product**, not a phase: 28 script tests, 9 extension tests, 14 `verify-*` checks (8 + 3 + 3),
  5 `features/.proven.json` manifests, and pins that assert their own non-vacuity. — based on `scripts/` and
  `.commandcode/skills/verify-*/checks/`.

## Open questions for define

- Should the Aria/CDK/Material surfaces land in **`spikes/ng222-app`** (which requires re-pinning
  `scripts/ng-context-dev-build.test.mjs:110-132,682-696` and accepting that the file's "the fixture is untouched"
  test is weakened) or in a **new app** (which requires all six declarations in Finding 2 and a new install to
  provision)? `ROADMAP.md:918` hints at a new app; `:912` says "the verification fixture", singular.
- Is the new fixture a **top-level page** served by `control-angular-dev-app` (inspectable by the extension, needs a
  `TARGETS` entry and a port) or a **sub-frame** (Vitest browser mode / story canvas, invisible to the extension
  because of AR-5)? Finding 9 says it cannot be both.
- Does M023 also build the **page-read responder** (Finding 3/4)? The milestone text does not mention it, but
  "component claims … exercised against a real Angular app" cannot use `find_components`/`inspect_component` until
  something answers them. If not, what is the milestone's stated *proof* that a component claim was exercised?
- What is the authoritative component identity for a fixture assertion — host tag (`app-counter`), class name
  (`Counter`), or graph id (`cmp:Counter`)? Three exist (Finding 5) and the panel's own specs disagree with the
  shipped realm (Finding 6).
- Should the four `map-fresh`-stale proofs (Finding 10) be **re-recorded** in this milestone, and does re-recording
  count as "touching a pin"? `fingerprint.mjs record` rewrites `provenAt`/`commit` and would add the two stale-view
  files to the closure.
- Is `@angular/material` wanted at all, given `ROADMAP.md:920` keeps NgModule-based Material entry points out and
  `:933` warns that Material/CDK version lines can drift from the fixture's Angular? A CDK-only fixture may satisfy
  HAR-1..4 and N23 with one fewer version line to keep in step.
- Which Markdown path is inside the docs-audit inventory (Finding 19) — `.claude/skills/**` only, or also
  `.commandcode/skills/**`? That decides whether a new `features/<id>.md` needs an audit row before it can be shipped.

## Blocked areas

- **The full check and test suites were not run.** The verify sidecar has no `node_modules` and the brief's
  verification for this role is the output file's own proof, so `npm run check` and `npm test` are reported from
  their source and their pins, not from a run. Everything asserted about a pin's *effect* comes from reading the
  assertion; everything asserted about the *fixture's bytes* comes from `git hash-object` at the head.
- **Live page behaviour was not observed.** No browser instance was started, so all statements about what a page
  reports (`window.ng` contents, `hydratedComponents` counts, the signal graph's node labels) are quoted from recorded
  evidence in this repository (`research/raw/*.json`, `docs/feature-proposals.md:914-929`,
  `control-angular-dev-app/SKILL.md:284-299`) rather than measured here. In particular I could not confirm the
  counter page's live component count; the claim in Finding 7 is from the source, not from `__ngc.components()`.
- **The external portal checkout could not be inspected** (`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`
  is outside the workspace), so the `portal` target, four `control-angular-dev-app` portal features and three
  `verify-pangular-inspector` checks are described from this repository's documents only. Findings about them are
  marked with the document they come from.
- **`~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py`** — the gate whose derived inventory
  `docs-audit-disposition.test.mjs` compares — is outside this workspace and was not read, which is why Finding 19
  carries medium confidence on the covered path set.
- **The `-p/` directory at the repository root** appears in the directory listing (with an `echo/`, `done/` and
  `tmp/` that are empty or git-ignored) and is not referenced by any manifest read here; nothing was inspected inside
  it.
