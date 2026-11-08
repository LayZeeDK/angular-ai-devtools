// performance-narrator.js — the join behind M040: one frame's ordered work, the duration the page
// measured between each start and its matching end, and the two answers this module refuses to
// invent.
//
// T001 measured (`research/raw/m040-work-events.json`) what each of the five paired profiler work
// events carries and whether the page agent's microtask-delimited frame holds both ends:
//
//   - `TemplateUpdate`, `LifecycleHook` and `HostBindingsUpdate` pass an instance on both ends.
//     `Component` passes one on its end only — every `ComponentStart` measured `null` — and
//     `ChangeDetection` passes none at all: its start and every one of its ends measured a `null`
//     instance and an `undefined` eventFn. An interval whose own two events carry no identity is
//     therefore cannot-tell with the named absence `no-component-identity`, and no node index, no
//     position in the list and no neighbouring name may fill the gap (SC3, N1, N3).
//   - the profiler's bracketed call and the agent's frame disagree for `Component`: the outermost
//     `ComponentStart` of a task precedes the `TemplateUpdateStart` that opens the frame, so 3 of 6
//     starts on `/` arrived with no frame open. T002 holds those arrivals and adopts them into the
//     frame the same task opens, in arrival order, so a frame's `events` list is the frame's whole
//     work — including what arrived before its opener — and this module never moves an event
//     between frames.
//
// The rule the recording states and this module implements (`frames.rule`):
//
//   the agent frame is not the profiler bracket; a start and its end are matched by recorded arrival
//   order and the measured nesting, so an end closes the innermost open start of its own pair and
//   never an outer one; a start that arrives with no frame open belongs to the frame the same task
//   opens later, and a start that frame never closes is unmeasured. A duration is never taken from
//   the next event, from a reconstructed timestamp or from a clock this module reads.
//
// In the terms of this file: a start the frame holds opens an interval in the order the frame
// recorded it; the matching end of its own pair closes it, last-in-first-out within that pair; an
// end with no open start of its own pair is reported by kind as unresolved and is never walked
// backwards onto an earlier start; and a start still open when the frame's list ends is unmeasured,
// with no duration field at all.
//
// This module is a reader of the frame it is handed and of nothing else: no DOM, no clock, no
// console, no network, no imports and no page global beyond the one namespace below, so a bare
// `node:vm` context with nothing in it is enough to run it (which the suite proves). It holds no
// state between calls and never sorts: the answer's order is the order the frame recorded the
// start events, and no cost, no name and no index is ever a sort key (SC1).
//
// The frame it reads is the change-detection record T002 publishes, whose `events` list holds one
// entry per recorded profiler event in emission order:
//
//   { type: number, pair: string, end: boolean, at: number, componentName: string | null }
//
// `at` is the page's own `performance.now()` reading at receipt, and `componentName` is the name the
// profiler's instance yielded or `null`. Everything else on the frame — its cycle id, its trigger,
// its per-check rows, a field a later capture adds — is ignored, so a frame carrying one changes
// nothing this module reports. An entry the join cannot read (no pair name, no `end` bit, no
// measured receipt time) contributes nothing at all: no interval is minted for it (E2).
//
// The answer is one object:
//
//   narrate(frame) -> { state, intervals, unresolved }            and, where state is cannot-tell,
//                                                                 { ..., absence }
//
// `intervals` holds one entry per start the frame recorded, in that recorded order, each of:
//
//   { state: "measured",    pair, componentName, startedAt, endedAt, durationMs }
//   { state: "cannot-tell", pair, absence: "no-component-identity", startedAt }
//   { state: "unmeasured",  pair, startedAt }
//
// An interval is measured exactly when both of its ends are in the frame and its own two events
// carry an identity; its duration is the end's measured receipt time minus its start's, and a
// difference of `0` is a measured zero rather than a missing cost (SC1, E6). An interval is named
// by its start's component name when the start has one and otherwise by its matching end's — its
// own two events and nothing else (SC3, E4). A start with no matching end in the frame is
// unmeasured and carries no duration, no endedAt and no name: the join reads no clock and borrows
// no other event's time (SC4, E5). A start's identity is never consulted to report an interval it
// did not close, because there is no measured interval to name.
//
// `unresolved` lists the ends the frame holds with no open start of their own pair, by kind —
// `{ pair, type }` and nothing else — and no interval is built from such an end.
//
// `state` is the frame's own answer, read off the intervals it holds: `unmeasured` when any start
// the frame recorded was not closed in it, `cannot-tell` when nothing was left unmeasured but an
// interval could not be named, and `measured` otherwise. A frame holding no interval at all says so
// rather than answering an empty success, and names what it lacks in `absence`:
//
//   no-start-events         the frame carries no start event, so there is no interval to narrate
//   no-component-identity   every interval the frame holds is unnamed
//   frame-unreadable        the frame carries no `events` list this module can read, which is
//                           distinct from a frame that carries an empty one
(function () {
  'use strict';

  // The three states an interval — and the frame's own answer — can carry.
  const MEASURED = 'measured';
  const CANNOT_TELL = 'cannot-tell';
  const UNMEASURED = 'unmeasured';

  // The one absence a pair of events can force, and the two absences a frame can force. Published
  // as names rather than prose, so a caller compares a constant and never a sentence.
  const NO_COMPONENT_IDENTITY = 'no-component-identity';
  const NO_START_EVENTS = 'no-start-events';
  const FRAME_UNREADABLE = 'frame-unreadable';

  /**
   * @typedef {object} Start
   * @property {string} pair
   * @property {number} startedAt
   * @property {string | null} componentName
   *
   * @typedef {object} Interval
   * @property {string} state
   * @property {string} pair
   * @property {string} [componentName]
   * @property {number} startedAt
   * @property {number} [endedAt]
   * @property {number} [durationMs]
   * @property {string} [absence]
   *
   * @typedef {object} FrameState
   * @property {string} state
   * @property {string | null} absence
   */

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A receipt time the page measured: a finite number, and nothing else. `null`, a string and a
  // `NaN` are all the same absence here, and an interval built on one would be a duration nobody
  // measured.
  function isMeasurement(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // A string that says something, or null. A blank name names nothing, so it is recorded as no
  // name rather than as an empty one.
  function nonEmptyText(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // The frame's work events, or null when the frame is not one this module can read. A frame that
  // carries no `events` list is unread, which is not the same as a frame that carries an empty one:
  // the first is an absence to name, the second is a measured "no work" (SC4).
  function eventsOf(frame) {
    if (!isObject(frame)) return null;
    if (!Array.isArray(frame.events)) return null;
    return frame.events;
  }

  // One recorded entry, read as what it says: the pair it belongs to, which end of the pair it is,
  // and the receipt time the page measured for it. The event number is copied only where it is
  // reported back as the kind of an unresolved end, and the component name only when it names one.
  // A caller cannot smuggle a name in through a blank string, and cannot smuggle a duration in
  // through a field the join does not read.
  function readEntry(value) {
    if (!isObject(value)) return null;
    const pair = nonEmptyText(value.pair);
    if (pair === null) return null;
    if (typeof value.end !== 'boolean') return null;
    if (!isMeasurement(value.at)) return null;
    return {
      type: isMeasurement(value.type) ? value.type : null,
      pair: pair,
      end: value.end,
      at: value.at,
      componentName: nonEmptyText(value.componentName),
    };
  }

  // The stack of open starts one pair holds. It is per pair, so an end can only ever close a start
  // of its own pair, and it is a stack, so the end closes the innermost one.
  function openStack(open, pair) {
    let stack = open.get(pair);
    if (stack === undefined) {
      stack = [];
      open.set(pair, stack);
    }
    return stack;
  }

  // The identity an interval's own two events carry: its start's component name when the start has
  // one, otherwise its matching end's, and otherwise nothing at all. No node index, no position in
  // the list, no neighbour's name and no fallback word is ever consulted (SC3, N1, N3).
  function identityOf(startName, endName) {
    if (startName !== null) return startName;
    return endName;
  }

  // A measured interval: the two receipt times the page wrote, and the difference between them. A
  // difference of `0` is a measured zero and stays a number — it is never read as falsy and
  // replaced by a missing cost (E6).
  function measuredInterval(pair, componentName, startedAt, endedAt) {
    return {
      state: MEASURED,
      pair: pair,
      componentName: componentName,
      startedAt: startedAt,
      endedAt: endedAt,
      durationMs: endedAt - startedAt,
    };
  }

  // Both ends present and neither of them carrying a name: the identity question is unanswerable,
  // so the interval is cannot-tell with the one absence the page measured, and it carries no name
  // field a caller could read as a component and no duration it could read as a cost (SC3, E4).
  function cannotTellInterval(pair, startedAt) {
    return {
      state: CANNOT_TELL,
      pair: pair,
      absence: NO_COMPONENT_IDENTITY,
      startedAt: startedAt,
    };
  }

  // A start this frame never closed: unmeasured, with no duration field at all — not `null`, not a
  // zero, and not a value taken from another event in the frame (SC4, E5).
  function unmeasuredInterval(start) {
    return { state: UNMEASURED, pair: start.pair, startedAt: start.startedAt };
  }

  // The interval an end closes, built from the start it matched and from that end's own measured
  // receipt time. Nothing else in the frame contributes a name or a time to it.
  function closedInterval(start, end) {
    const name = identityOf(start.componentName, end.componentName);
    if (name === null) return cannotTellInterval(start.pair, start.startedAt);
    return measuredInterval(start.pair, name, start.startedAt, end.at);
  }

  // The frame's own answer, read off the intervals it holds: whether every start the frame recorded
  // was closed in it, and whether every interval it holds could be named. An absence is named only
  // where the state is cannot-tell, so a caller never reads a reason for an answer that has one.
  function stateOf(intervals) {
    if (intervals.length === 0) {
      return { state: CANNOT_TELL, absence: NO_START_EVENTS };
    }
    let unmeasured = false;
    let unnamed = false;
    for (let i = 0; i < intervals.length; i += 1) {
      if (intervals[i].state === UNMEASURED) unmeasured = true;
      else if (intervals[i].state === CANNOT_TELL) unnamed = true;
    }
    if (unmeasured) return { state: UNMEASURED, absence: null };
    if (unnamed) return { state: CANNOT_TELL, absence: NO_COMPONENT_IDENTITY };
    return { state: MEASURED, absence: null };
  }

  // The answer: the frame's state, the intervals in recorded start order, and the ends this frame
  // could not place. The absence appears exactly where there is one to name.
  function answer(frameState, intervals, unresolved) {
    const result = {
      state: frameState.state,
      intervals: intervals,
      unresolved: unresolved,
    };
    if (frameState.absence !== null) result.absence = frameState.absence;
    return result;
  }

  // The join. `frame` is the change-detection record T002 publishes; its `events` list is walked
  // once, in recorded order, and nothing else on the frame is read.
  function narrate(frame) {
    const events = eventsOf(frame);
    if (events === null) {
      return answer({ state: CANNOT_TELL, absence: FRAME_UNREADABLE }, [], []);
    }

    // Every start the frame recorded, in the order it recorded them, and the interval its own end
    // closed. `closed` is keyed by the position of the start it belongs to, so an interval keeps
    // the place its start was recorded in no matter what order the ends arrive in.
    /** @type {Start[]} */
    const starts = [];
    /** @type {Record<number, Interval | undefined>} */
    const closed = {};
    /** @type {Map<string, number[]>} */
    const open = new Map();
    const unresolved = [];

    for (let i = 0; i < events.length; i += 1) {
      const entry = readEntry(events[i]);
      if (entry === null) continue; // an event the frame does not carry is never minted into a row

      if (!entry.end) {
        const slot = starts.length;
        starts.push({
          pair: entry.pair,
          startedAt: entry.at,
          componentName: entry.componentName,
        });
        openStack(open, entry.pair).push(slot);
        continue;
      }

      const stack = open.get(entry.pair);
      if (stack === undefined || stack.length === 0) {
        // An end with no open start of its own pair is reported by kind and is never walked
        // backwards onto an earlier start: the bracket it closes is not in this frame (AC6).
        unresolved.push({ pair: entry.pair, type: entry.type });
        continue;
      }

      const slot = stack.pop();
      closed[slot] = closedInterval(starts[slot], entry);
    }

    // The answer, in the order the start events were recorded. A position no end closed is
    // unmeasured: the frame holds no end for it, so it carries no duration at all.
    const intervals = [];
    for (let i = 0; i < starts.length; i += 1) {
      const interval = closed[i];
      intervals.push(
        interval === undefined ? unmeasuredInterval(starts[i]) : interval,
      );
    }

    const frameState = stateOf(intervals);
    return answer(frameState, intervals, unresolved);
  }

  const namespace = {
    narrate: narrate,
    MEASURED: MEASURED,
    CANNOT_TELL: CANNOT_TELL,
    UNMEASURED: UNMEASURED,
    NO_COMPONENT_IDENTITY: NO_COMPONENT_IDENTITY,
    NO_START_EVENTS: NO_START_EVENTS,
    FRAME_UNREADABLE: FRAME_UNREADABLE,
  };

  if (globalThis.angularAiPerformanceNarrator) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiPerformanceNarrator, namespace);
  } else {
    globalThis.angularAiPerformanceNarrator = namespace;
  }
})();
