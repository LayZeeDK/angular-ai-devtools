# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T001 — Measure the capture and the digest: pass

- ✅ The deliverable exists at the reviewed HEAD and carries the measured shapes: `node -e "const r=require('./research/raw/m045-console-shapes.json');console.log(r.schema)"` → `m045-console-shapes/v1`; its `capture` block carries `entryPoints`, `entryPointCount`, `payload`, `codeExtraction`, `consoleMethods`, `installTime`, and `notCaptured`. The digest facts the record states were re-measured at the reviewed HEAD: `node -e "const d=require('./extension/error-digest.json');console.log('entries:',d.entries.length,'NG04002 carried:',d.entries.some(e=>e.code==='NG04002'),'NG0100 title:',d.entries.find(e=>e.code==='NG0100').title)"` → `entries: 64 NG04002 carried: false NG0100 title: Expression Changed After Checked` — 64 entries, 64 unique codes, and the shipped witness `NG04002` for the join's absence path is confirmed absent, exactly as the record and the T002 suite rely on.
- ✅ Verify, run verbatim at the reviewed HEAD — `node --check extension/agent-main.js && npx prettier --check research/raw/m045-console-shapes.json` → exit 0:
  ```
  Checking formatting...
  All matched files use Prettier code style!
  ```
- ✅ Landing commit: `ee4bfbd2` (`git show --stat ee4bfbd2`: `research/raw/m045-console-shapes.json` +519 lines, task Log +39), with the Log-only append at `a4a57f9e`. The gate reads the T002 Log's `scripts/recording-consistency.test.mjs` mention as a satisfied pin against the full M057 range at this head (`gate-integrity: pin scripts/recording-consistency.test.mjs ... declared and byte-identical`), so the record's prose survives the recording-consistency rules the earlier cycle flagged.
- This review replaces `.project/review/wave-1.cycle5.md`, deleted with it: that record judged T001's landing at an earlier head, and the files it covered (`research/raw/m045-console-shapes.json` and the T001 task Log) were rewritten by the T008/T010/T013/T015/T020 repair waves (corrections, command ids `c14`–`c18`, and the Log's measurement rules), so the earlier pass no longer describes what a checkout carries.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ yes — T001 is the measure stage this criterion's join stands on, and its record states the payload the join consumes: `research/raw/m045-console-shapes.json` `capture.payload` carries the four keys the dispatch site writes (`code`, `message`, `component`, `timestamp`), measured from `extension/agent-main.js:2522`, and `capture.consoleMethods` measures `console.error=4` with the other nine methods at 0, so the observable is not widened beyond what the page agent records. The criterion's product half is delivered downstream (T002, reviewed in wave 2), where `extension/console-join.js:194-201` pushes exactly one finding per diagnostic — `for (let i = 0; i < diagnostics.length; i += 1)` with `findings.push({ text: text })` and no `code` key when `codeOf` returns null — so no code is invented for a message that carried none; the wave-2 suite output at the reviewed HEAD reads `✔ carries no code, no reason and the captured text verbatim (1.4823ms)`.
