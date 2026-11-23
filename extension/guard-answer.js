// guard-answer.js — the join behind M063: the guard whose verdict cancelled the navigation, the
// phase it ran in and the verdict it stated — answered from the guard record and from nothing else.
//
// The record joined here is the one T001 writes, `extension/guard-phase.js`: in every state an object
// of three fields,
//
//   { state, rows: [{ phase, guard, verdict, path }], absences: [{ field, path, reason }] }
//
// whose `rows` are one guard's own verdict per arrival, in arrival order, and whose `absences` name
// every field the record could not read. `guard` is null where the navigation named no guard — a
// `canMatch` guard runs before the route is known, so a phase with no guard is a real state (C2, E2)
// and not a gap to fill.
//
// One answer, in every state, with exactly these five fields:
//
//   state     `guard-cancelled`, `guard-phase-only`, `guard-allowed` or `cannot-tell`
//   phase     the phase the answered row ran in, as the record states it, or null
//   guard     the guard the answered row names, or null
//   verdict   `allowed` or `refused`, as the record states it, or null
//   absences  every absence the record states about the answered row, and every hole this join can
//             see in it that the record left unnamed — `{ field, path, reason }`, unrelabelled
//
// The four states, each the whole of what the record establishes, decided in this order — the
// strongest statement the record makes first:
//
//   cannot-tell       the record carries no readable row (no `rows` list at all, an empty one, or a
//                     row of nothing), so the answer is the record's own absence and never an empty
//                     finding: `guard-verdict-not-recorded`, the token `extension/navigation-
//                     narrator.js` already answers a navigation that recorded no guard verdict with
//                     (E1). Or the row the answer is about names neither a phase nor a guard — a
//                     refusal that names neither is exactly this. Or, where nothing refused, a row
//                     carries no verdict this join can state, because that row might have been the
//                     one that cancelled (E3, E4).
//   guard-cancelled   a row states `refused` and names its guard: the first such row in arrival order
//                     is named, with the phase it ran in. A later refusal did not stop the navigation
//                     first, and a guard that allowed it is never reported as the one that cancelled
//                     it (SC1, E7).
//   guard-phase-only  a row states its verdict, names the phase it ran in and no guard: the phase is
//                     recorded and the guard is not, so the answer is phase-only and is never
//                     attributed to the route that matched afterwards (C2, E2, N1).
//   guard-allowed     no row refused, every row's verdict is recorded, and the row the answer is
//                     about names its guard: the navigation was allowed and the guard is named. Where
//                     a row names a phase and no guard, that row is answered phase-only instead — an
//                     unnamed guard allowed nothing this answer can name.
//
// The row the answer is about is read from the record's own order and from nothing else: the first
// refusal when one refused, the first row whose verdict is unrecorded when that is why the answer
// cannot tell, the first row that names a phase and no guard where that is the record's strongest
// statement, and otherwise the first row that ran. Nothing is sorted, coalesced or attributed. The
// record's own `state` word is not read either: it is a reading of these same rows, and a second
// opinion about them is not evidence this join has. A value that carries no `rows` list is not the
// record — a bare list of rows is answered as no record at all, not as an empty one.
//
// Nothing here is read from the rendered tree, from the console, from the nearest route, from a
// neighbouring record or from a second argument: no DOM, no selector, no element, no inspector, no
// clock, no network, no page global and no read of a file. The only input is the one record, and every
// field of the answer is that record's own: a phase is a string the record placed — this join names
// no phase word at all, so it can invent none (SC3, E5) — a guard is a name the record carried, a
// verdict is one of the two words the record states, and an absence is an entry the record states
// about the answered row, copied as stated, its field, its path and its reason unrelabelled, with the
// hole this join can see in that row named in the record's own spelling where the record states none.
//
// The function is a pure function of that one record: it takes one argument, reads no second one,
// installs nothing, and reaches for no global beyond the single publication at the end. It throws on
// no input — an input that is not a record is answered as `cannot-tell`, and a field whose getter
// throws reads as an absent field — and it holds no state between calls.
(function () {
  'use strict';

  const GUARD_CANCELLED = 'guard-cancelled';
  const GUARD_PHASE_ONLY = 'guard-phase-only';
  const GUARD_ALLOWED = 'guard-allowed';
  const CANNOT_TELL = 'cannot-tell';

  // The two verdicts the record states, and the only two this join reads: a guard that allowed the
  // navigation and a guard that refused it.
  const ALLOWED = 'allowed';
  const REFUSED = 'refused';

  // The record's own envelope: its rows, in arrival order, and the absences it named.
  const ROWS = 'rows';
  const ABSENCES = 'absences';

  // The four fields a row carries — the record's own list (C1, SC3). One name each, read from the
  // row and answered from the row, so the record's fields and this join's inputs cannot drift apart.
  const PHASE = 'phase';
  const GUARD = 'guard';
  const VERDICT = 'verdict';
  const PATH = 'path';
  const ROW_FIELDS = [PHASE, GUARD, VERDICT, PATH];

  // An absence's own three fields, which this join copies and never relabels.
  const FIELD = 'field';
  const REASON = 'reason';

  // The record-level absence: the token the record and the narrator both answer a navigation that
  // recorded no guard verdict with. It is carried where the record states it, and named here where
  // the record states nothing at all.
  const GUARD_VERDICT_NOT_RECORDED = 'guard-verdict-not-recorded';

  // The spelling the record gives a hole in a row: `phase-not-recorded`, `guard-not-recorded`, and
  // the same for the other two. One suffix, so a hole this join names is spelled the way the record
  // spells it rather than in a vocabulary of this module's own.
  const NOT_RECORDED = '-not-recorded';

  // One field, read without letting a hostile getter throw into the join: the record crosses a
  // message boundary, and this function throws on no input, so a throwing field is an absent field
  // and never an exception.
  function fieldOf(source, key) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[key];
    } catch (error) {
      return undefined;
    }
  }

  // A name the record states, or null where it states none. The empty string is no name, so it is
  // recorded as the absence it is rather than completed into one.
  function nameOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // A path the record states, or null. The empty string is a path here — a componentless route's
  // own configured path — so it is never read as an absence.
  function pathOf(value) {
    return typeof value === 'string' ? value : null;
  }

  // The length of a list a record carries, or 0 where reading it throws. The list is read by index
  // below, so an iterator the record replaced cannot decide how many rows are answered.
  function lengthOf(list) {
    try {
      return typeof list.length === 'number' ? list.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // One row reduced to the four fields the record carries for it, or null where the row is nothing
  // to read. No field is completed: a value the record does not state stays null, and a verdict word
  // outside the record's own two is no verdict this join can state — the record nulls such a word,
  // and this join does not restore it.
  function rowOf(rows, index) {
    const row = fieldOf(rows, index);
    if (row === null || typeof row !== 'object') return null;
    const verdict = nameOf(fieldOf(row, VERDICT));
    return {
      phase: nameOf(fieldOf(row, PHASE)),
      guard: nameOf(fieldOf(row, GUARD)),
      verdict: verdict === REFUSED || verdict === ALLOWED ? verdict : null,
      path: pathOf(fieldOf(row, PATH)),
    };
  }

  // The absences the record states, read as entries this join can answer with, in the record's own
  // order. An entry the record does not spell is no statement at all, and none is invented here.
  function statedAbsences(record) {
    const listed = fieldOf(record, ABSENCES);
    const kept = [];
    if (!Array.isArray(listed)) return kept;
    const count = lengthOf(listed);
    for (let index = 0; index < count; index += 1) {
      const entry = fieldOf(listed, index);
      if (entry === null || typeof entry !== 'object') continue;
      const field = nameOf(fieldOf(entry, FIELD));
      const reason = nameOf(fieldOf(entry, REASON));
      if (field === null || reason === null) continue;
      kept.push({
        field: field,
        path: pathOf(fieldOf(entry, PATH)),
        reason: reason,
      });
    }
    return kept;
  }

  // The spelling the record gives a hole in a row.
  function holeReasonOf(field) {
    return field + NOT_RECORDED;
  }

  // Every absence the record states about the answered row, and no absence about another row: an
  // entry belongs to the row whose own path it carries and to a field that row left null. The holes
  // this join can see in that row and the record did not name are then named in the record's own
  // spelling, in the row's field order, so no hole is presented as a filled field and none is
  // dropped for being inconvenient.
  function absencesAbout(stated, row) {
    const kept = [];
    for (let index = 0; index < stated.length; index += 1) {
      const entry = stated[index];
      if (entry.path !== row.path) continue;
      if (ROW_FIELDS.indexOf(entry.field) === -1) continue;
      if (row[entry.field] !== null) continue;
      kept.push({
        field: entry.field,
        path: entry.path,
        reason: entry.reason,
      });
    }
    for (let index = 0; index < ROW_FIELDS.length; index += 1) {
      const field = ROW_FIELDS[index];
      if (row[field] !== null) continue;
      let named = false;
      for (let at = 0; at < kept.length; at += 1) {
        if (kept[at].field === field) named = true;
      }
      if (!named) {
        kept.push({
          field: field,
          path: row.path,
          reason: holeReasonOf(field),
        });
      }
    }
    return kept;
  }

  // One answer, built in one place, so a pin on its fields is a pin on every answer: the five
  // contract fields, in every state, and no sixth.
  function answerOf(state, phase, guard, verdict, absences) {
    return {
      state: state,
      phase: phase,
      guard: guard,
      verdict: verdict,
      absences: absences,
    };
  }

  // What the record establishes about one row: the whole finding where the row names its guard, the
  // phase-only state where it names a phase, a verdict and no guard, and cannot-tell where it names
  // neither — never a phase lent to it from the route that matched afterwards (E2, N1).
  function answerAbout(row, state, stated) {
    const absences = absencesAbout(stated, row);
    if (row.guard !== null) {
      return answerOf(state, row.phase, row.guard, row.verdict, absences);
    }
    if (row.phase !== null && row.verdict !== null) {
      return answerOf(GUARD_PHASE_ONLY, row.phase, null, row.verdict, absences);
    }
    return answerOf(CANNOT_TELL, row.phase, null, row.verdict, absences);
  }

  // The first row the record carries that meets a reading of it, in arrival order, or null.
  function firstRowOf(rows, accepts) {
    for (let index = 0; index < rows.length; index += 1) {
      if (accepts(rows[index])) return rows[index];
    }
    return null;
  }

  // The absence a record that carries no readable row is answered with: the entries the record states
  // as stated, and `guard-verdict-not-recorded` where it states none.
  function noRowAbsences(stated) {
    if (stated.length > 0) {
      const kept = [];
      for (let index = 0; index < stated.length; index += 1) {
        kept.push({
          field: stated[index].field,
          path: stated[index].path,
          reason: stated[index].reason,
        });
      }
      return kept;
    }
    return [{ field: GUARD, path: null, reason: GUARD_VERDICT_NOT_RECORDED }];
  }

  // The join: the record it is handed, and nothing beside it.
  function guardAnswer(record) {
    const stated = statedAbsences(record);

    const rows = [];
    const listed = fieldOf(record, ROWS);
    if (Array.isArray(listed)) {
      const count = lengthOf(listed);
      for (let index = 0; index < count; index += 1) {
        const row = rowOf(listed, index);
        if (row !== null) rows.push(row);
      }
    }

    // An empty row list would read as "a guard ran and said nothing", which is a claim; the record's
    // own absence is the honest answer, and it is the one the narrator already answers with (E1).
    if (rows.length === 0) {
      return answerOf(CANNOT_TELL, null, null, null, noRowAbsences(stated));
    }

    // The verdict that cancelled the navigation: the first refusal the record states, in the order
    // the verdicts arrived. A later refusal did not stop the navigation first, and a guard that
    // allowed it is never reported as the one that cancelled it (SC1, E7).
    const refused = firstRowOf(rows, (row) => row.verdict === REFUSED);
    if (refused !== null) {
      return answerAbout(refused, GUARD_CANCELLED, stated);
    }

    // Nothing refused. A row whose verdict the record does not carry leaves the navigation's own
    // verdict unstated — that guard's own observation never arrived — so the answer is cannot-tell
    // with the record's reason, never a pass (E3, E4).
    const unstated = firstRowOf(rows, (row) => row.verdict === null);
    if (unstated !== null) {
      return answerAbout(unstated, CANNOT_TELL, stated);
    }

    // Every verdict is recorded and none refused: the navigation was allowed. The row the answer is
    // about is the first that names no guard — a phase with no owner, reported by phase and never
    // attributed to the route that matched afterwards (C2, E2) — and otherwise the first row that ran.
    const unnamed = firstRowOf(rows, (row) => row.guard === null);
    const allowed = unnamed === null ? rows[0] : unnamed;
    return answerAbout(allowed, GUARD_ALLOWED, stated);
  }

  // The single publication: the join itself, so a caller reads one record and calls one function.
  globalThis.angularAiGuardAnswer = guardAnswer;
})();
