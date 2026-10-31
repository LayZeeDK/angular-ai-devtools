# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Which of the 137 unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Finding: Many "unverifiable" rows are only uninspected static claims

- **Claim**: Rows marked `unverifiable` with type `structure`, `config`, or `command` and an evidence string like "not checked", "not verified in code", or "no source in repo" are settleable by file existence, grep, or `npx nx show project`, because the referenced paths live inside this repository (e.g. `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `.commandcode/skills/control-ai-browsers/scripts/control.mjs`).
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` (rows 359-364, 367-373, 375-381, 391-398, 400-406, 407-414, 423-429, 430-437, 438-448, 449-463, 486-491, 492-499, 500-538, 549-550, 594-633, 788-826)
- **Confidence**: high
- **Why it matters here**: INTENT.md N3 forbids recording a claim as unverifiable when the repository holds evidence to settle it; these rows must be re-derived, not carried forward.

## Finding: Message-type integration claims are grep-settleable

- **Claim**: The recurring "message types angular-ai:*" rows (di-query/di-graph, error-capture/error-explain, interop, record, stale-view) can be settled by searching `src/`, `extension/`, and `apps/` for the literal message strings; the audit's "not located in inspected files" reflects inspection scope, not absence.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` rows 46, 53, 82, 364, 371, 373, 380, 404, 405, 428, 436, 595, 598, 604, 609, 612; `D:\projects\sandbox\angular-ai-devtools\AGENTS.md:54-62` (interop message half has no source in portal)
- **Confidence**: high
- **Why it matters here**: Settling these by grep is cheap and documentation-only, directly serving INTENT.md SC3's queue closure without product changes.

## Finding: Extension id claims have an authoritative source in control.mjs

- **Claim**: The "extension id ienfalfjdbdpebioblfackkekamfmbnh" row is verifiable in `.commandcode/skills/control-angular-devtools/scripts/control.mjs:89` (`EXT_ID`), while the `.claude` copy of the same skill is an older, drifted copy (AGENTS.md), so the id is settleable only against the maintained `.commandcode` tree.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-devtools\scripts\control.mjs:89`; `D:\projects\sandbox\angular-ai-devtools\AGENTS.md:38-41`
- **Confidence**: high
- **Why it matters here**: This is a concrete instance of the skill-mirror drift trap INTENT.md must keep green via `scripts/skills-mirror.test.mjs`.

## Finding: Portal and runtime-UI claims cannot be settled from this repository

- **Claim**: Rows whose evidence says "portal source lives outside this repository", "portal data is random per API start", "depends on portal runtime", or "depends on running vitest/browser" require the external portal checkout or a live browser instance and cannot be produced by the static, docs-only evidence this milestone allows.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` rows 137-164, 248-270, 280-310, 464-491, 551-592, 613-633; `D:\projects\sandbox\angular-ai-devtools\AGENTS.md:54-62`
- **Confidence**: high
- **Why it matters here**: INTENT.md Scope out forbids product/runtime changes and the charter forbids portal source changes; these rows need a recorded ruling or retirement, not a code fix.

## Finding: On-device model and browser-only claims are environment evidence, not repo evidence

- **Claim**: Claims about Chrome for Testing versions, model variants (e.g. v3Nano CPU 2025.8.21.1028), `LanguageModel` availability, `ng.ɵ*` internals, and WebMCP (`document.modelContext`) are browser/runtime measurements that no shipped command in this repository can reproduce without launching shared browser profiles.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` rows 29, 178, 199, 205, 211-212, 300-302, 308, 518, 531, 537, 566, 569, 570-571, 587-588, 590, 602, 653, 679; `D:\projects\sandbox\angular-ai-devtools\AGENTS.md:24-45`
- **Confidence**: medium
- **Why it matters here**: They drift with browser/model updates and must be dated or retired per INTENT.md rather than silently asserted as current.

## Finding: External Angular/Chromium/upstream claims are outside the sidecar

- **Claim**: Rows citing upstream Angular, Analog, RxAngular, Vitest, Chromium source (`GLOBAL_PUBLISH_EXPANDO_KEY`, `ng.ɵgetRouterInstance`, `kExceptionMessageUnableToCreateSession`, `CHANGELOG.md top entry`) cannot be settled because those repositories are not in this workspace.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` rows 654-677, 909-922, 930-937, 951-978; `D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md` (blocked areas: external repos not inspected)
- **Confidence**: high
- **Why it matters here**: INTENT.md's evidence standard requires an opened source; "no reliable source found" is the correct verdict for these, not a fix-doc.

## Finding: Historical dated measurements drift silently and need accept-drift rulings

- **Claim**: Dated claims (line counts, commit heads, "measured 2026-10-11/10-30") rot as the code moves; the audit already records two stale rows (649, 650) for this, and rows like "Tree clean: git status" (643) can never be re-verified after the fact.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` rows 643, 649-650, 605, 641-642; `D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md:119-125`
- **Confidence**: high
- **Why it matters here**: INTENT.md's delegated rulings for 649/650 establish the pattern (date the head, mark superseded) that should be applied to every dated measurement row.

## Assigned questions — answers

- Which of the 137 unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce? → Rows whose type is `structure`/`config`/`command` and whose subject is an in-repo path, command, or config value are testable by static inspection the repository already supports (`npm run check`, `npm test`, `npx nx show project`, file existence, grep for message strings and EXT_ID) and must be re-derived rather than carried as unverifiable (INTENT.md N3). Rows depending on the external portal checkout, live browser/on-device-model runtime, upstream Angular/Chromium/Vitest source, or a historical dated measurement cannot be settled by this milestone's static, docs-only evidence and should be recorded as `no reliable source found` or given a dated/retirement ruling (INTENT.md Scope out, N2, N5). Source: `D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md` Summary (137 unverifiable) and Remediation queue; `D:\projects\sandbox\angular-ai-devtools\AGENTS.md`.

## Dead ends

- `.project/archive/` — read-only history per INTENT.md veto; not re-derived.
- Running any npm/nx/test command to settle rows — prohibited by task constraints (static evidence only).
- Counting exact per-category row totals from the audit — the 137 count is an audit aggregate; per-row reclassification is the milestone's job, not this research step.