# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T007 (landed `b106c15`)

Wave 6 is the second repair. M040's claims suite read the live intent, so it failed for every milestone after its own; the repair gives the archive-or-live rule one implementation and binds all three claims suites to it.

It carries SC6 and only SC6, and like the other repairs it cannot close the criterion alone.

## T007 — Hold every verdict claim list to the intent of the milestone it rules: pass

- ✅ `git show --stat b106c15` reports the landing as `scripts/verdict-claims-intent.mjs` +124 (new), `scripts/navigation-capture.test.mjs` +263, `scripts/performance-capture.test.mjs` +40, `scripts/overlay-verdict-claims.test.mjs` (41 lines, mostly removed) and the task file ±13.
- ✅ One rule with one implementation: `scripts/verdict-claims-intent.mjs:70-124` exports `intentPathForMilestone(root, milestone)` and nothing else, and the three suites import it — `scripts/performance-capture.test.mjs:48`, `scripts/navigation-capture.test.mjs:66`, `scripts/overlay-verdict-claims.test.mjs:32`.
- ✅ The resolver refuses rather than falls back: `scripts/verdict-claims-intent.mjs:104-106` refuses an archived milestone whose archive carries no intent, `:111-115` refuses a milestone that is neither archived nor bound and names the milestone the live intent belongs to, `:117-121` refuses a bound intent that is absent, and `:77-81` refuses a token that names no milestone. Every message names the milestone and the absolute paths it tried.
- ✅ Re-run at this head, each suite on its own: `scripts/performance-capture.test.mjs` → `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0`; `scripts/navigation-capture.test.mjs` → `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0`; `scripts/overlay-verdict-claims.test.mjs` → `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`.
- ✅ The defect the repair answers is measured rather than described: M040's claims match `.project/archive/040-performance-narrator/intent/INTENT.md` on six rows of six and the live intent on one, and the pre-repair red was `SC1 must quote the INTENT criterion character for character` raised at `scripts/performance-capture.test.mjs:1909` from the test at `:1937` — both quoted in `.project/tasks/T007-hold-each-claims-list-to-its-own-intent.md`.
- ✅ No claim list and no criterion was re-cut to reach green (N6): `research/raw/m040-verdict-claims.json` and `research/raw/m041-verdict-claims.json` are absent from the landing's diff, and both suites still run their quote pin, their one-character-drift mutant and their invented-`SC99` row.
- ✅ Ledger row 6, `.project/build/verify-ledger.jsonl:6`: `node --check` on four files, the three claims suites, Prettier and `npm run check` — `"result": "pass"` at `b106c15e8262924215a098108d292e2211f0b661`.

## Intent coverage

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The `npm run check` half of SC6 passes at this landing: `.project/build/verify-ledger.jsonl:6` records the wave's Verify ending `npx prettier --check … && npm run check` with `"result": "pass"` at `b106c15e8262924215a098108d292e2211f0b661`, and `npm run check` exits 0 at this head.
- ✅ The gate's claims leg is green together rather than one suite at a time: the three suites were re-run together at this head and give `ℹ tests 40`, `ℹ pass 40`, `ℹ fail 0` in total.
- ✅ The repair is the binding and never the assertion (N6): the criterion texts, the claim files and the required-row rules are unchanged, and the one added check — `no claims suite decides the archive-or-live question for itself` in `scripts/navigation-capture.test.mjs` — is a rule over the three suites' source, not a relaxation of any of them.
- ⚠ Not closed alone. The `npm test` half of SC6 is red until the whole gate is green, and the repairs run in order: wave 7 (`302fd62`) covers the audit inventory, wave 8 (`a9103f6`) bounds the held-out guard, and wave 9 (T005, `4d7860a`) records the five gate legs at 1,197 / 60 / 628 / 345 / 85 with every leg exit 0 (`.project/build/verify-ledger.jsonl:9`, `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:164`).
