import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-fields.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const LOADING = { loading: true };
const FIELDS = {
  state: 'fields',
  fields: {
    name: { valid: false, invalid: true, errors: [{ kind: 'required' }] },
    age: { valid: true, invalid: false, errors: [] },
  },
  submit: 'disabled',
  submitState: 'disabled',
};
const CANNOT_TELL = {
  state: 'cannot-tell',
  reason: 'root-invalid-without-error-kind',
  fields: {
    name: { valid: true, invalid: false, errors: [] },
    age: { valid: true, invalid: false, errors: [] },
  },
  submit: 'disabled',
  submitState: 'disabled',
};
const ERROR = { state: 'error', reason: 'unreadable-form' };

let mutantDir = null;
let mutantCount = 0;
async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-fields-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}
after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

function reddens(pin) {
  let failure = null;
  try {
    pin();
  } catch (e) {
    failure = e;
  }
  assert.ok(failure instanceof Error, 'mutant must redden');
  return failure;
}

describe('panel-fields states', () => {
  it('loading', () => {
    const s = SURFACE.fieldsPanel(LOADING);
    assert.equal(s.state, 'loading');
    assert.ok(s.lines.length > 0);
  });
  it('fields shows validity, own errors, submit', () => {
    const s = SURFACE.fieldsPanel(FIELDS);
    assert.equal(s.state, 'fields');
    assert.ok(s.text.includes('name: invalid'));
    assert.ok(s.text.includes('required'));
    assert.ok(s.text.includes('submit: disabled'));
    assert.ok(!/secret|42/.test(s.text));
  });
  it("fields renders the form's own error kind when carried", () => {
    const s = SURFACE.fieldsPanel({
      state: 'fields',
      fields: {
        name: { valid: true, invalid: false, errors: [] },
        age: { valid: true, invalid: false, errors: [] },
      },
      submit: 'disabled',
      submitState: 'disabled',
      rootError: 'name-too-short-for-age',
    });
    assert.equal(s.state, 'fields');
    assert.ok(s.text.includes('name-too-short-for-age'));
  });
  it('fields renders no root kind when none carried', () => {
    const s = SURFACE.fieldsPanel(FIELDS);
    assert.ok(!s.text.includes('name-too-short-for-age'));
  });
  it('cannot-tell', () => {
    const s = SURFACE.fieldsPanel(CANNOT_TELL);
    assert.equal(s.state, 'cannot-tell');
    assert.ok(s.lines.length > 0);
    assert.ok(s.text.toLowerCase().includes('cannot tell'));
  });
  it('error', () => {
    const s = SURFACE.fieldsPanel(ERROR);
    assert.equal(s.state, 'error');
    assert.ok(s.text.toLowerCase().includes('could not be read'));
  });
});

describe('mutants', () => {
  it('M1 cannot-tell empty pane reddens', async () => {
    const m = await loadMutant(
      '    ...pane(message, [message, named]),',
      "    ...pane('', []),",
    );
    const s = m.fieldsPanel(CANNOT_TELL);
    assert.equal(s.lines.length, 0);
    let failure = null;
    try {
      assert.ok(s.lines.length > 0);
    } catch (e) {
      failure = e;
    }
    assert.ok(failure instanceof Error);
    reddens(() => {
      if (s.lines.length === 0) throw new Error('empty pane');
    });
  });
  it('M2 field value reddens', async () => {
    const m = await loadMutant(
      "    lines.push(`${name}: ${field.valid ? 'valid' : 'invalid'}`);",
      "    lines.push(`${name}: ${field.valid ? 'valid' : 'invalid'} secret`);",
    );
    const s = m.fieldsPanel({
      state: 'fields',
      fields: { name: { valid: true, invalid: false, errors: [] } },
      submit: 'enabled',
      submitState: 'enabled',
    });
    assert.ok(/secret/.test(s.text));
    const failure = reddens(() => {
      if (/secret/.test(s.text)) throw new Error('value leaked');
    });
    console.log(`mutant field value reddens: ${failure.message}`);
    assert.match(failure.message, /value leaked/);
  });
  it('M3 cross-field function name reddens', async () => {
    const m = await loadMutant(
      '  lines.push(`submit: ${submit}`);',
      '  lines.push(`submit: ${submit} nameTooShortForAgeFn`);',
    );
    const s = m.fieldsPanel(FIELDS);
    assert.ok(/nameTooShortForAgeFn/.test(s.text));
    const failure = reddens(() => {
      if (/nameTooShortForAgeFn/.test(s.text))
        throw new Error('rule name leaked');
    });
    console.log(`mutant cross-field function name reddens: ${failure.message}`);
    assert.match(failure.message, /rule name leaked/);
  });
});
