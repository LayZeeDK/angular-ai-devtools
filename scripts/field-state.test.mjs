import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/field-state.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m031-field-state.json', import.meta.url),
    'utf8',
  ),
);

function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiFieldState;
  assert.ok(api, 'namespace published');
  return { api, context };
}

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function mutant(anchor, replacement) {
  const source = SRC.replace(anchor, replacement);
  assert.notEqual(source, SRC, 'mutation must change source (anchor missing?)');
  return loadBare(source).api;
}

function reddens(pin) {
  let failure = null;
  try {
    pin();
  } catch (e) {
    failure = e;
  }
  assert.ok(failure instanceof Error, 'mutant must be caught');
  return failure;
}

// ---------------- submit-state join (M037 / T001) ----------------
//
// Every test below is proven non-vacuous in three phases: the pin is run
// against the unmodified module, then against a mutated module that must
// redden naming the defect the test hunts, then against the unmodified module
// again (restore). A mutation that survives fails the test, so a tolerant or
// self-fulfilling assertion cannot pass silently.

function pristineApi() {
  return loadBare().api;
}

function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) stringsIn(item, out);
  else if (value && typeof value === 'object')
    for (const key of Object.keys(value)) stringsIn(value[key], out);
  return out;
}

function assertNoSubstring(result, words, message) {
  for (const text of stringsIn(result))
    for (const word of words)
      assert.ok(
        !text.includes(word),
        `${message} (emitted ${JSON.stringify(text)})`,
      );
}

function proveNonVacuous(pin, mutations) {
  // 1. pin the unmodified module first.
  pin(pristineApi());
  // 2. each mutant must redden, and its failure must name the defect.
  const messages = mutations.map((mutation) => {
    const api = mutant(mutation.anchor, mutation.replacement);
    const failure = reddens(() => pin(api));
    assert.match(
      failure.message,
      mutation.message,
      `mutant must redden naming the defect ${mutation.message}`,
    );
    return `${mutation.message.source} -> ${failure.message.split('\n')[0]}`;
  });
  // 3. restore: the unmodified module still satisfies the pin.
  pin(pristineApi());
  return messages;
}

describe('field-state', () => {
  it("E1: reports each field's validity and its own errors beside submit state from recording", () => {
    const { api } = loadBare();
    const state = { fields: RECORDING.fields, root: RECORDING.root };
    const result = host(api.read(state));
    assert.equal(result.state, 'cannot-tell');
    // This fact carries no submit state: the recording's root is invalid with no error kind and the
    // state is withheld here, so the module reports the state as unread rather than as `enabled` — a
    // claim nobody measured. The root's absence is named first.
    assert.equal(result.reason, 'root-invalid-without-error-kind');
    assert.equal(result.submit, 'unknown');
    assert.equal(result.submitState, 'unknown');
    for (const key of ['name', 'age']) {
      const field = result.fields[key];
      assert.ok(field, `${key} present`);
      assert.equal(field.valid, RECORDING.fields[key].valid, `${key}.valid`);
      assert.equal(
        field.invalid,
        RECORDING.fields[key].invalid,
        `${key}.invalid`,
      );
      assert.deepEqual(
        field.errors,
        RECORDING.fields[key].errors,
        `${key}.errors`,
      );
    }
    assert.equal(result.fields.name.errors[0].kind, 'required');
    assert.equal(result.fields.age.errors[0].kind, 'min');
  });

  it('E2: with state withheld, cannot-tell and never a chain of fields — nothing else supplied it', () => {
    const { api } = loadBare();
    const result = host(api.read(null));
    assert.equal(result.state, 'cannot-tell');
    assert.deepEqual(result.fields, {});
    assert.ok(!('name' in result.fields) && !('age' in result.fields));
  });

  it('E3: root invalid with a kind reports that kind; root invalid without one returns cannot-tell', () => {
    const { api } = loadBare();
    // Both facts carry the submit state, because the subject here is the root's error kind: since
    // M037 T002 a fact that carries none is cannot-tell for that reason, which would mask this pin.
    const withKind = host(
      api.read({
        fields: {
          name: { valid: true, invalid: false, errors: [] },
          age: { valid: true, invalid: false, errors: [] },
        },
        root: {
          valid: false,
          invalid: true,
          errors: [{ kind: 'name-too-short-for-age' }],
        },
        submitDisabled: false,
      }),
    );
    assert.equal(withKind.state, 'fields');
    assert.equal(withKind.rootError, 'name-too-short-for-age');
    assert.equal(withKind.rootErrorKind, 'name-too-short-for-age');

    const without = host(
      api.read({
        fields: {
          name: { valid: true, invalid: false, errors: [] },
          age: { valid: true, invalid: false, errors: [] },
        },
        root: { valid: false, invalid: true, errors: [] },
        submitDisabled: false,
      }),
    );
    assert.equal(without.state, 'cannot-tell');
    assert.equal(without.reason, 'root-invalid-without-error-kind');
  });

  it('unreadable yields cannot-tell', () => {
    const { api } = loadBare();
    const result = host(api.read(null));
    assert.equal(result.state, 'cannot-tell');
  });
});

describe('mutants', () => {
  it('naming cross-field function reddens', () => {
    const anchor = 'result.rootError = rootKind;';
    const replacement = "result.rootError = 'nameTooShortForAgeFn';";
    const api = mutant(anchor, replacement);
    const state = {
      fields: {
        name: { valid: true, invalid: false, errors: [] },
        age: { valid: true, invalid: false, errors: [] },
      },
      root: {
        valid: false,
        invalid: true,
        errors: [{ kind: 'name-too-short-for-age' }],
      },
      // The submit state is carried so the join reaches `fields` at all (M037 T002): this mutant is
      // about the root kind, and a fact with no submit state is cannot-tell for that other reason.
      submitDisabled: true,
    };
    const unmutated = loadBare().api;
    assert.equal(
      host(unmutated.read(state)).rootError,
      'name-too-short-for-age',
    );

    const pin = () => {
      const result = host(api.read(state));
      assert.equal(result.rootError, 'name-too-short-for-age', 'kind pin');
    };
    const failure = reddens(pin);
    console.log(
      `mutant naming cross-field function reddens: ${failure.message}`,
    );
    assert.match(failure.message, /kind pin/);
  });

  it('echoing value reddens', () => {
    const anchor = 'errors: ownErrors(field),';
    const replacement = 'errors: ownErrors(field), value: field.value,';
    const api = mutant(anchor, replacement);
    const state = {
      fields: {
        name: { valid: true, invalid: false, errors: [], value: 'secret' },
        age: { valid: true, invalid: false, errors: [], value: 42 },
      },
      root: { valid: true, invalid: false, errors: [] },
    };
    const unmutated = loadBare().api;
    assert.equal(host(unmutated.read(state)).fields.name.value, undefined);

    const pin = () => {
      const result = host(api.read(state));
      assert.equal(result.fields.name.value, undefined, 'no-value pin');
    };
    const failure = reddens(pin);
    console.log(`mutant echoing value reddens: ${failure.message}`);
    assert.match(failure.message, /no-value pin/);
  });

  it('empty-success reddens', () => {
    const anchor = 'if (rootInvalid && rootKind === null) {';
    const replacement = 'if (false && rootInvalid && rootKind === null) {';
    const api = mutant(anchor, replacement);
    const state = {
      fields: {
        name: { valid: true, invalid: false, errors: [] },
        age: { valid: true, invalid: false, errors: [] },
      },
      root: { valid: false, invalid: true, errors: [] },
    };
    const unmutated = loadBare().api;
    assert.equal(host(unmutated.read(state)).state, 'cannot-tell');

    const pin = () => {
      const result = host(api.read(state));
      assert.equal(result.state, 'cannot-tell', 'cannot-tell pin');
      // The reason, not only the state: since M037 T002 a fact with no submit state is also
      // cannot-tell, so the state alone no longer tells this defect from that one. With the root
      // check removed this fact's remaining reason is `submit-state-unreadable`.
      assert.equal(
        result.reason,
        'root-invalid-without-error-kind',
        'cannot-tell reason pin',
      );
    };
    const failure = reddens(pin);
    console.log(`mutant empty-success reddens: ${failure.message}`);
    assert.match(failure.message, /cannot-tell reason pin/);
  });
});

describe('submit-state join', () => {
  it('E1: a fact carrying no submit state yields cannot-tell with a named reason, never a default', () => {
    const pin = (api) => {
      // The recording carries the submit state, so omitting it here is deliberate: the fact is
      // built from fields and root only.
      assert.equal(
        RECORDING.submitDisabled,
        true,
        'recording carries the submit state',
      );
      const fact = {
        fields: RECORDING.fields,
        root: { valid: true, invalid: false, errors: [] },
      };
      assert.ok(!('submitDisabled' in fact), 'fact omits submitDisabled');
      assert.ok(!('submitState' in fact), 'fact omits submitState');
      assert.ok(!('submit' in fact), 'fact omits submit');
      // A field is invalid, so an implementation that infers the submit state from field validity
      // would answer 'disabled' here (N3).
      assert.equal(fact.fields.name.invalid, true, 'a field is invalid');
      const result = host(api.read(fact));
      // SC4, in the shipped code: the state cannot be told from this fact, and the module says so
      // with that reason rather than defaulting to `enabled`.
      assert.equal(result.state, 'cannot-tell', 'E1 state pin');
      assert.equal(result.reason, 'submit-state-unreadable', 'E1 reason pin');
      // What was not read is reported as unread — never as a default, in either direction.
      assert.equal(result.submit, 'unknown', 'E1 no-default pin');
      assert.equal(result.submitState, 'unknown', 'E1 no-default pin');
      // No submit finding anywhere in the answer: not a disabled claim and not an enabled one.
      assertNoSubstring(result, ['enabled', 'disabled'], 'E1 no submit claim');
      assert.equal(
        result.submitDisabled,
        undefined,
        'E1 no submitDisabled claim',
      );
    };
    const messages = proveNonVacuous(pin, [
      {
        anchor: 'if (!submitCarried) {',
        replacement: 'if (false) {',
        message: /E1 state pin/,
      },
      {
        anchor: "reason: 'submit-state-unreadable',",
        replacement: "reason: 'root-invalid-without-error-kind',",
        message: /E1 reason pin/,
      },
      {
        // The pre-M037 default: a fact carrying no state falls back to `enabled`.
        anchor: "const submitValue = submitCarried ? submitState : 'unknown';",
        replacement: 'const submitValue = submitState;',
        message: /E1 no-default pin/,
      },
      {
        anchor: "reason: 'submit-state-unreadable',\n        fields: fields,",
        replacement:
          "reason: 'submit-state-unreadable',\n        submitNote: 'submit disabled by field validity',\n        fields: fields,",
        message: /E1 no submit claim/,
      },
    ]);
    console.log(`E1 non-vacuous: ${messages.join(' | ')}`);
  });

  it('E2: a disabled submit with a root error kind names that kind and invents no rule text', () => {
    const fact = () => ({
      fields: RECORDING.fields,
      root: {
        valid: false,
        invalid: true,
        errors: RECORDING.crossField.rootErrors,
      },
      submitElementId: RECORDING.submitElementId,
      submitDisabled: RECORDING.submitDisabled,
    });
    const pin = (api) => {
      const input = fact();
      assert.equal(
        input.submitDisabled,
        true,
        'fact carries the element disabled reading',
      );
      assert.equal(input.submitElementId, 'submit', 'fact carries the id');
      const kindsCarried = [
        ...input.fields.name.errors.map((e) => e.kind),
        ...input.fields.age.errors.map((e) => e.kind),
        ...input.root.errors.map((e) => e.kind),
      ];
      const result = host(api.read(input));
      assert.equal(result.state, 'fields', 'E2 state pin');
      assert.equal(result.submit, 'disabled', 'E2 disabled submit pin');
      assert.equal(
        result.rootError,
        'name-too-short-for-age',
        'E2 root kind pin',
      );
      assert.equal(
        result.rootErrorKind,
        'name-too-short-for-age',
        'E2 root kind pin',
      );
      // No rule wording the fact did not carry: every emitted string is either
      // the module's own vocabulary or something this fact carried.
      const allowed = new Set([
        'fields',
        'cannot-tell',
        'disabled',
        'enabled',
        ...kindsCarried,
      ]);
      for (const text of stringsIn(result))
        assert.ok(
          allowed.has(text),
          `E2 names no rule the fact did not carry: ${text}`,
        );
    };
    const messages = proveNonVacuous(pin, [
      {
        anchor: 'result.rootError = rootKind;',
        replacement: "result.rootError = 'nameTooShortForAgeFn';",
        message: /E2 root kind pin/,
      },
      {
        // 'max' is a rule declared in the fixture that no field of this fact
        // reports: naming it would be inventing rule text the fact lacks.
        anchor: 'result.rootErrorKind = rootKind;',
        replacement:
          "result.rootErrorKind = rootKind;\n      result.rule = 'max';",
        message: /E2 names no rule the fact did not carry/,
      },
    ]);
    console.log(`E2 non-vacuous: ${messages.join(' | ')}`);
  });

  it("E3: a field's own error and the root kind stay in different places with different words", () => {
    const fact = () => ({
      fields: {
        name: RECORDING.fields.name,
        age: { valid: true, invalid: false, errors: [] },
      },
      root: {
        valid: false,
        invalid: true,
        errors: RECORDING.crossField.rootErrors,
      },
      submitDisabled: true,
    });
    const pin = (api) => {
      const input = fact();
      const result = host(api.read(input));
      assert.equal(result.state, 'fields', 'E3 state pin');
      assert.equal(result.submit, 'disabled', 'E3 submit pin');
      assert.deepEqual(
        result.fields.name.errors,
        [{ kind: 'required' }],
        'E3 field own error pin',
      );
      assert.equal(
        result.rootError,
        'name-too-short-for-age',
        'E3 root kind pin',
      );
      assert.equal(
        result.rootErrorKind,
        'name-too-short-for-age',
        'E3 root kind pin',
      );
      // Different words in different places: neither kind is merged into the
      // other's container.
      assert.notEqual(
        result.fields.name.errors[0].kind,
        result.rootError,
        'E3 different words',
      );
      assert.ok(
        !stringsIn(result.fields).includes('name-too-short-for-age'),
        'E3 root kind not merged into the field errors',
      );
      assert.ok(
        !stringsIn({
          state: result.state,
          submit: result.submit,
          submitState: result.submitState,
          rootError: result.rootError,
          rootErrorKind: result.rootErrorKind,
        }).includes('required'),
        'E3 field error not merged into the root',
      );
    };
    const messages = proveNonVacuous(pin, [
      {
        anchor: 'result.rootError = rootKind;',
        replacement: 'result.rootError = state.fields.name.errors[0].kind;',
        message: /E3 root kind pin/,
      },
      {
        anchor: 'fields[keys[i]] = readField(state.fields[keys[i]]);',
        replacement:
          'fields[keys[i]] = readField(state.fields[keys[i]]);\n      if (state.root && Array.isArray(state.root.errors) && state.root.errors[0])\n        fields[keys[i]].errors.push({ kind: state.root.errors[0].kind });',
        message: /E3 field own error pin/,
      },
    ]);
    console.log(`E3 non-vacuous: ${messages.join(' | ')}`);
  });

  it('E4: submit disabled=false beside a valid root is reported as enabled', () => {
    // E4 asserts only the case this fixture can produce. Submit-enabled beside
    // a root error is IMPOSSIBLE here: field-form-page.ts:18 binds
    // `[disabled]="fieldForm().invalid()"`, so enabled implies valid implies no
    // root error. That combination is deliberately not asserted.
    const fact = () => ({
      fields: {
        name: { valid: true, invalid: false, errors: [] },
        age: { valid: true, invalid: false, errors: [] },
      },
      root: { valid: true, invalid: false, errors: [] },
      // The element's own disabled reading, not a value derived from validity.
      submitElementId: 'submit',
      submitDisabled: false,
    });
    const pin = (api) => {
      const result = host(api.read(fact()));
      assert.equal(result.state, 'fields', 'E4 state pin');
      assert.equal(result.submit, 'enabled', 'E4 enabled-submit pin');
      assert.equal(result.submitState, 'enabled', 'E4 enabled-submit pin');
      assert.equal(result.rootError, undefined, 'E4 no root kind');
      assertNoSubstring(result, ['disabled'], 'E4 no disabled claim');
    };
    const messages = proveNonVacuous(pin, [
      {
        anchor: 'state.submitDisabled === true',
        replacement: 'state.submitDisabled !== true',
        message: /E4 enabled-submit pin/,
      },
      {
        anchor: ": 'enabled';",
        replacement: ": 'unknown';",
        message: /E4 enabled-submit pin/,
      },
    ]);
    console.log(`E4 non-vacuous: ${messages.join(' | ')}`);
  });

  it('E7: extra unexpected fields on the fact change nothing the join reads', () => {
    const baseline = () => ({
      fields: RECORDING.fields,
      root: {
        valid: false,
        invalid: true,
        errors: RECORDING.crossField.rootErrors,
      },
      submitDisabled: RECORDING.submitDisabled,
    });
    const withExtra = () => ({
      ...baseline(),
      submitElementId: 'submit',
      ruleText: 'max',
      value: { name: 'secret' },
      html: '<button disabled>submit</button>',
      note: 'ignore me',
      // A decoy shaped like a neighbouring field of the recording, carrying a
      // kind this fact does not have at its root.
      crossField: { rootErrors: [{ kind: 'required' }] },
      extras: { nested: 'nameTooShortForAgeFn' },
    });
    const pin = (api) => {
      const base = host(api.read(baseline()));
      const extra = host(api.read(withExtra()));
      assert.equal(base.submit, 'disabled', 'E7 baseline submit pin');
      assert.equal(
        base.rootError,
        'name-too-short-for-age',
        'E7 baseline root pin',
      );
      assert.deepEqual(
        extra,
        base,
        'E7 extra fields change nothing the join reads',
      );
      assertNoSubstring(
        extra,
        ['secret', 'max', 'ignore me', 'nameTooShortForAgeFn'],
        'E7 extras are not echoed',
      );
    };
    const messages = proveNonVacuous(pin, [
      {
        anchor: 'state: FIELDS,\n      fields: fields,',
        replacement:
          'state: FIELDS,\n      fields: fields,\n      echo: state.ruleText,',
        message: /E7 extra fields change nothing the join reads/,
      },
      {
        anchor:
          'const rootErrors = Array.isArray(root.errors) ? root.errors : [];',
        replacement:
          'const rootErrors = state.crossField && Array.isArray(state.crossField.rootErrors) ? state.crossField.rootErrors : Array.isArray(root.errors) ? root.errors : [];',
        message: /E7 extra fields change nothing the join reads/,
      },
    ]);
    console.log(`E7 non-vacuous: ${messages.join(' | ')}`);
  });
});
