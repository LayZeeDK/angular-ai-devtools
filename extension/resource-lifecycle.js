// resource-lifecycle.js — runs in the page's isolated world beside agent-main.js.
// The join between the resource state machine the signal graph labels and the finding the panel
// renders. A fact goes in — the identity the graph names the resource by, the `status` value the
// caller read, the params status, and whether the label read itself succeeded — and a finding or a
// `cannot-tell` state comes out, with no DOM, no clock, no console and no network in this file.
//
// `resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?,
// params?, reason? }`, where `reason` is one of `no-resource`, `labels-unreadable`,
// `params-unavailable`, `status-unavailable`.
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
// The one distinction this module exists for: a resource whose params produced nothing is idle by
// design, while a resource whose loader has not answered is still loading. Naming the second when
// the first is true sends a developer hunting a bug that is not there. Idle is read as a status
// value — the graph reports `status: 'idle'` for `IdleResource` because its params expression
// returns `undefined`, and an undefined request is what the state computation turns into `idle` —
// so nothing here is inferred from a thrown `ResourceParamsStatus.IDLE`.
//
// The status strings are the ones the graph reports — `loading`, `resolved`, `error`, `idle` — and
// they are echoed rather than renamed: the resource is named as the graph names it, never by a
// friendlier name, and `error` is `error`, not `errored`.
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  // The four status values the state machine reports, as `Resource#<name>.status` labels them, and
  // the same four the params status carries. A value outside this set is not a read.
  const LOADING = 'loading';
  const RESOLVED = 'resolved';
  const ERROR = 'error';
  const IDLE = 'idle';
  const STATUSES = [LOADING, RESOLVED, ERROR, IDLE];

  // What an idle finding puts in `params`: the params produced nothing, so the resource was never
  // asked to start. The words are the measured meaning of the state, not a guess about the loader.
  const IDLE_BY_DESIGN = 'idle (by design)';

  // A string that says something, or null. The resource identity and the params status are echoed
  // exactly as the caller read them; an absent, empty or non-string one is nothing to name.
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

    // No status, or a status outside the four the state machine reports: the read did not happen,
    // so this is the case that must be answered with `cannot-tell` rather than with a guess.
    const status = readString(read.status);
    if (status === null || STATUSES.indexOf(status) === -1)
      return cannotTell('status-unavailable');

    // The by-design case, decided from the status the graph reports and from a params status of
    // `idle` alike: params that produced nothing mean the resource was never asked to start. It
    // says so, and it says neither that a request is running nor that anything failed.
    if (status === IDLE || read.params === IDLE)
      return finding(resource, status, IDLE_BY_DESIGN);

    // Any other status is reported only with the params status that produced it, and only when
    // that status is one the state machine reports. An unread params status is an absence, not an
    // empty column: the finding would be half a finding.
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
