# FINAL — M067 formfield-binder

Reviewed HEAD: 4150bf7565ac8a1736d1ed602208601e58373f74
Branch: gsd-path/M067 · Milestone: formfield-binder

Overall verdict: pass

## Success criteria

### SC1 — A field that hosts a control different from the one its record expects produces a finding naming both the hosted control and the expected one; a mutant that reports only the hosted control reddens it.

- **Verdict**: met

- **Check**: A field that hosts a control different from the one its record expects produces a finding naming both the hosted control and the expected one; a mutant that reports only the hosted control reddens it.

- **Observed**: The join answers `mismatch` only when both controls are present, and names both: the mutant that reports the hosted control alone reddens with "the two controls are what a caller compares, and one of the two is not in the answer". The committed record answers `cannot-tell` naming the unread expectation for the three fields that host an element, which is the honest answer rather than a fabricated comparison.

- **Reference**: `extension/field-binder.js`, `scripts/field-binder.test.mjs` (mutant `onlyHosted`)

- **Finding**: No defect.

- **Fix direction**: None required.

### SC2 — A field that is not a components field at all — a plain input, or an element with no hosting field — reports that absence with its reason rather than naming a control it was not given; a mutant that infers a host reddens it.

- **Verdict**: met

- **Check**: A field that is not a components field at all — a plain input, or an element with no hosting field — reports that absence with its reason rather than naming a control it was not given; a mutant that infers a host reddens it.

- **Observed**: A field that hosts nothing answers `no-host` with `hosts-no-element`; the mutant that reads a host off the field identity reddens with "a host read off a label, a placeholder or a class is not a host any reading took". Across the four portal fields the record never infers a control it did not read.

- **Reference**: `extension/field-binder.js` (the `no-host` branch), `scripts/field-binder.test.mjs` (mutant `inferHost`)

- **Finding**: No defect.

- **Fix direction**: None required.

### SC3 — The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.

- **Verdict**: met

- **Check**: The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.

- **Observed**: `research/raw/m067-field-binder.json` carries the identity the field tree reports for all four fields, asserted against a live run of `extension/field-state.js` rather than reproduced, and the record is written only by its armed run: the default run hashes it before and after and moves no byte.

- **Reference**: `scripts/field-binder-record.test.mjs`, `research/raw/m067-field-binder.json`

- **Finding**: No defect.

- **Fix direction**: None required.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no control it was not given.

- **Verdict**: met

- **Check**: The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no control it was not given.

- **Observed**: `panel-field-binder.ts` renders the join's five keys and nothing else. The route table moved 36 to 37, the ordered pins 45 to 46, `LOADERS`/`FACTS` 36 to 37, and the copy record to 37/37/46 in the same landing; the project verify ran green at the final head (2290 + 60 + 320 tests, 0 failures).

- **Reference**: `apps/angular-ai-devtools/src/app/panel-field-binder.ts`, `scripts/panel-routes.test.mjs`

- **Finding**: No defect.

- **Fix direction**: None required.
