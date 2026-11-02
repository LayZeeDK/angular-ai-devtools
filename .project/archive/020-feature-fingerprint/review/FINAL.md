# Final Review — M020 feature-fingerprint

Reviewed HEAD: b16ecf1ab396376af610f6a0d0ebc2e6cd7323b8
Overall verdict: pass

<!-- Evidence reuse: the project Verify passed at this head (exit 0, ledger entry
     for commit b16ecf1a…, .project/build/verify-ledger.jsonl) and was not re-run;
     no build, test or other heavy command was run for this review. All three
     non-Verify gap reviewers returned pass at this head. The surface walkthrough
     below is performed over recorded evidence and static traces at this head. -->

## Success criteria

### SC1 — The context chip names the features detected for the inspected app, including the features it does not have.

- **Verdict**: met
- **Surface**: panel
- **Check**: Walkthrough of the context chip on the panel's lazy `chat` route (`/panel/chat`) against PLAN.md's Surface contract success state. The walkthrough observes the rendered states pinned at this head: `chat-entry.component.spec.ts:201-230` asserts all eight `APP_FACT_FEATURES` names in declaration order with two present and six absent, `:238` the all-false payload rendering eight absences, and `:251` a `supported: false` page rendering the page's own `reason` verbatim with no zone claim; the pure module the component renders emits one entry per requested name with `present: bits[name] === true` (`feature-fingerprint.ts:139-142`), so an absent bit is named absent, never dropped and never invented. Held-out coverage at this head: E1 — a payload carrying exactly two of the eight bits renders those two present and the other six absent by name, and deleting an absent entry fails the suite (`tests/held-out/feature-fingerprint-chip.test.mjs:53`, `:94`); E2 — entries follow the declaration order of `APP_FACT_FEATURES` and two equal payloads give byte-identical `text` (`:107`); E3 — an all-false map renders eight absent names, not an empty or invented chip (`:131`). N1 checked by comparing each chip entry against the announced bit that produced it: every entry traces to a page-published bit, and the DI-graph, stale-view and error-digest panel-local capabilities are deliberately not named (INTENT correction: naming them would be a claim `app_facts` cannot support). N3 checked in the component's imports: no model API of any kind, no `LanguageModel`; the chip is deterministic code over announced facts. N6 checked over the milestone's commits: panel-side files plus the extension scripts only, the relay's `angular-ai-devtools-marker` block untouched and `extension/manifest.json` at its base bytes (wave-1 T002 review; gap-2 static trace at this head).
- **Observed**: The walkthrough shows the success state: the chip lists all eight feature names in `APP_FACT_FEATURES` declaration order, each present or absent by name. A received state decides before any replay outcome (`feature-fingerprint.ts:114` opens the `!stateReceived` branch; the outcome is consulted only inside it), so an arrived state is never hidden behind the waiting or transport states, both of which carry no `entries` field at all. E1, E2 and E3 are green in the recorded task Verifies (sidecars gsd-path-verify/task-t004-verify and task-t006-verify, exit 0) and inside the recorded project Verify at this head; the two-bits payload renders two present and six absent, equal payloads give byte-identical text, and the all-false payload renders eight absences. No entry exists that the announced bits do not back (N1), no model call computes or renders the chip (N3), and the inspected page gains no DOM from this milestone (N6).
- **Reference**: apps/angular-ai-devtools/src/app/feature-fingerprint.ts:99-108,114,139-146; apps/angular-ai-devtools/src/app/chat-entry.component.ts:117-124; apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:201-251; tests/held-out/feature-fingerprint-chip.test.mjs:53,94,107,131,238-247; .project/review/wave-2.cycle1.md (T004, T006); .project/review/wave-3.cycle1.md
- **Finding**: none
- **Fix direction**: none

### SC2 — A tool group whose `[ng-version]` gate fails is absent from the chat's group list, not present and empty.

- **Verdict**: met
- **Surface**: panel
- **Check**: Walkthrough of the group list under the same route against the Surface contract's success and empty states. The component renders only `projection().groups` (`chat-entry.component.ts:70-82`), so a group whose gate fails has no header at all, and an empty projection renders `data-testid="empty-groups"` with the projection's `emptyReason` narrating which groups were excluded and on what — never an empty group shell. The projection's gate is walked at this head: `refuseGroup` compares three numeric parts (`tool-groups.ts:349`), so the `minVersion` boundary is inclusive; `refuseOnFacts` (`tool-groups.ts:234-262`) runs after a passing version and withholds a group when `supported` is false (quoting the page's own reason) or when a `requiredFeature` is not `true` (naming the bit), so the facts win over the version (N2) and no silent version-only fallback exists; a group whose only member is `panel_environment` is withheld on `publish` and can never be offered empty. Held-out coverage: E4 — a version exactly at a group's minimum includes that group and the same version one patch below excludes it into `excluded` with a reason naming the version, the group absent from `groups` rather than present with no tools (`tests/held-out/tool-group-gates.test.mjs:81`, `:99`); E5 — when every group's gate fails, `groups` is empty, `excluded` carries one entry per declared group with its reason, and `emptyReason` is a non-null sentence naming every withheld group with its own reason (`:128`, `:183`).
- **Observed**: On the dev-build fixture class of page (version 22.2.2, state received, all bits true) the walkthrough shows one header per gated-in group with its model-visible tools and no empty section; a gated-out group renders nothing; the all-gates-failed page renders no group header plus the narrated empty reason. N2 holds in both directions in the recorded spec run (`tool-groups.spec.ts`, 14/14 in sidecar gsd-path-verify/task-t005-verify, exit 0), a missing or unparseable version excludes every group with the cannot-tell reason and opens none (`tool-group-gates.test.mjs:165`, `:194`), and the projection is pure — two identical calls deep-equal (`:205`).
- **Reference**: apps/angular-ai-devtools/src/app/tool-groups.ts:161-192,210-262,349; apps/angular-ai-devtools/src/app/chat-entry.component.ts:70-82; apps/angular-ai-devtools/src/app/tool-groups.spec.ts:120,305-322; tests/held-out/tool-group-gates.test.mjs:81,99,128,165,183,194,205; .project/review/wave-2.cycle1.md (T005, T006)
- **Finding**: none
- **Fix direction**: none

### SC3 — A non-Angular page produces a named refusal rather than a chip claiming features.

- **Verdict**: met
- **Surface**: panel
- **Check**: Walkthrough of the refusal and its neighbouring named states against the Surface contract. `no-angular-root` renders its exact message "No Angular root found on this page" (`feature-fingerprint.ts:71`) only when the replay outcome is `answered` with neither a state nor a version (`:125-126`), so the refusal is a conclusion about an answered page rather than a default for silence; an outstanding replay renders the waiting line `awaiting-page` ("The page has not answered yet: …", `:77-78`) and a failed replay `transport-failed` ("The extension message transport delivered no answer for this page", `:85-86`), each with no `entries` field, and a version without a state renders `cannot-tell` naming that version and the absent debug surface (`:128`) under its own `data-testid` — visibly a different state from the refusal (N4). The rendered surface is pinned at this head: the component spec asserts the exact refusal text with zero `chip-entry` rows and no group headers (`chat-entry.component.spec.ts:300-303`), the waiting state (`:313-323`), the transport state (`:331-339`) and `cannot-tell` naming `22.2.2` and `window.ng` (`:284-289`); the held-out suite repeats all four outcomes end to end (`tests/held-out/feature-fingerprint-chip.test.mjs:180-258`), including that no non-fingerprint state carries `entries`. E6 is a dismissed edge in INTENT.md (SC3 is a page-identity state with no data shape to probe), so no held-out test is owed for it.
- **Observed**: On a non-Angular page the walkthrough shows the named refusal and nothing else — no chip entry, no group header, no feature claimed. On a production Angular build the chip names the version and reports the debug surface absent instead of refusing; on a page that has not answered, the waiting line renders first and the transport state if the send fails. The patched false claim P001 (an Angular page shown the non-Angular refusal before the replay answered) is closed at this head: the replay outcome decides before any conclusion about a silent page, and the component adds no decision of its own.
- **Reference**: apps/angular-ai-devtools/src/app/feature-fingerprint.ts:71,77-86,114-128; apps/angular-ai-devtools/src/app/chat-entry.component.ts:63-68,135-142,179; apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:284-339; tests/held-out/feature-fingerprint-chip.test.mjs:180-258; .project/review/PATCH-FINDINGS.md (P001); .project/review/wave-3.cycle1.md; .project/review/final-gap-3.md
- **Finding**: none
- **Fix direction**: none

### SC4 — `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

- **Verdict**: met
- **Check**: `npm ci --include=dev && npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs` — the recorded project Verify at this head, exit 0, ledger entry for commit b16ecf1a…; reused, not re-run, per the brief.
- **Observed**: `npm run check` exits 0 (root `tsc`, `check:skills` over four tsconfigs, `check:panel`). `npm test` runs wholesale and green: the docs-audit and autonomy-gaps pins T001 repaired at the base, the held-out suites (feature fingerprint 11/11 under `node --experimental-strip-types`, tool-group gates green) and the panel Vitest specs all pass. The extension build measured initial total 529,936 B over 7 eager files — 5,504 B under the byte-exact 535,440 B pin and above the 520 kB warning. N5 held: `scripts/panel-bundle-budget.test.mjs:65` still declares `PRE_MILESTONE_INITIAL_KB = 535.44` once, `project.json` still carries `maximumWarning: 520kb` / `maximumError: 1mb`, and no threshold was raised and no pin weakened anywhere in the milestone. E7 is a dismissed edge in INTENT.md (SC4 aggregates checks and a measurement, no data shape of its own), so no held-out test is owed.
- **Reference**: .project/build/verify-ledger.jsonl (entry for commit b16ecf1ab396376af610f6a0d0ebc2e6cd7323b8, exit_code 0); .project/review/final-gap-1.md; .project/review/final-gap-4.md; scripts/panel-bundle-budget.test.mjs:65
- **Finding**: none
- **Fix direction**: none

## Gates

| Gate | Command | Result |
|---|---|---|
| check | `npm run check` | pass — exit 0 inside the recorded project Verify at this head (ledger entry for b16ecf1a…); runs root `tsc`, `check:skills` (four tsconfigs) and `check:panel` |
| test | `npm test` | pass — exit 0 in the same recorded run; wholesale over `scripts/**/*.test.mjs`, `extension/**/*.test.mjs` and the panel Vitest specs |
| lint | no separate lint script exists; the lint-equivalent type checks are the `tsc` legs inside `npm run check` (`tsc -p tsconfig.json`, the `.claude/skills` and `.commandcode/skills` tsconfigs, `check:panel`) | pass — all green inside the recorded `npm run check` at this head |
| build (extension) | `npx nx run angular-ai-devtools:build-extension` | pass — printed initial total 529.94 kB over 7 eager files; `chunk-Dy5sDwon.js \| chat-entry-component \| 10.90 kB` listed under Lazy chunk files, not in the initial table |
| bundle pin | `node --test scripts/panel-bundle-budget.test.mjs` | pass — 529,936 B against the 535,440 B baseline, 5,504 B under the pin, above the 520 kB warning, 7/7 tests |
| package manifest | `git show --stat` over the milestone commits; `extension/manifest.json` and root `package.json` | pass — the MV3 manifest keeps its base bytes with no new permission (wave-1 T002 review) and no M020 commit touches either manifest; the registry envelope beside it re-hashes to the pinned SHA-256 (final-gap-4) |

## panel surface walkthrough

Performed against PLAN.md's `## Surface contract` (panel — T006) at the reviewed head. Steps 1 and 6 are covered by the recorded project Verify (build, budget pin); steps 2-5 are observed through the recorded component specs, the held-out suites, the built eager/lazy split and the gap reviewers' static traces at this head — a fresh live-browser drive was out of scope for this review by brief, and the recorded evidence stands in, as the wave-2 review already noted.

Contract states, as observed:

- **success** (state received): the chip lists all eight `APP_FACT_FEATURES` in declaration order, each present or absent by name; on a dev-build fixture all eight read present; a `supported: false` page renders the page's own `reason` verbatim with no zone claim and `zoneMode` withheld (`chat-entry.component.spec.ts:201-251`); below the chip, one header per permitted group with its model-visible tools.
- **empty** (state arrived, no group's gate passes): no group header at all; the `empty-groups` line renders the projection's `emptyReason`, narrating which groups were excluded and on what — never an empty group shell (`chat-entry.component.ts:70-82`; spec `:304-316`).
- **loading** (panel open, replay request not answered yet): the waiting line `awaiting-page` ("The page has not answered yet: …") renders with no `chip-entry` row and no feature shown as absent, under its own `data-testid` (`chat-entry.component.spec.ts:313-323`).
- **cannot tell** (version reached the panel, no state did): the chip names the version and says the page's debug surface is absent, shows no feature (`cannot-tell` carries no `entries`), and is visibly a different state from the refusal (distinct `data-testid` and message). One caveat, carried as warning W5 below: in this state the group list still offers the two bit-free groups (`app-support`, `error-reference`) — the component spec asserts an empty list for the refusal and waiting states but not for cannot-tell, which reads stricter than the contract's "no group" wording for this bullet. No INTENT criterion or prohibition rules against the pinned reading, so the criterion verdicts stand.
- **error / refusal** (no Angular root): the exact named refusal "No Angular root found on this page" and nothing else — no chip entries, no groups — and the wording names the evidence rather than concluding the app is not Angular (`chat-entry.component.spec.ts:300-303`).

Walkthrough steps, as observed:

1. Build and serve: the recorded project Verify at this head ran `npm ci --include=dev` and `npx nx run angular-ai-devtools:build-extension` to exit 0; the built output's `index.html` references exactly the 7 eager files, with the chat code riding lazy chunk `chunk-Dy5sDwon.js` (10.90 kB, `chat-entry-component`).
2. Open the panel at `/panel/chat` on a dev fixture: the chip names eight features (all present) and the group list shows headers only for gated-in groups (spec `:201-230`; template renders only `projection().groups`).
3. Reload the panel after the page already loaded: the relay latches `lastState`/`lastVersion` and answers `angular-ai:replay-request` synchronously from the latch (`relay.js:34-38`); the service spec pins a replayed state and version writing all four signals (`extension-message.service.spec.ts:124-135`), so chip and list are still populated — the replay proof.
4. Non-Angular page: the named refusal appears with no chip entry and no group header (spec `:300-303`).
5. Production build of the fixture: the version is named and the debug surface is reported absent, with no feature claimed (cannot-tell, `feature-fingerprint.ts:128`); the group list keeps the two bit-free groups — warning W5.
6. Budget: the same recorded run's `node --test scripts/panel-bundle-budget.test.mjs` printed 529,936 B over 7 eager files, under the 535,440 B pin; the relay's own green page badge (`relay.js:31-38`) is extension chrome, not the chip, and is not mistaken for it.

## Gap findings and wave-review warnings, actioned

Every gap finding and every wave-review warning, each with an Actionable value:

From the gap reviews:

- **Gap 1 — project Verify (pass)**. The recorded Verify ran the full chain to exit 0 at the reviewed head. `Actionable`: accepted — evidence in the ledger entry for b16ecf1a… and `.project/review/final-gap-1.md`.
- **Gap 2 — page-state seam (pass, with one tightening warning)**. Every published field is the field the adapter reads; the latch survives the replay; the replay outcome decides nothing once a state has arrived. `Actionable`: accepted — the seam holds end to end; the warning (cannot-tell group list) is non-blocking because no INTENT criterion or prohibition rules against the pinned reading (N2 covers contradiction, not silence) and is carried as W5/R5 below with a fix direction.
- **Gap 3 — three page classes distinguishable (pass; closes P001)**. The T008 repair separates all three page classes plus the two non-conclusions without over-claiming. `Actionable`: fixed — the classifier now takes the replay outcome as a fourth input (`feature-fingerprint.ts:114-128`), the waiting and transport states landed, and the refusal is reachable only after an answered replay; the PATCH-FINDINGS.md P001 fix direction is implemented verbatim in T008.
- **Gap 4 — lazy, reachable chat route inside the baseline (pass)**. `Actionable`: accepted — single lazy `loadComponent` entry with no eager importer, `tool-registry.ts` re-hashes to the pinned SHA-256 with its first production consumer beside it, both registry suites green, and the recorded Verify's bundle figure is under the pin.

From the wave reviews:

- Wave 1 — the brief's stub file `wave-1.cycle1.stub.md` did not exist. `Actionable`: accepted — input-side only; criteria were copied verbatim from the task files and INTENT.md, as the review records.
- Wave 1 — no single recorded Verify ran the whole `npm test` at the wave-1 head (SC4's test half was compositional there). `Actionable`: accepted — closed by the recorded project Verify at the reviewed head, which runs `npm test` wholesale to exit 0.
- Wave 1 — T003's fresh base-side measurement (535,695 B) disagreed with the recorded 535,440 B baseline by 255 B. `Actionable`: open — the ACs judge the head measurement (529,936 B, exit 0) and the pin constants are byte-identical to base, so nothing fails; the base disagreement is recorded as open item O3 for the next re-base.
- Wave 2 — the Surface contract's loading state had no dedicated chip rendering. `Actionable`: fixed — T008 added `awaiting-page` with its waiting line, no `entries` field and its own `data-testid`, pinned by spec and held-out tests (wave-3 review; gap-3).
- Wave 2 — the brief's stub file `wave-2.cycle1.stub.md` did not exist. `Actionable`: accepted — same input-side disposition as wave 1.
- Wave 3 — the recorded Verify's Vitest leg was served from the Nx cache. `Actionable`: accepted — the held-out `node --test` leg ran fresh, and the final project Verify at b16ecf1a… ran `npm test` fresh to exit 0, removing the doubt.
- Wave 3 — `PanelContext.replayOutcome` is optional and a missing value reads as `answered` (`ASSUMED_OUTCOME`). `Actionable`: accepted — unreachable in production (`PanelSignals.replayOutcome` is a required signal, `buildPanelContext` writes the field in both branches, and the component is the only production context constructor); carried as risk R1 below.
- Wave 3 — the brief's stub file `wave-3.cycle1.stub.md` did not exist. `Actionable`: accepted — same input-side disposition.

Carried warnings (all non-blocking, recorded for the next milestone):

- **W1 — the `ASSUMED_OUTCOME` default** (`feature-fingerprint.ts:93,118`): a hand-built `PanelContext` without `replayOutcome` reads as `answered`, the one reading that could revive the P001 false claim if a future caller omits the field (= risk R1).
- **W2 — the 5,504 B budget headroom**: the head sits 5,504 B under the byte-exact 535,440 B pin and 9.94 kB above the 520 kB warning; any later milestone spending that headroom must not re-cut the pin (N5) (= risk R2).
- **W3 — the dev-mode `[ng-version]` dependence**: the version read is the part that survives a production build while `window.ng` does not (`.project/research/evidence-fingerprint.md`), so a production Angular page lands in the named cannot-tell state with a version in hand rather than being mis-excluded; the gate names that state (= risk R3).
- **W4 — the `[RESEARCH]` question**: answered in `.project/research/evidence-fingerprint.md` — none of the eight bits distinguishes the two fixtures (both dev builds of `@angular/core` 22.2.2 with identical 21-key sets, all eight bits true on both); the only build-level distinction is `window.ng` present versus absent, and every bit needs a per-feature probe — an actual call on a real host — before the panel may claim the app supports anything (= risk R4, carried to M021+).
- **W5 — the cannot-tell group list** (gap-2's tightening warning): on a cannot-tell page the group list still offers `app-support` and `error-reference` while the chip names cannot-tell, reading stricter than the Surface contract's cannot-tell bullet, with no INTENT criterion or prohibition against the pinned reading (= risk R5, open item O1).

## Requirements traceability

| Requirement | Proven by |
|---|---|
| N18 (feature fingerprint and context chip) | SC1, SC2 and SC3 all met; the panel walkthrough above; recorded Verifies for T004-T006 and T008 plus the wholesale project Verify at this head |
| AR-1 (520 KB initial-bundle budget binding) | The bundle-pin gate: 529,936 B measured, 5,504 B under the byte-exact 535,440 B pin, `PRE_MILESTONE_INITIAL_KB` and the `520kb`/`1mb` budget byte-identical to base (N5 held) |
| AR-3 (no DOM added to an inspected page) | N6 citation under SC1: the relay diff touches only the latch, listener and `lastVersion`; the marker block is untouched; `extension/manifest.json` at base bytes (wave-1 T002 review; gap-2 static trace at this head) |
| AR-6 (confirmations, toasts, inputs and navigation live in the panel) | The chip and the group list render only in the panel; `chat-entry.component.ts` imports no page reader, and `node --test scripts/registry-reach.test.mjs` re-run by gap 4 accepts only `tool-registry/read-tools*` for `../page-reads` across 73 scanned files, 4/4 pass |
| AR-7 (the panel is the only product surface, self-inspection at `/panel/`) | The Surface contract entry is the panel's own lazy route `/panel/chat` under `baseHref` `/panel/`; nothing in the milestone renders in the inspected page (gap-2 trace, AR-3 evidence above) |
| Charter program criterion 3 (check, test and build-extension pass at every ship; N1/N2/N3 not regressed) | The gates table above: all three green at this head; the six explainer routes and their components keep their base bytes (wave-2 T006 `git show --stat 932f116a` evidence) |
| Registry-envelope pin (`tool-registry.ts` SHA-256 `20859b88…0407e`) | Gap 4 recomputed the hash at this head and it equals the pin constant; `scripts/registry-envelope-pin.test.mjs` (including the one-byte-mutation red fixture) and `scripts/registry-reach.test.mjs` re-run green |

Human-acceptance step: a live `lars-verify` re-drive of walkthrough steps 2-5 (serve the fixture, load the built extension, observe the four rendered states in a browser) remains the named human acceptance step for the rendered surface; the recorded spec, held-out and built-output evidence at this head stands in for it in this review, as in waves 2 and 3.

## Risks and open items

Risks carried out of this milestone:

- **R1 — `ASSUMED_OUTCOME` default** (warning W1): a future caller that hand-builds a `PanelContext` without `replayOutcome` gets the refusal-permitting reading. Fix direction: make `PanelContext.replayOutcome` required and delete the default when the second production caller appears.
- **R2 — 5,504 B budget headroom** (warning W2): the initial total is 9.94 kB over the 520 kB warning already; the byte-exact pin is the only guard. Fix direction: never raise the pin; convert further explainer routes to `loadComponent` before adding eager bytes.
- **R3 — dev-mode `[ng-version]` dependence** (warning W3): the version read is production-safe but the debug surface is not, so version-gated groups are offered only where a version actually arrived; the cannot-tell state names this rather than mis-excluding. Fix direction: none needed now; revisit if a fixture class appears where the attribute is stripped by hand.
- **R4 — the `[RESEARCH]` answer** (warning W4): the eight bits separate only build-level facts, so any future chip claim beyond "this build publishes the debug surface" needs a per-feature probe; carried to M021's detection design.
- **R5 — cannot-tell group list** (warning W5): the pinned reading offers the two bit-free groups on a cannot-tell page. Fix direction: extend `refuseGroup` to treat `stateReceived === false` as decisive, or assert an empty list for cannot-tell in the component spec, in a later milestone.
- **R6 — a version gate tuned on one fixture** (INTENT risk): mitigated by evidence — both fixtures are dev builds of 22.2.2 with identical 21-key sets, so no supported version flips a bit, and E4 pins the boundary inclusively in both directions.

Open items:

- **O1** — tighten the cannot-tell group list (= R5), the one tightening gap 2 asked for.
- **O2** — a headroom-spend policy for the 5,504 B under the pin before the next panel surface lands.
- **O3** — re-base the bundle baseline: T003's fresh base-side measurement (535,695 B) disagrees with the recorded 535,440 B by 255 B; the next baseline owner should re-measure the base once and record which figure the pin keeps.
- **O4** — carry the per-feature-probe conclusion (`.project/research/evidence-fingerprint.md`) into M021's opt-in detection plan.

## Archive plan

Archive plan: `.project/archive/020-feature-fingerprint.md` — on shipping approval, `archive_milestone.py prepare` persists `.project/archive/020-feature-fingerprint` as `STATE.archive` and moves the active milestone there atomically; `render-manifest` derives the manifest from this FINAL.md's verdicts; the LESSONS carry-forward lines are appended by the ship phase, not by this review. No archive mutation has happened yet; shipping approval is pending.
