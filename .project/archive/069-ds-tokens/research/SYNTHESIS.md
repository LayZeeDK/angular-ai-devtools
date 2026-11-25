# SYNTHESIS — gsd-path/M069 (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what was
measured before the plan and what the planner was told. It is not the milestone's ship-time synthesis.

## Settled

- **The panel's values are measurable today, and were measured before anything changed.** `scripts/panel-styles.test.mjs`
  resolves values through `window.getComputedStyle` on documents it builds, over four hooks and six dark backgrounds.
  T001 recorded what that oracle reports — 22 rules, 66 declarations, 18 properties, 80 readings — so the token layer's
  claim "the rendered values did not move" had something to be checked against rather than asserted.
- **The oracle resolves no custom property.** Measured before the plan: `getComputedStyle(el).color` for
  `color: var(--ink)` answers the literal string `var(--ink)`, a shorthand containing `var()` answers `""`, and the
  camel-cased token name is `undefined` while `getPropertyValue('--ink')` answers the value. So a token layer is
  invisible to that oracle unless the seam substitutes, and "the style suite passes unmodified" had to be read as
  "no assertion was edited" rather than "the file is byte-identical".
- **Three declarations carry a mutant's anchor.** `color: #6b5200;`, `background: #14171c;` and
  `font-family: system-ui, sans-serif;` are each matched literally, exactly once, by mutants M5, M7 and M8. Tokenising
  any of them would have forced three assertions to be weakened, so the token layer covers 63 of 66 declarations and
  declares no token for the other three.
- **Nothing in the sheet animates.** `prefers-reduced-motion` appears nowhere, so a reduced-motion contract has no
  consumer today. The milestone records that absence rather than inventing a transition, which would itself be a
  rendered change.
- **The panel's budget is a recorded measurement, not a policy number.** The eager sheet measured 535.44 kB before this
  milestone and the 520 kB warning in `project.json` is the build's threshold, not the enforced bound. A token layer
  costs bytes, so the milestone had to decide whether it may move the recorded ceiling at all.

## Decisions

- **The budget may move only by declaration.** N5 forbids widening the recorded ceiling to fit a regression, and its own
  detail permits a move a milestone declares and explains. The plan therefore gives the move a named constant, a cost, a
  reason and an assertion, so a ceiling cannot be raised without a test noticing that its reason does not carry the
  number.
- **The token layer is the whole stylesheet, not a new file.** A second stylesheet would give one token layer two homes
  and one reader two sheets to reconcile; the suite that pins the layer asserts it has exactly one home.
- **The seam may be repaired, the assertions may not.** The document-building seam substitutes `var()` as a browser
  performs the cascade; no assertion, expectation or mutant anchor in `scripts/panel-styles.test.mjs` is edited.
- **Bookkeeping sequences are verbs, not paragraphs.** This milestone's own build lost two full verify cycles because a
  task's Log append invalidated the recordings captured before it. That is recorded here as the reason for `settle`,
  `task-reset` and `capture-refresh` existing in user scope rather than as advice to remember.
