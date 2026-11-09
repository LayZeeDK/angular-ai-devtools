// stability-narrator.js — the join behind M043: one record's stability section read as whether the
// application is stable and when it settled, and the frame's own `events` read as the work it
// repeated — beside the absences that are this milestone's permanent answers.
//
// T001 measured the surface (`research/raw/m043-stability.json`) and published it on the record the
// page agent already dispatches (`extension/agent-main.js`, the section `stabilityField()` builds):
//
//   { reachedBy, absence, attachAt, reading, settle, version, coreVersion }
//
// `reachedBy` is the token the injector walk resolved or `null`; `absence` is `null` or
// `no-stability-observable`; `attachAt` is the page's own reading at attach; `reading` is
// `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when
// it arrived — or `null`; `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`;
// `version` is the constant that surface works against and `coreVersion` what the page reported.
//
// The three answers this join must not derive, and does not:
//
//   the state      read off the recorded emission's value and from nowhere else. `isStable` is one
//                  `map(pending => !pending)` over a boolean, so `false` is `unstable` and `true` is
//                  `stable`; a record that emitted nothing is `idle`, a record whose token was
//                  unreachable is `cannot-tell`, and no record's silence is ever a verdict (SC1,
//                  SC6, E1, E10).
//   the settle     the difference of two readings the page published: the record's `settle.at` minus
//                  its `attachAt`. A measured `0` is `0` — a page already stable at attach settles
//                  *at* attach, which is a reading and not a transition — and a record that names
//                  `no-settle-observed` carries no time field and no interval at all. Nothing in the
//                  frame's quiet tail, its last event or its `startedAt` is ever a substitute, and
//                  this file reads no clock of its own (SC2, E3, E4).
//   the repeats    one pass per start/end pair the frame's own `events` list holds, matched in
//                  recorded order and counted per pair and per component. A `ChangeDetection` pair
//                  carries no instance and is attributed to no component; a frame that recorded no
//                  paired work reports no pass at all. No per-view cycle count and no outstanding-work
//                  count exists anywhere in the answer, because the page publishes nothing to count
//                  (SC3, E5, E6).
//
// The absences are values and not missing fields: `no-cause-reported`, `no-outstanding-inventory`
// and `no-settle-order` are permanent, `no-stability-observable` is the one a page without the read
// forces, and none of them is ever a zero outstanding item, a component name, a task id, an epoch
// delta or a creation stack (SC4, E7, E8).
//
// This module is a reader of the record it is handed and of nothing else: no DOM, no clock, no
// console, no network, no imports and no global beyond the namespace below, so a bare `node:vm`
// context with nothing in it is enough to run it (which the suite proves). It holds no state between
// calls, so the same record read twice answers the same thing (SC6, E10). It reads the record's
// `stability` section and its `events` list, and no other field: a cycle id, a trigger, a per-check
// row, an epoch delta or a debugging section that a later capture adds changes nothing it reports.
//
// The answer is one object:
//
//   stability(record) -> { state, absence, reading, settle, repeats, absences, version, coreVersion }
//
// and this module's second function renders that answer and nothing more:
//
//   stabilityPanel(answer) -> { state, kind, message, lines, text, cells, blocks }
//
// where `cells` keeps each state's and each absence's own sentence apart (the empty string where the
// answer established none) and `blocks` carries one block per reading — the state, the settle
// reading and the repeated work — each holding its own lines.
(function () {
  'use strict';

  // The four state words this join can answer, and the word it answers when nothing was read.
  const UNSTABLE = 'unstable';
  const STABLE = 'stable';
  const CANNOT_TELL = 'cannot-tell';
  const IDLE = 'idle';

  // The two words the record's `settle` section carries: its own reading, and its named absence.
  const SETTLED = 'settled';
  const NO_SETTLE_OBSERVED = 'no-settle-observed';

  // This milestone's named absences. The first is the one a page without the read forces; the other
  // three are permanent answers, because the page publishes nothing that could fill them.
  const NO_STABILITY_OBSERVABLE = 'no-stability-observable';
  const NO_CAUSE_REPORTED = 'no-cause-reported';
  const NO_OUTSTANDING_INVENTORY = 'no-outstanding-inventory';
  const NO_SETTLE_ORDER = 'no-settle-order';

  // Every absence once, in the order this milestone states them, so two answers carrying the same
  // absences are the same list whatever order the questions were answered in.
  const ABSENCE_ORDER = [
    NO_STABILITY_OBSERVABLE,
    NO_CAUSE_REPORTED,
    NO_OUTSTANDING_INVENTORY,
    NO_SETTLE_ORDER,
  ];

  // The three every answer carries: `isStable` is a boolean stream and carries no reason,
  // `PendingTasksInternal` holds a Set of ids with no owner and no count, and the set records no
  // per-item order and no per-item settle time.
  const PERMANENT_ABSENCES = [
    NO_CAUSE_REPORTED,
    NO_OUTSTANDING_INVENTORY,
    NO_SETTLE_ORDER,
  ];

  // The @angular/core this surface is measured against — a constant and never a read. What a page
  // did report is `coreVersion`, `null` where it reported nothing, and this file invents neither.
  const WORKED_AGAINST_VERSION = '22.2.2';

  // One sentence per state the answer can establish, each naming only its own state and its own
  // fact: no sentence borrows another state's claim, and the zero-cost or zero-interval cases are
  // numbers rather than words.
  const STATE_TEXTS = {
    unstable:
      'unstable: the page’s isStable emitted false, so a pending task is outstanding — and that stream carries no reason for it',
    stable: 'stable: the page’s isStable emitted true',
    'cannot-tell':
      'cannot-tell: no isStable emission was reachable, so no state is claimed',
    idle: 'idle: no isStable emission has been read yet, which is no verdict either way',
  };

  // One sentence per named absence, each with its own name and its own fact. No absence borrows
  // another's text, none of them reads as "no errors occurred", and none of them states a count.
  const ABSENCE_TEXTS = {
    'no-stability-observable':
      'no-stability-observable: the page published no isStable stream this reader could reach, so no state and no reading are reported',
    'no-cause-reported':
      'no-cause-reported: isStable is a boolean stream and carries no reason, so no cause is reported',
    'no-outstanding-inventory':
      'no-outstanding-inventory: the pending-task set holds bare task ids with no owner, no kind and no count, so no outstanding item is listed',
    'no-settle-order':
      'no-settle-order: the pending-task set records no per-item order and no per-item settle time, so no first item to settle is reported',
  };

  // The sentence for the record's own settle absence: no time field and no interval beside it.
  const NO_SETTLE_TEXT =
    'no-settle-observed: the record carries no settle reading, so no time and no duration are reported';

  // The pane's word for a reading that arrived with no answer at all.
  const NO_ANSWER_MESSAGE = 'idle: no stability answer has arrived yet';

  // The sentence the repeated-work block prints where the frame recorded no paired work: the
  // reading it has, rather than a zero a caller could read as a count.
  const NO_PAIRED_WORK_TEXT =
    'repeated work: the frame recorded no paired work';

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A reading the page measured: a finite number, and nothing else. `null`, a string and a `NaN`
  // are all the same absence here, and an interval built on one would be a duration nobody measured.
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

  // The stability section the record carries, or null where it carries none. A record with no
  // section is a record this read never attached to, which is `idle` and not `stable`.
  function sectionOf(record) {
    if (!isObject(record)) return null;
    return isObject(record.stability) ? record.stability : null;
  }

  // The emission the state was read from, copied as the page published it: its value, and its own
  // reading. A record that published no readable emission has no reading here — `null`, never a
  // zero, never the attach reading and never a value taken from a neighbouring field.
  function readingOf(section) {
    if (section === null) return null;
    const reading = section.reading;
    if (!isObject(reading)) return null;
    const value =
      reading.value === true ? true : reading.value === false ? false : null;
    const at = isMeasurement(reading.at) ? reading.at : null;
    if (value === null && at === null) return null;
    return { value: value, at: at };
  }

  // The state word, read off the emission and from nothing else. The record's own absence decides
  // `cannot-tell` first, a missing emission is `idle`, and the emission's boolean is the verdict —
  // no silence, no empty finding set and no quiet tail is ever consulted (SC1, SC6).
  function stateOf(section, reading) {
    if (section === null) return { state: IDLE, absence: null };
    const absence = nonEmptyText(section.absence);
    if (absence !== null) return { state: CANNOT_TELL, absence: absence };
    if (reading === null) return { state: IDLE, absence: null };
    if (reading.value === true) return { state: STABLE, absence: null };
    if (reading.value === false) return { state: UNSTABLE, absence: null };
    return { state: IDLE, absence: null };
  }

  // The settle reading, or its named absence. The interval is the difference of the two readings the
  // page published — the settle's own `at` minus the attach reading — so a measured `0` stays a
  // number, and a record that names no settle reading carries no time field at all. A settled word
  // with no readable reading is no settle reading: no time is minted for it (SC2, E3, E4).
  function settleOf(section) {
    if (section === null) return { state: NO_SETTLE_OBSERVED };
    const settle = section.settle;
    if (!isObject(settle) || settle.state !== SETTLED) {
      return { state: NO_SETTLE_OBSERVED };
    }
    if (!isMeasurement(settle.at)) return { state: NO_SETTLE_OBSERVED };
    const attachAt = isMeasurement(section.attachAt) ? section.attachAt : null;
    return {
      state: SETTLED,
      at: settle.at,
      sinceAttachMs: attachAt === null ? null : settle.at - attachAt,
    };
  }

  // One recorded work event, read as the pair it belongs to, which end of that pair it is and the
  // component it names. Nothing else on the entry is read: no type number, no receipt time and no
  // per-check row — this join reports passes and no duration.
  function readEvent(value) {
    if (!isObject(value)) return null;
    const pair = nonEmptyText(value.pair);
    if (pair === null) return null;
    if (typeof value.end !== 'boolean') return null;
    return {
      pair: pair,
      end: value.end,
      componentName: nonEmptyText(value.componentName),
    };
  }

  // The frame's own work list, or an empty one where it carries none this join can read. The absent
  // list is no pass and no count — never an invented row (SC3, E6).
  function eventsOf(record) {
    if (!isObject(record)) return [];
    return Array.isArray(record.events) ? record.events : [];
  }

  // The repeated work, one pass per start/end pair the frame recorded, in the order the pairs were
  // completed. A start opens its pair's stack, its matching end closes the innermost open start of
  // its own pair, and an end with no open start of its own pair is no pass and is never paired
  // backwards onto an earlier start. A pass is attributed to its start's component when that start
  // names one and otherwise to its end's, so a `ChangeDetection` pass — every one of whose four
  // measured entries recorded `componentName: null` — is attributed to no component.
  function repeatsOf(record) {
    const repeats = [];
    const byKey = new Map();
    const open = new Map();
    const events = eventsOf(record);
    for (let i = 0; i < events.length; i += 1) {
      const entry = readEvent(events[i]);
      if (entry === null) continue;
      if (!entry.end) {
        let stack = open.get(entry.pair);
        if (stack === undefined) {
          stack = [];
          open.set(entry.pair, stack);
        }
        stack.push(entry);
        continue;
      }
      const stack = open.get(entry.pair);
      if (stack === undefined || stack.length === 0) continue;
      const start = stack.pop();
      const name =
        start.componentName !== null
          ? start.componentName
          : entry.componentName;
      const key = entry.pair + ' ' + (name === null ? '' : name);
      let group = byKey.get(key);
      if (group === undefined) {
        group = { pair: entry.pair, componentName: name, passes: 0 };
        byKey.set(key, group);
        repeats.push(group);
      }
      group.passes += 1;
    }
    return repeats;
  }

  // Every named absence once, in this milestone's order, with a word this reader was not written
  // for carried as itself rather than renamed or dropped.
  function ordered(names) {
    const kept = [];
    for (let i = 0; i < ABSENCE_ORDER.length; i += 1) {
      if (names.indexOf(ABSENCE_ORDER[i]) !== -1) kept.push(ABSENCE_ORDER[i]);
    }
    for (let i = 0; i < names.length; i += 1) {
      if (kept.indexOf(names[i]) === -1) kept.push(names[i]);
    }
    return kept;
  }

  // One named absence per unanswered question: the state's own absence where the read was never
  // reached, and the three the page itself makes unanswerable on every record.
  function absencesOf(state) {
    const names = [];
    if (state.absence !== null) names.push(state.absence);
    for (let i = 0; i < PERMANENT_ABSENCES.length; i += 1) {
      names.push(PERMANENT_ABSENCES[i]);
    }
    return ordered(names);
  }

  // The join. `record` is the frame (or the initial snapshot) the page agent dispatches; its
  // `stability` section is the state and the settle reading, its `events` list is the repeated work,
  // and no other field is read.
  function stability(record) {
    const section = sectionOf(record);
    const reading = readingOf(section);
    const state = stateOf(section, reading);
    return {
      state: state.state,
      absence: state.absence,
      reading: reading,
      settle: settleOf(section),
      repeats: repeatsOf(record),
      absences: absencesOf(state),
      version: WORKED_AGAINST_VERSION,
      coreVersion: section === null ? null : nonEmptyText(section.coreVersion),
    };
  }

  // ---------------------------------------------------------------- the pane ----

  // Every cell the pane answers for: the four state words, the two settle words and the four named
  // absences. A cell holds that state's or absence's own sentence where the answer established it
  // and the empty string where it did not, which is what keeps two states from sharing one text.
  const CELL_NAMES = [
    UNSTABLE,
    STABLE,
    CANNOT_TELL,
    IDLE,
    SETTLED,
    NO_SETTLE_OBSERVED,
    NO_STABILITY_OBSERVABLE,
    NO_CAUSE_REPORTED,
    NO_OUTSTANDING_INVENTORY,
    NO_SETTLE_ORDER,
  ];

  function emptyCells() {
    const cells = {};
    for (let i = 0; i < CELL_NAMES.length; i += 1) cells[CELL_NAMES[i]] = '';
    return cells;
  }

  function knownState(state) {
    return Object.prototype.hasOwnProperty.call(STATE_TEXTS, state);
  }

  function knownAbsence(name) {
    return Object.prototype.hasOwnProperty.call(ABSENCE_TEXTS, name);
  }

  // The state block: the word the answer answered with, its own sentence, and the emission it was
  // read from where the answer carried one. Nothing is printed for a reading the answer did not
  // carry, so a silent record shows no time and no value at all.
  function stateBlock(answer) {
    const lines = ['state: ' + answer.state];
    if (knownState(answer.state)) lines.push(STATE_TEXTS[answer.state]);
    const reading = answer.reading;
    if (isObject(reading)) {
      const value =
        reading.value === true
          ? 'true'
          : reading.value === false
            ? 'false'
            : String(reading.value);
      if (isMeasurement(reading.at)) {
        lines.push('emission: isStable ' + value + ' at ' + reading.at + ' ms');
      } else {
        lines.push(
          'emission: isStable ' +
            value +
            ' (the record carries no reading for it)',
        );
      }
    }
    return { name: 'state', lines: lines };
  }

  // The settle block: the reading's own time and the interval the two published readings make, or
  // the absence with no time and no interval beside it. A measured `0` prints as `0`.
  function settleBlock(answer) {
    const settle = answer.settle;
    if (!isObject(settle) || settle.state !== SETTLED) {
      return {
        name: 'settle',
        lines: ['settle: ' + NO_SETTLE_OBSERVED, NO_SETTLE_TEXT],
      };
    }
    let line = 'settle: settled at ' + settle.at + ' ms';
    if (isMeasurement(settle.sinceAttachMs)) {
      line += ', ' + settle.sinceAttachMs + ' ms after attach';
    } else {
      line += ' (the record carries no attach reading, so no interval)';
    }
    return { name: 'settle', lines: [line] };
  }

  // The repeated-work block: one line per repeat the answer carried, naming the pair and the
  // component it was attributed to, and the absence of paired work as the reading it has.
  function repeatsBlock(answer) {
    const repeats = Array.isArray(answer.repeats) ? answer.repeats : [];
    if (repeats.length === 0) {
      return { name: 'repeats', lines: [NO_PAIRED_WORK_TEXT] };
    }
    const lines = [];
    for (let i = 0; i < repeats.length; i += 1) {
      const repeat = repeats[i];
      if (!isObject(repeat)) continue;
      const pair = nonEmptyText(repeat.pair);
      if (pair === null) continue;
      const name = nonEmptyText(repeat.componentName);
      const passes = isMeasurement(repeat.passes) ? repeat.passes : 0;
      const subject = name === null ? 'no component' : name;
      const word = passes === 1 ? 'pass' : 'passes';
      lines.push(pair + ' ' + subject + ': ' + passes + ' ' + word);
    }
    return { name: 'repeats', lines: lines };
  }

  // Nothing was handed over, or a value with no state word: no answer has arrived, and saying so is
  // the idle pane rather than an answer invented for it.
  function noAnswerPane() {
    return {
      state: IDLE,
      kind: IDLE,
      message: NO_ANSWER_MESSAGE,
      lines: [NO_ANSWER_MESSAGE],
      text: NO_ANSWER_MESSAGE,
      cells: emptyCells(),
      blocks: [{ name: 'state', lines: [NO_ANSWER_MESSAGE] }],
    };
  }

  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no reading, no settle time and no absence sentence, and every cell stays empty
  // for the same reason — the pane has no field to fill in for it.
  function unknownStatePane(state) {
    const message = 'state: ' + state;
    return {
      state: state,
      kind: state,
      message: message,
      lines: [message],
      text: message,
      cells: emptyCells(),
      blocks: [{ name: 'state', lines: [message] }],
    };
  }

  // The answer rendered as the one pane it is: three blocks, each holding its own lines, one
  // sentence per named absence in this milestone's order, and the flat text the lines make.
  function stabilityPanel(answer) {
    if (!isObject(answer)) return noAnswerPane();
    const state = nonEmptyText(answer.state);
    if (state === null) return noAnswerPane();
    if (!knownState(state)) return unknownStatePane(state);

    const cells = emptyCells();
    cells[state] = STATE_TEXTS[state];

    const blocks = [
      stateBlock(answer),
      settleBlock(answer),
      repeatsBlock(answer),
    ];
    const lines = [];
    for (let i = 0; i < blocks.length; i += 1) {
      for (let j = 0; j < blocks[i].lines.length; j += 1) {
        lines.push(blocks[i].lines[j]);
      }
    }

    if (blocks[1].lines[0] === 'settle: ' + NO_SETTLE_OBSERVED) {
      cells[NO_SETTLE_OBSERVED] = NO_SETTLE_TEXT;
    } else {
      cells[SETTLED] = blocks[1].lines[0];
    }

    // Each absence in its own sentence, in this milestone's order, and the word the answer named as
    // its own first: one named absence per unanswered question, and never a count in its place.
    const carried = [];
    const own = nonEmptyText(answer.absence);
    if (own !== null) carried.push(own);
    const listed = Array.isArray(answer.absences) ? answer.absences : [];
    for (let i = 0; i < listed.length; i += 1) {
      const name = nonEmptyText(listed[i]);
      if (name !== null && carried.indexOf(name) === -1) carried.push(name);
    }
    for (let i = 0; i < ABSENCE_ORDER.length; i += 1) {
      const name = ABSENCE_ORDER[i];
      if (carried.indexOf(name) === -1) continue;
      cells[name] = ABSENCE_TEXTS[name];
      lines.push(ABSENCE_TEXTS[name]);
    }
    for (let i = 0; i < carried.length; i += 1) {
      const name = carried[i];
      if (knownAbsence(name)) continue;
      lines.push('absence: ' + name);
    }

    return {
      state: state,
      kind: state,
      message: 'state: ' + state,
      lines: lines,
      text: lines.join('\n'),
      cells: cells,
      blocks: blocks,
    };
  }

  const namespace = {
    stability: stability,
    stabilityPanel: stabilityPanel,
    UNSTABLE: UNSTABLE,
    STABLE: STABLE,
    CANNOT_TELL: CANNOT_TELL,
    IDLE: IDLE,
    SETTLED: SETTLED,
    NO_SETTLE_OBSERVED: NO_SETTLE_OBSERVED,
    NO_STABILITY_OBSERVABLE: NO_STABILITY_OBSERVABLE,
    NO_CAUSE_REPORTED: NO_CAUSE_REPORTED,
    NO_OUTSTANDING_INVENTORY: NO_OUTSTANDING_INVENTORY,
    NO_SETTLE_ORDER: NO_SETTLE_ORDER,
    ABSENCE_ORDER: ABSENCE_ORDER,
    ABSENCE_TEXTS: ABSENCE_TEXTS,
    STATE_TEXTS: STATE_TEXTS,
    CELL_NAMES: CELL_NAMES,
    VERSION: WORKED_AGAINST_VERSION,
  };

  if (globalThis.angularAiStabilityNarrator) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiStabilityNarrator, namespace);
  } else {
    globalThis.angularAiStabilityNarrator = namespace;
  }
})();
