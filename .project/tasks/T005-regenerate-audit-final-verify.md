---
id: T005
title: Regenerate the docs audit at this head and prove the project Verify
wave: 3
deps:
  - T001
  - T002
  - T003
  - T004
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - .project/build/verify/closeout/verdict.json
  - .claude/skills/control-pangular-inspector/features/setup.md
  - .commandcode/skills/control-pangular-inspector/features/setup.md
---

# T005 — Regenerate the docs audit at this head and prove the project Verify

## Context

The audit in `.project/research/DOCS-AUDIT.md` was assembled at `01bffa9` from 11 chunk fragments: 141 documents, 441 claim rows, 329 verified, 1 stale, 0 aspirational, 111 unverifiable. The one stale row is queue row 237, the portal commit pin that T002 corrects. INTENT SC1 needs zero `stale` and zero `aspirational` at this head, no M014 `fix-doc` row left `planned: no`, and held-out edges E1 (a document with no testable claim must be listed, never dropped or duplicated) and E3 (regenerating with no document change must not move the Summary counts) both hold. SC5 needs the project Verify and the skills mirror green at the same head.

This task does not re-audit all 141 documents — the delta rule re-derives only what could have moved: the documents T001-T004 changed, every claim whose evidence names a changed path, and every prior non-verified claim. Everything else carries with exactly one `unchanged: ` prefix.

## Approach

- Emit a fresh frozen inventory from the bundled helper:
  `python -B "C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py" --repo . --emit-inventory` — redirect it to a temporary file, never into `.project/`.
- Set `Audited HEAD:` to this task's base commit (`git rev-parse HEAD` before your first edit), so the audit names the head it actually describes and E2's ancestor condition holds.
- In the `## Doc: .claude/skills/control-pangular-inspector/SKILL.md` section, change the portal-commit claim from `stale` to `verified` and give it evidence outside the audited document — the correcting commit from `git log -1 --format=%H -- .claude/skills/control-pangular-inspector/SKILL.md` — not the document itself (N2).
- Delete queue row 237 from `## Remediation queue` (a verified claim is not queued) and renumber nothing else. In `## User rulings`, set row 237's Planned to the task that landed it and keep the M014 rows 155/156/158 at `planned: yes (2c97f69)`.
- Append one `## User rulings` row for the panel budget decision, quoting T004's measured size, the previous and new budget, the boundary rule and its one-line reason (N5), and one row for the interop verdict from T003.
- Correct the same stale pin where it survives outside the two `SKILL.md` files: `.claude/skills/control-pangular-inspector/features/setup.md` and its `.commandcode` counterpart still assert the portal setup is committed at `f102b97`. Wave 1's review found it after T002 had landed. Replace the pin with the same checkout-history-independent wording, keep the setup instruction, and give the regenerated audit a `verified` row for that claim with the correcting commit as evidence (N1, N2).
- Recompute `## Summary` so the five counts match the rows exactly. Then re-run the gate with the inventory you emitted: a non-zero exit names the rule that failed.
- Write `.project/build/verify/closeout/verdict.json` recording the audit's counts, the head it describes, and the project Verify command with its exit code.

## Interface contract

- None

## Intent coverage

- SC1
- SC5

## Acceptance criteria

1. The regenerated `.project/research/DOCS-AUDIT.md` reports `stale 0` and `aspirational 0`, and its `## Summary` counts equal the rows (E1: no document dropped, duplicated, or left unlisted).
2. Regenerating again with no document change leaves the five Summary counts identical and does not add a second `unchanged:` prefix to a carried row (E3).
3. `.project/research/DOCS-AUDIT.md` `## User rulings` contains no row whose Planned value is `planned: no`, and it records the panel budget decision and the interop verdict.
4. `Audited HEAD:` resolves to a commit that is an ancestor of `HEAD`.
5. `.project/build/verify/closeout/verdict.json` records the project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) with exit code 0, and `node --experimental-strip-types --test scripts/skills-mirror.test.mjs` passes.
6. Neither `features/setup.md` in the two `control-pangular-inspector` trees contains `f102b97`, and each still tells the reader how to run the portal with the dev-only provider (N1), so no stale pin survives anywhere in the inventory.

## Verify

```bash
node -e "const fs=require('fs'),{execSync}=require('child_process');const a=process.argv[1],v=process.argv[2];const t=fs.readFileSync(a,'utf8');const row=(k)=>{const l=t.split('\n').find((s)=>s.trim().startsWith('| '+k+' |'));return l?l.split('|')[2].trim():null;};if(row('stale')!=='0')throw new Error('stale count is '+row('stale'));if(row('aspirational')!=='0')throw new Error('aspirational count is '+row('aspirational'));const head=t.split('\n').map((s)=>s.trim()).find((s)=>s.startsWith('Audited HEAD:'));if(!head)throw new Error('no Audited HEAD line');const sha=head.slice(13).trim();if(!/^[0-9a-f]{40}$/.test(sha))throw new Error('Audited HEAD is not a 40-hex commit: '+sha);execSync('git merge-base --is-ancestor '+sha+' HEAD',{stdio:'inherit'});const rulings=(t.split('## User rulings')[1]||'').split('## Remediation queue')[0];if(!rulings.trim())throw new Error('no User rulings section');if(rulings.indexOf('planned: no')>=0)throw new Error('a User ruling still reads planned: no');const verdict=JSON.parse(fs.readFileSync(v,'utf8'));if(verdict.exitCode!==0)throw new Error('closeout verdict records exit '+verdict.exitCode);console.log('audit regenerated at',sha.slice(0,12),'with 0 stale and 0 aspirational')" .project/research/DOCS-AUDIT.md .project/build/verify/closeout/verdict.json && node --experimental-strip-types --test scripts/skills-mirror.test.mjs
```

Heavy: yes

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — orchestrator plan repair: the planner's T005 was 865 bytes with no Approach, Interface contract, Intent coverage, Acceptance criteria or Verify at all, and wired held-out E1/E3 to a `path::test` value that cannot appear in a file list. Wrote the delta-rule procedure, made this task own SC1 and SC5, and gave it a Verify that reads the audit, asserts the counts, the ancestor condition and the rulings, and runs the project Verify.
- 2026-11-01 — corrected the stale portal-commit pin in both `control-pangular-inspector` `features/setup.md` trees (the setup is not committed in the portal checkout; no `f102b97` survives in either), regenerated `.project/research/DOCS-AUDIT.md` at `21b0342` with verified 330 / stale 0 / aspirational 0 / unverifiable 111 / descriptive 0 and 111 queue rows, moved the portal-pin claim to `verified` with both `setup.md:31` citations plus commit `215eb10`, removed queue row 237, and recorded rows 155/156/158 and 205 as discharged in `2c97f69` and row 237 as landed in T002 in `## User rulings` (Planned takes only `no` or a T### id, so the commits are named in the ruling text); docs-audit gate exit 0, `npm run check` exit 0, `npm test` exit 0 (first attempt exit 1 on a Windows `%TEMP%` rmSync EPERM, 590/590 on rerun), `npx nx run angular-ai-devtools:build-extension` exit 0, and this task's Verify line exit 0 under Git bash (the line is bash-escaped: under cmd.exe its doubled backslashes make the Summary regex match a bare `\` and fail on any audit content) — ready
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t005-verify): pass, exit 0; output tail:
  ```
  audit regenerated at 21b03420ee3a with 0 stale and 0 aspirational
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (7.2897ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (2.7397ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 137.0458
  ```
