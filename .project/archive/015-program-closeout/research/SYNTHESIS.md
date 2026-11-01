# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Review panel: off (INTENT.md Summary)
- Finding skeptics: off (INTENT.md Summary)
- Surfaces: DevTools panel only (INTENT.md Summary)
- New panel features/tabs/behaviour changes: vetoed (INTENT.md Scope: out)
- Portal source changes beyond dev-only provider the charter allows: vetoed (INTENT.md Scope: out)
- Touching archived audits or archived milestone records: vetoed (INTENT.md Scope: out)
- Loosening checks/tests to pass: vetoed (INTENT.md Scope: out)
- Four M014-deferred fix-doc rows (research/10 grader regex and port list, research/11 S1 runner, spikes/ng222-ssr README Vitest) already discharged in 2c97f69; regeneration re-derives them verified (INTENT.md Scope: in, Corrections)
- Row 143 remains accept-drift (dated handoff naming head fbe3aac is history) (INTENT.md Corrections)
- erify-ai-browsers interop row must name spikes/ng222-app's /stale-view-deferred fixture; checks/interop.mjs byte-identical except fixture route; committed lars-verify verdict erified (INTENT.md SC2, N3)
- Route test must not be weakened to accept both routes (INTENT.md SC3, N4)
- Skills mirroring: only control-ai-browsers and erify-ai-browsers byte-identical between .commandcode/skills/ and .claude/skills/ (pinned by scripts/skills-mirror.test.mjs) (INTENT.md Current state)
- No model name in commit message; no work address/domain written anywhere (INTENT.md Constraints)
- GSD Path: gsd-path/M015, one archive + annotated milestone/015-program-closeout tag, integrates to main in direct mode (INTENT.md Constraints)
- Project Verify: 
pm run check, 
pm test, 
px nx run angular-ai-devtools:build-extension must pass at shipped head (INTENT.md SC5, Constraints, N6)
- Audit head must equal shipped head after last correction (E2); idempotent regeneration (E3) (INTENT.md Edge coverage)
- Doc-vs-code: reality authoritative on external checkout; correct documents, do not delete claims to pass (INTENT.md N1, N2)


## Decisions

### 1) Stale portal-commit claim correction (so it cannot go stale again)

- **Decision**: Correct .claude/skills/control-pangular-inspector/SKILL.md in place by replacing the historical/incorrect assertion with a historically-neutral phrasing that states no external commit is asserted and points to verifiable in-repo evidence (or removes the unverifiable external-commit pin entirely), with no HEAD pin and no future-tense claim about the external checkout's state. Record the correction as a doc fix (not deletion of context) citing reality; keep/update the ruling in ## User rulings of the regenerated audit. Remove or reframe any reference to f102b97 to historical-only with no current claim of committal.
- **Runner-up**: Keep the sentence but qualify it as unverifiable — lost because INTENT.md N2 forbids marking a claim erified on evidence that lives in the audited document itself and the claim's only evidence is an external checkout with no such commit (DOCS-AUDIT marks it stale; INTENT Corrections rules reality authoritative). Qualifying without correction would leave a stale/unverifiable current claim.
- **Evidence**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (§ Corrections, § N1/N2, § Current state), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Doc: .claude/skills/control-pangular-inspector/SKILL.md — portal worktree committed claim stale), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-pitfalls.md (§ Finding: External checkout claim must be checked against the repo the skill controls), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (skills layout)
- **Confidence**: high

### 2) .proven.json re-recording at shipped head (fresh fingerprint)

- **Decision**: Re-record the erify-ai-browsers interop provenance in .proven.json last among artifacts affected by SC2 — after the last doc/panel edit (and after the interop row is pointed at spikes/ng222-app's /stale-view-deferred fixture) and immediately before the final Verify. Record what is recorded as a fingerprint of the feature's own source (the interop fixture/source that proves the /stale-view-deferred path), state the source path used for the fingerprint, and write/update .proven.json at that position in build/order (last write before 
pm run check/
pm test/
px nx run angular-ai-devtools:build-extension). Do not rely on re-recording earlier in the sequence.
- **Runner-up**: Record provenance earlier (e.g. before doc corrections/panel edits) — lost because Edge E5 requires the fingerprint to be fresh at the shipped head; recording before the last edit leaves it stale. No other viable ordering is supported by evidence.
- **Evidence**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (§ Edge coverage E5, § Scope: in for interop provenance, § SC2), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-pitfalls.md (§ Finding: Provenance fingerprint goes stale if re-recorded before the last edit), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (interop fixture present at spikes/ng222-app/src/app/stale-view-fixture.ts), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (interop row context)
- **Confidence**: high

### 3) Panel budget decision (518.80 kB vs 500 kB)

- **Decision**: Raise the budget in pps/angular-ai-devtools/project.json (budget configuration) to accommodate the measured 518.80 kB, and record the decision in the regenerated audit's ## User rulings (and cite it in the relevant audit row/notes) stating measured size 518.80 kB, previous budget 500 kB, rule (kB with two decimals; >= budget warns), and a one-line reason (measured extension panel bundle at shipped configuration requires the recorded overage). Ensure 
px nx run angular-ai-devtools:build-extension emits no unexplained warning after the recorded change and the decision satisfies E7/E8.
- **Runner-up**: Trim the panel to get under 500 kB — lost because no specific trimming target/path was evidenced as necessary/sufficient without scope creep; the intent requires recording the measured size and reason if overage is accepted (INTENT N5) and the decision is a values/size trade-off that must be recorded. Evidence shows 518.80 kB measured vs 500 kB budget (INTENT SC4/E7/E8/Risks) and no concrete trim plan is present in provided evidence; raising with recorded measurement+reason is the directly supported compliant choice given constraints (no new features).
- **Evidence**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (§ SC4, § Edge coverage E7/E8, § Risks, § N5), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-pitfalls.md (§ Finding: Budget warning can be silenced without recording the measurement), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (pps/angular-ai-devtools/project.json build-extension target, dependsOn generate-error-digest), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (panel/build related claims context)
- **Confidence**: medium

### 4) Regenerate audit at shipped head without re-auditing all 141 documents (delta rule)

- **Decision**: Regenerate the docs audit after the last correction (after fixing the portal-commit claim, discharging remaining deferred fix-doc items as applicable, applying budget decision and interop/provenance updates) so Audited HEAD equals the shipped head (E2). Use a delta-based regeneration: start from the prior audit structure, re-derive only rows affected by changes in this milestone (stale row 237, the four M014-deferred fix-doc rows 155/156/158, interop row for verify-ai-browsers/fixture, any panel/budget-related rows touched, and rows whose evidence changed), carry forward unchanged verified/descriptive rows without re-inspecting all 141 documents from scratch, enforce idempotency (E3: no second unchanged: prefix, summary counts identical on no-change re-run), ensure no M014 fix-doc row remains planned: no, and drive alignment queue to zero. Cite repo-shipped inspection paths for decidable items.
- **Runner-up**: Full re-audit of every document/row — lost because it risks scope creep beyond bookkeeping closeout (INTENT Risks: re-deriving unverifiable M014 rows can grow milestone beyond closeout) and evidence supports delta/carry-forward with targeted re-derivation; no requirement states re-audit all 141 documents.
- **Evidence**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (§ SC1, § Edge coverage E2/E3, § Scope: in, § Risks), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (Summary, Audited HEAD 01bffa9f..., remediation queue), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-audit-verifiability.md (§ Findings: inventory 111 unverifiable, decidable groups, repo-shipped commands), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-pitfalls.md (§ Finding: Audit regenerated at wrong head invalidates Audited HEAD)
- **Confidence**: high

### 5) spikes/ng222-app/src/app/app.routes.test.mjs proves discrimination in both directions

- **Decision**: Tighten the assertion for the /stale-view route so it asserts the exact route name/path identity for /stale-view (and does not match /stale-view-deferred) — e.g. assert route path equals '/stale-view' (and/or component identity) and explicitly reject/contrast with the deferred route, keeping the test passing as written for the correct route and failing if given the deferred route's name. Add/keep an explicit assertion/held-out check that /stale-view-deferred is not accepted by the /stale-view assertion (adjacency/prefix-sibling case). Make no change to checks/interop.mjs assertions except fixture route it drives (N3). Do not weaken to accept both (N4).
- **Runner-up**: Loosen matching (e.g. startsWith/regex that would match both) — lost because INTENT N4 forbids weakening the test to accept both route names and E6 requires rejecting the deferred name while accepting the exact quoted route (held-out pins both directions).
- **Evidence**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (§ SC3, § Edge coverage E6, § N4, § Scope: in), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (routes include both /stale-view and /stale-view-deferred in spikes/ng222-app/src/app/stale-view-fixture.ts/app routes), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (route test context)
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (1) Inspect and correct .claude/skills/control-pangular-inspector/SKILL.md to remove/fix the stale portal-commit claim with no HEAD pin (cite reality; update audit ruling). (2) Decide/record panel budget: update pps/angular-ai-devtools/project.json budget to 518.80 kB with recorded measurement/reason in regenerated audit ## User rulings (satisfy E7/E8). (3) Prepare interop changes: point erify-ai-browsers interop map row to spikes/ng222-app's /stale-view-deferred fixture; plan .proven.json re-record as last write before final Verify (E5). (4) Tighten spikes/ng222-app/src/app/app.routes.test.mjs for exact /stale-view match rejecting deferred (E6/N4). (5) Plan audit regeneration order (after last correction, delta rule, Audited HEAD = shipped head).
- **Walking skeleton**: (a) Apply doc corrections (portal-commit + confirm four M014-deferred rows remain discharged) -> (b) Update interop mapping + prepare provenance re-record ordering -> (c) Tighten route test -> (d) Apply budget decision in config + record ruling -> (e) Regenerate DOCS-AUDIT at shipped head (delta, zero stale/aspirational, queue zero, rulings complete) -> (f) Re-record .proven.json last -> (g) Run 
pm run check, 
pm test, 
px nx run angular-ai-devtools:build-extension (Verify green), ensure skills mirror green.
- **Pitfalls → tasks**: External checkout claim (102b97) -> task: correct skill doc in-repo, cite external git log absence, record ruling (do not guess). Provenance stale if early -> task: enforce ordering (re-record .proven.json last before Verify). Budget silent overage -> task: change budget + record measured 518.80 kB/500 kB/reason in audit ruling (no silent raise). Audit head drift -> task: regenerate after last correction, set Audited HEAD to shipped head. Test adjacency -> task: exact-match /stale-view assertion, verify rejects deferred (held-out). Unverifiable creep -> task: use delta rule, only re-derive affected rows; leave truly unverifiable items requiring external/browser evidence if not decidable by repo-shipped commands. Skills mirror -> task: verify byte-identical for the two pinned skills after changes.

## User rulings

- DOCS-AUDIT queue row 237 (.claude/skills/control-pangular-inspector/SKILL.md portal worktree committed claim): delegated ruling fix-doc under standing grant (INTENT.md Corrections) — reality authoritative (portal checkout git log has no such commit); document corrected in place, no current claim of committal, ruling recorded planned/no until landed.
- Rows 155, 156, 158 (M014 deferred): delegated ruling fix-doc, already discharged in 2c97f69; regeneration re-derives verified, planned: yes (2c97f69).
- Row 143: accept-drift, unchanged (dated handoff naming head fbe3aac at writing is history).
- Panel bundle budget: 518.80 kB against 500 kB — raise budget to 518.80 kB in apps/angular-ai-devtools/project.json, record measured size 518.80 kB, previous budget 500 kB, rule (kB two decimals; >= warns), reason in this ruling; build-extension must emit no unexplained warning.

## Still unknown

- Exact final shipped HEAD hash (to set Audited HEAD correctly) — plan: regenerate after last correction and record shipped HEAD at that moment (E2).
- Final .proven.json fingerprint value/source details (to record fresh) — plan: compute from interop fixture/source at shipped head immediately before final Verify (E5).
- Any remaining M014 unverifiable rows not decidable by repo-shipped commands (external/browser/credential) — plan: do not guess; carry as unverifiable only if evidence cannot be produced by repo-shipped commands this milestone cannot run; prefer decidable fixes where possible per evidence-audit-verifiability (accept risk or leave unverifiable only if truly not producible).
