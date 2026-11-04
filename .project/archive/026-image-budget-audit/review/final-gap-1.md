# Gap Review — 1: project Verify

Reviewed HEAD: 1a2c359d4de46d7165895ae8f2300af6d29e8884
Gap verdict: pass
Risk: project Verify
Waves checked: 1, 2, 3, 4, 5, 6

## Checked evidence

- **Check**: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`
- **Observed**: the command ran under `workflow_run.py prepare-final` at **`ed645cf0`** and exited **0** after
  9m42s (run log `s3qf1nn1`). `1a2c359d` is its bookkeeping checkpoint: `git diff --name-only ed645cf0 1a2c359d`
  lists exactly .project/STATE.md .project/build/evidence.json — no product file changes between the measured commit and this head.
- **Reference**: `.project/build/verify-ledger.jsonl` — three rows, all `fail`, at `63f50c4`, `30d7cdc` and
  `5711945`; each is superseded by the passing run above.

## Finding

- **Found**: the project Verify passes for this head's tree. Its three earlier failures — a missing M026 verdict
  recording, two control-skill manifests and the ng-context recording stale after the fixture change, and a panel
  route list the new surface extended — were each fixed by their own task (T007, T008, and the `verdict-record`
  helper) rather than by relaxing an assertion.
- **Fix direction**: none

## What the evidence does not contain, and why

No ledger row records the passing run **at this exact head**, and the run cannot be repeated: `prepare` has already
moved `.project/tasks` into the archive, so `build_state.py verify-landed` exits 1 and a second `prepare-final`
cannot start. The measurement is therefore cited from the run that produced it (the parent commit, identical tree in
every non-bookkeeping path) rather than from a ledger row that does not exist.

That is a defect in the tooling, not in this milestone: a passing run should append its row to the ledger, and the
verify should remain runnable once an archive transaction is prepared.
