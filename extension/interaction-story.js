// interaction-story.js — the join behind M049: the three arrival-ordered streams the page agent
// records, read as one story of steps in the order T001 measured, or refused.
//
// T001 measured (`research/raw/m049-streams.json`) what the three streams carry and whether they
// share an order:
//
//   - all three record `at`, written by one reader — nowMs() at extension/agent-main.js:728 —
//     as the page's own performance.now() reading taken at receipt (router :1638, work :699,
//     boundary :2073). The same function, in the same realm, answers every entry, so sorting the
//     union by `at` ascending is a measurement rather than an invention.
//   - no stream records a cross-stream sequence number or arrival index: seq, sequence and
//     arrivalIndex occur 0 times in the file. Two entries that share one `at` are therefore one
//     instant to this record, and the order between them is not recorded. The narration emits
//     them together, contiguously, and never picks a winner from a stream name, a type, a list
//     position or the router's own navigation id.
//   - every stream is bounded: routerEvents keeps 512 arrivals (:1471), the work list 64
//     (:640) and boundaryEntries 128 (:1939), oldest dropped. A story orders what the record
//     still holds and never claims to be what the page did.
//   - no stream records an interaction: `interaction` occurs 0 times across extension/*.js and
//     no extension file registers a click, pointer, mouse or key listener. A step quotes what
//     the page emitted and never a user action.
//
// The record this join reads is the one extension/agent-main.js publishes:
//
//   record.routerEvents      the router's arrivals, in arrival order
//   record.events            the frame's own work, in emission order (published from
//                            pendingWorkEvents, which is never published as itself)
//   record.boundary.entries  the boundary's arrivals, in arrival order
//
// Nothing else on the record is read: a cycle id, a trigger, a per-check row or a field a later
// capture adds changes nothing this join reports.
//
// The answer is one object:
//
//   interactionStory(record) -> { state, steps, cannotTell, reason }
//
// `state` is `steps` when the record holds at least one step, and `cannot-tell` when it holds no
// story to tell. `steps` is an array of `{ stream, at, fields }` in the measured order: the union
// of the three streams, sorted by `at` ascending. `stream` is the stream the entry came from, `at`
// is the page's own receipt reading, and `fields` is the entry's own recorded values with `at`
// hoisted beside them — no paraphrase, no cause, no user action, and no key the entry does not
// carry. `cannotTell` names the streams that are missing: the empty ones, or the ones whose
// entries carry no `at` reading. `reason` is null when nothing is missing and otherwise one of the
// closed reasons below.
//
//   all-streams-empty   every stream is empty: the absence, never an empty story
//   stream-empty        one or two streams are empty: the populated ones are the story, and the
//                       empty ones are named; "nothing happened anywhere" never collapses into
//                       "nothing happened here"
//   no-shared-order     a populated stream holds an entry with no measured `at`, so no merged
//                       order is recorded: the answer is the refusal, never an order
//   record-unreadable   a stream the record does not carry as a list: a record this join cannot
//                       read is not a record with an empty stream
//
// `BOUNDED_STATEMENT` states, beside the answer, that a story is what the record kept and not
// what the page did. The bounds are exported as `BOUNDS` so a surface renders the measurement
// rather than a number it remembered.
//
// This module is a reader of the record it is handed and of nothing else: no imports, no DOM, no
// clock, no console, no network and no page global beyond the one namespace below, so a bare
// node:vm context with nothing in it is enough to run it (which the suite proves). It holds no
// state between calls and answers the same steps in the same order for the same record twice.
(function () {
  'use strict';

  // The two states a story can carry.
  const STEPS = 'steps';
  const CANNOT_TELL = 'cannot-tell';

  // The three streams, by the names T001 measured. The work stream is published as the frame's
  // `events` list; its recorded name is kept here so a step names the stream and not a slot.
  const ROUTER = 'routerEvents';
  const WORK = 'pendingWorkEvents';
  const BOUNDARY = 'boundaryEntries';
  const STREAM_NAMES = Object.freeze([ROUTER, WORK, BOUNDARY]);

  // The one field the streams share, and the one reader that wrote it (T001).
  const AT = 'at';
  const SHARED_FIELD = AT;
  const SHARED_READER = 'nowMs';

  // The bounds T001 measured, per stream: an arrival count, oldest dropped. Exported so a surface
  // prints the measurement rather than a remembered number.
  const BOUNDS = Object.freeze({
    routerEvents: 512,
    pendingWorkEvents: 64,
    boundaryEntries: 128,
  });

  // The statement a story carries about itself. It is a constant and not a per-record read: the
  // bounds are the page-health guards T001 measured, and they do not move with a record.
  const BOUNDED_STATEMENT =
    'a story is what the record kept, not what the page did: routerEvents keeps 512 arrivals, ' +
    'pendingWorkEvents 64 and boundaryEntries 128, and the oldest fall off the front, so every ' +
    'story is incomplete';

  // The closed set of reasons a missing thing answers with. `reason` is null where nothing is
  // missing, and a member of this list otherwise.
  const ALL_STREAMS_EMPTY = 'all-streams-empty';
  const STREAM_EMPTY = 'stream-empty';
  const NO_SHARED_ORDER = 'no-shared-order';
  const RECORD_UNREADABLE = 'record-unreadable';
  const REASONS = Object.freeze([
    ALL_STREAMS_EMPTY,
    STREAM_EMPTY,
    NO_SHARED_ORDER,
    RECORD_UNREADABLE,
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A receipt time the page measured: a finite number and nothing else. `null`, a string and a
  // `NaN` are all the same absence here, and an order built on one would be an order nobody
  // measured.
  function isMeasurement(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function isList(value) {
    return Array.isArray(value);
  }

  // The three lists the record carries, or the streams whose list it does not carry. A stream the
  // record omits is unreadable, which is not the same as a stream it carries empty: the first is
  // an absence this join names, the second is a measured "nothing arrived here".
  function streamsOf(record) {
    const missing = [];
    let routerEvents = null;
    let events = null;
    let boundaryEntries = null;
    if (!isObject(record)) {
      return {
        missing: STREAM_NAMES.slice(),
        routerEvents: routerEvents,
        events: events,
        boundaryEntries: boundaryEntries,
      };
    }
    if (isList(record.routerEvents)) routerEvents = record.routerEvents;
    else missing.push(ROUTER);
    if (isList(record.events)) events = record.events;
    else missing.push(WORK);
    if (isObject(record.boundary) && isList(record.boundary.entries)) {
      boundaryEntries = record.boundary.entries;
    } else {
      missing.push(BOUNDARY);
    }
    return {
      missing: missing,
      routerEvents: routerEvents,
      events: events,
      boundaryEntries: boundaryEntries,
    };
  }

  // The three streams, in the order this join reads them, each with the list it carries. The
  // order is the record's own enumeration and never a comparator: it decides nothing about two
  // entries that share an `at`.
  function sourcesOf(lists) {
    return [
      { stream: ROUTER, entries: lists.routerEvents },
      { stream: WORK, entries: lists.events },
      { stream: BOUNDARY, entries: lists.boundaryEntries },
    ];
  }

  // The `at` an entry carries, read from an entry that may not be an object at all. A value that
  // is not an object carries no receipt reading this join can use.
  function atOf(entry) {
    return isObject(entry) ? entry[SHARED_FIELD] : undefined;
  }

  // The event's own recorded values, with the one comparable field hoisted beside them: every own
  // key the entry carries, in the order it carries them, and no key it does not. A value is
  // copied as the record wrote it, so a type stays a number and an error stays the error's own
  // `{ name, message }`; nothing here is a paraphrase, a summary or a cause.
  function fieldsOf(entry) {
    const fields = {};
    const keys = Object.keys(entry);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (key === SHARED_FIELD) continue;
      fields[key] = entry[key];
    }
    return fields;
  }

  function stepOf(stream, entry) {
    return {
      stream: stream,
      at: entry[SHARED_FIELD],
      fields: fieldsOf(entry),
    };
  }

  // The measured order: the one field T001 measured across all three streams, ascending. Ties are
  // left to the stable sort, which keeps the order the entries were read in; no stream name, type
  // or position is ever a second key.
  function byAt(left, right) {
    return left.at - right.at;
  }

  // The streams that are empty: the absence E4 must name beside a story of the populated ones.
  function emptyStreamsOf(sources) {
    const empty = [];
    for (let i = 0; i < sources.length; i += 1) {
      if (sources[i].entries.length === 0) empty.push(sources[i].stream);
    }
    return empty;
  }

  // The streams that hold an entry with no measured `at`. Any one of them makes a merged order
  // unrecorded: the record offers no comparable field for that entry, and no other stream's
  // reading may be lent to it.
  function streamsWithoutAt(sources) {
    const withoutAt = [];
    for (let i = 0; i < sources.length; i += 1) {
      const entries = sources[i].entries;
      for (let j = 0; j < entries.length; j += 1) {
        if (!isMeasurement(atOf(entries[j]))) {
          if (withoutAt.indexOf(sources[i].stream) === -1) {
            withoutAt.push(sources[i].stream);
          }
          break;
        }
      }
    }
    return withoutAt;
  }

  function answer(state, steps, cannotTell, reason) {
    return {
      state: state,
      steps: steps,
      cannotTell: cannotTell,
      reason: reason,
    };
  }

  // The join. `record` is what the page agent publishes; its three lists are walked once, and
  // nothing else on the record is read.
  function interactionStory(record) {
    const lists = streamsOf(record);
    if (lists.missing.length > 0) {
      return answer(CANNOT_TELL, [], lists.missing, RECORD_UNREADABLE);
    }

    const sources = sourcesOf(lists);
    const empty = emptyStreamsOf(sources);
    if (empty.length === sources.length) {
      return answer(CANNOT_TELL, [], empty, ALL_STREAMS_EMPTY);
    }

    const withoutAt = streamsWithoutAt(sources);
    if (withoutAt.length > 0) {
      return answer(CANNOT_TELL, [], withoutAt, NO_SHARED_ORDER);
    }

    const steps = [];
    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      for (let j = 0; j < source.entries.length; j += 1) {
        steps.push(stepOf(source.stream, source.entries[j]));
      }
    }
    steps.sort(byAt);

    const reason = empty.length > 0 ? STREAM_EMPTY : null;
    return answer(STEPS, steps, empty, reason);
  }

  const namespace = {
    interactionStory: interactionStory,
    STEPS: STEPS,
    CANNOT_TELL: CANNOT_TELL,
    STREAM_NAMES: STREAM_NAMES,
    SHARED_FIELD: SHARED_FIELD,
    SHARED_READER: SHARED_READER,
    BOUNDS: BOUNDS,
    BOUNDED_STATEMENT: BOUNDED_STATEMENT,
    REASONS: REASONS,
    ALL_STREAMS_EMPTY: ALL_STREAMS_EMPTY,
    STREAM_EMPTY: STREAM_EMPTY,
    NO_SHARED_ORDER: NO_SHARED_ORDER,
    RECORD_UNREADABLE: RECORD_UNREADABLE,
  };

  if (globalThis.angularAiInteractionStory) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiInteractionStory, namespace);
  } else {
    globalThis.angularAiInteractionStory = namespace;
  }
})();
