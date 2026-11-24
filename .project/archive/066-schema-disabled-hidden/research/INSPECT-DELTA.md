# Inspect delta — M066 schema-disabled-hidden

Audited HEAD: `2ece0b80ad8b8b78e337077a3592f663e7ab50e7` (`.project/research/DOCS-AUDIT.md`)
Measured at: ed99109b3abf13783a88c4472c99d2111b78cd21, by `git diff --name-only <audited-base>..HEAD`
Audited documents changed since the audit: **3**
Paths changed that the audit does not cover: **614**

## What the audit must re-read

| Path                                           | Why it moved                                       |
| ---------------------------------------------- | -------------------------------------------------- |
| `plans/angular-ai-devtools-program-backlog.md` | the programme backlog, edited by M065's decisions  |
| `.commandcode/taste/tooling/taste.md`          | learned preferences, not a product document        |
| `.commandcode/taste/workflow/taste.md`         | learned preferences, not a product document        |

The two taste files are written by the taste system and carry no claim this milestone's intent can falsify. The backlog is
the authority for Generation 3's ordering; its claims about M066 are copied into `INTENT.md` and falsified there by
measurement, as every milestone in this generation has been.

## What this does NOT claim

- It does not claim the code was audited. Six hundred and fourteen changed paths — `extension/`, `apps/`, `scripts/`,
  `spikes/`, `research/raw/` — lie outside the audited set, and the audit's verdicts about them were never re-derived at
  this head.
- It does not claim the audit's stale and unverifiable rows were re-examined.

## Conclusion

The docs audit still describes the documents it names. No re-audit is required before M066's define, and this milestone's
premises are falsified by measurement in its own T001.
