# INTENT — M059 teardown-leak

Lane: standard
Milestone: M059 · teardown-leak · Generation 3
Branch: gsd-path/M059
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a destroyed component still changes state by naming the runtime diagnostic that
records the write after teardown — the code the console carries, the message body, and the owning
component only where the record actually attributes one — and by naming, instead, the handle identity
this agent does not hold. The panel is the only surface: the answer is read there and nothing is asked
of the inspected page (`.project/ROADMAP.md:2101`, `.project/ROADMAP.md:2104`).

The roadmap's premise that the answer names "the subscription, effect or timer that outlived it"
(`.project/ROADMAP.md:2094`) was measured before this surface was shaped, and it does not hold (C1):
no record in this repository carries a per-injector handle, and building one would be the page-side
instrumentation the same entry forbids in its own second criterion. What the agent does hold is the
console stream, and Angular's own `NG0205` — "Injector has already been destroyed" — is the diagnostic
a post-teardown write leaves behind (C2). C1, C2 and C3 decide what an answer may cite, so the six
criteria below are the question the evidence supports: the answer names the diagnostic and its code,
names the absence where the message does not carry an owner, and never manufactures a handle identity.

## Verification target

Every claim of this milestone is verified on the Insurance Portal first
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served via
`control-angular-dev-app up --target portal`), whose recorded console surface is the one
`research/raw/m045-console-shapes.json` enumerates: 64 digest codes including `NG0205`, captured from a
page whose console stream the extension already subscribes to (`extension/agent-main.js`), with the
panel reading that stream and nothing else.

Whether a post-teardown write is producible at all is the milestone's first measurement, not an
assumption: no capture in `research/raw/` has ever recorded `NG0205` on a page — the only two
occurrences are the digest's own enumeration (`research/raw/m045-console-shapes.json:192`,
`:561`) — so T001 measures whether a component that holds a handle past its own destroy can be driven
to emit it on the portal, and records the answer either way.

A fixture is used only when the portal lacks the shape the claim needs, and a verdict that reaches a
fixture names the portal route tried and the artefact the portal lacks. The one fixture shape this
milestone may need is a component deliberately written to touch its injector after teardown:
`spikes/ng222-app` carries `src/app/stale-view-fixture.ts` under an owner ruling
(`AGENTS.md`, "Verification fixtures"), and a second such fixture is a fixture change of the same kind
and needs a ruling of the same kind before a verdict cites it.

## Corrections

- C1 2026-11-21: The roadmap's Goal promises an answer naming "the subscription, effect or timer that
  outlived it" (`.project/ROADMAP.md:2094`), and no such handle record exists. Measured: `handleRecord`,
  `postDestroy` and `leakedHandle` appear **zero** times across `extension/*.js` and `scripts/*.mjs`
  (0/38 modules), `handleRecord` and `postDestroy` appear **zero** times across the 100+ recordings in
  `research/raw/*.json`, and the only `.unsubscribe(` sites in the tree are `extension/agent-main.js:1858`
  and `:2435`, both the agent's own subscriptions torn down on its reset path. Nothing intercepts
  `setTimeout`, `subscribe` or `effect` on the inspected page: `setTimeout =` matches 0 of 38 extension
  modules, and the module whose subject is lifecycle, `extension/resource-lifecycle.js:130`, answers a
  `resource()` fact (`status`, `value`) rather than a handle. Measured verdict: the entry's first
  observable does not exist, and creating it is the "new page-side instrumentation" its own SC2 forbids
  (`.project/ROADMAP.md:2099`). The criterion that asked the answer to name a handle is rewritten in its
  place: the answer names the diagnostic the console carries and states the absent handle record as its
  own named absence (SC1, SC4).
- C2 2026-11-21: Angular's own diagnostic for a post-teardown touch exists and is already in this
  repository's digest: `extension/error-digest.json` carries 64 codes, one of which is
  `{"code": "NG0205", "title": "Injector has already been destroyed"}`, enumerated from the installed
  framework rather than typed by hand and pinned by a hash (`research/raw/m045-console-shapes.json:192`,
  the digest hash assertion in `scripts/panel-copy.test.mjs`). Measured verdict: a code and a message body
  are citable from the record this agent already produces, and nothing in it names a subscription.
- C3 2026-11-21: The console record's shape is what M032 and M045 measured, not a new capture: a message
  carries `code`, `message` and its level, and the panel's console join already keeps the code, the body
  with the stack stripped, and the count (`extension/lint-core.js`, `extension/console-join.js`). Measured
  verdict: an answer can name the code and the body, and where the record carries no component identity —
  which `NG0205`'s body does not, since it names the injector "has already been destroyed" and no owner —
  the answer must say so rather than attribute the message to the last component it saw (SC1, SC4).

## Success criteria

1. A component that touches its injector after teardown produces a finding naming the code `NG0205` and
   the message body the record carries, and naming the owning component only where the record attributes
   one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the
   code instead of guessing the element or the component (`.project/ROADMAP.md:2096`,
   `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that
   attributes the message to the most recent component, redden.

2. The answer is produced from the observables the agent already holds — the console record it subscribes
   to, and the element/component record it already keeps — with no new page-side instrumentation, no
   second tap and nothing the record does not carry (`.project/ROADMAP.md:2099`); a mutant that starts
   its own subscription, hooks `setTimeout` or reads a live page value reddens.

3. An unsubscribe that ran before the write it was meant to prevent reports no leak rather than a wrong
   cause (`.project/ROADMAP.md:2102`): where the record shows the handle was released and the diagnostic
   still arrives, the answer names the sequence it read and the code, and names no handle as the cause; a
   mutant that renders "leaked subscription" for a released handle reddens.

4. The answer never names a subscription, effect or timer identity: it names the code, the message body,
   and the absence `handle-record-not-held` — a mutant that renders any handle name, or that infers one
   from the message body, reddens (C1, C2).

5. The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and
   every suite that enumerates those tables is updated in the same task: `app.spec.ts`,
   `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`,
   `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant
   that adds the route without a loader key reddens naming the surface.

6. The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to
   the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant
   that installs a page-side hook for this answer reddens.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A message with a code and no owner and a message with a code and an owner render through one read: `NG0205`'s body names the injector only (`extension/error-digest.json`), so the owner half is read from the record's own attribution where it exists, never from arrival order. |
| E2 | SC1 | empty | criterion SC1 | A record with no `NG0205` at all is a named absence, not "no leak found": the answer states the code it looked for and the count it read, the shape `extension/router-diagnostic.js:8-9` already uses for "compared and not found". |
| E3 | SC2 | boundary | criterion SC2 | The portal's console stream is the default target and the fixture is a fallback that must name the portal route tried and the artefact it lacks, exactly as M058's E8 records. |
| E4 | SC3 | precision | criterion SC3 | A released handle followed by the diagnostic is rendered as the sequence the record states — release, then diagnostic — and never as a leak the release contradicts. |
| E5 | SC3 | adjacency | criterion SC3 | `handle-record-not-held` and `owner-not-in-the-message` are two states and never one line: a message with a code, no owner and no handle record renders both absences separately. |
| E6 | SC4 | precision | criterion SC4 | No remedy is invented: the answer may name a modern Angular pattern or an official schematic and nothing more (`.project/ROADMAP.md:2105`). |
| E7 | SC5 | ordering | criterion SC5 | The new surface's route, loader key and digest rows are added in one task, and the suites that enumerate those tables are declared in that task's `files:` — five prior milestones paid for the omission. |
| E8 | SC6 | boundary | criterion SC6 | The panel-only rule is the one the other 28 surfaces keep: the answer is read in the panel and nothing is written into the inspected page (`apps/angular-ai-devtools/src/app/app.routes.ts` `PANEL_SURFACES`, 28 entries at this head). |
| E9 | SC1 | idempotency | criterion SC1 | A second answer over the same record names the same code, the same message and the same absences; the record is read-only and no capture runs on a default run. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | name a subscription, an effect, a timer, a component or an element the record does not attribute — including inferring one from the message body, from the stack, or from which component was last mounted | criterion SC1 | Grounded in C1 and C2; the reviewer reads every identity the answer renders back to the field that carries it. |
| N2 | SC2 | install page-side instrumentation of any kind — patch `setTimeout`, wrap `subscribe`, hook `effect`, add a listener to the inspected page — for this answer | criterion SC2 | `.project/ROADMAP.md:2099`; the reviewer greps the diff for any such write and for a second tap. |
| N3 | SC3 | render a released handle as a leak, or a leak as released, when the record states the release | criterion SC3 | Grounded in the entry's own third criterion (`.project/ROADMAP.md:2102`). |
| N4 | SC4 | fabricate a handle identity to satisfy the roadmap's sentence, including a synthetic record that claims one | criterion SC4 | Grounded in C1; a milestone that manufactures its own observable has measured nothing. |
| N5 | SC5 | add the surface to the route table, the `LOADERS` map or the digest without updating every suite that enumerates those tables in the same task | criterion SC5 | Five prior milestones landed a stale pin for exactly this omission; the reviewer runs `lars-gsd plan-lint` and reads the `pinned-file` rows it reports as blockers. |
| N6 | SC6 | answer from anything the inspected page must supply at read time — a page global, a DOM node, a widget or a second tap | criterion SC6 | AR-6 and AR-3; the reviewer greps the diff for a page-side write and checks the panel is the only surface that changed. |

## Constraints

- Read-only on the inspected page: no DOM, no page global, no live page read for this answer (AR-3).
- One new surface; every table suite declared in the task that changes the table.
- No capture runs on a default run: `M059_CAPTURE=1` is opt-in, and a default run reads the record.
- `@angular/animations` and Angular SSR remain out of scope (A5).
