/**
 * The render-phase panel surface — M039 T003 (INTENT.md SC5, held-out E7; prohibitions N2, N4, N6).
 *
 * The join itself lives in `extension/render-phase.js` (T002, `globalThis.angularAiRenderPhase`): it
 * reads the signal graph a caller captured and answers `{ findings, phase }`, where a finding is
 * `{ state: 'effect', effect, namedBy, reads }`, `{ state: 'change-detection', code, message,
 * provenance }` or `{ state: 'cannot-tell', reason }`, and the phase is always
 * `{ state: 'cannot-tell', absence: 'no-effect-event' }`. This module is the display half and
 * nothing else: it is handed that answer and renders it. It reads no graph, joins nothing and
 * installs no hook (N1): every value in the pane arrived through the argument.
 *
 * The pane's one job is separation (SC5). The answer's parts become their own blocks, in the order
 * the join hands them over, and each block renders its own text and no other block's (E7):
 *
 *   effect            the effect's name as the join reported it — or, where the graph gave none,
 *                     the statement that it gave none — the word saying how it was named (`label`
 *                     or `recorded-edge`), and one line per signal the recorded edges name. An
 *                     empty read is a stated absence, never a blank line.
 *   phase             its own block, always: the state the join published for the phase and the
 *                     absence it named. It is never inside an effect block and never a field a
 *                     finding carries (N2), and this pane holds no constant of its own for it:
 *                     `cannot-tell` and `no-effect-event` are printed because the answer carried
 *                     them.
 *   change-detection  the code, the message and the provenance the answer carried, and nothing
 *                     else: not an effect, not an owner, not a cause, and never beside the effect as
 *                     its cause (N4).
 *   cannot-tell       the reason the join named for its absence, and no finding field, because it
 *                     has none.
 *
 * A fact carrying nothing is `idle`; a state the pane was not written for — a word no join of this
 * milestone answers — is rendered as the state it was given, and is never dropped or relabelled.
 * The pane enumerates no vocabulary of the join's: whatever word arrives is the block's state, which
 * is why a later join that names a fourth finding renders under its own name.
 *
 * Nothing printed here is derived: the pane copies `effect`, `namedBy`, `reads`, `code`, `message`,
 * `provenance`, `reason`, `phase.state` and `phase.absence` out of the answer and joins them with
 * labels of its own. It never compares a value, never counts an edge, and never names a phase an
 * effect ran in (N2, N6): a fact that carries a phase field, a write, an owner or a cause renders
 * none of them.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `panel-linked-state.ts` and `panel-lint.ts` are reached, so the module loads under node's type
 * stripping and the suite (`scripts/panel-render-phase.test.mjs`, E7) executes it rather than
 * scanning it.
 */

/** The state the pane is in before any answer has arrived, and the word it renders for it. */
export const IDLE_STATE = 'idle';

/** The word a finding carries while the read is still running: no block, and no finding. */
export const LOADING_STATE = 'loading';

/** The pane's own state when the answer renders more than one block. */
export const FINDINGS_STATE = 'findings';

/** The join's word for the effect finding, which is also that block's state. */
export const EFFECT_STATE = 'effect';

/** The block the phase renders in. Its state word sits inside the block, never on a finding. */
export const PHASE_STATE = 'phase';

/** The join's word for the change-detection finding, which is also that block's state. */
export const CHANGE_DETECTION_STATE = 'change-detection';

/** The join's word for an absence, which is also that block's state. */
export const CANNOT_TELL_STATE = 'cannot-tell';

/** The absence the phase block falls back to when the answer names none. */
export const UNKNOWN_ABSENCE = 'unknown-absence';

/** The reason an absence block falls back to when the answer names none. */
export const UNKNOWN_REASON = 'unknown-reason';

/** The text one block renders: one message, its lines, and the two joined. */
type PaneText = {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

/**
 * One effect finding, rendered as its own block. `effect` is the name the join reported, or null
 * when the graph gave none; `namedBy` is the join's own word for how it was reached; `reads` is the
 * list of signals the recorded edges name, in the join's order.
 */
export type EffectBlock = {
  readonly kind: 'effect';
  readonly state: 'effect';
  readonly effect: string | null;
  readonly namedBy: string | null;
  readonly reads: readonly string[];
} & PaneText;

/**
 * The phase, rendered as its own block. `phase` is the state the join published for it and
 * `absence` the absence it named — both copied, neither invented.
 */
export type PhaseBlock = {
  readonly kind: 'phase';
  readonly state: 'phase';
  readonly phase: string;
  readonly absence: string;
} & PaneText;

/**
 * The change-detection finding, rendered as its own block. Its `message` is the message the answer
 * carried, verbatim: the block's own text is that body with the code and the provenance beside it.
 */
export type ChangeDetectionBlock = {
  readonly kind: 'change-detection';
  readonly state: 'change-detection';
  readonly code: string | null;
  readonly provenance: string | null;
} & PaneText;

/** The absence the join named, rendered as its own block with no finding field. */
export type AbsenceBlock = {
  readonly kind: 'cannot-tell';
  readonly state: 'cannot-tell';
  readonly reason: string;
} & PaneText;

/**
 * A state this pane was not written for, rendered as the state it was given. It borrows no field:
 * the word is the whole of what arrived.
 */
export type GivenBlock = {
  readonly kind: string;
  readonly state: string;
} & PaneText;

/** One block of the pane: the join's part, and the text only that part renders. */
export type RenderPhaseBlock =
  EffectBlock | PhaseBlock | ChangeDetectionBlock | AbsenceBlock | GivenBlock;

/**
 * What the panel renders for one answer. `state` is `idle` when nothing arrived, the single block's
 * own state when the answer renders one block, and `findings` when it renders more than one.
 * `lines` holds every block's lines in order and `blocks` keeps them apart, which is the separation
 * SC5 asks for.
 */
export type RenderPhaseSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly blocks: readonly RenderPhaseBlock[];
};

const IDLE_MESSAGE = 'idle: no render-phase answer has arrived yet';

/**
 * What an effect block prints where the graph named no effect. It states the absence; it never
 * mints a name from a position, an index or a call site (N1, N6).
 */
const NO_LABEL_LINE = 'effect: (the graph gives no label)';

/** What an effect block prints for an empty read: a stated absence, never a blank line. */
const NO_READ_LINE = 'read: (the recorded edges name no signal)';

/** What a change-detection block prints when the answer carried none of its three fields. */
const NO_FIELD_LINE =
  'change-detection: the answer carried no code, no message and no provenance';

/** The message a change-detection block falls back to when the answer carried no body. */
const NO_MESSAGE = 'change-detection: the answer carried no message';

/** What an absence block says: the answer named an absence, and the block names its reason. */
const ABSENCE_MESSAGE =
  'cannot tell: the answer names an absence, not a finding';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, trimmed, or null: whitespace states nothing. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * The text the answer carried for a field, verbatim, or null when it carried none. A message
 * arrives whole and is printed whole: trimming it would be an edit of what the page emitted, and an
 * empty one states nothing.
 */
function textOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/** The signals the answer named, in its order, with anything that is not a name dropped. */
function stringList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  const named: string[] = [];
  for (const entry of value) {
    const name = nonEmptyString(entry);
    if (name !== null) named.push(name);
  }
  return named;
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

/**
 * One effect finding, written in one place so a pin on its lines is a pin on every effect block.
 * The name is the join's, or the statement that the graph gave none; the reads are one line each in
 * the join's order. No phase, no write, no owner, no cause and no code reaches a line (N2, N4, N6).
 */
function effectBlock(
  effect: string | null,
  namedBy: string | null,
  reads: readonly string[],
): EffectBlock {
  const lines: string[] = [
    effect === null ? NO_LABEL_LINE : `effect: ${effect}`,
  ];
  if (namedBy !== null) lines.push(`namedBy: ${namedBy}`);
  if (reads.length === 0) {
    lines.push(NO_READ_LINE);
  } else {
    for (const signal of reads) lines.push(`read: ${signal}`);
  }
  return {
    kind: EFFECT_STATE,
    state: EFFECT_STATE,
    effect,
    namedBy,
    reads,
    ...pane(lines[0] ?? NO_LABEL_LINE, lines),
  };
}

/**
 * The phase, written in one place: the state the join published and the absence it named, copied
 * and never restated as a phase an effect ran in (N2).
 */
function phaseBlock(state: string, absence: string): PhaseBlock {
  const message = `phase: ${state}`;
  return {
    kind: PHASE_STATE,
    state: PHASE_STATE,
    phase: state,
    absence,
    ...pane(message, [message, `absence: ${absence}`]),
  };
}

/**
 * One change-detection finding, written in one place. The code, the message and the provenance are
 * the three values the answer carried, each on its own line and each only when it was carried; the
 * block names no effect and no cause (N4, N6).
 */
function changeDetectionBlock(
  code: string | null,
  body: string | null,
  provenance: string | null,
): ChangeDetectionBlock {
  const lines: string[] = [];
  if (code !== null) lines.push(`code: ${code}`);
  if (body !== null) lines.push(`message: ${body}`);
  if (provenance !== null) lines.push(`provenance: ${provenance}`);
  if (lines.length === 0) lines.push(NO_FIELD_LINE);
  return {
    kind: CHANGE_DETECTION_STATE,
    state: CHANGE_DETECTION_STATE,
    code,
    provenance,
    ...pane(body ?? NO_MESSAGE, lines),
  };
}

/**
 * The absence, written in one place: the reason the join named, and no effect, no read and no code —
 * the answer had none to give.
 */
function absenceBlock(reason: string): AbsenceBlock {
  return {
    kind: CANNOT_TELL_STATE,
    state: CANNOT_TELL_STATE,
    reason,
    ...pane(ABSENCE_MESSAGE, [ABSENCE_MESSAGE, `reason: ${reason}`]),
  };
}

/**
 * A state this pane was not written for, rendered as the state it was given. The pane prints the
 * word and nothing else: it has no field of its own to fill in, and borrowing another state's
 * fields is the guess this branch exists to refuse.
 */
function givenBlock(state: string): GivenBlock {
  const message = `state: ${state}`;
  return { kind: state, state, ...pane(message, [message]) };
}

function idle(): RenderPhaseSurface {
  const lines = [IDLE_MESSAGE];
  return {
    state: IDLE_STATE,
    kind: IDLE_STATE,
    message: IDLE_MESSAGE,
    lines,
    text: lines.join('\n'),
    blocks: [],
  };
}

/**
 * One finding of the answer, read for the fields this pane renders and no others. A finding whose
 * state word this pane was not written for still becomes a block: the state it was given, rendered
 * as itself. A finding that says the read is running is no block at all — the pane is idle, which
 * is the state it starts in, and an empty pane is never a finding.
 */
function asBlock(raw: unknown): RenderPhaseBlock | null {
  if (!isObject(raw)) return null;

  const state = nonEmptyString(raw['state']);
  if (state === null) return null;

  // The read is running: no block has arrived yet, which is the pane's idle state.
  if (state === LOADING_STATE) return null;

  if (state === EFFECT_STATE) {
    return effectBlock(
      nonEmptyString(raw['effect']),
      nonEmptyString(raw['namedBy']),
      stringList(raw['reads']),
    );
  }

  if (state === CHANGE_DETECTION_STATE) {
    return changeDetectionBlock(
      textOf(raw['code']),
      textOf(raw['message']),
      textOf(raw['provenance']),
    );
  }

  if (state === CANNOT_TELL_STATE) {
    return absenceBlock(nonEmptyString(raw['reason']) ?? UNKNOWN_REASON);
  }

  // Any other word is a state this pane was not written for. It is rendered, never dropped.
  return givenBlock(state);
}

/**
 * The phase the answer published, or null when it published none. The pane holds no phase of its
 * own: an answer without one renders no phase block rather than the absence this milestone happens
 * to expect today.
 */
function asPhaseBlock(raw: unknown): PhaseBlock | null {
  if (!isObject(raw)) return null;
  const state = nonEmptyString(raw['state']);
  if (state === null) return null;
  return phaseBlock(state, nonEmptyString(raw['absence']) ?? UNKNOWN_ABSENCE);
}

/**
 * The answer's two halves: the findings list and whatever the answer carried as its phase. A bare
 * array of findings is an answer with no phase; one finding on its own is a list of one; an object
 * that names neither is nothing this surface may render.
 */
function asAnswer(
  answer: unknown,
): { readonly findings: readonly unknown[]; readonly phase: unknown } | null {
  if (Array.isArray(answer)) return { findings: answer, phase: null };
  if (!isObject(answer)) return null;

  const carried = answer['findings'];
  if (Array.isArray(carried)) {
    return { findings: carried, phase: answer['phase'] };
  }

  const state = nonEmptyString(answer['state']);
  if (state === null) return null;

  // The read is running: there is no answer yet, which is the state the pane starts in.
  if (state === LOADING_STATE) return null;

  return { findings: [answer], phase: null };
}

/**
 * One answer rendered as its blocks: the findings in the order the join handed them over, then the
 * phase. Each block keeps its own text, which is the separation SC5 asks for; `lines` holds every
 * block's lines in that same order so a caller that renders one list still reads the pane whole.
 */
function combined(blocks: readonly RenderPhaseBlock[]): RenderPhaseSurface {
  const lines: string[] = [];
  for (const block of blocks) for (const line of block.lines) lines.push(line);

  const single = blocks.length === 1 ? blocks[0] : undefined;
  const state = single === undefined ? FINDINGS_STATE : single.state;
  const message =
    single === undefined
      ? `${FINDINGS_STATE}: ${blocks.length}`
      : single.message;

  return {
    state,
    kind: state,
    message,
    lines,
    text: lines.join('\n'),
    blocks,
  };
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ findings, phase }`, a list of findings, or the marker that the read
 *   is running
 */
export function renderPhasePanel(answer?: unknown): RenderPhaseSurface {
  const read = asAnswer(answer);

  // Nothing was handed over at all: no answer has arrived, and saying so is the idle state.
  if (read === null) return idle();

  const blocks: RenderPhaseBlock[] = [];
  for (const raw of read.findings) {
    const block = asBlock(raw);
    if (block !== null) blocks.push(block);
  }
  const phase = asPhaseBlock(read.phase);
  if (phase !== null) blocks.push(phase);

  // An answer that rendered nothing is a read on its way, never a pane that states a finding.
  if (blocks.length === 0) return idle();

  return combined(blocks);
}

export const panelRenderPhase = renderPhasePanel;
export const renderPhaseSurface = renderPhasePanel;
export default renderPhasePanel;
