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

- 2026-11-16 — **T013: the deliverable's size is restated as a measurement at a named commit, and the command count is corrected. Nothing above is rewritten.**
  - **What this entry corrects, and why it is an append.** The entry at `:89` states the record as **33,917 bytes** with a command beside it that prints a different number today, and counts "15 recorded commands (`c1`–`c15`)" where the record holds 16. Both statements are corrected here rather than edited, because this Log is append-only: `:89` stays byte-identical, remains true of the commit named below, and this entry is the correction of record.
  - **The size, restated as a measurement at a named commit.** The command below prints the byte length of the record's blob at each commit it names — `git cat-file -s` reads that commit's own tree, never the worktree. Run at head `628bd800`, exit 0:
    ```
    node -e "const {execFileSync}=require('child_process');for(const c of ['ee4bfbd2','a4a57f9e','9f0603c9','234a3b4c','e1ba31fc','628bd800'])console.log(c+': '+execFileSync('git',['cat-file','-s',c+':research/raw/m045-console-shapes.json']).toString().trim())"
    ```
    ```
    ee4bfbd2: 27122
    a4a57f9e: 27783
    9f0603c9: 33917
    234a3b4c: 35619
    e1ba31fc: 35619
    628bd800: 35619
    ```
  - **Every size this Log states, held to the commit it was measured at.** Each line above is the number that command prints at the commit beside it:
    - **27,122 bytes at `ee4bfbd2`** — T001's own commit; the "27,122 bytes" of the first entry.
    - **27,783 bytes at `a4a57f9e`** — the rewrite the first entry names.
    - **33,917 bytes at `9f0603c9`** — T008's commit. That is the number `:89` states without a commit: a correct measurement of that commit, and of no later one.
    - **35,619 bytes at `234a3b4c`, at `e1ba31fc` and at `628bd800`** — T010's own `c16` append is what moved the record off 33,917, and no commit since has touched it, so **the deliverable is 35,619 bytes measured at `628bd800`**, the head this entry was written at.
  - **Why the restated claim cannot go stale.** Every line is read from a commit's tree by `git cat-file -s`, so a later append — a `c17`, another correction — changes the file a checkout gives you and leaves all six lines byte-for-byte as printed, `628bd800`'s included, which stays the last commit that touched the record until another one does. The command in `:89` cannot be restated that way, because it reads the worktree: `node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)"` prints `bytes: 35619` at this head (measured, exit 0) and printed `bytes: 33917` only on a tree at `9f0603c9`. The worktree is the named commit's bytes and not some later state: `git hash-object research/raw/m045-console-shapes.json` and `git rev-parse 628bd800:research/raw/m045-console-shapes.json` both print `de0f927ab2dce1d722a1dbada2dd00d116d4feef`, so the size above describes what is checked in at this head.
  - **The Log's other stated size, held the same way.** The digest's `61,577 bytes` (`:70`, printed by `c10`) is not the deliverable's, and it has not moved: `node -e "const {execFileSync}=require('child_process');for(const c of ['9e95f740','628bd800'])console.log('extension/error-digest.json at '+c+': '+execFileSync('git',['cat-file','-s',c+':extension/error-digest.json']).toString().trim())"` prints `extension/error-digest.json at 9e95f740: 61577` and `extension/error-digest.json at 628bd800: 61577`, exit 0 — the commit `c10` measured at, and this head.
  - **The commands: 16, `c1`–`c16`, each named.** `:89`'s "15 recorded commands (`c1`–`c15`)" is corrected: `provenance.commands` in the record holds **16** entries, every one `exitCode: 0`. Which command is which:
    - `c1` branch and short HEAD → `gsd-path/M057`, `9e95f740` (the head it was captured at)
    - `c2` node version → `v24.22.0`
    - `c3` counts the ten `console.<method>` occurrences in `extension/agent-main.js` and its line count → `console.error=4`, the other nine `=0`, `agent-main.js lines=2568`
    - `c4` prints `extension/agent-main.js:2495-2531` — the `captureErrorPayload` body
    - `c5` prints every line naming `ERROR_CAPTURE_EVENT`, `captureErrorPayload`, `console.error` or `addEventListener(` → 15 lines
    - `c6` derives the payload keys from the dispatch site → `dispatchLine: 2522`, `payloadKeys: code,message,component,timestamp`
    - `c7` slices the shipped regex literal out of the code-match line, `eval`s it, and prints `sample -> code` for 10 texts
    - `c8` the digest's top level and entry shape → `topLevelKeys: version,entries`, `entryCount: 64`, `uniqueCodes: 64`, one key set `body,code,title` all string, `firstCode: NG0100`, `lastCode: NG8024`
    - `c9` the code distribution against the shipped regex, the trim-marker count, the title/body facts and the code lengths
    - `c10` the digest's size → `bytes: 61577`, `chars: 61450`, `lines: 326`
    - `c11` all 64 codes, comma-joined
    - `c12` quotes `extension/error-digest.json:1-6` and measures entry 1's body length → `965`
    - `c13` the `error-capture` occurrences in `extension/relay.js` and `extension/background.js`
    - `c14` prints `extension/manifest.json:18-50`, the two manifest counts (`agent-main.js mentions in manifest: 1`, `document_start mentions in manifest: 1`) and `agent-main.js:2493`
    - `c15` prints `extension/agent-main.js:2531-2568` — the console hook block, the install site
    - `c16` prints `extension/agent-main.js:1397-1416` — the `dispatch` body `capture.dispatcher` cites
  - **The 16 are carried, not just counted.** Replaying all 16 recorded command strings at this head (scratch script in the session scratchpad, not committed) gives 15 byte-identical outputs, `c2`–`c16`; `c1` differs in one line only — it records the short HEAD at capture time (`9e95f740`) where this head prints `628bd800`, which is that command doing its job. So "16" counts commands that run, and each description above is what that command's own recorded output shows.
  - **What did not change.** The deliverable is untouched — its worktree hash equals its blob at `628bd800` (`de0f927a…`) — and no product value moved. This task's changes are two task Logs: this entry and the correction T011 carries.

- 2026-11-16 — **T016: the command count is restated as a measurement at a named commit, the `9e95f740` size attribution and the worktree-hash sentence are corrected. Nothing above is rewritten.**
  - **What this entry corrects, and why it is an append.** Three statements above are aged, and one of them is false. `:121` says "The commands: 16, `c1`–`c16`, each named" and `:138` says "15 byte-identical outputs, `c2`–`c16`", where the record's `provenance.commands` holds **18** at this head. `:51` dates the deliverable to head `9e95f740`, and that commit does not carry the record at that path at all. `:119`'s closing sentence — "The worktree is the named commit's bytes and not some later state … both print `de0f927a…`" — is true of `628bd800` and reads as timeless. Each is corrected below, and no earlier byte changes: the prefix hash appended with these corrections is the proof.
  - **The count, restated as a measurement at a named commit.** `provenance.commands` is a list every append grows, so a bare count of it is true only of the commit it was counted at — the same defect T013 fixed for the sizes, one layer up. The command below reads the record out of each named commit's own tree (`git show <commit>:<path>`, never the worktree) and prints how many commands that commit carries, the ids they run between, whether every one recorded `exitCode: 0`, and the record's own byte size there. Run at head `686c6124`, exit 0:
    ```
    node -e "const {execFileSync}=require('child_process');for(const c of ['ee4bfbd2','a4a57f9e','9f0603c9','234a3b4c','e1ba31fc','628bd800','85208150','686c6124']){const b=execFileSync('git',['show',c+':research/raw/m045-console-shapes.json']);const r=JSON.parse(b);const ids=r.provenance.commands.map(x=>x.id);console.log(c+': '+ids.length+' commands ('+ids[0]+'-'+ids[ids.length-1]+'), all exit 0: '+r.provenance.commands.every(x=>x.exitCode===0)+', bytes '+b.length)}"
    ```
    ```
    ee4bfbd2: 13 commands (c1-c13), all exit 0: true, bytes 27122
    a4a57f9e: 13 commands (c1-c13), all exit 0: true, bytes 27783
    9f0603c9: 15 commands (c1-c15), all exit 0: true, bytes 33917
    234a3b4c: 16 commands (c1-c16), all exit 0: true, bytes 35619
    e1ba31fc: 16 commands (c1-c16), all exit 0: true, bytes 35619
    628bd800: 16 commands (c1-c16), all exit 0: true, bytes 35619
    85208150: 18 commands (c1-c18), all exit 0: true, bytes 39284
    686c6124: 18 commands (c1-c18), all exit 0: true, bytes 39284
    ```
    The byte column is the same reading as the block at `:107-112`, so the counts are read from the same trees the sizes are, and neither has moved.
  - **Every count this Log states, held to the commit it was counted at.**
    - **13 commands, `c1`–`c13`, at `ee4bfbd2`** — T001's own commit, and `a4a57f9e` carries the same 13, so `:52`'s "13 recorded commands" is a correct measurement of `ee4bfbd2`.
    - **15 commands, `c1`–`c15`, at `9f0603c9`** — T008's commit, which appended `c14` and `c15`, so `:89`'s "15 recorded commands (`c1`–`c15`)" is a correct measurement of `9f0603c9`.
    - **16 commands, `c1`–`c16`, at `234a3b4c`, at `e1ba31fc` and at `628bd800`** — T010's `c16` append, so `628bd800` is the commit `:121`'s "**16**, `c1`–`c16`" is true of, and the last commit it is true of.
    - **18 commands, `c1`–`c18`, at `85208150` and at `686c6124`** — T015 appended `c17` and `c18` and appended nothing to this Log, so "16" was falsified by the next commit that read the record and left two commands unnamed. **The count at this head is 18, `c1`–`c18`.**
  - **The commands added since the last correction, named.** `:122`–`:137` name `c1`–`c16`. The commands this Log leaves unnamed are `c17` and `c18`, and which commit added which is measured rather than remembered — each named commit's command list against its own parent's:
    ```
    node -e "const {execFileSync}=require('child_process');const ids=c=>JSON.parse(execFileSync('git',['show',c+':research/raw/m045-console-shapes.json'])).provenance.commands.map(x=>x.id);for(const c of ['a4a57f9e','9f0603c9','234a3b4c','85208150']){const added=ids(c).filter(i=>!ids(c+'^').includes(i));console.log(c+' added: '+(added.length?added.join(','):'none'))}"
    ```
    ```
    a4a57f9e added: none
    9f0603c9 added: c14,c15
    234a3b4c added: c16
    85208150 added: c17,c18
    ```
    What each of the two does, printed from the record itself — its `id`, its own recorded `exitCode`, and its recorded output — exit 0:
    ```
    node -e "const r=require('./research/raw/m045-console-shapes.json');for(const id of ['c17','c18']){const c=r.provenance.commands.find(x=>x.id===id);console.log(id+' exit '+c.exitCode+': '+(Array.isArray(c.output)?c.output.join(' | '):c.output))}"
    ```
    ```
    c17 exit 0: {"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}
    c18 exit 0: {"state":"joined","findings":[{"text":"ng04002: Cannot match any routes.","code":"ng04002","reason":"no-digest-entry"}]}
    ```
    So `c17` joins a case-folded `ng01002` to the digest's `NG01002`, and `c18` reports `ng04002` as an absence the digest does not carry, named by the code the message carried. **No command in the record is unnamed by this Log:** `c1`–`c16` are named at `:122`–`:137`, and `c17` and `c18` are named here.
  - **The replayed count, held to the head it was replayed at.** `:138`'s "15 byte-identical outputs, `c2`–`c16`" is corrected the same way: a count of a replayed list is also a measurement at a commit. Each recorded command string is re-run at head `686c6124` and its stdout compared with the recorded output line for line, after normalising CRLF to LF (this is a win32 tree, and `node --version` prints `v24.22.0` plus a carriage return where the record stores the line without one) and dropping one trailing newline:
    ```
    node -e "const {execSync}=require('child_process');const r=require('./research/raw/m045-console-shapes.json');const lines=s=>String(s).replace(/\r\n/g,'\n').replace(/\n$/,'').split('\n');const rec=c=>Array.isArray(c.output)?c.output:lines(c.output);const run=c=>{try{return execSync(c.command,{encoding:'utf8'})}catch(e){return String(e.stdout||'')}};let same=0;const diff=[];for(const c of r.provenance.commands){if(JSON.stringify(lines(run(c)))===JSON.stringify(rec(c)))same++;else diff.push(c.id)}console.log('replayed '+r.provenance.commands.length+' recorded commands at head: '+same+' identical, differ: '+(diff.length?diff.join(','):'none'));const c1=r.provenance.commands[0];console.log('c1 recorded: '+JSON.stringify(rec(c1))+' now: '+JSON.stringify(lines(run(c1))))"
    ```
    ```
    replayed 18 recorded commands at head: 17 identical, differ: c1
    c1 recorded: ["gsd-path/M057","9e95f740"] now: ["gsd-path/M057","686c6124"]
    ```
    **17 identical, `c2`–`c18`**, and `c1` alone differs — in its second line only, the short HEAD it captured (`9e95f740` then, `686c6124` now), which is that command doing its job. So "16" and "15" both count commands that run at `628bd800` and do not count the two T015 added.
  - **The `9e95f740` attribution corrected: a commit that does not carry the file cannot be the commit a size was measured at.** `:51` reads "T001 measured and recorded at branch `gsd-path/M057`, head `9e95f740` … Deliverable: `research/raw/m045-console-shapes.json`, **27,122 bytes**". The record does not exist at that commit:
    ```
    git cat-file -s 9e95f740:research/raw/m045-console-shapes.json
    fatal: path 'research/raw/m045-console-shapes.json' exists on disk, but not in '9e95f740'
    ```
    exit **128**. `9e95f740` is the commit `:51` calls the head at capture time and the one the record's own `measuredAt.commit` names: it is the commit the commands were **run** at, and `git rev-parse --short ee4bfbd2^` prints `9e95f740`, so it is the parent of the commit that first carried the record. The commit that does carry the 27,122-byte record is **`ee4bfbd2`**, T001's landing commit:
    ```
    git cat-file -s ee4bfbd2:research/raw/m045-console-shapes.json
    27122
    ```
    exit **0**. The record's whole history is five commits and begins there, so no earlier commit is a candidate:
    ```
    git log --format="%h %s" -- research/raw/m045-console-shapes.json
    85208150 T015: Report a case-folded match as the digest carries it
    234a3b4c T010: Correct the control-character count and give every number a command
    9f0603c9 T008: Correct the measurement record and pin that text cannot choose an entry
    a4a57f9e T001: state the digest's size in prose, which the recording-consistency suite reads as a claim
    ee4bfbd2 T001: Measure the capture and the digest
    ```
    So the "27,122 bytes" of `:51` is a measurement of `ee4bfbd2` and of no earlier commit — `git show --stat ee4bfbd2` adds 519 lines of the record there, the first carrying commit. The clause "measured and recorded … at head `9e95f740`" is true only as "the commands ran at `9e95f740`, whose tree carries nothing yet"; the size it states is `ee4bfbd2`'s, which is why the number cannot be read at the commit the entry names.
  - **The worktree-hash sentence, restated so it names the commit whose bytes it describes.** `:119` closes with "The worktree is the named commit's bytes and not some later state: `git hash-object research/raw/m045-console-shapes.json` and `git rev-parse 628bd800:research/raw/m045-console-shapes.json` both print `de0f927ab2dce1d722a1dbada2dd00d116d4feef`, so the size above describes what is checked in at this head." That equality is a measurement of **`628bd800`** — the head the entry was written at — and it stopped holding of a checkout the moment T015 appended the two commands. Read as a statement about `628bd800` it stands; read as timeless, it is the same ageing the sentence was written to end, since the record's blob moves with every append. Measured at this head, exit 0:
    ```
    node -e "const {execFileSync}=require('child_process');for(const c of ['628bd800','85208150','686c6124'])console.log(c+': '+execFileSync('git',['rev-parse',c+':research/raw/m045-console-shapes.json']).toString().trim()+' ('+execFileSync('git',['cat-file','-s',c+':research/raw/m045-console-shapes.json']).toString().trim()+' bytes)');console.log('worktree: '+execFileSync('git',['hash-object','research/raw/m045-console-shapes.json']).toString().trim())"
    ```
    ```
    628bd800: de0f927ab2dce1d722a1dbada2dd00d116d4feef (35619 bytes)
    85208150: 9b6f9e70593723004331b6bc25e97bc725f853a9 (39284 bytes)
    686c6124: 9b6f9e70593723004331b6bc25e97bc725f853a9 (39284 bytes)
    worktree: 9b6f9e70593723004331b6bc25e97bc725f853a9
    ```
    The worktree holds `9b6f9e70…` — **the bytes of `686c6124`**, the same blob `85208150` carries — while `de0f927a…` is `628bd800`'s blob, 35,619 bytes, which no checkout gives you now. Restated, replacing the closing sentence of `:119`: *"The worktree was `628bd800`'s bytes and not some later state when that entry was written — `git hash-object` and `git rev-parse 628bd800:research/raw/m045-console-shapes.json` both printed `de0f927a…` then — so 35,619 bytes is what `628bd800` carries; at `686c6124` the record is 39,284 bytes with blob `9b6f9e70…`, because T015 appended `c17` and `c18` to it."*
  - **What did not change.** No product value moved and the record was measured, not written: this tree's record is byte-identical to the one `85208150` carries (`9b6f9e70…`, 39,284 bytes), and this task's only edit is this Log, appended to.

- 2026-11-16 — **T016: the prefix hash that proves the corrections above are an append and not a rewrite.**
  - **The proof.** sha256 of `.project/tasks/T001-measure-the-capture-and-the-digest.md` as `686c6124` carries it, against sha256 of the first that-many bytes of this file, measured with the correction above in place — exit 0:
    ```
    node -e "const fs=require('fs'),{execFileSync}=require('child_process'),crypto=require('crypto');const p='.project/tasks/T001-measure-the-capture-and-the-digest.md';const committed=execFileSync('git',['show','686c6124:'+p],{stdio:['ignore','pipe','ignore']});const now=fs.readFileSync(p);const sha=b=>crypto.createHash('sha256').update(b).digest('hex');console.log('sha256 of '+p+' at 686c6124: '+sha(committed)+' ('+committed.length+' bytes)');console.log('sha256 of the first '+committed.length+' bytes of this file: '+sha(now.subarray(0,committed.length)));console.log('identical: '+now.subarray(0,committed.length).equals(committed))"
    ```
    ```
    sha256 of .project/tasks/T001-measure-the-capture-and-the-digest.md at 686c6124: 3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1 (21745 bytes)
    sha256 of the first 21745 bytes of this file: 3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1
    identical: true
    ```
  - **What that settles, and why it stays settled.** Both printed digests are sha256 over the same 21,745 bytes — the commit's whole file, and this file's first 21,745 bytes — and they agree, so every `## Log` byte of `686c6124` is still there and the correction above adds bytes after them rather than rewriting one of them. The command prints nothing that moves when the file grows: it hashes a fixed byte range at both ends, and a hash over a prefix is unchanged by bytes appended after the prefix, so a later reader re-running the same command gets the same three lines. What it does not prove is that the bytes appended *after* that range are a pure append — this entry is itself the second such append, and the same command re-run after it landed printed the same three lines.
