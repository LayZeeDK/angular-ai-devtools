/**
 * The linked-state panel surface — M038 T003 (INTENT.md SC4).
 *
 * The join lives in `extension/linked-state.js` (T002,
 * `globalThis.angularAiLinkedState`): it reads the signal graph the caller recorded and the label
 * of the linked signal to report, and answers with one fact — the linked signal, the source it
 * follows, both stored values and the agreement those values show — or with the absence it can
 * name instead. This module is the display half and nothing else: it is handed the fact the join
 * produced (or the state that says nothing has arrived yet) and renders it. It reads no graph,
 * taps nothing and installs no hook: every fact in the pane arrived through the argument.
 *
 * The one word this surface exists for is `reason`. The join fixes `state` to `finding` or
 * `cannot-tell`, so a finding carries the agreement itself in `reason`: `matching` when the two
 * stored values are equal and `differing` when they are not. This pane reads that word and prints
 * it. It never compares `value` with `sourceValue` itself, because that comparison is the join's
 * and re-deriving it here is how the two halves would drift apart; and it never reads the
 * recording's precomputed `agreesWithItsSource`, which `research/raw/m038-linked-state.json`
 * carries on each subject beside the two values the graph reports. Two facts holding the same two
 * values and different `reason` words therefore render two different panes, which is exactly the
 * distinction this milestone is for.
 *
 * What the pane may not add: the graph records values, labels and edges, so a write, an owner and a
 * cause are absent from every fact it is handed (the join's own N1, N2 and N4). The pane reads
 * exactly `signal`, `source`, `value`, `sourceValue` and `reason` off a finding and drops every
 * other field, so a fact that carries a cause, an owner, a write flag, an element or a precomputed
 * agreement renders none of them.
 *
 * Four states, and they never blur:
 *
 *   idle         no fact has arrived: nothing was handed over, the list is empty, or the read is
 *                still running. Never a blank pane and never an agreement: the absence of a fact
 *                states nothing about the two values.
 *   matching     the linked signal, the source it follows, both stored values, and the join's own
 *                `matching` word — the fact says the two values agree.
 *   differing    the same fields and the join's own `differing` word. Never derived here: a fact
 *                whose two values are equal but whose reason says `differing` renders `differing`.
 *   cannot-tell  the reason the join could name no finding — and no signal, no source and no
 *                value, because it has none.
 *
 * A state this pane was not written for is still rendered, as the state it was given. The reasons a
 * finding may carry are **not enumerated here**: whatever word arrives is the pane's state and is
 * printed, so a later join that names a third agreement renders under its own name instead of being
 * dropped or relabelled. A fact whose `state` is neither `finding` nor `cannot-tell` — and a
 * finding too thin to render its five fields — renders that state's own line and nothing else.
 * There is no branch here that returns nothing for a state it does not recognise.
 *
 * A finding outranks an absence when the list holds both, because what was observed outranks what
 * could not be told; and a state this pane was not written for yields to both, because it is the one
 * answer that states nothing about the two values.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way the other
 * panel surfaces are reached, so the module loads under node's type stripping and the suite
 * (`scripts/panel-linked-state.test.mjs`) executes it rather than scanning it.
 */

/** The state the pane is in before any fact has arrived, and the word it renders for it. */
export const IDLE_STATE = 'idle';

/** The reason a `cannot-tell` fact falls back to when the fact names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/** A stored value: what the join's own `scalarOf` keeps — and never `null`, its marker for none. */
export type StoredValue = number | string | boolean;

/** The text one pane renders: one message, its lines, and the two joined. */
type Pane = {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

/**
 * What the panel renders for one fact list.
 *
 * The `finding` state carries the five fields the join supports — `signal`, `source`, `value`,
 * `sourceValue` and the `reason` word, which is also the state the pane reports, so `matching` and
 * `differing` are two states rather than one state with a field. Its `state` is `string` on
 * purpose: the join owns the vocabulary and this pane does not narrow it.
 *
 * The `cannot-tell` state carries its `reason` and nothing else, so no caller reads a signal out of
 * an absence. The last arm is the pass-through for a word this pane was not written for: it carries
 * that word and nothing else.
 *
 * `kind` is the state a pane renders, word for word, in every arm — the way the other panel
 * surfaces name their own states — so `matching`, `differing`, `cannot-tell`, `idle` and any word
 * the pane was not written for are each their own kind and never one kind with a field.
 */
export type LinkedStateSurface =
  | ({
      readonly kind: 'idle';
      readonly state: 'idle';
    } & Pane)
  | ({
      /**
       * The agreement word the join carried, printed as the pane's own state — `matching` or
       * `differing` today, and whatever word a later join names. It is `string` on purpose: this
       * pane does not enumerate the vocabulary, so a state it was not written for is rendered
       * under its own name rather than dropped or relabelled.
       */
      readonly kind: string;
      /** The same word, the state this pane reports for the finding it was handed. */
      readonly state: string;
      /** The linked signal's label as the graph gives it — never a value, an index or a guess. */
      readonly signal: string;
      /** The label of the source the linked signal follows. */
      readonly source: string;
      /** The linked signal's stored value, exactly as the join reported it. */
      readonly value: StoredValue;
      /** The source's stored value, exactly as the join reported it. */
      readonly sourceValue: StoredValue;
      /** The join's own agreement word, carried beside the state it names. */
      readonly reason: string;
    } & Pane)
  | ({
      readonly kind: 'cannot-tell';
      readonly state: 'cannot-tell';
      readonly reason: string;
    } & Pane)
  | ({
      /** The state the fact named, rendered as it was given — never folded into another one. */
      readonly kind: string;
      readonly state: string;
    } & Pane);

/** The fields a readable fact may carry: one finding, one absence, or one state as given. */
type ReadFinding = {
  readonly state: 'finding';
  readonly signal: string;
  readonly source: string;
  readonly value: StoredValue;
  readonly sourceValue: StoredValue;
  readonly reason: string;
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadGiven = {
  readonly state: 'given';
  readonly given: string;
};

type ReadFact = ReadFinding | ReadCannotTell | ReadGiven;

const IDLE_MESSAGE = 'idle: no linked-state fact has arrived yet';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** A string that says something, or null: prose is trimmed, whitespace states nothing. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * The stored value the fact reports, or null when it reports none.
 *
 * `0`, `false` and `''` are values and are kept as they are; only a value that is not a scalar at
 * all — or the `null` the join uses as its own marker for "no readable value" — is an absence. The
 * comparison is `=== null` and never a falsy test, so a stored `0` is not read as missing.
 */
function scalarOf(value: unknown): StoredValue | null {
  if (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return null;
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

/** Nothing has arrived: the pane says so, and says nothing about the two values. */
function idle(): LinkedStateSurface {
  return {
    kind: 'idle',
    state: IDLE_STATE,
    ...pane(IDLE_MESSAGE, [IDLE_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The five
 * fields the join supports are copied through verbatim and in that order, and nothing else is: the
 * fact may carry a cause, an owner, a write flag, an element and a precomputed agreement, and none
 * of them reaches a line.
 *
 * The message is the agreement word itself, never a sentence about it: a fact whose values are
 * equal but whose reason says `differing` must render `differing` without this pane contradicting
 * either half of what it was handed.
 */
function finding(
  signal: string,
  source: string,
  value: StoredValue,
  sourceValue: StoredValue,
  reason: string,
): LinkedStateSurface {
  const lines = [
    `signal: ${signal}`,
    `source: ${source}`,
    `value: ${value}`,
    `sourceValue: ${sourceValue}`,
    `reason: ${reason}`,
  ];
  return {
    kind: reason,
    state: reason,
    signal,
    source,
    value,
    sourceValue,
    reason,
    ...pane(reason, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no signal, no source and no value — the join had none to give.
 */
function cannotTell(reason: string): LinkedStateSurface {
  const message = 'cannot tell: no linked state can be named from this fact';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/**
 * A state this pane was not written for, rendered as the state it was given. The pane prints the
 * word and nothing else: it has no field of its own to fill in, and borrowing another state's
 * fields is the guess this branch exists to refuse.
 */
function givenState(state: string): LinkedStateSurface {
  const message = `state: ${state}`;
  return { kind: state, state, ...pane(message, [message]) };
}

function isRunning(facts: unknown): boolean {
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
 * One fact, read for the fields this surface renders and no others.
 *
 * A finding is rendered only when all five of its fields are readable. One that is too thin to
 * render — no label, no source, no agreement word, or a value that is not a scalar — is not a
 * finding this pane may complete, so it falls through to the state pass-through and renders the
 * `finding` word it was given with no borrowed fields. It is never filled in from the other half of
 * a finding, and never silently dropped.
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = nonEmptyString(raw['state']);
  if (state === null) return null;

  // The read is running: there is no fact yet, which is the state the pane starts in.
  if (state === 'loading') return null;

  if (state === 'finding') {
    const signal = nonEmptyString(raw['signal']);
    const source = nonEmptyString(raw['source']);
    const reason = nonEmptyString(raw['reason']);
    const value = scalarOf(raw['value']);
    const sourceValue = scalarOf(raw['sourceValue']);
    if (
      signal === null ||
      source === null ||
      reason === null ||
      value === null ||
      sourceValue === null
    ) {
      return { state: 'given', given: state };
    }
    return { state: 'finding', signal, source, value, sourceValue, reason };
  }

  if (state === 'cannot-tell') {
    return {
      state: 'cannot-tell',
      reason: nonEmptyString(raw['reason']) ?? UNKNOWN_REASON,
    };
  }

  // Any other word is a state this pane was not written for. It is rendered, never dropped.
  return { state: 'given', given: state };
}

/**
 * The fact list rendered as the one state it is in.
 *
 * @param facts the fact the join produced, a list of them, or the marker that the read is running
 */
export function linkedStatePanel(facts?: unknown): LinkedStateSurface {
  if (isRunning(facts)) return idle();

  const list = asFactList(facts);

  // Nothing was handed over at all: no fact has arrived, and saying so is the idle state.
  if (list === null) return idle();

  const read: ReadFact[] = [];
  for (const raw of list) {
    const fact = asFact(raw);
    if (fact !== null) read.push(fact);
  }

  // An empty list is a read on its way, never a pane that states the two values agree.
  if (read.length === 0) return idle();

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact.state === 'finding') {
      return finding(
        fact.signal,
        fact.source,
        fact.value,
        fact.sourceValue,
        fact.reason,
      );
    }
  }

  for (const fact of read) {
    if (fact.state === 'cannot-tell') return cannotTell(fact.reason);
  }

  // Facts arrived and every one of them named a state this pane was not written for: the first is
  // rendered as it was given, because dropping it is the defect this branch prevents.
  for (const fact of read) {
    if (fact.state === 'given') return givenState(fact.given);
  }

  // Unreachable: every readable fact is one of the three shapes above.
  return idle();
}

export const panelLinkedState = linkedStatePanel;
export const linkedStateSurface = linkedStatePanel;
export default linkedStatePanel;
