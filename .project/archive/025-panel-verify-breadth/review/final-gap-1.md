# Gap Review — 1: project Verify

Reviewed HEAD: 073ad1a9796bd4285d82faac557038bb32e7cd17
Gap verdict: pass
Risk: project Verify
Waves checked: 1

## Checked evidence

- **Check**: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`
- **Observed**: `.project/build/verify-ledger.jsonl` carries two rows. The earlier row, commit `25f63671`, recorded
  `exit 1`; it is superseded. The latest row, commit `073ad1a9` — this reviewed head — records **`result: pass`**
  for the identical command, produced by `workflow_run.py prepare-final` in 8m48s at the ship head.
- **Reference**: `.project/build/verify-ledger.jsonl`, row `073ad1a9796bd4285d82faac557038bb32e7cd17`

## Finding

- **Found**: the project Verify passes at the reviewed head; the earlier failure is superseded and its two causes
  were fixed by T004 — the plan's Verify omitted the fixture install, and `scripts/retired-suites.test.mjs` scanned
  review artifacts that legitimately name the retired suites.
- **Fix direction**: none

## Not re-run

The full command was not re-executed inside this sidecar; a review-sidecar subset run
(`npm run check` after `npm ci`) reported exit 1 with four `panel-typecheck-scope` failures, which is the known
sidecar-dependency environment and not a product result. The authoritative measurement is the ledger row above,
recorded from the primary worktree at this head.
