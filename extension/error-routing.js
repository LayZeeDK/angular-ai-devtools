// error-routing.js — the join that answers, purely, whether an error the page reported was
// ever offered to the ErrorHandler in force. It reads nothing but the one record it is
// handed — `{ errors, boundaries, handler }` — and returns, in every state, one answer
// carrying exactly the eight contract fields: `{ state, message, code, owner, phase,
// absences, claims, detail }`. No DOM, no clock, no console, no page read, no git, no
// filesystem, no second tap in this file: a global that is not its argument is never read.
//
// The three inputs are the records T001 measured and published at
// `research/raw/m060-record-shapes.json`:
//
//   - `errors` — the global listener's arrivals, one payload of `{ code, message,
//     component, timestamp }` per arrival (agent-main.js:2550-2561), each reducing its own
//     arrival and borrowing no field from a neighbouring one.
//   - `boundaries` — M042's `boundaryEntries`, one entry per handler arrival in arrival
//     order, capped at the page-health guard; an entry carries the caught error's text
//     either flat or behind its `error`, and an absent field reads as null.
//   - `handler` — whether an ErrorHandler resolved. A key the record does not carry is a
//     missing input, and a missing input is `cannot-tell`, never a guess in either
//     direction; a key that is present but falsy is the fact that none resolved.
//
// The states, each the whole of what its records establish:
//
//   uncaught-with-handler  an arrival whose message text no boundary entry carries, with a
//                          handler in force — the finding names the message, the NG0NNN
//                          code the message itself matches, and the handler state.
//   reached-handler        the message text IS carried by a boundary entry — no finding;
//                          the join never decides which arrival was carried, because two
//                          identical messages are indistinguishable in the record (E2),
//                          so the answer is about the text and about nothing finer.
//   no-handler-provided    an uncaught text with no handler in force — the absence is
//                          named, and no handler name is invented for it.
//   cannot-tell            the records do not name the inputs the join reads, no arrival
//                          was recorded, no arrival names a message, or a comparison the
//                          answer needs cannot be performed — each stated in `detail`.
//
// The absences are the substance of the answer, so each is a value and never a missing
// field: `phase-not-recorded` unless a record itself carries a phase field (no record in
// this tree names the phase an uncaught error was thrown in — T001's absence, count 2),
// and `no-boundary-entry` when the boundary record is present and empty. A phase is never
// derived from the message text, and an empty boundary list is never read as a handler
// that saw nothing elsewhere: it is the named absence, carried beside the state.
//
// `owner` is filled only from a field the record itself carries — the arrival's own
// `component`, the one `getOwningComponent()` recorded for that arrival — and is null
// where the record names none; it is never borrowed from a neighbouring arrival. Each
// entry of `claims[]` carries the `artefactPath` the record it cites carries, and a
// record that names none is cited by no claim.
(function () {
  'use strict';

  // The code an arrival's message text carries, matched out of the text itself: the
  // listener records the same match, so the join re-derives it from the message and from
  // nothing else — a message with no NG0NNN in it answers `null` and never a guess.
  const CODE_PATTERN = /NG0\d{3,}/;

  const UNCAUGHT_WITH_HANDLER = 'uncaught-with-handler';
  const REACHED_HANDLER = 'reached-handler';
  const NO_HANDLER_PROVIDED = 'no-handler-provided';
  const CANNOT_TELL = 'cannot-tell';

  // The named absences, one per unanswered question, each in its own name.
  const PHASE_NOT_RECORDED = 'phase-not-recorded';
  const NO_BOUNDARY_ENTRY = 'no-boundary-entry';

  // A payload field behind a guard: the record crosses a message boundary and comes from
  // the page's own runtime, so a getter that throws reads as "no value here" rather than
  // losing the answer.
  function fieldOf(source, field) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[field];
    } catch (e) {
      return undefined;
    }
  }

  // A string that says something, or null. No empty string ever stands in for a fact the
  // record did not carry.
  function textOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // The message text a record carries: flat, as the listener's arrival payload records
  // it, or behind the record's own `error`, as a boundary entry records it. Anything else
  // is a record that names no message, and there is nothing to compare.
  function messageTextOf(record) {
    const flat = textOf(fieldOf(record, 'message'));
    if (flat !== null) return flat;
    return textOf(fieldOf(fieldOf(record, 'error'), 'message'));
  }

  function codeOf(message) {
    if (message === null) return null;
    const match = message.match(CODE_PATTERN);
    return match === null ? null : match[0];
  }

  // The handler name the handler record itself carries — a bare name, or the record's own
  // `name` field — or null, where the record names none and none is invented.
  function handlerNameOf(handler) {
    return textOf(handler) || textOf(fieldOf(handler, 'name'));
  }

  // The comparison the whole join turns on, by text and only by text. `true`: some entry
  // carries the text. `false`: no entry carries it — a determinate negative, including
  // where the boundary record is present and empty. `null` is the word for a comparison
  // that cannot be performed, and an answer that needs one and cannot have it is
  // `cannot-tell`, never a decision taken without it.
  function carriedByBoundaries(text, boundaries) {
    let carriedAny = false;
    for (const entry of boundaries) {
      const entryText = messageTextOf(entry);
      if (entryText === null) continue;
      if (entryText === text) return true;
    }
    return carriedAny;
  }

  // The phase, as a record of this join states it: echoed from the phase field a record
  // itself carries, and never derived from the message text — no record in this tree
  // names a phase, so the ordinary answer is the absence itself.
  function phaseOf(errors, boundaries) {
    for (const pool of [errors, boundaries]) {
      for (const record of pool) {
        const phase = textOf(fieldOf(record, 'phase'));
        if (phase !== null) return phase;
      }
    }
    return PHASE_NOT_RECORDED;
  }

  // One claim per record the answer cites, each carrying the artefactPath the record
  // itself carries. A record that names none is cited by no claim, and nothing is
  // invented here.
  function claimsOf(kind, claim, records) {
    const claims = [];
    for (const record of records) {
      const artefactPath = textOf(fieldOf(record, 'artefactPath'));
      if (artefactPath !== null) {
        claims.push({ kind: kind, claim: claim, artefactPath: artefactPath });
      }
    }
    return claims;
  }

  // One answer, built in one place, so a pin on its keys is a pin on every answer: the
  // eight contract fields, in every state, and no ninth.
  function answerOf(
    state,
    message,
    code,
    owner,
    phase,
    absences,
    claims,
    detail,
  ) {
    return {
      state: state,
      message: message,
      code: code,
      owner: owner,
      phase: phase,
      absences: absences,
      claims: claims,
      detail: detail,
    };
  }

  // The join. `records` is `{ errors, boundaries, handler }` and anything else on it is
  // ignored, so a caller cannot smuggle a boundary, a handler or a phase into an answer
  // through a field this file does not read.
  function errorRouting(records) {
    const read = records !== null && typeof records === 'object' ? records : {};
    const errorsField = fieldOf(read, 'errors');
    const boundariesField = fieldOf(read, 'boundaries');
    const errors = Array.isArray(errorsField) ? errorsField : null;
    const boundaries = Array.isArray(boundariesField) ? boundariesField : null;
    const handlerGiven = Object.prototype.hasOwnProperty.call(read, 'handler');
    const handler = handlerGiven ? read.handler : undefined;

    // The three inputs the join answers from. A key the records do not carry is missing,
    // and a missing record is never read as a negative answer.
    const missing = [];
    if (errors === null) missing.push('errors');
    if (boundaries === null) missing.push('boundaries');
    if (!handlerGiven) missing.push('handler');

    // The phase, only ever from a field a record carries.
    const phase =
      errors !== null && boundaries !== null
        ? phaseOf(errors, boundaries)
        : PHASE_NOT_RECORDED;

    // The absences, each in its own name: the phase no record states, and the boundary
    // record that is present and carries no entry to compare against.
    const absences = [];
    if (phase === PHASE_NOT_RECORDED) {
      absences.push(PHASE_NOT_RECORDED);
    }
    if (boundaries !== null && boundaries.length === 0) {
      absences.push(NO_BOUNDARY_ENTRY);
    }

    // The claims, one per record that carries an artefactPath to cite.
    let claims = [];
    if (errors !== null) {
      claims = claims.concat(
        claimsOf(
          'error-arrival',
          'the global error listener recorded this arrival',
          errors,
        ),
      );
    }
    if (boundaries !== null) {
      claims = claims.concat(
        claimsOf(
          'boundary-entry',
          'the resolved handler recorded this boundary entry',
          boundaries,
        ),
      );
    }
    if (handler !== null && typeof handler === 'object') {
      claims = claims.concat(
        claimsOf('handler', 'the page resolved this ErrorHandler', [handler]),
      );
    }

    if (missing.length > 0) {
      return answerOf(
        CANNOT_TELL,
        null,
        null,
        null,
        phase,
        absences,
        claims,
        'cannot tell: the records do not name ' +
          missing.join(' and ') +
          ', so the join reads nothing it was not handed',
      );
    }
    if (errors.length === 0) {
      return answerOf(
        CANNOT_TELL,
        null,
        null,
        null,
        phase,
        absences,
        claims,
        'cannot tell: no error arrival was recorded, so there is no error to answer about',
      );
    }

    // The scan, in arrival order but never decided by it: the first text that no entry
    // carries is the finding, and where every text is carried the answer is that no
    // finding exists. Two identical messages are indistinguishable in the record, so the
    // answer is about the text and never about which arrival it belonged to.
    let firstTexted = null;
    let uncaught = null;
    let incomparable = false;
    for (const arrival of errors) {
      const text = messageTextOf(arrival);
      if (text === null) continue;
      if (firstTexted === null) firstTexted = arrival;
      const carried = carriedByBoundaries(text, boundaries);
      if (carried === null) {
        incomparable = true;
        continue;
      }
      if (carried === false && uncaught === null) uncaught = arrival;
    }

    if (uncaught !== null) {
      const message = messageTextOf(uncaught);
      const owner = textOf(fieldOf(uncaught, 'component'));
      const code = codeOf(message);
      if (handler) {
        const name = handlerNameOf(handler);
        return answerOf(
          UNCAUGHT_WITH_HANDLER,
          message,
          code,
          owner,
          phase,
          absences,
          claims,
          'the error "' +
            message +
            '" is carried by no boundary entry and ' +
            (name === null
              ? 'an ErrorHandler'
              : 'the ErrorHandler "' + name + '"') +
            ' is in force, so nothing caught it',
        );
      }
      return answerOf(
        NO_HANDLER_PROVIDED,
        message,
        code,
        owner,
        phase,
        absences,
        claims,
        'no ErrorHandler resolved, so the error "' +
          message +
          '" was never offered to one',
      );
    }

    if (firstTexted !== null && !incomparable) {
      const message = messageTextOf(firstTexted);
      return answerOf(
        REACHED_HANDLER,
        message,
        codeOf(message),
        textOf(fieldOf(firstTexted, 'component')),
        phase,
        absences,
        claims,
        'no finding: a boundary entry carries the error "' +
          message +
          '", so the handler received it',
      );
    }

    if (firstTexted !== null) {
      const message = messageTextOf(firstTexted);
      return answerOf(
        CANNOT_TELL,
        message,
        codeOf(message),
        textOf(fieldOf(firstTexted, 'component')),
        phase,
        absences,
        claims,
        'cannot tell: a recorded arrival cannot be compared against the boundary entries, so an uncaught error cannot be ruled out',
      );
    }

    return answerOf(
      CANNOT_TELL,
      null,
      null,
      null,
      phase,
      absences,
      claims,
      'cannot tell: no recorded arrival names an error message, so there is nothing to compare',
    );
  }

  globalThis.angularAiErrorRouting = errorRouting;
})();
