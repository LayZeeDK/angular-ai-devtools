# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 3bc23270a00f3fb34197fa2aae5c54cb04d6f990

## T001 — Measure the provider record and the formatter the page carries: pass

- ✅ The landing is the work the contract names: `git show --stat 3bc23270` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m061-record-shapes.json`, `scripts/locale-correctness-shapes.test.mjs`.
- ✅ The measurement contradicts the contract in one place, and the record states the contradiction: the injector walk derives a token string as `token.name ?? token.toString() ?? String(token)` (`extension/agent-main.js:1169-1178`), so `@angular/core@22.1.8`'s `LOCALE_ID` — an `InjectionToken` with no `name` — appears as `InjectionToken LocaleId`, never as the literal `LOCALE_ID`. The record pins the derivation rule and the suite recomputes the string from the installed token, so a drift reddens.
- ✅ The provided value is not recoverable: `:1184-1185` reduces `useValue` to the kind string `value`, and the entry literal at `:1215-1223` reads no `useValue`. Recorded as `absence.locale-value-not-recorded`.
- ✅ `ɵgetInjectorProviders` occurs at 11 non-comment places; only `:1151` is a direct call. The record states the walk at `1149-1155` as the only read it reduces and counts the other ten rather than claiming them away.
- ✅ `research/raw/stale-view-counter.json` does not parse (truncated), so it is named under `unparsable` instead of passing as clean.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T001: the evidence above is the assertion this criterion rests on, read from the landing at `3bc23270` and from the suite runs the Log records.

### SC3 — The finding is produced from the observables the agent already holds — the injector walk's provider entries and the formatter the record names — with no new page-side instrumentation and no second read of the inspected page.: pass

- ✅ Covered by T001: the evidence above is the assertion this criterion rests on, read from the landing at `3bc23270` and from the suite runs the Log records.
