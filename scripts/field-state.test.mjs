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

describe('field-state', () => {
  it("E1: reports each field's validity and its own errors beside submit state from recording", () => {
    const { api } = loadBare();
    const state = { fields: RECORDING.fields, root: RECORDING.root };
    const result = host(api.read(state));
    assert.equal(result.state, 'cannot-tell');
    assert.equal(result.submit, 'enabled');
    assert.equal(result.submitState, 'enabled');
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
      }),
    );
    assert.equal(without.state, 'cannot-tell');
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
    };
    const failure = reddens(pin);
    console.log(`mutant empty-success reddens: ${failure.message}`);
    assert.match(failure.message, /cannot-tell pin/);
  });
});
