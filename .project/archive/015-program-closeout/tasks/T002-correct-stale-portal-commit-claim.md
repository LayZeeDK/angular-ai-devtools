---
id: T002
title: Correct the stale portal-commit claim in both pangular-inspector skill trees
wave: 1
deps: []
status: done
agent: build_T002
base: 67ef91215ce98c1fa3c972fccebb49f25b96aa72
worktree: null
task_branch: null
files:
  - .claude/skills/control-pangular-inspector/SKILL.md
  - .commandcode/skills/control-pangular-inspector/SKILL.md
---

# T002 — Correct the stale portal-commit claim in both pangular-inspector skill trees

## Context

The regenerated docs audit records one `stale` claim: `.claude/skills/control-pangular-inspector/SKILL.md` asserts the portal worktree "has this setup committed (`f102b97`)". `git log` in the portal checkout `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` holds no such commit, so the pin is false. INTENT `## Corrections` already rules it: reality is authoritative, the document is corrected (`fix-doc`), recorded as a delegated ruling under the standing grant.

`.claude/skills/control-pangular-inspector/` is an older copy, not one of the two byte-identical pairs (`control-ai-browsers`, `verify-ai-browsers`), so the two files may differ elsewhere. Correct the same sentence in both so the claim is not left standing in either tree.

Prohibitions that bind this task: N1 — the claim is corrected, never deleted to make the audit pass; N2 — the corrected sentence must not be presented as verified by the audited document itself.

## Approach

- Read the sentence and its surrounding paragraph in both files before editing, and read the audit row 237 evidence so the correction states what is true rather than a vaguer negative.
- Replace the false commit pin with phrasing that is true regardless of the external checkout's history: the setup is described as prepared in this repository, with no claim that the portal checkout carries a commit of it. Keep the instruction the reader needs (how to run the portal with the dev-only provider), because that instruction is the section's purpose.
- Apply the same wording to both files.
- Leave every other claim in the documents alone.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. Neither `.claude/skills/control-pangular-inspector/SKILL.md` nor `.commandcode/skills/control-pangular-inspector/SKILL.md` contains the stale commit pin `f102b97`.
2. The section that carried the claim still exists and still tells the reader how to run the portal, so the correction is not a deletion (N1).
3. The corrected wording makes no current claim about a commit in the external portal checkout (N2), and the rest of both documents is unchanged.

## Verify

```bash
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,'utf8');if(t.includes('f102b97'))throw new Error(f+': stale portal commit pin still present');if(!/portal/i.test(t))throw new Error(f+': the portal section is gone, so the claim was deleted instead of corrected');}console.log('portal claim corrected in both trees')" .claude/skills/control-pangular-inspector/SKILL.md .commandcode/skills/control-pangular-inspector/SKILL.md
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — orchestrator plan repair: replaced the planner's `node --check` on a Markdown file (which cannot fail on the claim) with an assertion that reads both documents, fails on the stale pin, and fails if the section was deleted.
- 2026-11-01 — replaced stale portal commit pin 102b97 with repository-prepared setup wording (keeping portal dev-only provider instructions) in both .claude/skills/control-pangular-inspector/SKILL.md and .commandcode/skills/control-pangular-inspector/SKILL.md; Verify: exit code 0 (portal claim corrected in both trees)
- 2026-11-01 — orchestrator Verify (isolate gsd-path-task/T002): pass, exit 0; output tail:
  ```
  portal claim corrected in both trees
  ```
