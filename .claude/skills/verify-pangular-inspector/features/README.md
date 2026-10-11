# Pangular Inspector verification checks

This skill reuses the feature map of `control-pangular-inspector` (`../../control-pangular-inspector/features/`).
Each verdict check maps to one recipe there.

## Baseline preconditions

- `control-pangular-inspector check` exits 0 in the portal worktree.
- Ports 3000, 4775 and 9999 free, or a portal from this checkout passed with `--app-url`.

## Driving conventions

- The app is driven like a user in playwright-cli session `pangular-9999`; Pangular is only read.
- Every read is saved as JSON in the control run's evidence directory and copied into the verify run.

## Proof and skip reporting

- One verdict: verified, not verified or inconclusive; `failed` names each check that did not pass.
- `notCovered` lists what the run does not prove (action tools, other mounts, the install and remove round trip).

## Feature entry contract

The feature files are the control skill's; this index only maps checks to them.

## Features

| Check | Recipe |
|---|---|
| `setup` | [setup.md](../../control-pangular-inspector/features/setup.md) `setup.check` |
| `doctorOk` | control SKILL.md Doctor |
| `drove`, `explainNavigation` | [navigation.md](../../control-pangular-inspector/features/navigation.md) |
| `listPages`, `components`, `inspectComponent`, `inspectSignals`, `inspectProviders` | [live-inspection.md](../../control-pangular-inspector/features/live-inspection.md) |
| `readOnly`, `actionRefused` | control SKILL.md Helpers (`tools`, `call`) |
