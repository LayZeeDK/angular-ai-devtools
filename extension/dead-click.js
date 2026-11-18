// dead-click.js — the join behind M050: the record judged for a start whose consequent never
// arrived, or refused.
//
// T001 measured (`research/raw/m050-chains.json`) three consequence chains and narrowed the
// judgement to one:
//
//   - the router's chain is judgeable. `NavigationStart` and its terminal carry the navigation's
//     own `id` (extension/agent-main.js:1639), the shipped reader identifies a navigation by that
//     id "and never by its position" (extension/navigation-narrator.js:451–:455), and every
//     record publishes the whole cumulative `routerEvents` list (:1050 through `routerEventList`,
//     :1672). A start whose id no terminal in the window carries is therefore a finding.
//   - the work chain is refused. `pair` and `end` (:697, :698) name a family and a side and
//     identify no particular start; `ComponentStart` carries no identity (:620), so two open
//     starts differ only in `at`, and pairing them would be pairing by position (N3). The file
//     says so itself (:637). Its reason is `work-chain-unjudgeable`.
//   - the boundary chain is refused. `boundaryReset` is a presence bit on the arrival that
//     carries it (:2069), not a later event, and the record keeps no reset at all, so there is no
//     consequent that could be absent. Its reason is `boundary-chain-unjudgeable`.
//
// Both refusals are answers with their own reason, exported as `REFUSALS`, not silent omissions.
//
// The window is the `routerEvents` list the record publishes: the latest record carries every
// arrival so far and holds no marker that the list is final, so a finding is true as of the record
// it was read from and a later record can carry the terminal. Every finding names that window.
//
// The answer is one object:
//
//   deadClick(record) -> { state, findings, considered, reason }
//
// `state` is `findings` when at least one router start has no terminal in the window, `clean` when
// the window holds starts and every one of them has a terminal, and `cannot-tell` when the record
// does not bound a window at all or holds no navigation the judgement can pair. `reason` is
// present only for `cannot-tell` and is one of `REASONS`. `findings` is an array of
// `{ chain, event, window }`: `chain` is `router`, `event` is the start entry's own recorded
// fields copied as they stand (no cause, handler, component or remedy is added), and `window`
// names the list and the length the judgement used, with `final: false`. `considered` counts every
// entry the record publishes in the three streams T001 measured — `routerEvents`, the work
// stream's `events` and `boundary.entries` — whether or not that entry belongs to a judged pair.
// An event outside every judged pair is counted and never reported, and the entries of the two
// refused chains are counted and never reported because those chains are refused.
//
// A `NavigationStart` with no measured `id` opens nothing (navigation-narrator.js:451–:453), and a
// second start for an `id` already recorded is not a second navigation (E3), so neither is a
// finding. Any of the four terminal classes ends a navigation — `NavigationEnd`, `NavigationCancel`,
// `NavigationError` and `NavigationSkipped` (navigation-narrator.js:149–:154) — so a start with no
// `NavigationEnd` may have ended as a cancel, an error or a skip, and is dangling only when none
// of the four carries its id.
//
// This module is a reader of the record it is handed and of nothing else: no imports, no DOM, no
// clock, no console, no network and no page global beyond the one namespace below, so a bare
// node:vm context with nothing in it is enough to run it (which the suite proves). It holds no
// state between calls, never sorts, and answers the same findings in the same order for the same
// record twice.
(function () {
  'use strict';

  // The three verdicts a judgement carries.
  const FINDINGS = 'findings';
  const CLEAN = 'clean';
  const CANNOT_TELL = 'cannot-tell';

  // The three streams T001 measured, by the names the record and the record file give them.
  const ROUTER = 'router';
  const WORK = 'work';
  const BOUNDARY = 'boundary';
  const CHAINS = Object.freeze([ROUTER, WORK, BOUNDARY]);

  // The class names, from the shipped reader (navigation-narrator.js:145, :149–:154): the record's
  // `type` is the event's own class name and never its number.
  const NAVIGATION_START = 'NavigationStart';
  const TERMINAL_CLASSES = Object.freeze([
    'NavigationEnd',
    'NavigationCancel',
    'NavigationError',
    'NavigationSkipped',
  ]);

  // The one window the judgement reads, as T001 measured it: the whole cumulative `routerEvents`
  // list a record publishes, bounded only by 512 kept arrivals, and never marked final.
  const ROUTER_EVENTS = 'routerEvents';
  const PUBLISHED_LIST = 'published-list';

  // The closed set of reasons a `cannot-tell` answer carries. The first three are the judgement's
  // own refusals about this record; the last two are the chains T001 measured and refused.
  const NO_WINDOW_BOUND = 'no-window-bound';
  const NO_NAVIGATION_RECORDED = 'no-navigation-recorded';
  const NO_START_RECORDED = 'no-start-recorded';
  const WORK_CHAIN_UNJUDGEABLE = 'work-chain-unjudgeable';
  const BOUNDARY_CHAIN_UNJUDGEABLE = 'boundary-chain-unjudgeable';
  const REASONS = Object.freeze([
    NO_WINDOW_BOUND,
    NO_NAVIGATION_RECORDED,
    NO_START_RECORDED,
    WORK_CHAIN_UNJUDGEABLE,
    BOUNDARY_CHAIN_UNJUDGEABLE,
  ]);

  // The two chains this judgement refuses, each with its own measured reason rather than a silent
  // omission. The router is the one chain T001 found judgeable (`answer.judgeable`).
  const REFUSALS = Object.freeze([
    Object.freeze({
      chain: WORK,
      state: CANNOT_TELL,
      reason: WORK_CHAIN_UNJUDGEABLE,
    }),
    Object.freeze({
      chain: BOUNDARY,
      state: CANNOT_TELL,
      reason: BOUNDARY_CHAIN_UNJUDGEABLE,
    }),
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A navigation id the record measured: a finite number and nothing else. `null`, a string and a
  // `NaN` are all the same absence here, and a pairing built on one would be a pairing nobody
  // recorded.
  function isMeasurement(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // The entry's own class name, or null. A blank name names no class, so it is read as no class
  // rather than as an empty one.
  function classOf(entry) {
    if (!isObject(entry)) return null;
    if (typeof entry.type !== 'string') return null;
    const type = entry.type.trim();
    return type === '' ? null : type;
  }

  // The start entry's own recorded fields, copied as they stand: no paraphrase, no summary, and no
  // cause the record does not state.
  function copyOf(entry) {
    const event = {};
    const keys = Object.keys(entry);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      event[key] = entry[key];
    }
    return event;
  }

  // The window the judgement used: the list it read, how many entries bounded it, and the measured
  // fact that the list is not final (T001: `window.final` is false for all three chains).
  function windowOf(length) {
    return {
      chain: ROUTER,
      field: ROUTER_EVENTS,
      kind: PUBLISHED_LIST,
      length: length,
      final: false,
    };
  }

  // Every entry the record publishes in the three streams T001 measured, counted whether or not
  // its class belongs to a judged pair. A stream the record does not carry as a list contributes
  // nothing: it holds no event to count.
  function consideredOf(record) {
    if (!isObject(record)) return 0;
    let count = 0;
    if (Array.isArray(record.routerEvents)) count += record.routerEvents.length;
    if (Array.isArray(record.events)) count += record.events.length;
    if (isObject(record.boundary) && Array.isArray(record.boundary.entries))
      count += record.boundary.entries.length;
    return count;
  }

  // The ids that carry a terminal anywhere in the window, read off each entry's own id and never
  // off a position: navigation-narrator.js:451–:455 identifies a navigation "by that id and never
  // by its position", and a terminal whose start the record does not carry is still that
  // navigation's own terminal (navigation-narrator.js:463–:467).
  function terminalsOf(events) {
    const terminals = new Set();
    for (let i = 0; i < events.length; i += 1) {
      const entry = events[i];
      if (TERMINAL_CLASSES.indexOf(classOf(entry)) === -1) continue;
      if (isMeasurement(entry.id)) terminals.add(entry.id);
    }
    return terminals;
  }

  // The contract's four fields. `reason` is present only for a refusal, so an answer that judges
  // carries no reason key at all rather than a reason that reads as a cause.
  function answer(state, findings, considered, reason) {
    const value = { state: state, findings: findings, considered: considered };
    if (state === CANNOT_TELL) value.reason = reason;
    return value;
  }

  // The judgement. `record` is what the page agent publishes; its `routerEvents` list is the one
  // window walked, and nothing else decides a finding.
  function deadClick(record) {
    const events =
      isObject(record) && Array.isArray(record.routerEvents)
        ? record.routerEvents
        : null;
    const considered = consideredOf(record);
    if (events === null)
      return answer(CANNOT_TELL, [], considered, NO_WINDOW_BOUND);
    if (events.length === 0)
      return answer(CANNOT_TELL, [], considered, NO_NAVIGATION_RECORDED);

    // One start per navigation id: the first `NavigationStart` the window carries for it, as the
    // shipped reader opens a navigation (navigation-narrator.js:453–:455). A start with no
    // measured id opens nothing, and a second start for an id already recorded is not a second
    // navigation (E3).
    const starts = new Map();
    for (let i = 0; i < events.length; i += 1) {
      const entry = events[i];
      if (classOf(entry) !== NAVIGATION_START) continue;
      const id = entry.id;
      if (!isMeasurement(id) || starts.has(id)) continue;
      starts.set(id, entry);
    }

    const terminals = terminalsOf(events);

    // A window that opens no navigation answers the absence: there is no start to be dangling, and
    // a clean answer would read as a page with nothing wrong in it (SC2, E3).
    if (starts.size === 0)
      return answer(CANNOT_TELL, [], considered, NO_START_RECORDED);

    const findings = [];
    for (const [id, entry] of starts) {
      if (terminals.has(id)) continue;
      findings.push({
        chain: ROUTER,
        event: copyOf(entry),
        window: windowOf(events.length),
      });
    }

    if (findings.length === 0) return answer(CLEAN, [], considered);
    return answer(FINDINGS, findings, considered);
  }

  const namespace = {
    deadClick: deadClick,
    FINDINGS: FINDINGS,
    CLEAN: CLEAN,
    CANNOT_TELL: CANNOT_TELL,
    CHAINS: CHAINS,
    NAVIGATION_START: NAVIGATION_START,
    TERMINAL_CLASSES: TERMINAL_CLASSES,
    ROUTER_EVENTS: ROUTER_EVENTS,
    REASONS: REASONS,
    REFUSALS: REFUSALS,
    NO_WINDOW_BOUND: NO_WINDOW_BOUND,
    NO_NAVIGATION_RECORDED: NO_NAVIGATION_RECORDED,
    NO_START_RECORDED: NO_START_RECORDED,
    WORK_CHAIN_UNJUDGEABLE: WORK_CHAIN_UNJUDGEABLE,
    BOUNDARY_CHAIN_UNJUDGEABLE: BOUNDARY_CHAIN_UNJUDGEABLE,
  };

  if (globalThis.angularAiDeadClick) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiDeadClick, namespace);
  } else {
    globalThis.angularAiDeadClick = namespace;
  }
})();
