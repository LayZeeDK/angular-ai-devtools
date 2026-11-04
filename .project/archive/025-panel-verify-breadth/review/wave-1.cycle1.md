# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: e50cb499531736cbf6a3dba66d041c2f1dce57d5

## T001 — The extension gets a type check that runs: pass

- ✅ `extension/tsconfig.json` read at e50cb49: `allowJs`/`checkJs`/`noEmit` true, `strict: false`, target ES2022, `types: ["chrome"]`, `include: ["**/*.js"]`, `exclude: ["panel/**"]` as the only exclusion — and the comment header states the panel exclusion (build output, 187 of 220 non-strict errors) and the strict gap (7308 errors) before `"compilerOptions"`.
- ✅ `package.json` read: `check` ends `... && npm run check:extension` and `check:extension` is `tsc -p extension/tsconfig.json`; `@types/chrome` ^0.3.7 is a devDependency, so it never enters the bundle.
- ✅ `tsc -p extension/tsconfig.json --listFiles` re-run: the program holds exactly the 9 authored sources (agent-main, background, devtools, observer-filter, overlay-geometry, overlay, panel, relay, stale-view-worker) and 0 files under `extension/panel/`.
- ✅ verify ledger (T001 Log): the orchestrator's recorded run left the 14 real errors unfixed at edd0740, nothing suppressed, `npm run check` failing only at `check:extension` — matching the measured before-state (33 probe errors = 19 TS2304 `chrome` + 14 real + 1 second-location line; RESEARCH's 20/13 split corrected in the Log).

## T002 — Fix the thirteen real defects: pass

- ✅ `npx tsc -p extension/tsconfig.json` re-run at e50cb49 after `npm ci --include=dev`: exit 0, no output — 14 → 0 confirmed at this head.
- ✅ `extension/relay.js:14,18,23,29,40,47` read: each listener parameter is annotated `(/** @type {CustomEvent} */ e)` and the body reads `e.detail` — the listener is typed as the event it actually receives; `Event` is not widened with an index signature and there is no cast. The runtime premise is confirmed at the dispatch sites: `extension/overlay.js:138` and `extension/agent-main.js:936` dispatch `new CustomEvent(type, { detail })` on `window`.
- ✅ `extension/panel.js:2-7` read: the shadowed binding is renamed `status` → `statusEl` (`document.getElementById('status')`, an HTMLElement) with a comment naming the `window.status: string` shadow; `.textContent` is written on the element — no cast, no suppression.
- ✅ `extension/agent-main.js:937` read: the no-CustomEvent fallback is `Object.assign(new Event(type), { detail: detail })` — a real `Event` of the requested type carrying the same `detail`, replacing the bare `{ type, detail }` literal that was never an `Event`; the CustomEvent path at :936 is untouched.
- ✅ `extension/stale-view-worker.js:161,177` read: the file's own scope names are published with `Object.assign(self, {...})` / `Object.assign(global, {...})` — same own properties, values and order as the assignments they replace; no platform type is written.
- ✅ grep over the whole `extension/` tree (including `panel/` and the `.test.mjs` specs) for `@ts-ignore|@ts-expect-error|@ts-nocheck|as unknown|as any|@type {any}`: **zero hits**.
- ✅ behaviour preserved: `node --test extension/agent-main.test.mjs extension/overlay.test.mjs extension/relay.test.mjs` re-run = 108 pass / 0 fail; `node --test tests/held-out/stale-view-worker-supersession.test.mjs` = 4 pass / 0 fail — all four files T002 touched stay green.

## T003 — Prove the extension check bites: pass

- ✅ `node --test scripts/extension-typecheck.test.mjs` re-run at e50cb49: tests 5, pass 5, fail 0; every mutant reddened exactly its target assertion (probe removed / second authored file; exclusion dropped / exclusion widened; JavaScript added / config absent; strict flipped / header stripped / statement dropped / exclusion widened), and the checkout `extension/` tree is hashed and asserted byte-identical (28 files) after the runs.
- ✅ E2's breadth half re-run: `--listFiles` over the panel-probe fixture holds 9 authored files and 0 panel files, so the exclusion is the generated directory and nothing wider.
- ✅ E3's caveat verified independently, not from the Log: my own probe — a config over a tree with no JavaScript — answers exit 2 with the sole diagnostic `error TS18003: No inputs were found in config file`. `tsc` cannot exit 0 on a zero-input program, so the narrowed assertion (no file errors, TS18003 named, no TS5058) is honest and pins the no-inputs state the edge is about.
- minor receipt discrepancy, no criterion impact: the T003 Log prose says the digest covers "44 files"; the suite and the tree hold 28. The artifact's assertion (28, byte-identical) is the correct one.

## Intent coverage

### SC1 — `npm run check` type-checks every authored file under `extension/`, with the generated `extension/panel/` bundle output excluded and the exclusion stated where the config lives.: pass

- ✅ `package.json` chains `npm run check:extension` = `tsc -p extension/tsconfig.json` into `check`; the re-run `--listFiles` shows exactly the 9 authored sources in the program and 0 files under `extension/panel/` — no authored file excluded (N2 holds).
- ✅ the exclusion is stated where the config lives: the `extension/tsconfig.json` header names `exclude: ["panel/**"]` as the only exclusion, names it build output, and quantifies it (187 of 220 non-strict errors) — asserted textually by the T003 suite's E4.

### SC2 — That check reports zero errors, and every non-global defect the probe found — fourteen, not the thirteen estimated in the plan — is fixed at source rather than suppressed.: pass

- ✅ re-run `npx tsc -p extension/tsconfig.json` at e50cb49 after `npm ci --include=dev`: exit 0, no diagnostics.
- ✅ every error site fixed at source and read back: relay.js listeners typed `CustomEvent`, panel.js `status` → `statusEl` rename, agent-main.js real-`Event` fallback, stale-view-worker.js `Object.assign` publication — no suppression anywhere (N1 holds; grep: zero hits).
- ✅ behaviour: 108/108 extension suite tests and 4/4 held-out stale-view-worker tests re-run green.

### SC3 — A deliberately wrong property introduced into an extension source makes `npm run check` exit non-zero; an error placed inside `extension/panel/` does not, because that directory is generated.: pass

- ✅ E1 (held-out) re-run: a `noSuchProperty` probe appended to a copy of `panel.js` makes the check exit 2 naming only `extension/panel.js(14,11): error TS2339`; the stage is chained into `check`, so a red `check:extension` reddens `npm run check`.
- ✅ E2 (held-out) re-run: the same probe inside `extension/panel/` leaves the check green with 0 diagnostics, and the green dies (exit 2 naming the panel probe) the moment the exclusion is dropped — the exclusion, not luck, keeps it green.

### SC4 — The strict-mode gap is recorded: the check runs at `strict: false`, and the reason (hand-written JS with implicit-any throughout) is stated in the config header.: pass

- ✅ `extension/tsconfig.json` read: `"strict": false` with a header stating it is deliberate, the 7308-error strict measurement over the same sources, implicit-any in hand-written JavaScript, and that the gap is recorded rather than hidden (N4 holds: no strict-clean claim anywhere).
- ✅ E4 re-run asserts the setting and 8 header sentences from the config text, with mutants (strict flipped, header stripped, only-exclusion sentence dropped, exclusion widened) each reddening — the record is held by a test, not by prose.
