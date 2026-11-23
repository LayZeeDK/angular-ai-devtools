// guard-phase.js — the record M063 joins against: one row per guard verdict, in arrival order, with
// the phase the guard ran in and the route the verdict was read for.
//
// Measured at this head, no record in this tree carries a guard phase.
// `extension/navigation-narrator.js` records `guards` as a fixed absence — `{ state: "cannot-tell",
// absence: "guard-verdict-not-recorded" }` — and its own comment says why: the router's payloads carry
// `{ route, type }` and no key names a guard. `grep -c "canActivate\|canMatch" extension/agent-main.js`
// returns 0. So the phase is a new field on a new record, written here (C1, C3), rather than a wider
// reading of the event stream: an event that names no guard cannot be made to name one, and the
// narrator's absence stays the absence it is — a record carrying no observation answers `cannot-tell`
// with that same token, and never with an empty row list that reads as "a guard ran".
//
// What this module reduces is the navigation the caller observed, as the ordered guard observations it
// carried. Each observation is one guard's own verdict, where its own result was seen:
//
//   { phase, guard, verdict, path }
//
//   phase     the phase the guard ran in: `canMatch`, `canActivate`, `canDeactivate` or `resolve`. A
//             word outside those four is not a phase this record can place, so the field is null with
//             `phase-not-a-phase-word` named, and no nearer phase is substituted for it (N1).
//   guard     the name the guard's own verdict carried, or null. `canMatch` runs before the route is
//             known, so a row that names a phase and no guard is a real state (C2) and not a gap to
//             fill: the field stays null with `guard-not-recorded` named, and no name is taken from the
//             last one the page logged, from the nearest route or from the previous row (N1, N2).
//   verdict   `allowed` or `refused`, as the guard stated it. A verdict word outside those two is not
//             one this record can state, so it is null with `verdict-not-a-verdict-word` named.
//   path      the route's own configured path where the navigation knew one. `''` is a path — a
//             componentless route's own — so it is never read as an absence, and a row carrying no
//             path keeps null with `path-not-recorded`, which is the `canMatch` state again.
//
// The record is one object, in every state, with exactly these three fields:
//
//   {
//     state: "guard-verdict-recorded" | "guard-phase-only" | "guard-verdict-absent" | "cannot-tell",
//     rows: [{ phase, guard, verdict, path }, …],   one row per verdict, in arrival order
//     absences: [{ field, path, reason }, …],       every absent field, named
//   }
//
// `rows` is never sorted, coalesced, reordered or dropped: the order is the order the observations
// arrived in, because which verdict belongs to which phase is read from that order and from nothing
// else. Every row carries the same four fields whatever phase it names, so a caller reads one row the
// way it reads the next, and the four are the four an observation is read by — one list, `ROW_FIELDS`,
// so the record's fields and the reducer's inputs cannot drift apart (SC3).
//
// `state` is decided in this order, and is the whole of what the record establishes:
//
//   cannot-tell            the value carried no readable observation at all — no list, an empty one, a
//                          list of nothing — and `guard-verdict-not-recorded` is named, the token the
//                          narrator's absence already carries.
//   guard-verdict-absent   at least one row carries no verdict, or no phase this record can place, so
//                          the record cannot say which verdict the navigation reached.
//   guard-phase-only       every row carries a verdict and at least one carries no guard: the phase is
//                          recorded and the guard is not, which is the `canMatch` state C2 names.
//   guard-verdict-recorded every row carries a phase, a guard and a verdict.
//
//   absences    one entry per absent field: `field` is "phase", "guard", "verdict" or "path"; `path`
//               is the route's own configured path where the row carried one and null where the path
//               itself is what is absent; `reason` is one of the tokens the namespace exports. An
//               absence is a named hole and never a filled field.
//
// This module reads the value it is handed and nothing else: it imports nothing, installs no observer,
// no tap and no listener, reads no page surface, no logged line and no clock, and publishes no global
// beyond the one namespace below — so a bare `node:vm` context with nothing in it runs it, which its
// suite proves. It holds no state between calls, and it throws on no input: a value that is not a
// record is answered `cannot-tell`, and a field whose getter throws reads as an absent field.
(function () {
  'use strict';

  const GUARD_VERDICT_RECORDED = 'guard-verdict-recorded';
  const GUARD_PHASE_ONLY = 'guard-phase-only';
  const GUARD_VERDICT_ABSENT = 'guard-verdict-absent';
  const CANNOT_TELL = 'cannot-tell';

  // The four phases a guard runs in, and the only four. Each is a word the router's own configuration
  // carries, so a phase is read as a name and never as a position in a check.
  const CAN_MATCH = 'canMatch';
  const CAN_ACTIVATE = 'canActivate';
  const CAN_DEACTIVATE = 'canDeactivate';
  const RESOLVE = 'resolve';

  // The two verdicts a guard's own result states, and the only two: a guard that allowed the
  // navigation and a guard that refused it.
  const ALLOWED = 'allowed';
  const REFUSED = 'refused';

  // The absences. Published as names rather than prose, so a caller compares a constant and never a
  // sentence, and a pane renders the absence it was handed.
  const GUARD_VERDICT_NOT_RECORDED = 'guard-verdict-not-recorded';
  const GUARD_NOT_RECORDED = 'guard-not-recorded';
  const VERDICT_NOT_RECORDED = 'verdict-not-recorded';
  const PHASE_NOT_RECORDED = 'phase-not-recorded';
  const PHASE_NOT_A_PHASE_WORD = 'phase-not-a-phase-word';
  const VERDICT_NOT_A_VERDICT_WORD = 'verdict-not-a-verdict-word';
  const PATH_NOT_RECORDED = 'path-not-recorded';

  // The one field a navigation record may carry its observations under: the ordered list of what the
  // navigation observed, which is the only input this reducer reads beside an array handed in itself.
  const OBSERVATIONS = 'guardObservations';

  // The four fields a row carries, and the same four an observation is read by. One list, exported, so
  // a suite can hold both halves to it and neither can grow a fifth on its own.
  const ROW_FIELDS = ['phase', 'guard', 'verdict', 'path'];

  const PHASES = [CAN_MATCH, CAN_ACTIVATE, CAN_DEACTIVATE, RESOLVE];
  const VERDICTS = [ALLOWED, REFUSED];
  const STATES = [
    GUARD_VERDICT_RECORDED,
    GUARD_PHASE_ONLY,
    GUARD_VERDICT_ABSENT,
    CANNOT_TELL,
  ];
  const ABSENCES = [
    GUARD_VERDICT_NOT_RECORDED,
    GUARD_NOT_RECORDED,
    VERDICT_NOT_RECORDED,
    PHASE_NOT_RECORDED,
    PHASE_NOT_A_PHASE_WORD,
    VERDICT_NOT_A_VERDICT_WORD,
    PATH_NOT_RECORDED,
  ];

  // One field, read without letting a hostile getter throw into the reducer: the value crosses a
  // message boundary, and this function throws on no input, so a throwing field is an absent field.
  function field(source, key) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[key];
    } catch (error) {
      return undefined;
    }
  }

  // The length of a list a record carries, or 0 where reading it throws. The list is read by index
  // below, so an iterator the record replaced cannot decide how many observations are read.
  function lengthOf(list) {
    try {
      return typeof list.length === 'number' ? list.length : 0;
    } catch (error) {
      return 0;
    }
  }

  function absent(fieldName, path, reason) {
    return { field: fieldName, path: path, reason: reason };
  }

  // A name the record states, or null where it states none. The empty string is no name, so it is
  // recorded as the absence it is rather than completed into one.
  function textOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // A path the record states, or null. The empty string is a path here — a componentless route's own
  // configured path — so it is never read as an absence.
  function pathOf(value) {
    return typeof value === 'string' ? value : null;
  }

  // The observations the value carries, in arrival order, or null where it carries no list at all. An
  // array handed in is the list itself; a navigation record answers the one field it may carry them
  // under, and a value carrying neither is a record this reducer cannot read rather than an empty one.
  function observationsOf(value) {
    if (Array.isArray(value)) return value;
    const listed = field(value, OBSERVATIONS);
    return Array.isArray(listed) ? listed : null;
  }

  // The phase an observation names, from its own word: a lookup in the four and nothing else. A word
  // the four do not hold answers no phase, with the absence that says which of the two cases it is —
  // and no nearer phase, and no position in the list, is substituted for it (N1, E2).
  function placeOf(value) {
    const word = textOf(value);
    if (word === null) return { phase: null, reason: PHASE_NOT_RECORDED };
    if (PHASES.indexOf(word) === -1) {
      return { phase: null, reason: PHASE_NOT_A_PHASE_WORD };
    }
    return { phase: word, reason: null };
  }

  // The verdict an observation states, from its own word: one of the two, and null with the absence
  // that says which case it is. A verdict is never inferred from a terminal event or from a cancel.
  function verdictOf(value) {
    const word = textOf(value);
    if (word === null) return { verdict: null, reason: VERDICT_NOT_RECORDED };
    if (VERDICTS.indexOf(word) === -1) {
      return { verdict: null, reason: VERDICT_NOT_A_VERDICT_WORD };
    }
    return { verdict: word, reason: null };
  }

  // One observation reduced to the four fields a row carries, plus the absences the reduction found and
  // the three readings `guardPhase` decides the state from. No field is filled here: an absent one
  // stays null and is named, and the guard's name is read from the observation's own field only.
  function reduceObservation(observation) {
    const path = pathOf(field(observation, 'path'));
    const place = placeOf(field(observation, 'phase'));
    const guard = textOf(field(observation, 'guard'));
    const verdict = verdictOf(field(observation, 'verdict'));

    const absences = [];
    if (place.reason !== null)
      absences.push(absent('phase', path, place.reason));
    if (guard === null)
      absences.push(absent('guard', path, GUARD_NOT_RECORDED));
    if (verdict.reason !== null) {
      absences.push(absent('verdict', path, verdict.reason));
    }
    if (path === null) absences.push(absent('path', null, PATH_NOT_RECORDED));

    return {
      row: {
        phase: place.phase,
        guard: guard,
        verdict: verdict.verdict,
        path: path,
      },
      absences: absences,
      placed: place.phase !== null,
      stated: verdict.verdict !== null,
      named: guard !== null,
    };
  }

  // The reducer: the observations, in the order they arrived, and nothing beside them.
  function guardPhase(observations) {
    const listed = observationsOf(observations);
    if (listed === null) {
      return {
        state: CANNOT_TELL,
        rows: [],
        absences: [absent('guard', null, GUARD_VERDICT_NOT_RECORDED)],
      };
    }

    const rows = [];
    const absences = [];
    // Three readings of the rows read so far: whether any row lacks a verdict or a phase this record
    // can place, and whether any row carries a verdict and no guard.
    let withoutVerdict = 0;
    let withoutGuard = 0;
    const count = lengthOf(listed);
    for (let index = 0; index < count; index += 1) {
      const observation = field(listed, index);
      if (observation === null || typeof observation !== 'object') continue;
      const reduced = reduceObservation(observation);
      const row = reduced.row;
      // One row per observation, in arrival order: pushed as it was read, so a later arrival sits
      // after an earlier one and no row is moved to the front or sorted by its phase (SC1, E2).
      rows.push(row);
      if (!reduced.placed || !reduced.stated) withoutVerdict += 1;
      if (!reduced.named) withoutGuard += 1;
      for (let at = 0; at < reduced.absences.length; at += 1) {
        absences.push(reduced.absences[at]);
      }
    }

    // A record carrying no readable observation answers the absence rather than an empty list, because
    // an empty list reads as a stream in which no guard ran (E1).
    if (rows.length === 0) {
      return {
        state: CANNOT_TELL,
        rows: [],
        absences: [absent('guard', null, GUARD_VERDICT_NOT_RECORDED)],
      };
    }

    let state = GUARD_VERDICT_RECORDED;
    if (withoutVerdict > 0) state = GUARD_VERDICT_ABSENT;
    else if (withoutGuard > 0) state = GUARD_PHASE_ONLY;

    return { state: state, rows: rows, absences: absences };
  }

  const namespace = {
    guardPhase: guardPhase,
    STATES: STATES,
    ABSENCES: ABSENCES,
    ROW_FIELDS: ROW_FIELDS,
    PHASES: PHASES,
    VERDICTS: VERDICTS,
    OBSERVATIONS: OBSERVATIONS,
  };

  const g = globalThis;
  if (g.angularAiGuardPhase) {
    Object.assign(g.angularAiGuardPhase, namespace);
  } else {
    g.angularAiGuardPhase = namespace;
  }
})();
