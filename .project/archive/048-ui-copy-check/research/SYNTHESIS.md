# M048 ui-copy-check — synthesis

Four tasks in four waves, reviewed and landed. This records what the milestone measured, what it
changed, and the one structural question the work answered about itself.

## What the milestone set out to show

The roadmap said the panel reports the user-visible strings a page renders that its own digest would
not explain, reading text the page already publishes. T001 was written to falsify that sentence, and
it did, in both halves: `extension/agent-main.js` contains no `innerText` or `textContent` at all,
and the only digests in the repository are `error-digest.json` and `image-digest.json`. There was
nothing to compare and nothing to compare it against.

## What measurement changed

The milestone was re-pointed, before any join existed, at the copy each panel surface declares for
itself: 19 surfaces, 79 declared sentences in maps or loose constants, 34 written inline where no map
can reach them, and one surface (`panel-context.ts`) that renders no copy at all. T001 also corrected
the intent's own citation — the sentence map is at `panel-components.ts:104`, and the line I had
cited mentions it in a doc comment 57 lines above.

That distribution decided the design. A digest generated from the maps would have left 34 rendered
sentences unexplained by construction, so the digest was authored from the recorded list instead.

## Review findings and their resolution

Three findings shaped the shipped code. The first is the record-level state: the join initially
answered `cannot-tell` whenever any surface rendered no copy, which made `clean` unreachable for
every page because `panel-context.ts` renders none — a state no input can produce is not a state. The
order is now: no digest → `cannot-tell`/`no-digest`; zero compared → `cannot-tell`/
`surface-declares-nothing`; any unexplained string → `unexplained`; otherwise `clean`, with the absent
surface keeping `cannot-tell` in its own row. The second is that `no-surfaces` became unreachable
under that order and was deleted rather than documented. The third is the count that does not match:
122 sentences compared against 121 digest rows, because one sentence is declared byte-for-byte by two
surfaces and one row explains one string.

## The check that could see everything but itself

The surface shipped in wave 3 while the record still held nineteen surfaces and the digest held 113
rows, so the copy check could not report its own drift. T003 refused to close that from a task that
did not own those files, recorded it as a gap, and said so. T004 closed it by re-measuring all twenty
surfaces and authoring the new rows from the source — never from the render, because a digest
authored from the rendered output agrees with the render by construction and would make the check
prove only that the pane is consistent with itself.

## The cost, and what it says

Three consecutive landings failed on the same class of mistake, and none of them was a defect in the
shipped work: a demo fact pinning `checked: 113`, a doc comment that shrank by one line and slid 300
citations, and a record quoting the old fact text. Each was a position or a count encoded somewhere a
re-measurement had to chase. The durable fix lives in the spec, which now derives the count from the
record and asserts that rows are fewer than sentences by the measured duplicate, instead of pinning
`entries.length === checked` — an equality that stopped being true the moment a second surface
declared an existing sentence.

## What ships

The `copy-check` surface rendering `clean`, `unexplained` and `cannot-tell`; a 121-row digest of the
sanctioned copy; a pure join with a closed two-word reason set and a documented precedence; four
mutants that redden naming their defect; and a surface whose own sentences are in the digest it
checks against.
