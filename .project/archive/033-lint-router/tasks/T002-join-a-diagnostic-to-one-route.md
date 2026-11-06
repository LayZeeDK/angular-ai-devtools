---
id: T002
title: Join a routing failure to the configured routes it failed to match
wave: 1
status: done
deps:
  - T001
agent: free-beam-high
base: 7ffed253b639cd4e32ff4e70e1d01b27602ced67
worktree: null
task_branch: null
files:
  - extension/router-diagnostic.js
  - scripts/router-diagnostic.test.mjs
---

# T002 — Join a routing failure to the configured routes it failed to match

## Context

T001 measured the only router diagnostic this fixture puts on a console: `NG04002: Cannot match any routes. URL
Segment: 'this-route-does-not-exist'`. Its recording says `digestCarriesCode: false` and `namesConfiguredRoutePath:
false`, and it carries the 15 configured paths read at the same instant.

So the join is not "which configured route does this belong to" — the whole message means no configured route matched.
The join is: take the segment the message names, compare it against the configured paths, and report the absence,
listing what was compared.

## Approach

A pure module that takes the captured messages and the configuration and answers per message. It extracts the URL
segment from the message text and compares it to the configured paths.

A segment matching **no** configured path is the finding: the tool can say which navigation target failed and that
none of the configured routes covers it. A segment that **does** match a configured path is `cannot-tell` — the router
failed for a reason the message does not give, and guessing one is the failure this programme keeps removing. A
message with no extractable segment is `cannot-tell` with its own reason.

The module reads no clock, no console and no DOM, so a test can drive it from the recording alone.

## Interface contract

`routerDiagnostic(messages, facts) -> { state: "finding" | "cannot-tell", segment?, code?, message?, consideredCount?, reason? }` — pure, no DOM.

## Files

- `extension/router-diagnostic.js` — the module.
- `scripts/router-diagnostic.test.mjs` — its suite, driven by T001's recording.

## Acceptance criteria

1. Held-out E1: a message naming a segment that matches no configured path produces a finding naming that segment,
   stating that none of the configured routes matches it, and carrying the code the message stated even though the
   digest does not carry it.
2. Held-out E3: a message naming a segment that **does** match a configured path produces `cannot-tell` with reason
   `segment-matches-configuration` and no segment-level claim about why the navigation failed.
3. A message from which no segment can be extracted produces `cannot-tell` with reason `no-url-segment`.
4. A message whose code the digest does not carry records the code it saw and explains nothing about it.
5. The finding states how many configured paths were compared, and names no configured route as the owner (E2).
6. The module names no guard verdict, resolver outcome or redirect decision.
7. A mutant that names the nearest configured route as the owner reddens AC1's pin by name; a mutant that omits the
   code reddens AC4's.

## Verify

```bash
node --experimental-strip-types --test "scripts/router-diagnostic.test.mjs"
```

## Intent coverage

- SC2
- SC3

## Log

- dispatched
