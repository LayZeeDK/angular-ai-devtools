// import-failure.js — the record M064 writes: one entry per dynamic-import attempt the router makes —
// the specifier the import was given, the route path whose configuration requested it, and either the
// response the request produced (its status and the content hash of its body) or the fact that the
// attempt never completed.
//
// Measured before this milestone, and the reason this file exists rather than a wider read of an
// existing one:
//
//   - `grep -c "chunk" extension/agent-main.js` is 0: the agent's own record carries no chunk name.
//   - `extension/navigation-narrator.js:26` states that the route-config payloads carry `{route, type}`
//     and no chunk and no task, so nothing in the navigation stream names a specifier.
//   - nothing under `extension/` records an import failure at all: no other module in that directory
//     names an import specifier, and a route-config load that ends says only that it ended. A lazy
//     route whose chunk never arrives therefore leaves the navigation stream with a load start and no
//     end, and no record of what was asked for.
//
// What this record carries is what the attempt produced, and nothing about what it means: no cause, no
// remedy, no version drift and no identity the attempt did not produce — no chunk name read back as a
// specifier, no version pair, no hypothesis about the server (SC1). A resolved import is recorded as
// `resolved` rather than omitted, because "the import worked" and "no import was recorded" are
// different answers, and a join that dropped the first would report a clean stream.
//
// The attempt record, as the writer and the observer below are handed it — one per dynamic-import
// attempt, written by the single tap the content script installs at the place it already observes
// navigation:
//
//   { specifier, routePath, status, hash, outcome }
//
//   specifier   the import specifier the router's `import()` was called with, as the page stated it.
//               Never a chunk name recovered from a request URL: a filename is not the specifier, and
//               this record takes the specifier the caller's own record carried or reports it absent.
//   routePath   the configured path of the route whose route-config load requested the import, `''`
//               for a componentless route and the root, and absent where no route owned the attempt.
//   status      the status the response carried, when a response arrived. An attempt whose request
//               never received one carries no status at all, and none is invented to stand in (E4).
//   hash        the content hash of the response body, when the page computed one. It is present only
//               where the record carried it: a hash is never derived from a filename, a size or a
//               status, and a failed request that produced no body produces no hash (E3).
//   outcome     `loaded` when the import promise resolved, `failed` when it rejected, and absent where
//               the page did not record what the attempt returned.
//
// The answer is one object, in every state, with exactly these fields (the surface renders this and
// nothing else):
//
//   { state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
//
//   state            `missing-import`  the import failed and the record names the specifier
//                    `never-completed` the attempt's request produced no response status
//                    `resolved`       the import loaded, so there is no failure to report
//                    `cannot-tell`    a reason on its own
//   specifier        the specifier the attempt's own record carried, and only then (SC3)
//   routePath        the owning route path the record carried, and only then
//   status           the status a response carried, only where one arrived (E4)
//   hash             the content hash the record carried, only where it carried one (E3)
//   consideredCount  the number of attempts the answer walked, stated only by an answer produced from
//                    a list: a single attempt is one attempt and says so by carrying no count
//   reason           a token from the closed set below, never prose and never a cause:
//                      `record-unreadable`      the value handed over is not an attempt record
//                      `no-import-recorded`     the record carried no attempt at all
//                      `specifier-not-recorded` a failed attempt that names no specifier, so there is
//                                               no missing import to name
//                      `no-response`            the attempt completed no request: its own reason for
//                                               being `never-completed`
//                      `outcome-not-recorded`   the record does not say what the attempt returned, so
//                                               nothing here calls it a failure
//
// `no-response` is the one reason that rides on a state other than `cannot-tell`: a `never-completed`
// attempt names the fact that it never completed, and nothing about why.
//
// The join selects from a list — a whole record of attempts — the way `extension/lint-core.js`
// selects from a capture: what the imports did outranks what could not be told, a failure outranks a
// resolution, and among answers of one kind the first in the record's order answers. One answer never
// stands in for another's, and no set of answers is folded into a count of failures.
//
// This module is one pure writer and one observer, and it reads nothing else: no imports, no DOM, no
// clock, no console, no network — it opens no request to learn a status or a hash, and it wraps no
// `import()` of its own, because the tap is the caller's and this file only writes down what the tap
// saw. A bare `node:vm` context with nothing in it is enough to run it, which is what its suite
// proves. The pure writer holds no state between calls, the observer keeps its answers in arrival
// order and never sorts them, and nothing here writes to a page: the record is the record the caller
// publishes.
(function () {
  'use strict';

  // The four states, and the verdict a question the record does not answer carries.
  const MISSING_IMPORT = 'missing-import';
  const NEVER_COMPLETED = 'never-completed';
  const RESOLVED = 'resolved';
  const CANNOT_TELL = 'cannot-tell';

  // The absences, published as names rather than prose so a caller compares a constant and a surface
  // renders the absence it was handed.
  const RECORD_UNREADABLE = 'record-unreadable';
  const NO_IMPORT_RECORDED = 'no-import-recorded';
  const SPECIFIER_NOT_RECORDED = 'specifier-not-recorded';
  const NO_RESPONSE = 'no-response';
  const OUTCOME_NOT_RECORDED = 'outcome-not-recorded';

  // The two values an attempt's own `outcome` field may take: what the import returned, and nothing
  // about why it returned it.
  const LOADED = 'loaded';
  const FAILED = 'failed';

  // The closed sets, exported so a caller, a record and a surface all read one list (SC3).
  const STATES = [MISSING_IMPORT, NEVER_COMPLETED, RESOLVED, CANNOT_TELL];
  const REASONS = [
    RECORD_UNREADABLE,
    NO_IMPORT_RECORDED,
    SPECIFIER_NOT_RECORDED,
    NO_RESPONSE,
    OUTCOME_NOT_RECORDED,
  ];
  const FIELDS = [
    'state',
    'specifier',
    'routePath',
    'status',
    'hash',
    'consideredCount',
    'reason',
  ];
  const ATTEMPT_FIELDS = [
    'specifier',
    'routePath',
    'status',
    'hash',
    'outcome',
  ];
  const OUTCOMES = [LOADED, FAILED];

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A string that says something, or null. A blank specifier names no specifier, so it is read as an
  // absence rather than as an empty one.
  function nonEmptyText(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // A response status the page could have read: an integer HTTP status. A string, a float, a `NaN` and
  // a plausible-looking 0 are all the same absence here, so a status that arrived is never confused
  // with one that was written down.
  function isStatus(value) {
    return (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 100 &&
      value <= 599
    );
  }

  // A route path the record states. `''` is a route path — a componentless route and the root both
  // state one — so it is kept as stated and is not read as an absence.
  function isRoutePath(value) {
    return typeof value === 'string';
  }

  // One attempt, read as what the record says and nothing more. An object carrying none of the attempt
  // fields is not an attempt record at all, which is a different answer from an attempt that says
  // nothing about its outcome: the first is `record-unreadable`, the second is a named absence.
  function readAttempt(value) {
    if (!isObject(value)) return null;
    let stated = false;
    for (let i = 0; i < ATTEMPT_FIELDS.length; i += 1) {
      if (ATTEMPT_FIELDS[i] in value) stated = true;
    }
    if (!stated) return null;
    return {
      specifier: nonEmptyText(value.specifier),
      routePath: isRoutePath(value.routePath) ? value.routePath : null,
      status: isStatus(value.status) ? value.status : null,
      hash: nonEmptyText(value.hash),
      outcome: OUTCOMES.indexOf(value.outcome) === -1 ? null : value.outcome,
    };
  }

  // The one place an answer is written. A field the record did not carry is left out entirely rather
  // than written as null, a placeholder or a guess, so `hash` and `status` are absent when nothing
  // produced them (E3, E4).
  function putCarried(written, name, value) {
    if (value !== null && value !== undefined) written[name] = value;
    return written;
  }

  // One attempt's state, from what the attempt's own record says it returned: a loaded import is a
  // resolution and never a failure, and a failed one is a missing import only when it names the
  // specifier and a response arrived.
  function stateOf(entry) {
    if (entry.outcome === LOADED) return RESOLVED;
    if (entry.outcome !== FAILED) return CANNOT_TELL;
    if (entry.specifier === null) return CANNOT_TELL;
    return entry.status === null ? NEVER_COMPLETED : MISSING_IMPORT;
  }

  // The absence a cannot-tell attempt names: what the record did not say, and never what it might have
  // meant.
  function cannotTellReason(entry) {
    if (entry.outcome !== LOADED && entry.outcome !== FAILED) {
      return OUTCOME_NOT_RECORDED;
    }
    return SPECIFIER_NOT_RECORDED;
  }

  // An absence, written in one place so every way of reaching it says the same thing and nothing that
  // reads as a cause, a fix or a clean stream.
  function absence(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // One attempt's answer: the state first, then only the fields the attempt's own record carried, in
  // the order the interface names them, and a `never-completed` attempt naming the one fact it knows.
  function answerFor(entry) {
    const state = stateOf(entry);
    if (state === CANNOT_TELL) return absence(cannotTellReason(entry));
    const written = putCarried({ state: state }, 'specifier', entry.specifier);
    putCarried(written, 'routePath', entry.routePath);
    putCarried(written, 'status', entry.status);
    putCarried(written, 'hash', entry.hash);
    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;
    return written;
  }

  // An answer handed to a caller twice is two values: the observer publishes copies, so an edit to
  // what it handed out cannot rewrite the record it keeps.
  function copyAnswer(written) {
    return Object.assign({}, written);
  }

  // An answer produced from a list states the number of attempts it walked, so a surface can render
  // "one failure among three import attempts" rather than a failure alone.
  function counted(written, consideredCount) {
    const answer = copyAnswer(written);
    answer.consideredCount = consideredCount;
    return answer;
  }

  // The answer a list of attempts warrants: a failure outranks a resolution and a resolution outranks
  // an absence, because what the imports did outranks what could not be told. Among answers of one
  // kind the first in the record's order answers, and no answer is lent another's field.
  function select(answers) {
    if (answers.length === 0) {
      return counted(absence(NO_IMPORT_RECORDED), 0);
    }
    const ranking = [MISSING_IMPORT, NEVER_COMPLETED, RESOLVED];
    for (let i = 0; i < ranking.length; i += 1) {
      for (let j = 0; j < answers.length; j += 1) {
        if (answers[j].state === ranking[i]) {
          return counted(answers[j], answers.length);
        }
      }
    }
    return counted(answers[0], answers.length);
  }

  // The join. `record` is either one attempt as the tap wrote it, or a record carrying the list of
  // attempts it collected in `importAttempts`. Nothing else on the record is read.
  function importFailure(record) {
    if (!isObject(record)) return absence(RECORD_UNREADABLE);
    if (!Array.isArray(record.importAttempts)) {
      const entry = readAttempt(record);
      if (entry === null) return absence(RECORD_UNREADABLE);
      return answerFor(entry);
    }
    const answers = [];
    for (let i = 0; i < record.importAttempts.length; i += 1) {
      const entry = readAttempt(record.importAttempts[i]);
      answers.push(
        entry === null ? absence(RECORD_UNREADABLE) : answerFor(entry),
      );
    }
    return select(answers);
  }

  // The one observer. The content script installs it at the single place it already observes
  // navigation and hands it each attempt the router's import returned; it writes the answer for that
  // attempt, keeps it in arrival order, and answers the record of the run. It installs no tap of its
  // own — no `import()` wrapped, no request observed, no page global read — and it never sorts, folds
  // or deduplicates what it was handed.
  function observeImportFailures() {
    const written = [];
    return {
      // One attempt, as the tap saw it: the answer is the pure writer's, and it is kept.
      observe: function (attempt) {
        const entry = readAttempt(attempt);
        const answer =
          entry === null ? absence(RECORD_UNREADABLE) : answerFor(entry);
        written.push(answer);
        return copyAnswer(answer);
      },
      // Every answer the observer wrote, in arrival order, as copies: a caller cannot edit the record
      // by editing what it was handed.
      answers: function () {
        const answers = [];
        for (let i = 0; i < written.length; i += 1) {
          answers.push(copyAnswer(written[i]));
        }
        return answers;
      },
      // The one answer the run warrants, with the number of attempts it considered.
      summary: function () {
        return select(written);
      },
      // How many attempts were recorded, which is what the summary's count states.
      size: function () {
        return written.length;
      },
    };
  }

  const namespace = {
    importFailure: importFailure,
    observeImportFailures: observeImportFailures,
    STATES: STATES,
    REASONS: REASONS,
    FIELDS: FIELDS,
    ATTEMPT_FIELDS: ATTEMPT_FIELDS,
    OUTCOMES: OUTCOMES,
    MISSING_IMPORT: MISSING_IMPORT,
    NEVER_COMPLETED: NEVER_COMPLETED,
    RESOLVED: RESOLVED,
    CANNOT_TELL: CANNOT_TELL,
    RECORD_UNREADABLE: RECORD_UNREADABLE,
    NO_IMPORT_RECORDED: NO_IMPORT_RECORDED,
    SPECIFIER_NOT_RECORDED: SPECIFIER_NOT_RECORDED,
    NO_RESPONSE: NO_RESPONSE,
    OUTCOME_NOT_RECORDED: OUTCOME_NOT_RECORDED,
  };

  const g = globalThis;
  if (g.angularAiImportFailure) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(g.angularAiImportFailure, namespace);
  } else {
    g.angularAiImportFailure = namespace;
  }
})();
