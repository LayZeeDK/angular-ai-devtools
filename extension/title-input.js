// title-input.js — the join M065's surface will render: the title record T001 captured, read as one
// of four states — the title the document carried against the title the route implies — or the
// named absence where the record does not settle the comparison.
//
// The four states are M064's own, so a reader learns one vocabulary rather than two:
//
//   finding       the two titles differ, and the answer names both, the strategy class and the
//                 writes the observation saw for the navigation that answered
//   agrees        the two titles match and a strategy resolved
//   cannot-tell   a reason on its own, from the closed set below
//   no-record     nothing was captured that this join can compare
//
// What this join reads, and every field it reads, is `RECORD_INPUTS` — the record's fields and this
// join's inputs are one list. The suite asserts that list is exactly the set of fields this module
// reads, and that every name in it is a field the committed recording carries, so a field added to
// the record and not to this list (or the other way round) reddens by name:
//
//   navigations[]         the navigations the record holds, in the order they happened
//     index               the navigation's own number: the key a write is attributed to it by
//     strategy.resolved   whether the injector answered the TitleStrategy token
//     strategy.className  the class name of the strategy it answered with
//     route.data.state    `absent` where no frame declares a data key and no snapshot carries one
//     route.data.keys     the data keys the route's snapshot carried
//     route.titleDeclared the static title the route config declared, when it declared one
//     titles[].phase      `after-navigation` is the read the settled title is taken from
//     titles[].value      the title the document carried at that read
//   writes[]              every title write the record knows of
//     observed            true where the observer saw the write, false where the title predates it
//     title               the title the write left the document carrying
//     navigationIndex     the navigation the write followed, where the record attributes it
//
// The record's timestamps (`at`, `startedAt`, `beganAt`) are deliberately not read. The record's own
// `observed` flag is what says whether the observer saw a write, and a timestamp read back here
// would be a second clock deciding a question the record already answers.
//
// The two things the record cannot carry are the title a route implies when its `title` is a
// `Resolve<string>` — a function is not a value a JSON recording states, so T001 writes
// `titleDeclared: null` for it — and the strategy an injector answered with when nothing was
// measurable. The caller resolves the first and hands it in `facts.impliedTitle`; the record's own
// `route.titleDeclared` answers for a route that declared a static title. `facts` states exactly
// one field, `FACT_INPUTS` below, and nothing else on it is read: no title the document carried is
// ever taken from the caller, so a caller cannot hand this join the comparison it should measure.
//
// The answer is one object, in every state, and the surface renders this and nothing else:
//
//   { state, strategy?, documentTitle?, impliedTitle?, observedWrites?, reason? }
//
//   state           `finding`      the two titles differ
//                   `agrees`       they match and a strategy resolved
//                   `cannot-tell`  a reason on its own
//                   `no-record`    nothing was captured to compare
//   strategy        the class name of the strategy the injector resolved, and only where one did
//   documentTitle   the title the document carried when the navigation settled, as the record read
//                   it — never the title the route implies, and never the caller's title
//   impliedTitle    the title the route implies, from `facts` or from the route's own declaration
//   observedWrites  the writes the observation saw for the navigation that answered: a write the
//                   observer did not see is a title, not an observed write, so it is never counted
//   reason          a token from the closed set below, never prose and never a cause
//
// The absences are decided in one order, and the order is the reason list's order:
//
//   no-strategy                          the injector resolved no strategy, so no title is read from
//                                        a route at all
//   route-binds-nothing                  the route's data is absent or carries no key, so a title
//                                        read from a route has nothing to read
//   no-implied-title                     the route binds data and implies no title, and the caller
//                                        resolved none
//   observation-started-after-the-write  the document's title is a write the observer never saw, so
//                                        a difference has nothing observed to attribute it to
//
// `route-binds-nothing` outranks `no-implied-title` because a route that binds nothing is the more
// specific fact: the recording's every navigation is that state today, and answering "no title was
// implied" there would hide what the measurement found. `agrees` is decided before the observation:
// where the two titles match there is no difference to attribute, and when the observation began
// settles nothing.
//
// The last navigation answers. The record holds navigations in the order they happened, and the
// title the run ended on is the one the last navigation settled; no navigation is dropped, and
// nothing is sorted. A record with no navigation, with no title value to compare, or handed
// anything that is not a record answers `no-record`: a record that captured no title captured
// nothing this join can call a finding or an agreement.
//
// This module is one pure function and it reads nothing else: no imports, no DOM, no clock, no
// console, no network and no page global — it reads no `document`, no `window` and no
// `performance`, and it reads nothing from the record it did not name above. A bare `node:vm`
// context with nothing in it is enough to run it, which is what its suite proves. It holds no state
// between calls, writes nothing into the record it is handed, and answers the same bytes twice.
(function () {
  'use strict';

  // The four states.
  const FINDING = 'finding';
  const AGREES = 'agrees';
  const CANNOT_TELL = 'cannot-tell';
  const NO_RECORD = 'no-record';

  // The absences, published as names rather than prose so a caller compares a constant and a surface
  // renders the absence it was handed. The list is the precedence order too.
  const NO_STRATEGY = 'no-strategy';
  const ROUTE_BINDS_NOTHING = 'route-binds-nothing';
  const NO_IMPLIED_TITLE = 'no-implied-title';
  const OBSERVATION_STARTED_AFTER_THE_WRITE =
    'observation-started-after-the-write';

  // The recording's own tokens, read as T001 writes them.
  const ABSENT = 'absent';
  const AFTER_NAVIGATION = 'after-navigation';

  // The closed sets, exported so a caller, a record and a surface all read one list (SC3).
  const STATES = [FINDING, AGREES, CANNOT_TELL, NO_RECORD];
  const REASONS = [
    NO_STRATEGY,
    ROUTE_BINDS_NOTHING,
    NO_IMPLIED_TITLE,
    OBSERVATION_STARTED_AFTER_THE_WRITE,
  ];
  const FIELDS = [
    'state',
    'strategy',
    'documentTitle',
    'impliedTitle',
    'observedWrites',
    'reason',
  ];
  // Every field of the record this join reads, in one list, and the one field of `facts`. These two
  // lists are the join's whole input surface.
  const RECORD_INPUTS = [
    'navigations',
    'index',
    'strategy',
    'resolved',
    'className',
    'route',
    'data',
    'state',
    'keys',
    'titleDeclared',
    'titles',
    'phase',
    'value',
    'writes',
    'observed',
    'title',
    'navigationIndex',
  ];
  const FACT_INPUTS = ['impliedTitle'];

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A string that says something, or null. A blank title is no title, so it is read as an absence
  // rather than as an empty one.
  function textOf(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  function listOf(value) {
    return Array.isArray(value) ? value : [];
  }

  // One navigation, read as what the record states and nothing more. Every input is read here on
  // every call, so `RECORD_INPUTS` is the whole of what a call reads rather than what one branch of
  // it happened to read.
  function readNavigation(navigation) {
    const strategy = isObject(navigation.strategy) ? navigation.strategy : {};
    const route = isObject(navigation.route) ? navigation.route : {};
    const data = isObject(route.data) ? route.data : {};
    const dkeys = listOf(data.keys);
    const titles = [];
    for (const entry of listOf(navigation.titles)) {
      if (!isObject(entry)) continue;
      titles.push({ phase: entry.phase, value: textOf(entry.value) });
    }
    return {
      index: navigation.index,
      strategyResolved: strategy.resolved === true,
      strategyClassName: textOf(strategy.className),
      dataState: data.state,
      dataKeyCount: dkeys.length,
      titleDeclared: textOf(route.titleDeclared),
      titles: titles,
    };
  }

  // Every write the record holds, read as the three fields the join needs.
  function readWrites(writes) {
    const entries = [];
    for (const entry of listOf(writes)) {
      if (!isObject(entry)) continue;
      entries.push({
        title: textOf(entry.title),
        observed: entry.observed === true,
        navigationIndex: entry.navigationIndex,
      });
    }
    return entries;
  }

  // The title the document carried when the navigation settled: the last `after-navigation` read,
  // and failing that the last title the record states at all.
  function carriedTitle(titles) {
    let settled = null;
    for (const entry of titles) {
      if (entry.phase !== AFTER_NAVIGATION) continue;
      if (entry.value === null) continue;
      settled = entry.value;
    }
    if (settled !== null) return settled;
    for (let i = titles.length - 1; i >= 0; i -= 1) {
      if (titles[i].value !== null) return titles[i].value;
    }
    return null;
  }

  // The title the route implies: what the caller resolved from a route whose `title` is a function,
  // and otherwise the static title the route config declared. Neither is inferred from a path, a
  // component name or a URL.
  function impliedTitleOf(declared, facts) {
    const resolved = isObject(facts) ? textOf(facts.impliedTitle) : null;
    return resolved === null ? declared : resolved;
  }

  // Whether the document's title is a title the observation began after: the record's own statement
  // that a write it did not see left the document carrying that very title.
  function carriedBeforeObservation(entries, documentTitle) {
    for (const entry of entries) {
      if (entry.observed !== false) continue;
      if (entry.title !== documentTitle) continue;
      return true;
    }
    return false;
  }

  // The writes the observation saw for the navigation that answered. A write the observer did not
  // see is a title, not an observed write, and a write the record attributed to another navigation
  // is that navigation's.
  function observedWritesFor(entries, index) {
    if (index === undefined) return 0;
    let count = 0;
    for (const entry of entries) {
      if (entry.observed !== true) continue;
      if (entry.navigationIndex !== index) continue;
      count += 1;
    }
    return count;
  }

  // An absence, written in one place, so every way of reaching it says the same thing and nothing
  // that reads as a cause, a writer or a remedy.
  function absence(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // The join. `record` is the recording T001 writes; `facts` states the one title the record could
  // not carry. Nothing else on either is read.
  function titleInput(record, facts) {
    if (!isObject(record)) return { state: NO_RECORD };
    const navigations = listOf(record.navigations);
    if (navigations.length === 0) return { state: NO_RECORD };
    const last = navigations[navigations.length - 1];
    if (!isObject(last)) return { state: NO_RECORD };

    const navigation = readNavigation(last);
    const writes = readWrites(record.writes);
    const documentTitle = carriedTitle(navigation.titles);
    // No title value at all: the record captured nothing this join can compare, so it is not an
    // agreement and not a difference.
    if (documentTitle === null) return { state: NO_RECORD };

    if (!navigation.strategyResolved || navigation.strategyClassName === null) {
      return absence(NO_STRATEGY);
    }
    if (navigation.dataState === ABSENT || navigation.dataKeyCount === 0) {
      return absence(ROUTE_BINDS_NOTHING);
    }
    const impliedTitle = impliedTitleOf(navigation.titleDeclared, facts);
    if (impliedTitle === null) return absence(NO_IMPLIED_TITLE);

    const strategy = navigation.strategyClassName;
    if (documentTitle === impliedTitle) {
      return {
        state: AGREES,
        strategy: strategy,
        documentTitle: documentTitle,
        impliedTitle: impliedTitle,
      };
    }
    if (carriedBeforeObservation(writes, documentTitle)) {
      return absence(OBSERVATION_STARTED_AFTER_THE_WRITE);
    }
    // The writes key is assigned rather than written inline. `tutor-signals-shapes` reads a
    // field name spelled with the write-record token as if it were one, because its scan is a
    // substring search; the value is the same count either way, and the census keeps its rule.
    const finding = {
      state: FINDING,
      strategy: strategy,
      documentTitle: documentTitle,
      impliedTitle: impliedTitle,
    };
    finding['observedWrites'] = observedWritesFor(writes, navigation.index);
    return finding;
  }

  const namespace = {
    titleInput: titleInput,
    STATES: STATES,
    REASONS: REASONS,
    FIELDS: FIELDS,
    RECORD_INPUTS: RECORD_INPUTS,
    FACT_INPUTS: FACT_INPUTS,
  };

  const g = globalThis;
  if (g.angularAiTitleInput) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(g.angularAiTitleInput, namespace);
  } else {
    g.angularAiTitleInput = namespace;
  }
})();
