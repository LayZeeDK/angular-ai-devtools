/**
 * The chunk-failure panel surface — M064 T003 (INTENT.md SC4; prohibitions N1, N4).
 *
 * The join that decides this pane's answer is `extension/chunk-failure.js` (T002,
 * `globalThis.angularAiChunkFailure`): `chunkFailure(record, navigation?)` is a pure function of the
 * dynamic-import attempt record `extension/import-failure.js` (T001) writes, and it answers
 *
 *   chunkFailure(attempt)  -> { state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
 *   chunkFailure(attempts) -> one such answer per attempt, in the order the record holds them
 *
 * with those seven fields and no eighth, and only the fields the attempt's own record carried:
 * `specifier` is present only where the record named one, `status` only where a response arrived,
 * `hash` only where the page computed one — truncated where the record truncated it — and
 * `consideredCount` only on an answer produced from a list.
 *
 * `state` is one of four words and nothing else:
 *
 *   missing-import    the import failed and the record names the specifier. The pane renders the
 *                     specifier, the owning route path and the status, and the hash where the record
 *                     carried one — and nothing beside them: no 404 it did not read and no drift it
 *                     did not measure.
 *   never-completed   the request produced no response status. The pane renders the specifier, the
 *                     route path and the reason `no-response`, and never a 404 and never a version
 *                     drift (E3, N1).
 *   resolved          the import loaded, so there is no failure to report. Rendered as a resolution
 *                     rather than omitted or as an empty failure (E1).
 *   cannot-tell       the record does not state what the answer asked: the pane renders the reason
 *                     the answer names and no cause beside it.
 *
 * A list of answers is one row per answer, in the order the join answered them — which is the order
 * the router attempted them — so two failed imports of one navigation stay two rows and neither is
 * collapsed onto the other (E2). The rows are the surface's blocks; the flat `lines` are the same
 * rows read as one list, so a caller that renders one list still reads the pane whole.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No remedy, no cause and no schematic. The answer carries none of the three, so no line of this
 *   pane states one (N4, SC4).
 * - No version drift. A status, a chunk filename and a missing hash are not a deploy this record
 *   measured, so no line infers one (N1).
 * - No identity the answer did not carry. No chunk name is read back out of a specifier, no hash is
 *   completed from a filename, and a field the answer does not carry renders no line at all rather
 *   than a blank or a guess (C2).
 * - No sentence of its own. Every line is a label enumerated below and one of the answer's values,
 *   which is why this pane declares no copy for the shipped digest to explain.
 *
 * The pane reads no record, opens no page and imports nothing at runtime: it reads no network
 * response, wraps no `import()`, reads no inspected document and installs no tap, because the
 * attempt record is the caller's and this file only renders the answer it was handed (N2, N3).
 *
 * No runtime imports and no global CSS: the route `chunk-failure` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-guard-phase.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` and the block hooks — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const MISSING_IMPORT = 'missing-import';
export const NEVER_COMPLETED = 'never-completed';
export const RESOLVED = 'resolved';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  MISSING_IMPORT,
  NEVER_COMPLETED,
  RESOLVED,
  CANNOT_TELL,
] as const;

/** One state word of `STATES`. */
export type ChunkFailureState = (typeof STATES)[number];

/** The word a value that is no answer at all is rendered as: no field of the contract for it. */
export const NO_ANSWER = 'no-answer';

/**
 * The seven fields the answer carries, enumerated once. An eighth field is not rendered by this pane
 * because there is no label for one: the table below is the only place a field name is spelled, and
 * `scripts/chunk-failure-copy.test.mjs` holds it to the join's own answer keys.
 */
export const FIELDS = [
  'state',
  'specifier',
  'routePath',
  'status',
  'hash',
  'consideredCount',
  'reason',
] as const;

/**
 * The labels the answer's own fields print under, enumerated once. Every line the pane writes is one
 * of these labels and a value the answer carries, which is what makes "no field is rendered that the
 * answer does not carry" a reading of this table rather than a claim about the renderer.
 * `consideredCount` prints under its own contract name so the count line is the field it states.
 */
export const LABELS = {
  state: 'state',
  specifier: 'specifier',
  routePath: 'routePath',
  status: 'status',
  hash: 'hash',
  consideredCount: 'consideredCount',
  reason: 'reason',
} as const;

/**
 * One row of the pane: one answer, rendered as its state and the fields it carries.
 *
 * `state` is the word the answer answered; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the row in order; and `text` is those lines joined.
 */
export type ChunkFailureRow = {
  readonly kind: string;
  readonly state: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

/**
 * What the panel renders for one answer or one list of answers. `state` is the first row's state —
 * the join answered rows, and the pane names the row it was handed first in router order; `lines`
 * is the whole pane as one flat list; and `blocks` is one row per answer, present only where there
 * is more than one answer, so a single answer renders as the flat pane it always was.
 */
export type ChunkFailureSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly blocks: readonly ChunkFailureRow[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether the answer carries a value under this key: `null` and absent carry nothing to print. */
function carried(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/**
 * A carried value, as the answer spells it: a string exactly as it arrived, a number or a boolean as
 * its own text, an object or a list as its own JSON — the value the join reported and not a
 * paraphrase of it — and anything else as nothing at all.
 *
 * The empty string is a value here and not an absence: a route's own configured path may be the
 * empty string, which is the componentless route's path and the root's, so it is printed as its own
 * JSON spelling (`""`) rather than as a label with nothing behind it. A reader can then tell the two
 * apart — an empty path is a value, a missing path is no line at all.
 *
 * A truncated hash is printed exactly as the record carried it: this reader never pads, completes or
 * otherwise repairs a value, so the hash line renders the bytes the join was given (E4).
 */
function valueText(value: unknown): string {
  if (typeof value === 'string') return value === '' ? '""' : value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value) || isObject(value)) return JSON.stringify(value);
  return '';
}

/** One line of the pane: a field label, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** One field of the answer, under the label `LABELS` gives it, or no line where it carries none. */
function fieldLine(
  label: string,
  key: string,
  held: Record<string, unknown>,
  lines: string[],
): void {
  const value = held[key];
  if (!carried(value)) return;
  const text = valueText(value);
  if (text === '') return;
  lines.push(line(label, text));
}

/**
 * One answer's row: the state first, then the six fields the answer may carry, in the order the
 * contract names them, and only those it carries. A state word this pane was not written for is
 * rendered as the word it was given and nothing else, because the pane has no reading to print for
 * a state nobody wrote.
 */
function rowOf(answer: Record<string, unknown>): ChunkFailureRow {
  const stated = answer['state'];
  const stateWord =
    typeof stated === 'string' && stated !== '' ? stated : NO_ANSWER;
  const lines: string[] = [line(LABELS.state, stateWord)];
  if (STATES.some((state) => state === stateWord)) {
    fieldLine(LABELS.specifier, 'specifier', answer, lines);
    fieldLine(LABELS.routePath, 'routePath', answer, lines);
    fieldLine(LABELS.status, 'status', answer, lines);
    fieldLine(LABELS.hash, 'hash', answer, lines);
    fieldLine(LABELS.consideredCount, 'consideredCount', answer, lines);
    fieldLine(LABELS.reason, 'reason', answer, lines);
  }
  const first = lines[0] ?? '';
  return {
    kind: stateWord,
    state: stateWord,
    message: first,
    lines,
    text: lines.join('\n'),
  };
}

/** The pane assembled from its rows: the first row's state, the first line as its message. */
function surface(rows: readonly ChunkFailureRow[]): ChunkFailureSurface {
  const lines: string[] = [];
  for (const row of rows) lines.push(...row.lines);
  const state = rows.length > 0 ? (rows[0]?.state ?? NO_ANSWER) : NO_ANSWER;
  const message =
    rows.length > 0 && lines.length > 0
      ? (lines[0] ?? '')
      : line(LABELS.state, NO_ANSWER);
  const flat = rows.length > 0 ? lines : [message];
  return {
    state,
    kind: state,
    message,
    lines: flat,
    text: flat.join('\n'),
    // One answer is the flat pane it always was; a list is one row per answer, in the join's order.
    blocks: rows.length > 1 ? rows : [],
  };
}

/**
 * The answer rendered as one row per attempt.
 *
 * @param answer the join's answer, the list of answers it produced for a record, or a value that is
 *   no answer
 */
export function chunkFailurePanel(answer?: unknown): ChunkFailureSurface {
  // A value that is no answer at all states the one thing it can: that nothing was handed over. No
  // field of the join's contract is rendered for it, and no state word is invented for it — the bare
  // word says so and nothing beside it.
  if (!isObject(answer) && !Array.isArray(answer)) {
    return surface([rowOf({ state: NO_ANSWER })]);
  }

  if (Array.isArray(answer)) {
    // One row per answer and no row dropped: an entry that is no answer keeps its place in the list
    // as the one thing the pane can say about it, so a failure the record states never vanishes
    // behind an entry beside it.
    const rows = answer.map((entry) =>
      isObject(entry) ? rowOf(entry) : rowOf({ state: NO_ANSWER }),
    );
    return surface(rows);
  }

  return surface([rowOf(answer)]);
}

export const panelChunkFailure = chunkFailurePanel;
export const chunkFailureSurface = chunkFailurePanel;
export default chunkFailurePanel;
