# Review — wave 14, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 3fb4ecebe9200338a2187a0526dec34f1b4eb9fd

## T014 — State the digest byte total in the record's prose: pass

Commands run at this HEAD, verbatim tails:

- `node --test scripts/recording-consistency.test.mjs` → `ℹ tests 7` / `ℹ pass 7` / `ℹ fail 0` (expected 7/7 — holds), first test `✔ every byte count a recording states in prose is a byte total the recording records`.
- `node --test scripts/teardown-leak-shapes.test.mjs` → `ℹ tests 13` / `ℹ pass 13` / `ℹ fail 0`, including `ℹ digest 22.2.x: 64 entries, 64 codes, sha256 426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35, 61577 bytes` and `ℹ E9 idempotence: sha256 5964357e21474df85c19134fcb85809080e2550a1e0c5c625544d0d497b946cd unchanged after the run`.
- `node -e "…statSync('extension/error-digest.json').size…"` → `error-digest.json size on disk: 61577` and `record digest.bytes: 61577` — the stated prose number, the recorded field and the real file agree.

- ✅ The record's prose states the byte total it records, and the statement comes from the derivation rather than from the JSON.: the T014 diff changes the derivation, not the JSON by hand — `git show 3fb4eceb` on `scripts/teardown-leak-shapes.test.mjs:1711`: `-    \`the digest carries ${digest.entry.code} …\`` → `+    \`the digest is ${digest.bytes} bytes and carries ${digest.entry.code} …\``, and the re-armed record's verdict (`research/raw/m059-record-shapes.json:7`) now opens "the digest is 61577 bytes and carries NG0205 …", with the record's `head` moved to `0314cac2…` (`:8`, and `commands[0]` output at `:95`). A hand-added sentence would have been dropped by the next armed run; this clause cannot be.
- ✅ `scripts/recording-consistency.test.mjs` and `scripts/teardown-leak-shapes.test.mjs` are green at the landed head, on default and armed runs, and the record is idempotent on a second armed run.: 7/7 and 13/13 at HEAD `3fb4eceb` (outputs above); the shapes suite's E9 test asserts the record read-only on a default run with the sha unchanged; the armed run is evidenced in `.project/build/verify-ledger.jsonl` — two entries at commit `0314cac2…`, first `"result": "fail"` (`2026-11-22T05:55:28+00:00`, the pre-fix state), then `"result": "pass"` (`05:57:06+00:00`) for the full T014 verify chain — and the shapes suite printed "after the run: 59302 bytes, sha256 5964357e…" byte-identical to "at load".
- ✅ Both gate records are re-derived in this task and are green.: `git show 3fb4eceb --stat` shows `research/raw/m056-gate-stability.json | 2 +-` and `research/raw/m059-record-shapes.json | 8 ++++----` re-derived in the same commit as the suite edit; the `build: verify ledger for T014` commit `843609e6` lands the passing ledger entry, and both suites are green at this HEAD.

Judgement — is the byte total in prose proof, or ceremony? **It is a real cross-check, not ceremony — but the rule itself says how narrow it is.** The rule's own words, `scripts/recording-consistency.test.mjs:280-282`: "`${name} records ${[...current].length} byte total(s) and states none in prose: the scan examined nothing in it, so its silence proves nothing`" — the prose clause is what gives this recording a mention the scan can examine (the per-file non-vacuity assertion at `:278-282` refuses an empty scan), and its origin is the M035 finding at `:5-8`: "The claim was true in substance and the number was stale prose, so every existing suite stayed green: nothing compared a sentence with the field beside it." That is exactly the defect class the clause closes: the headline sentence is now contradictible by the `bytes` field beside it (`research/raw/m059-record-shapes.json:124` `"bytes": 61577,`), so stale prose reddens instead of passing. What it does *not* prove, in the rule's own out-of-scope words (`:34-36`): "this is a narrow check, not a prose-drift gate, and it proves nothing about the following" — a count written without the word "bytes" (`:38`), a number that is not a byte count (`:40`), and prose outside `research/raw/*.json` (`:42-43`). The number's *truth* is not carried by the prose at all: it is carried by the shapes suite, which re-derives `digest.bytes` from the tree at this head (its output: "sha256 426a5be1…, 61577 bytes"), and independently confirmed here against the file on disk (61577). So: prose binds the sentence to the field; the field is bound to the tree by the derivation; neither link is ceremonial.

Files read for this review:

- `.project/review/wave-14.cycle1.md` — read 100%.
- `.project/tasks/T014-state-the-digest-byte-total-in-the-records-prose.md` — read 100%.
- `scripts/recording-consistency.test.mjs` — read 100%.
- `research/raw/m059-record-shapes.json` — read 100% (and the T014 diff hunk verbatim).
- `scripts/teardown-leak-shapes.test.mjs` — read ~1% (the T014 diff hunk at :1708-1711 only); not read in full.
- `.project/build/verify-ledger.jsonl` — read last 2 of its lines (~1%); not read in full.
- `research/raw/m059-verdict-claims.json` — read 100% (context for the milestone's records).
- `scripts/navigation-blocking.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs` — not read (green suites, out of this task's judged scope).

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T014: the digest rows the criterion enumerates are the ones whose byte total T014 binds into the record's prose (`research/raw/m059-record-shapes.json:124` against the verdict at `:7`), the row count itself is re-derived by the shapes suite ("64 entries, 64 codes … 61577 bytes"), and both green suites at this HEAD — 7/7 and 13/13 — hold the record the surface's sample fact cites.
