# Intent — M032 lint-core

Lane: feature
Milestone: lint-core
Branch: gsd-path/M032
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

An Angular template or configuration diagnostic tells a developer that something is wrong and
names a construct, but it does not say which part of the app the construct belongs to. The panel
shows nothing about it.

Measured before planning:

- `extension/error-digest.json` carries **six** NG8xxx codes — NG8001, NG8002, NG8003, NG8011,
  NG8023, NG8024 — out of 64 entries.
- **No tsconfig in this repository enables `extendedDiagnostics`**: `grep` over
  `spikes/ng222-app/tsconfig*.json` and the root `tsconfig.json` finds neither that key nor a
  `strictTemplates` setting.
- These are **compile-time** diagnostics. The page agent reads a running page through
  `window.ng`, dev-mode console messages and the profiler; it reads no build log and no
  diagnostic stream.

## Users

A developer who has been told by the compiler or a lint surface that a construct is wrong, and
needs to know which element, component or binding carries it, and what to change.

## Success criteria

1. On the fixture, a construct the tool can observe produces a finding naming that construct and
   the diagnostic code when the digest carries one, and nothing the message does not state: the
   message names no element and no component, so the finding names neither.
2. The finding is produced from observables the agent already collects — dev-mode console
   messages, `window.ng` reads and the app facts — with no new page-side instrumentation and no
   build-log scraping.
3. A diagnostic the tool cannot observe from the page reports "cannot tell", with the reason,
   rather than an invented cause or a construct guessed from proximity.
4. The panel renders the construct, the code and its explanation from a short fact list, and
   shows the "cannot tell" state.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | `scripts/lint-core.test.mjs` — a construct with no observable diagnostic yields no finding |
| E2 | SC2 | boundary | held-out | `scripts/lint-core.test.mjs` — with the console read removed, no finding is produced |
| E3 | SC3 | ordering | held-out | `scripts/lint-core.test.mjs` — a diagnostic outside the digest reports "cannot tell" with its reason |
| E4 | SC4 | adjacency | held-out | `scripts/panel-lint.test.mjs` — the surface renders the construct, the code and the cannot-tell state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: patch the compiler, subscribe to a build, or add a second page-side instrumentation path | criterion SC2 | the surface must show what the app already exposes |
| N2 | SC1 | N2: assign a cause the diagnostic does not state — no "because the import is unused" unless the diagnostic says so | criterion SC1 | the same rule M029, M030 and M031 each enforced with a mutant |
| N3 | SC3 | N3: name a construct the finding did not observe, or match a diagnostic to a nearby element | criterion SC3 | proximity is not attribution |
| N4 | SC4 | N4: render an explanation the fact list does not support | criterion SC4 | the surface shows the facts it was given |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the product |

## Scope

In: reading the dev-mode console diagnostics the agent already captures; the code-to-construct
join; the panel surface; a named "cannot tell" state for a diagnostic the page cannot supply.

Out: scraping a build log or a CI artefact; enabling `extendedDiagnostics` in the fixture to
manufacture a subject; naming a cause the diagnostic does not state; code generation;
`@angular/animations`, SSR and `angular/components` (A5); DOM added to an inspected page (AR-3).

## Corrections

- **The roadmap's premise assumes a page-side diagnostic exists.** The roadmap entry says this
  milestone explains "why the compiler reported this template, lifecycle or configuration
  problem". Those reports are compile-time, and the tool reads a running page. The measured facts
  above are recorded here rather than discovered at the ship gate, and T001 measures which
  diagnostics — if any — reach the page's console, before T002 is written against a read.
- **No extended diagnostics are enabled in this repository.** A milestone that needs a
  diagnostic to exist must not switch `extendedDiagnostics` on to manufacture one; that would
  make the subject a fixture artefact rather than an observable the tool meets in the field.
- **SC1 promised the element or component, and the message carries neither.** T001 measured the
  observable diagnostic: `NG0950` reports `Input "requiredLabel" is required but no value is
  available yet` — the input property, no element, no component. The only place a component name
  appears is the stack frame, which is a fact about where the throw happened, not about the
  construct. SC1 is therefore narrowed to the construct and the code, and the finding drops the
  stack rather than carrying it, so a surface rendering the finding cannot name a component the
  message never named.

## Risks

- Whether any NG8xxx diagnostic reaches the page's console is unmeasured. If none does, SC1 is
  unsatisfiable as written and the honest outcome is a "cannot tell"-only milestone — which T001
  must settle before T002 exists, not after.
- The console capture that M027 added carries a browser build and a timestamp. Any recording this
  milestone adds must not pin a machine-derived value, the defect M025, M026 and M027 each hit.

## Open questions

- Do any NG8xxx diagnostics reach a development build's browser console on this fixture, and if
  so does the message carry the element or component it concerns? T001 records what it finds; the
  rest of the plan is built against that recording, not an assumption.
