import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECORD_PATH = join(__dirname, '..', 'research', 'raw', 'm027-image-warning-capture.json');

function loadRecord() {
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

function validate(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('record must be an object');
  }
  // provenance: profile OR browser (headless run)
  if (record.profile == null && record.browser == null) {
    throw new Error('missing profile/browser provenance');
  }
  if (record.instance == null) throw new Error('missing instance');
  if (typeof record.capturedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(record.capturedAt)) {
    throw new Error('missing/invalid capturedAt');
  }
  if (record.browserBuild == null) throw new Error('missing browser build string');
  if (record.build == null) throw new Error('missing browser build string');
  if (record.url == null) throw new Error('missing page URL');
  if (record.pageUrl == null) throw new Error('missing page URL');
  if (typeof record.emitted !== 'boolean') throw new Error('missing emitted boolean');

  if (!Array.isArray(record.messages)) throw new Error('missing messages array');
  for (const m of record.messages) {
    if (m === null || typeof m !== 'object') throw new Error('invalid message');
    if (typeof m.type !== 'string') throw new Error('message missing type');
    if (typeof m.text !== 'string') throw new Error('message missing text');
    if (m.code !== null && typeof m.code !== 'string') throw new Error('invalid code');
    if (m.code !== null && !m.text.includes(m.code)) {
      throw new Error(`invented code: ${m.code} not present in message text`);
    }
  }

  const emittedFromMessages = record.messages.some((m) => m.code !== null);
  if (record.emitted !== emittedFromMessages) {
    throw new Error('emitted disagrees with message list');
  }
  return true;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test('capture record validates', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => validate(record));
});

test('held-out E1: missing provenance field reddens', () => {
  const base = loadRecord();
  const fields = ['browser', 'instance', 'capturedAt', 'browserBuild', 'url', 'emitted', 'messages'];
  // profile is null in headless record; removing browser removes the only profile-or-browser value
  for (const field of fields) {
    const mutant = clone(base);
    delete mutant[field];
    // also remove alias to force failure
    if (field === 'browserBuild') delete mutant.build;
    if (field === 'url') delete mutant.pageUrl;
    assert.throws(() => validate(mutant), new RegExp(field === 'browserBuild' ? 'browser build' : field, 'i'), `removing ${field} must fail`);
  }
  // removing profile alone is allowed only if browser remains; removing both reddens
  const both = clone(base);
  delete both.profile;
  delete both.browser;
  assert.throws(() => validate(both), /profile\/browser/);
});

test('held-out E2: invented code reddens', () => {
  const mutant = clone(loadRecord());
  // find a message with code null to inject invented code, or overwrite existing
  if (mutant.messages.length > 0) {
    mutant.messages[0].code = 'NG9999';
  }
  assert.throws(() => validate(mutant), /invented code/);
});

test('held-out E4: emitted disagreeing with message list reddens', () => {
  const mutant = clone(loadRecord());
  mutant.emitted = !mutant.emitted;
  assert.throws(() => validate(mutant), /disagrees/);
});

test('recorded message code appears in its text', () => {
  const record = loadRecord();
  for (const m of record.messages) {
    if (m.code !== null) {
      assert.ok(m.text.includes(m.code));
    }
  }
});

test('verbatim capture includes the Angular diagnostic', () => {
  const record = loadRecord();
  const ngMsg = record.messages.find((m) => m.code === 'NG02952');
  assert.ok(ngMsg, 'expected an NG02952 message');
  assert.match(ngMsg.text, /NgOptimizedImage/);
});

test('negative-result agreement: emitted true because an NG message exists', () => {
  const record = loadRecord();
  assert.equal(record.emitted, true);
  assert.ok(record.messages.some((m) => m.code !== null));
});
