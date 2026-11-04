// after-render.js — the ordering behind COR-1: one read joined to the profiler after-render events
// the page agent already records.
//
// The page agent (`agent-main.js`) installs one `ɵsetProfiler` subscriber and pushes every event it
// receives into the recorded list, in emission order. This module is a reader of that list and of
// nothing else: it has no DOM (`document`, `window`, `getComputedStyle` appear nowhere), it imports
// nothing, and it installs no subscriber, no tap and no page global of its own — N1 says the ordering
// must come from the one list, because a second source would make the order unverifiable. A bare
// `node:vm` context with nothing in it is enough to run it, which is what the suite proves.
//
// The input is a read `{ at, width }` — where `at` is the position in the recorded list at which the
// read happened — and the recorded events `[{ type, phase?, at? }, …]`, already in emission order.
// The answer is one of exactly three results:
//
//   ordered      the phase the read ran in, and the after-render events before it and at-or-after it,
//                each array kept in the list's own order: emission order, never re-sorted by type or
//                by any other key.
//   cannot-tell  the list carries no after-render event for this read. The state names that absence
//                and says nothing else. A zero width is the read's *value*; with no event to join it
//                to, this module cannot say why it was zero, and it does not attribute it to layout
//                (N2). "Before layout" is a cause, and a cause is exactly what was not observed.
//   unknown      an event's type is not one the recorded enum carries, so it cannot be placed. A
//                guessed position would be as invented as a guessed event.
//
// The event types are the values the page agent hard-codes from Angular 22.x's profiler enum
// (`packages/core/primitives/devtools/src/profiler_types.ts`): TemplateUpdateStart 2,
// TemplateUpdateEnd 3, OutputStart 6, OutputEnd 7. The enum carries no phase of its own, so the
// family of the pair names the phase an event belongs to; an event that carries its own `phase`
// wins over that, and one that carries its own `at` ordinal wins over its list index.
(function () {
  "use strict";

  // Mirrors the four values in agent-main.js's ProfilerEvent literal. The extension's content
  // scripts share one world but not one module system, so the numbers are repeated here rather than
  // imported; a reader that subscribed to the enum itself would be the second tap N1 forbids.
  const TEMPLATE_UPDATE_START = 2;
  const TEMPLATE_UPDATE_END = 3;
  const OUTPUT_START = 6;
  const OUTPUT_END = 7;

  const ORDERED = "ordered";
  const CANNOT_TELL = "cannot-tell";
  const UNKNOWN = "unknown";

  // The name of the absence, so a caller compares a constant instead of prose (E3).
  const NO_AFTER_RENDER_EVENT = "no-after-render-event";

  // The phase an event belongs to, from the family of the pair that emitted it.
  function phaseForType(type) {
    if (type === TEMPLATE_UPDATE_START || type === TEMPLATE_UPDATE_END) return "template-update";
    if (type === OUTPUT_START || type === OUTPUT_END) return "output";
    return null;
  }

  // An event the enum carries. Anything else is not a recorded profiler event and cannot be placed.
  function recognises(type) {
    return typeof type === "number" && phaseForType(type) !== null;
  }

  // The list the page agent records holds the enum's numbers (`events.push(event)`), but a recorder
  // that normalises as it goes holds `{ type }`. Both are read here.
  function typeOf(event) {
    if (typeof event === "number") return event;
    if (event && typeof event === "object") return event.type;
    return undefined;
  }

  // The phase an event belongs to: its own when the recorder supplied one, the pair's otherwise.
  function phaseOfEvent(event) {
    if (event && typeof event === "object" && typeof event.phase === "string" && event.phase) {
      return event.phase;
    }
    return phaseForType(typeOf(event));
  }

  // Where the event sits in the recorded list: its own ordinal when the recorder supplied one, its
  // list index otherwise. The list's order is never changed to agree with an ordinal.
  function ordinalOf(event, index) {
    if (event && typeof event === "object" && typeof event.at === "number" && Number.isFinite(event.at)) {
      return event.at;
    }
    return index;
  }

  function entryFor(event, index) {
    return { type: typeOf(event), phase: phaseOfEvent(event), ordinal: ordinalOf(event, index) };
  }

  // The read as it was read: `at` and `width` are carried through as values. A `width` of 0 stays 0
  // and is reported as the read the developer made, never as a cause.
  function copyOfRead(read) {
    const from = read || {};
    return { at: from.at, width: from.width };
  }

  // The event an `unknown` result names, copied so the caller's list is the caller's.
  function copyOfEvent(event) {
    if (event && typeof event === "object") return Object.assign({}, event);
    return event;
  }

  // The absent-event result, written once so both ways of reaching it say the same thing and nothing
  // that reads as a cause (E3, N2).
  function cannotTell() {
    return { state: CANNOT_TELL, reason: NO_AFTER_RENDER_EVENT };
  }

  // The join. `read.at` is the position in the recorded list at which the read happened; every event
  // at or after it is an after-render event for the read, every event before it is one the read
  // followed. Both arrays keep the list's own order and are never re-sorted.
  function order(read, events) {
    const list = Array.isArray(events) ? events : [];
    const readCopy = copyOfRead(read);
    const readAt =
      typeof readCopy.at === "number" && Number.isFinite(readCopy.at) ? readCopy.at : Number.NaN;

    // An event whose type is not one the enum carries stops the join: it cannot be placed, so neither
    // the events around the read nor the phase can be stated without guessing (unknown).
    for (let i = 0; i < list.length; i += 1) {
      if (!recognises(typeOf(list[i]))) {
        return { state: UNKNOWN, event: copyOfEvent(list[i]) };
      }
    }

    // A read with no position in the list cannot be joined to any event: nothing recorded can be said
    // to have come after it, so the answer is that absence rather than an order invented from it.
    if (!Number.isFinite(readAt)) return cannotTell();

    const before = [];
    const after = [];
    for (let i = 0; i < list.length; i += 1) {
      const entry = entryFor(list[i], i);
      if (entry.ordinal < readAt) before.push(entry);
      else after.push(entry);
    }

    // No after-render event in the list for this read: say that, and only that (E3, N2).
    if (after.length === 0) return cannotTell();

    // The phase the read ran in is the phase of the event it interrupted — the last one emitted
    // before it; a read before every recorded event takes the phase of the first one after it.
    const readPhase = before.length > 0 ? before[before.length - 1].phase : after[0].phase;
    return { state: ORDERED, read: readCopy, phase: readPhase, before: before, after: after };
  }

  const namespace = {
    order,
    recognises,
    phaseForType,
    NO_AFTER_RENDER_EVENT,
  };

  if (globalThis.angularAiAfterRender) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiAfterRender, namespace);
  } else {
    globalThis.angularAiAfterRender = namespace;
  }
})();
