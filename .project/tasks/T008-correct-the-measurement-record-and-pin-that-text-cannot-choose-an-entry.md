---
id: T008
title: Correct the measurement record and pin that text cannot choose an entry
wave: 6
deps:
  - T001
  - T002
status: done
agent: build_T008
base: 8851f77e4edac1b2ce32104b5449ec5506f76c59
worktree: null
task_branch: null
files:
  - research/raw/m045-console-shapes.json
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - research/raw/m056-gate-stability.json
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
---

# T008 — Correct the measurement record and pin that text cannot choose an entry

## Context

Wave 1's review found the record repeating a comment instead of measuring a manifest:
`research/raw/m045-console-shapes.json:352` records the hooks as installing "at script evaluation", while
`extension/manifest.json` injects `agent-main.js` with `"run_at": "document_idle"` (content_scripts[2]; the
only `document_start` entry is the overlay). The comment it cites, `extension/agent-main.js:2493`, claims
`document_start`. So every `NG0xxx` logged during bootstrap is lost, and `notCaptured` describes only a much
narrower gap. The same review found the containment note inverted (`:567` says the capture's code space is a
strict subset of the digest's, while `NG04002` is extractable by `/NG0\d{3,}/` and absent from all 64
entries), the field `codesTheCaptureCanName: 53` (`:564`) mislabelled, and the T001 Log's own byte count
(`27,122`) stale since `a4a57f9e` rewrote the artifact to 27,783 and unsupported by any recorded command. The
Log's landing verdict line is also corrupted: two control characters (`U+000C`, `U+000D`) and backslashes
where backticks belong.

Wave 2's review found the join's "never matches text, never re-extracts a code" rule established by reading
the source rather than by a test: a text fallback and a re-extraction mutant both survived the suite, because
the absent-code message contains none of the 64 titles and `'the app failed'` is the only code-less text
asserted.

## Approach

- - Measure the manifest and record it: `installTime.when` cites `extension/manifest.json`'s `run_at` for
  `agent-main.js`, and the record states plainly that `agent-main.js:2493`'s `document_start` comment is
  contradicted by the manifest.
- Replace the vague `notCaptured` entry with the sharp one: every diagnostic logged before the injection at
  `document_idle` is lost, carrying the manifest evidence.
- Correct the containment note to what is true — the digest codes the capture can extract are a strict subset
  of the digest's 64 — and rename `codesTheCaptureCanName` to say what it counts.
- Restate the deliverable's size from a recorded command, or drop the figure; do not carry a number no
  command prints.
- Append Log corrections to T001 (never rewrite): the size, the install timing, and a restatement of the
  corrupted verdict sentence with real backticks and no control characters.
- Pin the join's rule with two tests that would fail on the mutants the review built: a text fallback that
  searches titles, and a re-extraction from the message text. Both must redden naming the rule.
- Re-arm `research/raw/m056-gate-stability.json` if its recorded mention counts move, and prove the unarmed
  read byte-identical.

## Acceptance criteria

1. The record's install-time entry cites the manifest's `run_at` for `agent-main.js` and names the code comment it contradicts.
2. `notCaptured` states that diagnostics logged before injection are lost, with the manifest line as its evidence, and no entry contradicts another.
3. The containment note and its field name state the true relation between the capture's extractable codes and the digest's 64.
4. Every number in the record, including its own size, is the printed output of a recorded command.
5. A join that picks a digest entry by message text reddens a test naming the rule; a join that re-extracts a code from text reddens another.
6. The T001 Log's corrections are appended, its corrupted verdict sentence is restated correctly in the appended entry, and the file's control characters are accounted for rather than silently left.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw extension scripts
```

## Log

- Task written at the repair cycle; not started.

- 2026-11-16 — T008 corrections and pins.
  - **Manifest measured; the code comment contradicted.** `research/raw/m045-console-shapes.json:441` is `capture.installTime.manifest`: `extension/manifest.json:36` injects `agent-main.js` with `"run_at": "document_idle"` — the second `content_scripts` entry (`:29-38`), the only entry whose `js` lists `agent-main.js` (`:34`), `world: "MAIN"` (`:37`). The only `document_start` in the manifest is the overlay entry (`:39-49`, run_at at `:48`). `research/raw/m045-console-shapes.json:449` is `codeCommentContradicted`: `extension/agent-main.js:2493` says `error capture hooks at document_start`, and the manifest contradicts it. Both are measured by the new recorded command `c14`; re-running it reproduces its 36 recorded output lines exactly (`c14: MATCH (36 lines)`), and `c15` likewise reproduces the hook block (`c15: MATCH (38 lines)`).
  - **The blind spot, sharpened.** `research/raw/m045-console-shapes.json:651` is the rewritten `notCaptured` entry: every diagnostic logged before the injection at `document_idle` is lost — including bootstrap-time `NG0xxx` codes, the errors this milestone exists to join — with `extension/manifest.json:36` as its evidence and the contradicted code comment named. The old vague "logged before the hooks install" entry is gone. A diagnostic logged after the page replaces `console.error` or through a saved original is still stated, in the same entry, and its evidence is now `c14` plus `c5`.
  - **Containment, un-inverted.** `research/raw/m045-console-shapes.json:668` is `digestCodesTheCaptureCanExtract` (53) and `:669` is `digestCodesTheCaptureCannotExtract` (11); the note at `:671` states the true relation: the 53 digest codes the capture's `/NG0\d{3,}/` can extract are a strict subset of the digest's 64, while `NG04002` is extractable by that regex (`c7`) and absent from all 64 digest entries (`c8`, `c11`), so the capture can produce a code the digest lacks. The mislabelled `codesTheCaptureCanName` field is gone.
  - **Every added number is a recorded command.** The record's own byte size is not stated in the record (the figure is dropped there); it is measured for this Log: `node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)"` → `bytes: 33917`, exit 0. The manifest and hook-block numbers come from `c14`/`c15`, and the containment numbers from `c7`/`c8`/`c9`/`c11`.
  - **Two mutants built on the shipped module, both red, module restored.** Baseline `extension/console-join.js` sha256 `63dcf6d34c325d5914fe2f3d8c69d245ec51b45b340dcba40274046b92bd1585` (6,921 bytes).
    - Text fallback, applied by hand (`let entry = matchEntry(entries, code); if (!entry) { entry = entries.find((candidate) => typeof candidate.title === 'string' && text.includes(candidate.title)) || null; }`): `node --test scripts/console-join.test.mjs` exits 1; `text-fallback reddens naming "message text"` fails at `scripts/console-join.test.mjs:279` with `AssertionError [ERR_ASSERTION]: a join must never choose a digest entry by matching message text: the message carried NG04002, the digest lacks it, and the absence must be reported by name` (`actual: undefined`, `expected: 'no-digest-entry'`).
    - Re-extraction, applied by hand (`let code = codeOf(diagnostic); if (code === null) { const fromText = text.match(/NG0\d{3,}/); if (fromText) code = fromText[0]; }`): exits 1; `re-extracted-code reddens naming "re-extract"` fails at `scripts/console-join.test.mjs:299` with `AssertionError [ERR_ASSERTION]: a join must never re-extract a code from message text: the capture wrote no code, and joining one from the text is a second rule nobody measured`.
    - Both edits were restored from the index; the module's sha256 is back to `63dcf6d34c325d5914fe2f3d8c69d245ec51b45b340dcba40274046b92bd1585` (6,921 bytes). The same two edits are `MUTATIONS` entries in `scripts/console-join.test.mjs`; the suite, including its in-memory mutants, is 28/28 green.
  - **Gate stability.** The Log text below this entry is what the gate reads, so `research/raw/m056-gate-stability.json` is re-armed only after the final Log appendix, and the re-arm and its unarmed read are recorded in that appendix.

- 2026-11-16 — the fenced Verify, run exactly, exit 0.
  - `node --test scripts/console-join.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw extension scripts`
  - Real output (excerpt: every summary line; the full run was 222 lines):
    ```
    ℹ tests 35
    ℹ pass 35
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    verification gate (structure): pass
    gate-integrity: pass - 0 finding(s)
    gate-integrity: pass - 0 finding(s), 84 mention(s)
    Checking formatting...
    All matched files use Prettier code style!
    EXIT:0
    ```
  - The two new pins are inside the 35: `text-fallback reddens naming "message text"` and `re-extracted-code reddens naming "re-extract"` both pass on the shipped module and redden on the hand-built mutants recorded above.

- 2026-11-16 — stability record re-armed, and the unarmed read proven byte-identical.
  - The gate-stability recording was re-armed after the appendix above: **36,067 bytes**, sha256 `248da3afbed401d31107ebeb9289930e3190ff1f2f847f331eda29da3ff2cd16`.
  - The unarmed gate-stability suite exits 0, 8/8, and prints that same sha256 at load and after the run (`248da3af…cd16`, 36,067 bytes before and after), so the read changed no byte. This appendix names no file path, so it cannot move the recorded count.
  - Verdict: ready — all six acceptance criteria hold at this head; the record is corrected and every number in it is a recorded command's output, the join's two unenforced rules are now pinned by mutants that redden naming them, the module is byte-identical to its shipped sha256 `63dcf6d3…1585`, the T001 Log's corrections are appended without rewriting it, and the fenced Verify exits 0.
ready
