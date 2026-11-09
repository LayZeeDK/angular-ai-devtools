// error-boundary.js — runs in the page's isolated world beside agent-main.js.
// The join between the boundary record the page agent carries (`extension/agent-main.js`, T003) and
// what a surface renders: the two component types, the caught error's own identity, the route the
// error arrived by and every named absence the record answers for. A record goes in and an answer
// comes out — `{ state, absence, findings, absences, version, coreVersion, fallback }` — with no DOM,
// no clock, no console, no page read and no second tap in this file.
//
// Six rules decide every answer, and each is a rule the record can be held to:
//
//   - Two facts, never one (SC1, N1). `details.boundaryType` is the *declaring* view — the component
//     whose own `@boundary` caught the error — and `details.declarationType` is the *throwing* view,
//     the declaration the catch carried. On the change-detection path they are two different LViews;
//     on the construction path they are the same view, so the finding carries the same name twice,
//     and no parent is ever derived from it. A finding's declaring type is read from the boundary's
//     own field and from nowhere else, so a component that threw is never presented as the boundary.
//   - The error, not the fallback (SC2, N2). The error is the thrown value: its own `name` and
//     `message`, and its `cause` only where the boundary wrapped a value that is not `Error`-like.
//     The text the rendered `@error` view carried is content the boundary rendered *instead*, so it
//     is reported as `fallback` and never as the error — an error whose message and whose fallback
//     disagree is an ordinary case, not a trap.
//   - No details, no boundary (SC3, N3). An arrival by the handler route carried no `ErrorDetails`,
//     so it names no boundary, no declaring component and no caught-by mechanism, and its absence is
//     `no-boundary-details` — never "the app kept no error".
//   - The replaced subtree is unobtainable (SC4, N4). `LBoundary` holds `error` and its host view
//     only and the primary view is removed, so no node, tag, text or count of it survives anywhere
//     and the finding carries the named absence `no-replaced-subtree` and nothing else.
//   - Raw browser errors (SC5, N5). An absence of browser global error listeners is that absence —
//     `no-global-error-listeners` — and never evidence that no raw error occurred.
//   - Absent machinery answers absent machinery. A record whose state is `cannot-tell` carries the
//     page agent's own absence (`machinery-unconfirmed`, `handler-unresolved`, `hook-refused`) and is
//     propagated as `cannot-tell`, never as an empty boundary list.
//
// What this file never does: it never invents a version (a page that reports none is `coreVersion:
// null` plus the absence `no-core-version`), it never invents a boundary from a neighbouring arrival,
// and it never coerces a state it was not written for — that state travels through and carries no
// finding and no absence.
//
// The absences are the substance of the answer, so each is a value and never a missing field: one
// absence per unanswered question, each in its own name, and none rendered as a zero, as an empty
// string, or as "no errors occurred".
(function () {
  'use strict';

  // The version of @angular/core this surface works against: the version the fixture runs and the
  // milestone measured, read from that install's manifest and recorded at
  // `research/raw/m042-error-boundary.json` (`version.declares.coreVersion`, T001). No page reports
  // its own version (`version.enumerated.reportsItsOwnVersion` measured 0), so this is a declared
  // constant and never a read; what a page *did* report is `coreVersion`, `null` where it reported
  // nothing — the record may not invent one, and neither may this file.
  const WORKED_AGAINST_VERSION = '22.2.2';

  const CAUGHT = 'caught';
  const CANNOT_TELL = 'cannot-tell';
  const INSTALLED = 'installed';

  // The two routes the page agent records: `hook` is an arrival that carried `details`, `handler` is
  // a delivery that carried none. They are the only routes a finding has, and the word itself is the
  // whole difference — no surface has to interpret an event number to tell them apart.
  const HOOK_ROUTE = 'hook';
  const HANDLER_ROUTE = 'handler';

  // The named absences. The first six are the ones INTENT.md's scope names, in its own order; the
  // next three are the page agent's own (T003, `boundaryField().absence`); the last is the version
  // question T001 measured no page answers.
  const NO_ERROR_BOUNDARY_DECLARED = 'no-error-boundary-declared';
  const NO_ERROR_CAUGHT = 'no-error-caught';
  const NO_BOUNDARY_DETAILS = 'no-boundary-details';
  const NO_ERROR_VIEW_RENDERED = 'no-error-view-rendered';
  const NO_REPLACED_SUBTREE = 'no-replaced-subtree';
  const NO_GLOBAL_ERROR_LISTENERS = 'no-global-error-listeners';
  const MACHINERY_UNCONFIRMED = 'machinery-unconfirmed';
  const HANDLER_UNRESOLVED = 'handler-unresolved';
  const HOOK_REFUSED = 'hook-refused';
  const NO_CORE_VERSION = 'no-core-version';

  // Every absence once, in the order the intent lists them, so two answers carrying the same
  // absences are the same list whatever order the questions were answered in.
  const ABSENCE_ORDER = [
    NO_ERROR_BOUNDARY_DECLARED,
    NO_ERROR_CAUGHT,
    NO_BOUNDARY_DETAILS,
    NO_ERROR_VIEW_RENDERED,
    NO_REPLACED_SUBTREE,
    NO_GLOBAL_ERROR_LISTENERS,
    MACHINERY_UNCONFIRMED,
    HANDLER_UNRESOLVED,
    HOOK_REFUSED,
    NO_CORE_VERSION,
  ];

  // A payload field behind a guard: the record crosses a message boundary and comes from the page's
  // own runtime, so a getter that throws reads as "no value here" rather than losing the answer.
  function fieldOf(source, field) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[field];
    } catch (e) {
      return undefined;
    }
  }

  // A string that says something, or null. Every text field of a finding and of the answer is read
  // through this one function, so no empty string can ever stand in for a fact the record did not
  // carry.
  function textOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // `true` where the record carried the fact, `null` where it did not — never `false`: a surface has
  // no third word to print, and "not available" must not read as "not carried". The reset is
  // reported as available only where the record carries one, and the caught-by mechanism only where
  // the payload carried one.
  function carriedOf(value) {
    return value === true ? true : null;
  }

  // The cause, and only the cause the record itself carried. `encapsulateBoundaryError` returns an
  // error-like value as it stands and wraps anything else in a `BoundaryError` whose `cause` is the
  // thrown value, so the field is present exactly on the wrapper and absent on an error the app threw
  // itself. Nothing is re-derived, re-wrapped or stringified here: a value that is not plain data is
  // not reported at all.
  function causeOf(value) {
    if (value === null || typeof value === 'undefined') return null;
    const kind = typeof value;
    if (kind === 'string') return value === '' ? null : value;
    if (kind === 'number' || kind === 'boolean') return value;
    if (kind === 'object') return value;
    return null;
  }

  // The route an entry arrived by, or null for a word the reader was not written for. The word is
  // echoed rather than mapped: `hook` stays `hook`, `handler` stays `handler`.
  function routeOf(value) {
    return value === HOOK_ROUTE || value === HANDLER_ROUTE ? value : null;
  }

  // One finding, built in one place, so a pin on its fields is a pin on every finding. It carries
  // exactly the nine fields the contract names and there is no branch in this file that can add a
  // tenth: this object literal is the whole vocabulary a finding has — no parent type, no node, no
  // tag, no count, no fallback text.
  function findingOf(entry) {
    if (entry === null || typeof entry !== 'object') return null;
    const error = fieldOf(entry, 'error');
    const details = fieldOf(entry, 'details');
    return {
      // The *declaring* view: the component whose own `@boundary` caught this error, read from the
      // boundary's own type. This is the only place a boundary name ever comes from (N1).
      declaringType: textOf(fieldOf(details, 'boundaryType')),
      // The *throwing* view: the declaration the catch carried. On the construction path this is the
      // declaring view itself — the same name, never a parent derived from it.
      throwingType: textOf(fieldOf(details, 'declarationType')),
      // The catching view's own `ON_ERROR` callback: the record keeps the one plain fact it carries,
      // that one was there, because the function itself cannot cross the message boundary.
      caughtBy: carriedOf(fieldOf(details, 'caughtBy')),
      // The boundary's `reset()`, reported as available only where the record carries it.
      reset: carriedOf(fieldOf(details, 'boundaryReset')),
      // The error the boundary received: its own name and its own message, and never the text the
      // rendered `@error` view carried (N2).
      errorName: textOf(fieldOf(error, 'name')),
      errorMessage: textOf(fieldOf(error, 'message')),
      cause: causeOf(fieldOf(error, 'cause')),
      route: routeOf(fieldOf(entry, 'route')),
      // The replaced subtree is recorded nowhere, so the finding carries the absence and no node, tag,
      // text or count of the primary view appears in any field of this object (N4).
      replacedSubtree: NO_REPLACED_SUBTREE,
    };
  }

  // The version the page reported, or null where it reported none — echoed, never invented.
  function reportedCoreVersion(read) {
    return textOf(fieldOf(read, 'coreVersion'));
  }

  // The after-the-fact reader's own answer, where the record carries one: the rendered `@error` view
  // is the only place its text exists, so its absence is the record's fact and never this file's
  // inference. A record that does not carry the section means the reader was not asked in this
  // window, and no absence is claimed then — the same discipline `globalListeners: null` follows.
  function errorViewOf(read) {
    return fieldOf(read, 'errorView');
  }

  // The text the boundary's `@error` view rendered, as content. It is reported under its own name and
  // under no other, and no finding field ever carries it (N2).
  function fallbackOf(read) {
    const view = errorViewOf(read);
    if (fieldOf(view, 'state') !== 'rendered') return null;
    return textOf(fieldOf(view, 'text'));
  }

  // The page agent's own absence for a hook it could not install, echoed as it arrived. A word this
  // file was not written for is answered as `machinery-unconfirmed`, because that is the one thing a
  // record naming no reason has established: the machinery was not confirmed.
  function machineryAbsenceOf(value) {
    const named = textOf(value);
    if (
      named === MACHINERY_UNCONFIRMED ||
      named === HANDLER_UNRESOLVED ||
      named === HOOK_REFUSED
    ) {
      return named;
    }
    return MACHINERY_UNCONFIRMED;
  }

  // Every named absence once, in the intent's own order.
  function ordered(absences) {
    const kept = [];
    for (const absence of ABSENCE_ORDER) {
      if (absences.indexOf(absence) !== -1) kept.push(absence);
    }
    return kept;
  }

  // The absences the record itself answers, whatever the arrivals are: the browser listeners the page
  // did not declare (and only where the walk completed and found none — `null` means the page
  // publishes no reader and is not an absence), the `@error` view the reader did not find, and the
  // core version no page reports.
  function recordAbsences(read) {
    const absences = [];
    if (fieldOf(read, 'globalListeners') === NO_GLOBAL_ERROR_LISTENERS) {
      absences.push(NO_GLOBAL_ERROR_LISTENERS);
    }
    if (fieldOf(errorViewOf(read), 'state') === NO_ERROR_VIEW_RENDERED) {
      absences.push(NO_ERROR_VIEW_RENDERED);
    }
    if (reportedCoreVersion(read) === null) absences.push(NO_CORE_VERSION);
    return absences;
  }

  // One answer, built in one place, so a pin on its keys is a pin on every answer.
  function answerOf(state, absence, findings, absences, read) {
    return {
      state: state,
      absence: absence,
      findings: findings,
      absences: ordered(absences),
      version: WORKED_AGAINST_VERSION,
      coreVersion: reportedCoreVersion(read),
      fallback: fallbackOf(read),
    };
  }

  // The join. `record` is the boundary section the page agent publishes beside its change-detection
  // and router records — `{ state, absence, chained, globalListeners, version, coreVersion, entries }`
  // — and anything else on it is ignored, so a caller cannot smuggle a boundary, a cause or a subtree
  // into an answer through a field this file does not read.
  function readErrorBoundary(record) {
    const read = record !== null && typeof record === 'object' ? record : {};
    const state = fieldOf(read, 'state');

    // 1. A record that carries no boundary state is not a boundary record: nothing on this page
    //    published a boundary reader, so nothing declared a boundary and nothing named one. That is
    //    `no-error-boundary-declared` — with no boundary, no declaring component and no reset, and
    //    never an empty string standing in for a boundary (SC1, E2).
    if (typeof state !== 'string' || state === '') {
      return answerOf(
        CANNOT_TELL,
        NO_ERROR_BOUNDARY_DECLARED,
        [],
        [NO_ERROR_BOUNDARY_DECLARED],
        {},
      );
    }

    // 2. The machinery answer the page agent already gave travels through with its own name: a build
    //    that cannot be confirmed, a handler that could not be resolved or one that refused the hook
    //    is `cannot-tell` with that absence and never an empty boundary list.
    if (state === CANNOT_TELL) {
      const absence = machineryAbsenceOf(fieldOf(read, 'absence'));
      return answerOf(
        CANNOT_TELL,
        absence,
        [],
        [absence].concat(recordAbsences(read)),
        read,
      );
    }

    // 3. A state this reader was not written for travels through rather than being coerced into a
    //    neighbouring one, and carries no finding and no absence: the word is all it says.
    if (state !== INSTALLED) {
      return answerOf(state, null, [], [], read);
    }

    // 4. Installed. The arrivals in arrival order; an entry this reader was not written for is not an
    //    arrival and contributes no finding.
    const entries = fieldOf(read, 'entries');
    const list = Array.isArray(entries) ? entries : [];
    const findings = [];
    for (const entry of list) {
      const finding = findingOf(entry);
      if (finding !== null) findings.push(finding);
    }

    const absences = recordAbsences(read);

    // The hook is blind until an error occurs: nothing enumerates boundaries, so a page with a
    // boundary that has not thrown is indistinguishable from one with no boundary at all. The honest
    // answer is that nothing was caught — never that no boundary exists, and never a count of zero.
    if (findings.length === 0) {
      return answerOf(
        CANNOT_TELL,
        NO_ERROR_CAUGHT,
        findings,
        [NO_ERROR_CAUGHT].concat(absences),
        read,
      );
    }

    // Every answer that carries a finding names the subtree the boundary replaced, because it is
    // recorded nowhere: `LBoundary` holds `error` and its host view only (N4, E8).
    absences.push(NO_REPLACED_SUBTREE);

    // An arrival that carried no details has no boundary, and its own absence is `no-boundary-details`
    // — never "the app kept no error", and never borrowed from a neighbouring arrival (N3, E7).
    if (findings.some((finding) => finding.route === HANDLER_ROUTE)) {
      absences.push(NO_BOUNDARY_DETAILS);
    }

    // Which arrival, if any, named a boundary. A delivery that carried no details and a hook arrival
    // whose payload carried no boundary are two different answers, and neither is the other.
    const namesABoundary = findings.some(
      (finding) => finding.declaringType !== null,
    );
    let absence = null;
    if (!namesABoundary) {
      const everyArrivalWasADelivery = findings.every(
        (finding) => finding.route === HANDLER_ROUTE,
      );
      absence = everyArrivalWasADelivery
        ? NO_BOUNDARY_DETAILS
        : NO_ERROR_BOUNDARY_DECLARED;
      absences.push(absence);
    }

    return answerOf(
      absence === null ? CAUGHT : CANNOT_TELL,
      absence,
      findings,
      absences,
      read,
    );
  }

  const namespace = { readErrorBoundary: readErrorBoundary };

  if (globalThis.angularAiErrorBoundary) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiErrorBoundary, namespace);
  } else {
    globalThis.angularAiErrorBoundary = namespace;
  }
})();
