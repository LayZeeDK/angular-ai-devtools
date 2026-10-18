# Evidence — domain

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: domain
Questions assigned: Exact run order, instance requirements, and per-spike duration (handoff line 51-68 ordering).; Is the round-10 stop rule the define step's completion gate for research review?

## Finding: Run order is a two-tier sequence: offline/one-fixture spikes first, then model-browser spikes, then tutor spikes, then fold, then a final closed-findings check

- **Claim**: `plans/angular-ai-devtools-proposals.handoff.md` lines 51-68 define the next-work order: (1) cheap open spikes — first offline/one-fixture group S16, S19, S17, S18, then model-browser group S14, S15, S20, S23; (2) tutor spikes TS1-TS12 (TS1/TS2 riskiest); (3) fold every spike result into the proposals (raw file under `research/raw/`, relabel inferred→measured only with that file, log in AFK log); (4) final closed-findings check over everything changed since `0647e96` with one reviewer briefed like `tmp/review/round10-brief-closed.md`.
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:51-68`
- **Confidence**: high
- **Why it matters here**: SC1 requires spikes "follow `plans/angular-ai-devtools-proposals.handoff.md` next-work order"; this is the authoritative ordering.

## Finding: Instance requirements are four per-model browser instances on fixed ports; S16/S17/S18 use the Angular dev app, S20/S23 use Vitest Browser

- **Claim**: The browser instance registry is `.claude/skills/control-ai-browsers/instances.json` with instances `chrome-beta-nano` (9333), `chrome-beta-gemma4` (9334), `edge-dev-aion` (9335), `edge-phi4mini` (9337); profiles live on D: under `.browsers/`. S16/S17/S18 run against the counter fixture via `control-angular-dev-app` + `lars-verify`; S20-S23 use `control-vitest-browser-angular` + `lars-verify`. S14/S15 need model browsers and are written in `research/15` section 4. Aion on Edge Dev is the native-tools reference and Gemma 4 on Chrome Beta the structured-output reference (Lars ruling, AFK log row 08:54).
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:34-40,86-88`; `docs/afk-run-2026-10-12.md:72`
- **Confidence**: high
- **Why it matters here**: E3/E4 require queueing/resetting per-model instances; instance assignment determines which spikes can run in parallel vs. serially.

## Finding: Per-spike durations are not specified in any source; only "memory tight, run one dev server at a time" and "close every browser" constraints

- **Claim**: No document in the tree gives per-spike duration estimates. The handoff and AFK log state only operational constraints: memory is tight so run one dev server at a time; close every browser/tab/dev server started; leave Lars's everyday Chrome/Edge and port 4200 alone. Round cost is given as ~0.4M tokens per review round, not per spike.
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:73`; `docs/afk-run-2026-10-12.md:70`
- **Confidence**: high
- **Why it matters here**: SC1's "per-spike" evidence cannot be time-boxed from repo sources; durations must be measured during runs (E4 reset rule applies).

## Finding: The round-10 stop rule is explicitly defined in the AFK log row at 08:47 and is a cost/benefit stop, not a correctness gate

- **Claim**: The AFK log records the stop rule at 08:47 (round 9): "Stop rule for the loop: after these fixes, one closed-findings check; then stop even if the neutral seat would still find minors. Majors are gone; the neutral seat has found about ten new minors per round for nine rounds at about 0.4M tokens a round, so another full round costs more than it finds." The handoff (line 45) says the review loop "stopped after round 10 by a stop rule" and that "The rule and its reasoning are in the AFK log, rows for round 9 and later." The closed-findings check (handoff line 67) is the step that follows the stop, not the stop rule itself.
- **Source**: `docs/afk-run-2026-10-12.md:70`; `plans/angular-ai-devtools-proposals.handoff.md:45,67`
- **Confidence**: high
- **Why it matters here**: Answer to assigned question 2: the stop rule is a review-loop termination criterion (stop after one closed-findings check even if minors remain), not the define step's completion gate. The define step's completion gate is the closed-findings check over everything changed since `0647e96` (handoff line 67), which is still pending and depends on gitignored `tmp/review/` evidence that may be unrecoverable.

## Finding: The closed-findings check over everything changed since `0647e96` is still outstanding and its inputs may be unrecoverable

- **Claim**: Handoff line 67 requires "A final closed-findings check over everything changed since `0647e96`, before calling the proposals done. Use one reviewer, briefed like `tmp/review/round10-brief-closed.md`." The `tmp/review/` findings and briefs are gitignored, so `round10-brief-closed.md` is not in the committed tree; INTENT.md flags this as recoverable-or-rerun (open question, NEEDS-USER).
- **Source**: `plans/angular-ai-devtools-proposals.handoff.md:67`; `docs/afk-run-2026-10-12.md:70` (triage in `tmp/review/round9-triage.md`); INTENT.md open questions
- **Confidence**: high
- **Why it matters here**: The define step must carry forward whether to rerun the closed-findings check from `0647e96`; this is not resolved by the stop rule.

## Assigned questions — answers

- Exact run order, instance requirements, and per-spike duration (handoff line 51-68 ordering). → Run order: offline/one-fixture (S16, S19, S17, S18) → model-browser (S14, S15, S20, S23) → tutor TS1-TS12 → fold into proposals → final closed-findings check since `0647e96`. Instance requirements: four per-model browser instances on ports 9333/9334/9335/9337; S16-18 use `control-angular-dev-app` on the counter; S20-23 use `control-vitest-browser-angular`; S14-15 use model browsers per `research/15` §4. Per-spike duration: no reliable source found — not specified anywhere in the repo; only "one dev server at a time" and "close all browsers" constraints.
- Is the round-10 stop rule the define step's completion gate for research review? → No. The stop rule (AFK log 08:47) is a review-loop termination criterion: stop after one closed-findings check even if the neutral seat would still find minors. The define step's completion gate is the separate, still-pending closed-findings check over everything changed since `0647e96` (handoff line 67).

## Dead ends

- Searched `docs/afk-run-2026-10-12.md` for "duration"/"minutes"/"hours" per spike — none; only round-level token cost (~0.4M tokens/round) and wall-clock timestamps.
- Searched for a per-spike timing table in `research/05-spikes.md` and `docs/feature-proposals.md` §7 — none found; spike rows say what "done" means, not duration.
- Web search not needed: all load-bearing facts are in committed repo docs (handoff + AFK log); no primary external source required for ordering/process questions. (No dead external search performed.)