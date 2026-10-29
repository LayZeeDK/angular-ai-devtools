# Handoff: Angular AI DevTools feature proposals

Written by Claude for a fresh session, 2026-10-12. Repository: `D:\projects\sandbox\angular-ai-devtools` (local git, `main`, head `fbe3aac` at writing; never pushed).

## What this project is

Research and design for an AI-assisted Angular DevTools browser extension (Chrome and Edge). It uses the browser's built-in AI (the Prompt API with tool calling and structured output; Summarizer, Rewriter and others) on dev-mode Angular 22.2 apps, through the global `ng` API. Lars's original request is verbatim in `tmp/review/lars-request.md` (gitignored, local only).

## Where everything is

- **Deliverable:** `docs/feature-proposals.md`, about 1,080 lines.
  - Sections: 1 summary, 2 facts, 3 architecture (3.7 "Deterministic code first"), 4 features N1-N37, 5 promptified Angular DevTools, 6 ecosystem (NgRx, Storybook, Vitest, Analog, RxAngular), 7 spikes S1-S23, 8 decisions plus "Rulings from Lars", 9 not checked.
  - **Section 8's "Rulings from Lars" is the binding record of every product decision.** Read it before changing anything.
- **Design doc:** `docs/design/tutor.md` (N27, Angular AI DevTools Tutor).
- **Evidence:**
  - `research/00` to `research/17`;
  - raw data in `research/raw/`;
  - spike results in `research/s1-results/`.
  - Key files:
    - 12, legacy against modern Angular APIs, classified by runtime view;
    - 14, AI devtools prior art and app-side WebMCP;
    - 15, deterministic code plus AI;
    - 16, SSR runtime;
    - 17, Vitest Browser runtime.
- **Upstream reports:** `docs/filing-ledger.md`, ten drafts. **None is filed**, and filing needs Lars's explicit yes.
- **Run log:** `docs/afk-run-2026-10-12.md`, which holds every decision Claude made and every ruling, with times. Its "Decision log" table is the place to append.
- **Probes and fixtures:**
  - `spikes/probes/`: bench.js, regrade.mjs, arg-repair-replay.mjs, and the zone-mode, effect-writes, tosignal, ssr-* and vitest-* probes.
  - `spikes/ng222-app`: the counter, plus Vitest Browser tests.
  - `spikes/ng222-ssr`: the SSR fixture.
  - `spikes/s1-extension`: the test extension (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`).
- **Insurance Portal fixture:** `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, branch `claude/ai-devtools-spike`, head `cc9ce25`. It has Signal Forms (`754aa1e`, `66e8ad6`, `92053b9`), the error-timing fix (`987f000`) and the budget raised to 700 kB (`cc9ce25`). Not pushed.
- **Skills (project):** in `.claude/skills/`:
  - `control-` / `verify-ai-browsers`;
  - `control-angular-dev-app` (targets counter, ssr, portal, or `--url`; claims about it are proven with `lars-verify`);
  - `control-` / `verify-angular-devtools`;
  - `control-` / `verify-pangular-inspector`;
  - `control-vitest-browser-angular` (claims about it are proven with `lars-verify`).

  The browser instance registry is `.claude/skills/control-ai-browsers/instances.json`. Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337. Profiles are on D: under `.browsers/`.
- **Review history:** `tmp/review/` (gitignored), with round 1-10 findings and triage, plus every agent brief.

## State at handoff

- **Review loop:** stopped after round 10 by a stop rule. The rule and its reasoning are in the AFK log, rows for round 9 and later.
- **Agents:** none running.
- **Working tree:** clean.
- **Decisions 1-4:** all decided by Lars.
- **Nothing is blocked on Lars.**

## Next work, in the order Claude would take it

1. **Run the cheap open spikes.** Rows are in proposals section 7, and each row says what "done" means.
   - **Offline or one fixture:**
     - **S16:** lookup by an exported first-party class (`Meta`), on the counter with the export added by hand.
     - **S19:** rerun `bench.js` with argument repair on.
     - **S17:** dead-click window.
     - **S18:** `wait_for` `stable`.
   - **Need model browsers:**
     - **S14:** Prompt API in Workers.
     - **S15:** cost of many small prompts.
     - **S20:** Vitest attach on Edge.
     - **S23:** `cdpAttach` guard and launch.
   - **Probe steps:** S14 and S15 are written in `research/15` section 4.
2. **Tutor spikes TS1-TS12.** These are in `docs/design/tutor.md` section 10; TS1 and TS2 are the riskiest.
3. **Fold every spike result into the proposals.** Add a raw file under `research/raw/`, relabel claims from inferred to measured only with that file, and log the result in the AFK log.
4. **A final closed-findings check** over everything changed since `0647e96`, before calling the proposals done. Use one reviewer, briefed like `tmp/review/round10-brief-closed.md`.

## Rules that are easy to miss (from Lars, this session)

- **Agents and models:** ask Lars before spawning any `fable-*` agent; in AFK mode, use `opus-*` instead. (Memory file `fable-needs-approval.md`.)
- **Shared files:** never run `git checkout`, `git restore` or any whole-file revert on a file a running agent may be editing. (Memory file `no-checkout-shared-files.md`.) Keep one writer per file. Subagents never commit; Claude commits, staging files by name.
- **Browsers:** close every browser, tab and dev server you start. Leave Lars's everyday Chrome and Edge, and his app on port 4200, alone. Memory on this machine is tight, so run one dev server at a time.
- **Product rules.** The full text is in proposals section 8; don't re-derive these from memory.
  - The extension generates no code of any kind. Findings name the "modern Angular pattern" and why, and may name an official Angular schematic. Never write "ordained" or "blessed" outside verbatim quotes.
  - Supported apps are zoneless, standalone Angular 22.2 dev builds. NgModule and `@angular/upgrade` apps are unsupported. Legacy APIs that look the same at runtime work without a flag; ones that differ are unsupported and flagged.
  - Tool names are lowercase (S11: an uppercase letter crashes Gemma 4).
  - The companion package exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()` and `<scope>/vitest` `cdpAttach()`. The `globalThis` key is `ngAiDevTools`. The package name is still a working name.
- **No project skill named `verify`.** Claude Code runs it before every commit; Lars had the router removed. The bundled `/verify` can recreate one at `.claude/skills/verify/` if it is ever run here.
- **Gates:** no push, no PR, and no filing of ledger drafts without Lars's explicit yes. Commit as the gmail identity in `git config user.email`. Never write his work address or its domain anywhere.

## Suggested skills

- **`lars-mode`:** working rules, delegation and AFK runs. Use its review-round playbook for any further review.
- **`lars-frontend-dev`:** before touching Angular code in the fixtures or the portal.
- **`control-ai-browsers` / `verify-ai-browsers`:** for any spike that needs a model (S14, S15, S20, S23, the tutor spikes).
- **`control-angular-dev-app` with `lars-verify`:** for counter, SSR or portal spikes (S16, S17, S18).
- **`control-vitest-browser-angular` with `lars-verify`:** for S20 to S23.
- **`lars-maintain-verification`:** if a fixture or skill drifts.
- **`playwright-cli`:** for driving pages, as the skills do.
