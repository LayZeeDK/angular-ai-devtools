---
id: T001
title: Measure the capture and the digest
wave: 1
deps: []
status: done
agent: build_T001
base: 9e95f740c5481f38178c39b50406877da2977f84
worktree: null
task_branch: null
files:
  - research/raw/m045-console-shapes.json
---

# T001 — Measure the capture and the digest

## Context

The join must be written against the shapes the extension actually produces. The roadmap's sentence reads as though every console method is captured; the code wraps `console.error` only, and the digest is `{version, entries}` with `{code, title, body}` per entry. Measure before writing the join.

## Approach

- Read `extension/agent-main.js`'s capture path and record the payload shape it hands to `captureErrorPayload`.
- Read `extension/error-digest.json` and record the entry shape and the code distribution.
- Write `research/raw/m045-console-shapes.json` with both shapes and the commands that produced them.

## Acceptance criteria

1. The record names the capture entry points and the exact payload shape, with file:line for each.
2. The record names the digest's entry fields and counts the codes, quoting the file.
3. The record states what is NOT captured, so no later task assumes a wider observable.
4. Every number in the record comes from a command whose output is in the same file.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC1

## Verify

```bash
node --check extension/agent-main.js && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at plan approval; not started.
- 2026-11-15 — T001 measured and recorded at branch `gsd-path/M057`, head `9e95f740` (cwd `D:\projects\sandbox\angular-ai-devtools`, node `v24.22.0`, win32).
  - Deliverable: `research/raw/m045-console-shapes.json`, **27,122 bytes**, `schema` `m045-console-shapes/v1`, 13 recorded commands, 10 `notCaptured` entries. Every number in it is the recorded stdout of one of those 13 commands; their full command text, exit code and verbatim output are in `provenance.commands`, and each measured block names the command id it came from.
  - Commands run (all exit 0). Verbatim text of c3–c13 is in the recording's `provenance.commands`:
    - `c1` `git rev-parse --abbrev-ref HEAD && git rev-parse --short HEAD` → `gsd-path/M057`, `9e95f740`
    - `c2` `node --version` → `v24.22.0`
    - `c3` `node -e` — count `console.<method>` occurrences in `extension/agent-main.js`, and its line count → `console.error=4`, the other nine methods `=0`, `agent-main.js lines=2568`
    - `c4` `node -e` — print `extension/agent-main.js:2495-2531` with line numbers (the whole `captureErrorPayload` body: code regex at `:2502`, component probe at `:2507-2514`, payload literal at `:2522-2527`, `/* never throw */` at `:2529`)
    - `c5` `node -e` — print every line naming `ERROR_CAPTURE_EVENT`, `captureErrorPayload`, `console.error` or `addEventListener(` → 15 lines, `:16`, `:2469`, `:2484`, `:2489`, `:2493`, `:2495`, `:2522`, `:2534`, `:2535`, `:2536`, `:2538`, `:2550`, `:2552`, `:2557`, `:2559`
    - `c6` `node -e` — derive the payload keys from the dispatch site → `dispatchLine: 2522`, `payloadKeys: code,message,component,timestamp`
    - `c7` `node -e` — slice the shipped regex literal out of `:2502`, `eval` it, print `sample -> code` for 10 texts
    - `c8` `node -e` — digest top-level and entry shape → `version,entries`, `22.2.x (type string)`, `entryCount: 64`, `uniqueCodes: 64`, `entryKeySets: body,code,title`, `fieldTypes: code:string title:string body:string`, `firstCode: NG0100`, `lastCode: NG8024`
    - `c9` `node -e` — code distribution against the shipped regex, plus trim-marker and title/body facts
    - `c10` `node -e` — digest file size → `bytes: 61577`, `chars: 61450`, `lines: 326`
    - `c11` `node -e` — all 64 codes, comma-joined
    - `c12` `node -e` — quote `extension/error-digest.json:1-6` and measure entry 1's body length → `965`
    - `c13` `node -e` — `error-capture` occurrences in `extension/relay.js` and `extension/background.js` → `relay.js:27`, `relay.js:30`, `background.js:16`
  - Capture, with file:line — **three** entry points, one payload. `console.error` wrapper `extension/agent-main.js:2536`, call site `:2538`, hands `Array.prototype.slice.call(arguments).join(' ')`; `globalThis.addEventListener('error', …)` `:2550`, call site `:2552`, hands `ev.error || ev.message || ev`; `globalThis.addEventListener('unhandledrejection', …)` `:2557`, call site `:2559`, hands `ev.reason || ev`. All three call `captureErrorPayload` (`:2495`), which dispatches `{code, message, component, timestamp}` at `:2522` as `angular-ai:error-capture` (`:16`) through `dispatch` (`:1397`); the relay re-sends the same four keys plus `type` (`extension/relay.js:27`, `:30`), allowlisted at `extension/background.js:16`.
  - Code extraction: `/NG0\d{3,}/` at `:2502`, first match only, case-sensitive. Measured: `NG04002: Cannot match any routes. URL Segment: x` → `NG04002`; `NG0100` → `NG0100`; `NG8008` → null; `ng0100` → null; `  NG0100  ` → `NG0100`; `error NG04002 happened` → `NG04002`; `ExpressionChangedAfterItHasBeenCheckedError…` → null; `NG0` → null.
  - Console methods: `console.error=4` and `warn`/`log`/`info`/`debug`/`trace`/`dir`/`table`/`assert`/`group` all `=0` — the file mentions no console method but `console.error`, and all four mentions are the hook (`:2534`, `:2535`, `:2536`) and the comment at `:2493`.
  - Digest: `{version, entries}`, version `"22.2.x"` (string), 64 entries, 64 unique codes, exactly one key set `{code, title, body}` all typed string; 61,577 bytes / 61,450 chars / 326 lines. Prefixes: `NG0`=53, `NG1`=1, `NG2`=2, `NG3`=1, `NG6`=1, `NG8`=6; code lengths 6–7. 53 of the 64 codes are extractable by the shipped capture regex, 11 are not. 45 of 64 bodies end with the trim marker (U+2026); 62 of 64 titles repeat their body's opening words; entry 1's body is 965 chars.
  - Self-check (scratch script in the session scratchpad, not committed) re-ran all 13 recorded commands, compared each output verbatim, then compared 50+ data fields against those outputs: `SELF-CHECK PASS`, exit 0.
  - Verify — `node --check extension/agent-main.js && npx prettier --check research/raw/m045-console-shapes.json` → **exit 0**:
    ```
    Checking formatting...
    All matched files use Prettier code style!
    ```
  - The plan did not anticipate these:
    1. **A third entry point.** The Context here and `.project/intent/INTENT.md`'s correction both say "`console.error` alongside `window.onerror`", but `globalThis.addEventListener('unhandledrejection', …)` at `:2557` dispatches the same payload, so the observable is three hooks and the record says so.
    2. **`component` is not attribution.** It is resolved from `document.activeElement || app-root || body || documentElement` (`:2507-2514`), not from the logging call site, and goes null when the page exposes no resolver or it throws (`:2505`, `:2518-2520`). The interface contract renders no `component`, which keeps it out of the findings, but no later task should read it as "the component that logged".
    3. **The capture's code space is a strict subset of the digest's.** 11 of 64 digest codes (all non-`NG0`: `NG1001`, `NG2003`, `NG2009`, `NG3003`, `NG6100`, `NG8001`, `NG8002`, `NG8003`, `NG8011`, `NG8023`, `NG8024`) can never be extracted by the shipped regex, so a page logging one of those texts arrives as "carried no code", never as "the digest lacks the code".
    4. **A shipped witness for the `reason` path.** The digest has no `NG04002` entry, and `NG04002: Cannot match any routes. URL Segment: …` is a text the capture does extract a code from — so SC3's no-entry case can be proven against the shipped digest with no fixture.
    5. **A failed capture is silent.** `captureErrorPayload` swallows every error (`:2528-2530`, `/* never throw */`), so `captured-nothing` cannot be read as "the page was silent"; the record states this so the empty-report wording does not overclaim.
    6. **No location in the payload.** `code`, `message`, `component`, `timestamp` are the only keys — no url, line, column, stack or phase — so nothing in the data can support a "where" claim, matching the contract's exclusion of element references.

- Verdict: ready — the task's Verify exited 0 at head ee4bfbd2 \
ode --check\ and Prettier clean; the orchestrator re-ran both and independently confirmed the digest's 64 unique codes and that NG04002 is absent from it; the worktree diff equals the declared \iles:\.

- 2026-11-16 — **T008 corrections, appended; nothing above is rewritten.**
  - **The deliverable's size.** `27,122 bytes` in the first entry was the artifact at `ee4bfbd2`; `a4a57f9e` rewrote it to 27,783, and T008's corrections leave it at **33,917 bytes**. Measured: `node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)"` → `bytes: 33917`, exit 0. The record itself states no size of its own; this logged command is where its size is measured. The record now carries 15 recorded commands (`c1`–`c15`; `c14` measures the manifest block and `c15` the hook block), and every number T008 added is printed by one of them.
  - **Install timing — the record's earlier entry was wrong.** It said the hooks install "at script evaluation" and quoted `extension/agent-main.js:2493`'s `document_start` comment as support. The manifest is the authority and it says otherwise: `extension/manifest.json:36` injects `agent-main.js` with `"run_at": "document_idle"` — the second `content_scripts` entry (`:29-38`), the only entry whose `js` lists `agent-main.js` (`:34`), `world: "MAIN"` (`:37`). The only `run_at: "document_start"` in the manifest is the overlay entry (`:39-49`, `:48`), measured by the record's `c14` (`agent-main.js mentions in manifest: 1`, `document_start mentions in manifest: 1`). So **every diagnostic logged before the injection at `document_idle` is lost — including bootstrap-time `NG0xxx`, the errors this milestone exists to join.** The `agent-main.js:2493` comment is contradicted by the manifest; the record now states this at `capture.installTime.codeCommentContradicted`, and its `notCaptured` entry carries the manifest line as evidence.
  - **The corrupted verdict sentence, restated.** The previous entry's final line carries `U+000C` at character index 9056 and `U+000D` at 9064 (the latter is the final line's carriage return), and its intended backticks were written as backslashes, so the Verify reads as a line break plus `ode --check\`. What it was meant to say, and now does, is: "Verdict: ready — the task's Verify exited 0 at head `ee4bfbd2` (`node --check extension/agent-main.js && npx prettier --check research/raw/m045-console-shapes.json`), with Prettier clean; the orchestrator re-ran both and independently confirmed the digest's 64 unique codes and that NG04002 is absent from it; the worktree diff equals the declared files." The corrupted line is left in place because this Log is append-only; this entry is the correction of record, and the control character is accounted for here rather than silently removed.
  - **Containment, for the record.** The earlier note was inverted. The 53 digest codes the capture's regex can extract are a strict subset of the digest's 64, while `NG04002` is extractable by that regex and absent from all 64 entries — so the capture can produce a code the digest lacks. The record's `captureToDigestGap` now names the fields for what they count (`digestCodesTheCaptureCanExtract`, `digestCodesTheCaptureCannotExtract`) and states this relation.

- 2026-11-16 — **The control-character count corrected: one control character, `U+000C` at index 9056, and this file is LF-only. Nothing above is rewritten.**
  - **What the entry at `:91` claims, and which half of it this corrects.** That entry states that the corrupted verdict sentence carries `U+000C` at character index 9056 **and** `U+000D` at 9064, "the latter is the final line's carriage return". The first half stands. The second is **corrected here**: this file carries no `U+000D` at all, and index 9064 holds the newline that terminates the corrupted line, which is what the earlier entry mistook for a carriage return. The over-report was not measured when it was written — it reached this Log from wave 1's cycle-1 review and T008's entry repeated it — so it is named as corrected rather than left standing.
  - **Measured at this head.** `node -e "const s=require('fs').readFileSync('.project/tasks/T001-measure-the-capture-and-the-digest.md','utf8');const f=[],at=[];for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if((c<32&&c!==10)||(c>=127&&c<160)||c===8232||c===8233){f.push('U+'+c.toString(16).toUpperCase().padStart(4,'0')+' at '+i);at.push(i)}}console.log('controlCharsOtherThanLF: '+f.length+(f.length?': '+f.join(', '):''));console.log('carriageReturns: '+(s.split(String.fromCharCode(13)).length-1));console.log('controlCharacterLine: '+(at.length?s.slice(0,at[0]).split(String.fromCharCode(10)).length:0));console.log('textAroundIt: '+JSON.stringify(at.length?s.slice(at[0]-3,at[0]+6):''));console.log('charAt9064: '+JSON.stringify(s.charAt(9064)));console.log('nextLineFeedFrom9056: '+s.indexOf(String.fromCharCode(10),9056))"` → `controlCharsOtherThanLF: 1: U+000C at 9056`, `carriageReturns: 0`, `controlCharacterLine: 86`, `textAroundIt: "d \\\files:"`, `charAt9064: "\n"`, `nextLineFeedFrom9056: 9064`, exit 0.
  - **What each line of that output settles.** The scan walks every character of this file and reports each one whose code is `c<32` (below `U+0020`), `c>=127&&c<160` (`U+007F`–`U+009F`) or `c===8232||c===8233` (`U+2028`/`U+2029`), excluding `c===10` only because the file is made of lines. It finds **one** such character and no other: `U+000C`, a form feed, at index 9056, on the line the command itself numbers 86, sitting between the backslash and `files` of the corrupted `\files:\` reading. `carriageReturns: 0` is the measured sense of "LF-only": nothing in the file is a carriage return, and the scan would have listed any other line-control character had one been there. `charAt9064: "\n"` together with `nextLineFeedFrom9056: 9064` says index 9064 is the first line feed at or after the form feed — the newline terminating the corrupted line — and carries no control character of its own.
  - **The rest of `:91` is not in question.** The restated sentence, the backslashes-where-backticks-were reading of `ode --check\`, and the paragraph this correction attaches to were verified when they were written and are left as they stand. Only the count and the identity of index 9064 change here, and they change by measurement rather than by preference.
