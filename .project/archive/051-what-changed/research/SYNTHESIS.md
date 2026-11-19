# SYNTHESIS — M051 what-changed

## What the milestone established

The record the panel dispatches carries no page identity. Whatever two records are compared, nothing inside them says they describe the same page — so the pair is bound by the panel's own inspected tab, and when no binding is supplied the comparison refuses rather than guessing.

Against that measurement, the comparison is small: nine measured fields, compared in the order the tree pins; a field present in both with different values reported with its before and after; a field present in only one reported as added or removed with no invented counterpart; and a refusal naming both absences — the record's missing identity and the panel's binding — whenever the pair cannot be tied to one tab.

The surface costs nothing in the initial bundle. Every panel surface is a lazy chunk behind one `LOADERS` key and one literal; `panel-what-changed` measures 4.68 kB on its own and 0 bytes in the initial total, which stays at 534.43 kB against the recorded baseline.

## What it corrected in itself

The first implementation compared only the fields both records carry, which quietly dropped E1's added/removed case. The coder reported the gap instead of narrowing the claim, and the repair added the one-sided branch plus a fifth mutant. That is the pattern this programme keeps paying for and keeps recovering by the same means: measure, name the gap, repair it, keep the mutant.

## What the milestone carried forward

- The verify log now names the head it judged. Four landings were spent reading a log written thirteen seconds before the fix it complained about; the header is the structural answer, and it proved itself on T004's first use.
- The intent's edge table is five columns, because `check_handoffs` refuses a sixth. The edge-to-test mapping lives in the plan's `## Held-out checks`, which is the one place it can be derived from.
- The archive sequence and the milestone number are not the same thing. M056 shipped ahead of 051–055 by design; `prepare` now ignores a later archive that is genuinely shipped and integrated, and still refuses a half-prepared one.
