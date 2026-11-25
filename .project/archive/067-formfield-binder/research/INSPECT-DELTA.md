# Inspect delta — M067 formfield-binder

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` (`.project/research/DOCS-AUDIT.md`)
Measured by `git diff --name-only <audited-base>..HEAD`, at HEAD of `gsd-path/M067`.
Paths changed since the audit: **654**

## What the audit must re-read

| Path                                          | Why it moved                                                      |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `.commandcode/skills/prove-*/SKILL.md`        | the proof skills gained their verification contract during M055–M066 |
| `.project/ROADMAP.md`                         | M065 and M066 shipped, so their entries and fields moved          |
| `.project/research/DOCS-AUDIT.md`             | the audit records its own revisions                               |

## What this does NOT claim

- It does not claim the code was audited. The six hundred-odd changed paths under `extension/`, `apps/`, `scripts/` and
  `research/raw/` lie outside the audited set, and no verdict about them was re-derived at this head.
- It does not claim the audit's stale and unverifiable rows were re-examined.

## Conclusion

The audit still describes the documents it names, and nothing it states is contradicted by the diff above. No re-audit is
required before M067's define, and this milestone's own premises are falsified by measurement in its first task — the
pattern every milestone in this generation has followed.
