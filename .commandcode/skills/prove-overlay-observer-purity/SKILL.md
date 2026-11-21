---
name: prove-overlay-observer-purity
description: Model check that the extension's overlay stays pure under re-injection and self-mutation - re-running extension/overlay.js adds no second host, no second MutationObserver and never throws, and a mutation the tool itself causes never reaches its own observer as a page record. Use whenever extension/overlay.js or extension/observer-filter.js changes - the injection guard, the observer's filter callback, or isToolRecord/isToolNode.
---

# prove-overlay-observer-purity

Naming grammar in this repo: skills are **verb-shaped** — `prove-<area>` names a proof skill,
while `control-*` and `verify-*` are the runtime families. Subagent types are **role nouns**
(`lars-gsd-bookkeeper`, `lars-gsd-diagnostician`).

## The property, and the harm

- **Property.** Re-injecting the overlay (re-running `extension/overlay.js` in the same isolated
  world, as an SPA route change or an extension reload does) adds no second host element, no second
  MutationObserver and never throws; and a mutation the tool itself causes — the host's insertion,
  the host's removal, or a change inside the host or its closed root — never reaches the overlay's
  own observer as a page record.
- **Harm.** A second host is the duplicate overlay the inspected page can see and never gets rid of
  (AR-3), and a tool record that survives the filter is handed to the picker as if the page had
  moved, so the tool starts reacting to itself.

## What is verified, and under which bound

`model.mjs` boots the **real** `extension/observer-filter.js` and `extension/overlay.js` in a bare
`node:vm` world (declaration order, as the manifest lists them) over a synthetic DOM that implements
exactly the surface the two files touch at load time and through the observer callback. It then
enumerates:

- injection sequences of **1, 2 and 3 runs** of both files in one world (runs 2 and 3 are the SPA
  re-injection / extension reload case);
- every ordered batch of **1–3 mutation records** drawn from six shapes — target ∈
  {`document.documentElement`, the host, a closed-root child}, added or removed, tool-caused
  (4 shapes) and page-caused (2 shapes) — **258 batches per stage, 774 across the three stages**.

Asserted after every injection and on every batch:

- **P1** exactly one host with id `angular-ai-devtools-host` under `document.documentElement`,
  exactly one MutationObserver constructed, exactly one `observe()` call, and no throw from any
  injection;
- **P2** the records the observer passes on — its **return value**, which is `notePageRecords`'s
  documented contract (the platform ignores it; `overlay.test.mjs` reads it) — share no record with
  the batch's tool-caused records: `pageRecords ∩ toolRecords = ∅`.

The record shape the code's own comment predicts as the hard case — target = the document element
with the host in `addedNodes`, the host's own insertion — is in the pool, and a target-only filter
breaks P2 on it (see "Proved able to fail").

## What is excluded

- **The armed picker.** `arm()`, the frame loop, hover, lock and the geometry module never run in
  the model; the closed-root children in the record pool are stand-ins for the drawing nodes the
  picker would create.
- **Platform delivery.** The model delivers records by hand; it does not model _which_ records a
  real browser queues. `observer-filter.test.mjs` pins that jsdom delivers no record from inside a
  shadow root; the model does not rely on that — it enumerates closed-root-child targets anyway, so
  the property holds whatever a browser delivers.
- **Containment semantics.** The synthetic `contains` walks shadow-including ancestry, which is the
  rule the filter's own comment states ("the rule is about the host subtree, not about visibility").
  If a real engine's `Node.contains` or closed-root observation differed, the property could fail
  live in a way this model cannot see — that would be a platform finding, not a modelling error.

## Run

```
node .commandcode/skills/prove-overlay-observer-purity/model.mjs
```

Exit 0 = pass, 1 = fail (prints counterexamples in the code's words). Runs in well under a second.

## Coverage record

| File                           | What the check covers                                                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extension/overlay.js`         | the injection guard (`if (document.getElementById(HOST_ID)) return;`), the single observer and its filter callback, the `notePageRecords` path, the host creation and attachment |
| `extension/observer-filter.js` | `isToolNode` and `isToolRecord` in full, the call-time `findHost`, the twice-safe publication                                                                                    |

**Sync commit: `7cbb1e6e`** (today, `main`). Move it forward only after re-running this model and
confirming it still describes the code at the new commit — the guard, the observer registration and
the filter's target-plus-node-lists rule are each load-bearing for P1/P2.

## Real bug or modelling error?

- **P1 fires** → almost always real: count the hosts/observers the failure line reports, then read
  the injection guard first. The one modelling risk is a new global the overlay starts touching at
  load time — the model's DOM would answer `undefined` where the platform answers something, and
  the failure line names the injection that threw, which tells you which call it was.
- **P2 fires** → read the failure line's shape name. If the shape is "host insertion (target = the
  document element, host in addedNodes)" or "host removal", the filter's added/removed half broke —
  a target-only `isToolRecord` reproduces exactly this (proved: that scratch break failed P2 on 242
  of 774 batches, starting with the single-record batch [host insertion]). If the shape is a
  closed-root one, check whether the change touched the `contains`/shadow branches of
  `isToolNode` before believing it — the platform-measured absence of such records
  (`observer-filter.test.mjs`) makes those the likeliest modelling-noise cases.
- A change that **intends** to alter the rule (for example a new tool-owned node kind) must update
  both the rule and this model's record pool in the same change, then move the sync commit.

## Proved able to fail

Two scratch breaks in the real code, both reverted, both caught:

1. `isToolRecord` reduced to a target-only check → P2 failed, first counterexample: the
   single-record batch [host insertion] — the record whose target is the document element with the
   host in `addedNodes` reached `notePageRecords` as a page record. This is the counterexample the
   code's own comment (overlay.js, "the half a target-only filter gets wrong") predicts.
2. The injection guard disabled → P1 failed: 3 hosts, 3 observers and 3 `observe()` calls after the
   third injection.
