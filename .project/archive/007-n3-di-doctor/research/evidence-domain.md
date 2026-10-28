# Evidence — domain

Dimension: domain
Questions assigned: Which DI questions are answerable from the tools alone vs. needing additional page-agent data.

## Finding: Path trace and two-component diff are fully answerabled from tools alone

- **Claim**: `ɵgetInjectorResolutionPath` returns the full element→env injector chain, `ɵgetInjectorMetadata` identifies each injector, and `ɵgetInjectorProviders` lists provider records. Diffing two paths yields the first divergent injector.
- **Source**: `research/05-spikes.md` S2 (5 injectors measured on counter app); `research/17-vitest-browser-runtime.md` S1
- **Confidence**: high
- **Why it matters here**: satisfies SC1, SC2, SC3 — no page-agent data needed beyond the injector APIs

## Finding: Token lookup is partially answerabled — name matching only on Tier 1

- **Claim**: `ɵgetInjectorProviders` lists providers but extension has no import access to app token objects; Tier 1 matches by token name only. Identity matching (Tier 2 opt-in) is needed for robust lookup.
- **Source**: `research/04-ecosystem.md:10` (token lookup problem); feature-proposals N3 §3.4 (opt-in export, Tier 2)
- **Confidence**: high
- **Why it matters here**: informs SC2 edge — name match may be ambiguous; Tier 2 opt-in improves accuracy without changing Tier 1 default

## Finding: NullInjectorError recovery is answerabled via error + path reconstruction

- **Claim**: For `NullInjectorError`, N4 reconstructs the path at the failing component and passes the token name from the error message to `di_lookup`, which reports "no provider record on this path."
- **Source**: feature-proposals N3 §3.4 and N4 §3.4
- **Confidence**: high
- **Why it matters here**: satisfies SC4 — the panel can explain a failed injection

## Finding: providedIn: 'any' and injection flags are not supported

- **Claim**: N3 does not support `providedIn: 'any'` tokens (one instance per lazy env injector) or injection flags (@SkipSelf, @Host, etc.).
- **Source**: `research/12-legacy-vs-modern-angular.md` I2; feature-proposals N3 §3.4
- **Confidence**: high
- **Why it matters here**: accepted limitations — recorded in INTENT.md scope-out and Risks

## Assigned questions — answers

- Which DI questions are answerable from the tools alone vs. needing additional page-agent data. → Path trace, two-component diff, token lookup (Tier 1 name-match), and NullInjectorError recovery are all answerabled from `ɵgetInjector*` alone; `providedIn: 'root'` tokens with no consumers have no record (caveat); identity matching (Tier 2) improves token lookup but is opt-in

## Dead ends

- `injector.get(Token)` on main world — prohibited (constructs nothing; N3 reads only via `ɵgetInjector*`)
