# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: blocked
Tasks reviewed: 4
Reviewed HEAD: 105e04be9571ab659210cf01a65c71eac7b71236

> Reconstructed by the orchestrator: the reviewer's file was destroyed when its worktree was retired before collection. The verdicts, the reason and the risks below are that reviewer's recorded return.

## T005 — Attach the one closed-shadow host once at document_start through a new manifest declaration: pass

- **Checks**: acceptance criteria against the diff and the recorded verify (`tests 45 pass 0 fail`); the SC3 shape, the manifest pin and the blast-radius pins read directly.
- **Observed**: guard-first idempotency, closed root on `documentElement`, and the corrected SC3 proof with both mutant bites. The host-id departure from decision 5 judged stronger than its letter.

## T006 — Resolve a picked page element to its owning component in the page realm: pass

- **Checks**: acceptance criteria against the diff and the recorded verify (`tests 50 pass 0 fail`).
- **Observed**: capture listener on `event.target`, `getOwningComponent` resolution for an element inside a view (E5), a plain-data descriptor with a JSON round-trip proof, and three distinguishable outcomes. `no-dev-api` follows the 2026-11-03 correction; the AC text is stale, the code is not.

## T007 — Carry the picker command and its outcomes between the panel and the page: fail

- **Checks**: no `verify.json` at `gsd-path-M022/T007/attempt-1/`, no ledger row at the landing, no orchestrator Log entry.
- **Observed**: all eight acceptance criteria rest on the coder's Log summary only, so each is `unverifiable` rather than pass.

## T008 — Draw the tracked rect and label in the overlay, and make hover, lock and cancel work: fail

- **Checks**: the same absence at `T008/attempt-1/`.
- **Observed**: the bare-`node:vm` geometry claim and the live CDP drive are real as artifacts, but no test run was recorded, so the criteria are `unverifiable`.

## Intent coverage

### SC1 — The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component.: fail

- **Checks**: the drawer's evidence is unrecorded (T008).
- **Observed**: the geometry and the hop recording exist and agree, but no Verify was captured.

### SC2 — Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host.: fail

- **Checks**: the page-realm half is proven by T006; the panel half rests on T007's unrecorded run.
- **Observed**: the descriptor path is evidenced, the transport path is not.

### SC3 — No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed.: pass

- **Checks**: T005's corrected proof mutates the host's light tree and pairs it with a page mutation.
- **Observed**: both halves bite; deleting the predicate or `observe()` reddens the right assertions.

### SC4 — The host is inserted exactly once per page load, asserted across a re-injection attempt.: pass

- **Checks**: the guard-first no-op and the one-element count across a re-injection attempt.
- **Observed**: asserted, including after the relay boots into the same document.

## Summary

Blocked on one reason: T007 and T008 have no recorded Verify, because both landed through the direct `isolation.py land` fallback, which records the landing but does not execute the Verify. T005 and T006 pass. Cross-task risks: the relay still degrades silently when the filter is absent; the `.proven.json` provenance is stale for all four extension files this wave changed; T006's `no-dev-context` wording; and the extension-reload case where a re-injected relay answers `{ok:true}` with no command listener in the page.
