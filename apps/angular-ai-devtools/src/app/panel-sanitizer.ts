/**
 * The sanitizer finding panel surface — M029 T003 (INTENT.md SC4; prohibitions N3, N4).
 *
 * The join itself lives in `extension/sanitizer-triage.js` (T002, `globalThis.angularAiSanitizerTriage`):
 * the warning supplies the occurrence, the profiler records supply the component. This module is the
 * display half and nothing else — it is handed the fact list the triage produced, or the fact that the
 * finding is still being assembled, or that the capture could not be read, and it renders it. It reads
 * no profiler list, installs no console tap and measures nothing (N1): every fact in the pane arrived
 * through the argument, and an empty argument is never turned into a finding.
 *
 * Six states, and they never blur (N4):
 *
 *   loading      the finding is still being assembled. A `stripped` or `cannot-tell` fact list handed
 *                over with no finding in it is this state — never an empty pane: a fact list that
 *                carries no fact yet is a finding on its way, not a finding of nothing (E4).
 *   none         no warning was captured. It says so as an absence and as nothing else (N3): the
 *                absence of a dev-mode warning is not evidence that nothing was stripped — a
 *                production build strips silently — so the pane never says clean, safe or ok, and it
 *                never reads a page with no warning as a page with nothing wrong.
 *   stripped     at least one warning was placed on a covering record: the component(s) that record
 *                names, its cycle(s), and the warning's own time. A binding is named only when the
 *                fact list carries one, and only when every placed warning carries the same one
 *                (N2); the measured recording carries none, so the measured pane names none and says
 *                that, rather than guessing the nearest one.
 *   cannot-tell  a warning was captured and no profiler record covers it: the pane names that absence,
 *                carries the warning's time, and names no component and no binding. It never falls back
 *                to the nearest component.
 *   deliberate   a `bypassSecurityTrust*` binding produced no warning: the pane names the binding and
 *                reports the bypass as deliberate. It is a state of its own, so a deliberate bypass is
 *                never rendered as the absence of a capture, and `none` is never read as a vetted
 *                bypass.
 *   error        the capture could not be read. The pane says, in those words, that it could not be
 *                read. Why it could not is carried as data (`reason`) and is not rendered: a reason is
 *                a cause, and N4 keeps causes out of the pane.
 *
 * No rendered string names a tag, an attribute, a removed substring or a cause. Nothing the fact list
 * carries other than the fields named below is copied through: a finding that arrives with the
 * warning's text, a tag or an attribute attached is rendered without them, because every line here is
 * built from a component name, a cycle id, a time and a binding name and from nothing else.
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `after-render.ts` and `image-budget.ts` are reached, so the module loads under node's type stripping
 * and the suite (`scripts/panel-sanitizer.test.mjs`, E4) executes it rather than scanning it.
 */

/** The absence the `cannot-tell` state names: the same constant `extension/sanitizer-triage.js` exports. */
export const NO_COVERING_RECORD = 'no-covering-profiler-record';

/**
 * The reasons this surface carries for an unreadable fact list. They are this module's own closed set
 * of tokens, never the caller's text, so nothing a fact list carries can reach a pane by that road.
 */
export const NOT_A_FACT_LIST = 'not-a-sanitizer-fact-list';
export const DELIBERATE_WITHOUT_BYPASS = 'deliberate-without-a-bypass-binding';

/** The only binding prefix the `deliberate` state will report as a vetted bypass. */
const BYPASS_PREFIX = 'bypassSecurityTrust';

/** The one wording for a fact the list did not carry, so no state invents one. */
const NOT_RECORDED = 'not recorded';

/**
 * One finding as this surface renders it: the fields the triage's shape carries, reduced to what is
 * displayed. `components` is empty for a `cannot-tell` finding whatever the list attached, so an
 * unattributable warning cannot borrow a component on the way in.
 */
export type SanitizerFinding = {
  readonly state: 'stripped' | 'cannot-tell';
  readonly at: number | null;
  readonly components: readonly string[];
  readonly cycleIds: readonly number[];
  readonly binding: string | null;
  readonly reason: string | null;
};

/** The message/lines/text triple every state renders through, so no pane is ever blank. */
type Pane = {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

/** What the panel renders for one fact list. Six states, no state borrowing another's sentence. */
export type SanitizerSurface =
  | ({ readonly kind: 'loading'; readonly state: 'loading' } & Pane)
  | ({ readonly kind: 'none'; readonly state: 'none' } & Pane)
  | ({
      readonly kind: 'stripped';
      readonly state: 'stripped';
      readonly findings: readonly SanitizerFinding[];
      /** The binding every placed warning carried, or null when they did not all carry one. */
      readonly binding: string | null;
    } & Pane)
  | ({
      readonly kind: 'cannot-tell';
      readonly state: 'cannot-tell';
      readonly reason: typeof NO_COVERING_RECORD;
      readonly findings: readonly SanitizerFinding[];
    } & Pane)
  | ({
      readonly kind: 'deliberate';
      readonly state: 'deliberate';
      readonly binding: string;
      readonly at: number | null;
    } & Pane)
  | ({
      readonly kind: 'error';
      readonly state: 'error';
      readonly reason: typeof NOT_A_FACT_LIST | typeof DELIBERATE_WITHOUT_BYPASS;
    } & Pane);

/** The loading sentence: a state, not a finding, and it never borrows the absence's wording. */
const LOADING_MESSAGE = 'loading: the sanitizer finding is being assembled';

/**
 * The `none` sentence. It states the absence of a capture and, on its second line, states what that
 * absence is not — no clean, safe or ok anywhere (N3).
 */
const NONE_MESSAGE = 'none: no sanitizer warning was captured for this page';
const NONE_ABSENCE_LINE = 'the absence of a capture is not a measurement of the page';

/** The absence sentence the Surface contract asks for: a warning was captured, no record covers it. */
const CANNOT_TELL_MESSAGE =
  'cannot tell: a warning was captured and no covering record was found to join it to, so no component can be named';

/** The error sentence: the capture could not be read, said in exactly those terms. */
const ERROR_MESSAGE = 'error: the sanitizer capture could not be read';
const ERROR_LINE = 'no sanitizer finding can be rendered from this capture';

/** The deliberate sentence: the bypass was declared, and the capture recorded no warning for it. */
const DELIBERATE_MESSAGE =
  'deliberate: this binding declares a sanitizer bypass and the capture recorded no warning for it';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asList(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

/** A page-clock time, or null when the list carried none: another clock is not this one. */
function clockOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** The component names the list carries, in its own order, without repeats. */
function componentNames(value: unknown): string[] {
  const found: string[] = [];
  for (const entry of asList(value)) {
    if (typeof entry === 'string' && entry.length > 0 && !found.includes(entry)) found.push(entry);
  }
  return found;
}

/** The cycle ids the list carries, in its own order, without repeats. */
function cycleIds(value: unknown): number[] {
  const found: number[] = [];
  for (const entry of asList(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry) && !found.includes(entry)) found.push(entry);
  }
  return found;
}

/** A recorded time, or the one wording for a time the fact list did not carry. */
function rendered(at: number | null): string {
  return at === null ? NOT_RECORDED : String(at);
}

/** `1 warning` / `2 warnings`, so no sentence reads `1 warnings`. */
function counted(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/**
 * One finding, reduced to what the surface renders. A tag, an attribute or the warning's own text
 * attached beside the finding is not read here, so it cannot reach a pane (N2, N4).
 */
function normaliseFinding(raw: unknown): SanitizerFinding | null {
  if (!isObject(raw)) return null;
  const state = raw['state'];
  if (state === 'stripped') {
    const binding = raw['binding'];
    return {
      state: 'stripped',
      at: clockOf(raw['at']),
      components: componentNames(raw['components']),
      cycleIds: cycleIds(raw['cycleIds']),
      binding: typeof binding === 'string' && binding.length > 0 ? binding : null,
      reason: null,
    };
  }
  if (state === 'cannot-tell') {
    // The triage's one absence. The list's own reason is not copied through: a pane that echoed it
    // would echo whatever a caller put there, and this surface has exactly one absence to name.
    return {
      state: 'cannot-tell',
      at: clockOf(raw['at']),
      components: [],
      cycleIds: [],
      binding: null,
      reason: NO_COVERING_RECORD,
    };
  }
  return null;
}

function pane(message: string, lines: readonly string[]): Pane {
  return { message, lines, text: lines.join('\n') };
}

/** The loading pane: the state, on its own line, so it is never mistaken for an empty finding. */
function loading(): SanitizerSurface {
  return { kind: 'loading', state: 'loading', ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]) };
}

/** The absence pane: the no-warning statement and, with it, what that statement is not (N3). */
function absence(): SanitizerSurface {
  return { kind: 'none', state: 'none', ...pane(NONE_MESSAGE, [NONE_MESSAGE, NONE_ABSENCE_LINE]) };
}

/** The unreadable pane. The reason rides along as data and is deliberately not rendered. */
function unreadable(
  reason: typeof NOT_A_FACT_LIST | typeof DELIBERATE_WITHOUT_BYPASS,
): SanitizerSurface {
  return {
    kind: 'error',
    state: 'error',
    reason,
    ...pane(ERROR_MESSAGE, [ERROR_MESSAGE, ERROR_LINE]),
  };
}

/** One unattributable warning: its time, the absence of a covering record, and no component. */
function cannotTellLine(finding: SanitizerFinding): string {
  return `at ${rendered(finding.at)}: no covering record (${NO_COVERING_RECORD})`;
}

/** One placed warning: the component(s), the cycle(s), the time, and a binding only if carried. */
function strippedLines(finding: SanitizerFinding): string[] {
  const lines = finding.components.map((name) => `component ${name}`);
  for (const cycleId of finding.cycleIds) lines.push(`cycle ${cycleId}`);
  lines.push(`at ${rendered(finding.at)}`);
  if (finding.binding !== null) lines.push(`binding ${finding.binding}`);
  return lines;
}

/**
 * The binding a load may name: only when every placed warning carries the same one. A load that
 * carries none, or two different ones, names none — the same refusal `bindingOf` makes per record.
 */
function sharedBinding(placed: readonly SanitizerFinding[]): string | null {
  let found: string | null = null;
  for (const finding of placed) {
    if (finding.binding === null) return null;
    if (found === null) {
      found = finding.binding;
      continue;
    }
    if (found !== finding.binding) return null;
  }
  return found;
}

/** The stripped pane: the placed warnings, the ones that could not be placed, and what it may name. */
function stripped(findings: readonly SanitizerFinding[]): SanitizerSurface {
  const placed = findings.filter((finding) => finding.state === 'stripped');
  const unattributable = findings.length - placed.length;
  const binding = sharedBinding(placed);

  const lines: string[] = [];
  for (const finding of findings) {
    if (finding.state === 'stripped') {
      for (const line of strippedLines(finding)) lines.push(line);
    } else {
      lines.push(cannotTellLine(finding));
    }
  }

  const parts = [`stripped: ${counted(placed.length, 'warning')} placed on a covering record`];
  if (unattributable > 0) parts.push(`${counted(unattributable, 'warning')} could not be placed`);
  parts.push(binding === null ? 'no single binding was carried' : `binding ${binding}`);
  const message = parts.join('; ');

  return { kind: 'stripped', state: 'stripped', findings, binding, ...pane(message, lines) };
}

/** The absence pane for a load whose warnings were all unattributable: no component, no binding. */
function cannotTell(findings: readonly SanitizerFinding[]): SanitizerSurface {
  const lines = findings.map(cannotTellLine);
  lines.push(CANNOT_TELL_MESSAGE);
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason: NO_COVERING_RECORD,
    findings,
    ...pane(CANNOT_TELL_MESSAGE, lines),
  };
}

/** The deliberate pane: the bypass binding that produced no warning, named and nothing more. */
function deliberate(binding: string, at: number | null): SanitizerSurface {
  const lines = [`binding ${binding}`];
  if (at !== null) lines.push(`at ${at}`);
  lines.push(DELIBERATE_MESSAGE);
  return {
    kind: 'deliberate',
    state: 'deliberate',
    binding,
    at,
    ...pane(DELIBERATE_MESSAGE, lines),
  };
}

/** The `deliberate` state, or the unreadable pane when the list names no vetted bypass. */
function deliberateFrom(factList: Record<string, unknown>): SanitizerSurface {
  const binding = factList['binding'];
  const named = typeof binding === 'string' ? binding : '';
  if (!named.startsWith(BYPASS_PREFIX) || named.length === BYPASS_PREFIX.length) {
    return unreadable(DELIBERATE_WITHOUT_BYPASS);
  }
  return deliberate(named, clockOf(factList['at']));
}

/**
 * Renders the fact list the panel was handed. Pure: it reads the argument, writes nothing, and two
 * calls over equal fact lists return byte-identical lines — no clock, no locale formatting. It never
 * throws, whatever arrives.
 *
 * The facts win over the label: a fact list that carries findings is rendered from those findings, so
 * a list labelled `none` beside a captured warning cannot hide the warning. The loading state is
 * asked for explicitly (`{ loading: true }`, `{ assembling: true }` or `{ state: 'loading' }`), and a
 * `stripped` or `cannot-tell` claim with no finding in its list is that same state — an empty fact
 * list is never rendered as a finding that found empty (E4). Anything that is not a fact list at all
 * is the error state: the capture could not be read.
 */
export function sanitizerPanel(factList?: unknown): SanitizerSurface {
  if (!isObject(factList)) {
    // Nothing handed over, or something that is not a fact list: no state invents a finding for it.
    return unreadable(NOT_A_FACT_LIST);
  }

  if (
    factList['loading'] === true ||
    factList['assembling'] === true ||
    factList['state'] === 'loading'
  ) {
    return loading();
  }

  const findings: SanitizerFinding[] = [];
  for (const raw of asList(factList['findings'])) {
    const finding = normaliseFinding(raw);
    if (finding !== null) findings.push(finding);
  }

  if (findings.length > 0) {
    const placed = findings.filter((finding) => finding.state === 'stripped');
    return placed.length > 0 ? stripped(findings) : cannotTell(findings);
  }

  const state = factList['state'];

  if (state === 'none') return absence();

  // A finding that was claimed and not yet delivered: assembling, not empty.
  if (state === 'stripped' || state === 'cannot-tell') return loading();

  if (state === 'deliberate' || factList['deliberate'] === true) return deliberateFrom(factList);

  if (state === 'error') return unreadable(NOT_A_FACT_LIST);

  // A state this surface does not carry cannot be rendered as a finding, so it is the unreadable
  // case rather than a guess at what it meant.
  return unreadable(NOT_A_FACT_LIST);
}

/** The surface under the names a caller looking for a renderer reaches for. */
export const sanitizerSurface = sanitizerPanel;
export const panelSanitizer = sanitizerPanel;

export default sanitizerPanel;
