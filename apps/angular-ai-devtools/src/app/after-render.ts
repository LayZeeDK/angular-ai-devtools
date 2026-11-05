/**
 * The after-render panel surface — M028 T003 (INTENT.md SC4; prohibitions N1, N2, N4).
 *
 * The ordering itself lives in `extension/after-render.js` (`globalThis.angularAiAfterRender`,
 * T002): one read joined to the profiler events the page agent records, in emission order. This
 * module is the display half and nothing else — it is handed the chain the ordering module
 * produced and renders it. There is no second reader of the profiler list here, no subscriber, no
 * tap and no measurement (N1): every fact in the surface came in through the `chain` argument.
 *
 * Three states the chain can be in, plus the state the panel is in before a chain arrives, and
 * they never blur (N4):
 *
 *   loading     the chain is being assembled; nothing has been joined yet.
 *   ordered     the read, the phase it ran in, and the events before it and at-or-after it, each
 *               array in the order it was handed over — emission order, never re-sorted.
 *   cannot-tell the profiler list carried no after-render event for the read. The surface states
 *               that absence and says nothing else. A zero width is the read's *value*; with no
 *               event to join it to, this surface cannot say why it was zero, and it does not
 *               attribute it to layout (N2): "before layout" is a cause, and a cause is exactly
 *               what the chain did not carry.
 *   unknown     an event the recorded enum does not carry, so it cannot be placed; the surface
 *               names the event it could not read. It never throws on one — a finding with no
 *               ordering is a state to render, not a crash.
 *
 * It adds no prose the chain does not support (N4): the read, the phase and the events are copied
 * through as values, and the one sentence per state says which state it is. No string here names
 * layout, a cause or a reflow.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`) the way
 * `image-budget.ts` is reached, so the module loads under node's type stripping and the held-out
 * suite (`scripts/panel-after-render.test.mjs`, E4) executes it rather than scanning it.
 */

/** The absence the `cannot-tell` state names: the same constant `extension/after-render.js` exports. */
export const NO_AFTER_RENDER_EVENT = 'no-after-render-event';

/** The read a chain was joined to: `at` its position in the recorded list, `width` what it saw. */
export type AfterRenderRead = {
  readonly at: unknown;
  readonly width: unknown;
};

/** One recorded profiler event, as the ordering module placed it. */
export type AfterRenderChainEvent = {
  /** The profiler enum's number, carried through untouched. */
  readonly type: unknown;
  /** The phase the event belongs to, as the ordering module resolved it. */
  readonly phase: string | null;
  /** Where the event sat in the recorded list. */
  readonly ordinal: number | null;
};

/**
 * What the panel renders for one chain finding. `before` and `after` are present only in the
 * `ordered` state, so no caller can read the chain's order out of an absence.
 */
export type AfterRenderSurface =
  | {
      readonly kind: 'loading';
      readonly state: 'loading';
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
      readonly read: AfterRenderRead | null;
    }
  | {
      readonly kind: 'unknown';
      readonly state: 'unknown';
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
      readonly event: unknown;
    }
  | {
      readonly kind: 'ordered';
      readonly state: 'ordered';
      readonly message: string;
      readonly lines: readonly string[];
      readonly text: string;
      readonly read: AfterRenderRead | null;
      readonly phase: string | null;
      readonly before: readonly AfterRenderChainEvent[];
      readonly after: readonly AfterRenderChainEvent[];
    };

/** The loading line: a state, not a finding, so it never borrows the absence's sentence. */
const LOADING_MESSAGE = 'loading: the after-render chain is being assembled';

/**
 * The absence sentence the Surface contract asks for: it names the list and the missing event, and
 * it stops there. It never attributes the read's width to anything.
 */
const CANNOT_TELL_MESSAGE =
  'cannot tell: the profiler list recorded no after-render event for the read';

/** The sentence an unplaceable event gets: the finding has no order, and the surface says so. */
const UNKNOWN_MESSAGE =
  'unknown: the event cannot be placed, so this finding has no ordering for it';

/** The one wording for a value the chain did not carry, so no state invents one. */
const NOT_RECORDED = 'not recorded';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** A scalar rendered as itself; a value the chain did not carry rendered as its absence. */
function formatValue(value: unknown): string {
  if (typeof value === 'number')
    return Number.isFinite(value) ? String(value) : NOT_RECORDED;
  if (typeof value === 'string') return value.length > 0 ? value : NOT_RECORDED;
  return NOT_RECORDED;
}

/**
 * The unreadable event, named as it arrived: a bare type is prefixed `type`, and an event's fields
 * are listed by name in a fixed order — the field names' order, never a re-order of the chain.
 */
function describeEvent(event: unknown): string {
  if (typeof event === 'number' || typeof event === 'boolean')
    return `type ${String(event)}`;
  if (typeof event === 'string') return `type ${JSON.stringify(event)}`;
  if (event === null) return 'a null event';
  if (event === undefined) return 'no event at all';
  if (Array.isArray(event)) return `${event.length}-entry list`;
  if (isObject(event)) {
    const fields = Object.keys(event)
      .sort()
      .map((key) => `${key}: ${formatScalar(event[key])}`);
    return fields.length === 0 ? 'an event with no field' : fields.join(', ');
  }
  return 'a value that is not a recorded event';
}

/** A field of an unreadable event, rendered for the sentence that names it. */
function formatScalar(value: unknown): string {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean') return String(value);
  return NOT_RECORDED;
}

/** The read as the chain carried it: values copied, `width: 0` kept as the 0 it was read as. */
function normaliseRead(value: unknown): AfterRenderRead | null {
  if (!isObject(value)) return null;
  return { at: value['at'], width: value['width'] };
}

/** One entry of the before/after arrays: the ordering module's shape, kept in place. */
function normaliseEvent(value: unknown): AfterRenderChainEvent {
  if (isObject(value)) {
    const phase = value['phase'];
    const ordinal = value['ordinal'];
    return {
      type: value['type'],
      phase: typeof phase === 'string' && phase.length > 0 ? phase : null,
      ordinal:
        typeof ordinal === 'number' && Number.isFinite(ordinal)
          ? ordinal
          : null,
    };
  }
  return { type: value, phase: null, ordinal: null };
}

function asList(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

/** The read line: the read the finding was joined to, or the absence of one. */
function readLine(read: AfterRenderRead | null): string {
  if (read === null) return `read ${NOT_RECORDED}`;
  return `read at ${formatValue(read.at)}, width ${formatValue(read.width)}`;
}

/** The phase name, as the ordering module resolved it. */
function phaseName(phase: string | null): string {
  return phase === null ? NOT_RECORDED : phase;
}

/** The phase line: the phase the read ran in. */
function phaseLine(phase: string | null): string {
  return `phase ${phaseName(phase)}`;
}

/** One chain line: where the event sits, the phase it belongs to and the type it carried. */
function eventLine(
  where: 'before' | 'after',
  event: AfterRenderChainEvent,
): string {
  return `${where} ${formatValue(event.ordinal)}: ${phaseName(event.phase)} (type ${formatValue(event.type)})`;
}

/** The message/lines/text triple every state renders through, so the pane is never blank. */
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

/**
 * Renders the chain the panel was handed. Pure: it reads the argument, writes nothing, and two
 * calls over equal chains return byte-identical lines — no clock, no iteration order of a map, no
 * locale formatting. It never throws, including for a chain that carries an unplaceable event.
 *
 * A chain that is empty (nothing handed over, or a finding with no state) is the absence state:
 * with no after-render event for the read there is nothing to order. The loading state is asked
 * for explicitly (`{ loading: true }`), so a surface that has nothing yet is never mistaken for a
 * finding that was assembled and found empty.
 */
export function afterRenderPanel(chain?: unknown): AfterRenderSurface {
  if (chain === null || chain === undefined) {
    return cannotTell(normaliseRead(undefined), undefined);
  }

  if (!isObject(chain)) {
    return unreadable(chain);
  }

  if (chain['loading'] === true || chain['assembling'] === true) {
    return {
      kind: 'loading',
      state: 'loading',
      ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
    };
  }

  const read = normaliseRead(chain['read']);
  const state = chain['state'];

  if (state === 'ordered') {
    const before = asList(chain['before']).map(normaliseEvent);
    const after = asList(chain['after']).map(normaliseEvent);
    // The ordering module already reports a read with no after-render event as `cannot-tell`; a
    // chain that says `ordered` and carries none is that same absence, not an order with no events.
    if (after.length === 0) {
      return cannotTell(read, undefined);
    }
    const phaseValue = chain['phase'];
    const phase =
      typeof phaseValue === 'string' && phaseValue.length > 0
        ? phaseValue
        : null;
    const lines = [
      readLine(read),
      phaseLine(phase),
      ...before.map((event) => eventLine('before', event)),
      ...after.map((event) => eventLine('after', event)),
    ];
    const message = `ordered: the read ran in the ${phase === null ? NOT_RECORDED : phase} phase, with ${before.length} events before it and ${after.length} after it`;
    return {
      kind: 'ordered',
      state: 'ordered',
      ...pane(message, lines),
      read,
      phase,
      before,
      after,
    };
  }

  if (state === 'cannot-tell') {
    return cannotTell(read, chain['reason']);
  }

  if (state === 'unknown') {
    return unreadable(chain['event']);
  }

  if (state === undefined) {
    // Handed a chain object with no state at all: nothing was joined, so the absence is the answer.
    return cannotTell(read, undefined);
  }

  // A state this surface does not carry cannot be rendered as a finding, so it is the unreadable
  // case, naming what arrived rather than guessing at what it meant.
  return unreadable(chain);
}

/** The absence state: the read it applies to, the named absence, and nothing about a cause. */
function cannotTell(
  read: AfterRenderRead | null,
  reason: unknown,
): AfterRenderSurface {
  const named =
    typeof reason === 'string' && reason.length > 0
      ? reason
      : NO_AFTER_RENDER_EVENT;
  const lines = [readLine(read), CANNOT_TELL_MESSAGE];
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason: named,
    ...pane(CANNOT_TELL_MESSAGE, lines),
    read,
  };
}

/** The unreadable case: the event named, and the statement that the finding has no ordering. */
function unreadable(event: unknown): AfterRenderSurface {
  const lines = [`event ${describeEvent(event)}`, UNKNOWN_MESSAGE];
  return {
    kind: 'unknown',
    state: 'unknown',
    ...pane(UNKNOWN_MESSAGE, lines),
    event,
  };
}

/** The surface under the name a caller looking for a renderer reaches for. */
export const afterRenderSurface = afterRenderPanel;

export default afterRenderPanel;
