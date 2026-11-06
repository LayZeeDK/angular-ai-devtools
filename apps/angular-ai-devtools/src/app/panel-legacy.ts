/**
 * The legacy-structure panel surface — M034 T003 (INTENT.md SC4).
 *
 * The join lives in `extension/legacy-structure.js` (T002): it reads the metadata the caller
 * already captured about the selected component — its name and the `ɵcmp.standalone` flag — and
 * the cited table `research/raw/m034-equivalents.json`, and answers with one fact: the component,
 * the structure the flag names, and the modern form the table sources for that structure, with the
 * URL that answers for it — or with the absence it can name instead. This module is the display
 * half and nothing else: it is handed the fact the join produced (or the fact that the read is
 * still running, or that the fact could not be read) and renders it. It reads no page, taps
 * nothing and installs no hook: every fact in the pane arrived through the argument.
 *
 * T001 measured that Angular's legacy-construct diagnostic never reaches the page console
 * (`research/raw/m034-legacy-diagnostic.json`, `reachedThePageConsole: false`), so this pane never
 * claims to have read that message. What it renders is the structure the metadata states and the
 * form the cited table states, and it renders nothing else: no remedy, no severity, no owner and no
 * element (N2, N3). It reads exactly those fields off the fact it is handed and drops every other
 * one, so a fact that carries a fix, a deprecation verdict or an element renders none of them.
 *
 * The modern form is the table's, never this pane's. A finding that carries no sourced form — the
 * join's own `no-sourced-equivalent` is the other way to say it — renders the component and the
 * structure and states that no form is recorded. It never renders an empty form and never fills one
 * in: an unsourced form is the failure this milestone exists to prevent (AC2, AC6).
 *
 * Four states, and they never blur:
 *
 *   loading      no fact has arrived: the list is empty, or the read is still running. Never an
 *                empty table: an empty list is a read on its way, and it never reads as "this
 *                component is modern".
 *   finding      the component, the structure, and the modern form with the source that answers for
 *                it — or, when no sourced form exists, the component and the structure and the
 *                statement that none is recorded.
 *   cannot-tell  the reason the join could name no structure — and no component, no structure, no
 *                form and no source, because it has none.
 *   error        a fact that cannot be read at all: that it could not be read, and nothing else.
 *
 * A finding outranks an absence when the list holds both, because what was observed outranks what
 * could not be told — the order `extension/legacy-structure.js` answers its own list in.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way the other
 * panel surfaces are reached, so the module loads under node's type stripping and the suite
 * (`scripts/panel-legacy.test.mjs`) executes it rather than scanning it.
 */

/** The token the `error` state carries: the fact it was handed could not be read at all. */
export const UNREADABLE_FACT = 'unreadable-fact';

/** The reason `cannot-tell` falls back to when a fact names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/**
 * What the pane says for a finding whose modern form is not sourced: the absence is stated in the
 * form's own line, so no caller reads an empty form out of it (AC2).
 */
export const NO_SOURCED_FORM = 'no modern form is recorded for this structure';

/**
 * What the panel renders for one fact list. The `finding` state carries the fields the join
 * supports — `component`, `structure`, and the `modernForm` with its `source` (both null when the
 * table sources none) — and the `cannot-tell` state carries its `reason` and nothing else.
 */
export type LegacySurface =
  | {
      readonly kind: 'loading';
      readonly state: 'loading';
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
    }
  | {
      readonly kind: 'finding';
      readonly state: 'finding';
      /** The component's own name as the caller read it — never a selector, a path or an element. */
      readonly component: string;
      /** The structure the metadata states: `NgModule-declared`, from the join's own constant. */
      readonly structure: string;
      /** The form the cited table states, or null when it sources none for this structure. */
      readonly modernForm: string | null;
      /** The URL the form came from, or null when there is no form to answer for. */
      readonly source: string | null;
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
    }
  | {
      readonly kind: 'cannot-tell';
      readonly state: 'cannot-tell';
      readonly reason: string;
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
    }
  | {
      readonly kind: 'error';
      readonly state: 'error';
      readonly reason: string;
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
    };

/** The fields a readable fact may carry: one finding, or one absence with its reason. */
type ReadFinding = {
  readonly state: 'finding';
  readonly component: string;
  readonly structure: string;
  readonly modernForm: string | null;
  readonly source: string | null;
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadFact = ReadFinding | ReadCannotTell;

const LOADING_MESSAGE = 'loading: no legacy structure fact has arrived yet';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** A string that says something, or null: prose is trimmed, whitespace states nothing. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function pane(
  message: string,
  lines: readonly string[],
): {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
} {
  return { message, lines, text: lines.join('\n') };
}

function loading(): LegacySurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The component
 * and the structure are copied through, and so is the form the table sources with the URL it came
 * from; nothing else is: the fact may carry a remedy, a severity, an owner and an element, and none
 * of them reaches a line (N2, N3).
 *
 * A form without its source is not a sourced form, so the two travel together: when either is
 * missing the pane states that no form is recorded rather than print half of one (AC2).
 */
function finding(
  component: string,
  structure: string,
  modernForm: string | null,
  source: string | null,
): LegacySurface {
  const lines = [`component: ${component}`, `structure: ${structure}`];
  if (modernForm === null || source === null) {
    lines.push(`modernForm: ${NO_SOURCED_FORM}`);
    return {
      kind: 'finding',
      state: 'finding',
      component,
      structure,
      modernForm: null,
      source: null,
      ...pane(NO_SOURCED_FORM, lines),
    };
  }
  lines.push(`modernForm: ${modernForm}`, `source: ${source}`);
  return {
    kind: 'finding',
    state: 'finding',
    component,
    structure,
    modernForm,
    source,
    ...pane(modernForm, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no component, no structure, no form and no source — the join had none to give.
 */
function cannotTell(reason: string): LegacySurface {
  const message =
    'cannot tell: no legacy structure can be named from this fact';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/** A fact that cannot be read: that it could not be read, and nothing else. */
function error(): LegacySurface {
  const message = 'error: the legacy structure fact could not be read';
  return {
    kind: 'error',
    state: 'error',
    reason: UNREADABLE_FACT,
    ...pane(message, [message]),
  };
}

function isLoading(facts: unknown): boolean {
  return (
    isObject(facts) &&
    (facts['loading'] === true ||
      facts['assembling'] === true ||
      facts['state'] === 'loading')
  );
}

/**
 * The fact list the caller handed over, or null when there is none to render. A bare array is a
 * list, `{ facts: [...] }` is a list, and one fact on its own is a list of one; anything else that
 * is not an object is nothing this surface may render.
 */
function asFactList(facts: unknown): readonly unknown[] | null {
  if (Array.isArray(facts)) return facts;
  if (!isObject(facts)) return null;
  const carried = facts['facts'];
  if (Array.isArray(carried)) return carried;
  if (typeof facts['state'] === 'string') return [facts];
  return [];
}

/**
 * One fact, read for the fields this surface renders and no others. A finding that cannot state its
 * component and its structure is not a finding: the pane says the fact could not be read rather
 * than render half of one.
 *
 * The form and its source are read only when the fact does not deny that it was sourced: a fact
 * carrying `equivalentSourced: false` has no sourced form whatever else it carries, and the pane
 * says so instead of printing the form (AC2).
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = raw['state'];

  if (state === 'finding') {
    const component = nonEmptyString(raw['component']);
    const structure = nonEmptyString(raw['structure']);
    if (component === null || structure === null) return null;

    const sourced = raw['equivalentSourced'] !== false;
    const modernForm = sourced ? nonEmptyString(raw['modernForm']) : null;
    const source = sourced ? nonEmptyString(raw['source']) : null;
    if (modernForm === null || source === null) {
      return {
        state: 'finding',
        component,
        structure,
        modernForm: null,
        source: null,
      };
    }
    return { state: 'finding', component, structure, modernForm, source };
  }

  if (state === 'cannot-tell') {
    const reason = nonEmptyString(raw['reason']);
    return {
      state: 'cannot-tell',
      reason: reason ?? UNKNOWN_REASON,
    };
  }

  return null;
}

/**
 * The fact list rendered as the one state it is in.
 *
 * @param facts the fact the join produced, a list of them, or the marker that the read is running
 */
export function legacyPanel(facts?: unknown): LegacySurface {
  if (isLoading(facts)) return loading();

  const list = asFactList(facts);

  // Nothing was handed over at all: there is no fact to render, and saying so is the error state.
  if (list === null) return error();

  // An empty list is a read on its way, never a table that reads as "this component is modern".
  if (list.length === 0) return loading();

  const read = list.map(asFact);

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact !== null && fact.state === 'finding') {
      return finding(
        fact.component,
        fact.structure,
        fact.modernForm,
        fact.source,
      );
    }
  }

  for (const fact of read) {
    if (fact !== null && fact.state === 'cannot-tell') {
      return cannotTell(fact.reason);
    }
  }

  // Facts were handed over and none of them could be read: that is the state, and nothing else.
  return error();
}

export const panelLegacy = legacyPanel;
export const legacySurface = legacyPanel;
export default legacyPanel;
