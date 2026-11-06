/**
 * The OnPush-readiness panel surface — M035 T003 (INTENT.md SC4).
 *
 * The join lives in `extension/onpush-readiness.js` (T002): it reads the strategy the component def
 * reports (`onPush`) and the inputs the caller read from `inputConfig`, and answers with one fact —
 * the component, the strategy it runs under, and the readiness facts the metadata carries — or with
 * the absence it can name instead. This module is the display half and nothing else: it is handed
 * the fact the join produced (or the fact that the read is still running, or that the fact could not
 * be read) and renders it. It reads no def, taps nothing and installs no hook: every fact in the
 * pane arrived through the argument.
 *
 * What T002 fixes: the def carries no `changeDetection` field on either shipped version, so
 * `onPush: false` is the one case a component declared `ChangeDetectionStrategy.Default` — the
 * deprecated alias of Eager — and the strategy the pane renders for it is `eager`. The one readiness
 * fact the def exposes is a signal-based input; signal outputs are not distinguishable, so none is
 * ever claimed. The pane renders the component, the strategy and those facts, and it renders nothing
 * else: no blocker, no verdict and no element (N2, N3). Nothing on the def records in-place mutation,
 * async-pipe use or a signal subscription, so "this component is not ready" would be a guess, and
 * "safe for OnPush" is not a field — the finding states the strategy and the readiness facts and
 * stops there. It reads exactly those fields off the fact it is handed and drops every other one, so
 * a fact that carries a blocker, a verdict or an element renders none of them.
 *
 * Four states, and they never blur:
 *
 *   loading      no fact has arrived: the list is empty, or the read is still running. Never an
 *                empty table: an empty list is a read on its way, and it never reads as "this
 *                component is already OnPush".
 *   finding      the component, the strategy it runs under, and one line per readiness fact — or,
 *                when the metadata carries none, the component and the strategy and the statement
 *                that no readiness fact is recorded.
 *   cannot-tell  the reason the join could name no finding — and no component, no strategy and no
 *                fact, because it has none.
 *   error        a fact that cannot be read at all: that it could not be read, and nothing else.
 *
 * A finding outranks an absence when the list holds both, because what was observed outranks what
 * could not be told — the order `extension/onpush-readiness.js` answers its own list in.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way the other
 * panel surfaces are reached, so the module loads under node's type stripping and the suite
 * (`scripts/panel-onpush.test.mjs`) executes it rather than scanning it.
 */

/** The token the `error` state carries: the fact it was handed could not be read at all. */
export const UNREADABLE_FACT = 'unreadable-fact';

/** The reason `cannot-tell` falls back to when a fact names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/**
 * What the pane says for a finding whose metadata carries no readiness fact: the absence is stated
 * in the fact line, so no caller reads an empty list out of it (AC1).
 */
export const NO_READINESS_FACTS = 'no readiness fact is recorded';

/**
 * What the panel renders for one fact list. The `finding` state carries the fields the join
 * supports — `component`, `strategy` and `facts` — and the `cannot-tell` state carries its `reason`
 * and nothing else.
 */
export type OnpushSurface =
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
      /** The strategy the def reports: `eager` for the one case the join answers on. */
      readonly strategy: string;
      /** One line per signal-based input the caller read; empty when it read none. */
      readonly facts: readonly string[];
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
  readonly strategy: string;
  readonly facts: readonly string[];
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadFact = ReadFinding | ReadCannotTell;

const LOADING_MESSAGE =
  'loading: no change-detection readiness fact has arrived yet';

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

function loading(): OnpushSurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The component,
 * the strategy and every readiness fact are copied through, and nothing else is: the fact may carry
 * a blocker, a verdict, a score and an element, and none of them reaches a line (N2, N3).
 *
 * A finding with no readiness fact states that none is recorded rather than print an empty list: an
 * empty list reads as a pane that dropped the facts, and an invented one is the guess this
 * milestone exists to prevent (AC1).
 */
function finding(
  component: string,
  strategy: string,
  facts: readonly string[],
): OnpushSurface {
  const lines = [`component: ${component}`, `strategy: ${strategy}`];
  if (facts.length === 0) lines.push(`facts: ${NO_READINESS_FACTS}`);
  for (const fact of facts) lines.push(`fact: ${fact}`);
  return {
    kind: 'finding',
    state: 'finding',
    component,
    strategy,
    facts,
    ...pane(`strategy: ${strategy}`, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no component, no strategy and no fact — the join had none to give.
 */
function cannotTell(reason: string): OnpushSurface {
  const message =
    'cannot tell: no change-detection readiness can be named from this fact';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/** A fact that cannot be read: that it could not be read, and nothing else. */
function error(): OnpushSurface {
  const message =
    'error: the change-detection readiness fact could not be read';
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
 *
 * The single fact is checked before the wrapped list here, unlike the sibling surfaces, and for this
 * surface's own reason: the join's finding carries a `facts` array of its own, so reading that first
 * would render the readiness sentences as the facts themselves instead of the fact that carries
 * them — the join's answer would fail closed to `error` rather than to the finding it states.
 */
function asFactList(facts: unknown): readonly unknown[] | null {
  if (Array.isArray(facts)) return facts;
  if (!isObject(facts)) return null;
  if (typeof facts['state'] === 'string') return [facts];
  const carried = facts['facts'];
  if (Array.isArray(carried)) return carried;
  return [];
}

/**
 * The readiness facts the join read, each one a sentence it wrote. Only strings are facts here: an
 * entry that is not a string is dropped rather than stringified, so an object smuggling a blocker or
 * a verdict into the list never reaches a line (N2, N3).
 */
function asReadinessFacts(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) return [];
  const facts: string[] = [];
  for (const entry of raw) {
    const fact = nonEmptyString(entry);
    if (fact !== null) facts.push(fact);
  }
  return facts;
}

/**
 * One fact, read for the fields this surface renders and no others. A finding that cannot state its
 * component and its strategy is not a finding: the pane says the fact could not be read rather than
 * render half of one.
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = raw['state'];

  if (state === 'finding') {
    const component = nonEmptyString(raw['component']);
    const strategy = nonEmptyString(raw['strategy']);
    if (component === null || strategy === null) return null;
    return {
      state: 'finding',
      component,
      strategy,
      facts: asReadinessFacts(raw['facts']),
    };
  }

  if (state === 'cannot-tell') {
    const reason = nonEmptyString(raw['reason']);
    return { state: 'cannot-tell', reason: reason ?? UNKNOWN_REASON };
  }

  return null;
}

/**
 * The fact list rendered as the one state it is in.
 *
 * @param facts the fact the join produced, a list of them, or the marker that the read is running
 */
export function onpushPanel(facts?: unknown): OnpushSurface {
  if (isLoading(facts)) return loading();

  const list = asFactList(facts);

  // Nothing was handed over at all: there is no fact to render, and saying so is the error state.
  if (list === null) return error();

  // An empty list is a read on its way, never a table that reads as "already OnPush" (AC1).
  if (list.length === 0) return loading();

  const read = list.map(asFact);

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact !== null && fact.state === 'finding') {
      return finding(fact.component, fact.strategy, fact.facts);
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

export const panelOnpush = onpushPanel;
export const onpushSurface = onpushPanel;
export default onpushPanel;
