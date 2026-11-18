---
id: T001
title: Measure what the page agent can name and where it can name nothing
wave: 1
status: done
deps: []
agent: build_T001
base: 84704872b6dc221aae4b0dea41bced9672584c79
worktree: null
task_branch: null
files:
  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs
---

# T001 — Measure what the page agent can name and where it can name nothing

## Context

The roadmap says the panel reads a component tree the page agent already captures. Measured at
`9aa6e960`, no such tree exists: `extension/agent-main.js` reads a component per element through
`el.__ngContext__` and `ng.getComponent`, and its profiler events record `componentName: null` when
the profiler passed no instance. This task records what the agent can actually name, and where it
can name nothing, so the milestone's criteria rest on a reading rather than on the roadmap sentence.

## Approach

Record, for each source the agent has, the name it yields and the line that yields it, plus the
absence cases: an element with no `__ngContext__`, a production build that carries none, and a
profiler event that passed no instance. Write the record to
`research/raw/m047-names-and-absences.json` and pin it with one suite that reads the record and
asserts at least one source yields no name. Build nothing; the filter is T002's.

## Intent coverage

- SC1
- SC2

## Interface contract

None

## Files

  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs

## Acceptance criteria

1. The record names, per source, the text the agent yields and the path and line that produces it, and names the absence cases it found with the same precision.
2. The suite fails when the record claims a source yields a name for a case in which the measured code yields none.

## Verify

```bash
node --test scripts/component-search.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m047-names-and-absences.json','utf8'))" && npx prettier --check scripts/component-search.test.mjs research/raw/m047-names-and-absences.json
```

## Log

- pending.
- 2026-11-17 — measured at `84704872b6dc221aae4b0dea41bced9672584c79` (`git rev-parse HEAD`): `extension/agent-main.js` carries nine name readers and eight absence cases, recorded at path:line in `research/raw/m047-names-and-absences.json`. Eight readers yield a page name — host tag :781, class name :799, entry name :793, pick tag :1306, pick class :1310, pick ancestor path :1335, enumerated class :887, error class :2516 — and the ninth yields the literal word `component` (:763). The absences: the picker's three named states (:1372 `no-dev-api` for no `__ngContext__`, :1364 `no-dev-api` for no debug API, :1374 `no-component`), the agent not installing (:509 `waiting`, :531 `notsupported`), a profiler event that passed no instance (:792, recorded as `componentName: null` at :700), an empty enumeration (:862) and a null reader answer (:785).
- 2026-11-17 — two established facts corrected by measurement rather than restated: a production build carries `__ngContext__` and lacks `window.ng` (`research/raw/m022-ng-context.json:179,181`; code at :529, :862, :1364), so the production-page absence is `no-dev-api` and not `no-dev-context`; and `el.__ngContext__` is read at :1367 only — :1283 is the reason sentence, :1739 reads `node.__ngContext__`. INTENT.md's "the word `component` appears 69 times" is not reproduced: 48 lowercased, 80 any case, 30 whole-word case-insensitive.
- 2026-11-17 — the premise itself, measured: the page agent holds no component tree. `enumerateComponentNodes` (:851) pushes one flat node per class (:896, `component: cls` at :906) with no parent or child field, `children` occurs zero times in the file, the only edges are the signal graph's consumer/producer pairs (:1003), and the initial record passes `edges: []` (:1429). `apps/angular-ai-devtools/src/app/app.routes.ts` declares 26 routes — 5 with `component:`, 21 with `loadComponent:`, none with a `components:` or `children:` key.
- 2026-11-17 — `scripts/component-search.test.mjs` (8 tests) pins the record: every citation to its line, every `yieldsName` claim to the shape of the line it cites, the call sites of `componentNameFor`/`instanceNameFor`/`hostOrClassName`, the `children` count and the two route keys, and it refuses three doctored records and a citation one line off. Nothing in it tests T002's filter, which does not exist yet.
- 2026-11-17 — commands: `git rev-parse HEAD`; `node --test scripts/component-search.test.mjs` (tests 8, pass 8, fail 0); the Verify chain `node --test scripts/component-search.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m047-names-and-absences.json','utf8'))" && npx prettier --check scripts/component-search.test.mjs research/raw/m047-names-and-absences.json` (exit 0, `All matched files use Prettier code style!`); `node -e` counts over `extension/agent-main.js` and `app.routes.ts`; and an out-of-band AC2 run that doctored `no-dev-context` to claim `yields: "app-counter"` — suite `pass 6 / fail 2`, `AssertionError: absences[no-dev-context] cites a descriptor's named state and cannot be a page name` — after which the record was restored byte-identical (30083 bytes).
- Landed paths: `research/raw/m047-names-and-absences.json`, `scripts/component-search.test.mjs` — each is read from this tree, ready.
