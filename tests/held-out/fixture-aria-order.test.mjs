// Held-out proof for SC2 / E5: the fixture's listbox and menu options must render in the pinned DOM
// order, and the order this suite reads must come from the surface template's own iteration.
//
// What was wrong before (wave-3 review, T010): the "rendered" DOM was built from the same declared array
// the assertion then compared it to, so the real rendered order was never observed — reversing the
// fixture's `@for` iteration in `aria-surfaces.ts` left the suite green.
//
// What this suite does instead: it expands the `@for` control-flow blocks out of the surface template
// against the scope the component actually binds (`listboxItems` and `menuItems` from `aria-items.ts`,
// plus the class's own field initialisers), mounts the expanded template in jsdom through
// `renderSurface` from `./aria-rules.mjs`, and reads each option's text back out of the DOM in document
// order. The expected sequences below are literals in this file: nothing here derives the expectation
// from the fixture it is checking.
//
// The rule-side half of E5 — `listbox-option-order` in `./aria-rules.mjs`, whose verdict depends on this
// same rendered order — is exercised by `fixture-aria-rule-mutation.test.mjs`.
//
// Mutants this suite must redden for, both applied to `spikes/ng222-app/src/app/components/aria-surfaces.ts`
// and recorded with their exact failure text in the task Log:
//   - `@for (item of [...listboxItems].reverse(); track item)` — the listbox's real rendered iteration reversed
//   - `@for (item of [...menuItems].reverse(); track item)`   — the menu's real rendered iteration reversed
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readScope, readTemplate, renderSurface, reverseIteration } from './aria-rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const itemsPath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-items.ts');
const surfacePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'aria-surfaces.ts');

const SUITE = 'fixture-aria-order.test.mjs';
const ITEMS_FILE = 'spikes/ng222-app/src/app/components/aria-items.ts';
const SURFACE_FILE = 'spikes/ng222-app/src/app/components/aria-surfaces.ts';

// The DOM-order contract, pinned as literals: no assertion below reads its expected value out of the
// fixture, so these stay independent of whatever the declared arrays happen to hold.
const LISTBOX_ORDER = ['Alpha', 'Beta', 'Gamma'];
const REVERSED_LISTBOX_ORDER = ['Gamma', 'Beta', 'Alpha'];
const MENU_ORDER = ['Open', 'Save', 'Close'];

// The exact source changes a reviewer applies to prove the order assertions bite.
const LISTBOX_MUTANT = '@for (item of [...listboxItems].reverse(); track item)';
const MENU_MUTANT = '@for (item of [...menuItems].reverse(); track item)';

/** The option labels the rendered surface shows, in DOM order. */
function renderedOrder(elements, selector) {
  const options = elements.filter((element) => element.matches(selector));
  assert.ok(
    options.length > 0,
    `${SUITE}: ${SURFACE_FILE} renders no element matching "${selector}", so there is no rendered order to compare against the contract`,
  );
  return options.map((option) => option.textContent.trim());
}

/** The surface template text and the scope it binds, both read out of the fixture. */
function renderFixtureSurface() {
  const surfaceSrc = readFileSync(surfacePath, 'utf8');
  return {
    template: readTemplate(surfaceSrc, SURFACE_FILE),
    scope: readScope({
      itemsSrc: readFileSync(itemsPath, 'utf8'),
      surfaceSrc,
      itemsFile: ITEMS_FILE,
      surfaceFile: SURFACE_FILE,
    }),
  };
}

test('listbox options render in the pinned DOM order', () => {
  const { template, scope } = renderFixtureSurface();
  const rendered = renderedOrder(renderSurface(template, scope), '#components-listbox li');

  assert.deepEqual(
    rendered,
    LISTBOX_ORDER,
    `${SUITE}: mutant (${LISTBOX_MUTANT} in ${SURFACE_FILE}) — the listbox rendered its options in DOM order ` +
      `${JSON.stringify(rendered)}, not the contract order ${JSON.stringify(LISTBOX_ORDER)}`,
  );
});

test('menu items render in the pinned DOM order', () => {
  const { template, scope } = renderFixtureSurface();
  const rendered = renderedOrder(renderSurface(template, scope), '#components-menu > div');

  assert.deepEqual(
    rendered,
    MENU_ORDER,
    `${SUITE}: mutant (${MENU_MUTANT} in ${SURFACE_FILE}) — the menu rendered its items in DOM order ` +
      `${JSON.stringify(rendered)}, not the contract order ${JSON.stringify(MENU_ORDER)}`,
  );
});

test('the rendered order tracks the template @for expression, not the declared array', () => {
  const { template, scope } = renderFixtureSurface();
  const before = renderedOrder(renderSurface(template, scope), '#components-listbox li');

  const marker = template.indexOf('id="components-listbox"');
  assert.notEqual(
    marker,
    -1,
    `${SUITE}: ${SURFACE_FILE} no longer marks its listbox with id="components-listbox", so the rendered option order cannot be located`,
  );
  const at = template.indexOf('@for (', marker);
  assert.notEqual(
    at,
    -1,
    `${SUITE}: the listbox in ${SURFACE_FILE} iterates nothing, so the options it shows cannot be observed`,
  );

  // Apply the review mutant in memory to the real template text: wrap the listbox's iterated expression
  // in a reverse. If the order this suite reads came from the declared array, this would change nothing.
  const { expression, reversedExpression, template: mutatedTemplate } = reverseIteration(template, at);
  const after = renderedOrder(renderSurface(mutatedTemplate, scope), '#components-listbox li');

  assert.deepEqual(
    after,
    REVERSED_LISTBOX_ORDER,
    `${SUITE}: mutant (the listbox's @for expression "${expression}" wrapped as "${reversedExpression}" — ${LISTBOX_MUTANT}) — ` +
      `the fixture rendered ${JSON.stringify(before)} before the mutant and ${JSON.stringify(after)} after it, but the reversed ` +
      `contract order in ${SURFACE_FILE} is ${JSON.stringify(REVERSED_LISTBOX_ORDER)}; if this suite read the declared array in ` +
      `${ITEMS_FILE} instead of the render, the mutant would change nothing`,
  );
});
