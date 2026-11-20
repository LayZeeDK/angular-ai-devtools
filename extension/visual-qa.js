// visual-qa.js — the join that turns one style measurement into the record a panel surface
// renders: a row per property the measurement read, each carrying the element's computed value and
// the baseline stylesheet's declared value under its own side label — or one of three named
// absences.
//
// M054 T002. The measurement belongs to T001's recording
// (research/raw/m054-style-read.json), which this module neither re-derives nor edits:
//
//   - The property list is the recording's (Q2: "six: padding, borderTopWidth, backgroundColor,
//     color, fontSize, fontFamily"; `properties[].name`). PLAN C2 makes that list the
//     measurement's to declare, so this join accepts exactly those six and refuses anything else
//     rather than folding a seventh into the neighbour it resembles.
//   - The values are each side's own. Nothing here compares, rounds or re-spells: the sheet
//     declares `border-top: 2px` and the element computes `1.71429px` at devicePixelRatio 1.75
//     (L4), and both strings are what a row carries (E2). A declared value is never written into
//     the computed column and a computed value is never written into the baseline column (N2).
//   - A property the sheet declares nothing for is an absence, not the value the browser supplies
//     anyway: the root element reads `padding 0px`, `font-size 16px` and `font-family "Times New
//     Roman"` where no baseline rule names it (L7), and none of those is a baseline reading (N4).
//
// What this join may and may not do, stated exactly:
//
//   - It reads the measurement it is handed and nothing else: no DOM, no `getComputedStyle`, no
//     `document.styleSheets`, no message, no network, no clock, no file and no import. The
//     measurement is the panel's own record of what it read, not page data, so the fields are read
//     directly rather than through the guards a page-facing reader needs.
//   - It never writes to its input, and it invents no row, no property name, no value and no
//     baseline. A property the measurement read no value for renders no row at all — not a blank,
//     not a default, not a placeholder (N4).
//   - The same measurement answers the same record twice: a run that measured nothing renders no
//     row on the second run either (E5).
//
// The four states are a closed vocabulary:
//
//   measured         one row per property the measurement read, in the order it read them. Each row
//                    is `{ property, computed, baseline }` and nothing else: the property named as
//                    the measurement wrote it (E1) and the two readings under their own side labels.
//                    `reason` is null.
//   no-such-element  the document the reading reached rendered no element under the requested name.
//                    `reason.document` is the reading that located the document — its own
//                    `documentUrl` and `documentClass`, copied rather than restated — so the absence
//                    is named beside a document that was reached (E4). No row is rendered.
//   no-document      no document the panel could read reached this join. Nothing is named beside
//                    it, because there is no document reading to name, and no row is rendered.
//   no-baseline      the stylesheet declares nothing for a property the measurement did read.
//                    `reason.property` names the first such property and `reason.properties` names
//                    every one of them, in the order the measurement read them. No row is rendered.
//
// `no-baseline` is per STATE, not per row, and that is this module's ruling rather than a detail of
// the change: SC2 makes "no baseline to compare against" a state of the element, and a report that
// rendered the rows it could beside a row it could not invites a surface to print the element's own
// value where the baseline belongs (N4). The cost is stated too: the properties that did have a
// baseline are not rendered beside that absence, and a caller that wants them asks again with a
// measurement that read only those.
(function () {
  'use strict';

  /** The four states, exactly. Nothing else is ever answered. */
  const MEASURED = 'measured';
  const NO_SUCH_ELEMENT = 'no-such-element';
  const NO_DOCUMENT = 'no-document';
  const NO_BASELINE = 'no-baseline';

  /**
   * The six properties the recording declares, in the order it declares them (`properties[].name`,
   * Q2's answer). A property outside this list is refused by name rather than carried: a row for it
   * would name a property no recording declares (PLAN C2).
   */
  const PROPERTIES = Object.freeze([
    'padding',
    'borderTopWidth',
    'backgroundColor',
    'color',
    'fontSize',
    'fontFamily',
  ]);

  /** The three fields a measurement writes a reading under, spelled as it spells them. */
  const PROPERTY = 'property';
  const COMPUTED = 'computed';
  const BASELINE = 'baseline';

  /**
   * Whether a value is a record this join can read fields from.
   * @param {unknown} value
   * @returns {boolean}
   */
  function isRecord(value) {
    return value !== null && typeof value === 'object';
  }

  /**
   * A string the measurement wrote, or null where it wrote none. An empty string is not a reading:
   * `getComputedStyle` serialises a value or the field is absent, and a blank is neither.
   * @param {unknown} value
   * @returns {null | string}
   */
  function written(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  /**
   * The element, quoted for a sentence, or the phrase that stands where no name was written.
   * @param {null | string} element
   * @returns {string}
   */
  function named(element) {
    return element === null ? 'the requested name' : `"${element}"`;
  }

  /**
   * The document reading the measurement carries: where the reading ran, named by its own URL.
   *
   * A measurement with no such reading is the no-document absence — including a measurement this
   * join was not handed at all — because there is no document reading to name and this join will not
   * invent one. A document that was reached and rendered nothing is a different fact, answered by
   * `no-such-element` with this reading named beside it (E4).
   * @param {any} measurement
   * @returns {null | { documentUrl: string, documentClass: null | string }}
   */
  function locatedDocument(measurement) {
    if (!isRecord(measurement)) return null;
    const reading = measurement.document;
    if (!isRecord(reading)) return null;
    const documentUrl = written(reading.documentUrl);
    if (documentUrl === null) return null;
    return {
      documentUrl: documentUrl,
      documentClass: written(reading.documentClass),
    };
  }

  /**
   * The no-document absence: a record naming no document, no row, and nothing beside the absence.
   * @param {null | string} element
   * @returns {{ state: string, element: null | string, rows: any[], reason: any }}
   */
  function refuseDocument(element) {
    return {
      state: NO_DOCUMENT,
      element,
      rows: [],
      reason: {
        code: NO_DOCUMENT,
        element,
        document: null,
        detail:
          'no document the panel could read reached this join, so there is no element to ' +
          'report on and no reading to name beside the absence',
      },
    };
  }

  /**
   * The no-such-element absence: the document was reached and renders no element under the
   * requested name. The reading that located the document is carried beside the absence, so a
   * surface states which document was read and which name it did not answer — and this state is
   * never a document that was not reached (E4).
   * @param {null | string} element
   * @param {{ documentUrl: string, documentClass: null | string }} located
   * @returns {{ state: string, element: null | string, rows: any[], reason: any }}
   */
  function refuseElement(element, located) {
    return {
      state: NO_SUCH_ELEMENT,
      element,
      rows: [],
      reason: {
        code: NO_SUCH_ELEMENT,
        element,
        document: located,
        detail:
          `the reading located ${located.documentUrl}, and that document ` +
          `rendered no element under ${named(element)}`,
      },
    };
  }

  /**
   * The no-baseline absence: the sheet declares nothing for at least one property the measurement
   * did read. `properties` holds every one of them, in the order the measurement read them, and
   * `property` is the first — the one a single-line surface prints. No row is rendered: a baseline
   * this join does not have is never replaced by the computed value standing beside it (N4).
   * @param {null | string} element
   * @param {{ documentUrl: string, documentClass: null | string }} located
   * @param {string[]} properties
   * @returns {{ state: string, element: null | string, rows: any[], reason: any }}
   */
  function refuseBaseline(element, located, properties) {
    const property = properties[0];
    return {
      state: NO_BASELINE,
      element,
      rows: [],
      reason: {
        code: NO_BASELINE,
        element,
        document: located,
        property,
        properties,
        detail:
          'the baseline stylesheet declares no value for ' +
          `${properties.length === 1 ? property : properties.join(', ')}, so no ` +
          'baseline reading stands beside the element’s own',
      },
    };
  }

  /**
   * One row, from one reading the measurement wrote.
   *
   * A property outside the recording's six is refused by name, with the six in the message, rather
   * than folded, trimmed, lower-cased or prefix-matched into one of them (E1, PLAN C2). A reading
   * the measurement read no computed value for is no row at all — `null` here, never a row whose
   * value was inferred from the baseline or from the browser's default (N4).
   * @param {unknown} reading one entry of the measurement's `readings`.
   * @param {number} index where it sat, so a refusal names it.
   * @returns {null | { property: string, computed: string, baseline: null | string }}
   */
  function rowOf(reading, index) {
    if (!isRecord(reading)) {
      throw new TypeError(
        `the reading at ${index} is not a record this join can read: ` +
          'a reading is the measurement’s own { property, computed, baseline }',
      );
    }
    const property = reading[PROPERTY];
    if (typeof property !== 'string' || property === '') {
      throw new TypeError(
        `the reading at ${index} names no property: a row names the property the ` +
          'measurement read it under, as the measurement wrote it',
      );
    }
    if (!PROPERTIES.includes(property)) {
      throw new TypeError(
        `"${property}" is not a property this join accepts: the measurement ` +
          `declares ${PROPERTIES.join(', ')}, and a property outside that list is ` +
          'refused rather than folded into one of them',
      );
    }
    const computed = written(reading[COMPUTED]);
    const baseline = written(reading[BASELINE]);
    if (computed === null) return null;
    return { property, computed, baseline };
  }

  /**
   * The join: one measurement in, one record a surface can render out.
   *
   * @param {any} measurement what the measurement answered: the document reading it located
   *   (`{ documentUrl, documentClass }`, or null where it could read no document), the element name
   *   it asked for, whether that document rendered one (`found`), and the per-property readings it
   *   took (`readings`), each `{ property, computed, baseline }`.
   * @returns {{ state: string, element: null | string, rows: any[], reason: any }} the state, the
   *   element as the measurement named it, the rows the state renders, and the absence it names.
   */
  function styleReport(measurement) {
    const element = isRecord(measurement) ? written(measurement.element) : null;
    const located = locatedDocument(measurement);

    // The document first: without a document reading there is no element to name an absence about,
    // and no document is named beside this absence.
    if (located === null) return refuseDocument(element);

    // Then the element, which the measurement's own `found` decides. A measurement that did not say
    // it found one found none to report: an element nobody read is not an element measured as
    // unchanged (SC2, N3).
    if (measurement.found !== true) return refuseElement(element, located);

    // Then the readings, in the order the measurement took them. `readings` absent is a measurement
    // that read no property, which renders no row — not one placeholder row.
    const listed =
      measurement.readings === undefined ? [] : measurement.readings;
    if (!Array.isArray(listed)) {
      throw new TypeError(
        'the measurement readings must be a list of readings: styleReport was ' +
          'handed something else, which is a caller error rather than a reading',
      );
    }
    const rows = [];
    const missing = [];
    for (let index = 0; index < listed.length; index += 1) {
      const row = rowOf(listed[index], index);
      if (row === null) continue;
      rows.push(row);
      if (row.baseline === null) missing.push(row.property);
    }

    // A measured property with no baseline is the no-baseline state, rather than a row with one
    // side blank: an absence never renders as a row of matching readings (N3, N4).
    if (missing.length > 0) return refuseBaseline(element, located, missing);

    return { state: MEASURED, element, rows, reason: null };
  }

  const namespace = { styleReport };
  if (globalThis.angularAiVisualQa) {
    // Second run in the same world: republish in place, so an object identity a caller already holds
    // stays valid, and never throw.
    Object.assign(globalThis.angularAiVisualQa, namespace);
  } else {
    globalThis.angularAiVisualQa = namespace;
  }
})();
