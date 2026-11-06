/**
 * The lint-finding panel surface — M032 T003 (INTENT.md SC4; prohibitions N1, N2, N3, N4).
 *
 * The join itself lives in `extension/lint-core.js` (T002,
 * `globalThis.angularAiLintCore`): it takes the console messages the agent already captured and
 * the codes the digest carries, and answers with one fact — the construct the message's own body
 * names, the code it carries and the body — or with the absence it can name instead. This module
 * is the display half and nothing else: it is handed the fact list that join produced (or the fact
 * that the read is still running, or that the fact could not be read) and renders it. It reads no
 * console, taps nothing and installs no hook (N1): every fact in the pane arrived through the
 * argument.
 *
 * What the measurement fixes (T001, `research/raw/m032-console-diagnostics.json`): the diagnostic
 * names an INPUT and never an element or a component. The component's name appears only in a stack
 * frame, and a frame is not part of the message body. So this surface renders the construct, the
 * code, the message body and the reason, and it renders nothing else: no element, no selector, no
 * component name, no cause and no fix (N2, N3). It reads exactly those fields off the fact it is
 * handed and drops every other one, and it drops a stack frame from a message body it is handed
 * rather than trust one caller — a component is named nowhere else, so a pane that repeated a frame
 * would repeat a component.
 *
 * Four states, and they never blur (N4):
 *
 *   loading      no fact has arrived: the list is empty, or the read is still running. Never an
 *                empty table: an empty list is a read on its way, and it never reads as a page
 *                where nothing was wrong.
 *   finding      the construct the body names, the code it carries, and the body itself.
 *   cannot-tell  the reason the join could name no construct — and no construct, no code and no
 *                message, because it has none. The absence is named, and nothing else.
 *   error        a fact that cannot be read at all: that it could not be read, and nothing else.
 *
 * A finding outranks an absence when the list holds both, because what was observed outranks what
 * could not be told — the order `extension/lint-core.js` answers its own list in.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `panel-fields.ts` and `panel-redirect.ts` are reached, so the module loads under node's type
 * stripping and the suite (`scripts/panel-lint.test.mjs`, E4) executes it rather than scanning it.
 */

/** The token the `error` state carries: the fact it was handed could not be read at all. */
export const UNREADABLE_FACT = 'unreadable-fact';

/** The reason `cannot-tell` falls back to: the join's own token for a body that names no input. */
export const NO_CONSTRUCT_NAMED = 'message-names-no-construct';

/**
 * What the panel renders for one fact list. The `finding` state carries the three fields the
 * measured message supports — `construct`, `code`, `message` — and the `cannot-tell` state carries
 * its `reason` and no construct at all, so no caller reads a construct out of an absence.
 */
export type LintSurface =
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
      /** The input name the message body states — never an element, a selector or a component. */
      readonly construct: string;
      /** The NG code the body carries. */
      readonly code: string;
      /** The message body only: no stack frame, because a frame is where a component is named. */
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

/** The three fields a readable fact may carry: one finding, or one absence with its reason. */
type ReadFinding = {
  readonly state: 'finding';
  readonly construct: string;
  readonly code: string;
  readonly body: string;
};

type ReadCannotTell = {
  readonly state: 'cannot-tell';
  readonly reason: string;
};

type ReadFact = ReadFinding | ReadCannotTell;

/** A stack frame as V8 prints it: a newline, indentation, and `at `. */
const STACK_FRAME = /\n\s+at\s/;

const LOADING_MESSAGE = 'loading: no diagnostic fact has arrived yet';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * The message body: everything before the first stack frame, trimmed. The join drops the stack
 * already (T002); the surface drops it again rather than trust one caller, because a frame is the
 * only place a component is named and this pane may never render one (N2, N3).
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

function loading(): LintSurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. The three
 * fields are copied through and nothing else is: the fact may carry an element, a selector, a
 * component, a cause and a fix, and none of them reaches a line (N2, N3).
 */
function finding(construct: string, code: string, body: string): LintSurface {
  const lines = [
    `construct: ${construct}`,
    `code: ${code}`,
    `message: ${body}`,
  ];
  return {
    kind: 'finding',
    state: 'finding',
    construct,
    code,
    ...pane(body, lines),
  };
}

/**
 * The absence, written in one place so every way of reaching it says the same thing: the reason,
 * and no construct, no code and no message — the join had none to give (N2).
 */
function cannotTell(reason: string): LintSurface {
  const message = 'cannot tell: no construct can be named from this message';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason,
    ...pane(message, [message, `reason: ${reason}`]),
  };
}

/** A fact that cannot be read: that it could not be read, and nothing else. */
function error(): LintSurface {
  const message = 'error: the diagnostic fact could not be read';
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
 * its construct, its code and its body is not a finding: the pane says the fact could not be read
 * rather than render half of one.
 */
function asFact(raw: unknown): ReadFact | null {
  if (!isObject(raw)) return null;

  const state = raw['state'];

  if (state === 'finding') {
    const construct = raw['construct'];
    const code = raw['code'];
    const text = raw['message'];
    const namedConstruct = typeof construct === 'string' ? construct : '';
    const namedCode = typeof code === 'string' ? code : '';
    const body = typeof text === 'string' ? bodyOf(text) : '';
    if (namedConstruct === '' || namedCode === '' || body === '') return null;
    return {
      state: 'finding',
      construct: namedConstruct,
      code: namedCode,
      body,
    };
  }

  if (state === 'cannot-tell') {
    const reason = raw['reason'];
    return {
      state: 'cannot-tell',
      reason:
        typeof reason === 'string' && reason.length > 0
          ? reason
          : NO_CONSTRUCT_NAMED,
    };
  }

  return null;
}

/**
 * The fact list rendered as the one state it is in.
 *
 * @param facts the fact the join produced, a list of them, or the marker that the read is running
 */
export function lintPanel(facts?: unknown): LintSurface {
  if (isLoading(facts)) return loading();

  const list = asFactList(facts);

  // Nothing was handed over at all: there is no fact to render, and saying so is the error state.
  if (list === null) return error();

  // An empty list is a read on its way, never a table that reads as "nothing was wrong" (E4).
  if (list.length === 0) return loading();

  const read = list.map(asFact);

  // What was observed outranks what could not be told: a finding answers for the list.
  for (const fact of read) {
    if (fact !== null && fact.state === 'finding') {
      return finding(fact.construct, fact.code, fact.body);
    }
  }

  for (const fact of read) {
    if (fact !== null && fact.state === 'cannot-tell')
      return cannotTell(fact.reason);
  }

  // Facts were handed over and none of them could be read: that is the state, and nothing else.
  return error();
}

export const panelLint = lintPanel;
export const lintSurface = lintPanel;
export default lintPanel;
