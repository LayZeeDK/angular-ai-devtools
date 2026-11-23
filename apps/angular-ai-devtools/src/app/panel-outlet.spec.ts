import { describe, expect, it } from 'vitest';
import {
  CANNOT_TELL,
  FIELDS,
  LABELS,
  OUTLET_ABSENT,
  OUTLET_MATCHED,
  OUTLET_UNNAMED_PRIMARY,
  STATES,
  outletPanel,
} from './panel-outlet';

/**
 * The pane's own pins — M062 T003 (INTENT.md SC4).
 *
 * The pane renders the join's answer and nothing else: the state, the three name fields the answer
 * carries and one line per absence it carries. These cases hold it to that, and each one carries a
 * mutant applied in memory to a copy of the shipped source or of a rendered pane, so a pin that had
 * gone blind reddens here instead of passing quietly. The four states are the words
 * `extension/outlet-answer.js` answers with; `scripts/panel-copy.test.mjs` holds the pane's field and
 * label tables to that join and to the route, loader key and sample fact the tree carries, and this
 * file holds the renderer to the tables.
 */

/** The vite `import.meta.glob` surface this spec uses, cast rather than declared globally. */
interface GlobSurface {
  glob(
    pattern: string,
    options: { query: '?raw'; import: 'default'; eager: true },
  ): Record<string, unknown>;
}

/**
 * This module's own committed text, inlined by the builder: the scans below read the code the pane
 * ships rather than a paraphrase of it, and the browser tsconfig this app is checked with carries no
 * `node:fs`, so the file arrives the way `panel-demo.spec.ts` reads its recordings.
 */
const SOURCE = (() => {
  const modules = (import.meta as unknown as GlobSurface).glob(
    './panel-outlet.ts',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error('./panel-outlet.ts was not inlined above this spec file');
  }
  return text;
})();

/** One absence the record states, as the join copies it into the answer. */
interface OutletAbsence {
  readonly field: string;
  readonly path: string | null;
  readonly reason: string | null;
}

/** One answer in the shape the join answers with: five fields, and no sixth. */
interface OutletAnswer {
  readonly state: string;
  readonly requested: string | null;
  readonly matched: string | null;
  readonly path: string | null;
  readonly absences: readonly OutletAbsence[];
}

/** The answer for a route whose request and matched name are the same outlet, with its path. */
const MATCHED: OutletAnswer = {
  state: 'outlet-matched',
  requested: 'sidebar',
  matched: 'sidebar',
  path: 'shell',
  absences: [],
};

/** The answer for a route that stated no outlet: the request is reported as `primary`. */
const UNNAMED_PRIMARY: OutletAnswer = {
  state: 'outlet-unnamed-primary',
  requested: 'primary',
  matched: 'primary',
  path: '',
  absences: [{ field: 'requested', path: '', reason: 'outlet-not-requested' }],
};

/** The answer for a route whose request is absent from the outlet the state matched. */
const ABSENT: OutletAnswer = {
  state: 'outlet-absent',
  requested: 'sidebar',
  matched: 'primary',
  path: 'shell',
  absences: [{ field: 'matched', path: 'shell', reason: 'outlet-name-absent' }],
};

/** The answer for a route the state matched for no name, whose path and absence it still carries. */
const UNMATCHED: OutletAnswer = {
  state: 'cannot-tell',
  requested: 'sidebar',
  matched: null,
  path: 'shell',
  absences: [{ field: 'matched', path: 'shell', reason: 'outlet-name-absent' }],
};

/** The sample the demo renders: the two absences the join kept of the three the record stated. */
const SAMPLE: OutletAnswer = {
  state: 'outlet-matched',
  requested: 'sidebar',
  matched: 'sidebar',
  path: null,
  absences: [
    { field: 'path', path: null, reason: 'path-absent' },
    { field: 'route', path: null, reason: 'chain-truncated' },
  ],
};

/** The answers the pane is written for, each under its own name. */
const ANSWERS: Record<string, OutletAnswer> = {
  'a route whose request and matched name are the same outlet': MATCHED,
  'a route that stated no outlet': UNNAMED_PRIMARY,
  'a route whose request is absent from the matched outlet': ABSENT,
  'a route the state matched for no name': UNMATCHED,
  'the sample the demo renders': SAMPLE,
};

/** The seven labels the pane renders under, as one alternation the line shape is built from. */
const LINE_SHAPE = new RegExp(`^(${Object.values(LABELS).join('|')}): (.*)$`);

/** One file's code with its comments removed: doc comments are prose and render nothing. */
function codeOf(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** The string literals one source writes, comments stripped. */
function literalsOf(source: string): string[] {
  const code = codeOf(source);
  const quoted = [...code.matchAll(/(['"])([^'"\n]*)\1/g)].map(
    (match) => match[2] ?? '',
  );
  const templates = [...code.matchAll(/`([^`\n]*)`/g)].map(
    (match) => match[1] ?? '',
  );
  return [...quoted, ...templates].filter((text) => text !== '');
}

/** What one literal is: a label prefixes a value, a word is one token, a sentence is prose. */
function kindOf(text: string): 'label' | 'word' | 'sentence' {
  const colon = text.indexOf(':');
  if (colon < 0) return /\s/.test(text) ? 'sentence' : 'word';
  const tail = text
    .slice(colon + 1)
    .replace(/\$\{[^}]*\}/g, '')
    .trim();
  return tail === '' ? 'label' : 'sentence';
}

/** The reaches a display half must not have: a page read, a module import, a requirer. */
const FORBIDDEN = [
  /\bnavigator\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\binnerText\b/,
  /\btextContent\b/,
  /\bquerySelector(All)?\b/,
  /\binspectedWindow\b/,
  /^\s*import\s/m,
  /\bimport\s*\(/,
  /\brequire\s*\(/,
];

/** The pin: the pane's code writes no sentence-shaped literal. */
function pinNoSentence(source: string): void {
  const sentences = literalsOf(source).filter(
    (text) => kindOf(text) === 'sentence',
  );
  if (sentences.length > 0)
    throw new Error(
      `the pane writes no sentence-shaped literal; it carries ${JSON.stringify(sentences)}`,
    );
}

/** The pin: the pane's code reaches for no page and no module. */
function pinNoPageRead(source: string): void {
  const code = codeOf(source);
  for (const pattern of FORBIDDEN)
    if (pattern.test(code))
      throw new Error(`the pane contains no page read: ${String(pattern)}`);
}

/** The pin: every line a pane writes is one of its own labels and a value beside it. */
function pinEveryLineIsALabel(lines: readonly string[]): void {
  for (const line of lines) {
    const match = LINE_SHAPE.exec(line);
    if (match === null)
      throw new Error(
        `every line is a label the pane enumerates and a value beside it; it rendered "${line}"`,
      );
    if ((match[2] ?? '').trim().length === 0)
      throw new Error(
        `a label with no value behind it is a blank line; it rendered "${line}"`,
      );
  }
}

/** The failure a pin raises on a mutant, or a failure naming the pin that let it through. */
function reddens(pin: () => void, defect: string): Error {
  try {
    pin();
  } catch (error) {
    if (error instanceof Error) return error;
    throw error;
  }
  throw new Error(
    `"${defect}" passed its pin on the mutant, so the mutation is not caught`,
  );
}

describe('the outlet surface', () => {
  it('renders the state and the three name fields the answer carries (SC4)', () => {
    const pane = outletPanel(ABSENT);
    expect(pane.state).toBe(OUTLET_ABSENT);
    expect(pane.kind).toBe(OUTLET_ABSENT);
    expect(pane.message).toBe(`state: ${OUTLET_ABSENT}`);
    expect(pane.text).toBe(pane.lines.join('\n'));
    expect(pane.lines).toEqual([
      `state: ${OUTLET_ABSENT}`,
      `${LABELS.requested}: sidebar`,
      `${LABELS.matched}: primary`,
      `${LABELS.path}: shell`,
      `${LABELS.absence}: matched`,
      `${LABELS.absencePath}: shell`,
      `${LABELS.reason}: outlet-name-absent`,
    ]);

    // Every line is one of the pane's own labels and a value the answer carries: a line the join did
    // not produce has no label to sit under and nowhere to come from.
    pinEveryLineIsALabel(pane.lines);
    const values = [
      ABSENT.state,
      ABSENT.requested,
      ABSENT.matched,
      ABSENT.path,
      ...ABSENT.absences.flatMap((absence) => [
        absence.field,
        absence.path,
        absence.reason,
      ]),
    ];
    for (const line of pane.lines) {
      const value = LINE_SHAPE.exec(line)?.[2] ?? '';
      expect(values).toContain(value);
    }
  });

  it('renders one line per absence in the answer’s own order, and no line for a null half', () => {
    const pane = outletPanel(SAMPLE);
    expect(pane.lines).toEqual([
      `state: ${OUTLET_MATCHED}`,
      `${LABELS.requested}: sidebar`,
      `${LABELS.matched}: sidebar`,
      `${LABELS.absence}: path`,
      `${LABELS.reason}: path-absent`,
      `${LABELS.absence}: route`,
      `${LABELS.reason}: chain-truncated`,
    ]);
    // The path the answer carries is null, so no path line is written at all — never a blank.
    expect(pane.lines.some((line) => line.startsWith(`${LABELS.path}: `))).toBe(
      false,
    );
    // One absence line per absence, neither folded into the other and neither dropped.
    expect(
      pane.lines.filter((line) => line.startsWith(`${LABELS.absence}: `)),
    ).toHaveLength(SAMPLE.absences.length);
  });

  it('renders no line for a field the answer carries as null, and every line it writes says something', () => {
    const pane = outletPanel(UNMATCHED);
    expect(pane.state).toBe(CANNOT_TELL);
    expect(
      pane.lines.some((line) => line.startsWith(`${LABELS.matched}: `)),
    ).toBe(false);
    expect(pane.lines).toEqual([
      `state: ${CANNOT_TELL}`,
      `${LABELS.requested}: sidebar`,
      `${LABELS.path}: shell`,
      `${LABELS.absence}: matched`,
      `${LABELS.absencePath}: shell`,
      `${LABELS.reason}: outlet-name-absent`,
    ]);
    pinEveryLineIsALabel(pane.lines);
  });

  it('renders an empty path as its own value, because the empty path is a route’s path', () => {
    const pane = outletPanel(UNNAMED_PRIMARY);
    expect(pane.state).toBe(OUTLET_UNNAMED_PRIMARY);
    expect(pane.lines).toEqual([
      `state: ${OUTLET_UNNAMED_PRIMARY}`,
      `${LABELS.requested}: primary`,
      `${LABELS.matched}: primary`,
      `${LABELS.path}: ""`,
      `${LABELS.absence}: requested`,
      `${LABELS.absencePath}: ""`,
      `${LABELS.reason}: outlet-not-requested`,
    ]);
  });

  it('renders nothing a seventh field carries, and no remedy, cause or schematic', () => {
    const smuggled = {
      ...ABSENT,
      remedy: 'declare the outlet in the route configuration',
      cause: 'the router fell back to primary',
      should: 'fix the route',
      selector: 'router-outlet[name=sidebar]',
    };
    const pane = outletPanel(smuggled);
    expect(pane.lines).toEqual(outletPanel(ABSENT).lines);
    for (const word of ['remedy', 'cause', 'should', 'fix', 'schematic'])
      expect(new RegExp(`\\b${word}\\b`, 'i').test(pane.text)).toBe(false);
  });

  it('names its own state as its kind in every state, and answers a value that is no answer', () => {
    for (const [what, answer] of Object.entries(ANSWERS)) {
      const pane = outletPanel(answer);
      expect(pane.state, what).toBe(answer.state);
      expect(pane.kind, what).toBe(answer.state);
      expect(pane.lines[0], what).toBe(`state: ${answer.state}`);
      expect(pane.text, what).toBe(pane.lines.join('\n'));
    }
    expect(outletPanel(undefined).lines).toEqual([`state: no-answer`]);
    expect(outletPanel(null).lines).toEqual([`state: no-answer`]);
    expect(outletPanel([]).lines).toEqual([`state: no-answer`]);
    // A state word nobody wrote is rendered as the bare word it was given and nothing else.
    expect(outletPanel({ state: 'outlet-guessed' }).lines).toEqual([
      `state: outlet-guessed`,
    ]);
  });

  it('writes no sentence, reads no page and imports nothing at runtime', () => {
    expect(literalsOf(SOURCE).length).toBeGreaterThan(0);
    pinNoSentence(SOURCE);
    pinNoPageRead(SOURCE);
    expect(
      literalsOf(SOURCE).filter((text) => kindOf(text) !== 'sentence').length,
    ).toBeGreaterThan(0);
  });

  it('the vocabulary is the join’s five fields and its four states, in the contract’s order', () => {
    expect([...FIELDS]).toEqual([
      'state',
      'requested',
      'matched',
      'path',
      'absences',
    ]);
    expect([...STATES]).toEqual([
      'outlet-matched',
      'outlet-unnamed-primary',
      'outlet-absent',
      'cannot-tell',
    ]);
    expect(Object.values(LABELS)).toEqual([
      'state',
      'requested',
      'matched',
      'path',
      'absence',
      'absencePath',
      'reason',
    ]);
  });
});

describe('the outlet surface mutants', () => {
  it('a remedy added to the pane reddens the no-sentence pin, naming the sentence it wrote', () => {
    const remedy = 'declare the sidebar outlet, or the router will use primary';
    const mutated = SOURCE.replace(
      'export const OUTLET_MATCHED =',
      `const PANE_REMEDY = '${remedy}';\nexport const OUTLET_MATCHED =`,
    );
    expect(mutated).not.toBe(SOURCE);
    const failure = reddens(
      () => pinNoSentence(mutated),
      'a remedy sentence the join did not produce',
    );
    expect(failure.message).toContain(remedy);
  });

  it('a page read added to the pane reddens the purity pin, naming the read', () => {
    const mutated = SOURCE.replace(
      'export const OUTLET_MATCHED =',
      'const PANE_LANGUAGE = navigator.language;\nexport const OUTLET_MATCHED =',
    );
    expect(mutated).not.toBe(SOURCE);
    const failure = reddens(
      () => pinNoPageRead(mutated),
      'a page read the pane must never make',
    );
    expect(failure.message).toContain('navigator');
  });

  it('a seventh label added to a pane reddens the label pin, naming the line it printed', () => {
    const smuggledLine = `${'remedy'}: declare the outlet`;
    const failure = reddens(
      () => pinEveryLineIsALabel([...outletPanel(ABSENT).lines, smuggledLine]),
      'a label the answer does not carry',
    );
    expect(failure.message).toContain(smuggledLine);
  });

  it('a label with nothing behind it reddens the same pin, naming the blank line', () => {
    const blank = `${LABELS.absence}: `;
    const failure = reddens(
      () => pinEveryLineIsALabel([blank]),
      'a label with no value behind it',
    );
    expect(failure.message).toContain(blank.trim());
  });
});
