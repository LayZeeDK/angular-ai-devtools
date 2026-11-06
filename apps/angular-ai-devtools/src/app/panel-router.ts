/**
 * The router-finding panel surface — M033 T003 (SC4).
 *
 * The join lives in `extension/router-diagnostic.js` (T002): it reads the captured console
 * messages and the configured routes the caller already holds and answers with one fact — the
 * unmatched segment the message named, the code it carried, the message body, and how many
 * configured routes were considered — or with the absence it can name instead. This module is
 * the display half and nothing else: it is handed the fact list that join produced (or the fact
 * that the read is still running, or that the fact could not be read) and renders it. It reads no
 * console, taps nothing and installs no hook: every fact in the pane arrived through the argument.
 *
 * A `finding` means the segment the console named matched NONE of the configured routes; it carries
 * the segment, the code (which `extension/error-digest.json` does NOT carry), the message body and
 * `consideredCount`. The message states none of them, and naming one is the defect this milestone
 * exists to prevent: the pane renders no element, no component, no guard verdict, no resolver
 * outcome, no redirect decision, no cause and no remedy. It reads exactly the fields the join
 * names and drops every other one.
 *
 * A `cannot-tell` carries only a reason. The pane renders that reason and no segment-level claim
 * about why the navigation failed: it carries no segment, no code and no message.
 *
 * Four states, and they never blur:
 *
 *   loading      no fact has arrived: the list is empty, or the read is still running. Never an
 *                empty table: an empty list is a read on its way, and it never reads as "no route
 *                is at fault".
 *   finding      the unmatched segment, the code, the message body, and the count considered.
 *   cannot-tell  the reason the join could not tell — and no segment-level claim.
 *   error        a fact that cannot be read at all: that it could not be read, and nothing else.
 *
 * A finding outranks an absence when the list holds both.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way the
 * other panel surfaces are reached, so the module loads under node's type stripping and the suite
 * (`scripts/panel-router.test.mjs`) executes it rather than scanning it.
 */

/** The token the `error` state carries: the fact it was handed could not be read at all. */
export const UNREADABLE_FACT = 'unreadable-fact';

/** The reason `cannot-tell` falls back to when a fact names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/**
 * What the panel renders for one fact list. The `finding` state carries the fields the join
 * supports — `segment`, `code`, `message`, `consideredCount` — and the `cannot-tell` state carries
 * its `reason` and no segment-level claim at all.
 */
export type RouterSurface =
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
      /** The unmatched segment the console named — never a component, element or route owner. */
      readonly segment: string;
      /** The NG code the body carried (the digest does not carry it). */
      readonly code: string;
      /** The message body only: no stack frame. */
      readonly message: string;
      /** How many configured routes were compared. */
      readonly consideredCount: number;
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

type ReadFinding = {
  readonly state: 'finding';
  readonly segment: string;
  readonly code: string;
  readonly body: string;
  readonly consideredCount: number;
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadFact = ReadFinding | ReadCannotTell;

/** A stack frame as V8 prints it: a newline, indentation, and `at `. */
const STACK_FRAME = /\n\s+at\s/;

const LOADING_MESSAGE = 'loading: no router diagnostic fact has arrived yet';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * The message body: everything before the first stack frame, trimmed. The join drops the stack
 * already (T002); the surface drops it again rather than trust one caller.
 */
function bodyOf(text: string): string {
  const frame = text.search(STACK_FRAME);
  return (frame === -1 ? text : text.slice(0, frame)).trim();
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

function loading(): RouterSurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The fields
 * are copied through and nothing else is: the fact may carry an element, a component, a guard
 * verdict, a resolver outcome, a redirect decision, a cause and a remedy, and none of them reaches
 * a line.
 */
function finding(
  segment: string,
  code: string,
  body: string,
  consideredCount: number,
): RouterSurface {
  const lines = [
    `segment: ${segment}`,
    `code: ${code}`,
    `message: ${body}`,
    `considered: ${consideredCount}`,
  ];
  return {
    kind: 'finding',
    state: 'finding',
    segment,
    code,
    consideredCount,
    ...pane(body, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no segment-level claim about why the navigation failed.
 */
function cannotTell(reason: string): RouterSurface {
  const message = 'cannot tell: no router finding can be named';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/** A fact that cannot be read: that it could not be read, and nothing else. */
function error(): RouterSurface {
  const message = 'error: the router diagnostic fact could not be read';
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
 * One fact, read for the fields this surface renders and no others. A finding that cannot state
 * its segment, its code, its body and its consideredCount is not a finding: the pane says the fact
 * could not be read rather than render half of one.
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = raw['state'];

  if (state === 'finding') {
    const segment = raw['segment'];
    const code = raw['code'];
    const text = raw['message'];
    const consideredCount = raw['consideredCount'];
    const namedSegment = typeof segment === 'string' ? segment : '';
    const namedCode = typeof code === 'string' ? code : '';
    const body = typeof text === 'string' ? bodyOf(text) : '';
    const count =
      typeof consideredCount === 'number' && Number.isFinite(consideredCount)
        ? consideredCount
        : NaN;
    if (
      namedSegment === '' ||
      namedCode === '' ||
      body === '' ||
      !Number.isFinite(count)
    ) {
      return null;
    }
    return {
      state: 'finding',
      segment: namedSegment,
      code: namedCode,
      body,
      consideredCount: count,
    };
  }

  if (state === 'cannot-tell') {
    const reason = raw['reason'];
    return {
      state: 'cannot-tell',
      reason:
        typeof reason === 'string' && reason.length > 0
          ? reason
          : UNKNOWN_REASON,
    };
  }

  return null;
}

/**
 * The fact list rendered as the one state it is in.
 *
 * @param facts the fact the join produced, a list of them, or the marker that the read is running
 */
export function routerPanel(facts?: unknown): RouterSurface {
  if (isLoading(facts)) return loading();

  const list = asFactList(facts);

  // Nothing was handed over at all: there is no fact to render, and saying so is the error state.
  if (list === null) return error();

  // An empty list is a read on its way, never a table that reads as "no route is at fault".
  if (list.length === 0) return loading();

  const read = list.map(asFact);

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact !== null && fact.state === 'finding') {
      return finding(fact.segment, fact.code, fact.body, fact.consideredCount);
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

export const panelRouter = routerPanel;
export const routerSurface = routerPanel;
export default routerPanel;
