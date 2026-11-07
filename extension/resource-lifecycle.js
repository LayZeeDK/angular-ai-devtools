// resource-lifecycle.js — runs in the page's isolated world beside agent-main.js.
// The join between the resource state machine the signal graph labels and the finding the panel
// renders. A fact goes in — the identity the graph names the resource by, the `status` value the
// caller read, the params status, and whether the label read itself succeeded — and a finding or a
// `cannot-tell` state comes out, with no DOM, no clock, no console and no network in this file.
//
// `resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?,
// params?, reason? }`, where `reason` is one of `no-resource`, `labels-unreadable`,
// `params-unavailable`, `status-unavailable`, and `resource-unnamed` for a value in the identity
// slot that is not the shape the graph labels.
//
// Two things this module must never say, because neither is readable from what it is handed:
//
//   - It never names a cause inside the loader. The loader's own promise is not among the labelled
//     fields (`research/raw/m036-resource-graph.json` records `.extRequest`, `.isLoading`,
//     `.loadEffect`, `.state`, `.status`, `.value` and, for some subjects, `.stream` and `.error`),
//     so a resource whose request has not answered is reported as the status the graph reports and
//     nothing more. Where the status itself could not be read, the answer is `cannot-tell` with
//     `status-unavailable`, never a claim about a stuck request.
//   - It never reports a verdict. Whether the developer should wait, fix an error or look at their
//     params is not a field, and the finding stops where the read stopped.
//
// The first distinction this module exists for: a resource whose params produced nothing is idle by
// design, while a resource whose loader has not answered is still loading. Naming the second when
// the first is true sends a developer hunting a bug that is not there. Idle is read as a status
// value — the graph reports `status: 'idle'` for `IdleResource` because its params expression
// returns `undefined`, and an undefined request is what the state computation turns into `idle` —
// so nothing here is inferred from a thrown `ResourceParamsStatus.IDLE`.
//
// The status strings are the ones the graph reports — `idle`, `loading`, `reloading`, `resolved`,
// `error` — and they are echoed rather than renamed: the resource is named as the graph names it,
// never by a friendlier name, and `error` is `error`, not `errored`.
//
// `reloading` is the fifth, and it is not `loading`: `projectStatusOfState` reports the first load
// of a resource as `loading` and its reload as `reloading` (`_resource-chunk.mjs:504`,
// `state.extRequest.reload === 0 ? 'loading' : 'reloading'`). A resource whose spinner outlives a
// first response is in the second state, so collapsing the two would answer the milestone's own
// question with the wrong word. The finding names the reload; the status value is the graph's.
//
// The identity is the one field a caller could fill with anything, so it is gated to the shape the
// graph emits. `createDebugNameObject` (`_resource-chunk.mjs:514-518`) builds
// `Resource${name ? '#' + name : ''}.${part}`, so a named resource's nodes are
// `Resource#<name>.<part>` and the identity a finding carries is the `Resource#<name>` prefix. A
// bare `Resource` is the same function with no name — there is nothing to name — and any other
// string in that slot (a cause, a loader name, a verdict) was never emitted by the graph at all.
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  // The status values a load passes through, as `Resource#<name>.status` labels them, and the same
  // five the params status carries. A value outside this set is not a read. The public
  // `ResourceStatus` union (`@angular/core` `types/_api-chunk.d.ts:149`) declares one more, `local`,
  // which is a value written by `.set()`/`.update()` rather than the outcome of a request; no
  // request passes through it, so this join does not name it.
  const IDLE = 'idle';
  const LOADING = 'loading';
  const RELOADING = 'reloading';
  const RESOLVED = 'resolved';
  const ERROR = 'error';
  const STATUSES = [IDLE, LOADING, RELOADING, RESOLVED, ERROR];

  // What an idle finding puts in `params`: the params produced nothing, so the resource was never
  // asked to start. The words are the measured meaning of the state, not a guess about the loader.
  const IDLE_BY_DESIGN = 'idle (by design)';

  // What a reloading finding puts in `params`: the status says a fresh value was asked for the same
  // reactive dependencies while the previous one is still held, which is the meaning Angular's own
  // `ResourceStatus` gives `reloading` (`types/_api-chunk.d.ts:137-139`). It names the reload, so a
  // reader cannot mistake it for a first load, and it says nothing about why the reload was asked
  // for or when it will answer.
  const RELOADING_SAME_DEPS =
    'reloading (a fresh value for the same dependencies)';

  // The shape the graph labels a resource by: `Resource#<name>`, with a name. The graph also emits
  // a bare `Resource` when a resource carries no `debugName`, and that is an identity with nothing
  // in it — refused as `resource-unnamed` along with any other string that is not this shape.
  const RESOURCE_IDENTITY = /^Resource#\S+$/;

  // A string that says something, or null. The params status is echoed exactly as the caller read
  // it; an absent, empty or non-string one is nothing to name.
  function readString(value) {
    if (typeof value !== 'string') return null;
    if (value.trim() === '') return null;
    return value;
  }

  // One finding, built in one place so a pin on its fields is a pin on every finding. It carries
  // exactly the four fields the contract names, and no branch in this file can add a fifth: this
  // object literal is the whole vocabulary a finding has.
  function finding(resource, status, params) {
    return {
      state: FINDING,
      resource: resource,
      status: status,
      params: params,
    };
  }

  // One absence, with its reason and nothing else: no resource, no status and no params, so a
  // caller cannot render a finding out of what was not read.
  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // The join. `fact` is what the caller read: `resource` (the identity the graph labels, e.g.
  // `Resource#IdleResource`), `status` (the value of `Resource#<name>.status`), `params` (the params
  // status the caller read, or its absence) and `labels` (`false` when the label read itself was
  // withheld). Anything else on the fact is ignored, so a caller cannot smuggle a cause or a verdict
  // into the finding through this function.
  function resourceLifecycle(fact) {
    const read = fact || {};

    // The label read itself was withheld or failed. Nothing else in the fact can be trusted, so
    // nothing else is read: there is no resource to name and no status to report.
    if (read.labels === false) return cannotTell('labels-unreadable');

    // No resource: the page holds no resource node the caller could name. A finding is never
    // invented from a status that arrived without one.
    const resource = readString(read.resource);
    if (resource === null) return cannotTell('no-resource');

    // An identity the graph does not label: `Resource#<name>` is the only shape a resource node is
    // given, so anything else in this slot is not an identity. It is refused rather than echoed —
    // a cause in this slot must not reach a finding through the field that names the subject.
    if (!RESOURCE_IDENTITY.test(resource))
      return cannotTell('resource-unnamed');

    // No status, or a status outside the five a load passes through: the read did not happen, so
    // this is the case that must be answered with `cannot-tell` rather than with a guess.
    const status = readString(read.status);
    if (status === null || STATUSES.indexOf(status) === -1)
      return cannotTell('status-unavailable');

    // The reload: the same reactive dependencies asked for a fresh value while the previous one is
    // still held. The status itself carries the meaning, so the finding states it — in the reload's
    // own words, never in the words of a first load.
    if (status === RELOADING)
      return finding(resource, status, RELOADING_SAME_DEPS);

    // The by-design case, decided from the status the graph reports and from a params status of
    // `idle` alike: params that produced nothing mean the resource was never asked to start. It
    // says so, and it says neither that a request is running nor that anything failed.
    if (status === IDLE || read.params === IDLE)
      return finding(resource, status, IDLE_BY_DESIGN);

    // Every remaining status — `loading`, `resolved`, `error` — is reported only with the params
    // status that produced it, and only when that status is one the state machine reports. An unread
    // params status is an absence, not an empty column: the finding would be half a finding. Idle
    // and reloading were answered above, because each of those statuses carries its own meaning and
    // needs no second reading to say it.
    const params = readString(read.params);
    if (params === null || STATUSES.indexOf(params) === -1)
      return cannotTell('params-unavailable');

    return finding(resource, status, params);
  }

  const namespace = { resourceLifecycle: resourceLifecycle };

  if (globalThis.angularAiResourceLifecycle) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiResourceLifecycle, namespace);
  } else {
    globalThis.angularAiResourceLifecycle = namespace;
  }
})();
