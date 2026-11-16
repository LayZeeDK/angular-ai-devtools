# M057 console-read - synthesis

Twenty waves, twenty-seven tasks, reviewed and landed. This records what the milestone measured, what it
changed, and what the review rounds cost.

## What the milestone set out to show

The roadmap's premise was that a captured console diagnostic can be joined to the shipped error digest by
code alone, and that a surface which has no entry for a code can say so by name instead of showing a count
or a remedy. Each wave produced an artifact in `review/`, and each passing wave was reviewed before the next
was written, so a failing wave stops the line rather than being absorbed by the next one.

## What measurement changed

The premise survived, but not in the shape the roadmap sentence assumed. The first wave measured that the
capture states less than the digest does: a message carries a code or it does not, and the digest's titles
are the only words the join may borrow. Every later wave inherits that correction, which is why `T001` exists
and why every criterion in `INTENT.md` is answered by something a reader can see on the surface.

## Review findings and their resolution

Four of the first nineteen waves failed their review, and one wave was reviewed twice.

- Wave 10 found one surface asserting a title the row did not carry. `T025` made the claim conditional and
  left the titled sentence byte-unchanged, so the shipped digest renders what it rendered before.
- Wave 14 found the measurement Log restating a hash equality and a claim about later commits. `T026`
  withdrew both in an appended entry. Wave 19 then found a third instance the same class and `T027`
  withdrew it, because a withdrawal that names two of three instances is a count that is already wrong.
- Wave 17 found the census and stability recordings stale behind a later landing. They were re-derived by
  their own capture commands, twice, because `T025` and `T026` landed after the first re-derivation.

## The ordering defect, which was the real discovery

The rule that the last task of the last wave runs the project verify is true only if the last task to land
is the one that re-derives. On this milestone `T024` re-derived both recordings and then `T020`, `T022`,
`T023`, `T025`, `T026` and `T027` landed behind it, each moving a count the recordings hold. The answer is
now recorded in the user-scope rules: re-derive after the final landing, not after the final task file is
written.

## What the surfaces state now

- One finding per captured diagnostic, carrying the diagnostic's own text and the code it carries.
- A digest entry's title when the row carries one, and no title claim when it does not.
- An absence by name: the code, or the fact that the message carried no code, never a count and never a
  remedy.
- `captured-nothing` and `no-diagnostics` as separate registered sentences, so a page that captured nothing
  is not reported as a digest gap.
- A reason vocabulary that is a closed set, so a reason the pane does not know is a named refusal rather
  than prose.

## Verification

- `prepare-final` at the reviewed head: discussion records, `verify-landed` and lean verification all
  exit 0.
- `gate:verification:ship` passes: every verify check carries a verified verdict and none carries not
  verified.
- `npm run check` exit 0 at every landing, seven stages including `format:check` at 80 columns.
- Twenty wave reviews pass `gsd review-check`; four waves carry cycle-2 or later verdicts whose earlier
  files were deleted and named.
