/**
 * The field-set panel surface — M031 T003 (INTENT.md SC4; prohibitions N2, N3, N4).
 *
 * The read itself lives in `extension/field-state.js` (T002, `globalThis.angularAiFieldState`):
 * it reports each field's validity and its own errors, the submit state, and yields
 * `cannot-tell` when the form's root is invalid and carries no error kind. This module is the
 * display half and nothing else — it is handed the result the read produced (or the fact
 * that the read is still running, or that the form could not be read) and renders it. It
 * reads no form and installs no hook (N1): every fact in the pane arrived through the
 * argument.
 *
 * Four states, and they never blur (N4):
 *
 *   loading      the field set is being read. Never an empty list: a result that has not
 *                arrived yet is a read on its way, not a read that found nothing.
 *   fields       each field's validity, its own errors, and the submit state.
 *   cannot-tell  the root is invalid and carries no error kind: a rule outside the
 *                field states has no name here. The absence is named, and nothing else —
 *                the fields and submit state that were read are shown as data, never as a
 *                claim about why the form will not submit.
 *   error        the form could not be read. That is said, and nothing else.
 *
 * No rendered string names the cross-field rule, a field's value, or a reason beyond a
 * field's own error (N2, N3, N4).
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `panel-redirect.ts` and `panel-sanitizer.ts` are reached, so the module loads under
 * node's type stripping and the suite (`scripts/panel-fields.test.mjs`, E4) executes it.
 */

export const UNREADABLE_FORM = 'unreadable-form';
export const CANNOT_TELL_STATE = 'cannot-tell';
export const FIELDS_STATE = 'fields';

export type FieldEntry = {
  readonly valid: boolean;
  readonly invalid: boolean;
  readonly errors: readonly { readonly kind: string }[];
};

export type FieldsSurface =
  | ({ readonly kind: 'loading'; readonly state: 'loading' } & Pane)
  | ({
      readonly kind: 'fields';
      readonly state: 'fields';
      readonly fields: Readonly<Record<string, FieldEntry>>;
      readonly submit: string;
      readonly submitState: string;
      readonly rootError: string | null;
    } & Pane)
  | ({
      readonly kind: 'cannot-tell';
      readonly state: 'cannot-tell';
      readonly reason: string;
      readonly fields: Readonly<Record<string, FieldEntry>>;
      readonly submit: string;
      readonly submitState: string;
    } & Pane)
  | ({
      readonly kind: 'error';
      readonly state: 'error';
      readonly reason: string;
    } & Pane);

type Pane = {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

const LOADING_MESSAGE = 'loading: the field set is being read';

const CANNOT_TELL_MESSAGES: Readonly<Record<string, string>> = {
  'root-invalid-without-error-kind':
    'cannot tell: the form root is invalid and carries no error kind',
  'submit-state-unreadable':
    'cannot tell: the page did not report a submit state',
};

const GENERIC_CANNOT_TELL =
  'cannot tell: the page did not report what this pane needs';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asList(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function asField(raw: unknown): FieldEntry {
  if (isObject(raw)) {
    const errors = asList(raw['errors'])
      .map((e) =>
        isObject(e) && typeof e['kind'] === 'string'
          ? { kind: String(e['kind']) }
          : null,
      )
      .filter((e): e is { kind: string } => e !== null);
    return {
      valid: raw['valid'] === true,
      invalid: raw['invalid'] === true,
      errors,
    };
  }
  return { valid: false, invalid: true, errors: [] };
}

function asFields(raw: unknown): Record<string, FieldEntry> {
  const out: Record<string, FieldEntry> = {};
  if (isObject(raw)) {
    for (const key of Object.keys(raw)) {
      out[key] = asField(raw[key]);
    }
  }
  return out;
}

function pane(message: string, lines: readonly string[]): Pane {
  return { message, lines, text: lines.join('\n') };
}

function loading(): FieldsSurface {
  return {
    kind: 'loading',
    state: 'loading',
    ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]),
  };
}

function fieldsSurface(
  fields: Record<string, FieldEntry>,
  submit: string,
  rootError: string | null,
): FieldsSurface {
  const lines: string[] = [];
  for (const name of Object.keys(fields)) {
    const field = fields[name];

    if (!field) continue;

    lines.push(`${name}: ${field.valid ? 'valid' : 'invalid'}`);
    for (const err of field.errors) {
      lines.push(`${name}: error ${err.kind}`);
    }
  }
  lines.push(`submit: ${submit}`);
  if (rootError !== null && rootError.length > 0) {
    lines.push(`form: error ${rootError}`);
  }
  const message = `fields: ${Object.keys(fields).length} field${Object.keys(fields).length === 1 ? '' : 's'}, submit ${submit}`;
  return {
    kind: 'fields',
    state: 'fields',
    fields,
    submit,
    submitState: submit,
    rootError,
    ...pane(message, lines),
  };
}

function cannotTell(
  reason: unknown,
  fields: Record<string, FieldEntry>,
  submit: string,
): FieldsSurface {
  const named =
    typeof reason === 'string' && reason.length > 0
      ? reason
      : 'root-invalid-without-error-kind';
  // The reader reaches `cannot-tell` on the root alone — `rootInvalid && rootKind === null`
  // (`extension/field-state.js`) — and never consults field validity or the submit state to
  // decide. Saying "every field is valid while submit stays disabled" therefore asserted two
  // things the reader had not checked, and both can be false. State only what was read.
  // One sentence per reason the module can name. An unrecognised reason gets a sentence that
  // asserts no cause at all: this pane states what it was told and nothing further.
  const message = CANNOT_TELL_MESSAGES[named] ?? GENERIC_CANNOT_TELL;
  const rootLines = [message, `reason: ${named}`, `submit: ${submit}`];
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason: named,
    fields,
    submit,
    submitState: submit,
    ...pane(message, rootLines),
  };
}

function error(reason: unknown): FieldsSurface {
  const named =
    typeof reason === 'string' && reason.length > 0 ? reason : UNREADABLE_FORM;
  const message = 'error: the form could not be read';
  return {
    kind: 'error',
    state: 'error',
    reason: named,
    ...pane(message, [message, named]),
  };
}

export function fieldsPanel(result?: unknown): FieldsSurface {
  if (result === null || result === undefined) return error(UNREADABLE_FORM);

  if (!isObject(result)) return error(UNREADABLE_FORM);

  if (
    result['loading'] === true ||
    result['assembling'] === true ||
    result['state'] === 'loading'
  ) {
    return loading();
  }

  // Raw field-state shape: { fields, root }.
  if (isObject(result['fields']) && isObject(result['root'])) {
    const fields = asFields(result['fields']);
    const root = result['root'] as Record<string, unknown>;
    const rootErrors = Array.isArray(root['errors']) ? root['errors'] : [];
    const rootKind =
      rootErrors.length > 0 &&
      isObject(rootErrors[0]) &&
      typeof rootErrors[0]['kind'] === 'string'
        ? String(rootErrors[0]['kind'])
        : null;
    const rootInvalid = root['invalid'] === true || root['valid'] === false;
    const submit =
      typeof result['submitState'] === 'string'
        ? String(result['submitState'])
        : result['submitDisabled'] === true
          ? 'disabled'
          : typeof result['submit'] === 'string'
            ? String(result['submit'])
            : 'unknown';
    if (rootInvalid && rootKind === null) {
      return cannotTell('root-invalid-without-error-kind', fields, submit);
    }
    return fieldsSurface(fields, submit, rootKind);
  }

  const state = result['state'];

  if (state === 'cannot-tell') {
    const fields = asFields(result['fields']);
    const submit =
      typeof result['submitState'] === 'string'
        ? String(result['submitState'])
        : typeof result['submit'] === 'string'
          ? String(result['submit'])
          : 'unknown';
    return cannotTell(result['reason'], fields, submit);
  }

  if (state === 'error') {
    return error(
      typeof result['reason'] === 'string' ? result['reason'] : UNREADABLE_FORM,
    );
  }

  if (state === 'fields' || isObject(result['fields'])) {
    const fields = asFields(result['fields']);
    const submit =
      typeof result['submitState'] === 'string'
        ? String(result['submitState'])
        : typeof result['submit'] === 'string'
          ? String(result['submit'])
          : 'unknown';
    const rootError =
      typeof result['rootError'] === 'string'
        ? result['rootError']
        : typeof result['rootErrorKind'] === 'string'
          ? result['rootErrorKind']
          : null;
    return fieldsSurface(fields, submit, rootError);
  }

  return error(UNREADABLE_FORM);
}

export const panelFields = fieldsPanel;
export const fieldsPanelSurface = fieldsPanel;
export default fieldsPanel;
