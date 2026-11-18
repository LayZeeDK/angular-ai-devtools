// component-search.js — the panel's one join from a recorded component list to the rows a typed
// query keeps (M047 T002; INTENT.md SC1, SC2, SC3).
//
// There is no component tree to walk: `enumerateComponentNodes` pushes one flat node per class,
// with no parent and no child field, and the word `children` does not occur in
// extension/agent-main.js at all (research/raw/m047-names-and-absences.json, its `tree` section).
// So this filter lists what the record carries and nothing else: it completes no name from
// framework knowledge (N1), it reads no element — the record is the list's only source — and it
// states an absence as an absence rather than as a zero-length result (SC2, E4).
//
// The record is `{ components, source }`:
//
// - `components` is the list the page agent enumerated, one entry per component it named: `name`
//   is the text it read from the page, `instanceCount` a count the record states. A row copies the
//   entry's name and either its non-negative integer count or `null` — never a count the record
//   does not state.
// - `source` is the record's own reading of where that list came from: `{ state: 'read' }` when
//   the list is the page's, or `{ state: 'unreadable', reason: <cause> }` when it is not. The cause
//   is one of this file's closed set; a cause outside it answers `unreadable-source`, so a word the
//   record invented is never repeated as though it had been measured (N3).
//
// The answer is `{ state, rows, matched, reason }`, `reason` present only for `cannot-tell`:
//
// - `listed` — the list was read and the query kept rows, or kept none. Empty `rows` with
//   `matched: 0` is a filter that matched nothing, not a page that rendered nothing.
// - `empty` — the list was read and the record states the page rendered no components at all.
// - `cannot-tell` — the source could not be read. `reason` names why and is a member of REASONS;
//   a zero-length list is never offered in its place.
(function () {
  'use strict';

  const LISTED = 'listed';
  const EMPTY = 'empty';
  const CANNOT_TELL = 'cannot-tell';
  const READ = 'read';
  const UNREADABLE = 'unreadable';

  // The closed reason vocabulary. The first three are cases
  // `research/raw/m047-names-and-absences.json` measured, one per absence id, so no cause in this
  // set is invented here: `agent-not-installed` is the page that publishes no window.ng, so the
  // agent installs nothing and enumerates nothing (extension/agent-main.js:509); `no-profiler` is
  // the page that publishes no ɵsetProfiler, so no frame is ever produced (:531); and
  // `enumerate-without-getter` is the page that publishes no component getter, whose enumeration
  // answers `[]` — an emptiness that is not a statement that the page rendered none (:862). The
  // last two are this file's own, because they name the record's unreadability rather than a page's
  // cause: `unreadable-source` (no source, or a cause outside this list) and `unreadable-record`
  // (no list to read at all).
  const REASONS = Object.freeze([
    'agent-not-installed',
    'no-profiler',
    'enumerate-without-getter',
    'unreadable-source',
    'unreadable-record',
  ]);

  const STATES = Object.freeze([LISTED, EMPTY, CANNOT_TELL]);

  // True only for a word of the closed set above. A cause the record carries and this set does not
  // is not a cause this filter may state.
  function isReason(value) {
    return typeof value === 'string' && REASONS.indexOf(value) !== -1;
  }

  // The cause the record states for a source it could not read, or null when it states that the
  // list is the page's own. Nothing is inferred from the list itself: an empty `components` beside a
  // readable source is a page that rendered nothing, and the same empty list beside an unreadable
  // source is a read that did not happen (E4, SC2). An absent source, or one whose cause is not in
  // the closed set, answers `unreadable-source`: the record can never put a cause of its own into
  // `reason` (N3).
  function unreadableReason(source) {
    const readable = !!source && typeof source === 'object';
    const state = readable ? source.state : null;
    if (state === READ) return null;
    if (state === UNREADABLE && isReason(source.reason)) return source.reason;
    return 'unreadable-source';
  }

  // The count the record states, or null when it states none: a number this file made up would be
  // the invention the whole filter refuses.
  function recordedCount(entry) {
    const count = entry.instanceCount;
    const stated =
      typeof count === 'number' && Number.isInteger(count) && count >= 0;
    return stated ? count : null;
  }

  // The rows the record carries: one per entry, in the record's own order, and no row the record
  // does not carry. A row is keyed by the text a query matches, so an entry carrying no usable name
  // makes the list unreadable rather than being dropped: dropping it would shorten the list the page
  // named, and naming it here would be the invention this filter exists to refuse.
  function rowsOf(components) {
    if (!Array.isArray(components)) return null;
    const rows = [];
    for (let index = 0; index < components.length; index += 1) {
      const entry = components[index];
      if (!entry || typeof entry !== 'object') return null;
      const name = entry.name;
      if (typeof name !== 'string' || name.trim().length === 0) return null;
      rows.push({ name: name, instanceCount: recordedCount(entry) });
    }
    return rows;
  }

  // A name matches when the query is a case-insensitive substring of that name and of nothing else:
  // not of an element label, not of a class name the record did not carry, and not of a name
  // completed from framework knowledge (N1). An empty query keeps every row, which is a filter that
  // matched everything rather than a claim about the page.
  function matchesName(name, query) {
    return name.toLowerCase().indexOf(query) !== -1;
  }

  // The text a query is matched as: trimmed and lowercased once, so the same query and the same
  // record answer identically every time.
  function needleOf(query) {
    return typeof query === 'string' ? query.trim().toLowerCase() : '';
  }

  function cannotTell(reason) {
    return { state: CANNOT_TELL, rows: [], matched: 0, reason: reason };
  }

  function componentSearch(record, query) {
    if (!record || typeof record !== 'object') {
      return cannotTell('unreadable-record');
    }
    const unreadable = unreadableReason(record.source);
    if (unreadable !== null) return cannotTell(unreadable);
    const rows = rowsOf(record.components);
    if (rows === null) return cannotTell('unreadable-record');
    if (rows.length === 0) return { state: EMPTY, rows: [], matched: 0 };
    const needle = needleOf(query);
    const kept = [];
    for (let index = 0; index < rows.length; index += 1) {
      if (matchesName(rows[index].name, needle)) kept.push(rows[index]);
    }
    return { state: LISTED, rows: kept, matched: kept.length };
  }

  const namespace = {
    componentSearch: componentSearch,
    search: componentSearch,
    reasons: REASONS,
    states: STATES,
    LISTED: LISTED,
    EMPTY: EMPTY,
    CANNOT_TELL: CANNOT_TELL,
  };

  const g = globalThis;
  if (g.angularAiComponentSearch) {
    // Second run in the same realm: republish in place, so the object identity a caller already
    // holds stays valid, and never throw.
    Object.assign(g.angularAiComponentSearch, namespace);
  } else {
    g.angularAiComponentSearch = namespace;
  }
})();
