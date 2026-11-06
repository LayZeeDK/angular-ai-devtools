# Synthesis — M033 lint-router

## What the milestone established

The page console reports exactly one router diagnostic — `NG04002: Cannot match any routes. URL Segment: '<segment>'` — and it names **the segment that failed**, never a route in the configuration. `extension/error-digest.json` does not carry that code, so the finding records it without explaining it, and says that none of the fifteen configured routes matches the segment.

That is narrower than the roadmap's sentence ("why a route declaration is flagged") in two ways, both measured: no compile-time router lint runs in this repository, and the runtime message is about a navigation that failed rather than a declaration that was flagged.

## The four tasks

1. **T001** measured what reaches the console and what the message carries — the recording states `digestCarriesCode: false` and `namesConfiguredRoutePath: false` with fifteen configured paths read at the same instant.
2. **T002** built the join: absence of a match is the finding; a segment that *does* resolve to a configured path is `cannot-tell`, because that failure's cause is not in the message.
3. **T003** rendered it — `segment`, `code`, `message`, `considered`, and on `cannot-tell` only `reason` — and registered the surface in the panel demo, with both route-table pins declared up front.
4. **T004** re-recorded both manifests, both development-build recordings and the milestone's verdict claims, and cross-reconciled the two build recordings so neither can drift alone.

## What the gate found

Two failures, both in test pins rather than in the explainer: two coder-written suites were unformatted, and `scripts/after-render-fixture.test.mjs` still enumerated fourteen fixture routes after T001 added the fifteenth.

The `pinned-file` rule had named both files before dispatch. The rule was right; reading its output as "nine advisories" was the mistake.

## What carries forward

- A route table is enumerated by tests by design, so a `pinned-file` warning naming a suite that asserts one is a blocker in practice, whatever its level says.
- Two criteria were re-aimed on measurement (SC1, SC4) and both corrections quote the recording that forced them.
- `m030-router-config.json` was stale at twelve entries before this milestone touched it — the same drift M032's T004 found, and the reason every milestone must re-measure the recordings its change could stale.
