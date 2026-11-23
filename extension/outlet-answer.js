// outlet-answer.js — the join behind M062: the outlet a route's configuration requested, the
// outlet name the router state matched for that route, the route's own path, and the absences
// the record states where it carries no name — answered from the outlet record and from
// nothing else.
//
// The record joined here is the one T001 writes, `extension/outlet-state.js`: in every state an
// object of three fields, `{ state, routes: [{ requested, matched, path }], absences: [{ field,
// path, reason }] }`, the root route first and the rest depth-first in the order the route's
// outlets are declared. `requested` is the outlet the route configuration stated and `matched`
// the outlet name the router state carried; each is null where the record could not read one,
// and the absence that says so is named in `absences`.
//
// The four states, each the whole of what its record establishes, decided in this order — the
// strongest statement the record makes first:
//
//   cannot-tell            the record carries no route row this answer can read — no `routes`
//                          list at all, an empty one, or a row of nothing — or the route the
//                          answer is about carries no `matched` outlet name. The reason is the
//                          record's own where it states one; where it states none, the join
//                          names the hole in the input it was handed (`no-outlet-record` for no
//                          list, `no-route-row` for a list with no row to read).
//   outlet-absent          both names are recorded and they are not the same outlet: the outlet
//                          the configuration requested is absent from the outlet the state
//                          matched. Both names are reported, so a reader sees which one moved;
//                          no cause and no remedy is named.
//   outlet-matched         the recorded `requested` name and the recorded `matched` name are
//                          the same outlet.
//   outlet-unnamed-primary the route configuration stated no outlet and the matched name is
//                          `primary`, so the request is reported as `primary` by the
//                          normalisation below.
//
// The route the answer is about is the first row the record carries that names an outlet other
// than the unnamed primary, in the record's own declaration order; a record that names no other
// outlet is answered for its first row. Two consequences, both pinned by the suite: two outlets
// declared one after the other name the first and never the last one read, and a row that names
// an outlet but carries no matched name is answered where it is found as `cannot-tell`, never
// skipped over for a later row that could answer more.
//
// `primary` is written in exactly one place below: an absent `requested` is reported as
// `primary`, because an unnamed outlet and the outlet named `primary` are the same outlet (C2).
// The record keeps what the configuration stated — an absent request there is the absence
// `outlet-not-requested`, never a name — and this join, and no other module, states the
// equivalence. Nothing else is normalised: a name is reported as the record spells it.
//
// Nothing here is derived from the rendered tree, from a component name, from a position in an
// outlet list or from a neighbouring record: no DOM, no selector, no element, no inspector, no
// second read of the page. `requested`, `matched` and `path` are the answered row's own fields.
// Every absence is an entry the record states, copied as stated — its field, its path and its
// reason, unrelabelled — and filtered to the answered route by that route's own path, with
// every entry about the chain itself (`field: "route"`) kept for every route, so a truncated
// chain says so in the answer rather than losing the statement to the filter. The answer names
// no remedy, no cause and no identity it was not given; the two tokens it can add of its own
// name a hole in its own input and say nothing about the page.
//
// The function is a pure function of that one record: it takes one argument, reads no second
// one, installs nothing, and reaches for no global beyond the single publication at the end. It
// throws on no input — an input that is not a record is answered as `cannot-tell`, and a field
// whose getter throws reads as an absent field.
(function () {
  'use strict';

  const OUTLET_MATCHED = 'outlet-matched';
  const OUTLET_UNNAMED_PRIMARY = 'outlet-unnamed-primary';
  const OUTLET_ABSENT = 'outlet-absent';
  const CANNOT_TELL = 'cannot-tell';

  // The unnamed outlet, as this join reports it.
  const PRIMARY = 'primary';

  // The two holes in the input the join can name itself, for the case where the record states
  // no absence of its own: no route list at all, or a list carrying no row this answer can read.
  const NO_OUTLET_RECORD = 'no-outlet-record';
  const NO_ROUTE_ROW = 'no-route-row';

  // The field name the record gives a statement about the chain itself rather than about one
  // route.
  const ROUTE = 'route';

  // One field, read without letting a hostile getter throw into the reader: the record crosses
  // a message boundary, and this function throws on no input, so a throwing field is an absent
  // field and never an exception.
  function fieldOf(source, key) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[key];
    } catch (error) {
      return undefined;
    }
  }

  // A name the record states, or null where it states none. The empty string is no name.
  function nameOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // A path the record states, or null. The empty string is a path here — a componentless
  // route's own configured path — so it is never read as an absence.
  function pathOf(value) {
    return typeof value === 'string' ? value : null;
  }

  // The length of a list a record carries, or 0 where reading it throws. The list is read by
  // index below, so an iterator the record replaced cannot decide how many rows are read.
  function lengthOf(list) {
    try {
      return typeof list.length === 'number' ? list.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // One route row reduced to the three values an answer can name, or null where the row is
  // nothing to read. No field is completed here: an absent name stays null, and the one
  // normalisation this join states happens below, once.
  function rowOf(routes, index) {
    const row = fieldOf(routes, index);
    if (row === null || typeof row !== 'object') return null;
    return {
      requested: nameOf(fieldOf(row, 'requested')),
      matched: nameOf(fieldOf(row, 'matched')),
      path: pathOf(fieldOf(row, 'path')),
    };
  }

  // Whether a row names an outlet other than the unnamed primary: the row the answer is about,
  // if the record carries one.
  function namesAnotherOutlet(row) {
    return (
      (row.requested !== null && row.requested !== PRIMARY) ||
      (row.matched !== null && row.matched !== PRIMARY)
    );
  }

  // The route the answer is about: the first row naming an outlet other than the primary, in
  // the record's own order, and the first row when no row names one.
  function answeredRowOf(routes) {
    const count = lengthOf(routes);
    let first = null;
    for (let i = 0; i < count; i += 1) {
      const row = rowOf(routes, i);
      if (row === null) continue;
      if (first === null) first = row;
      if (namesAnotherOutlet(row)) return row;
    }
    return first;
  }

  // The absences the record states that belong to the answered route: the entries attributed to
  // its own path, and every entry about the chain itself, which is a statement about the record
  // that every answer read from it carries. Entries are copied as stated and none is relabelled,
  // dropped for being inconvenient, or completed.
  function absencesOf(record, path) {
    const stated = fieldOf(record, 'absences');
    const kept = [];
    if (!Array.isArray(stated)) return kept;
    const count = lengthOf(stated);
    for (let i = 0; i < count; i += 1) {
      const absence = fieldOf(stated, i);
      if (absence === null || typeof absence !== 'object') continue;
      const field = nameOf(fieldOf(absence, 'field'));
      if (field === null) continue;
      const statedPath = pathOf(fieldOf(absence, 'path'));
      if (statedPath !== path && field !== ROUTE) continue;
      kept.push({
        field: field,
        path: statedPath,
        reason: nameOf(fieldOf(absence, 'reason')),
      });
    }
    return kept;
  }

  // One answer, built in one place, so a pin on its fields is a pin on every answer: the five
  // contract fields, in every state, and no sixth.
  function answerOf(state, requested, matched, path, absences) {
    return {
      state: state,
      requested: requested,
      matched: matched,
      path: path,
      absences: absences,
    };
  }

  // The join: the outlet record it is handed, and nothing beside it.
  function outletAnswer(record) {
    const routes = fieldOf(record, 'routes');
    const listed = Array.isArray(routes);
    const row = listed ? answeredRowOf(routes) : null;

    if (row === null) {
      const stated = absencesOf(record, null);
      if (stated.length === 0) {
        stated.push({
          field: ROUTE,
          path: null,
          reason: listed ? NO_ROUTE_ROW : NO_OUTLET_RECORD,
        });
      }
      return answerOf(CANNOT_TELL, null, null, null, stated);
    }

    // The one normalisation this join states: an unnamed outlet and the outlet named `primary`
    // are the same outlet (C2), so an absent request is reported as `primary`.
    const requestedAbsent = row.requested === null;
    const requested = requestedAbsent ? PRIMARY : row.requested;
    const absences = absencesOf(record, row.path);

    let state;
    if (row.matched === null) {
      state = CANNOT_TELL;
    } else if (requested !== row.matched) {
      state = OUTLET_ABSENT;
    } else {
      state = requestedAbsent ? OUTLET_UNNAMED_PRIMARY : OUTLET_MATCHED;
    }

    return answerOf(state, requested, row.matched, row.path, absences);
  }

  // The single publication: the join itself, so the panel loads this module and calls the
  // function. Nothing else of this module's own reaches the global object.
  globalThis.angularAiOutletAnswer = outletAnswer;
})();
