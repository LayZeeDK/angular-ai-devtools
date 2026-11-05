// Held-out proof for SC1 / E3 (HAR-2): a predicate that matches nothing must report a named no-match
// rather than pass an empty result through.
//
// The harness itself does not exist yet (the A8 ruling defers it), so the suite supplies the subject it
// can actually fail for: it parses the probe's own template into a jsdom item set, evaluates the planned
// harness match semantics over those items (an item matches when it carries every attribute of the
// predicate, with that value), and asserts what the evaluator reports for a predicate that matches and
// for a predicate that matches nothing.
//
// The failure it can no longer hide: a match result that returns an empty match list and no named
// no-match. That mutant is recorded in the task Log together with the exact text this suite produced
// while it was applied.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const probePath = join(
  root,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'components',
  'harness-probe.ts',
);
const SUITE = 'fixture-harness-predicate.test.mjs';
const SUBJECT = '<app-harness-probe>';

/** The template literal the probe component declares, read out of its own source. */
function readTemplate(source) {
  const match = /template:\s*`([\s\S]*?)`/.exec(source);
  assert.ok(
    match,
    `${SUITE}: ${probePath} declares no template literal, so there is no predicate subject to parse`,
  );
  return match[1];
}

/**
 * The item set the predicate runs over: every element the probe template renders with a `data-kind`
 * attribute, as the page would render it — tag, text and attributes read back out of a DOM.
 */
function readProbeItems() {
  const template = readTemplate(readFileSync(probePath, 'utf8'));
  const dom = new JSDOM(`<!doctype html><html><body>${template}</body></html>`);
  const items = [...dom.window.document.querySelectorAll('[data-kind]')].map(
    (element) => ({
      tag: element.tagName.toLowerCase(),
      text: element.textContent.trim(),
      attributes: Object.fromEntries(
        [...element.attributes].map((attribute) => [
          attribute.name,
          attribute.value,
        ]),
      ),
    }),
  );
  assert.ok(
    items.length > 0,
    `${SUITE}: the probe template renders no [data-kind] item, so the fixture supplies no predicate case (HAR-2)`,
  );
  return items;
}

/** Render a predicate the way a no-match report has to name it: `[data-kind="absent"]`. */
function describePredicate(predicate) {
  return Object.entries(predicate)
    .map(([name, value]) => `[${name}="${value}"]`)
    .join('');
}

/**
 * The planned harness match semantics: an item matches when it carries every attribute in the predicate,
 * with the same value. A predicate that matches nothing reports a named no-match; it never returns an
 * empty match list on its own.
 */
function matchItems(items, predicate) {
  const matched = items.filter((item) =>
    Object.entries(predicate).every(
      ([name, value]) => item.attributes[name] === value,
    ),
  );
  if (matched.length === 0) {
    return {
      matched,
      noMatch: `no element under ${SUBJECT} matches ${describePredicate(predicate)} (${items.length} items examined)`,
    };
  }
  return { matched, noMatch: null };
}

test('a predicate that matches nothing reports a named no-match rather than an empty pass', () => {
  const items = readProbeItems();
  const result = matchItems(items, { 'data-kind': 'absent' });

  assert.equal(
    result.matched.length,
    0,
    `${SUITE}: mutant (predicate ignores its selector) — [data-kind="absent"] must match no item, matched ${result.matched.length}`,
  );
  assert.equal(
    result.noMatch,
    `no element under ${SUBJECT} matches [data-kind="absent"] (3 items examined)`,
    `${SUITE}: mutant (silent empty pass) — a non-matching predicate must report a named no-match naming the selector and the items examined, got ${JSON.stringify(result.noMatch)}`,
  );
});

test('the same predicate against the target matches exactly the item the fixture renders', () => {
  const items = readProbeItems();
  const result = matchItems(items, { 'data-kind': 'alpha' });

  assert.equal(
    result.noMatch,
    null,
    `${SUITE}: mutant (silent empty pass) — a predicate that matches must not report a no-match, got ${JSON.stringify(result.noMatch)}`,
  );
  assert.deepEqual(
    result.matched.map((item) => `${item.tag}:${item.text}`),
    ['li:alpha item'],
    `${SUITE}: mutant (silent empty pass) — [data-kind="alpha"] must match the rendered alpha item "li:alpha item", matched ${JSON.stringify(result.matched.map((item) => `${item.tag}:${item.text}`))}`,
  );
});

test('the no-match report is derived from the predicate, not special-cased for one selector', () => {
  const items = readProbeItems();
  const result = matchItems(items, {
    'data-kind': 'alpha',
    'data-slot': 'absent',
  });

  assert.equal(
    result.matched.length,
    0,
    `${SUITE}: mutant (predicate ignores attributes other than data-kind) — [data-kind="alpha"][data-slot="absent"] must match no item, matched ${result.matched.length}`,
  );
  assert.equal(
    result.noMatch,
    `no element under ${SUBJECT} matches [data-kind="alpha"][data-slot="absent"] (3 items examined)`,
    `${SUITE}: mutant (silent empty pass, or a hard-coded no-match) — the report must name every attribute of the predicate that matched nothing, got ${JSON.stringify(result.noMatch)}`,
  );
});
