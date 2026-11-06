# Intent — M033 lint-router

Lane: feature
Milestone: lint-router
Branch: gsd-path/M033
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A routing diagnostic tells a developer that something is wrong with a route, but not which
configured route it concerns. The panel shows nothing about it.

Measured before planning:

- `extension/error-digest.json` carries six router-related codes out of 64 entries: `NG0300`,
  `NG0301`, `NG0302`, `NG0318`, `NG0401`, `NG0403`. It carries **no** `NG04002`
  (`Cannot match any routes`) or its siblings — the runtime family a developer most often meets.
- No tsconfig in this repository enables `extendedDiagnostics`, so no compile-time router lint
  runs here, exactly as M032 measured for the core lint surface.
- `Router.config` **is** readable: M030 established `ng.getInjector(el).get(Router)` on a routed
  element and recorded twelve entries with `path`, `component`, `redirectTo`, `canActivate` and
  `loadChildren`.

These three facts pull in different directions: the configuration is readable, the compile-time
lint does not run, and the runtime error codes are absent from the digest. Which router
diagnostics actually reach the page — and whether any names a configured route — is unmeasured,
and T001 must measure it before T002 is written against a read.

## Users

A developer whose router reports a problem, and who needs to know which configured route carries
it and what to replace.

## Success criteria

1. On the fixture, a navigation failure the page console reports produces a finding naming the unmatched URL
   segment and stating that none of the configured routes matches it, recording the code the message stated even when
   the digest does not carry that code.
2. The finding is produced from observables the agent already collects — the `Router`
   configuration through `ng.getInjector` and dev-mode console messages — with no new page-side
   instrumentation and no build-log scraping.
3. A finding that cannot be attributed to exactly one configured route reports "cannot tell" with
   the reason, rather than picking the nearest route or naming a guard verdict the configuration
   does not record.
4. The panel renders the unmatched segment, the code the message stated and how many configured
   routes were considered, from a short fact list, and shows the "cannot tell" state: it names no
   route as the owner and no remedy, because the message states neither.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | `scripts/lint-router.test.mjs` — a configuration with no flagged route yields no finding |
| E2 | SC2 | boundary | held-out | `scripts/lint-router.test.mjs` — with the configuration read removed, no finding is produced |
| E3 | SC3 | ordering | held-out | `scripts/lint-router.test.mjs` — a finding matching two configured routes reports "cannot tell" |
| E4 | SC4 | adjacency | held-out | `scripts/panel-router.test.mjs` — the surface renders the route, the finding and the cannot-tell state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: add a second page-side instrumentation path, or scrape a build log or CI artefact | criterion SC2 | the surface shows what the app already exposes |
| N2 | SC3 | N2: name a guard verdict, a resolver outcome or a redirect decision the configuration does not record | criterion SC3 | the same rule M029, M030 and M031 each enforced with a mutant |
| N3 | SC3 | N3: attribute a finding to the nearest route, or to the only route when several could match | criterion SC3 | proximity is not attribution |
| N4 | SC4 | N4: render a remedy the fact list does not support | criterion SC4 | the surface shows the facts it was given |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the product |
| N6 | SC1 | N6: name a route the configuration does not contain, or a remedy the diagnostic does not support | criterion SC1 | a finding must be built from what was read, not from what would be convenient |

## Scope

In: reading router diagnostics the page exposes; the join from a diagnostic to exactly one
configured route; the panel surface; a named "cannot tell" state for a diagnostic that cannot be
attributed.

Out: scraping a build log or CI artefact; enabling `extendedDiagnostics` to manufacture a subject;
adding runtime router error codes to the digest to make a finding possible; naming a guard verdict;
code generation; `@angular/animations`, SSR and `angular/components` (A5); DOM added to an
inspected page (AR-3).

## Corrections

- **SC4 promised a route and a remedy; the message states neither (measured).** T001 recorded
  `namesConfiguredRoutePath: false` for `NG04002`, and `digestCarriesCode: false` means no
  digest explanation exists either. N1 forbids a remedy the message does not state, so SC4 now
  names the unmatched segment, the code and the count of routes considered, and nothing else.
- **The roadmap's premise assumes the compiler flags a route declaration.** No tsconfig here
  enables `extendedDiagnostics`, and the compiler's router lint is compile-time — the tool reads a
  running page. T001 measures which router diagnostics, if any, reach the page's console, before
  any read is written.
- **The digest's router coverage is partial.** Six router codes are present and the runtime
  `NG04002` family is absent. A finding may therefore report only the codes the digest carries,
  and must record the code it saw when the digest has none rather than explaining it from
  sympathy.
- **The observable is a navigation failure, not a flagged declaration.** T001 measured one router diagnostic on the
  console: `NG04002: Cannot match any routes. URL Segment: 'this-route-does-not-exist'`. `digestCarriesCode` is
  **false** (the digest's 64 entries do not include it) and `namesConfiguredRoutePath` is **false** — the message names
  the URL segment that failed, not any of the 15 configured routes. SC1 is therefore aimed at the unmatched navigation
  target and at the absence of a matching configured route, not at a route that was flagged.
- **Configuration is readable but not decisive.** M030 measured that `Router.config` is available;
  it records `path`, `component`, `redirectTo`, `canActivate` and `loadChildren`, and no guard
  verdict. Attribution must therefore be by configured path, never by behaviour.

## Risks

- Whether any router diagnostic reaches the page's console is unmeasured. If none does, SC1 is
  unsatisfiable as written and the honest outcome is a "cannot tell"-only milestone — which T001
  settles before T002 exists.
- Attribution is the failure mode this milestone is most likely to get wrong: two routes can match
  one construct, and the nearest is not the owner. A mutant that picks the nearest route must
  redden.
- Any recording this milestone adds must not pin a machine-derived value — the defect M025, M026
  and M027 each hit, and which M032's T004 had to re-measure.

## Open questions

- Do any router diagnostics reach a development build's browser console on this fixture, and does
  the message name the configured path? T001 records what it finds; the rest of the plan is built
  against that recording, not an assumption.
