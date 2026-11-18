# Lessons

Corrections that outlive the milestone they were found in. An archived artifact is read-only, so a
claim it states wrongly is corrected **here**, with the archive named, rather than by editing the
archive.

## 2026-11-18 — M049's archive states a listener count its own evidence refuted

`.project/archive/049-interaction-story/review/FINAL.md:12` and
`.project/archive/049-interaction-story/research/SYNTHESIS.md:13` both say no file in `extension/`
registers a `click`, `pointer*`, `mouse*` or `key*` listener. That is false:
`extension/overlay.js:507` registers `attachInput(window, 'click', onClick, true)`, and `attachInput`
(`:440`) is the wrapper that calls `addEventListener`.

The measurement missed it because the search looked for `addEventListener('click'` literally, and the
overlay attaches through the wrapper. Corrected in `research/raw/m049-streams.json` at `74d00e63`.

**What still holds.** M049's conclusion was right: nothing records what a user did. The one click
listener is the panel's own element picker — `onClick` (`:356`) returns unless `armed`, then
`preventDefault`s and locks the element — so it selects what to inspect and suppresses the page's
handling. It records no interaction.

**The general lesson.** A count produced by a literal pattern is a count of that pattern, not of the
behaviour. When the pattern misses a wrapper, an indirection, or a differently-spelled name, the result
is a confident zero. Prefer counting the semantic unit (listener registrations by their target and
type) over counting one spelling of it, and treat any zero that supports a milestone's premise as a
claim to be re-measured against the code rather than inherited from the record.
