/**
 * The navigation panel surface — M041 T004 (INTENT.md SC1, SC2, SC3; held-out E2, E5, E7).
 *
 * The join itself lives in `extension/navigation-narrator.js` (T003,
 * `globalThis.angularAiNavigationNarrator`): it walks the `routerEvents` record T002 publishes and
 * answers `narrateNavigation(record) -> { state, absence, navigations, unattributed }`, where each
 * navigation is
 *
 *   { id, state, url, urlAfterRedirects, terminal, code, reason, error, stage, lastEvent, holder,
 *     absence, matched, loads, guards, resolve }
 *
 * and each load is `{ route, startedAt, endedAt, durationMs, open }`. This module is the display
 * half and nothing else: it is handed that answer and renders it. It reads no record, no event
 * list, no `currentNavigation()`, no router and no clock (SC1): every value in the pane arrived
 * through the argument, and the join's own rules are never restated here.
 *
 * The pane's one job is separation (SC3). Each navigation the answer carried becomes one block, in
 * the answer's order and no other, and each block keeps apart the parts the answer keeps apart:
 *
 *   state        the state word the answer gave the navigation, copied and printed first, so a
 *                state this pane was not written for still renders as the state it was given.
 *   route        the recorded `url` the navigation was heading for, and nothing else.
 *   endRoute     `urlAfterRedirects` — printed only where the answer carries it, which is the case
 *                the terminal event recorded it. A cancel or an error prints no end route at all,
 *                because an empty or borrowed one would name a destination the router never stated
 *                (SC2, E2).
 *   terminal     the terminal class the record reached, and then only that class's own fields: the
 *                `code` and the `reason` where the answer carried them, and the error's own name and
 *                message under their own labels. Nothing else is printed for an ended navigation,
 *                and no cause is added.
 *   stage        for an open navigation, the stage word the answer derived from its last recorded
 *                event, labelled `stage reached` so a reader cannot take it for the reason the
 *                navigation is open (SC2, E4); its last event's own class beside it; and the holder
 *                as the answer names it — `cannot-tell` with `no-holder-recorded` — and never a
 *                guard, chunk, task or resolver name, because the stream names none (SC3, E5).
 *   guards       the answer's guard answer as the answer gives it: `cannot-tell`, the
 *                `guard-verdict-not-recorded` absence, and the `shouldActivate` aggregate reported
 *                as the aggregate it is. No guard is ever named (SC3, E7).
 *   resolve      the answer's resolve answer: `cannot-tell` with `no-resolver-configured`, because
 *                neither target declares a resolver and the stage runs anyway (SC3, E7).
 *   matched      the leaf path the answer carried for the route chain, printed only where it was
 *                carried — a wildcard match renders the path the answer named, and never a refusal.
 *   loads        one entry per route-config load the answer paired, each attributed by its own
 *                `route` and carrying its measured interval as its own number — a measured zero
 *                included. A load the answer could not close prints no number at all: the interval
 *                line is absent rather than zero, blank or borrowed (SC3, E9).
 *
 * The answer's `unattributed` list is the answer's own, and it is rendered as unattributed: one
 * line per entry at the answer's own level, never as a row of a navigation and never as a load of
 * one, so an id-less load is not folded into a cost it does not belong to.
 *
 * A cell with nothing in it prints nothing: an ended navigation prints no stage, holder or
 * absence line, and an open one prints no terminal, code, reason or error line, because the answer
 * carried none of them for it. That is exactly what SC3 asks for — no field the answer did not
 * give, for either state — and it is why each state renders its own text and no other state's.
 *
 * The pane's own text is assembled from the same values in the same order on every read, and it
 * holds no state between calls, so the same answer rendered twice is byte-identical.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `panel-performance.ts` and `panel-render-phase.ts` are reached, so the module loads under node's
 * type stripping and the suite (`scripts/panel-navigation.test.mjs`) executes it rather than
 * scanning it.
 */

/** The state the pane is in before any answer has arrived, and the word it renders for it. */
export const IDLE_STATE = 'idle';

/** The word a caller may hand over while the join is still running: no row, and no answer. */
export const LOADING_STATE = 'loading';

/** What the pane says for a load the answer carried with no route of its own. */
export const NO_LOAD_ROUTE = '(the answer named no route)';

/** What the pane says for an unattributed entry that carried neither of its two fields. */
export const NO_UNATTRIBUTED_FIELD =
  '(the answer named neither a kind nor a route)';

/** What the pane says where the answer carried no navigation, no absence and no unattributed load. */
export const NO_NAVIGATION_LINE =
  'navigations: (the answer carried no navigation)';

/** One route-config load the answer paired, as the cells this pane renders for it. */
export type NavigationLoad = {
  /** The path the load's own start named, or the empty string where it named none. */
  readonly route: string;
  /** The measured interval as its own number, or the empty string where the answer has none. */
  readonly interval: string;
  /** The answer's own `open`: kept beside the cells, and never rendered as an interval. */
  readonly open: boolean;
};

/**
 * One navigation of the answer, as the row this pane renders for it.
 *
 * Every cell is the text of a field the answer carried, or the empty string where it carried none.
 * No cell is filled from another navigation, from another field or from a value the pane computed:
 * `state` is the answer's own word, `stage` is the answer's own stage word, `holder` and `guards`
 * are the states the answer gave them, and `loads` keeps each load apart rather than summed into
 * one cost.
 */
export type NavigationRow = {
  readonly state: string;
  readonly route: string;
  readonly endRoute: string;
  readonly terminal: string;
  readonly stage: string;
  readonly lastEvent: string;
  readonly code: string;
  readonly reason: string;
  readonly errorName: string;
  readonly errorMessage: string;
  readonly holder: string;
  readonly holderAbsence: string;
  readonly absence: string;
  readonly guards: string;
  readonly guardAbsence: string;
  readonly shouldActivate: string;
  readonly resolve: string;
  readonly resolveAbsence: string;
  readonly matched: string;
  readonly loads: readonly NavigationLoad[];
};

/**
 * What the panel renders for one answer.
 *
 * `state` is `idle` when nothing arrived and otherwise the state word the answer carried for the
 * record. `columns` holds one row per navigation, in the answer's order, which is the separation
 * SC3 asks for; `lines` holds every row's lines in that same order, then the answer's own
 * unattributed entries, so a caller that renders one list still reads the pane whole.
 */
export type NavigationSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly columns: readonly NavigationRow[];
};

/** The answer read for the fields this pane renders and no others. */
type ReadAnswer = {
  readonly state: string;
  readonly absence: string | null;
  readonly navigations: readonly unknown[];
  readonly unattributed: readonly unknown[];
};

const IDLE_MESSAGE = 'idle: no navigation answer has arrived yet';

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
 * The text the answer carried for a field, verbatim, or null when it carried none. A reason and a
 * message arrive whole and are printed whole: trimming one would be an edit of what the page
 * recorded, and an empty one states nothing.
 */
function textOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/**
 * A measurement the page wrote, as its own text: a finite number and nothing else. `0` is a
 * measurement and renders `0` — it is never read as falsy and replaced by a blank — while `null`, a
 * string and a `NaN` are all the same absence and render nothing.
 */
function measurementText(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(value);
}

/** The answer's own boolean as its own word, or nothing where it carried none. */
function booleanText(value: unknown): string {
  if (typeof value !== 'boolean') return '';
  return value ? 'true' : 'false';
}

/** An object the answer carried, or null: a field that is not one is a field it did not carry. */
function objectOf(value: unknown): Record<string, unknown> | null {
  return isObject(value) ? value : null;
}

/**
 * One route-config load, rendered as its own cells. The interval is the duration the answer
 * measured and nothing else, so an unclosed load's interval cell is empty; the answer's `open`
 * boolean is kept beside the cells rather than rendered as a number.
 */
function loadOf(raw: unknown): NavigationLoad | null {
  if (!isObject(raw)) return null;
  return {
    route: nonEmptyString(raw['route']) ?? '',
    interval: measurementText(raw['durationMs']),
    open: raw['open'] === true,
  };
}

/**
 * One navigation, read as the one row this pane renders for it.
 *
 * Each part is read from its own field and from nowhere else: the holder's two words from the
 * holder the answer carried, the guard's aggregate from the guard answer, the resolve absence from
 * the resolve answer, the end route from `urlAfterRedirects` alone, and the match's path from the
 * chain the answer carried. A part the answer did not carry contributes empty cells, which print no
 * line — so no state borrows another's text. An entry carrying no state word at all is no
 * navigation this pane can render: the state is the one word every block renders.
 */
function rowOf(raw: unknown): NavigationRow | null {
  if (!isObject(raw)) return null;

  const state = nonEmptyString(raw['state']);
  if (state === null) return null;

  const error = objectOf(raw['error']);
  const holder = objectOf(raw['holder']);
  const guards = objectOf(raw['guards']);
  const resolve = objectOf(raw['resolve']);
  const matched = objectOf(raw['matched']);
  const carried = Array.isArray(raw['loads']) ? raw['loads'] : [];

  const loads: NavigationLoad[] = [];
  for (const entry of carried) {
    const load = loadOf(entry);
    if (load !== null) loads.push(load);
  }

  return {
    state,
    route: nonEmptyString(raw['url']) ?? '',
    endRoute: nonEmptyString(raw['urlAfterRedirects']) ?? '',
    terminal: nonEmptyString(raw['terminal']) ?? '',
    stage: nonEmptyString(raw['stage']) ?? '',
    lastEvent: nonEmptyString(raw['lastEvent']) ?? '',
    code: measurementText(raw['code']),
    reason: textOf(raw['reason']) ?? '',
    errorName: error === null ? '' : (nonEmptyString(error['name']) ?? ''),
    errorMessage: error === null ? '' : (textOf(error['message']) ?? ''),
    holder: holder === null ? '' : (nonEmptyString(holder['state']) ?? ''),
    holderAbsence:
      holder === null ? '' : (nonEmptyString(holder['absence']) ?? ''),
    absence: nonEmptyString(raw['absence']) ?? '',
    guards: guards === null ? '' : (nonEmptyString(guards['state']) ?? ''),
    guardAbsence:
      guards === null ? '' : (nonEmptyString(guards['absence']) ?? ''),
    shouldActivate:
      guards === null ? '' : booleanText(guards['shouldActivate']),
    resolve: resolve === null ? '' : (nonEmptyString(resolve['state']) ?? ''),
    resolveAbsence:
      resolve === null ? '' : (nonEmptyString(resolve['absence']) ?? ''),
    matched: matched === null ? '' : (nonEmptyString(matched['path']) ?? ''),
    loads,
  };
}

/**
 * One row's lines: the state word the answer gave the navigation, then one line per part that has
 * text, each under the label of its own state.
 *
 * A part with nothing in it prints no line, so an ended navigation shows no stage, holder or
 * absence line and an open one shows no terminal, code, reason or error line. The last event is
 * printed only for a navigation with no terminal: for an ended one the answer's `lastEvent` is its
 * terminal, which the terminal line already prints, and a state never repeats another's text.
 */
function rowLines(row: NavigationRow): readonly string[] {
  const lines: string[] = [`state: ${row.state}`];
  if (row.route !== '') lines.push(`route: ${row.route}`);
  if (row.endRoute !== '') lines.push(`endRoute: ${row.endRoute}`);
  if (row.terminal !== '') lines.push(`terminal: ${row.terminal}`);
  if (row.code !== '') lines.push(`code: ${row.code}`);
  if (row.reason !== '') lines.push(`reason: ${row.reason}`);
  if (row.errorName !== '') lines.push(`error: ${row.errorName}`);
  if (row.errorMessage !== '') lines.push(`error message: ${row.errorMessage}`);
  if (row.stage !== '') lines.push(`stage reached: ${row.stage}`);
  if (row.absence !== '') lines.push(`stage absence: ${row.absence}`);
  if (row.terminal === '' && row.lastEvent !== '')
    lines.push(`lastEvent: ${row.lastEvent}`);
  if (row.holder !== '') lines.push(`holder: ${row.holder}`);
  if (row.holderAbsence !== '')
    lines.push(`holder absence: ${row.holderAbsence}`);
  if (row.guards !== '') lines.push(`guards: ${row.guards}`);
  if (row.guardAbsence !== '')
    lines.push(`guards absence: ${row.guardAbsence}`);
  if (row.shouldActivate !== '')
    lines.push(`shouldActivate: ${row.shouldActivate}`);
  if (row.resolve !== '') lines.push(`resolve: ${row.resolve}`);
  if (row.resolveAbsence !== '')
    lines.push(`resolve absence: ${row.resolveAbsence}`);
  if (row.matched !== '') lines.push(`matched: ${row.matched}`);
  for (const load of row.loads) {
    lines.push(`load: ${load.route === '' ? NO_LOAD_ROUTE : load.route}`);
    if (load.interval !== '') lines.push(`load interval: ${load.interval}`);
  }
  return lines;
}

/**
 * One entry of the answer's `unattributed` list, rendered as unattributed: the kind and the route
 * the answer named, and nothing else. It is the answer's own line at the answer's own level, so it
 * can never be read as a load of a navigation it was not attributed to.
 */
function unattributedLine(raw: unknown): string | null {
  if (!isObject(raw)) return null;

  const kind = nonEmptyString(raw['kind']);
  const route = nonEmptyString(raw['route']);
  if (kind === null && route === null)
    return `unattributed: ${NO_UNATTRIBUTED_FIELD}`;
  if (route === null) return `unattributed: ${kind}`;
  if (kind === null) return `unattributed: ${route}`;
  return `unattributed: ${kind} ${route}`;
}

/**
 * The answer the caller handed over, or null when there is none this pane may render. A bare object
 * with no state word is not an answer — the state is the one word the join always answers with, and
 * a pane that invented one would be reporting a record the join never read. The running markers are
 * the read on its way, which is the state the pane starts in.
 */
function asAnswer(answer: unknown): ReadAnswer | null {
  if (!isObject(answer)) return null;
  if (answer['loading'] === true || answer['assembling'] === true) return null;

  const state = nonEmptyString(answer['state']);
  if (state === null || state === LOADING_STATE) return null;

  const navigations = answer['navigations'];
  const unattributed = answer['unattributed'];
  return {
    state,
    absence: nonEmptyString(answer['absence']),
    navigations: Array.isArray(navigations) ? navigations : [],
    unattributed: Array.isArray(unattributed) ? unattributed : [],
  };
}

/** Nothing has arrived: the pane says so, and says nothing about any navigation. */
function idle(): NavigationSurface {
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
 * @param answer the join's `{ state, absence, navigations, unattributed }`, or the marker that the
 *   read is running
 */
export function navigationPanel(answer?: unknown): NavigationSurface {
  const read = asAnswer(answer);

  // Nothing was handed over at all: no answer has arrived, and saying so is the idle state.
  if (read === null) return idle();

  const columns: NavigationRow[] = [];
  for (const raw of read.navigations) {
    const row = rowOf(raw);
    if (row !== null) columns.push(row);
  }

  const lines: string[] = [];
  // The record's own absence, where it named one: the reason there is no navigation to render. It
  // is stated once, for the answer, and no row borrows it.
  if (read.absence !== null) lines.push(`absence: ${read.absence}`);
  for (const row of columns) for (const line of rowLines(row)) lines.push(line);
  for (const entry of read.unattributed) {
    const line = unattributedLine(entry);
    if (line !== null) lines.push(line);
  }

  // An answer holding no navigation, no absence and no unattributed load still says something:
  // never a blank pane.
  if (lines.length === 0) lines.push(NO_NAVIGATION_LINE);

  return {
    state: read.state,
    kind: read.state,
    message: `state: ${read.state}`,
    lines,
    text: lines.join('\n'),
    columns,
  };
}

export const panelNavigation = navigationPanel;
export const navigationSurface = navigationPanel;
export default navigationPanel;
