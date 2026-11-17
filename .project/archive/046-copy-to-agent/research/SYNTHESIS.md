# M046 copy-to-agent — synthesis

Seven tasks in five waves, reviewed and landed. This records what the milestone measured, what it changed, and
what the build gate itself turned out to need.

## What the milestone set out to show

The roadmap's premise was that a finding can be handed to an agent as the text the pane drew, through a control
that names what it will send before it sends it, and that the documentation claims the inspection ruled `fix-doc`
can be corrected at the artefacts they cite. The second half of that premise was sound and is discharged by T002
and T006: the `.claude` mirror is gone, so `.commandcode` is the single source for every skill, and every
corrected citation is asserted by the suite that reads it.

## What measurement changed

The first wave measured what the pane renders against what each existing copy path composes, and found that the
hand-off was being re-derived from the record rather than read from the pane. That is why T003 exists: the
premise sentence assumed the copy path already carried the rendered text, and the measurement showed the opposite.
Every later task is held to the record T001 published.

## Review findings and their resolution

Five wave reviews pass `gsd review-check`, and the gap review records the project verify at exit 0 on the reviewed
head. The findings that mattered during the milestone were not in the product: the copy path's text, the closed
`cannot-tell` reason set and the three hand-over states each carry a suite that reddens when the behaviour is
removed.

## The build gate, which was the real discovery

Four defects in the harness that builds and lands a milestone were found while trying to land T007. Each was fixed
only after a measurement made the cause explicit, and the first six attempts were wrong:

- **An undeclared path cost a full verify.** `isolation.py land` refused the allow-list after eighteen minutes of
  verification. `gsd land` now checks the allow-list first and names every undeclared path at once.
- **The Verify's output was invisible.** `gsd land` printed eight lines and the harness wrote zero-byte logs, so
  six attempts were made blind. It now writes the full output to `.project/build/verify-<TASK>.log`.
- **A nested suite lost to parallelism.** The user-scope helper suite takes about 105 s alone and passed 334/334,
  but exceeded its 240 s child ceiling under `npm test`, so the pins that prove an injected failure is named
  failed on contention. The ceiling is now 600 s, with the measurement recorded in the comment.
- **A red nested run did not name itself.** `exitStatusMessage` kept the last forty lines, which held the summary
  and dropped every `✖` line. It now carries up to forty failing test names above the tail.

One further cost was mine rather than the tooling's: a diagnostic script left at the repository root failed
`format:check`, and the held-out `e4-idempotent-checks` suite failed on it. It was deleted rather than exempted.

## What ships

The hand-off from pane text, the three rendered states with their routes and demo loader pinned, the closed
`cannot-tell` reason set, the deleted `.claude` mirror, the corrected citations, and the surface record. The
project verify runs at the head that ships, and every done task carries a passing verify-ledger entry recorded
from a real run.
