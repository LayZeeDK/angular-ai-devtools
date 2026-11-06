(function () {
  'use strict';

  const CANNOT_TELL = 'cannot-tell';
  const FIELDS = 'fields';

  function isFieldState(value) {
    return (
      !!value &&
      typeof value === 'object' &&
      value.fields &&
      typeof value.fields === 'object' &&
      value.root &&
      typeof value.root === 'object'
    );
  }

  function ownErrors(field) {
    if (!field || typeof field !== 'object' || !Array.isArray(field.errors))
      return [];
    const out = [];
    for (let i = 0; i < field.errors.length; i += 1) {
      const error = field.errors[i];
      if (
        error &&
        typeof error === 'object' &&
        typeof error.kind === 'string'
      ) {
        out.push({ kind: error.kind });
      }
    }
    return out;
  }

  function readField(field) {
    if (!field || typeof field !== 'object') {
      return { valid: false, invalid: true, errors: [] };
    }
    return {
      valid: !!field.valid,
      invalid: !!field.invalid,
      errors: ownErrors(field),
    };
  }

  function read(state) {
    if (!isFieldState(state)) {
      return {
        state: CANNOT_TELL,
        reason: 'unreadable-state',
        fields: {},
        submit: 'unknown',
      };
    }

    const fields = {};
    const keys = Object.keys(state.fields);
    for (let i = 0; i < keys.length; i += 1) {
      fields[keys[i]] = readField(state.fields[keys[i]]);
    }

    const root = state.root;
    const rootErrors = Array.isArray(root.errors) ? root.errors : [];
    const rootKind =
      rootErrors.length > 0 && typeof rootErrors[0].kind === 'string'
        ? rootErrors[0].kind
        : null;
    const rootInvalid = root.invalid === true || root.valid === false;

    const submitState =
      typeof state.submitState === 'string'
        ? state.submitState
        : state.submitDisabled === true
          ? 'disabled'
          : 'enabled';

    if (rootInvalid && rootKind === null) {
      return {
        state: CANNOT_TELL,
        reason: 'root-invalid-without-error-kind',
        fields: fields,
        submit: submitState,
        submitState: submitState,
      };
    }

    const result = {
      state: FIELDS,
      fields: fields,
      submit: submitState,
      submitState: submitState,
    };
    if (rootKind !== null) {
      result.rootError = rootKind;
      result.rootErrorKind = rootKind;
    }
    return result;
  }

  const namespace = {
    read: read,
    fields: read,
    state: read,
    inspect: read,
    triage: read,
    CANNOT_TELL: CANNOT_TELL,
    FIELDS: FIELDS,
  };

  const g = globalThis;
  if (g.angularAiFieldState) {
    Object.assign(g.angularAiFieldState, namespace);
  } else {
    g.angularAiFieldState = namespace;
  }
})();
