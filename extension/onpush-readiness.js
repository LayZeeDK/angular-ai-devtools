// onpush-readiness.js — runs in the page's isolated world beside agent-main.js.
// The join between the strategy the component def reports and the readiness facts the caller read.
// A fact goes in — the component name, the def's `onPush` boolean, and the inputs the caller read
// from `inputConfig` — and a finding or a `cannot-tell` state comes out, with no DOM, no clock and
// no console in this file.
//
// Two things this module must never do, because neither is derivable from the metadata:
//
//   - It never reports a blocker. Nothing on the def records in-place mutation, async-pipe use or a
//     signal subscription, so "this component is not ready" would be a guess.
//   - It never reports a verdict. "Safe for OnPush" is not a field; the finding states the strategy
//     and the readiness facts and stops there.
//
// Angular 22 derives `onPush` as `changeDetection !== ChangeDetectionStrategy.Eager`
// (fesm2022/_debug_node-chunk.mjs), and the def carries no `changeDetection` field on either shipped
// version. A component that declares no strategy is OnPush on this version, so `onPush: true` is
// the already-OnPush case, including a component that declared nothing. `onPush: false` is the one
// case a component declared `ChangeDetectionStrategy.Default` explicitly — Default is a deprecated
// alias of Eager — and it runs eagerly, which is the subject this module reports on.
//
// An absent or non-boolean `onPush` is `cannot-tell` / `strategy-unreadable`, never the panel's old
// fail-open `onpush` (extension/agent-main.js:660-671). A read with no selected component is
// `cannot-tell` too: the module never infers a strategy or a component from a name, a file or a
// selector.
//
// Signal inputs are the one readiness fact the def exposes: `inputConfig` marks them
// `[InputFlags.SignalBased, "name"]`. Signal outputs are not distinguishable — no OutputFlags exists
// in the package — so no output fact is ever promised.
(function () {
  // The runtime strategy `onPush: false` names. `ChangeDetectionStrategy.Default` is the alias the
  // compiler emits as `changeDetection: 1`; the view runs eagerly either way.
  const EAGER = 'eager';

  // One readiness fact per input the caller read as signal-based. An input that is not marked
  // signal-based is not a readiness fact and is never claimed; an entry with no usable name cannot
  // be named, so it is not claimed either. Outputs are never read, so none appears here.
  function signalInputFacts(inputs) {
    if (!Array.isArray(inputs)) return [];
    const facts = [];
    for (const input of inputs) {
      if (!input || typeof input !== 'object') continue;
      if (input.signalBased !== true) continue;
      const name = input.name;
      if (typeof name !== 'string' || name.trim() === '') continue;
      facts.push('input "' + name + '" is signal-based');
    }
    return facts;
  }

  // The join. `fact` is what the caller read: `component` (the name it will render), `onPush` (the
  // def's boolean, or its absence) and `inputs` (the entries it read from `inputConfig`, each with a
  // `name` and a `signalBased` boolean). Anything else on the fact is ignored, so a caller cannot
  // smuggle a strategy, a blocker or a verdict into the finding through this function.
  function onpushReadiness(fact) {
    const read = fact || {};
    const onPush = read.onPush;
    // Absence and a non-boolean are the same thing here: nothing was read. Never fail open.
    if (typeof onPush !== 'boolean') {
      return { state: 'cannot-tell', reason: 'strategy-unreadable' };
    }
    // Angular 22: no declared strategy means OnPush. There is nothing left to find.
    if (onPush === true) {
      return { state: 'cannot-tell', reason: 'already-onpush' };
    }
    // `onPush: false` is a finding only if it can name the component it is a finding about.
    const component = read.component;
    if (typeof component !== 'string' || component.trim() === '') {
      return { state: 'cannot-tell', reason: 'component-unreadable' };
    }
    return {
      state: 'finding',
      component,
      strategy: EAGER,
      facts: signalInputFacts(read.inputs),
    };
  }

  const namespace = { onpushReadiness };

  if (globalThis.angularAiOnpushReadiness) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiOnpushReadiness, namespace);
  } else {
    globalThis.angularAiOnpushReadiness = namespace;
  }
})();
