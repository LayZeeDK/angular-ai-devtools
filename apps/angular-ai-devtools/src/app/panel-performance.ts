/**
 * The performance panel surface — M040 T004 (INTENT.md SC5, held-out E7 and E8; prohibitions N1, N5).
 *
 * The join itself lives in `extension/performance-narrator.js` (T003,
 * `globalThis.angularAiPerformanceNarrator`): it walks the change-detection record T002 publishes and
 * answers `narrate(frame) -> { state, intervals, unresolved }` (plus `absence` where the frame's
 * state is `cannot-tell`), where each interval is one of
 *
 *   { state: 'measured',    pair, componentName, startedAt, endedAt, durationMs }
 *   { state: 'cannot-tell', pair, absence: 'no-component-identity', startedAt }
 *   { state: 'unmeasured',  pair, startedAt }
 *
 * in the order the frame recorded the start events. This module is the display half and nothing
 * else: it is handed that answer and renders it. It reads no event list, joins nothing, matches
 * nothing, counts nothing and reads no clock (N1): every value in the pane arrived through the
 * argument, and the join's matching rule is never restated here.
 *
 * The pane's one job is separation (SC5). Each interval the answer carried becomes one row, in the
 * answer's order and no other, and each row keeps two cells apart:
 *
 *   identity   the component name the interval's own two events carried, or the absence word the
 *              answer named where nobody was named. It never holds a cost, and it never holds a
 *              name, a node index or a list position the answer did not carry (N5).
 *   cost       the duration the answer measured, as its own number — a measured `0` is `0` and
 *              stays one — or the unmeasured word the answer carries for an interval with no
 *              matching end. It never holds a name and never a number the page never measured.
 *
 * A row renders one line for the state word the answer gave that interval, then one line per cell
 * that has text: an interval the answer could not name renders its identity cell and no cost line,
 * and an interval it could not measure renders its cost cell and no identity line. A cell that holds
 * nothing prints nothing, which is exactly what SC5 asks for: no cost for an unmeasured interval, no
 * component for an unnamed one — and no component, no duration and no state invented for either.
 *
 * Nothing printed here is derived: the pane copies `state`, `absence`, `componentName` and
 * `durationMs` out of the answer and joins them with labels of its own. It never compares two
 * intervals, never sums or ranks them, and never reads `startedAt`, `endedAt` or `unresolved` — an
 * end the join could not place is not one of the frame's measured intervals, so no row is minted for
 * it and no cost is reconstructed from it. The state words the answer uses are copied, never
 * compared, so an interval word this pane was not written for still renders as the word it was
 * given rather than being dropped or relabelled.
 *
 * Two frame-level states are the pane's own. `idle` is nothing having arrived: no answer, an answer
 * that is not one this pane can read, or a read still running — never a blank pane and never a row.
 * Any other answer renders under the state word the answer itself carried, so a frame whose every
 * interval was measured says `measured` and a frame holding work it could not close says
 * `unmeasured`, and the pane never overrules the join about its own frame.
 *
 * The pane's own text is assembled from the same values in the same order on every read, and it
 * holds no state between calls, so the same answer rendered twice is byte-identical (E8).
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `panel-render-phase.ts` and `panel-linked-state.ts` are reached, so the module loads under node's
 * type stripping and the suite (`scripts/panel-performance.test.mjs`) executes it rather than
 * scanning it.
 */

/** The state the pane is in before any answer has arrived, and the word it renders for it. */
export const IDLE_STATE = 'idle';

/** The word a caller may hand over while the join is still running: no row, and no answer. */
export const LOADING_STATE = 'loading';

/** What the pane says where the answer carried no interval and no absence to name. */
export const NO_INTERVAL_LINE = 'intervals: (the answer carried no interval)';

/**
 * One row of the pane: one interval the answer carried, with its two cells apart.
 *
 * `state` is the word the answer gave that interval, copied — the row's own line, never a value the
 * pane inferred from the cells. `pair` is the pair name the answer carried, kept beside the cells for
 * a caller and never rendered as a third column: SC5 asks for the identity and the cost apart, and a
 * third column is a claim the answer never made. `identity` and `cost` are the two cells, each the
 * text of its own state or the empty string.
 */
export type PerformanceRow = {
  readonly state: string;
  readonly pair: string | null;
  readonly identity: string;
  readonly cost: string;
};

/**
 * What the panel renders for one answer.
 *
 * `state` is `idle` when nothing arrived and otherwise the state word the answer carried for its
 * frame. `columns` holds one row per interval, in the answer's order, which is the separation SC5
 * asks for; `lines` holds every row's lines in that same order so a caller that renders one list
 * still reads the pane whole.
 */
export type PerformanceSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly columns: readonly PerformanceRow[];
};

/** The answer read for the fields this pane renders and no others. */
type ReadAnswer = {
  readonly state: string;
  readonly absence: string | null;
  readonly intervals: readonly unknown[];
};

const IDLE_MESSAGE = 'idle: no performance answer has arrived yet';

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
 * A measurement the page wrote: a finite number and nothing else. `null`, a string and a `NaN` are
 * all the same absence, and an interval built on none of them gets a cost cell with no number in it.
 * `0` is a measurement and is kept as one — it is never read as falsy and replaced by a blank.
 */
function measurementOf(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

/**
 * One interval, read as the one row this pane renders for it.
 *
 * The identity cell is the name the interval's own two events carried, or the absence word the
 * answer named for an interval nobody named, or nothing at all — no node index, no position in the
 * answer's list and no neighbouring component's name is ever consulted (N5). The cost cell is the
 * duration the page measured, or — where the answer measured none — the state word the answer gave
 * the interval, unless the interval already named an absence, in which case its cost column stays
 * empty rather than repeating the absence or minting a number.
 *
 * An entry carrying no state word at all is no interval this pane can render: the answer's own word
 * for it is the one thing every row renders, so an entry without one mints no row.
 */
function rowOf(raw: unknown): PerformanceRow | null {
  if (!isObject(raw)) return null;

  const state = nonEmptyString(raw['state']);
  if (state === null) return null;

  const name = nonEmptyString(raw['componentName']);
  const absence = nonEmptyString(raw['absence']);
  const duration = measurementOf(raw['durationMs']);

  const identity = name ?? absence ?? '';
  let cost = '';
  if (duration !== null) cost = String(duration);
  else if (absence === null) cost = state;

  return { state, pair: nonEmptyString(raw['pair']), identity, cost };
}

/**
 * One row's lines: the state word the answer gave the interval, then one line per cell that has
 * text. A cell with nothing in it prints no line, so an unnamed interval shows no cost line and an
 * unmeasured one shows no identity line.
 */
function rowLines(row: PerformanceRow): readonly string[] {
  const lines = [`state: ${row.state}`];
  if (row.identity !== '') lines.push(`identity: ${row.identity}`);
  if (row.cost !== '') lines.push(`cost: ${row.cost}`);
  return lines;
}

/**
 * The answer the caller handed over, or null when there is none this pane may render. A bare object
 * with no state word is not an answer — the state is the one word the join always answers with, and
 * a pane that invented one would be reporting a frame the join never saw. The running markers are the
 * read on its way, which is the state the pane starts in.
 */
function asAnswer(answer: unknown): ReadAnswer | null {
  if (!isObject(answer)) return null;
  if (answer['loading'] === true || answer['assembling'] === true) return null;

  const state = nonEmptyString(answer['state']);
  if (state === null || state === LOADING_STATE) return null;

  const carried = answer['intervals'];
  return {
    state,
    absence: nonEmptyString(answer['absence']),
    intervals: Array.isArray(carried) ? carried : [],
  };
}

/** Nothing has arrived: the pane says so, and says nothing about any interval. */
function idle(): PerformanceSurface {
  return {
    state: IDLE_STATE,
    kind: IDLE_STATE,
    message: IDLE_MESSAGE,
    lines: [IDLE_MESSAGE],
    text: IDLE_MESSAGE,
    columns: [],
  };
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, intervals, unresolved }`, or the marker that the read is running
 */
export function performancePanel(answer?: unknown): PerformanceSurface {
  const read = asAnswer(answer);

  // Nothing was handed over at all: no answer has arrived, and saying so is the idle state.
  if (read === null) return idle();

  const columns: PerformanceRow[] = [];
  for (const raw of read.intervals) {
    const row = rowOf(raw);
    if (row !== null) columns.push(row);
  }

  const lines: string[] = [];
  // The frame's own absence, where it named one: the reason no interval could be named, or the
  // reason the frame held no work to narrate. It is stated once, for the frame, and no row borrows it.
  if (read.absence !== null) lines.push(`absence: ${read.absence}`);
  for (const row of columns) for (const line of rowLines(row)) lines.push(line);

  // An answer holding no interval and no absence still says something: never a blank pane.
  if (lines.length === 0) lines.push(NO_INTERVAL_LINE);

  return {
    state: read.state,
    kind: read.state,
    message: `state: ${read.state}`,
    lines,
    text: lines.join('\n'),
    columns,
  };
}

export const panelPerformance = performancePanel;
export const performanceSurface = performancePanel;
export default performancePanel;
