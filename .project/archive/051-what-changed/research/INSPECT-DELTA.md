# INSPECT-DELTA — M051 what-changed

Measured at `188b03b2` against the audit base `d621a3f`, rather than re-auditing 150 documents for a
milestone that follows one already inspected.

```
audited markdown changed since the audit base:  70
  .claude/skills/control-ai-browsers/**   (SKILL.md and its feature files)
  docs/, plans/, references/, AGENTS.md, LESSONS.md
other paths changed:                           941
  scripts/, apps/, extension/, research/raw/, .project/
```

## What this delta does not claim

It does not claim the code was audited. It records that the documents the audit covers have moved, and
that the movement is concentrated in the browser-control skill tree and the programme documents rather
than in the feature surface M051 touches.

## What M051 needs from inspection

`what-changed` compares two recorded snapshots of the same page. The artefacts it will read are the panel's
recorded snapshots and the diff surface every other explainer already shares, so the inspection question is
narrow: which recorded field names a snapshot, and whether two snapshots of one page can be paired without
inferring an identity the record does not carry. That is a define-phase measurement, not a reason to
re-audit the corpus.
