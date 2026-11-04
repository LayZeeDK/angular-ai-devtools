# Measurement — the held-out corpus at M024 start

Run: `node --test <each file>` individually, so no build, server or port collides with another suite.
Corpus: 32 files matching `tests/held-out/**/*.test.mjs`.

| Suite | Exit | Cause |
|---|---|---|
| `e1-zero-defects-recorded` | 1 | `ENOENT .project/review/rounds/round-2.md` |
| `e5-unverifiable-recorded` | 1 | `ENOENT` (same directory) |
| `e6-portal-dependency` | 1 | `ENOENT` (same directory) |
| `e10-spec-present` | 1 | `ENOENT` (same directory) |
| `e11-rerun-stable` | 1 | `ENOENT` (same directory) |
| `e12-clean-worktree` | 1 | `ENOENT` (same directory) |
| `chrome-beta-gemma4-panel` | 1 | `ENOENT` — needs a live browser and model |
| `chrome-beta-nano-panel` | 1 | `ENOENT` — same |
| `chrome-stable-nano-panel` | 1 | `ENOENT` — same |
| `edge-phi4mini-panel` | 1 | `ENOENT` — same |

Ten red, exactly as the M023 gap review reported. The remaining twenty-two were not measured in this pass;
the corpus script task must measure them, and it must run serially because a parallel run collides on the
fixture build and on ports.

## What the six `eN` suites claim, and why they cannot pass

Each reads `.project/review/rounds/round-2.md`, a hand-written review record from an earlier milestone process.
It was never tracked by git and does not exist in a fresh checkout, so the claim cannot hold there. Their
subject — a review record with a fixed layout — has since been replaced by the review grammar that
`gsd review-check` and `gsd final-check` enforce, which does run in the gate.

## What the four panel suites claim

Each drives one browser instance and one on-device model to prove the panel answers. They need a launched
browser with a downloaded model, which is `verify-ai-browsers`' job, not a held-out corpus's. Their claim is
real and belongs to that skill; in `tests/held-out/` they are permanently red.
