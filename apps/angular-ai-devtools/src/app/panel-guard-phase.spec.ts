import { describe, expect, it } from 'vitest';
import {
  CANNOT_TELL,
  FIELDS,
  GUARD_ALLOWED,
  GUARD_CANCELLED,
  GUARD_PHASE_ONLY,
  LABELS,
  STATES,
  guardPhasePanel,
} from './panel-guard-phase';

/**
 * The pane's own pins — M063 T003 (INTENT.md SC4).
 *
 * The pane renders the join's answer and nothing else: the state, the three row fields the answer
 * carries and one line per absence it carries. These cases hold it to that, and each one carries a
 * mutant applied in memory to a copy of the shipped source or of a rendered pane, so a pin that had
 * gone blind reddens here instead of passing quietly. The four states are the words
 * `extension/guard-answer.js` answers with; `scripts/panel-copy.test.mjs` holds the pane's field and
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
    './panel-guard-phase.ts',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      './panel-guard-phase.ts was not inlined above this spec file',
    );
  }
  return text;
})();

/** One absence the record states, as the join copies it into the answer. */
interface GuardAbsence {
  readonly field: string;
  readonly path: string | null;
  readonly reason: string | null;
}

/** One answer in the shape the join answers with: five fields, and no sixth. */
interface GuardAnswer {
  readonly state: string;
  readonly phase: string | null;
  readonly guard: string | null;
  readonly verdict: string | null;
  readonly absences: readonly GuardAbsence[];
}

/** The answer for the first refusal the record states, with the phase, the guard and the verdict. */
const CANCELLED: GuardAnswer = {
  state: 'guard-cancelled',
  phase: 'canActivate',
  guard: 'authGuard',
  verdict: 'refused',
  absences: [{ field: 'path', path: null, reason: 'path-not-recorded' }],
};

/** The answer for a refusal that names its phase and no guard: phase-only, never a route. */
const PHASE_ONLY: GuardAnswer = {
  state: 'guard-phase-only',
  phase: 'canActivate',
  guard: null,
  verdict: 'refused',
  absences: [{ field: 'guard', path: 'claims', reason: 'guard-not-recorded' }],
};

/** The answer for a navigation every row allowed and the answered row names its guard. */
const ALLOWED: GuardAnswer = {
  state: 'guard-allowed',
  phase: 'canActivate',
  guard: 'authGuard',
  verdict: 'allowed',
  absences: [],
};

/** The answer for a record that carries no readable row: the record's own absence stands. */
const UNREADABLE: GuardAnswer = {
  state: 'cannot-tell',
  phase: null,
  guard: null,
  verdict: null,
  absences: [
    { field: 'guard', path: null, reason: 'guard-verdict-not-recorded' },
  ],
};

/** The sample the demo renders: the reducer's record, and the join's answer over it. */
const SAMPLE: GuardAnswer = {
  state: 'guard-phase-only',
  phase: 'canActivate',
  guard: null,
  verdict: 'refused',
  absences: [{ field: 'guard', path: 'claims', reason: 'guard-not-recorded' }],
};

/** The answers the pane is written for, each under its own name. */
const ANSWERS: Record<string, GuardAnswer> = {
  'the first refusal the record states': CANCELLED,
  'a refusal that names its phase and no guard': PHASE_ONLY,
  'a navigation every row allowed': ALLOWED,
  'a record that carries no readable row': UNREADABLE,
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

describe('the guard-phase surface', () => {
  it('renders the state and the three row fields the answer carries (SC4)', () => {
    const pane = guardPhasePanel(CANCELLED);
    expect(pane.state).toBe(GUARD_CANCELLED);
    expect(pane.kind).toBe(GUARD_CANCELLED);
    expect(pane.message).toBe(`state: ${GUARD_CANCELLED}`);
    expect(pane.text).toBe(pane.lines.join('\n'));
    expect(pane.lines).toEqual([
      `state: ${GUARD_CANCELLED}`,
      `${LABELS.phase}: canActivate`,
      `${LABELS.guard}: authGuard`,
      `${LABELS.verdict}: refused`,
      `${LABELS.absence}: path`,
      `${LABELS.reason}: path-not-recorded`,
    ]);

    // Every line is one of the pane's own labels and a value the answer carries: a line the join did
    // not produce has no label to sit under and nowhere to come from.
    pinEveryLineIsALabel(pane.lines);
    const values = [
      CANCELLED.state,
      CANCELLED.phase,
      CANCELLED.guard,
      CANCELLED.verdict,
      ...CANCELLED.absences.flatMap((absence) => [
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

  it('renders no line for a guard the answer carries as null, and keeps the phase and the verdict apart', () => {
    const pane = guardPhasePanel(PHASE_ONLY);
    expect(pane.state).toBe(GUARD_PHASE_ONLY);
    // The `canMatch` state C2 names: the phase is recorded and the guard is not, so no guard line is
    // written at all — and no name is borrowed from the neighbouring row or from the matched route.
    expect(pane.lines).toEqual([
      `state: ${GUARD_PHASE_ONLY}`,
      `${LABELS.phase}: canActivate`,
      `${LABELS.verdict}: refused`,
      `${LABELS.absence}: guard`,
      `${LABELS.absencePath}: claims`,
      `${LABELS.reason}: guard-not-recorded`,
    ]);
    expect(
      pane.lines.some((line) => line.startsWith(`${LABELS.guard}: `)),
    ).toBe(false);
    pinEveryLineIsALabel(pane.lines);
  });

  it('renders the allowed row with no absence line, and never a refusal that did not happen', () => {
    const pane = guardPhasePanel(ALLOWED);
    expect(pane.state).toBe(GUARD_ALLOWED);
    expect(pane.lines).toEqual([
      `state: ${GUARD_ALLOWED}`,
      `${LABELS.phase}: canActivate`,
      `${LABELS.guard}: authGuard`,
      `${LABELS.verdict}: allowed`,
    ]);
    expect(
      pane.lines.filter((line) => line.startsWith(`${LABELS.absence}: `)),
    ).toHaveLength(ALLOWED.absences.length);
  });

  it('renders the record’s own absence where the answer carries no field, and no state it invented', () => {
    const pane = guardPhasePanel(UNREADABLE);
    expect(pane.state).toBe(CANNOT_TELL);
    expect(pane.lines).toEqual([
      `state: ${CANNOT_TELL}`,
      `${LABELS.absence}: guard`,
      `${LABELS.reason}: guard-verdict-not-recorded`,
    ]);
    // The three row fields are null in this answer, so no line of theirs is written: a blank line or
    // a default word in their place would be a claim the record never made.
    for (const label of [LABELS.phase, LABELS.guard, LABELS.verdict])
      expect(pane.lines.some((line) => line.startsWith(`${label}: `))).toBe(
        false,
      );
    pinEveryLineIsALabel(pane.lines);
  });

  it('renders one line per absence in the answer’s own order, and no line for a null half', () => {
    const two: GuardAnswer = {
      ...CANCELLED,
      absences: [
        { field: 'path', path: null, reason: 'path-not-recorded' },
        { field: 'verdict', path: 'claims', reason: 'verdict-not-recorded' },
      ],
    };
    const pane = guardPhasePanel(two);
    expect(pane.lines).toEqual([
      `state: ${GUARD_CANCELLED}`,
      `${LABELS.phase}: canActivate`,
      `${LABELS.guard}: authGuard`,
      `${LABELS.verdict}: refused`,
      `${LABELS.absence}: path`,
      `${LABELS.reason}: path-not-recorded`,
      `${LABELS.absence}: verdict`,
      `${LABELS.absencePath}: claims`,
      `${LABELS.reason}: verdict-not-recorded`,
    ]);
    // One absence line per absence, neither folded into the other and neither dropped.
    expect(
      pane.lines.filter((line) => line.startsWith(`${LABELS.absence}: `)),
    ).toHaveLength(two.absences.length);
  });

  it('renders nothing a sixth field carries, and no remedy, cause or schematic', () => {
    const smuggled = {
      ...CANCELLED,
      remedy: 'declare the guard in the route configuration',
      cause: 'the router cancelled on this guard',
      should: 'fix the route',
      selector: 'router-outlet[name=primary]',
    };
    const pane = guardPhasePanel(smuggled);
    expect(pane.lines).toEqual(guardPhasePanel(CANCELLED).lines);
    for (const word of ['remedy', 'cause', 'should', 'fix', 'schematic'])
      expect(new RegExp(`\\b${word}\\b`, 'i').test(pane.text)).toBe(false);
  });

  it('names its own state as its kind in every state, and answers a value that is no answer', () => {
    for (const [what, answer] of Object.entries(ANSWERS)) {
      const pane = guardPhasePanel(answer);
      expect(pane.state, what).toBe(answer.state);
      expect(pane.kind, what).toBe(answer.state);
      expect(pane.lines[0], what).toBe(`state: ${answer.state}`);
      expect(pane.text, what).toBe(pane.lines.join('\n'));
    }
    expect(guardPhasePanel(undefined).lines).toEqual([`state: no-answer`]);
    expect(guardPhasePanel(null).lines).toEqual([`state: no-answer`]);
    expect(guardPhasePanel([]).lines).toEqual([`state: no-answer`]);
    // A state word nobody wrote is rendered as the bare word it was given and nothing else.
    expect(guardPhasePanel({ state: 'guard-guessed' }).lines).toEqual([
      `state: guard-guessed`,
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
      'phase',
      'guard',
      'verdict',
      'absences',
    ]);
    expect([...STATES]).toEqual([
      'guard-cancelled',
      'guard-phase-only',
      'guard-allowed',
      'cannot-tell',
    ]);
    expect(Object.values(LABELS)).toEqual([
      'state',
      'phase',
      'guard',
      'verdict',
      'absence',
      'absencePath',
      'reason',
    ]);
  });
});

describe('the guard-phase surface mutants', () => {
  it('a remedy added to the pane reddens the no-sentence pin, naming the sentence it wrote', () => {
    const remedy =
      'declare the guard, or the router will cancel the navigation';
    const mutated = SOURCE.replace(
      'export const GUARD_CANCELLED =',
      `const PANE_REMEDY = '${remedy}';\nexport const GUARD_CANCELLED =`,
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
      'export const GUARD_CANCELLED =',
      'const PANE_LANGUAGE = navigator.language;\nexport const GUARD_CANCELLED =',
    );
    expect(mutated).not.toBe(SOURCE);
    const failure = reddens(
      () => pinNoPageRead(mutated),
      'a page read the pane must never make',
    );
    expect(failure.message).toContain('navigator');
  });

  it('a seventh label added to a pane reddens the label pin, naming the line it printed', () => {
    const smuggledLine = `${'remedy'}: declare the guard`;
    const failure = reddens(
      () =>
        pinEveryLineIsALabel([
          ...guardPhasePanel(CANCELLED).lines,
          smuggledLine,
        ]),
      'a label the answer does not carry',
    );
    expect(failure.message).toContain(smuggledLine);
  });

  it('a label with nothing behind it reddens the same pin, naming the blank line', () => {
    const blank = `${LABELS.guard}: `;
    const failure = reddens(
      () => pinEveryLineIsALabel([blank]),
      'a label with no value behind it',
    );
    expect(failure.message).toContain(blank.trim());
  });
});
