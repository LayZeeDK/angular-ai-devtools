# Inspect delta — Generation 4 open (M069 branch)

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` (`.project/research/DOCS-AUDIT.md`)
Measured by `git diff --name-only <audited-base>..HEAD` on the branch just bound for the next milestone.
Paths changed since the audit: **752**

## What moved that the audit names

| Path | Why it moved |
| --- | --- |
| `.commandcode/skills/prove-*/SKILL.md` | the four proof skills were added during M055–M068 |
| `.project/CHARTER.md`, `.project/ROADMAP.md` | every milestone from M044 to M068 shipped and appended its entry |
| `.project/archive/*` | 25 new archives, each with its intent, plan and review set |
| `plans/angular-ai-devtools-program-backlog.md` | rulings A10 to A14 and the Generation 4 scope were written here |
| `research/raw/*` | 24 new recordings, including the eight this milestone's predecessor re-derived |

## What this does NOT claim

- It does not claim the product code under `extension/`, `apps/`, `scripts/` was re-audited. That is the bulk of the 752
  paths and none of it is in the audited set.
- It does not claim the audit's `unverifiable` rows were re-examined.

## Why this generation opens without a fresh chunked audit

`.project/research/DOCS-AUDIT.md` exists, so `workflow_run.py prepare-inspect` refuses by design and the inspection is a
measured delta rather than a second full audit. The delta above is sufficient for one purpose: telling the planner what
the repository now holds that the audit predates. Everything the Generation 4 entries depend on — the design system's
absence, the panel's existing shell, the CDP and Playwright constraints — is measured in each milestone's own first task,
which is the pattern every milestone from M031 to M068 followed.
