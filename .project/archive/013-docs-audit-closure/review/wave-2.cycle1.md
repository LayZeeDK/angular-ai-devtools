# Review — wave 2, cycle 1

Wave verdict: pass
Cycle: 1
Depth: verify-only
Tasks reviewed: 3

## T002 — Correct plans/angular-ai-devtools-proposals.handoff.md (rows 649, 650): pass

- ✅ `plans/angular-ai-devtools-proposals.handoff.md` states the measured 1110 lines, not ~1,080 (row 649). — landing 8a3cb0bea0c243fffd8a47a6150c12e921d87af2; the patch changes 6 lines of the document; the coder measured the file in its isolate (`sum(1 for _ in open('docs/feature-proposals.md'))` → 1110) and recorded that count; task Verify exit 0 (`ok`), ledger entry recorded.
- ✅ The document dates its recorded head and is marked superseded (row 650). — the same patch adds the dated head and a superseded status line at the top of the document; the recorded head is named with its date.
- ✅ Verified sentences in the document stay byte-identical (E4). — `git show --stat` lists two changed paths (the document, 6 lines, and the task Log); no other sentence of the document appears in the diff.

## T003 — Correct .commandcode/skills/nx-import/references/TURBOREPO.md (row 465): pass

- ✅ `.commandcode/skills/nx-import/references/TURBOREPO.md` no longer asserts "Nx replaces Turborepo task orchestration" (row 465). — landing 6927f70feefb02e6cff3349c9f79ec3fa605c231; the single-line patch restates the claim as what the migration does ("The migration replaces Turborepo task orchestration with Nx targets"); task Verify exit 0 (`ok`).
- ✅ Verified sentences in the document stay byte-identical (E4). — `git show --stat` lists one line changed in that document plus the task Log; no other line of the document is in the diff.

## T004 — Correct docs/design/tutor.md (rows 645-647): pass

- ✅ `docs/design/tutor.md` no longer asserts "The tutor works with no model", "27 lessons in five phases", or "Storage shapes in `chrome.storage.local`" (rows 645-647). — landing e9e701f52617a135048889cc95e8b4037174486c; a read of the document at the landed head finds none of the three phrases, and it now carries a status line saying the tutor is a proposal and describes planned design; task Verify exit 0 (`ok`).
- ✅ Any retired claim names the retired path in this task. — nothing was retired; the document is corrected in place, so there is no retired path to name.
- ✅ Verified sentences in the document stay byte-identical (E4). — `git show --stat` lists 8 lines changed in that document plus the task Log; the rest of the document is unchanged.

Warnings (non-blocking):
- T004's Verify passed for the wrong reason on its third clause: the command embeds a backtick-quoted phrase inside a double-quoted shell string, so bash command-substituted `chrome.storage.local` and the comparison ran against a mutated string. The landed document was checked by hand and holds none of the three phrases, so the acceptance criterion is met, but the Verify should be repaired before this shape is reused.

Contract violations (blocking):
- None.

## Intent coverage

### SC2 — Every stale or aspirational claim the audit finds is corrected in its document, or the document is retired under the recorded retirement ruling, with the path named in the task that did it.: pass

- ✅ Every stale or aspirational claim the audit finds is corrected in its document, or the document is retired under the recorded retirement ruling, with the path named in the task that did it. — the four aspirational claims (rows 465, 645, 646, 647) and the two stale claims (rows 649, 650) are corrected in `docs/design/tutor.md`, `.commandcode/skills/nx-import/references/TURBOREPO.md` and `plans/angular-ai-devtools-proposals.handoff.md`; each correction lands in its own task (T002, T003, T004) and each task names the path it changed; no document was retired.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: T004's Verify clause three is vacuously satisfied for the shell-substitution reason above; the document itself is correct.
