# Review — wave 20, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 72aaedafa74760ae9b5812933acd2976f75623ac

Everything below was measured in this checkout at `72aaedafa74760ae9b5812933acd2976f75623ac`; nothing is copied from the Log's own claims about itself. That head is four paths away from the head wave 19's cycle 2 reviewed — `git diff --numstat 2efd4ef9..72aaedaf` names `.project/review/VERIFICATION.json` 1/1, `.project/review/wave-19.cycle1.md` 0/32, `.project/review/wave-19.cycle2.md` 36/0 and `research/raw/m056-gate-stability.json` 1/1 — so neither T001's Log nor `research/raw/m045-console-shapes.json` moved between the head cycle 2 passed and the head this review measures.

## T027 — Withdraw the third instance the heading miscounted: pass

- ✅ **AC1 — The sentence at :221 is named and withdrawn, and no standing sentence states the worktree-hash equality in the present tense.** Read in `.project/tasks/T001-measure-the-capture-and-the-digest.md:317`, the entry says the sentence is withdrawn and names the line. A whole-file read of all 325 lines classifies every remaining hash mention as a command description or a past-tense dated measurement. Command: `git diff 41081992^..41081992 -- .project/tasks/T001-measure-the-capture-and-the-digest.md` printed one hunk, 12 added and 0 removed.
- ✅ **AC2 — The prefix hash at 9b39f6ec is still a prefix of the current file.** `git cat-file -p 9b39f6ec:.project/tasks/T001-measure-the-capture-and-the-digest.md` and the first 48,816 bytes of the HEAD blob both print `5b20c096...a649`; identical true, and the first differing byte is the append boundary.
- ✅ **AC3 — research/raw/m045-console-shapes.json is byte-identical before and after.** `git hash-object` and `git rev-parse HEAD:research/raw/m045-console-shapes.json` both print `9b6f9e70`, 39,284 bytes, and neither landing diff names the path.
- ✅ **AC4 — No replacement states a count, a live-tree equality or a hash equality.** The three replacements at `.project/tasks/T001-measure-the-capture-and-the-digest.md:321` to `:323` each name one command and nothing else; the only figures in the appended twelve lines are the wave number and a line reference.
- ✅ **The task's own fenced Verify passes at this head.** `node --test scripts/console-panel-record.test.mjs` printed 38 tests, 38 pass, 0 fail, exit 0, and `npx prettier --check research/raw .project/tasks/T001-measure-the-capture-and-the-digest.md` printed that all matched files use the code style, exit 0.

## Intent coverage

- ✅ yes — the Log this milestone ships states measurements at named commits and names commands: T020, T026 and T027 each withdrew a sentence that restated a derived fact, and the appended entries are proven to append by prefix hash.
- ✅ yes — the withdrawal does not quote what it withdraws, so the record cannot re-introduce the claim it removes.
- ❌ no — no criterion this wave does not own is claimed; T027 declares `- None` for intent coverage, and its evidence sits inside SC4's subtraction rather than inside a surface.

## Notes

- `41081992` carries the append; `2efd4ef9` carries only T027's own front matter. The review states both rather than implying a change in the range it was asked about.
- Because line 221 sits inside the pinned prefix, its bytes still read in the present tense; the withdrawal ends its standing, which is the mechanism the two earlier withdrawals used.
