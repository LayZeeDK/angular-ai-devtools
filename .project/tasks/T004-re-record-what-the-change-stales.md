---
id: T004
title: Re-record everything the fixture change stales
wave: 2
status: pending
deps:
  - T001
  - T003
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/companion-dev-build.json
  - research/raw/m022-ng-context.json
  - research/raw/m033-verdict-claims.json
  - scripts/facade-dev-build.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
---

# T004 — Re-record everything the fixture change stales

## Context

T001 adds a fixture page and a route; T003 adds a panel route. In this programme that combination has staled three
classes of recording every time: the two control-skill feature manifests, both development-build recordings, and
`m030-router-config.json` (declared by T001, which added the route). The milestone also needs its own verdict claims so
`overlay-verdict-claims.test.mjs` can find them.

M032's T004 showed the trap to avoid: a recording whose byte count moves while its content hash does not was nudged,
not measured.

## Approach

Re-record each artefact through its own tool — `fingerprint.mjs record` for the manifests, the suites' own measured
builds for the development-build recordings, and `gsd verdict-record` for the claims. Clear each build's output path
before measuring it and record that fact.

Where two recordings describe the same build, require them to agree, and say why if they do not.

## Interface contract

None

## Files

- Both `.proven.json` manifests — re-recorded, naming the new fixture page.
- `research/raw/companion-dev-build.json` — re-measured from a cleared output path.
- `research/raw/m022-ng-context.json` — re-measured, dev and production.
- `research/raw/m033-verdict-claims.json` — the milestone's claims.
- The three suites that read them.

## Acceptance criteria

1. Both manifests name the fixture module this milestone added.
2. Both development-build recordings are re-measured with the output path cleared first, and each says so.
3. The milestone's verdict claims quote each criterion in full, character for character.
4. No recorded value is nudged to fit: a production bundle hash that did not move means the build did not change, and
   the task says which it observed.
5. `npm run check` and `npm test` pass at the head.

## Verify

```bash
node --experimental-strip-types --test "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"
```

## Intent coverage

- SC5

## Log

- dispatched
