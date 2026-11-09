# Inspect delta — M042 error-boundary

Measured 2026-11-09 against the docs-audit base `c9451b1527ae90753315edacd43a30abd2187c6c` (the `Audited HEAD`
the audit in force records), at HEAD `b28402ad5836887aa65a4ade301d9e86962c3f8f`, with `git diff --name-only` /
`--name-status` / `--numstat` and the `## Doc:` inventory the audit itself carries. Nothing below was counted by
eye; the counts were produced by a script over the two inputs and are reproducible from the two commands in
"Numbers".

`prepare-inspect` is not used: `.project/research/DOCS-AUDIT.md` already exists, so the chunked re-inspection
refuses. This is the measured-delta route the programme has used since M036 — what changed since the audit base,
and nothing more.

## Numbers

```bash
git diff --name-only c9451b1527ae90753315edacd43a30abd2187c6c HEAD   # 430 paths
git diff --numstat c9451b1527ae90753315edacd43a30abd2187c6c HEAD    # per-document +/−
grep -c '^## Doc: ' .project/research/DOCS-AUDIT.md                 # 152 audited documents
```

| Measure | Value |
| --- | --- |
| Audited documents in the audit in force | 152 |
| Audit rows in force (340 verified, 16 stale, 0 aspirational, 217 unverifiable, 1 descriptive) | 574 |
| Paths changed since the audit base | 430 |
| **Audited documents changed** | **19** |
| Non-audit paths changed | 411 |
| Lines changed across those 430 paths | +99,140 / −1,448 |
| Changed `.md` outside bookkeeping (`.project/`, `.claude/`, `taste/`) | 13 |

The audit in force grew by 7 documents since the M041 inspect: commit `302fd62` ("Audit the spike-record set so
the head audit covers the derived inventory") added the seven `research/spikes/` documents to the inventory,
taking it from 145 to the 152 counted here. Those seven are therefore both *audited documents* and *added since
the base* — the one cell in this delta where "changed" means "new", and it is stated as such below.

The working tree additionally carries three uncommitted items that the committed diff above does not count:
`.project/STATE.md` (this milestone's binding and its pre-approval line), one line added to
`.commandcode/taste/workflow/taste.md`, and the untracked `.project/research/s10-answer.md` written during this
inspection. None of them is in the audit's inventory, and none changes a count below.

## The 19 audited documents that changed

Every one of them has a `## Doc:` section in the audit; the row counts are read from it, not guessed.

| Document | Change | Audit rows | What the change is |
| --- | --- | --- | --- |
| `.claude/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 6 | The browser-control notes M039–M040 measured |
| `.commandcode/skills/control-ai-browsers/SKILL.md` | +15 / −7 | 5 | The byte copy of the same |
| `.commandcode/skills/control-angular-dev-app/features/README.md` | +3 / −0 | 4 | Route/feature table addition |
| `.commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md` | +86 / −0 (new) | 4 | The pinned zoneful worktree, written at M039 |
| `.commandcode/taste/angular/taste.md` | +1 / −0 | 4 | One learned preference (2026-11-08) |
| `.commandcode/taste/communication/taste.md` | +1 / −0 | 3 | One learned preference |
| `.commandcode/taste/design/taste.md` | +2 / −0 | 4 | One learned preference, one extended |
| `.commandcode/taste/tooling/taste.md` | +1 / −0 | 4 | One learned preference |
| `.commandcode/taste/workflow/taste.md` | +2 / −0 | 4 | Two learned preferences (2026-11-08) |
| `AGENTS.md` | +146 / −0 | 5 | Dated corrections: the portal moved to zoneless; autonomy, model-policy and skill-timing rules |
| `plans/angular-ai-devtools-program-backlog.md` | +181 / −40 | 3 | The Q1–Q4 queue recorded 2026-11-08, Prettier-formatted by M041's ship pass |
| `research/08-recent-angular-features.md` | +4 / −4 | 3 | The resource row now names `Resource#<name>.status` and records that every `.state` node is `value: null`; F1's lines follow it |
| `research/spikes/README.md` | +30 / −0 (new) | 7 | The S-answer set moved here on 2026-11-08; the README records the move |
| `research/spikes/capability-dependency-matrix.md` | +305 / −0 (new) | 6 | Added with the spike-record set the audit was regenerated over |
| `research/spikes/instrumentation-free-coverage.md` | +381 / −0 (new) | 5 | The same |
| `research/spikes/s11-answer.md` | +54 / −0 (new) | 4 | The S11 answer, moved from `research/` into `research/spikes/` |
| `research/spikes/s12-answer.md` | +554 / −0 (new) | 5 | The S12 answer, moved |
| `research/spikes/s13-answer.md` | +408 / −0 (new) | 4 | The S13 answer, moved |
| `research/spikes/sourcemap-future-scope.md` | +573 / −0 (new) | 5 | Added with the spike-record set |

Two things about the change set, measured rather than assumed:

- **The byte-copy claim still holds.** `.commandcode/skills/control-ai-browsers/SKILL.md` and its `.claude/`
  mirror hash to the same `sha256`, so the audit row that asserts they are byte copies is not contradicted by
  either edit.
- **The twelve documents the M041 delta named are twelve of these nineteen,** with the same edges except one
  number: `plans/angular-ai-devtools-program-backlog.md` is +181 / −40 here against +183 / −40 there, because
  M041's ship pass Prettier-formatted it after that delta was taken. No other of the twelve moved. The seven
  `research/spikes/` documents are the additions described above.

## The 411 non-audit paths

| Area | Paths | What it is |
| --- | --- | --- |
| `.project/archive/` | 229 | The M032–M041 archive trees, committed by their ship commits |
| `scripts/` | 57 | M032–M041 measure/capture suites, the verification gate, the held-out runners, the sidecar-deps bridge |
| `.commandcode/skills/` | 35 | The byte-copied `proctree`/`fingerprint`/`control`/`text.mjs` synchronisation across five control skills, plus the eight `verify-ai-browsers` checks |
| `research/raw/` | 24 | The M022–M041 recordings (`m041-navigation.json`, `m041-verdict-claims.json`, …) |
| `apps/angular-ai-devtools/` | 19 | Panel sources and specs for the explainers shipped since M032 |
| `.claude/skills/` | 13 | The same `control-ai-browsers` scripts and the eight `verify-ai-browsers` checks, mirrored |
| `extension/` | 13 | `router-diagnostic.js`, `navigation-narrator.js`, `performance-narrator.js`, `render-phase.js`, `resource-lifecycle.js`, `field-state.js`, `linked-state.js`, `legacy-structure.js`, `lint-core.js`, `onpush-readiness.js`, `agent-main.js`, its test, and the generated `panel/index.html` |
| `spikes/ng222-app/` | 11 | The counter fixture's routes and pages added since M032 |
| `.project/` top level and `research/` | 6 | `CHARTER.md`, `LESSONS.md`, `ROADMAP.md`, `STATE.md`, `model-policy.json`, and `research/DOCS-AUDIT.md` itself |
| `tests/held-out/` | 2 | The two held-out guards M041 added (`e3-zero-skipped`, `e4-idempotent-checks`) |
| top level | 2 | `package.json`, `package-lock.json` |

## What this does not claim

**It does not claim source was audited.** It measures document churn and nothing else: no code was read for this
document, no check was run, and no claim in the audit was re-verified. The 19 rows above record *that* a document
moved and *where*, not whether its claims are still true.

**It does not re-audit the unchanged documents.** 133 of the 152 audited documents are byte-identical to the
audit base. They keep the verdicts the audit in force records; re-reading them would be the chunked re-inspection
this route exists to avoid.

**It does not close the milestone's own question.** The roadmap's goal for M042 — "why this error reached the
boundary that caught it, and what it replaced" (`.project/ROADMAP.md:1532`) — is a premise that gate S10 has
already answered and that M042's own criteria must be written against
(`.project/research/s10-answer.md`). The audit's state has no bearing on it, and this delta is not evidence for it.
