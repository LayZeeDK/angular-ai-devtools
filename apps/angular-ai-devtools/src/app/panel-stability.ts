/**
 * The stability panel surface — M043 T003 (INTENT.md SC5, held-out E9; prohibitions N2, N3, N4, N5).
 *
 * The join itself lives in `extension/stability-narrator.js` (T002, landed `e4421832`,
 * `globalThis.angularAiStabilityNarrator`): it reads the `stability` section the page agent publishes
 * and the frame's own `events` list, and answers
 *
 *   stability(record) -> { state, absence, reading, settle, repeats, absences, version, coreVersion }
 *
 * where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `reading` is the `isStable` emission
 * the state was read from (`{ value, at }`) or null, `settle` is `{ state: 'settled', at,
 * sinceAttachMs }` or `{ state: 'no-settle-observed' }`, each repeat is `{ pair, componentName,
 * passes }`, and `absences` names one absence per unanswered question. This module is the display half
 * and nothing else: it is handed that answer and renders it. It reads no record, joins nothing, reads
 * no clock and touches no DOM (SC1) — every value in the pane arrived through the argument, and the
 * join's own rules are never restated here as a computation.
 *
 * `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }`. The pane's
 * one job is separation (SC5): the three readings the answer carries become their own blocks, in a
 * fixed order, and each block renders its own text and no other block's:
 *
 *   state    the word the answer answered with, its own sentence, and the emission the state was read
 *            from where the answer carried one. A page whose stream emitted nothing prints no time and
 *            no value at all, and no state is ever claimed from a quiet interval, an empty finding set
 *            or the record's silence (SC6, N1).
 *   settle   the settle reading's own time and the interval the join measured between the page's two
 *            readings, printed as the answer carries them — a measured `0` printed as `0` — or
 *            `no-settle-observed` with no time and no duration beside it. This module never subtracts
 *            one reading from another and never reads a clock (SC2, N2): a time the answer did not
 *            carry is not printed.
 *   repeats  one line per pass the answer carried — the pair, the component it was attributed to and
 *            the number of passes — and nothing beside it: no per-view cycle count, no outstanding-work
 *            count, no duration, and no column ordered by settle time (SC3, N3). A frame that recorded
 *            no paired work prints the reading it has, never a zero.
 *
 * Every named absence the answer carried renders in its own block, in the pane's vocabulary order,
 * with its own name and its own sentence: `no-cause-reported`, `no-outstanding-inventory` and
 * `no-settle-order` are permanent answers, and `no-stability-observable` is the one a page without the
 * read forces. No absence borrows another's text, none of them reads as "no errors occurred", and
 * none of them states a count, names an owner, names a cause or names a first item to settle (SC4,
 * N4, E9). An absence word the pane was not written for is echoed as itself rather than dropped.
 *
 * A page the pane has no stability answer for — nothing was handed over, or a value with no state word
 * — renders `no-stability-observable` in a block of its own: never an empty table, never an em dash,
 * and never a state invented for a record nobody read (SC5). A state word the pane was not written
 * for is rendered as the word it was given and nothing else: it borrows no settle reading, no repeated
 * work and no absence sentence, because the pane has no field to fill in for it.
 *
 * `cells` is the separation as data: one cell per state word, per settle word and per named absence,
 * holding that word's own sentence where this answer establishes it and the empty string where it does
 * not. Two cells never hold the same text, which is what lets a caller read a cell and know which
 * question it answered.
 *
 * No runtime imports and no global CSS: the route reaches this module lazily through `panel-demo.ts`
 * (see `app.routes.ts`), the way `panel-navigation.ts` and `panel-error-boundary.ts` are reached, so
 * the module loads under node's type stripping and the suite (`scripts/panel-stability.test.mjs`)
 * executes it rather than scanning it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `section.panel-block`, `p.line` —
 * which that suite measures, so this pane adds no rule of its own.
 */

/** The four state words this join can answer, and the pane's first four cells. */
export const UNSTABLE = 'unstable';
export const STABLE = 'stable';
export const CANNOT_TELL = 'cannot-tell';
export const IDLE = 'idle';

/** The two words the answer's `settle` reading carries. */
export const SETTLED = 'settled';
export const NO_SETTLE_OBSERVED = 'no-settle-observed';

/** This milestone's four named absences, in the order the pane states them. */
export const NO_STABILITY_OBSERVABLE = 'no-stability-observable';
export const NO_CAUSE_REPORTED = 'no-cause-reported';
export const NO_OUTSTANDING_INVENTORY = 'no-outstanding-inventory';
export const NO_SETTLE_ORDER = 'no-settle-order';

/** Every absence the pane answers for, once each, in its own order. */
export const ABSENCES = [
  NO_STABILITY_OBSERVABLE,
  NO_CAUSE_REPORTED,
  NO_OUTSTANDING_INVENTORY,
  NO_SETTLE_ORDER,
] as const;

/** One named absence of the pane's vocabulary. */
export type AbsenceName = (typeof ABSENCES)[number];

/**
 * The sentence each named absence renders — its own name, then the one fact it states. Each sentence
 * names only its own absence: no absence borrows another's text, none of them reads as "no errors
 * occurred", and none of them states a count, an owner, a cause or a first item to settle.
 */
export const ABSENCE_TEXTS: Readonly<Record<AbsenceName, string>> = {
  'no-stability-observable':
    'no-stability-observable: the page published no isStable stream this reader could reach, so no state and no reading are reported',
  'no-cause-reported':
    'no-cause-reported: isStable is a boolean stream and carries no reason, so no cause is reported',
  'no-outstanding-inventory':
    'no-outstanding-inventory: the pending-task set holds bare task ids with no owner, no kind and no count, so no outstanding item is listed',
  'no-settle-order':
    'no-settle-order: the pending-task set records no per-item order and no per-item settle time, so no first item to settle is reported',
};

/** One sentence per state the answer can establish, each naming only its own state and its own fact. */
export const STATE_TEXTS: Readonly<Record<string, string>> = {
  unstable: 'unstable: the page’s isStable emitted false',
  stable: 'stable: the page’s isStable emitted true',
  'cannot-tell':
    'cannot-tell: no isStable emission was reachable, so no state is claimed',
  idle: 'idle: no isStable emission has been read yet, which is no verdict either way',
};

/** The sentence the settle block prints for the record's own settle absence: no time, no duration. */
export const NO_SETTLE_TEXT =
  'no-settle-observed: the record carries no settle reading, so no time and no duration are reported';

/** What the repeated-work block prints where the frame recorded no paired work: its own reading. */
export const NO_PAIRED_WORK_TEXT =
  'repeated work: the frame recorded no paired work';

/** The text a state block prints for an emission the answer carried no receipt time for. */
export const NO_EMISSION_TIME = 'no reading time';

/** The sentence the whole pane renders for a page it has no stability answer for. */
export const NO_ANSWER_TEXT = ABSENCE_TEXTS[NO_STABILITY_OBSERVABLE];

/** The three block kinds the readings render in, in the order the pane hands them over. */
export const READING_BLOCKS = ['state', 'settle', 'repeats'] as const;

/** The kind of the state block: the state word, its sentence and the emission it was read from. */
export const STATE_BLOCK = 'state';

/** The kind of the settle block: the reading's own time and interval, or its named absence. */
export const SETTLE_BLOCK = 'settle';

/** The kind of the repeated-work block: one line per pass the answer carried. */
export const REPEATS_BLOCK = 'repeats';

/**
 * One block of the pane: the reading it renders, the state word it carries — which the baseline
 * stylesheet colours as its own state — one message, its own lines, and the two joined.
 */
export type StabilityBlock = {
  readonly kind: string;
  readonly state: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

/**
 * What the panel renders for one answer.
 *
 * `state` is the state word the answer carried; `lines` holds every block's lines in order, so a
 * caller that renders one flat list still reads the pane whole; `cells` keeps each state's, each
 * settle word's and each absence's own sentence apart; and `blocks` keeps the readings and the
 * absences as the separate parts they are.
 */
export type StabilitySurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly cells: Readonly<Record<string, string>>;
  readonly blocks: readonly StabilityBlock[];
};

/** The answer read for the fields this pane renders and no others. */
type ReadAnswer = {
  readonly state: string;
  readonly absence: string;
  readonly reading: unknown;
  readonly settle: unknown;
  readonly repeats: readonly unknown[];
  readonly absences: readonly string[];
};

/** Every cell the pane answers for, in its own order: the states, the settle words, the absences. */
export const CELL_NAMES: readonly string[] = [
  UNSTABLE,
  STABLE,
  CANNOT_TELL,
  IDLE,
  SETTLED,
  NO_SETTLE_OBSERVED,
  ...ABSENCES,
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, trimmed, or null: whitespace says nothing. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * A reading the page measured: a finite number, and nothing else. A `null`, a string and a `NaN` are
 * all the same absence here, and a time built on one would be a reading nobody took.
 */
function measured(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Every cell at the empty string: an answer that establishes nothing fills in nothing. */
function emptyCells(): Record<string, string> {
  const cells: Record<string, string> = {};
  for (const name of CELL_NAMES) cells[name] = '';
  return cells;
}

/** The state block: the word, its own sentence, and the emission the state was read from. */
function stateBlock(state: string, reading: unknown): StabilityBlock {
  const lines: string[] = [`state: ${state}`];
  const sentence = STATE_TEXTS[state];
  if (sentence !== undefined) lines.push(sentence);
  if (isObject(reading)) {
    const value =
      reading['value'] === true
        ? 'true'
        : reading['value'] === false
          ? 'false'
          : String(reading['value']);
    const at = measured(reading['at']);
    lines.push(
      at === null
        ? `emission: isStable ${value} (the answer carries ${NO_EMISSION_TIME} for it)`
        : `emission: isStable ${value} at ${at} ms`,
    );
  }
  const message = lines[0] ?? '';
  return {
    kind: STATE_BLOCK,
    state,
    message,
    lines,
    text: lines.join('\n'),
  };
}

/**
 * The settle block: the reading's own time and the interval the join measured between the page's two
 * readings, copied and never recomputed, or the named absence with no time and no duration beside it.
 * A measured `0` prints as `0`.
 */
function settleBlock(settle: unknown): StabilityBlock {
  if (!isObject(settle) || settle['state'] !== SETTLED) {
    const lines = [`settle: ${NO_SETTLE_OBSERVED}`, NO_SETTLE_TEXT];
    return {
      kind: SETTLE_BLOCK,
      state: NO_SETTLE_OBSERVED,
      message: lines[0] ?? '',
      lines,
      text: lines.join('\n'),
    };
  }
  const at = measured(settle['at']);
  if (at === null) {
    const lines = [`settle: ${NO_SETTLE_OBSERVED}`, NO_SETTLE_TEXT];
    return {
      kind: SETTLE_BLOCK,
      state: NO_SETTLE_OBSERVED,
      message: lines[0] ?? '',
      lines,
      text: lines.join('\n'),
    };
  }
  const since = measured(settle['sinceAttachMs']);
  const line =
    since === null
      ? `settle: settled at ${at} ms (the answer carries no attach interval, so none is printed)`
      : `settle: settled at ${at} ms, ${since} ms after attach`;
  return {
    kind: SETTLE_BLOCK,
    state: SETTLED,
    message: line,
    lines: [line],
    text: line,
  };
}

/**
 * The repeated-work block: one line per pass the answer carried, naming the pair and the component it
 * was attributed to, and the absence of paired work as the reading it has rather than a zero.
 */
function repeatsBlock(repeats: readonly unknown[]): StabilityBlock {
  const lines: string[] = [];
  for (const raw of repeats) {
    if (!isObject(raw)) continue;
    const pair = nonEmptyString(raw['pair']);
    if (pair === null) continue;
    const name = nonEmptyString(raw['componentName']);
    const passes = measured(raw['passes']);
    const subject = name === null ? 'no component' : name;
    const count = passes === null ? 'no readable count' : String(passes);
    const word = passes === 1 ? 'pass' : 'passes';
    lines.push(`${pair} ${subject}: ${count} ${word}`);
  }
  if (lines.length === 0) lines.push(NO_PAIRED_WORK_TEXT);
  return {
    kind: REPEATS_BLOCK,
    state: REPEATS_BLOCK,
    message: lines[0] ?? '',
    lines,
    text: lines.join('\n'),
  };
}

/** One named absence, rendered as its own block: its own name and its own sentence, nothing else. */
function absenceBlock(name: string): StabilityBlock {
  const sentence = ABSENCE_TEXTS[name as AbsenceName] ?? `absence: ${name}`;
  return {
    kind: name,
    state: name,
    message: sentence,
    lines: [sentence],
    text: sentence,
  };
}

/** The answer the caller handed over, or null when there is none this pane may render. */
function asAnswer(answer: unknown): ReadAnswer | null {
  if (!isObject(answer)) return null;
  if (answer['loading'] === true || answer['assembling'] === true) return null;
  const state = nonEmptyString(answer['state']);
  if (state === null) return null;
  return {
    state,
    absence: nonEmptyString(answer['absence']) ?? '',
    reading: answer['reading'],
    settle: answer['settle'],
    repeats: Array.isArray(answer['repeats']) ? answer['repeats'] : [],
    absences: Array.isArray(answer['absences'])
      ? answer['absences'].filter(
          (entry): entry is string => nonEmptyString(entry) !== null,
        )
      : [],
  };
}

/**
 * Every absence this answer carries, once each: the one the answer named as its own first, then the
 * list beside it, and then the pane's vocabulary order for the lines. A word the pane was not written
 * for is echoed as itself rather than dropped.
 */
function carriedAbsences(read: ReadAnswer): readonly string[] {
  const carried: string[] = [];
  if (read.absence !== '') carried.push(read.absence);
  for (const absence of read.absences) {
    if (carried.indexOf(absence) === -1) carried.push(absence);
  }
  const ordered: string[] = [];
  for (const name of ABSENCES) {
    if (carried.indexOf(name) !== -1) ordered.push(name);
  }
  for (const name of carried) {
    if (ordered.indexOf(name) === -1) ordered.push(name);
  }
  return ordered;
}

/** The pane assembled from its blocks: the lines are every block's lines, in order. */
function assemble(
  state: string,
  cells: Record<string, string>,
  blocks: readonly StabilityBlock[],
): StabilitySurface {
  const lines: string[] = [];
  for (const block of blocks) for (const line of block.lines) lines.push(line);
  return {
    state,
    kind: state,
    message: blocks[0]?.message ?? '',
    lines,
    text: lines.join('\n'),
    cells,
    blocks,
  };
}

/**
 * A page this pane has no stability answer for: `no-stability-observable` in a block of its own, never
 * an empty table, never an em dash, and never a state invented for a record nobody read.
 */
function noStabilityObservable(): StabilitySurface {
  const cells = emptyCells();
  cells[NO_STABILITY_OBSERVABLE] = ABSENCE_TEXTS[NO_STABILITY_OBSERVABLE];
  return assemble(NO_STABILITY_OBSERVABLE, cells, [
    absenceBlock(NO_STABILITY_OBSERVABLE),
  ]);
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, absence, reading, settle, repeats, absences, version,
 *   coreVersion }`, or the marker that the read is running
 */
export function stabilityPanel(answer?: unknown): StabilitySurface {
  const read = asAnswer(answer);

  // Nothing was handed over at all: no stability answer has arrived, and the page is the one absence
  // this pane can state without inventing a reading.
  if (read === null) return noStabilityObservable();

  const cells = emptyCells();
  const sentence = STATE_TEXTS[read.state];

  // A state word this pane was not written for is rendered as the word it was given and nothing else:
  // it borrows no settle reading, no repeated work and no absence sentence, because the pane has no
  // field to fill in for it — its cells stay empty for the same reason.
  if (sentence === undefined) {
    return assemble(read.state, cells, [stateBlock(read.state, null)]);
  }

  cells[read.state] = sentence;

  const blocks: StabilityBlock[] = [
    stateBlock(read.state, read.reading),
    settleBlock(read.settle),
    repeatsBlock(read.repeats),
  ];

  // The settle cell holds the reading's own line, or the absence's own sentence — one cell per settle
  // word, and never an empty field where the answer established one of the two.
  if (blocks[1] !== undefined) {
    if (blocks[1].state === SETTLED) {
      cells[SETTLED] = blocks[1].lines[0] ?? '';
    } else {
      cells[NO_SETTLE_OBSERVED] = NO_SETTLE_TEXT;
    }
  }

  // Each named absence in its own block and its own sentence, in the pane's vocabulary order.
  for (const absence of carriedAbsences(read)) {
    const known = (ABSENCES as readonly string[]).indexOf(absence) !== -1;
    if (known) cells[absence] = ABSENCE_TEXTS[absence as AbsenceName];
    blocks.push(absenceBlock(absence));
  }

  return assemble(read.state, cells, blocks);
}

export const panelStability = stabilityPanel;
export const stabilitySurface = stabilityPanel;
export default stabilityPanel;
