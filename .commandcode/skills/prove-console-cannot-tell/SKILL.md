---
name: prove-console-cannot-tell
description: "Formal check for the console-diagnostic join (extension/lint-core.js against extension/error-digest.json): bounded enumeration of the message-text grammar — codes x quoted phrases x stack shapes x digest subsets — run against the real module in a bare node:vm context, proving a lint finding names only the construct the message body names, stack frames never leak a component, and a code the digest does not carry answers cannot-tell, never a finding. Use before or after any edit to lint-core.js or error-digest.json, when a lint finding names a component or element the message never named, or when asked to 'prove the console join cannot tell more than the message says'."
---

# prove-console-cannot-tell

**Naming grammar (this repo).** Skills are verb-shaped: `prove-<area>` (this skill); `control-*` and `verify-*` are the runtime families; `create-*`, `maintain-*` and `lars-<verb>` are the workflow family. Subagent types are role nouns (`lars-gsd-bookkeeper`, `lars-gsd-diagnostician`). This skill is named `prove-console-cannot-tell` rather than an area noun — a deliberate deviation from the generator skill's "name the skill for the area" wording, recorded here.

## Property (one sentence)

A lint finding names only the construct the message **body** names, a stack frame never leaks a component into any answer, and a code absent from `extension/error-digest.json` answers `cannot-tell`, never a finding.

## Harm (one sentence)

A finding that names a component out of a stack frame, or an input out of a code the digest cannot speak about, sends the developer to fix a construct the console never actually named — attribution invented from the wrong part of the evidence.

## What is verified, and under which bounds

The check runs the **real module** — `extension/lint-core.js` (`angularAiLintCore`) — in a bare `node:vm` context with nothing in it, with digest codes taken from the **real** `extension/error-digest.json` (64 codes at the sync commit). It first pins the model to the measured facts (the digest carries `NG0950`, does not carry `NG8008`); if those stop holding the check reports **model drift** rather than a code bug. Over the bounded grammar it asserts, for every answer:

- **Decision table.** The answer is exactly what the body's own evidence decides, derived independently in the check: no NG code in the body → the message is not a diagnostic; code absent from the stated digest subset → `cannot-tell` / `code-not-in-digest`; body names no `Input "<identifier>"` → `cannot-tell` / `message-names-no-construct`; otherwise a finding. Combined captures follow the documented precedence (a finding outranks an absence, captured order among answers of one kind, `no-captured-messages` / `no-coded-diagnostic` when nothing answers).
- **Finding ⇒ body's own identifier.** `construct` equals the identifier the body itself quotes after `Input` — never a token from a stack frame, never a quoted prose phrase (`"the required label"` fails the identifier rule), never a non-identifier token (`"9lives"`); `code` is in the stated digest subset; `message` is the body alone, with no newline and no frame.
- **Absence ⇒ no construct at all.** A `cannot-tell` answer carries `reason` and nothing else — no `construct`, no `code`, no `message` — and its reason is one of the four published constants.
- **No stack leak.** No answer, in any state, contains a component name that only the stack frames carry (`LeakyPage` in the grammar); a quoted `Input "other"` planted inside a frame cannot change the answer; the same text with and without frames answers identically.
- **The entry's `code` field is not evidence.** A decoy entry code that disagrees with the text changes nothing; empty or malformed `facts` (`digestCodes` absent, empty, non-array, with junk entries) mean no code is known, so even `NG0950` answers `code-not-in-digest`.

Bounds — everything is enumerated, nothing beyond:

- 5 code shapes (`NG0950`, `NG8008`, `NG0304`, `NG01002`, no code) × 5 quoted-phrase shapes (none, `Input "requiredLabel"`, prose in quotes, non-identifier token, quoted token with no `Input` word) × 3 stack shapes (none, one frame, three frames) × 3 entry `code` decoys × 7 digest subsets (empty, singletons, `NG8008`-bearing, the real full list, the real list without `NG0950`) × 2 capture shapes (alone, behind a noise message) — each message also judged on the combined decision table.
- 10 capture-shape edges (empty, non-array, `undefined`, non-object entries, text-less entries, no-code texts) × the same digest subsets.
- 5 `facts` shapes against one `NG0950` body, plus the frame-decoy pair.

Run time is milliseconds (~14 ms, ~11,300 assertions). A pass covers this grammar at this bound — it is not a proof at every message shape a console could print.

## What is excluded

- Message texts outside the grammar: multi-line bodies with blank lines, `\r\n` stacks, ANSI colouring, codes printed with padding or lowercase, other frameworks' frames.
- Digest contents beyond the pinned facts: the check reads the real `error-digest.json` codes but proves the decision table against enumerated subsets, not against every entry's prose.
- The surfaces that call `lintCore` (content scripts, the panel) and the capture that produces the `messages` array — only the join is covered.
- Angular's full error catalogue: only the four code shapes in the grammar, chosen for the measured `NG0950`/`NG8008` contrast and a five-digit code.

## How to run

From the repo root (`D:\projects\sandbox\angular-ai-devtools`), one command, Node ≥ 18, no dependencies:

```
node .commandcode/skills/prove-console-cannot-tell/check.mjs
```

Exit 0 prints one `PASS` line; exit 1 prints the first ten counterexamples as JSON (the messages, the digest subset, the answer) and stops. There are no flags and nothing to install.

## Coverage record

| Covered                       | Detail                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `extension/lint-core.js`      | `lintCore` and every helper under it (`answerFor`, `bodyOf`, `codeOf`, `constructOf`, `digestCodesOf`, `finding`, `cannotTell`); the two states, the four absence reasons, the `NG_CODE`/`STACK_FRAME`/`NAMED_INPUT`/`IDENTIFIER` patterns |
| `extension/error-digest.json` | read as the source of the real codes; the model pins it to carry `NG0950` and not `NG8008`                                                                                                                                                 |

**Sync commit:** `7cbb1e6e` (2026-11-21, `main`) — the commit at which this verification was last confirmed to describe the covered files. When the covered code changes after that commit, this verification needs another look before its results are trusted.

## Telling a real bug from a modelling error

A failure is a **real bug** when the counterexample's message is a shape the console actually prints — a finding whose `construct` is not the body's own quoted identifier, a finding for a code the stated digest does not carry, an answer carrying a component name only a stack frame held, an absence carrying a `construct` field. Reproduce it by hand against the module before calling it: feed the counterexample's messages and facts to `lintCore` and read the answer. Report it; do not weaken the property, the grammar or the digest pin to go green, and do not change product code unless asked.

A failure is a **modelling error** when the counterexample's message is a shape the recording says never reaches a console, or when the **model-drift** assertions fire because `error-digest.json` legitimately changed (a release added or removed codes). Then update the pinned facts and, if needed, the grammar in `check.mjs`, note what changed, and re-run — the model must describe the digest as it now is, not as this check wished it.

## Moving the sync commit forward

Move the sync commit above to a new commit **only after** running this check at that commit and confirming, by reading the covered files, that the verification still describes them — same body definition, same pattern set, same decision order, and a digest whose shape the model still pins correctly. If a change was intended to alter the behaviour this proves, update the property and the grammar first, prove the new check fails on the old behaviour and passes on the new, and only then move the commit.
