# SYNTHESIS — M065 title-input-binding (decide)

## Settled

The question this milestone answers is why a document title, or a value bound from the route, did not follow the
navigation. T001 settled what the target can actually show before any criterion was written: the Insurance Portal
registers Angular's `DefaultTitleStrategy`, writes no title, and declares neither `data` nor `title` in any `routeConfig`,
so the observable is an absence rather than a difference.

## Decisions

### D1 — the record is written first, and the join reads only it

T001 writes `research/raw/m065-title-record.json`; T002 joins it and nothing else. A pure join is provable against a
constructed record, which is how SC1's positive path is proved while the portal supplies only absence.

### D2 — no writer is named, and no clock is consulted

Nothing in the browser names the author of a title write, so the record states whether the observer saw the write
(`observed: false` carries no author and no navigation) and the join refuses `author`, `basis`, `at` and `observation` as
inputs. "The observation started after the write" is read from `observed`, never from a second clock.

### D3 — the reason order is part of the contract

Precedence is `no-strategy → route-binds-nothing → no-implied-title → observation-started-after-the-write`, exported as
`REASONS`. Deciding `no-implied-title` first would contradict the measured answer that every portal navigation is
`route-binds-nothing`.

### D4 — the surface moves every enumerating list in one landing

The route, the `LOADERS` key, the four ordered path pins, the surface record's counts and the fixture's route census
move together. `plan-lint`'s `pinned-file` derives those lists; `copy-check` enumerates the directory at runtime and is
invisible to it, so the surface record had to be declared by hand after a coder proved it missing.

### D5 — a recording a task rewrites is declared by the task that rewrites it

Three recordings, not four. The fourth was collateral and pushed the task past the plan's four-artefact ceiling; the
record stays committed and its ownership belongs to the wave that next re-derives it.

### D6 — a census that scans for a token must not rely on a substring

`tutor-signals-shapes` scans `extension/` for `writes:` as its evidence that no module keeps a write record, and read the
join's field name `observedWrites:` as one. The scan was left intact — its recorded set was itself gathered by substring
— and the field is assigned rather than spelled inline. The debt is the scan, recorded for the milestone that owns it.

## For the planner

The next milestone's first task should measure before it writes, as T001 did: this programme's premises have been
narrowed by measurement in every milestone of Generation 3 so far.

## User rulings

A10 and A11 stand: the design system is Generation 4 and is a subset bounded by shipped usage; the "Storybook" feature
set is the tool's own browsing of a Storybook app, not the design system's stories.

## Still unknown

- Whether a route that binds a title is producible on the portal under an opt-in provider; T001 measured the shipped app
  only.
- Whether `no-title-observed` should be a fifth reason. T002 answered `no-record` for a record with no title value and
  flagged it as a decision above its task.
