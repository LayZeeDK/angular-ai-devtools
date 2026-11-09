# Inspect delta — M041 navigation-blocking

Measured 2026-11-08 against the docs-audit base `c9451b1527ae90753315edacd43a30abd2187c6c` (the `Audited HEAD`
the audit in force records), at HEAD `3c5063e`, with `git diff --name-only` / `--name-status` / `--numstat` and the
`## Doc:` inventory the audit itself carries. Nothing below was counted by eye. The counts were taken at `2c0d47d`;
`3c5063e` differs from it by one Prettier pass over `plans/angular-ai-devtools-program-backlog.md`, which changes
no path and no count — re-measured at both heads to confirm.

`prepare-inspect` is not used: `.project/research/DOCS-AUDIT.md` already exists, so the chunked re-inspection
refuses. This is the measured-delta route the programme has used since M036 — what changed since the audit base,
and nothing more.

## Numbers

| Measure | Value |
| --- | --- |
| Audited documents in the audit in force | 145 |
| Paths changed since the audit base | 383 |
| **Audited documents changed** | **12** |
| Non-audit paths changed | 371 |
| Changed `.md` outside bookkeeping (`.project/`, `.claude/`, `taste/`) | 13 |

The 13 are the six M040 recorded at its own inspect (`AGENTS.md`, `plans/angular-ai-devtools-program-backlog.md`,
`research/08-recent-angular-features.md`, and the three `.commandcode/skills` documents below) plus the seven
`research/spikes/` files committed after M040 shipped. No `.md` outside those thirteen changed.

## The 12 audited documents that changed

Every one of them has a `## Doc:` section in the audit; the row counts are read from it.

| Document | Change | Audit rows | What the change is |
| --- | --- | --- | --- |
| `.commandcode/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 5 | The browser-control notes M039–M040 measured |
| `.claude/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 6 | The byte copy of the same |
| `.commandcode/skills/control-angular-dev-app/features/README.md` | +3 / −0 | 4 | Route/feature table addition |
| `.commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md` | +86 / −0 (new) | 4 | The pinned zoneful worktree, written at M039 |
| `.commandcode/taste/angular/taste.md` | +1 / −0 | 4 | One learned preference (2026-11-08) |
| `.commandcode/taste/communication/taste.md` | +1 / −0 | 3 | One learned preference |
| `.commandcode/taste/design/taste.md` | +2 / −0 | 4 | One learned preference, one extended |
| `.commandcode/taste/tooling/taste.md` | +1 / −0 | 4 | One learned preference |
| `.commandcode/taste/workflow/taste.md` | +2 / −0 | 4 | Two learned preferences (2026-11-08) |
| `AGENTS.md` | +146 / −0 | 5 | Dated corrections: the portal moved to zoneless, so the zoneful-worktree rule is superseded; the autonomy, model-policy and skill-timing rules |
| `plans/angular-ai-devtools-program-backlog.md` | +183 / −40 | 3 | The Q1–Q4 queue recorded 2026-11-08 |
| `research/08-recent-angular-features.md` | +4 / −4 | 3 | The resource row now names `Resource#<name>.status` and records that every `.state` node is `value: null` (M036's correction), and F1's model/data/tier lines follow it |

Two things about the change set, measured rather than assumed:

- **The byte-copy claim still holds.** `.commandcode/skills/control-ai-browsers/SKILL.md` and its `.claude/`
  mirror hash to the same `sha256 a3245104736f36f7f1f869065eb6a75fea972dfa4335925cda0152464f08c2a9`, so the
  audit row that asserts they are byte copies is not contradicted by either edit.
- **No audit row quotes the changed lines of `research/08-recent-angular-features.md`.** Its three rows claim the
  external Angular clone, the fixture's `@angular/core` version and the OnPush-default behaviour; the four changed
  lines are the resource label/status cell and two model ideas. The rows were read, not re-verified.

## The 371 non-audit paths

| Area | Paths | What it is |
| --- | --- | --- |
| `.project/archive/` | 198 | The M039 and M040 archive trees, committed by their ship commits |
| `scripts/` | 48 | M039–M040 measure/capture suites, the verification gate, the sidecar-deps bridge |
| `.commandcode/skills/` | 38 | The byte-copied `proctree`/`fingerprint`/`control`/`text.mjs` synchronisation across five control skills, plus the eight `verify-ai-browsers` checks |
| `research/raw/` | 22 | The M039/M040 recordings (`m039-render-phase.json`, `m040-work-events.json`, …) |
| `apps/angular-ai-devtools/` | 18 | Panel sources and specs for the two shipped explainers |
| `.claude/skills/` | 14 | The same skill scripts and checks, mirrored |
| `extension/` | 11 + 1 | `performance-narrator.js` (new), `agent-main.js`, and the nine earlier explainers; `extension/panel/` is the generated bundle |
| `spikes/ng222-app/` | 11 | The counter fixture's routes and components |
| `research/spikes/` | 7 | The S11/S12/S13 answers moved here on 2026-11-08 (`README.md` in that directory records the move) |
| `.commandcode/taste/` | 5 | The five taste files above |
| `.project/` (top level and `research/`) | 5 | `CHARTER.md`, `ROADMAP.md`, `STATE.md`, `model-policy.json`, and `research/DOCS-AUDIT.md` itself |
| top-level and programme records | 5 | `AGENTS.md`, `package.json`, `package-lock.json`, `plans/angular-ai-devtools-program-backlog.md`, `research/08-recent-angular-features.md` |

## What this does not claim

**It does not claim source was audited.** It measures document churn and nothing else: no code was read for
this document, no check was run, and no claim in the audit was re-verified.

**It does not re-audit the unchanged documents.** 133 of the 145 audited documents are byte-identical to the
audit base. They keep the verdicts the audit in force records; re-reading them would be the chunked
re-inspection this route exists to avoid.

**It does not close the milestone's own question.** The roadmap's goal for M041 — "what is holding this
navigation, and at which stage", `Depends on: [M020]`, `Surfaces: panel` — is a premise M041's own tasks must
measure against the router. The audit's state has no bearing on it, and this delta is not evidence for it.
