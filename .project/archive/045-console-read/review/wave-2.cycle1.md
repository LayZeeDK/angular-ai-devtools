# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T002 — Join a captured diagnostic to the digest by code: pass

- ✅ Verify, run verbatim at the reviewed HEAD — `node --check extension/console-join.js && node --test scripts/console-join.test.mjs` → exit 0: `ℹ tests 39`, `ℹ pass 39`, `ℹ fail 0` (9 suites), including the mutant group `✔ absence-as-count reddens naming "count"`, `✔ invented-code reddens naming "no code"`, `✔ deduped-findings reddens naming "two findings"`, `✔ case-fold-removed reddens naming "E6"` and `✔ reason-outside-the-enumeration reddens naming "the page was silent"`. `npx prettier --check extension/console-join.js scripts/console-join.test.mjs` → `Checking formatting...` / `All matched files use Prettier code style!`, exit 0.
- ✅ The join's provenance is the shipped digest, not a fixture: the suite group output at the reviewed HEAD reads `✔ reads the 64-entry digest the extension ships (1.8548ms)`, and `node -e "const d=require('./extension/error-digest.json');console.log('entries:',d.entries.length,'NG04002 carried:',d.entries.some(e=>e.code==='NG04002'))"` → `entries: 64 NG04002 carried: false`, so the absent-entry case the suite uses is real in the shipped file.
- ✅ Landing commit: `f1e23ecf` (`git show --stat f1e23ecf`: `extension/console-join.js` +148, `scripts/console-join.test.mjs` +543, `scripts/gate-integrity.test.mjs` +33, `research/raw/m044-gate-shapes.json` +52). The landing diff shows the gate repair in the same commit: the `SUITE_DIFF_REASONS` entry `'scripts/console-join.test.mjs': 'wholly added at this head: M045 T002 pins the join of a captured diagnostic to the shipped digest by the code it carries …'` and the sorted file list / measured `lineCount` for an untracked suite in `deriveSuiteDiff`.
- Note, not a defect of this task: at the reviewed HEAD `scripts/gate-integrity.test.mjs` carries 1 failing test (`T004: the three new sections are what this head derives, so a default run is a read`), whose diff names only the `suiteDiff` line counts of `scripts/console-join.test.mjs`, `scripts/console-panel-record.test.mjs` and `scripts/console-panel-render.test.mjs` — the files waves 14–16 (T020, T022, T023) edited after T024's re-derivation. It is the staleness class wave 17's re-derivation task owns, not a regression of T002's join.
- This review replaces `.project/review/wave-2.cycle3.md`, deleted with it: that record judged T002's landing before the repair waves rewrote the files it covered — `extension/console-join.js` gained the case fold (T015), the verbatim `text` rule (T021) and the closed reason set (T022), and `scripts/console-join.test.mjs` grew with them — so the earlier verdict no longer describes the module a checkout carries.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ yes — `extension/console-join.js:194-203` walks the diagnostics in order and pushes one finding each: the coded path `findings.push({ text: text, code: code, title: entry.title })` (`:211`) names the diagnostic's own `text` and carried `code`, and the no-code path is `if (code === null) { findings.push({ text: text }); continue; }` — no code key is written, so none is invented. Suite output at the reviewed HEAD: `✔ keeps both findings, in capture order, with the one matched title (0.7416ms)` (AC4/E3) and `✔ carries no code, no reason and the captured text verbatim (1.4823ms)` (AC3/E1).

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ yes — `extension/console-join.js:209-211` copies the matched entry's title onto the finding (`if (entry && typeof entry.title === 'string') { … findings.push({ text: text, code: code, title: entry.title }); }`), and the suite proves it against the shipped file, not a fixture: `scripts/console-join.test.mjs` reads `extension/error-digest.json` and its output opens with `✔ reads the 64-entry digest the extension ships`, with `✔ yields one finding naming the shipped digest title (1.5842ms)` under AC1. Measured against the shipped file: `entries: 64`, `NG0100 title: Expression Changed After Checked` — the title the joined finding carries.

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ yes — `extension/console-join.js:236` is `findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });` for a carried code the digest lacks — the finding names the code — and `:198-203` leaves a no-code finding as `{ text }` with the absence stated by the missing key. The mutant pins prove the count and the invention redden: from the reviewed-HEAD run, `✔ absence-as-count reddens naming "count"` and `✔ invented-code reddens naming "no code"`, plus `✔ names NG04002 with the reason and no title (3.0001ms)` using the shipped digest's own absence (`NG04002 carried: false`, measured).
