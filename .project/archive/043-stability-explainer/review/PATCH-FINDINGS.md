# Patch findings — M043 `stability-explainer`

Reviewed HEAD: 109e0af88550c2da816537d1204f095baac56a52

State: ship/blocked

Neither candidate below survived measurement. This file records the two
investigations and why each closed, so the next milestone inherits the readings
rather than the alarm.

## P001 — retired: SC2 already has its page

Examined at `46abef82` as "SC2's transition half has no page" and carried into
this head by mistake. `FINAL.md` rules SC2 `met` from the wave-5 page drive:
attach `112.699…` reading `{value: false}`, settle `129.799…` reading
`{value: true}`, `sinceAttachMs 17.099…` as the join's own subtraction, the two
`routerEvents` arrivals that held the task, three reproductions (32.3, 8.9,
9.3 ms), a quiet tail of 513.3 ms never used as the interval, and a measured `0`
control rendered as `0` (`research/raw/m043-settle-page.json:1036-1078`). No
criterion is unmet; `FINAL.md` keeps `Overall verdict: pass`.

## P002 — closed: the held-out guard's red did not reproduce

Measured at `109e0af8`: `npm run check` exit 0, then `npm test` exit 1 with
`fail 1` in held-out only, `✖ tests\held-out\e4-idempotent-checks.test.mjs:38`,
`E4: first npm test exited 1`, and a nested `0 !== 1`.

Two control runs at the same head contradict it:

- `npm run test:held-out` alone: exit 0. That runs the same
  `held-out-corpus.mjs` and the same E3/E4 guards, including their nested
  `npm test` spawns, so the depth sentinel works.
- `npm test` again: exit 0, 2065 passes, 0 failures across root, user scope,
  skills, app and held-out.

So the guard is order- or load-sensitive rather than broken, and the project
Verify is green at the reviewed head. Nothing here blocks the ship; the
order-sensitivity is carried as a follow-up task for the next milestone, not
waived silently.

## Carried follow-up

Make E4's nested run isolated from the outer suite's concurrency and have it
assert the count it parsed, so a zero-parse reddens naming itself instead of
surfacing as `0 !== 1` one level up. Not a ship blocker at this head.