/**
 * The visual-qa panel surface — M054 T003 (INTENT.md SC1, SC2, SC3; prohibitions N1-N4).
 *
 * The join that decides this pane's state lives in `extension/visual-qa.js` (T002,
 * `globalThis.angularAiVisualQa`): `styleReport(measurement)` is a pure join that answers
 *
 *   styleReport(measurement) -> { state, element, rows, reason }
 *
 * where `state` is `measured`, `no-such-element`, `no-document` or `no-baseline`; `element` is the
 * name the measurement asked for; `rows` is one entry per property the measurement read, each
 * `{ property, computed, baseline }` with the property named exactly as the measurement wrote it
 * (E1) and each value carried as its own side reported it (E2); and `reason` is the absence the
 * state names, or `null` for a measured run. This module is the display half and nothing else: it is
 * handed that record and renders it. It reads no document, calls no `getComputedStyle`, reads no
 * stylesheet, dispatches no message, reaches no inspected window, touches no page-side control
 * (N1) and imports nothing at runtime, so the join's own rules are never restated here as a
 * computation.
 *
 * The four states, each in its own sentence, and each rendering only what the join reported:
 *
 *   measured         one row per property the join carried, in the order it carried them. The row
 *                    names the property as the report wrote it, then prints the element's computed
 *                    measurement under its own label and the baseline stylesheet's declared value
 *                    under the other, each as its side reported it — a computed value the browser
 *                    serialised differently from the declaration is not normalised into the
 *                    declaration's spelling, and the baseline value is never printed as the
 *                    measurement nor the measurement as the baseline (E2, N2). A row that carries
 *                    no computed reading is no row at all, and a row that carries no baseline value
 *                    is not rendered one-sided: a report whose rows do not carry both readings is
 *                    stated as the absence it is, naming the properties, with no row beside it
 *                    (N3, N4). A run that measured nothing renders no property row (SC3, E5).
 *   no-such-element  the document the reading reached rendered no element under the requested
 *                    name. The pane states that in its own sentence, names the document the reading
 *                    located — its own `documentUrl` and `documentClass`, copied from the report
 *                    rather than restated (E4) — and repeats the join's `detail`, which is where the
 *                    reading that located the document is named. No property row is rendered, and
 *                    the state is never `measured`, `unchanged` or `matching` (N3).
 *   no-document      no document the panel could read reached the report. Nothing is named beside
 *                    the absence, because there is no document reading to name, and no property row
 *                    is rendered (SC2, N3).
 *   no-baseline      the measurement read the element and the baseline stylesheet declares nothing
 *                    for at least one of the properties it read. The pane names the property the
 *                    report names and every property it lists, in the report's own order, states the
 *                    absence in its own sentence, and renders no row — a baseline this pane does not
 *                    have is never replaced by the element's own value standing beside it (N4).
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the
 * four state sentences and the one absence it can state about its own input — no report handed
 * over. Every line the pane writes of its own is one of those entries and nothing else; the other
 * lines are the report's fields under their own labels (`state:`, `element:`, `document:`,
 * `document-class:`, `property:`, `properties:`, `detail:`), so a new sentence is a deliberate edit
 * to the registry rather than a wording that slips past a matcher. The lookup of a state word is an
 * own-property one (`Object.hasOwn`), so a word that collides with an `Object.prototype` key is such
 * a word and not a sentence.
 *
 * The two labels the measured rows carry are the ones C3 and N2 ask for: a computed value is
 * labelled as the element's own measurement and a declared value as the baseline stylesheet's
 * declaration. They are constants rather than a sentence, because a surface that spelled them per
 * row would be the place a side label could drift.
 *
 * Where the measurement happens. The reading is T001's: `research/raw/m054-style-read.json` measured
 * it live, in the panel's own `chrome-extension://` document, for the four elements the baseline
 * stylesheet names (`h2`, `section.panel-demo[data-surface][data-state]`, `p.state`, `p.line`), and
 * the property list is that recording's (`properties[].name`, PLAN C2). This pane neither re-reads
 * the document nor re-derives a reading: it renders the report, so a rendered value is always one
 * the measurement produced and never one the pane supplied (N4). The element the demo's sample
 * fact names is the panel's own `<h2>`, which the demo renders under the baseline's hooks.
 *
 * The pane's own sentences are not entered in `extension/copy-digest.json`, which this task does not
 * own; the gap is recorded here and in the task Log for the milestone's fourth task, which
 * re-measures the copy record over every surface on disk.
 *
 * No runtime imports and no global CSS: the route `visual-qa` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-webmcp-rehearsal.ts` and
 * `panel-what-changed.ts` are reached, so the module loads under node's type stripping and a suite
 * can execute it rather than scan it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The four state words this surface renders, in the order it states them. */
export const MEASURED = 'measured';
export const NO_SUCH_ELEMENT = 'no-such-element';
export const NO_DOCUMENT = 'no-document';
export const NO_BASELINE = 'no-baseline';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  MEASURED,
  NO_SUCH_ELEMENT,
  NO_DOCUMENT,
  NO_BASELINE,
] as const;

/** One state word of `STATES`. */
export type StyleState = (typeof STATES)[number];

/** The label a computed value is printed under: the element's own measurement (N2). */
export const COMPUTED_LABEL = 'computed (the element’s measurement)';

/** The label a declared value is printed under: the baseline stylesheet's declaration (N2). */
export const BASELINE_LABEL = 'baseline (the stylesheet’s declaration)';

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state word it answers where it is a state's own sentence (`null` for the pane's own absence).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the four state sentences in the order `STATES` names them, then the absence a
 * surface can state about the record it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-measured',
    text: 'measured: the panel read every property below from the element it names in its own document, and the baseline stylesheet declares a value for each one, so every row carries the element’s computed measurement under its own label and the stylesheet’s declared value beside it under the other — each value is the one its own side reported, and neither is reported as the other',
    state: MEASURED,
  },
  {
    id: 'state-no-such-element',
    text: 'no-such-element: the reading reached a document and that document renders no element under the requested name, so no property was measured and no row is rendered — an element nobody found is not an element measured as unchanged or matching',
    state: NO_SUCH_ELEMENT,
  },
  {
    id: 'state-no-document',
    text: 'no-document: no document the panel could read reached this report, so there is no element to name, no reading to state beside the absence and no property row to render',
    state: NO_DOCUMENT,
  },
  {
    id: 'state-no-baseline',
    text: 'no-baseline: the measurement read the properties below on the element, and the baseline stylesheet declares no value for at least one of them, so the element’s own value is not printed where the baseline belongs and no property row is rendered',
    state: NO_BASELINE,
  },
  {
    id: 'no-style-report',
    text: 'no-style-report: no style report was handed over, so no state, no element and no property row are reported',
    state: null,
  },
];

/** The registry entry one id names, or `undefined` where the pane states no such sentence. */
function paneSentence(id: string): PanelSentence | undefined {
  for (const entry of PANE_SENTENCES) if (entry.id === id) return entry;
  return undefined;
}

/**
 * One pane sentence, rendered from the registry and from nothing else.
 *
 * An id the registry does not carry is a defect in this module rather than a line to render — the
 * pane would otherwise print nothing where a sentence belongs — so it throws instead of rendering a
 * sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-visual-qa has no sentence registered as ${id}`);
  return entry.text;
}

/** The state sentences read off the registry, keyed by the word each answers. */
function stateTexts(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES)
    if (entry.state !== null) texts[entry.state] = entry.text;
  return texts;
}

/** The sentence each state word renders, read off `PANE_SENTENCES`. */
export const STATE_TEXTS: Readonly<Record<string, string>> = stateTexts();

/** The sentence the pane renders for a report it was not handed. */
export const NO_REPORT_TEXT = sentenceText('no-style-report');

/**
 * What the panel renders for one style report.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type StyleSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, as it arrived, or null: a blank is not a reading. */
function writtenString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): StyleSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** A report this pane was not handed: one named absence, never an empty pane. */
function noReport(): StyleSurface {
  return surface('no-style-report', [NO_REPORT_TEXT]);
}

/**
 * The lines one property row renders: the property as the report wrote it, then the two readings
 * under their own labels and in their own spelling. Nothing is compared, rounded, lower-cased or
 * matched as a prefix, so a value the browser serialised differently from the declaration reads as
 * the two different strings it is (E1, E2).
 *
 * @param row one `{ property, computed, baseline }` of the report, as the join carried it
 */
function rowLines(row: Record<string, unknown>): readonly string[] | null {
  const property = writtenString(row['property']);
  const computed = writtenString(row['computed']);
  const baseline = writtenString(row['baseline']);
  // No computed reading is no row: a property the measurement read no value for renders nothing,
  // rather than a blank, a default or the baseline acting as a stand-in (N4).
  if (property === null || computed === null) return null;
  // A row with no baseline is not rendered one-sided either: the row is the absence's business.
  if (baseline === null) return null;
  return [
    `property: ${property}`,
    `${COMPUTED_LABEL}: ${computed}`,
    `${BASELINE_LABEL}: ${baseline}`,
  ];
}

/** The rows the report carries, each as its own record, in the report's own order. */
function rowsOf(report: Record<string, unknown>): Record<string, unknown>[] {
  const listed = report['rows'];
  if (!Array.isArray(listed)) return [];
  return listed.filter(isObject);
}

/** The property names a list of properties, or a report's rows, carries in its own order. */
function propertyNames(
  properties: unknown,
  rows: readonly Record<string, unknown>[],
) {
  if (Array.isArray(properties)) {
    const named: string[] = [];
    for (const entry of properties) {
      const name = writtenString(entry);
      if (name !== null) named.push(name);
    }
    if (named.length > 0) return named;
  }
  const fromRows: string[] = [];
  for (const row of rows) {
    const name = writtenString(row['property']);
    if (name !== null) fromRows.push(name);
  }
  return fromRows;
}

/**
 * The lines the report's located document renders: its own `documentUrl` and `documentClass`, copied
 * out of the report rather than restated. A report that names no document reading renders no line
 * here, because there is nothing to name beside the absence (E4, SC2).
 *
 * @param reason the report's `reason`, as the join carried it
 */
function documentLines(reason: unknown): readonly string[] {
  if (!isObject(reason)) return [];
  const document = reason['document'];
  if (!isObject(document)) return [];
  const url = writtenString(document['documentUrl']);
  if (url === null) return [];
  const lines = [`document: ${url}`];
  const documentClass = writtenString(document['documentClass']);
  if (documentClass !== null) lines.push(`document-class: ${documentClass}`);
  return lines;
}

/** The join's own `detail` sentence, echoed unchanged, or no line where it carries none. */
function detailLines(reason: unknown): readonly string[] {
  if (!isObject(reason)) return [];
  const detail = writtenString(reason['detail']);
  return detail === null ? [] : [`detail: ${detail}`];
}

/** The `element:` line, or no line where the report names no element. */
function elementLines(report: Record<string, unknown>): readonly string[] {
  const element = writtenString(report['element']);
  return element === null ? [] : [`element: ${element}`];
}

/**
 * The style report rendered as the one panel it is.
 *
 * @param report the join's `{ state, element, rows, reason }`, or a value that is no report
 */
export function stylePanel(report?: unknown): StyleSurface {
  if (!isObject(report)) return noReport();
  const stateWord = writtenString(report['state']);
  if (stateWord === null) return noReport();

  const sentence = Object.hasOwn(STATE_TEXTS, stateWord)
    ? STATE_TEXTS[stateWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no element, no row and no reason, because the pane has no field to fill in for
  // a state nobody measured.
  if (sentence === undefined)
    return surface(stateWord, [`state: ${stateWord}`]);

  const reason = report['reason'];
  const rows = rowsOf(report);

  // `no-document`: the absence and nothing beside it. There is no document reading to name and no
  // element row to render, because nothing reached this report at all.
  if (stateWord === NO_DOCUMENT)
    return surface(NO_DOCUMENT, [
      `state: ${NO_DOCUMENT}`,
      sentence,
      ...elementLines(report),
      ...detailLines(reason),
    ]);

  // `no-such-element`: the document was reached and answers no such name, so the document the
  // reading located is named beside the absence and no property row is rendered (E4, N3).
  if (stateWord === NO_SUCH_ELEMENT)
    return surface(NO_SUCH_ELEMENT, [
      `state: ${NO_SUCH_ELEMENT}`,
      sentence,
      ...elementLines(report),
      ...documentLines(reason),
      ...detailLines(reason),
    ]);

  // `no-baseline`: the property the report names and every property it lists, then the absence's own
  // sentence and the join's detail. No row is rendered, so the computed value never stands where the
  // baseline belongs (N4).
  if (stateWord === NO_BASELINE) {
    const named = isObject(reason) ? writtenString(reason['property']) : null;
    const listed = propertyNames(
      isObject(reason) ? reason['properties'] : null,
      rows,
    );
    const properties =
      listed.length > 0 ? listed : named === null ? [] : [named];
    return surface(NO_BASELINE, [
      `state: ${NO_BASELINE}`,
      sentence,
      ...elementLines(report),
      ...documentLines(reason),
      ...(properties.length === 0
        ? []
        : [
            `property: ${named ?? properties[0]}`,
            `properties: ${properties.join(', ')}`,
          ]),
      ...detailLines(reason),
    ]);
  }

  // `measured`: one row per property, each with both readings under their own labels. A row that
  // carries a computed reading and no baseline is the baseline absence, so the report is rendered as
  // that absence rather than as a row with one side missing; a row this pane cannot print at all — no
  // property name, or no computed reading — is no row, because a value the pane never received is
  // never filled in (SC3, N3, N4).
  const rendered: string[] = [];
  const missing: string[] = [];
  for (const row of rows) {
    const lines = rowLines(row);
    if (lines !== null) {
      rendered.push(...lines);
      continue;
    }
    const property = writtenString(row['property']);
    const computed = writtenString(row['computed']);
    if (property !== null && computed !== null) missing.push(property);
  }
  if (missing.length > 0)
    return surface(NO_BASELINE, [
      `state: ${NO_BASELINE}`,
      sentenceText('state-no-baseline'),
      ...elementLines(report),
      ...documentLines(reason),
      `property: ${missing[0]}`,
      `properties: ${missing.join(', ')}`,
      ...detailLines(reason),
    ]);

  return surface(MEASURED, [
    `state: ${MEASURED}`,
    sentence,
    ...elementLines(report),
    ...rendered,
  ]);
}

export const panelVisualQa = stylePanel;
export const visualQaPanel = stylePanel;
export const visualQaSurface = stylePanel;
export default stylePanel;
