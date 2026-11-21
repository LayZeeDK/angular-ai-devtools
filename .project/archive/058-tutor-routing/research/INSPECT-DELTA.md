# INSPECT-DELTA — M058 `tutor-routing`

Measured 2026-11-21 on branch `gsd-path/M058` at HEAD `081203f9`.

## The delta since the audited head

Audited HEAD in force: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7`
(`.project/research/DOCS-AUDIT.md`).

```
paths changed since the audit base          203
  audited documents among them                2
    AGENTS.md
    plans/angular-ai-devtools-program-backlog.md
  non-audit paths                           201
    .project/  37   research/  21   scripts/  16
    apps/      11   extension/   7   .githooks/  1   (rest: plans/, root)
```

Two audited documents changed, and both were edited by this session
yesterday and today for reasons already recorded outside the audit: the
programme-management rules in `AGENTS.md`, and the Generation 3 rulings in
the backlog. Neither adds a document; both change text the audit already
covers, so their rows are the rows that need re-reading, not new ones.

## What this record does not claim

- It does not claim the **code** was audited. `extension/`, `scripts/` and
  `apps/` changed substantially (M051–M057), and no audit row covers them.
- It does not claim the archived `.project/` trees of M052–M057 were read;
  they are this milestone's predecessors' evidence, not documentation of
  the product.
- It does not re-open the 205 unverifiable queue rows recorded in
  `DOCS-AUDIT.md`; that debt is unchanged and is named there, not here.

## Premise check for M058's roadmap sentence

The entry claims the answer comes "from the recorded navigation stream and
the router config", naming "the route node, the redirect and the guard
verdict that decided it". Measured against the records that exist:

```
research/raw/m030-router-config.json      18 configured routes, 5 fields present
research/raw/m033-router-diagnostic.json  NG04002 messages, 18 routes,
                                          namesConfiguredRoutePath: false
research/raw/m041-navigation.json         9 navigation events, `reach` and
                                          `held`, no guard or redirect field
```

No record carries a guard verdict, and none carries a redirect as a
decision: `m041`'s own question is what an unfinished navigation looks like,
not which guard refused it. The intent records this as its first
correction; the observable is the navigation stream plus the config, and
"the guard verdict that decided it" is not among them.
