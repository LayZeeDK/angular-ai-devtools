/**
 * The error-boundary panel surface — M042 T005 (INTENT.md SC1, SC2, SC4).
 *
 * The join itself lives in `extension/error-boundary.js` (T004, landed `7ceb997`,
 * `globalThis.angularAiErrorBoundary`): it reads the boundary section the page agent carries and
 * answers `readErrorBoundary(record) -> { state, absence, findings, absences, version, coreVersion,
 * fallback }`, where each finding is
 *
 *   { declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route,
 *     replacedSubtree }
 *
 * and `state` is `caught`, `cannot-tell` or the record's own word. This module is the display half
 * and nothing else: it is handed that answer and renders it. It reads no record, joins nothing,
 * reads no clock and touches no DOM (SC1) — every value in the pane arrived through the argument,
 * and the join's own rules are never restated here.
 *
 * The pane's one job is separation. The parts the answer keeps apart stay apart on screen:
 *
 *   declaring component  `declaringType` — the component whose own `@boundary` caught the error —
 *                        printed on its own line under its own label (SC1).
 *   throwing component   `throwingType` — the declaration the catch carried — printed on its own
 *                        line under its own label, directly after it. The two are never one line
 *                        that could be either: a reader that sees one component name must be able
 *                        to say which question it answers.
 *   the error            `errorName` and `errorMessage`, and `cause` only where the answer carried
 *                        one, each under its own label (SC2).
 *   the fallback         `fallback` — the content the boundary's rendered error view carried —
 *                        printed under its own label as fallback, and never as the error, never on
 *                        the error's line and never in a finding's fields (SC2).
 *   the replaced subtree `replacedSubtree` — the answer's named absence — printed as its own field
 *                        and nothing else. No node, tag, content or count of the removed primary
 *                        view is printed, because the framework recorded none (SC4).
 *   each absence         one sentence per named absence, in the pane's own vocabulary order, each
 *                        with its own name and its own explanation and never another absence's
 *                        text, never an empty string, never "no errors occurred" and never a
 *                        boundary (SC2, SC4).
 *
 * A part the answer did not carry prints no line at all: a reset the record did not carry is
 * silence rather than a word that reads like a clearance, and a delivery that carried no details
 * prints no declaring component, no caught-by mechanism and no reset. That is why each state
 * renders its own text and no other state's.
 *
 * A state this pane was not written for — any word other than `caught` and `cannot-tell` — is
 * rendered as the state it was given and nothing else: it borrows no finding, no fallback and no
 * absence sentence, because the pane has no field to fill in for it. `cannot-tell` is a state the
 * pane was written for and is never rendered as an empty pane: it always carries at least one
 * sentence — the absence the answer named, or the cannot-tell sentence itself.
 *
 * `cells` is the separation as data: one cell per state the answer can establish — `caught`,
 * `cannot-tell` and each of the ten named absences — holding that state's own sentence where this
 * answer establishes it and the empty string where it does not. Two cells never hold the same
 * text, which is what lets a caller read a cell and know which question it answered.
 *
 * No runtime imports: the route reaches this module lazily through `panel-demo.ts` (see
 * `app.routes.ts`), the way `panel-navigation.ts` and `panel-performance.ts` are reached, so the
 * module loads under node's type stripping and the suite (`scripts/panel-error-boundary.test.mjs`)
 * executes it rather than scanning it.
 */

/** The state the pane is in before any answer has arrived, and the word it renders for it. */
export const IDLE_STATE = 'idle';

/** The word a caller may hand over while the join is still running: no line, and no answer. */
export const LOADING_STATE = 'loading';

/** The join's word for a boundary that caught an error, and the pane's first stated state. */
export const CAUGHT_STATE = 'caught';

/** The join's word for an answer that names why it cannot tell, and the pane's second. */
export const CANNOT_TELL_STATE = 'cannot-tell';

/**
 * Every named absence the join can answer with, in the join's own order (T004's `ABSENCE_ORDER`),
 * so two answers carrying the same absences render the same lines whatever order they listed them.
 */
export const ABSENCES = [
  'no-error-boundary-declared',
  'no-error-caught',
  'no-boundary-details',
  'no-error-view-rendered',
  'no-replaced-subtree',
  'no-global-error-listeners',
  'machinery-unconfirmed',
  'handler-unresolved',
  'hook-refused',
  'no-core-version',
] as const;

/** One named absence of the pane's vocabulary. */
export type AbsenceName = (typeof ABSENCES)[number];

/**
 * The sentence each named absence renders — its own name, then the one fact it states. Each
 * sentence names only its own absence: no absence borrows another's text, and none of them reads
 * as "no errors occurred", as a count, or as a boundary a page does not have.
 */
export const ABSENCE_TEXTS: Readonly<Record<AbsenceName, string>> = {
  'no-error-boundary-declared':
    'no-error-boundary-declared: the record names no error boundary on this page, so there is no declaring component and no caught-by mechanism to report',
  'no-error-caught':
    'no-error-caught: the boundary hook is installed and caught nothing in this window, which is not the same as a page without a boundary',
  'no-boundary-details':
    'no-boundary-details: the arrival reached the error handler with no ErrorDetails, so it names no boundary and no caught-by mechanism',
  'no-error-view-rendered':
    'no-error-view-rendered: no rendered error view was found, so the content the boundary rendered instead was not recorded',
  'no-replaced-subtree':
    'no-replaced-subtree: the boundary removed the primary view and kept no record of it, so the pane cannot show what was replaced',
  'no-global-error-listeners':
    'no-global-error-listeners: the page declares no browser global error listeners, which is not evidence that no raw error happened',
  'machinery-unconfirmed':
    'machinery-unconfirmed: the boundary machinery was not confirmed on this build, so the answer cannot be given',
  'handler-unresolved':
    'handler-unresolved: the error handler could not be resolved, so the boundary hook was never installed',
  'hook-refused':
    'hook-refused: the error handler refused the boundary hook, so no arrival could be recorded',
  'no-core-version':
    'no-core-version: the page reports no core version, so the pane can name only the version it works against',
};

/** The caught state's own sentence, rendered where the answer answered `caught`. */
export const CAUGHT_TEXT = 'caught: a boundary caught an error';

/** The cannot-tell state's own sentence, where the answer named no absence beside it. */
export const CANNOT_TELL_TEXT =
  'cannot-tell: the answer does not establish what happened on this page';

/** The pane's own message before any answer has arrived. */
export const IDLE_MESSAGE = 'idle: no error boundary answer has arrived yet';

/** The label the declaring component is printed under, and under which alone. */
export const DECLARING_LABEL = 'declaring component';

/** The label the throwing component is printed under, and under which alone. */
export const THROWING_LABEL = 'throwing component';

/** What the caught-by cell says where the answer carried the mechanism. */
export const CAUGHT_BY_TEXT = 'recorded';

/** What the reset cell says where the answer carried a reset. */
export const RESET_TEXT = 'available';

/** The label the boundary's rendered content is printed under: fallback, never the error. */
export const FALLBACK_LABEL = 'fallback rendered by the boundary';

/** What the pane says where the answer carried no version at all. */
export const NO_VERSION_LINE = 'version: (the answer names no version)';

/** One finding of the answer, as the cells this pane renders for it. */
export type BoundaryFinding = {
  /** The component whose own boundary caught the error, or '' where the answer named none. */
  readonly declaringType: string;
  /** The declaration the catch carried, or '' where the answer named none. */
  readonly throwingType: string;
  /** The caught-by mechanism as its word, or '' where the answer carried none. */
  readonly caughtBy: string;
  /** The reset as its word, or '' where the answer carried none. */
  readonly reset: string;
  /** The error's own name, or ''. */
  readonly errorName: string;
  /** The error's own message, verbatim, or ''. */
  readonly errorMessage: string;
  /** The cause the record carried, as its own text, or ''. */
  readonly cause: string;
  /** The route the error arrived by, or ''. */
  readonly route: string;
  /** The named absence the answer carries for the removed primary view, or ''. */
  readonly replacedSubtree: string;
};

/**
 * What the panel renders for one answer.
 *
 * `state` is `idle` when nothing arrived and otherwise the state word the answer carried.
 * `lines` holds one line per fact the answer carried, in the answer's own order, and `cells` keeps
 * each state's text apart so a caller can read one state without reading the others.
 */
export type ErrorBoundarySurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly cells: Readonly<Record<string, string>>;
};

/** The answer read for the fields this pane renders and no others. */
type ReadAnswer = {
  readonly state: string;
  readonly absence: string;
  readonly findings: readonly unknown[];
  readonly absences: readonly string[];
  readonly version: string;
  readonly coreVersion: string;
  readonly fallback: string;
};

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
 * The text the answer carried for a field, verbatim, or null when it carried none. A message
 * arrives whole and is printed whole: trimming one would be an edit of what the page recorded, and
 * an empty one states nothing.
 */
function textOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/**
 * The cause the record carried, as its own text, or null where it carried none. The value crosses
 * a message boundary and may be a primitive or a plain object, so it is copied as it arrived and
 * never summarised, re-wrapped or re-derived: a string is printed as itself, a number or a boolean
 * as its own word, and an object as its own contents. A value that cannot be printed at all is the
 * absence of a cause, which is exactly what the record established.
 */
function causeText(value: unknown): string | null {
  if (value === null || typeof value === 'undefined') return null;
  const kind = typeof value;
  if (kind === 'string') return textOf(value);
  if (kind === 'number' || kind === 'boolean') return String(value);
  if (kind !== 'object') return null;
  try {
    return JSON.stringify(value) ?? null;
  } catch {
    return null;
  }
}

/** The strings the answer named, in its order, with anything that is not a name dropped. */
function stringList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  const named: string[] = [];
  for (const entry of value) {
    const name = nonEmptyString(entry);
    if (name !== null) named.push(name);
  }
  return named;
}

/** Every cell the pane answers for, in its own order: the two states, then the ten absences. */
export const CELL_NAMES: readonly string[] = [
  CAUGHT_STATE,
  CANNOT_TELL_STATE,
  ...ABSENCES,
];

/** Every cell at the empty string: an answer that establishes nothing fills in nothing. */
function emptyCells(): Record<string, string> {
  const cells: Record<string, string> = {};
  for (const name of CELL_NAMES) cells[name] = '';
  return cells;
}

/** Whether the pane's vocabulary names this absence. */
function isAbsenceName(value: string): value is AbsenceName {
  return (ABSENCES as readonly string[]).indexOf(value) !== -1;
}

/**
 * One finding, read from its own nine fields and from nowhere else. A part the answer did not carry
 * is the empty string, which prints no line — so a delivery with no details shows no declaring
 * component, no caught-by mechanism and no reset, and no field is ever filled in from its
 * neighbour.
 */
function findingOf(raw: unknown): BoundaryFinding | null {
  if (!isObject(raw)) return null;
  const finding: BoundaryFinding = {
    declaringType: nonEmptyString(raw['declaringType']) ?? '',
    throwingType: nonEmptyString(raw['throwingType']) ?? '',
    caughtBy: raw['caughtBy'] === true ? CAUGHT_BY_TEXT : '',
    reset: raw['reset'] === true ? RESET_TEXT : '',
    errorName: nonEmptyString(raw['errorName']) ?? '',
    errorMessage: textOf(raw['errorMessage']) ?? '',
    cause: causeText(raw['cause']) ?? '',
    route: nonEmptyString(raw['route']) ?? '',
    replacedSubtree: nonEmptyString(raw['replacedSubtree']) ?? '',
  };
  for (const value of Object.values(finding)) {
    if (value !== '') return finding;
  }
  return null;
}

/**
 * One finding's lines: the route it arrived by opens it, then the declaring component and the
 * throwing component on their own labelled lines in that order, then the caught-by mechanism and
 * the reset only where the answer carried them, then the error's own name, message and cause, and
 * finally the replaced subtree as the absence the answer named.
 */
function findingLines(finding: BoundaryFinding): readonly string[] {
  const lines: string[] = [];
  if (finding.route !== '') lines.push(`route: ${finding.route}`);
  if (finding.declaringType !== '')
    lines.push(`${DECLARING_LABEL}: ${finding.declaringType}`);
  if (finding.throwingType !== '')
    lines.push(`${THROWING_LABEL}: ${finding.throwingType}`);
  if (finding.caughtBy !== '') lines.push(`caught by: ${finding.caughtBy}`);
  if (finding.reset !== '') lines.push(`reset: ${finding.reset}`);
  if (finding.errorName !== '') lines.push(`error: ${finding.errorName}`);
  if (finding.errorMessage !== '')
    lines.push(`error message: ${finding.errorMessage}`);
  if (finding.cause !== '') lines.push(`cause: ${finding.cause}`);
  if (finding.replacedSubtree !== '')
    lines.push(`replaced subtree: ${finding.replacedSubtree}`);
  return lines;
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

  return {
    state,
    absence: nonEmptyString(answer['absence']) ?? '',
    findings: Array.isArray(answer['findings']) ? answer['findings'] : [],
    absences: stringList(answer['absences']),
    version: nonEmptyString(answer['version']) ?? '',
    coreVersion: nonEmptyString(answer['coreVersion']) ?? '',
    fallback: textOf(answer['fallback']) ?? '',
  };
}

/**
 * Every absence this answer carries, once each: the one the answer named as its own first, then
 * the list beside it in the answer's order. The order the *lines* are printed in is the pane's
 * vocabulary order, not this one; this list is only what the answer established.
 */
function carriedAbsences(read: ReadAnswer): readonly string[] {
  const carried: string[] = [];
  if (read.absence !== '') carried.push(read.absence);
  for (const absence of read.absences) {
    if (carried.indexOf(absence) === -1) carried.push(absence);
  }
  return carried;
}

/**
 * The cells this answer establishes: the caught or cannot-tell sentence where the answer answered
 * that state, and one cell per absence it carried. Every other cell is the empty string, which is
 * why no cell can hold another state's text.
 */
function cellsOf(
  read: ReadAnswer,
  carried: readonly string[],
): Record<string, string> {
  const cells = emptyCells();
  if (read.state === CAUGHT_STATE) cells[CAUGHT_STATE] = CAUGHT_TEXT;
  if (read.state === CANNOT_TELL_STATE)
    cells[CANNOT_TELL_STATE] = CANNOT_TELL_TEXT;
  for (const absence of carried) {
    if (isAbsenceName(absence)) cells[absence] = ABSENCE_TEXTS[absence];
  }
  return cells;
}

/** Nothing has arrived: the pane says so, and says nothing about any boundary. */
function idle(): ErrorBoundarySurface {
  return {
    state: IDLE_STATE,
    kind: IDLE_STATE,
    message: IDLE_MESSAGE,
    lines: [IDLE_MESSAGE],
    text: IDLE_MESSAGE,
    cells: emptyCells(),
  };
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, absence, findings, absences, version, coreVersion, fallback }`,
 *   or the marker that the read is running
 */
export function errorBoundaryPanel(answer?: unknown): ErrorBoundarySurface {
  const read = asAnswer(answer);

  // Nothing was handed over at all: no answer has arrived, and saying so is the idle state.
  if (read === null) return idle();

  const carried = carriedAbsences(read);

  // A state this pane was not written for is rendered as the state it was given and nothing else:
  // it borrows no finding, no fallback and no absence sentence, because the pane has no field to
  // fill in for it — its cells stay empty for the same reason.
  if (read.state !== CAUGHT_STATE && read.state !== CANNOT_TELL_STATE) {
    const message = `state: ${read.state}`;
    return {
      state: read.state,
      kind: read.state,
      message,
      lines: [message],
      text: message,
      cells: emptyCells(),
    };
  }

  const cells = cellsOf(read, carried);

  const lines: string[] = [`state: ${read.state}`];

  // The state's own sentence, exactly once: the caught or cannot-tell text its cell holds, so a
  // cell that is not the empty string is always a line of the flat rendering and never a claim the
  // pane keeps to itself.
  const ownState = cells[read.state] ?? '';
  if (ownState !== '') lines.push(ownState);

  // One group of lines per finding, in the answer's order. Each group opens with the route the
  // error arrived by, so two findings stay apart without a count or an index being invented.
  for (const raw of read.findings) {
    const finding = findingOf(raw);
    if (finding !== null)
      for (const line of findingLines(finding)) lines.push(line);
  }

  // The content the boundary's error view rendered: fallback, under its own label, never the error.
  if (read.fallback !== '') lines.push(`${FALLBACK_LABEL}: ${read.fallback}`);

  // Each absence in its own sentence, in the pane's vocabulary order.
  for (const absence of ABSENCES) {
    const sentence = cells[absence] ?? '';
    if (sentence !== '') lines.push(sentence);
  }

  // An absence word the pane was not written for is echoed as itself rather than dropped: the word
  // is the whole of what the answer established about it.
  for (const absence of carried) {
    if (!isAbsenceName(absence)) lines.push(`absence: ${absence}`);
  }

  // The version the surface works against, and the one the page reported where it reported one. A
  // page that reports none is the `no-core-version` absence above, never an invented version here.
  lines.push(
    read.version === '' ? NO_VERSION_LINE : `version: ${read.version}`,
  );
  if (read.coreVersion !== '') lines.push(`core version: ${read.coreVersion}`);

  return {
    state: read.state,
    kind: read.state,
    message: `state: ${read.state}`,
    lines,
    text: lines.join('\n'),
    cells,
  };
}

export const panelErrorBoundary = errorBoundaryPanel;
export const errorBoundarySurface = errorBoundaryPanel;
export default errorBoundaryPanel;
