# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 72f5c7765f6b6b0a2e9b7f4c5d1a3e8f9b2c6d4a

## T001 — Measure the capture and the digest: fail

- ❌ The record's install-time claim is contradicted by the manifest, and the blind spot it hides is the
  material one: `research/raw/m045-console-shapes.json:352` records the hooks as installing "at script
  evaluation", while `extension/manifest.json` injects `agent-main.js` with `"run_at": "document_idle"`
  (content_scripts[2], the only registration of that file; the only `document_start` entry is the overlay).
  The comment the record quotes by way of support, `extension/agent-main.js:2493`, claims
  `at document_start` — so the record repeats a false premise from the code instead of measuring it against
  the manifest. Every `NG0xxx` logged during bootstrap is therefore lost, and `notCaptured` describes only
  "a diagnostic logged before the hooks install … at script evaluation", which reads as a much narrower gap.
- ❌ The summary's containment statement is inverted and its own data contradicts it one line later:
  `research/raw/m045-console-shapes.json:567` says the capture's code space "is a strict subset of the
  digest's", while `NG04002` is extractable by the capture's `/NG0\d{3,}/` and absent from all 64 digest
  entries — a fact the same record shows. The mislabelled field is `codesTheCaptureCanName: 53`
  (`:564`), which is the count of *digest* codes the regex can extract.
- ❌ The task Log's own deliverable size is stale and comes from no recorded command:
  `T001-measure-the-capture-and-the-digest.md:52` says "27,122 bytes", true at `ee4bfbd2` only. The
  follow-up `a4a57f9e` rewrote the artifact and it is 27,783 bytes. No entry in `provenance.commands`
  prints either number, which breaks the rule the artifact itself announces at `:16`.
- ❌ The landing verdict line added at `c071d9dd` is corrupted: a scan of the task file reports two control
  characters other than LF (`U+000C` at index 9056, `U+000D` at 9064) and the intended backticks became
  backslashes, so `\`node --check\`` reads as a newline plus `ode --check\`. This is the sentence a reader
  checks first.
- ✅ What holds, verified independently: all thirteen recorded commands reproduce; every `file:line`
  citation opens on the code the record names; the console claim is stronger than recorded (the only
  `console.<member>` token in `agent-main.js` is `error`); the sentence added at `a4a57f9e` matches the
  digest's measured 61,577 bytes / 326 lines / 61,450 characters; `recording-consistency` is 7/7 with it.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ The half this wave owes is measured and reproduces: the code is the first `/NG0\d{3,}/` match else
  null (`extension/agent-main.js:2503`, `var code = codeMatch ? codeMatch[0] : null;`), and the reported text
  is the diagnostic's own (the joined arguments at `:2538`). The reporting half belongs to the join and the
  panel, and the record says so itself at `:588`.
