# Evidence — pitfalls

Dimension: pitfalls
Questions assigned: Prompt shape for anti-pattern explanation on small models.

## Finding: Prompt API availability must gate explain button

- **Claim**: On browsers without Prompt API, deterministic provenance still renders and explain button is disabled with reason.
- **Source**: `.project/intent/INTENT.md` Edge coverage E5/E6
- **Confidence**: high
- **Why it matters here**: prevents model calls where unavailable.

## Assigned questions — answers

- Prompt shape for anti-pattern explanation on small models. → Short fact list only; disable explain when unavailable.

## Dead ends

- Auto-explain on load — prohibited by N2.
