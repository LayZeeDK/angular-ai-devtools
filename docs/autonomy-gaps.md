# Autonomy gaps — why M017 still needed a human

This is the analysis the milestone owner asked for: why a milestone still needed a human at all,
which installed user-scope material changed so that each stop could be passed without one, and what
in this repository fails if that change is lost. It covers only the gaps this milestone actually met
— ten stops recorded first-hand in the M017 run — and it records no seam the run did not touch. Every
user-scope edit it describes was made outside this checkout, under
`C:\Users\LarsGyrupBrinkNielse\.commandcode\`, and is cited by absolute path; no commit in this
repository carries it, and `land-check` could not show one if it did. What this repository holds is
the pin, not the fix: a test that goes red when the installed prompt, the installed playbook, or the
mechanism a fix depends on is removed.

Two conventions keep the fields readable. First, the orchestrator prompt is identified by its
absolute directory `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\` plus the ending of its file
name (`-gsd-path-orchestrator.prompt.md`) rather than by the route its name carries, because this
file writes no model name; that directory holds one prompt per route and a `.bak` copy, and
`scripts/user-scope-autonomy.mjs` resolves the exact segments the pins read. Second, a `Verified:`
line quotes the command that was actually run, its exit status and a tail of its real output; a proof
that was not made is written `not-run` with its reason instead.

## Gap — %ERRORLEVEL% reports the previous command

Met: at the first two approval transitions, `echo EXIT=%ERRORLEVEL%` after a redirect
(`... > %TEMP%\step.json 2>&1`) printed `EXIT=0` twice while the redirected file held
`error: expected state does not match`. cmd.exe expands `%ERRORLEVEL%` when the whole line is parsed,
so the echo reported the status of the command before the redirect, and two failed
`pipeline_state.py transition` calls read as successes until the file was opened.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, nothing forbade reading `%ERRORLEVEL%` and nothing said where a helper's outcome should be
read from; after, its "Read helper JSON from a file" bullet forbids it, says to act on the helper's
own `status` / `error` field in the redirected file, and names `$LASTEXITCODE` read immediately after
the call as the alternative. The edit was made outside this checkout and no commit here carries it.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G1` — `G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% and names the helper JSON and $LASTEXITCODE`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% and names the helper JSON and $LASTEXITCODE`
Remaining: the prompt lives outside the repository, so an installer re-run can revert the bullet and only G1 notices; the durable fix is a driver that reads the helper's JSON instead of any exit-code echo, which no rule can replace. A human is not needed to choose the rule, but is needed to re-apply it if an installer overwrites the prompt.

## Gap — STATE.milestone accepts one event

Met: `pipeline_state.py transition --set-milestone <slug>` was refused as
`illegal STATE.milestone transition` for every event except `milestone intent approved`, and the
refusal named no legal event, so two attempts read as a broken helper before the cause was visible.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, no rule named the event that may set `STATE.milestone`; after, the bullet names
`milestone intent approved` (with `program roadmap approved`, a next-milestone bind and an abandon as
the other legal cases), quotes the `illegal STATE.milestone transition` refusal, and says to record
`pre-authorized approval: intent` as its own unchanged-position transition first. The edit was made
outside this checkout and no commit here carries it.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G2` — `G2 prompt pin: the orchestrator prompt names the milestone event and the pre-authorized approval transition`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G2 prompt pin: the orchestrator prompt names the milestone event and the pre-authorized approval transition`
Remaining: the helper still refuses without saying which event is legal; a later milestone can make `pipeline_state.py` list the accepted events in its error, which removes the need for the rule rather than relying on the rule's presence.

## Gap — the ruling queue number is the row's own

Met: `preauthorize --kind intent` refused twice as `DOCS-AUDIT.md has NEEDS-USER rows without a user
ruling`. The gate couples each `NEEDS-USER` queue row to a `## User rulings` row by that row's OWN
number in the `Queue #` column, and a claim containing an escaped `\|` is one cell to the helper — a
naive `|` split silently dropped queue rows 34 and 61, which is exactly where the gate then failed.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, nothing said how the queue couples to the rulings or that an escaped pipe is one cell;
after, the bullet states both, so a ruling pass reads the queue the way the gate does. The edit was
made outside this checkout and no commit here carries it; 82 rulings followed in one pass.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G3` — `G3 prompt pin: the orchestrator prompt states the DOCS-AUDIT ruling numbering and the escaped pipe trap`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G3 prompt pin: the orchestrator prompt states the DOCS-AUDIT ruling numbering and the escaped pipe trap`
Remaining: the gate counts the missing rulings instead of naming the queue numbers; a helper that returned the numbers would remove the need for the prompt rule, and the coupling itself is the template's own rule that E6 guards.

## Gap — a wrapped RESEARCH question loses its second line

Met: `check_handoffs.py research` failed `question assignments do not match the intent source` on a
`[RESEARCH]` question in `INTENT.md` `## Open questions` that was wrapped over two lines. Its pattern
is line-anchored (`^\s*- \[RESEARCH\] (.+?)\s*$`), so only the first line was read and the question it
compared could never match.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, nothing said the question is matched one line at a time; after, the bullet says never wrap
it and quotes the refusal it produces. The edit was made outside this checkout and no commit here
carries it.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G4` — `G4 prompt pin: the orchestrator prompt forbids wrapping a RESEARCH question and names the refusal`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G4 prompt pin: the orchestrator prompt forbids wrapping a RESEARCH question and names the refusal`
Remaining: a helper fix would make the pattern span wrapped lines, or return the unmatched question in its refusal, and then the rule is unnecessary; until then a human must keep the question on one line, which no gate enforces on their behalf.

## Gap — the research evidence shape is exact

Met: four refusals in a row on one research evidence artifact: the H1 was not exactly
`# Evidence — <dimension>`, a custom dimension was not written `Dimension: custom (<slug>)`, the
question was paraphrased instead of quoted verbatim with its backticks on the `Questions assigned:`
line, and `Confidence:` carried a sentence rather than a bare `high` / `medium` / `low`. A UTF-8 BOM
before the H1 hid the real cause: `^# Evidence — …` never matched, so the gate reported the dimension
as unnamed while the heading looked correct.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, none of the five requirements was stated; after, the bullet lists the exact H1, the custom
dimension form, the verbatim question with its backticks, the bare confidence word and no UTF-8 BOM
before the H1. The edit was made outside this checkout and no commit here carries it.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G5` — `G5 prompt pin: the orchestrator prompt states the research evidence H1, dimension, question, confidence and BOM rules`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G5 prompt pin: the orchestrator prompt states the research evidence H1, dimension, question, confidence and BOM rules`
Remaining: the helper should strip a leading U+FEFF and name which of the five fields failed, instead of reporting the dimension as unnamed; until it does, the five rules are carried by the prompt and by this document.

## Gap — a prohibition criterion of all

Met: `check_handoffs.py intent` refused with `Prohibitions N3 criterion all must be dismissed`. A
prohibition whose Criterion cell is `all` is legal only on the single dismissed row that records work
affecting no person; every other `all` row is refused, and the refusal does not say which criterion to
use instead.
User-scope change: the orchestrator prompt at `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\`
— before, nothing limited a criterion of `all`; after, the bullet states the one legal case, quotes
the refusal and says to point the prohibition at the SCn it actually protects. The edit was made
outside this checkout and no commit here carries it.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G6` — `G6 prompt pin: the orchestrator prompt limits a prohibition criterion of all to the dismissed row`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G6 prompt pin: the orchestrator prompt limits a prohibition criterion of all to the dismissed row`
Remaining: nothing structural — the refusal is correct and only its hint is thin; a helper that named the SCn to use would make the rule unnecessary, and no human decision is involved either way.

## Gap — a re-emitted section heading splits the body

Met: a scripted rewrite of the audit re-emitted the `## User rulings` heading, so the file carried two
of them. `section_body` matches the first heading it finds, and the first body was empty, so the gate
read zero rulings and refused the intent approval while the section visibly carried 82 rows. A
silent, successful-looking write was the whole failure.
User-scope change: the autonomy playbook at
`C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md`, in the table
of stops measured during M017 (appended outside this checkout), row 8 — before, nothing warned that
re-emitting a heading duplicates it; after, the row records the symptom (`section_body` matches the
first and returns an empty body, so the gate silently reads zero rulings) and the recipe: rewrite a
section as heading plus content in one replacement, then re-run the gate afterwards to prove the body
is non-empty. The edit was made outside this checkout and no commit here carries it; the prompt does
not repeat the rule, it only directs the orchestrator to load this playbook before rerunning a helper.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G7` — `G7 playbook pin: the playbook records the duplicated section heading and the one-replacement rewrite`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`; `✔ G7 playbook pin: the playbook records the duplicated section heading and the one-replacement rewrite`
Remaining: two fixes belong to a later milestone: carry the rule into the prompt's own autonomy list, and make `section_body` join duplicate headings rather than take the first — the helper fix is the durable one, because a recipe only helps a reader who already knows the symptom.

## Gap — a shell variable in a Verify

Met: a task Verify that named its path through `%USERPROFILE%` could not run in the authoritative
isolate. The command is handed to the interpreter without a shell, so the variable was never expanded
and the path resolved relative to the sidecar instead of the repository. The session also met the
second half: the task-file body is append-only at land, so a Verify repaired in the working tree is
refused as `task file body is not append-only`, and the repair has to be in the base before the round.
User-scope change: no user-scope edit was made for this gap, and none is claimed — the fix is a
measure: write every Verify with an absolute interpreter-visible path, and put a Verify repair in the
base before the round. The append-only rule the measure depends on already lives at
`C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md` (never edit a
task file inside the isolated worktree) and in the installed task template at
`C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\templates\task.md`, whose `## Log` is
append-only; any future edit to either file would be made outside this checkout.
Pin: `scripts/autonomy-gaps.test.mjs` rule `G8` — `G8 Verify pin: a shell variable is not interpreter-visible while an absolute path is`
Verified: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `G8 probe: … %USERPROFILE% and $HOME arrived literally and resolved to nothing, which is the failure an absolute Verify path avoids`
Remaining: a human still has to write the absolute path, because no gate refuses a shell variable in a Verify cell; a later milestone can add a portability check that rejects `%VAR%` and `$VAR` in a Verify, which is what would make the measure enforceable rather than remembered.

## Gap — a clean sidecar has no node_modules

Met: a clean verify sidecar carries no `node_modules`. One case failed on a missing
`node_modules/playwright-core/browsers.json`, because the fact it asserted is a property of an install
the sidecar does not have; another failed on the audit's `Repo root:` header naming the primary
repository rather than the sidecar, refused as `Repo root does not match --primary`.
User-scope change: no user-scope edit was made for this gap, and none is claimed — both fixes are in
this checkout: `scripts/docs-correction.test.mjs` resolves the chromium build from the strongest
in-repo source, then from a recorded 2026-11-01 reading taken from
`node_modules/playwright-core/browsers.json` in the primary checkout, and otherwise asserts the
documented token and reports the fallback; `scripts/docs-audit-disposition.test.mjs` passes the
primary the audit's own header declares as `--primary` instead of assuming the root it stands in. The
installed gate at `C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py`
was read for this analysis and never edited; an edit to it would be made outside this checkout.
Pin: `scripts/docs-audit-disposition.test.mjs` rule `E6` — `E6 queue numbers stay unique, increasing and bound to their items` ; `scripts/autonomy-gaps.test.mjs` rule `G9` — `G9 static pin: the chromium reading survives a checkout with no playwright install`
Verified: `node --experimental-strip-types --test scripts/docs-audit-disposition.test.mjs` exit 0 — `✔ E6 queue numbers stay unique, increasing and bound to their items`; `E6: gate exited 0 over the head audit at D:\projects\sandbox\angular-ai-devtools\ with the inventory derived from it (142 inventoried docs, primary D:\projects\sandbox\angular-ai-devtools)`; and `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `✔ G9 static pin: the chromium reading survives a checkout with no playwright install`
Remaining: any case that needs an untracked install keeps needing a recorded reading or an in-repo source, and a human must re-take the reading when the pinned version moves; a later milestone can have the gate print the resolved primary path in every refusal, so a sidecar run names the mismatch before a case has to guess it.

## Gap — a rejected serial attempt is unparkable

Met: a rejected serial attempt could not be parked by helper. A serial dispatch returns the primary
worktree with `task_branch: null`, so `deactivate-task` refuses for want of a `--task-branch` that was
never created; `activate-task` refuses the still-`in-progress` task; `checkpoint` refuses the leftover
product files (`unexpected paths`) and `prepare-task` refuses the next round
(`task isolation requires a clean primary worktree`). This was hit for real on T003 in this session.
User-scope change: no user-scope edit was made for this gap, and none is claimed — the recipe already
lives at `C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md` §31
(park the rejected product files with their SHA-256, checkpoint the Log, retire the verify sidecar,
reset the frontmatter, re-prepare), and the repository-side fix this milestone added is the serial
retry pin named below. Any change to that recipe would be made outside this checkout.
Pin: `scripts/user-scope-autonomy.test.mjs` rule `P4` — `P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails`
Verified: `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exit 0 — `✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails`; `ℹ tests 18 / ℹ pass 18 / ℹ fail 0`
Remaining: the repair is a five-step manual recipe, and a human must run it in order; a later milestone can give `deactivate-task` a serial mode that resets the frontmatter and retires the sidecar in one call, which is what the recipe hand-assembles today.

## What this document does not prove

It claims no run that did not happen: every `Verified:` line above names a command this milestone
executed, with its exit status and a tail of its real output, and nothing is inferred from memory or
from an earlier Log entry.

A static pin is not a behavioural verification, and the document does not present it as one. G1–G7
and G9 read a document and assert named tokens, so they prove the rule's text is still installed and
still says what it said — not that an orchestrator obeys it. Only P4 and E6 drive a helper and assert
its parsed output, and only G8 demonstrates the environment such a helper runs in. That distinction
matters to a reader deciding how much a green run is worth.

It claims no user-scope change is in this repository's history. Those files live under
`C:\Users\LarsGyrupBrinkNielse\.commandcode\`, no commit here carries them, `land-check` would not
see one, and three of the ten gaps (8, 9, 10) made no user-scope edit at all — their fields say so
rather than inventing an edit to fill the shape.

It writes no model name, no route slug, no work address and no domain anywhere: the orchestrator
prompt is identified by its absolute directory and the ending of its file name, never by the route
its name carries, so no model slug is spelled and no domain appears even in an e-mail-like form.

It does not measure the milestone's own project Verify. `npm run check`, `npm test` and the extension
build are recorded in the task Log, because they prove this checkout rather than the installed
user-scope material this document is about.
