/**
 * The resource-lifecycle panel surface — M036 T003 (INTENT.md SC5; prohibitions N1, N2, N4, N5).
 *
 * The join lives in `extension/resource-lifecycle.js` (T002,
 * `globalThis.angularAiResourceLifecycle`): it reads the identity the signal graph labels a
 * resource by, the `status` value the caller read, the params status and whether the label read
 * itself succeeded, and answers with one fact — the resource, the status it reports and the params
 * status that produced it — or with the absence it can name instead. This module is the display
 * half and nothing else: it is handed the fact the join produced (or the fact that the read is
 * still running, or that the fact could not be read) and renders it. It reads no graph, taps
 * nothing and installs no hook: every fact in the pane arrived through the argument.
 *
 * What T002 fixes and this pane may not undo: the loader's own promise is not among the labelled
 * fields (`research/raw/m036-resource-graph.json` records `.extRequest`, `.isLoading`,
 * `.loadEffect`, `.state`, `.status`, `.value` and, for some subjects, `.stream` and `.error`), so
 * "the loader never resolves", a network explanation and a stuck request are all absent from what
 * the pane is handed (N1, N3, N4). A verdict — wait, fix an error, look at your params — is not a
 * field either (N5). The pane renders the four fields the contract names and nothing else: the
 * resource, the status, the params status and, for an absence, the reason. It reads exactly those
 * fields off the fact it is handed and drops every other one, so a fact that carries a cause, a
 * loader name, a network explanation or a verdict renders none of them.
 *
 * The one distinction this surface exists for: a resource whose params produced nothing is idle by
 * design, while a resource whose loader has not answered is still loading (N2). The pane makes that
 * distinction by rendering the `status` and the `params` the join wrote, character for character —
 * `status: idle` beside `params: idle (by design)` — and never by writing a sentence of its own
 * about why. Naming the second when the first is true is exactly the wrong answer this milestone
 * prevents, and the pane is not entitled to decide which is true.
 *
 * The status strings are **not enumerated here**. The join reports the values the state machine
 * reports — `idle`, `loading`, `reloading`, `resolved`, `error` and `local` — and a pane carrying
 * its own copy of the vocabulary would refuse a real status or render it under a friendlier name.
 * Whatever string the finding carries is what this pane prints; the resource is named as the graph
 * named it, never by a friendlier name, and `error` is `error`, not `errored`.
 *
 * The identity is printed as it arrived, spaces included: `createDebugNameObject` sanitises nothing
 * (`@angular/core` `fesm2022/_resource-chunk.mjs:514-518`), so a `debugName` of `Order Items`
 * reaches this pane as `Resource#Order Items` and is printed unchanged. This pane trims only the
 * whitespace around a whole value, never a space inside one, so a name with a space in it is
 * rendered as it was labelled.
 *
 * The reasons are not enumerated here for the same reason: the join names five of them —
 * `no-resource`, `labels-unreadable`, `params-unavailable`, `status-unavailable` and
 * `resource-unnamed` — and each is printed as it arrived. A reason this pane has never heard of is
 * rendered too, never replaced, because the join owns the vocabulary.
 *
 * Four states, and they never blur:
 *
 *   loading      no fact has arrived: the list is empty, or the read is still running. Never an
 *                empty table and never an idle-by-design pane: an empty list is a read on its way,
 *                and it never reads as "this resource was never asked to start".
 *   finding      the resource identity, the status the graph reports and the params status beside
 *                it — which is also how idle-by-design reads differently from still loading.
 *   cannot-tell  the reason the join could name no finding — and no resource, no status and no
 *                params, because it has none.
 *   error        a fact that cannot be read at all: that it could not be read, and nothing else.
 *
 * A finding outranks an absence when the list holds both, because what was observed outranks what
 * could not be told — the order `extension/resource-lifecycle.js` answers its own list in.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way the other
 * panel surfaces are reached, so the module loads under node's type stripping and the suite
 * (`scripts/panel-resource.test.mjs`, E5) executes it rather than scanning it.
 */

/** The token the `error` state carries: the fact it was handed could not be read at all. */
export const UNREADABLE_FACT = 'unreadable-fact';

/** The reason `cannot-tell` falls back to when a fact names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/**
 * What the panel renders for one fact list. The `finding` state carries the three fields the join
 * supports — `resource`, `status` and `params`, each echoed verbatim — and the `cannot-tell` state
 * carries its `reason` and nothing else, so no caller reads a resource out of an absence.
 */
export type ResourceSurface =
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
      /**
       * The resource identity as the graph labels it — `Resource#<name>` — never a friendlier name,
       * a loader name or a cause.
       */
      readonly resource: string;
      /** The status the graph reports, echoed as it was reported: `loading`, never `still loading`. */
      readonly status: string;
      /** The params status that produced it, or the join's own `idle (by design)` sentence. */
      readonly params: string;
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
  readonly resource: string;
  readonly status: string;
  readonly params: string;
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadFact = ReadFinding | ReadCannotTell;

const LOADING_MESSAGE = 'loading: no resource fact has arrived yet';

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

function loading(): ResourceSurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The resource,
 * the status and the params are copied through verbatim, and nothing else is: the fact may carry a
 * cause, a loader name, a network explanation and a verdict, and none of them reaches a line (N1,
 * N3, N4, N5).
 *
 * The three values are printed as they arrived and in that order, so an idle-by-design finding
 * (`status: idle`, `params: idle (by design)`) is visibly not a loading one without this pane
 * writing a single sentence about why either is true (N2).
 */
function finding(
  resource: string,
  status: string,
  params: string,
): ResourceSurface {
  const lines = [
    `resource: ${resource}`,
    `status: ${status}`,
    `params: ${params}`,
  ];
  return {
    kind: 'finding',
    state: 'finding',
    resource,
    status,
    params,
    ...pane(`status: ${status}`, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no resource, no status and no params — the join had none to give (N5).
 */
function cannotTell(reason: string): ResourceSurface {
  const message = 'cannot tell: no resource state can be named from this fact';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/** A fact that cannot be read: that it could not be read, and nothing else. */
function error(): ResourceSurface {
  const message = 'error: the resource fact could not be read';
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
 * resource, its status and its params is not a finding: the pane says the fact could not be read
 * rather than render half of one, because a resource with no status is the guess this pane exists
 * to refuse.
 *
 * Nothing here checks a status against a list. The join owns the vocabulary and a later task widens
 * it; this pane's job is to print what it was handed.
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = raw['state'];

  if (state === 'finding') {
    const resource = nonEmptyString(raw['resource']);
    const status = nonEmptyString(raw['status']);
    const params = nonEmptyString(raw['params']);
    if (resource === null || status === null || params === null) return null;
    return { state: 'finding', resource, status, params };
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
export function resourcePanel(facts?: unknown): ResourceSurface {
  if (isLoading(facts)) return loading();

  const list = asFactList(facts);

  // Nothing was handed over at all: there is no fact to render, and saying so is the error state.
  if (list === null) return error();

  // An empty list is a read on its way, never a pane that reads as "never asked to start".
  if (list.length === 0) return loading();

  const read = list.map(asFact);

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact !== null && fact.state === 'finding') {
      return finding(fact.resource, fact.status, fact.params);
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

export const panelResource = resourcePanel;
export const resourceSurface = resourcePanel;
export default resourcePanel;
